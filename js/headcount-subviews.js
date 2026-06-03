// Headcount subviews extracted from the main HTML.

function renderSubActives() {
                try {
                const emps = applyDeepFilters(app.employees);
                if (emps.length === 0) {
                    ['subActRadar', 'subActTenure', 'subActPyramid', 'subActDepto', 'subActTrend', 'chartAcumuladoYoY', 'chartClassic14areas'].forEach(id => showNoData(id));
                    return;
                }
                ['subActRadar', 'subActTenure', 'subActPyramid', 'subActDepto', 'subActTrend', 'chartAcumuladoYoY', 'chartClassic14areas'].forEach(id => hideNoData(id));

                    const filters = getFilters();
                    const { y, m } = filters;
                    const allBajas = app.bajas_list || [];
                    const hiresSet = new Set();
                    emps.forEach(item => {
                        if (!item.fi) return;
                        const fparts = item.fi.split('/');
                        if (fparts.length < 3) return;
                        const fy = parseInt(fparts[2]);
                        const fm = parseInt(fparts[1]);
                        if ((y === 'ALL' || fy == parseInt(y)) && (m === 'ALL' || fm == parseInt(m))) {
                            hiresSet.add(item.c || item.n);
                        }
                    });

                    const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                    const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                    const activeEmpsForTenure = emps.filter(e => {
                        const code = e.c || e.n;
                        const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                        return !isBaja;
                    });
                    const tenures = activeEmpsForTenure.map(e => ({ ...e, tenure: e.t || calcTenure(e.fi) }));
                    const filteredBajas = applyDeepFilters(allBajas);
                    if ((document.getElementById('chartAcumuladoYoY') || document.getElementById('chartClassic14areas')) && typeof renderExecutiveCharts === 'function') {
                        renderExecutiveCharts(tenures, y, m, hiresSet, emps, app.employees || [], emps.length, filteredBajas.length, filteredBajas);
                    }

                    // --- RENDER MINI DONUTS GRID (PREVIOUS VERSION REBORN) ---
                    const dim = window._distPropDim || 'e';
                    const dataMap = {};
                    emps.forEach(e => {
                        let key = '';
                        if (dim === 'pa') key = normalizePa(e.pa);
                        else if (dim === 'e') key = e.e || 'N/A';
                        else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                        else if (dim === 'd') key = e.d || e.depto || 'N/A';
                        if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                    });
                    const gridContainer = document.getElementById('subActMiniDonutsGrid');
                    if (gridContainer) {
                        const totalAll = Object.values(dataMap).reduce((a, b) => a + b, 0) || 1;
                        const sortedEntries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);
                        const getMiniDonut = (pct, color) => {
                            const r = 20; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ;
                            return `<div style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                <svg width="64" height="64" viewBox="0 0 52 52" style="transform: rotate(-90deg)">
                                    <circle cx="26" cy="26" r="${r}" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="4" />
                                    <circle cx="26" cy="26" r="${r}" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" />
                                </svg>
                                <span style="position:absolute; font-size:12px; font-weight:1000; color:#1e293b;">${Math.round(pct)}%</span>
                            </div>`;
                        };
                        gridContainer.innerHTML = sortedEntries.map(([k, val], idx) => {
                            const pct = (val / totalAll * 100).toFixed(1);
                            const st = (dim === 'pa') ? getStyle(k) : { color: '#8b5cf6' };
                            const fullName = (dim === 'pa') ? (paisMap[k] || k).toUpperCase() : k.toUpperCase();
                            return `<div class="dist-row-premium" style="display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.6); backdrop-filter:blur(10px); padding:11px 16px; border-radius:18px; border:1px solid rgba(255,255,255,0.8); box-shadow:0 4px 15px rgba(0,0,0,0.03); transition:all 0.3s ease;">
                                ${getMiniDonut(pct, st.color)}
                                <div style="flex:1; min-width:0;">
                                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                                        <span style="font-size:12px; font-weight:1000; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fullName}</span>
                                    </div>
                                    <div style="width:100%; height:9px; background:rgba(0,0,0,0.04); border-radius:10px; overflow:hidden; position:relative;">
                                        <div style="height:100%; width:${(val / sortedEntries[0][1] * 100)}%; background:${st.color}; border-radius:10px;"></div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; margin-top:5px;">
                                        <span style="font-size:12px; font-weight:1000; color:${st.color};">${val.toLocaleString()}</span>
                                        <span style="font-size:9px; font-weight:800; color:#94a3b8;">COLABORADORES</span>
                                    </div>
                                </div>
                            </div>`;
                        }).join('');
                    }

                    const areas = {}; 
                    emps.forEach(emp => { 
                        const d = emp.dir || emp.area || emp.DIRECCION || 'Sin area';
                        areas[d] = (areas[d] || 0) + 1; 
                    });
                    const sareas = Object.keys(areas).sort((a,b) => areas[b] - areas[a]).slice(0, 10);
                    const radarLabels = sareas.map(a => [a.substring(0, 16), `${areas[a]}`]);
                    const radarValues = sareas.map(a => areas[a]);
                    window.activeCharts.push(new Chart(document.getElementById('subActRadar').getContext('2d'), {
                        type: 'radar', 
                        data: { labels: radarLabels, datasets: [{
                            data: radarValues,
                            backgroundColor: 'rgba(139, 92, 246, 0.4)',
                            borderColor: '#8b5cf6',
                            borderWidth: 2,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#8b5cf6'
                        }]
                    },
                    options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));


                    const tMap = { 'Nuevo (<1 año)': 0, 'Junior (1-3 años)': 0, 'Mid (3-5 años)': 0, 'Senior (5+ años)': 0 };
                    emps.forEach(e => { if (e.fi) tMap[classifyRango(calcTenure(e.fi))]++; });
                    window.activeCharts.push(new Chart(document.getElementById('subActTenure').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: Object.keys(tMap), datasets: [{ label: 'Colaboradores', data: Object.values(tMap), backgroundColor: ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'], borderRadius: 8 }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
                    }));

                    const pira = { '0-1': 0, '1-2': 0, '2-3': 0, '3-5': 0, '5-10': 0, '10+': 0 };
                    emps.forEach(e => {
                        const t = calcTenure(e.fi);
                        if (t < 1) pira['0-1']++; else if (t < 2) pira['1-2']++; else if (t < 3) pira['2-3']++;
                        else if (t < 5) pira['3-5']++; else if (t < 10) pira['5-10']++; else pira['10+']++;
                    });
                    window.activeCharts.push(new Chart(document.getElementById('subActPyramid').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: Object.keys(pira), datasets: [{ label: 'Personal', data: Object.values(pira), backgroundColor: 'rgba(139, 92, 246, 0.6)', borderColor: '#8b5cf6', borderWidth: 1 }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));

                    const deptoMap = {};
                    emps.forEach(e => { 
                        const d = e.d || e.depto || e.DEPARTAMENTO || 'Sin depto';
                        deptoMap[d] = (deptoMap[d] || 0) + 1; 
                    });
                    const sDepto = Object.entries(deptoMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
                    window.activeCharts.push(new Chart(document.getElementById('subActDepto').getContext('2d'), {
                        type: 'bar',
                        data: { labels: sDepto.map(x => x[0]), datasets: [{ label: 'HC', data: sDepto.map(x => x[1]), backgroundColor: '#6366f1', borderRadius: 5 }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                    }));

                    const histData = Array(12).fill(0);
                    app.employees.forEach(e => {
                        if (compareYear((e.y || e.yr), y)) {
                            const mVal = e.m || e.mo;
                            if (mVal >= 1 && mVal <= 12) histData[mVal-1]++;
                        }
                    });
                    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    window.activeCharts.push(new Chart(document.getElementById('subActTrend').getContext('2d'), {
                        type: 'line', 
                        data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Evolución HC', data: histData, borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));

                    // --- NEW: INTEGRATED CLASSIC ANALYSIS FOR HC REAL ---
                    const ctxTrendReal2 = document.getElementById('chartHCTrendReal2');
                    if (ctxTrendReal2) {
                        const vLen2 = window._hcViewLengthReal2 || 6;
                        const dLabels2 = [], dData2 = [], dDiff2 = [];
                        const { y: targetY, m: targetM } = getFilters();
                        const tyNums = parseInt(targetY) || 2026;
                        const tmnums = parseInt(targetM) || 3;

                        const f = getFilters();
                        for (let i = 0; i < vLen2; i++) {
                            let cY = tyNums, cM = tmnums - (vLen2 - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            dLabels2.push(monthNames[cM] + (cY !== tyNums ? " '" + String(cY).slice(-2) : ''));
                            
                            const s = new Set();
                            app.employees.forEach(e => {
                                const itemPa = normalizePa(e.pa);
                                const matchPa = (f.countries.length === 0 || f.countries.includes(itemPa));
                                const matchEmp = (f.e === 'ALL' || (e.e || "").trim().toUpperCase() === f.e.trim().toUpperCase());
                                const matcharea = (f.a === 'ALL' || (e.dir || e.area || "").trim().toUpperCase() === f.a.trim().toUpperCase());
                                const matchDepto = (f.d === 'ALL' || (e.d || e.depto || "").trim().toUpperCase() === f.d.trim().toUpperCase());
                                
                                if (matchPa && matchEmp && matcharea && matchDepto && (e.y || e.yr) == cY && (e.m || e.mo) == cM) {
                                    s.add(e.c || e.n);
                                }
                            });
                            dData2.push(s.size);
                        }
                        for (let i = 0; i < dData2.length; i++) { dDiff2.push(i > 0 ? dData2[i] - dData2[i-1] : 0); }

                        window.activeCharts.push(new Chart(ctxTrendReal2.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: dLabels2,
                                datasets: [{
                                    label: 'HC',
                                    data: dData2,
                                    borderColor: '#6366f1',
                                    borderWidth: 3,
                                    backgroundColor: 'rgba(99,102,241,0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4
                                }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const diff = dDiff2[ctx.dataIndex];
                                                const arrow = diff > 0 ? ' ' : diff < 0 ? ' ' : '   ';
                                                return ` HC: ${ctx.parsed.y} (${arrow} ${diff})`;
                                            }
                                        }
                                    }
                                }
                            }
                        }));
                    }

                    const ctxarea2 = document.getElementById('chartareaReal2');
                    if (ctxarea2) {
                        const deptCounts = {};
                        emps.forEach(e => { if (e.d) deptCounts[e.d] = (deptCounts[e.d] || 0) + 1; });
                        const top8 = Object.entries(deptCounts).sort((a,b) => b[1]-a[1]).slice(0, 8);
                        window.activeCharts.push(new Chart(ctxarea2.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: top8.map(d => d[0]),
                                datasets: [{ data: top8.map(d => d[1]), backgroundColor: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b'] }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, cutout: '65%' }
                        }));
                    }
                    // --- END INTEGRATED CLASSIC ANALYSIS ---
                } catch(e) { console.error("Error in renderSubActives:", e); }
            }

            function renderSubHires() {
                try {
                const hires = applyDeepFilters(app.employees);
                if (hires.length === 0) {
                    ['subHiresTrend', 'subHiresRadar', 'subHiresDir', 'subHiresDepto', 'subHiresEmp', 'subHiresYTD'].forEach(id => showNoData(id));
                    return;
                }
                ['subHiresTrend', 'subHiresRadar', 'subHiresDir', 'subHiresDepto', 'subHiresEmp', 'subHiresYTD'].forEach(id => hideNoData(id));
                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const trend = Array(12).fill(0); 
                hires.forEach(h => { const mv = h.m || h.mo; if (mv >= 1 && mv <= 12) trend[mv - 1]++; });
                window.activeCharts.push(new Chart(document.getElementById('subHiresTrend').getContext('2d'), {
                    type: 'line', 
                    data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Altas', data: trend, borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const radarCtx = document.getElementById('subHiresRadar');
                if (radarCtx) {
                    const dirCounts = {};
                    hires.forEach(h => { if (h.dir) dirCounts[h.dir] = (dirCounts[h.dir] || 0) + 1; });
                    const rLabels = Object.keys(dirCounts);
                    const radarLabels = rLabels.map(l => [l.substring(0, 16), `${dirCounts[l]}`]);
                    window.activeCharts.push(new Chart(radarCtx.getContext('2d'), {
                        type: 'radar',
                        data: {
                            labels: radarLabels,
                            datasets: [{
                                label: 'DISTRIBUCIÓN Altas',
                                data: Object.values(dirCounts),
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                borderColor: '#10b981',
                                pointBackgroundColor: '#10b981'
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    beginAtZero: true, 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));

                }

                const dirMap = {};
                hires.forEach(h => { if (h.dir) dirMap[h.dir] = (dirMap[h.dir] || 0) + 1; });
                const sDir = Object.entries(dirMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
                window.activeCharts.push(new Chart(document.getElementById('subHiresDir').getContext('2d'), {
                    type: 'bar',
                    data: { labels: sDir.map(x => x[0]), datasets: [{ label: 'Altas', data: sDir.map(x => x[1]), backgroundColor: '#3b82f6', borderRadius: 6 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const deptoMap = {};
                hires.forEach(h => { if (h.d) deptoMap[h.d] = (deptoMap[h.d] || 0) + 1; });
                const sDept = Object.entries(deptoMap).sort((a,b) => b[1]-a[1]).slice(0, 15);
                window.activeCharts.push(new Chart(document.getElementById('subHiresDepto').getContext('2d'), {
                    type: 'bar',
                    data: { labels: sDept.map(x => x[0].substring(0, 20)), datasets: [{ label: 'Altas', data: sDept.map(x => x[1]), backgroundColor: '#10b981', borderRadius: 8 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const empMap = {};
                hires.forEach(h => { if (h.e) empMap[h.e] = (empMap[h.e] || 0) + 1; });
                window.activeCharts.push(new Chart(document.getElementById('subHiresEmp').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: Object.keys(empMap), datasets: [{ data: Object.values(empMap), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
                }));

                let acc = 0;
                const accData = Array(12).fill(0);
                for(let i=0; i<12; i++) { acc += trend[i]; accData[i] = acc; }
                window.activeCharts.push(new Chart(document.getElementById('subHiresYTD').getContext('2d'), {
                    type: 'line', 
                    data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Acumulado YTD', data: accData, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubHires:", e); }
            }

            function renderSubBajas() {
                try {
                const context = applyDeepFilters(app.bajas_list);
                if (context.length === 0) {
                    ['subBajasTrend', 'subBajasRadar', 'subBajasDir', 'subBajasMotivos', 'subBajasYTD'].forEach(id => showNoData(id));
                    const dEl = document.getElementById('subBajasDepto'); if(dEl) showNoData('subBajasDepto');
                    return;
                }
                ['subBajasTrend', 'subBajasRadar', 'subBajasDir', 'subBajasMotivos', 'subBajasYTD'].forEach(id => hideNoData(id));
                const dEl2 = document.getElementById('subBajasDepto'); if(dEl2) hideNoData('subBajasDepto');

                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const trend = Array(12).fill(0);
                context.forEach(b => { 
                    const mv = parseInt(normalizeMonth(b.m || b.mo)); 
                    if(mv >= 1 && mv <= 12) trend[mv-1]++; 
                });
                window.activeCharts.push(new Chart(document.getElementById('subBajasTrend').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Bajas', data: trend, borderColor: '#ef4444', fill: true, backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const radarCtxB = document.getElementById('subBajasRadar');
                if (radarCtxB) {
                    const dirCounts = {};
                    context.forEach(b => { if (b.dir) dirCounts[b.dir] = (dirCounts[b.dir] || 0) + 1; });
                    const radarLabels = Object.keys(dirCounts).map(l => [l.substring(0, 16), `${dirCounts[l]}`]);
                    window.activeCharts.push(new Chart(radarCtxB.getContext('2d'), {
                        type: 'radar',
                        data: {
                            labels: radarLabels,
                            datasets: [{
                                label: 'DISTRIBUCIÓN Bajas',
                                data: Object.values(dirCounts),
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: '#ef4444',
                                pointBackgroundColor: '#ef4444'
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    beginAtZero: true, 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));

                }

                const dirMap = {};
                context.forEach(b => { if(b.dir) dirMap[b.dir] = (dirMap[b.dir]||0)+1; });
                const sDir = Object.entries(dirMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
                window.activeCharts.push(new Chart(document.getElementById('subBajasDir').getContext('2d'), {
                    type: 'bar', data: { labels: sDir.map(x=>x[0]), datasets: [{ label: 'Bajas', data: sDir.map(x=>x[1]), backgroundColor: '#ef4444' }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const deptoMap = {};
                context.forEach(b => { if(b.d) deptoMap[b.d] = (deptoMap[b.d]||0)+1; });
                const sDept = Object.entries(deptoMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
                const deptoCanvas = document.getElementById('subBajasDepto');
                if (deptoCanvas) {
                    window.activeCharts.push(new Chart(deptoCanvas.getContext('2d'), {
                        type: 'bar', data: { labels: sDept.map(x=>x[0]), datasets: [{ label: 'Bajas', data: sDept.map(x=>x[1]), backgroundColor: '#fca5a5' }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                    }));
                }

                const motMap = {};
                context.forEach(b => { const mStr = b.mc || 'S/M'; motMap[mStr] = (motMap[mStr]||0)+1; });
                const sMot = Object.entries(motMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
                window.activeCharts.push(new Chart(document.getElementById('subBajasMotivos').getContext('2d'), {
                    type: 'pie', data: { labels: sMot.map(x=>x[0]), datasets: [{ data: sMot.map(x=>x[1]), backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#4f46e5', '#3730a3'] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                let acc = 0;
                const accData = Array(12).fill(0);
                for(let i=0; i<12; i++) { acc += trend[i]; accData[i] = acc; }
                window.activeCharts.push(new Chart(document.getElementById('subBajasYTD').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Total Acumulado', data: accData, borderColor: '#dc2626', fill: false }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubBajas:", e); }
            }

            function renderSubTurnover() {
                try {
                const bajas = applyDeepFilters(app.bajas_list);
                if (bajas.length === 0) {
                    ['subRotType', 'subRotEarly', 'subRotPais', 'subRotTrend'].forEach(id => showNoData(id));
                    const tr = document.getElementById('subRotTreemap'); if(tr) tr.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#64748b;">No hay datos</div>';
                    return;
                }
                ['subRotType', 'subRotEarly', 'subRotPais', 'subRotTrend'].forEach(id => hideNoData(id));
                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const types = { 'Voluntaria': 0, 'Involuntaria': 0 };
                bajas.forEach(b => { if ((b.mc || '').toLowerCase().includes('renuncia')) types['Voluntaria']++; else types['Involuntaria']++; });
                window.activeCharts.push(new Chart(document.getElementById('subRotType').getContext('2d'), {
                    type: 'bar', data: { labels: ['VOLUNTARIA', 'INVOLUNTARIA'], datasets: [{ data: [types['Voluntaria'], types['Involuntaria']], backgroundColor: ['#10b981', '#ef4444'] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const treemapContainer = document.getElementById('subRotTreemap');
                if (treemapContainer) {
                    const reasonCounts = {};
                    bajas.forEach(b => {
                        const reason = b.mc || 'Sin motivo';
                        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                    });
                    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
                    const totalBajasTree = sortedReasons.reduce((a, b) => a + b[1], 0) || 1;
                    const treemapColors = {
                        'Renuncia': '#3b82f6', 'Renuncia Voluntaria': '#60a5fa',
                        'Despido con Responsabilidad Patronal': '#ef4444', 'Despido sin Responsabilidad Patronal': '#dc2626',
                        'Abandono de Labores': '#f59e0b', 'Sustitución Patronal': '#8b5cf6',
                        'Fallecimiento': '#64748b', 'Jubilaci ': '#10b981',
                        'Fin de Contrato': '#0ea5e9', 'Mutuo Acuerdo': '#a855f7'
                    };
                    const getReasonColor = (reason) => {
                        if (treemapColors[reason]) return treemapColors[reason];
                        const lower = reason.toLowerCase();
                        if (lower.includes('renuncia') || lower.includes('voluntaria')) return '#3b82f6';
                        if (lower.includes('despido') || lower.includes('involuntaria')) return '#ef4444';
                        return '#8b5cf6';
                    };
                    let treemapHTML = '<div style="display:flex;flex-wrap:wrap;gap:4px;width:100%;height:100%;align-content:flex-start;">';
                    sortedReasons.forEach(([reason, count]) => {
                        const pct = (count / totalBajasTree) * 100;
                        const minWidth = Math.max(80, pct * 4);
                        const height = Math.max(60, Math.min(120, pct * 3));
                        const color = getReasonColor(reason);
                        treemapHTML += `
                            <div style="flex:1 1 ${minWidth}px; min-width:${minWidth}px; height:${height}px; background:${color}; border-radius:12px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;"
                                 onmouseenter="this.style.transform='scale(1.03)';" onmouseleave="this.style.transform='scale(1)';">
                                <span style="font-size:8px; font-weight:900; color:#fff; text-transform:uppercase;">${reason.length > 30 ? reason.substring(0, 30) + ' ' : reason}</span>
                                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                                    <span style="font-size:22px; font-weight:1000; color:#fff;">${count}</span>
                                    <span style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.8);">${pct.toFixed(1)}%</span>
                                </div>
                            </div>`;
                    });
                    treemapHTML += '</div>';
                    treemapContainer.innerHTML = treemapHTML;
                }

                let early = 0, late = 0;
                bajas.forEach(b => { if (parseFloat(b.t) < 0.25) early++; else late++; });
                window.activeCharts.push(new Chart(document.getElementById('subRotEarly').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: ['< 90 D ', '> 90 D '], datasets: [{ data: [early, late], backgroundColor: ['#ef4444', '#3b82f6'] }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
                }));

                const pRot = {};
                bajas.forEach(b => { const pa = normalizePa(b.pa); pRot[pa] = (pRot[pa] || 0) + 1; });
                window.activeCharts.push(new Chart(document.getElementById('subRotPais').getContext('2d'), {
                    type: 'bar',
                    data: { labels: Object.keys(pRot).map(k => paisMap[k] || k), datasets: [{ label: 'Bajas', data: Object.values(pRot), backgroundColor: '#8b5cf6' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const { y } = getFilters();
                const trendR = Array(12).fill(0);
                bajas.forEach(b => { if(compareYear(b.y, y)) { const m = b.m||b.mo; if(m>=1 && m<=12) trendR[m-1]++; } });
                window.activeCharts.push(new Chart(document.getElementById('subRotTrend').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Bajas Mensuales', data: trendR, borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139,92,246,0.1)' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubTurnover:", e); }
            }

            function renderSubGrowth() {
                try {
                    const emps = applyDeepFilters(app.employees);
                    const bajas = applyDeepFilters(app.bajas_list);
                    const mH = Array(12).fill(0), mB = Array(12).fill(0);
                    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                    emps.forEach(h => { const mv = h.m || h.mo; if (mv >= 1 && mv <= 12) mH[mv - 1]++; });
                    bajas.forEach(b => { const mv = b.m || b.mo; if (mv >= 1 && mv <= 12) mB[mv - 1]++; });
                    window.activeCharts.push(new Chart(document.getElementById('subGrowthTrend').getContext('2d'), {
                        type: 'bar', data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Altas', data: mH, backgroundColor: '#10b981' }, { label: 'Bajas', data: mB.map(x => -x), backgroundColor: '#ef4444' }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));
                } catch(e) { console.error("Error in renderSubGrowth:", e); }
            }

            function renderSubCountries() {
                try {
                    const { y, m } = getFilters();
                    const rawEmps = applyDeepFilters(app.employees);
                    const bajasRaw = applyDeepFilters(app.bajas_list);
                    
                    // Deduplicate emps: Keep only the latest record per person in the current filtered set
                    const empsMap = new Map();
                    rawEmps.forEach(x => {
                        const personKey = (x.c || x.n || '').toString().trim();
                        if (!personKey) return;
                        const existing = empsMap.get(personKey);
                        const currM = parseInt(x.m) || 0;
                        const existM = existing ? (parseInt(existing.m) || 0) : -1;
                        if (!existing || currM > existM) {
                            empsMap.set(personKey, x);
                        }
                    });
                    const emps = Array.from(empsMap.values());

                    if (emps.length === 0) {
                        ['subCountryBar', 'subCountryRadar', 'subCountryPie', 'subCountryGrowth'].forEach(id => showNoData(id));
                        const grid = document.getElementById('subCountryGrid');
                        if (grid) grid.innerHTML = '<div style="grid-column:1/-1; padding:40px; text-align:center; color:#64748b; font-weight:800;">No se encontraron colaboradores para los criterios seleccionados.</div>';
                        return;
                    }

                    ['subCountryBar', 'subCountryRadar', 'subCountryPie', 'subCountryGrowth'].forEach(id => hideNoData(id));

                    // 1. Data Aggregation
                    const counts = {};
                    const prevCounts = {};
                    const bajasCounts = {};

                    // Current Period Counts
                    emps.forEach(x => { 
                        const p = normalizePa(x.pa); 
                        counts[p] = (counts[p] || 0) + 1; 
                    });

                    // Bajas Counts
                    bajasRaw.forEach(b => {
                        const p = normalizePa(b.pa);
                        bajasCounts[p] = (bajasCounts[p] || 0) + 1;
                    });

                    // Previous Period Counts (for Growth & Deltas)
                    if (y !== 'ALL') {
                        let py, pm;
                        if (m !== 'ALL') {
                            py = (m == 1) ? parseInt(y) - 1 : parseInt(y);
                            pm = (m == 1) ? 12 : parseInt(m) - 1;
                        } else {
                            py = parseInt(y) - 1;
                            pm = 'ALL'; 
                        }
                        
                        const rawPrev = applyDeepFilters(app.employees, { y: py, m: pm });
                        const prevMap = new Map();
                        rawPrev.forEach(x => {
                            const personKey = (x.c || x.n || '').toString().trim();
                            if (!personKey) return;
                            const existing = prevMap.get(personKey);
                            const currM = parseInt(x.m) || 0;
                            const existM = existing ? (parseInt(existing.m) || 0) : -1;
                            if (!existing || currM > existM) {
                                prevMap.set(personKey, x);
                            }
                        });
                        
                        prevMap.forEach(e => {
                            const p = normalizePa(e.pa);
                            prevCounts[p] = (prevCounts[p] || 0) + 1;
                        });
                    }

                    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
                    const data = labels.map(l => counts[l]);
                    const colors = labels.map(l => (countryStyles[l] || countryStyles['OTHER']).color);

                    // 2. Render Charts
                    // Bar Chart
                    window.activeCharts.push(new Chart(document.getElementById('subCountryBar').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: labels.map(l => paisMap[l] || l), datasets: [{ label: 'Personal', data: data, backgroundColor: colors, borderRadius: 8 }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    }));

                    // Pie Chart
                    window.activeCharts.push(new Chart(document.getElementById('subCountryPie').getContext('2d'), {
                        type: 'doughnut', 
                        data: { labels: labels.map(l => paisMap[l] || l), datasets: [{ data: data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
                        options: { 
                            responsive: true, maintainAspectRatio: false, cutout: '70%',
                            plugins: { legend: { position: 'right', labels: { font: { family: 'Montserrat', weight: 800 }, color: '#64748b' } } }
                        }
                    }));

                    // Radar Chart
                    const radarLabels = labels.map((l, i) => [paisMap[l] || l, `${data[i]}`]);
                    window.activeCharts.push(new Chart(document.getElementById('subCountryRadar').getContext('2d'), {
                        type: 'radar', 
                        data: { 
                            labels: radarLabels, 
                            datasets: [{ label: 'Presencia', data: data, backgroundColor: 'rgba(99,102,241,0.1)', borderColor: '#8b5cf6', borderWidth: 2, pointBackgroundColor: '#8b5cf6' }] 
                        },
                        options: { 
                            responsive: true, maintainAspectRatio: false, 
                            scales: { r: { ticks: { display: false }, pointLabels: { font: { size: 11, weight: 1000, family: 'Montserrat' }, color: '#8b5cf6' } } } 
                        }
                    }));

                    // Growth Chart
                    const growthData = labels.map(l => {
                        const curr = counts[l] || 0;
                        const prev = prevCounts[l] || 0;
                        return prev === 0 ? 0 : ((curr - prev) / prev) * 100;
                    });
                    window.activeCharts.push(new Chart(document.getElementById('subCountryGrowth').getContext('2d'), {
                        type: 'bar', 
                        data: { 
                            labels: labels.map(l => paisMap[l] || l), 
                            datasets: [{ 
                                label: 'Crecimiento %', 
                                data: growthData, 
                                backgroundColor: growthData.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                                borderRadius: 5
                            }] 
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    }));

                    // 3. Populate Country Grid
                    const grid = document.getElementById('subCountryGrid');
                    if (grid) {
                        grid.innerHTML = labels.map(code => {
                            const name = paisMap[code] || code;
                            const style = countryStyles[code] || countryStyles['OTHER'];
                            const hc = counts[code] || 0;
                            const prevHc = prevCounts[code] || 0;
                            const diff = hc - prevHc;
                            const pct = prevHc === 0 ? 0 : (diff / prevHc) * 100;
                            const bajas = bajasCounts[code] || 0;
                            const turnover = hc === 0 ? 0 : (bajas / hc) * 100;

                            const arrow = diff > 0 ? 'â–²' : (diff < 0 ? 'â–¼' : 'â†’');
                            const diffColor = diff > 0 ? '#10b981' : (diff < 0 ? '#ef4444' : '#94a3b8');

                            return `
                                <div class="country-card" style="background:white; border-radius:18px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 10px 25px -10px rgba(0,0,0,0.05); transition:0.3s; position:relative; overflow:hidden;"
                                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 30px -10px rgba(0,0,0,0.08)';"
                                     onmouseout="this.style.transform='none'; this.style.boxShadow='0 10px 25px -10px rgba(0,0,0,0.05)';">
                                    
                                    <div style="position:absolute; top:-20px; right:-20px; width:80px; height:80px; background:${style.color}08; border-radius:50%;"></div>
                                    
                                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                                        <div style="width:44px; height:32px; border-radius:6px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                                            <img src="${style.fUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://flagcdn.com/w80/un.png'">
                                        </div>
                                        <div>
                                            <h4 style="margin:0; font-size:15px; font-weight:900; color:#1e293b; text-transform:uppercase;">${name}</h4>
                                            <span style="font-size:9px; font-weight:800; color:#94a3b8; letter-spacing:1px;">ID: ${code}</span>
                                        </div>
                                    </div>

                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                                        <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                                            <span style="display:block; font-size:8px; font-weight:1000; color:#94a3b8; margin-bottom:5px;">HEADCOUNT</span>
                                            <div style="display:flex; align-items:baseline; gap:5px;">
                                                <span style="font-size:20px; font-weight:1000; color:#1e293b;">${hc}</span>
                                                <span style="font-size:10px; font-weight:900; color:${diffColor};">${arrow} ${Math.abs(diff)}</span>
                                            </div>
                                        </div>
                                        <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                                            <span style="display:block; font-size:8px; font-weight:1000; color:#94a3b8; margin-bottom:5px;">BAJAS</span>
                                            <div style="display:flex; align-items:baseline; gap:5px;">
                                                <span style="font-size:20px; font-weight:1000; color:#ef4444;">${bajas}</span>
                                                <span style="font-size:9px; font-weight:800; color:#64748b;">TOTAL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                                        <div>
                                            <span style="display:block; font-size:8px; font-weight:900; color:#64748b;">CRECIMIENTO</span>
                                            <span style="font-size:11px; font-weight:1000; color:${diffColor};">${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%</span>
                                        </div>
                                        <div style="text-align:right;">
                                            <span style="display:block; font-size:8px; font-weight:900; color:#64748b;">Rotación</span>
                                            <span style="font-size:11px; font-weight:1000; color:#1e293b;">${turnover.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    }

                } catch(e) { 
                    console.error("Error in renderSubCountries:", e); 
                }
            }

