// Advanced Headcount helpers extracted from the main HTML.

function renderHCRegistry(emps) {
                const tbody = document.getElementById('tbodyHCReg');
                if (!tbody) return;

                const data = emps.slice(0, 300);

                tbody.innerHTML = data.map(e => {
                    const puesto = (e.p && e.p !== 'N/A' && e.p !== 'nan') ? e.p : 'Sin Asignar';
                    const area = (e.d && e.d !== 'N/A' && e.d !== 'nan' && e.d !== 'SIN DEPTO') ? e.d : ' ';
                    const flag = getStyle(e.pa).flag;
                    return `
                        <tr style="color:#000;">
                    <td style="font-weight:700; color:#64748b; white-space:nowrap;">${e.c || 'N/A'}</td>
                    <td><div style="font-weight:700; color:#0f172a;">${e.n}</div></td>
                    <td style="font-weight:600;">${puesto}</td>
                    <td style="font-weight:500; color:#64748b;">${area}</td>
                    <td style="white-space:nowrap; color:#0f172a; font-weight:600;">${e.fi || ' '}</td>
                    <td style="font-weight:800; color:var(--ac);">${flag} ${paisMap[e.pa] || e.pa}</td>
                    <td style="color:#64748b;">${e.e}</td>
                </tr> `;
                }).join('');
            }

            let currentRegistryTab = 'altas';
            function switchRegistry(el, tab) {
                currentRegistryTab = tab;
                if (el && el.parentNode) {
                    el.parentNode.querySelectorAll('.toggle-tab').forEach(t => t.classList.remove('active'));
                    el.classList.add('active');
                }
                const titleEl = document.getElementById('registryTitle');
                if (titleEl) titleEl.innerText = tab === 'altas' ? 'Personal en el Periodo' : 'Registro de Salidas';

                renderAll();
            }

            function renderPlantilla(uniqueEmps, empsRaw) {
                const y = document.getElementById('yearSel').value;
                const m = document.getElementById('monthSel').value;
                const hiresSet = new Set();
                uniqueEmps.forEach(item => {
                    if (!item.fi) return;
                    const fparts = item.fi.split('/');
                    if (fparts.length < 3) return;
                    const fy = parseInt(fparts[2]);
                    const fm = parseInt(fparts[1]);
                    if ((y === 'ALL' || fy == parseInt(y)) && (m === 'ALL' || fm == parseInt(m))) {
                        hiresSet.add(item.c || item.n);
                    }
                });

                // For Tenure (Active only)
                const allBajas = app.bajas_list || [];
                const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                const tenures = uniqueEmps.filter(e => {
                    const code = e.c || e.n;
                    const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                    return !isBaja;
                }).map(e => ({ ...e, tenure: calcTenure(e.fi) }));

                // Render Classic sections now included in Plantilla
                renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw);

                const paisSel = document.getElementById('paisSel').value;
                const empSel = document.getElementById('empresaSel').value;
                const areaSel = document.getElementById('areaSel').value;
                const deptoSel = document.getElementById('deptoSel').value;
                const yrSel = document.getElementById('yearSel').value;
                const moSel = document.getElementById('monthSel').value;

                // Get filtered bajas for the same period
                const filteredBajas = allBajas.filter(b => {
                    const matchPais = paisSel === 'ALL' || b.pa === paisSel;
                    const matchEmp = empSel === 'ALL' || b.e === empSel;
                    const matcharea = areaSel === 'ALL' || b.dir === areaSel;
                    const matchDepto = deptoSel === 'ALL' || b.d === deptoSel;
                    let matchDate = true;
                    if (yrSel !== 'ALL' || moSel !== 'ALL') {
                        try {
                            const parts = b.f.split('/');
                            if (parts.length >= 3) {
                                const by = parseInt(parts[2]); const bm = parseInt(parts[1]);
                                if (yrSel !== 'ALL' && by != parseInt(yrSel)) matchDate = false;
                                if (moSel !== 'ALL' && bm != parseInt(moSel)) matchDate = false;
                            }
                        } catch (ex) { }
                    }
                    return matchPais && matchEmp && matcharea && matchDepto && matchDate;
                });

                const totalHC = uniqueEmps.length;
                const totalBajas = filteredBajas.length;
                const totalHires = hiresSet.size;
                const rotationRate = totalHC > 0 ? ((totalBajas / totalHC) * 100).toFixed(1) : 0;
                const retentionRate = (100 - rotationRate).toFixed(1);
                const activeCountriesCount = new Set(uniqueEmps.map(e => e.pa)).size;

                document.getElementById('kpi1').innerHTML = `
                ${kpiCard("HEADCOUNT HC", totalHC.toLocaleString(), " ", "#8b5cf6", "Actual en periodo", "up", "", null, "", "", null, "15px")}
                ${kpiCard("Movimientos: Altas vs Bajas", `${totalHires} / ${totalBajas}`, " ", "#10b981", "Altas: " + totalHires + " / Bajas: " + totalBajas, "up", "", null, "", "", null, "13px")}
                ${kpiCard("Bajas Totales", totalBajas.toLocaleString(), " ", "#ef4444", "Salidas del periodo", "down", "", null, "", "", null, "13px")}
                ${kpiCard("Retención & Rotación", `${retentionRate}% / ${rotationRate}%`, "  ", "#f59e0b", "Índice vs Bajas", "up", "", null, "", "", null, "13px")}
                ${kpiCard("Países Activos", activeCountriesCount, " ", "#6366f1", "Alcance Regional", "up", "", null, "", "", null, "13px")}
                    `;

                const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

                // Chart 1: HC por Direccion (Horizontal Bar)
                const countDir = {};
                uniqueEmps.forEach(e => {
                    const k = e.dir && e.dir !== '0' && e.dir !== 'OTRO' && e.dir !== 'nan' ? e.dir : 'Direccion NO ASIGNADA';
                    countDir[k] = (countDir[k] || 0) + 1;
                });
                const dirData = Object.entries(countDir).sort((a, b) => b[1] - a[1]);
                const ctx1 = document.getElementById('chartPlDir').getContext('2d');
                window.activeCharts.push(new Chart(ctx1, {
                    type: 'bar', data: {
                        labels: dirData.map(d => d[0]),
                        datasets: [{ data: dirData.map(d => d[1]), backgroundColor: chartColors.slice(0, dirData.length), borderRadius: 6 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 10, weight: 700 } } } }
                    }
                }));

                // Chart 2: HC por Departamento (Horizontal Bar - ALL)
                const countDepto = {};
                uniqueEmps.forEach(e => {
                    const k = e.d && e.d !== 'SIN DEPTO' && e.d !== 'N/A' && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                    countDepto[k] = (countDepto[k] || 0) + 1;
                });
                const deptoData = Object.entries(countDepto).sort((a, b) => b[1] - a[1]);
                const ctx2 = document.getElementById('chartPlDepto').getContext('2d');
                window.activeCharts.push(new Chart(ctx2, {
                    type: 'bar', data: {
                        labels: deptoData.map(d => d[0]),
                        datasets: [{ data: deptoData.map(d => d[1]), backgroundColor: '#8b5cf6', borderRadius: 6 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Montserrat', size: 10, weight: 700 } } },
                            y: {
                                grid: { display: false },
                                ticks: {
                                    autoSkip: false,
                                    font: { family: 'Montserrat', size: 9, weight: 600 }
                                }
                            }
                        }
                    }
                }));

                // Chart 3: Antigüedad (Donut)
                const ten = { '< 1 a ': 0, '1-3 a ': 0, '3-5 a ': 0, '5-10 a ': 0, '10+ a ': 0 };
                uniqueEmps.forEach(e => {
                    const t = calcTenure(e.fi);
                    if (t < 1) ten['< 1 a ']++; else if (t < 3) ten['1-3 a ']++; else if (t < 5) ten['3-5 a ']++; else if (t < 10) ten['5-10 a ']++; else ten['10+ a ']++;
                });
                const ctx3 = document.getElementById('chartPlTenure').getContext('2d');
                window.activeCharts.push(new Chart(ctx3, {
                    type: 'doughnut', data: {
                        labels: Object.keys(ten), datasets: [{ data: Object.values(ten), backgroundColor: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'], borderWidth: 0, cutout: '60%' }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Montserrat', size: 10 } } } } }
                }));

                // Chart 4: Tasa de Rotación Mensual (area)
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const hcByMonth = Array(12).fill(0);
                const bajasByMonth = Array(12).fill(0);
                uniqueEmps.forEach(e => { const nm = normalizeMonth(e.m); if (nm >= 1 && nm <= 12) hcByMonth[nm - 1]++; });
                filteredBajas.forEach(b => {
                    try {
                        const parts = b.f.split('/');
                        if (parts.length >= 2) { const m = parseInt(parts[1]); if (m >= 1 && m <= 12) bajasByMonth[m - 1]++; }
                    } catch (ex) { }
                });
                const rotByMonth = hcByMonth.map((h, i) => h > 0 ? ((bajasByMonth[i] / h) * 100).toFixed(1) : 0);
                const ctx4 = document.getElementById('chartPlRotation').getContext('2d');
                window.activeCharts.push(new Chart(ctx4, {
                    type: 'line', data: {
                        labels: monthNames,
                        datasets: [{ label: 'Rotación %', data: rotByMonth, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, pointRadius: 4 }]
                    }, options: {
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                    }
                }));

                // Chart 5: Top Puestos (Horizontal Bar)
                const countPuesto = {};
                uniqueEmps.forEach(e => { const k = e.p || 'N/A'; countPuesto[k] = (countPuesto[k] || 0) + 1; });
                const puestoData = Object.entries(countPuesto).sort((a, b) => b[1] - a[1]).slice(0, 8);
                const ctx5 = document.getElementById('chartPlPuestos').getContext('2d');
                window.activeCharts.push(new Chart(ctx5, {
                    type: 'bar', data: {
                        labels: puestoData.map(d => d[0].substring(0, 20)),
                        datasets: [{ data: puestoData.map(d => d[1]), backgroundColor: '#14b8a6', borderRadius: 4 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 9 } } } }
                    }
                }));

                // NEW CHARTS: Gender, Age, Tenure by Dept
                // 1. Gender Pie Chart
                const genderCounts = { 'Masculino': 0, 'Femenino': 0, 'Otro': 0 };
                uniqueEmps.forEach(e => {
                    const g = (e.g || '').toLowerCase();
                    if (g.startsWith('m')) genderCounts['Masculino']++;
                    else if (g.startsWith('f')) genderCounts['Femenino']++;
                    else genderCounts['Otro']++;
                });
                const ctxG = document.getElementById('chartPlGender').getContext('2d');
                window.activeCharts.push(new Chart(ctxG, {
                    type: 'doughnut', data: {
                        labels: ['Masculino', 'Femenino'],
                        datasets: [{ data: [genderCounts['Masculino'], genderCounts['Femenino']], backgroundColor: ['#8b5cf6', '#ec4899'], borderWidth: 0, cutout: '65%' }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                }));

                // 2. Age Range Chart
                const ageRanges = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
                uniqueEmps.forEach(e => {
                    const age = parseInt(e.age);
                    if (!age) return;
                    if (age <= 25) ageRanges['18-25']++;
                    else if (age <= 35) ageRanges['26-35']++;
                    else if (age <= 45) ageRanges['36-45']++;
                    else if (age <= 55) ageRanges['46-55']++;
                    else ageRanges['56+']++;
                });
                const ctxAge = document.getElementById('chartPlAge').getContext('2d');
                window.activeCharts.push(new Chart(ctxAge, {
                    type: 'bar', data: {
                        labels: Object.keys(ageRanges),
                        datasets: [{ label: 'Colaboradores', data: Object.values(ageRanges), backgroundColor: '#a78bfa', borderRadius: 6 }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // 3. Avg Tenure per Dept
                const deptTenureSum = {}; const deptTenureCount = {};
                uniqueEmps.forEach(e => {
                    const d = e.d && e.d !== 'SIN DEPTO' ? e.d : 'OPERACIONES';
                    const t = calcTenure(e.fi);
                    deptTenureSum[d] = (deptTenureSum[d] || 0) + t;
                    deptTenureCount[d] = (deptTenureCount[d] || 0) + 1;
                });
                const avgTenureDept = Object.keys(deptTenureSum).map(d => ({ name: d, val: (deptTenureSum[d] / deptTenureCount[d]).toFixed(1) })).sort((a, b) => b.val - a.val).slice(0, 10);
                const ctxTD = document.getElementById('chartPlTenureDept').getContext('2d');
                window.activeCharts.push(new Chart(ctxTD, {
                    type: 'bar', data: {
                        labels: avgTenureDept.map(a => a.name),
                        datasets: [{ label: 'A  Promedio', data: avgTenureDept.map(a => a.val), backgroundColor: '#7c3aed', borderRadius: 4 }]
                    }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));
            }

            function calcAvgTenure(emps) {
                let sum = 0, count = 0;
                emps.forEach(e => { const t = calcTenure(e.fi); if (t > 0) { sum += t; count++; } });
                return count > 0 ? (sum / count).toFixed(1) : '0';
            }

            function toggleABView() { renderAll(); }
            function toggleYTDView() { renderAll(); }



function openOrgChart() {
            const inner = document.getElementById('orgInner');
            if (!inner) return;
            if (inner.children.length > 0) return; // Already init
            initOrg();
        }

        function orgNodeSizes(depth) {
            if (depth === 0) return { w: 150, fs: 13, fsr: 9, fss: 9, p: '10px 12px' }
            if (depth === 1) return { w: 130, fs: 11, fsr: 8, fss: 8, p: '8px 10px' }
            if (depth === 2) return { w: 116, fs: 10, fsr: 7.5, fss: 7.5, p: '7px 9px' }
            return { w: 104, fs: 9, fsr: 7, fss: 7, p: '5px 8px' }
        }

        function orgHBar(row) {
            const ws = row.querySelectorAll(':scope>.nw');
            if (ws.length < 2) return;
            const rr = row.getBoundingClientRect();
            const f = ws[0].getBoundingClientRect();
            const l = ws[ws.length - 1].getBoundingClientRect();
            row.style.setProperty('--hl', (f.left - rr.left + f.width / 2) + 'px');
            row.style.setProperty('--hr', (rr.width - (l.left - rr.left + l.width / 2)) + 'px');
            row.classList.add('hb');
        }

        function orgGType(nd) {
            if (nd.id === 'root') return 'root';
            if (nd.id === 'laura') return 'laura';
            const m = { area: 'area', dept: 'dept', 'lvl-dir': 'dir', 'lvl-ger': 'ger', 'lvl-jef': 'jef', 'lvl-coord': 'coord', 'lvl-sup': 'sup', 'lvl-sr': 'sr', 'lvl-base': 'base' };
            return m[nd.lclass] || 'base';
        }

        function mkOrgNode(nd, depth, areaColor) {
            const hasK = nd.children && nd.children.length > 0;
            const tp = orgGType(nd);
            const isVac = (nd.label || '').toLowerCase().includes('vacante');
            const sz = orgNodeSizes(depth);
            const gap = depth <= 1 ? 10 : 6;

            const wrap = document.createElement('div');
            wrap.className = 'nw'; wrap.dataset.d = depth;
            wrap.style.padding = `0 ${gap}px`;

            if (depth > 0) {
                const vu = document.createElement('div');
                vu.className = 'vl'; vu.style.height = depth <= 1 ? '16px' : '12px';
                wrap.appendChild(vu);
            }

            const box = document.createElement('div');
            box.className = `nd t-${tp}${isVac ? ' t-vac' : ''}`;
            box.style.width = sz.w + 'px';
            box.style.padding = sz.p;

            if (tp === 'area' && areaColor) {
                box.style.background = areaColor;
                box.style.borderColor = areaColor;
                box.style.borderWidth = '2px';
            }

            const role = document.createElement('div'); role.className = 'nr';
            role.style.fontSize = sz.fsr + 'px';
            const name = document.createElement('div'); name.className = 'nn';
            name.style.fontSize = sz.fs + 'px';
            const sub = document.createElement('div'); sub.className = 'ns';
            sub.style.fontSize = sz.fss + 'px';

            if (tp === 'root' || tp === 'laura') {
                role.textContent = 'Director Ejecutivo';
                name.style.fontWeight = '900';
                name.style.color = 'white';
                name.textContent = nd.label;
                box.appendChild(role); box.appendChild(name);
            } else if (tp === 'area') {
                name.style.color = 'white'; name.style.fontWeight = '800';
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(name); box.appendChild(sub);
            } else if (tp === 'dept') {
                role.textContent = 'Depto';
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(role); box.appendChild(name); box.appendChild(sub);
            } else {
                role.textContent = nd.nivel || tp;
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(role); box.appendChild(name); box.appendChild(sub);
            }

            if (hasK) {
                const cnt = document.createElement('div'); cnt.className = 'nc';
                cnt.style.cssText = `font-size:${Math.max(7, sz.fsr - 1)}px;min-width:${sz.fsr + 8}px;height:${sz.fsr + 8}px;`;
                if (tp === 'area') cnt.style.background = 'rgba(255,255,255,.25)';
                cnt.textContent = nd.children.length;
                box.appendChild(cnt);
                const tog = document.createElement('div'); tog.className = 'nt';
                tog.style.cssText = `width:${sz.fsr + 8}px;height:${sz.fsr + 8}px;font-size:${sz.fsr - 1}px;bottom: -${(sz.fsr + 8) / 2 + 2}px;`;
                tog.textContent = '';
                box.appendChild(tog);
            }

            box.addEventListener('click', e => {
                e.stopPropagation();
                if (!hasK) return;
                const kc = wrap.querySelector(':scope>.kids');
                const vd = wrap.querySelector(':scope>.vd');
                if (kc.classList.contains('open')) {
                    kc.classList.remove('open'); box.classList.remove('exp');
                    if (vd) vd.style.height = '0';
                    kc.querySelectorAll('.kids.open').forEach(k => k.classList.remove('open'));
                    kc.querySelectorAll('.nd.exp').forEach(n => n.classList.remove('exp'));
                    kc.querySelectorAll('.vd').forEach(v => v.style.height = '0');
                } else {
                    kc.classList.add('open'); box.classList.add('exp');
                    if (vd) vd.style.height = '16px';
                    requestAnimationFrame(() => {
                        kc.querySelectorAll(':scope>.row').forEach(r => orgHBar(r));
                        setTimeout(autoFitOrg, 80);
                    });
                }
            });

            wrap.appendChild(box);

            if (hasK) {
                const vd = document.createElement('div');
                vd.className = 'vl vd'; vd.style.height = '0'; vd.style.transition = 'height .15s';
                wrap.appendChild(vd);
                const kc = document.createElement('div'); kc.className = 'kids';

                if (tp === 'root') {
                    const PER = 5;
                    for (let i = 0; i < nd.children.length; i += PER) {
                        if (i > 0) {
                            const sep = document.createElement('div');
                            sep.className = 'vl'; sep.style.height = '10px';
                            kc.appendChild(sep);
                        }
                        const row = document.createElement('div'); row.className = 'row';
                        nd.children.slice(i, i + PER).forEach((ch, j) => {
                            const col = _orgAC[(i + j) % _orgAC.length];
                            row.appendChild(mkOrgNode(ch, depth + 1, col));
                        });
                        kc.appendChild(row);
                        requestAnimationFrame(() => orgHBar(row));
                    }
                } else {
                    const row = document.createElement('div'); row.className = 'row';
                    nd.children.forEach(ch => row.appendChild(mkOrgNode(ch, depth + 1, areaColor)));
                    kc.appendChild(row);
                    requestAnimationFrame(() => orgHBar(row));
                }
                wrap.appendChild(kc);
            }
            return wrap;
        }

        function autoFitOrg() {
            const canvas = document.getElementById('orgCanvas');
            const tc = document.getElementById('orgInner');
            if (!canvas || !tc) return;
            tc.style.transform = 'scale(1)';
            requestAnimationFrame(() => {
                const cw = canvas.clientWidth - 80;
                const ch = canvas.clientHeight - 80;
                const tw = tc.scrollWidth;
                const th = tc.scrollHeight;
                _orgSc = Math.min(cw / tw, ch / th, 1);
                _orgSc = Math.max(_orgSc, 0.12);
                tc.style.transform = `scale(${_orgSc})`;
                const lbl = document.getElementById('orgZLbl');
                if (lbl) lbl.textContent = Math.round(_orgSc * 100) + '%';
                setTimeout(() => {
                    const scaledW = tc.scrollWidth * _orgSc;
                    if (scaledW < canvas.clientWidth) canvas.scrollLeft = 0;
                    else canvas.scrollLeft = (scaledW - canvas.clientWidth) / 2;
                    canvas.scrollTop = 0;
                }, 50);
            });
        }

        function orgDz(d) {
            _orgSc = Math.min(2, Math.max(.1, _orgSc + d));
            const tc = document.getElementById('orgInner');
            if (tc) tc.style.transform = `scale(${_orgSc})`;
            const lbl = document.getElementById('orgZLbl');
            if (lbl) lbl.textContent = Math.round(_orgSc * 100) + '%';
        }

        function orgCollapseAll() {
            document.querySelectorAll('.kids.open').forEach(k => k.classList.remove('open'));
            document.querySelectorAll('.nd.exp').forEach(n => n.classList.remove('exp'));
            document.querySelectorAll('.vd').forEach(v => v.style.height = '0');
            setTimeout(autoFitOrg, 50);
        }

        function orgExpandTo(max) {
            orgCollapseAll();
            document.querySelectorAll('.nw').forEach(w => {
                if (parseInt(w.dataset.d || 0) < max) {
                    const kc = w.querySelector(':scope>.kids');
                    const vd = w.querySelector(':scope>.vd');
                    const bx = w.querySelector(':scope>.nd');
                    if (kc) { kc.classList.add('open'); if (vd) vd.style.height = '16px'; if (bx) bx.classList.add('exp'); }
                }
            });
            requestAnimationFrame(() => {
                document.querySelectorAll('.row').forEach(r => orgHBar(r));
                setTimeout(autoFitOrg, 100);
            });
        }

        function initOrg() {
            const tc = document.getElementById('orgInner');
            if (!tc) return;
            tc.innerHTML = '';
            const data = window._orgTreeData || {};
            if (!data.oliver) {
                 tc.innerHTML = '<div style="padding:40px; color:#64748b; font-weight:700;">Cargando estructura organizacional...</div>';
                 return;
            }
            const rrow = document.createElement('div');
            rrow.style.cssText = 'display:flex;align-items:flex-start;justify-content:center;gap:0';

            const ow = mkOrgNode(data.oliver, 0, null);
            const lw = mkOrgNode(data.laura, 0, null);

            const conn = document.createElement('div');
            conn.style.cssText = 'display:flex;align-items:center;padding:28px 6px 0;flex-shrink:0';
            conn.innerHTML = `<div style="width:18px;height:2px;background:var(--org-conn)"></div>
                <div style="font-family:\'DM Mono\',monospace;font-size:7.5px;color:var(--org-muted);background:var(--org-surf2);border:1px solid var(--org-border);border-radius:4px;padding:2px 7px;white-space:nowrap;letter-spacing:.5px">mismo nivel</div>
                <div style="width:18px;height:2px;background:var(--org-conn)"></div>`;

            rrow.appendChild(ow); rrow.appendChild(conn); rrow.appendChild(lw);
            tc.appendChild(rrow);
            requestAnimationFrame(() => setTimeout(autoFitOrg, 150));
        }

        window.addEventListener('resize', () => {
            const pane1 = document.getElementById('pane1');
            if (pane1 && pane1.classList.contains('on')) {
                setTimeout(autoFitOrg, 100);
            }
        });

        // --- HC DINÁMICO ---
        window._dynChart = null;
        function updateDynOptions() {
            const dim = document.getElementById('dynDimension').value;
            const empsSource = (window.app && window.app.employees) ? window.app.employees : (window.hcFullData || []);
            const emps = Array.isArray(empsSource) ? empsSource : (empsSource.employees || []);
            let options = [];
            if (dim === 'pa') options = [...new Set(emps.map(e => normalizePa(e.pa)))].filter(x => x).sort();
            else if (dim === 'e') options = [...new Set(emps.map(e => (e.e || '').trim()))].filter(x => x).sort();
            else if (dim === 'dir') options = [...new Set(emps.map(e => (e.dir || '').trim()))].filter(x => x).sort();
            else if (dim === 'd') options = [...new Set(emps.map(e => (e.d || '').trim()))].filter(x => x).sort();
            document.getElementById('dynCheckList').innerHTML = options.map(opt => `<label style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:11px; font-weight:700;"><input type="checkbox" class="dyn-opt-check" value="${opt}" checked> ${opt}</label>`).join('');
        }

        function createDynChart() {
            const dim = document.getElementById('dynDimension').value;
            const selected = Array.from(document.querySelectorAll('.dyn-opt-check:checked')).map(c => c.value);
            if (!selected.length) return Swal.fire('Error', 'Seleccione al menos una opción', 'warning');
            const empsSource = (window.app && window.app.employees) ? window.app.employees : (window.hcFullData || []);
            const emps = Array.isArray(empsSource) ? empsSource : (empsSource.employees || []);
            const f = typeof getFilters === 'function' ? getFilters() : { y: 'ALL', m: 'ALL' };
            const filtered = emps.filter(e => (f.y === 'ALL' || e.y == f.y) && (f.m === 'ALL' || e.m == f.m));
            const counts = {}; selected.forEach(s => counts[s] = 0);
            filtered.forEach(e => { let v = ''; if (dim === 'pa') v = normalizePa(e.pa); else if (dim === 'e') v = (e.e || ''); else if (dim === 'dir') v = (e.dir || ''); else if (dim === 'd') v = (e.d || ''); if (counts.hasOwnProperty(v)) counts[v]++; });

            document.getElementById('dynEmptyState').style.display = 'none';
            document.getElementById('dynChartCanvas').style.display = 'block';
            document.getElementById('dynInfoOverlay').style.display = 'block';
            document.getElementById('dynTotalCount').innerText = Object.values(counts).reduce((a, b) => a + b, 0).toLocaleString();

            const ctx = document.getElementById('dynChartCanvas').getContext('2d');
            if (window._dynChart) window._dynChart.destroy();
            window._dynChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: 'HC',
                        data: Object.values(counts),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        function clearDynHC() {
            document.querySelectorAll('.dyn-opt-check').forEach(c => c.checked = false);
            if (window._dynChart) window._dynChart.destroy();
            document.getElementById('dynEmptyState').style.display = 'block';
            document.getElementById('dynChartCanvas').style.display = 'none';
            document.getElementById('dynInfoOverlay').style.display = 'none';
        }


        // --- REPARAR PENDIENTES: Intelligent Auto-Fix ---
        function repararPendientes() {
            if (!app || !app.employees) { alert('No hay datos cargados.'); return; }
            
            const NOISE = /\b(SR|JR|SENIOR|JUNIOR|REGIONAL|DE|LA|EL|LOS|LAS|EN|Y|AND|ASG|ASEGURO|BILINGUE|BILINGUE)\b/gi;
            const overrides = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
            const changes = [];
            
            // Collect all positions that are still PENDIENTE, OTRO, or unmapped
            const isBad = v => !v || v === 'PENDIENTE' || v === 'OTRO' || v === '0' || v === 'nan' || v === 'SIN DEPTO' || v === 'N/A';
            
            const allRecords = [
                ...(app.employees || []),
                ...(app.bajas_list || []),
                ...(app.incidencias || [])
            ];
            
            // Build a "known good" map from already-mapped records
            const knownMap = new Map();
            allRecords.forEach(emp => {
                if (!isBad(emp.dir) && !isBad(emp.d)) {
                    const pNorm = (emp.p || emp.position || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                    if (pNorm && !knownMap.has(pNorm)) {
                        knownMap.set(pNorm, { dir: emp.dir, d: emp.d });
                    }
                    // Also store stripped version
                    const stripped = pNorm.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                    if (stripped && !knownMap.has(stripped)) {
                        knownMap.set(stripped, { dir: emp.dir, d: emp.d });
                    }
                }
            });
            
            // Also add POSITION_MAP entries
            if (typeof POSITION_MAP !== 'undefined') {
                Object.entries(POSITION_MAP).forEach(([key, val]) => {
                    if (!knownMap.has(key)) knownMap.set(key, val);
                    const stripped = key.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                    if (stripped && !knownMap.has(stripped)) knownMap.set(stripped, val);
                });
            }
            
            // Now scan for pending positions
            allRecords.forEach(emp => {
                if (!isBad(emp.dir) && !isBad(emp.d)) return; // Already good
                
                const pRaw = (emp.p || emp.position || '').trim();
                if (!pRaw || pRaw === 'PENDIENTE') return;
                
                const pNorm = pRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                const stripped = pNorm.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                const paRaw = (emp.pa || '').trim();
                const eRaw = (emp.e || '').trim();
                const exactKey = `${pNorm}|${normalizePa(paRaw)}|${eRaw.toUpperCase()}`;
                
                let newDir = null;
                let newDepto = null;
                let method = '';
                
                // Strategy 1: Exact match in knownMap
                const exact = knownMap.get(pNorm);
                if (exact) {
                    newDir = exact.dir; newDepto = exact.d; method = 'Exacto';
                }
                
                // Strategy 2: Stripped match
                if (!newDir && stripped !== pNorm) {
                    const hit = knownMap.get(stripped);
                    if (hit) {
                        newDir = hit.dir; newDepto = hit.d; method = 'Similar';
                    }
                }
                
                // Strategy 3: Word-overlap scoring
                if (!newDir) {
                    const words = stripped.split(' ').filter(w => w.length > 2);
                    if (words.length >= 1) {
                        let bestScore = 0;
                        let bestMatch = null;
                        for (const [key, val] of knownMap.entries()) {
                            const keyWords = key.split(' ').filter(w => w.length > 2);
                            let score = 0;
                            for (const w of words) { if (keyWords.includes(w)) score++; }
                            const ratio = score / Math.max(words.length, keyWords.length);
                            if (ratio > 0.3 && score > bestScore) {
                                bestScore = score;
                                bestMatch = { dir: val.dir, d: val.d, from: key };
                            }
                        }
                        if (bestMatch) {
                            newDir = bestMatch.dir; newDepto = bestMatch.d; method = 'Fuzzy (' + bestMatch.from + ')';
                        }
                    }
                }
                
                // Strategy 4: getAutoMapping keyword fallback
                if (!newDir && typeof getAutoMapping === 'function') {
                    const auto = getAutoMapping(pRaw);
                    if (auto) {
                        newDir = auto.dir; newDepto = auto.d; method = 'Palabras Clave';
                    }
                }
                
                // Apply if we found something
                if (newDir && newDepto) {
                    const oldDir = emp.dir || 'PENDIENTE';
                    const oldD = emp.d || 'PENDIENTE';
                    
                    // Only record if it actually changed
                    if (oldDir !== newDir || oldD !== newDepto) {
                        changes.push({
                            puesto: pRaw,
                            pais: paisMap[normalizePa(paRaw)] || paRaw,
                            empresa: eRaw,
                            oldDir, oldD,
                            newDir, newDepto,
                            method
                        });
                        
                        emp.dir = newDir;
                        emp.d = newDepto;
                        
                        // Save as permanent override
                        overrides[exactKey] = { dir: newDir, depto: newDepto };
                    }
                }
            });
            
            // Save all overrides
            localStorage.setItem('asys_pos_overrides', JSON.stringify(overrides));
            
            // Re-render
            cachedEmps = null;
            lastFilterKey = "";
            requestRenderAll();
            
            // Show results modal
            showRepairLog(changes);
        }
        
        function showRepairLog(changes) {
            // Remove old modal if exists
            const old = document.getElementById('repairLogModal');
            if (old) old.remove();
            
            const modal = document.createElement('div');
            modal.id = 'repairLogModal';
            modal.style.cssText = `
                position:fixed; top:0; left:0; width:100vw; height:100vh;
                background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
                z-index:99999; display:flex; align-items:center; justify-content:center;
                animation: fadeIn 0.3s ease;
            `;
            
            const count = changes.length;
            let tableRows = '';
            if (count > 0) {
                tableRows = changes.map((c, i) => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05); ${i % 2 === 0 ? 'background:rgba(255,255,255,0.02)' : ''}">
                        <td style="padding:10px 12px; font-weight:700; color:#e2e8f0; font-size:11px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.puesto}">${c.puesto}</td>
                        <td style="padding:10px 8px; color:#ef4444; font-size:10px; font-weight:600;">${c.oldDir}</td>
                        <td style="padding:10px 8px; color:#10b981; font-size:10px; font-weight:800;">${c.newDir}</td>
                        <td style="padding:10px 8px; color:#10b981; font-size:10px; font-weight:800;">${c.newDepto}</td>
                        <td style="padding:10px 8px; color:#94a3b8; font-size:9px; font-style:italic;">${c.method}</td>
                    </tr>
                `).join('');
            }
            
            modal.innerHTML = `
                <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:24px; width:90%; max-width:900px; max-height:85vh; overflow:hidden; display:flex; flex-direction:column; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
                    <div style="padding:25px 30px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#fff; font-size:18px; font-weight:900; margin:0;">  Reparaci  de Pendientes</h2>
                            <p style="color:#94a3b8; font-size:12px; margin:5px 0 0 0;">${count > 0 ? `Se repararon <span style="color:#10b981; font-weight:900;">${count}</span> puestos autom ` : 'No se encontraron puestos pendientes por reparar  '}</p>
                        </div>
                        <button onclick="document.getElementById('repairLogModal').remove()" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;"> </button>
                    </div>
                    ${count > 0 ? `
                    <div style="overflow-y:auto; flex:1; padding:0;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="position:sticky; top:0; background:#1e293b; z-index:5;">
                                <tr>
                                    <th style="padding:12px; text-align:left; color:#94a3b8; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">PUESTO</th>
                                    <th style="padding:12px; text-align:left; color:#ef4444; font-size:10px; font-weight:800; text-transform:uppercase;">ANTES</th>
                                    <th style="padding:12px; text-align:left; color:#10b981; font-size:10px; font-weight:800; text-transform:uppercase;">Direccion</th>
                                    <th style="padding:12px; text-align:left; color:#10b981; font-size:10px; font-weight:800; text-transform:uppercase;">DEPTO</th>
                                    <th style="padding:12px; text-align:left; color:#94a3b8; font-size:10px; font-weight:800; text-transform:uppercase;">M </th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                    ` : '<div style="padding:60px; text-align:center;"><span style="font-size:48px;"> </span><p style="color:#94a3b8; font-size:14px; margin-top:15px;">Todos los puestos ya están clasificados correctamente.</p></div>'}
                    <div style="padding:15px 30px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:#64748b; font-size:10px;">Los cambios se guardaron en localStorage automaspan>
                        <button onclick="document.getElementById('repairLogModal').remove()" style="background:var(--ac); color:#fff; border:none; padding:10px 24px; border-radius:12px; font-weight:800; font-size:12px; cursor:pointer;">CERRAR</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        // (clearFilters now defined once globally above   this duplicate removed)

        // Global event listeners for idle tracking
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => window.addEventListener(evt, () => {
            const dashboard = document.getElementById('mainDashboard');
            if (dashboard && dashboard.style.display === 'block') {
                if (typeof resetIdleTimer === 'function') resetIdleTimer();
            }
        }));

        // --- POINT 8: DYNAMIC HC GENERADORR ---
        window.renderDynamicHC = function() {
            const dim = document.getElementById('selDynamicDim').value;
            const canvas = document.getElementById('chartDynamicHC');
            if (!canvas) return;

            const f = getFilters();
            const emps = window.lastActiveHC || []; // Use currently active HC from renderGeneral
            const counts = {};
            
            emps.forEach(e => {
                let key = e[dim] || 'Sin Dato';
                if (dim === 'dir' && !e.dir) key = e.area || 'Sin area';
                counts[key] = (counts[key] || 0) + 1;
            });

            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
            const labels = sorted.map(d => d[0]);
            const data = sorted.map(d => d[1]);

            if (window._dynamicChartHC) window._dynamicChartHC.destroy();

            window._dynamicChartHC = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Colaboradores (HC Real)',
                        data: data,
                        backgroundColor: labels.map((_, i) => i%2 === 0 ? '#8b5cf6' : '#8b5cf6'),
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true } }
                }
            });
        };

        // --- POINT 15b: MONTHLY SNAPSHOT DRILL-DOWN ---
        // --- POINT 15b: HEATMAP DETAIL DRILL-DOWN (Modernized) ---
        window.renderHeatmapDetail = function(y, m) {
            const row = document.getElementById('calendarDetailRow');
            if (!row) return;
            
            const mname = (window.monthNames && window.monthNames[m]) || 'Mes';
            row.style.display = 'block';
            row.innerHTML = `
                <div style="background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); border:1px solid rgba(226,232,240,0.8); border-radius:24px; padding:30px; box-shadow:0 15px 35px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; border-bottom:1px solid #f1f5f9; padding-bottom:15px;">
                        <div>
                            <h3 style="font-size:18px; font-weight:1000; color:#1e293b; margin:0;">   Detalle Mensual: <span style="color:var(--ac);">${mname} ${y}</span></h3>
                            <p style="font-size:11px; color:#64748b; font-weight:700; margin-top:4px;">Análisis profundo de bajas y movimientos</p>
                        </div>
                        <button onclick="document.getElementById('calendarDetailRow').style.display='none'" style="background:#f1f5f9; border:none; color:#64748b; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseenter="this.style.background='#e2e8f0'" onmouseleave="this.style.background='#f1f5f9'"> </button>
                    </div>
                    <div id="heatmapChartsGrid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapPa"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapEmp"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snaparea"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapDepto"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapAnt"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapMotivo"></canvas></div>
                    </div>
                </div>
            `;

            setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

            const allBajas = (window.allBajas || app.bajas_list || []);
            const { countries: cFilter, e: empFilter } = getFilters();
            const monthlyBajas = allBajas.filter(b => b.y == y && b.m == m && (cFilter.length === 0 || cFilter.includes(normalizePa(b.pa))) && (empFilter === 'ALL' || b.e === empFilter));

            const makeChart = (id, dataObj, title, type = 'doughnut', colorSource = 'auto') => {
                const ctx = document.getElementById(id);
                if (!ctx) return;
                const entries = Object.entries(dataObj).sort((a,b)=>b[1]-a[1]).slice(0, 8);
                if (entries.length === 0) {
                    ctx.parentElement.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:11px; font-weight:700;">No hay datos para ${title}</div>`;
                    return;
                }

                const total = Object.values(dataObj).reduce((a, b) => a + b, 0);
                const labels = entries.map(e => {
                    const pct = total > 0 ? ((e[1] / total) * 100).toFixed(1) : 0;
                    return `${e[0].substring(0,18)}: ${e[1]} (${pct}%)`;
                });

                const colors = entries.map((e, i) => {
                    if (colorSource === 'pa') {
                        const code = normalizePa(e[0]);
                        return (window.countryStyles && window.countryStyles[code] || {color:'#3b82f6'}).color;
                    }
                    return ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'][i % 8];
                });

                new Chart(ctx.getContext('2d'), {
                    type: type,
                    data: {
                        labels: labels,
                        datasets: [{ 
                            data: entries.map(e => e[1]), 
                            backgroundColor: colors,
                            borderWidth: 0,
                            hoverOffset: 15
                        }]
                    },
                    options: { 
                        responsive:true, 
                        maintainAspectRatio:false, 
                        cutout: type === 'doughnut' ? '65%' : 0,
                        plugins: { 
                            title: { display:true, text:title, font:{size:12, weight:1000}, color: '#334155', padding:{bottom:15} },
                            legend:{ display: type === 'doughnut', position:'bottom', labels:{ boxWidth:8, usePointStyle:true, font:{size:9, weight:700} } } 
                        },
                        scales: type === 'bar' ? { x:{ grid:{display:false} }, y:{ beginAtZero:true } } : {}
                    }
                });
            };

            const pa= {}, em= {}, ar= {}, de= {}, an= {}, mo= {};
            monthlyBajas.forEach(b => {
                const p = b.pa || 'N/A';
                pa[p] = (pa[p]||0)+1;
                const e = b.e || 'N/A';
                em[e] = (em[e]||0)+1;
                const area = b.dir || b.area || 'Sin area';
                ar[area] = (ar[area]||0)+1;
                de[b.d||'Sin Depto'] = (de[b.d||'Sin Depto']||0)+1;
                const t = Number(b.t) || 0;
                const range = t < 1 ? '< 1 a ' : t < 2 ? '1-2 a ' : t < 5 ? '2-5 a ' : '5+ a ';
                an[range] = (an[range]||0)+1;
                const mot = b.mo || 'No especificado';
                mo[mot] = (mo[mot]||0)+1;
            });

            makeChart('snapPa', pa, '  POR Pais', 'doughnut', 'pa');
            makeChart('snapEmp', em, '  POR EMPRESA');
            makeChart('snaparea', ar, '  POR Direccion');
            makeChart('snapDepto', de, '  POR DEPARTAMENTO', 'bar');
            makeChart('snapAnt', an, '  POR Antigüedad');
            makeChart('snapMotivo', mo, '  MOTIVOS DE BAJA', 'bar');
        };

        // ---   ESTRAT  RENDER RETENTION HEALTH (RISK ZONE) ---
        function renderRetentionHealth(uniqueEmps, y, m) {
            const ctx = document.getElementById('chartRetentionHealth');
            if (!ctx) return;

            const { countries, e: emp2, a: areaSel, d: deptoSel } = getFilters();
            const period = window._retPeriod || 6;
            
            // Sync active state on buttons
            const btn6 = document.getElementById('rzBtn6');
            const btn12 = document.getElementById('rzBtn12');
            if (btn6 && btn12) {
                if (period === 6) {
                    btn6.classList.add('active');
                    btn12.classList.remove('active');
                } else {
                    btn12.classList.add('active');
                    btn6.classList.remove('active');
                }
            }

            // Build period dates
            let targetY = parseInt(y);
            let targetM = parseInt(m);
            const allBajas = (window.allBajas || app.bajas_list || window.app?.bajas_list || []);

            if (isNaN(targetY)) targetY = 2026; // Default
            if (isNaN(targetM)) {
                const yB = allBajas.filter(b => parseInt(b.y) === targetY);
                targetM = yB.length > 0 ? Math.max(...yB.map(b => parseInt(b.m) || 1)) : 12;
            }

            const endDate = new Date(targetY, targetM, 0); 
            const startDate = new Date(targetY, targetM - period, 1);
            
            const filteredBajas = allBajas.filter(b => {
                const curPa = b._pa || normalizePa(b.pa);
                const by = parseInt(b._y || b.y);
                const bm = normalizeMonth(b._m || b.m);
                const bajDate = new Date(by, bm - 1, 15);

                const matchP = countries.length === 0 || countries.includes(curPa);
                const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                
                const matchDate = (bajDate >= startDate && bajDate <= endDate);
                return matchP && matchE && matchA && matchD && matchDate;
            });

            const deptMap = {};
            let earlyBajas = 0;
            let midBajas = 0;
            let seniorBajas = 0;

            const parseD = (s) => {
                if(!s || typeof s !== 'string') return null;
                let p = [];
                if (s.includes('/')) p = s.split('/');
                else if (s.includes('-')) p = s.split('-');
                if (p.length < 3) return null;
                
                // YYYY-MM-DD
                if (p[0].length === 4) {
                    let yr = parseInt(p[0]);
                    let mon = parseInt(p[1]);
                    let day = parseInt(p[2]);
                    return new Date(yr, mon - 1, day);
                } else {
                    // DD/MM/YYYY
                    let day = parseInt(p[0]);
                    let mon = parseInt(p[1]);
                    let yr = parseInt(p[2]);
                    if (yr < 100) yr += 2000;
                    return new Date(yr, mon - 1, day);
                }
            };

            filteredBajas.forEach(b => {
                const dept = b.d || 'Otros';
                if (!deptMap[dept]) deptMap[dept] = { total: 0, early: 0, mid: 0, senior: 0 };
                deptMap[dept].total++;

                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);

                if (years < 0.5) { deptMap[dept].early++; earlyBajas++; }
                else if (years < 1) { deptMap[dept].mid++; midBajas++; }
                else { deptMap[dept].senior++; seniorBajas++; }
            });

            const labels = Object.keys(deptMap).sort((a,b) => deptMap[b].early - deptMap[a].early).slice(0, 10);
            const dataEarly = labels.map(l => deptMap[l].early);
            const dataMid = labels.map(l => deptMap[l].mid);
            const dataSenior = labels.map(l => deptMap[l].senior);

            // RENDER DEPARTMENT STACKED CHART
            if (window._retChart) window._retChart.destroy();
            window._retChart = new Chart(ctx, {
                type: 'bar',
                plugins: [ChartDataLabels],
                data: {
                    labels: labels,
                    datasets: [
                        { 
                            label: '< 6 Meses (Crítico)', data: dataEarly, backgroundColor: '#ef4444', 
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        },
                        { 
                            label: '6-12 Meses (Riesgo)', data: dataMid, backgroundColor: '#8b5cf6',
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        },
                        { 
                            label: '> 12 Meses (Natural)', data: dataSenior, backgroundColor: '#3b82f6',
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 800 }, color: '#64748b' } } 
                    },
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(139, 92, 246, 0.08)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                        y: { stacked: true, grid: { display: false }, ticks: { font: { size: 10, weight: 800 }, color: '#475569' } }
                    }
                }
            });

            // UPDATE DYNAMIC KPI CARDS
            const totalBajas = filteredBajas.length;
            const earlyPctVal = totalBajas > 0 ? (earlyBajas / totalBajas * 100) : 0;
            const midPctVal = totalBajas > 0 ? (midBajas / totalBajas * 100) : 0;
            const seniorPctVal = totalBajas > 0 ? (seniorBajas / totalBajas * 100) : 0;

            const earlyValEl = document.getElementById('retKpiEarlyCount');
            if (earlyValEl) earlyValEl.innerText = earlyBajas.toLocaleString();
            const earlyPctEl = document.getElementById('retKpiEarlyPct');
            if (earlyPctEl) earlyPctEl.innerText = earlyPctVal.toFixed(1) + '% de total bajas';

            const midValEl = document.getElementById('retKpiMidCount');
            if (midValEl) midValEl.innerText = midBajas.toLocaleString();
            const midPctEl = document.getElementById('retKpiMidPct');
            if (midPctEl) midPctEl.innerText = midPctVal.toFixed(1) + '% de total bajas';

            const seniorValEl = document.getElementById('retKpiSeniorCount');
            if (seniorValEl) seniorValEl.innerText = seniorBajas.toLocaleString();
            const seniorPctEl = document.getElementById('retKpiSeniorPct');
            if (seniorPctEl) seniorPctEl.innerText = seniorPctVal.toFixed(1) + '% de total bajas';

            // TREND COMPARISON (Previous Period)
            const prevStartDate = new Date(targetY, targetM - period * 2, 1);
            const prevEndDate = new Date(targetY, targetM - period, 0);
            const prevFilteredBajas = allBajas.filter(b => {
                const curPa = b._pa || normalizePa(b.pa);
                const by = parseInt(b._y || b.y);
                const bm = normalizeMonth(b._m || b.m);
                const bajDate = new Date(by, bm - 1, 15);
                const matchP = countries.length === 0 || countries.includes(curPa);
                const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                return matchP && matchE && matchA && matchD && (bajDate >= prevStartDate && bajDate <= prevEndDate);
            });

            let prevEarly = 0, prevMid = 0, prevSenior = 0;
            prevFilteredBajas.forEach(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
                if (years < 0.5) prevEarly++;
                else if (years < 1) prevMid++;
                else prevSenior++;
            });

            const formatTrend = (curr, prev, elId) => {
                const el = document.getElementById(elId);
                if (!el) return;
                const diff = curr - prev;
                if (diff > 0) {
                    el.className = 'rz-kpi-trend up';
                    el.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> <span>+${diff} vs per. anterior</span>`;
                } else if (diff < 0) {
                    el.className = 'rz-kpi-trend down';
                    el.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> <span>${diff} vs per. anterior</span>`;
                } else {
                    el.className = 'rz-kpi-trend neutral';
                    el.innerHTML = `<i class="fa-solid fa-arrow-right"></i> <span>Sin cambios</span>`;
                }
            };
            formatTrend(earlyBajas, prevEarly, 'retKpiEarlyTrend');
            formatTrend(midBajas, prevMid, 'retKpiMidTrend');
            formatTrend(seniorBajas, prevSenior, 'retKpiSeniorTrend');

            // GLOBAL RETENTION INDEX & STATUS BADGE
            const globalIndex = totalBajas > 0 ? (earlyBajas / totalBajas) * 100 : 0;
            const idxEl = document.getElementById('retentionGlobalIndex');
            if (idxEl) idxEl.innerText = globalIndex.toFixed(1) + '%';
            
            const badgeEl = document.getElementById('retentionStatusBadge');
            const dotEl = document.getElementById('statusDot');
            const txtEl = document.getElementById('statusText');
            
            if (badgeEl && dotEl && txtEl) {
                if (globalIndex > 35) {
                    badgeEl.style.cssText = 'background:rgba(239, 68, 68, 0.08); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot red';
                    txtEl.innerText = 'CRÍTICO';
                } else if (globalIndex > 20) {
                    badgeEl.style.cssText = 'background:rgba(245, 158, 11, 0.08); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot orange';
                    txtEl.innerText = 'RIESGO ALTO';
                } else {
                    badgeEl.style.cssText = 'background:rgba(16, 185, 129, 0.08); color:#10b981; border:1px solid rgba(16, 185, 129, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot green';
                    txtEl.innerText = 'ESTABLE';
                }
            }

            // 12-MONTH TREND LINE CHART
            const trendLabels = [];
            const trendData = [];
            const monthNamesAbbr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            for (let i = 11; i >= 0; i--) {
                const d = new Date(targetY, targetM - i - 1, 15);
                const yr = d.getFullYear();
                const mo = d.getMonth() + 1;
                const lbl = monthNamesAbbr[mo - 1] + ' ' + (yr % 100);
                trendLabels.push(lbl);
                
                const mBajas = allBajas.filter(b => {
                    const curPa = b._pa || normalizePa(b.pa);
                    const by = parseInt(b._y || b.y);
                    const bm = normalizeMonth(b._m || b.m);
                    const matchP = countries.length === 0 || countries.includes(curPa);
                    const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                    const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                    const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                    return matchP && matchE && matchA && matchD && by === yr && bm === mo;
                }).length;
                trendData.push(mBajas);
            }

            const trendCanvas = document.getElementById('chartRetentionTrend');
            if (trendCanvas) {
                const trendCtx = trendCanvas.getContext('2d');
                const trendGrad = trendCtx.createLinearGradient(0, 0, 0, 180);
                trendGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
                trendGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                
                if (window._retTrendChart) window._retTrendChart.destroy();
                window._retTrendChart = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendLabels,
                        datasets: [{
                            label: 'Bajas',
                            data: trendData,
                            borderColor: '#8b5cf6',
                            backgroundColor: trendGrad,
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 6,
                            datalabels: { display: false }
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            datalabels: { display: false }
                        },
                        scales: {
                            x: { grid: { color: 'rgba(139, 92, 246, 0.05)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                            y: { grid: { color: 'rgba(139, 92, 246, 0.05)' }, ticks: { color: '#64748b', font: { size: 9 } }, beginAtZero: true }
                        }
                    }
                });
            }

            // RISK SCORE CALCULATION FOR ACTIVE EMPLOYEES
            const activeRiskScores = [];
            const activeEmps = uniqueEmps || [];
            const salaries = activeEmps.map(e => Number(e.so) || 0).filter(s => s > 0).sort((a,b)=>a-b);
            const q1 = salaries[Math.floor(salaries.length * 0.25)] || 1500;
            const q3 = salaries[Math.floor(salaries.length * 0.85)] || 5000;
            
            const deptBajaCounts = {};
            filteredBajas.forEach(b => {
                const d = b.d || 'Otros';
                deptBajaCounts[d] = (deptBajaCounts[d] || 0) + 1;
            });

            activeEmps.forEach(emp => {
                const d1 = parseD(emp.fi);
                let tenureMonths = 12;
                if (d1) {
                    tenureMonths = (endDate - d1) / (1000 * 60 * 60 * 24 * 30.44);
                }
                let tenureScore = 5;
                if (tenureMonths < 6) tenureScore = 40;
                else if (tenureMonths < 12) tenureScore = 25;
                else if (tenureMonths < 24) tenureScore = 15;
                
                let salaryScore = 5;
                const sal = Number(emp.so) || 0;
                if (sal > 0) {
                    if (sal < q1) salaryScore = 20;
                    else if (sal > q3) salaryScore = 15;
                }
                
                const dept = emp.d || 'Otros';
                const churnVal = deptBajaCounts[dept] || 0;
                let churnScore = 0;
                if (churnVal > 10) churnScore = 30;
                else if (churnVal > 5) churnScore = 20;
                else if (churnVal > 2) churnScore = 10;
                
                const score = Math.min(100, tenureScore + salaryScore + churnScore);
                activeRiskScores.push(score);
            });

            const buckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
            let sumScore = 0;
            activeRiskScores.forEach(sc => {
                sumScore += sc;
                if (sc <= 20) buckets['0-20']++;
                else if (sc <= 40) buckets['20-40']++;
                else if (sc <= 60) buckets['40-60']++;
                else if (sc <= 80) buckets['60-80']++;
                else buckets['80-100']++;
            });
            const avgRiskScore = activeRiskScores.length > 0 ? (sumScore / activeRiskScores.length) : 0;

            const riskCanvas = document.getElementById('chartRetentionRiskDist');
            if (riskCanvas) {
                const riskCtx = riskCanvas.getContext('2d');
                if (window._retRiskChart) window._retRiskChart.destroy();
                window._retRiskChart = new Chart(riskCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['0-20 (Estable)', '20-40 (Bajo)', '40-60 (Medio)', '60-80 (Alto)', '80-100 (Crítico)'],
                        datasets: [{
                            data: [buckets['0-20'], buckets['20-40'], buckets['40-60'], buckets['60-80'], buckets['80-100']],
                            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#ef4444'],
                            borderWidth: 0,
                            hoverOffset: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { boxWidth: 8, font: { size: 9 }, color: '#64748b' } },
                            datalabels: { display: false }
                        }
                    }
                });
            }

            // HEATMAP GENERATOR (Top 5 Depts)
            const deptTotalBajas = {};
            filteredBajas.forEach(b => {
                const d = b.d || 'Otros';
                deptTotalBajas[d] = (deptTotalBajas[d] || 0) + 1;
            });
            const top5Depts = Object.entries(deptTotalBajas)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 5)
                .map(d => d[0]);
            
            const heatMonths = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(targetY, targetM - i - 1, 15);
                heatMonths.push({ y: d.getFullYear(), m: d.getMonth() + 1, label: monthNamesAbbr[d.getMonth()] });
            }

            let heatHtml = `<table class="rz-heatmap-table">
                <thead>
                    <tr>
                        <th style="color:#64748b; text-align:left;">Dpto</th>`;
            heatMonths.forEach(hm => {
                heatHtml += `<th style="color:#64748b; text-align:center;">${hm.label}</th>`;
            });
            heatHtml += `</tr>
                </thead>
                <tbody>`;
            
            top5Depts.forEach(dept => {
                heatHtml += `<tr><td style="color:#475569; font-weight:800; font-size:10px; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;" title="${dept}">${dept}</td>`;
                heatMonths.forEach(hm => {
                    const val = allBajas.filter(b => {
                        const curPa = b._pa || normalizePa(b.pa);
                        const by = parseInt(b._y || b.y);
                        const bm = normalizeMonth(b._m || b.m);
                        const matchP = countries.length === 0 || countries.includes(curPa);
                        const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                        const matchD = (b.d || b.depto || '').toUpperCase().trim() === dept.toUpperCase().trim();
                        return matchP && matchE && matchD && by === hm.y && bm === hm.m;
                    }).length;
                    
                    let cellBg = 'rgba(139, 92, 246, 0.05)';
                    let cellColor = '#8b5cf6';
                    let cellIcon = '🟢';
                    if (val > 6) {
                        cellBg = 'rgba(239, 68, 68, 0.15)';
                        cellColor = '#ef4444';
                        cellIcon = '🔴';
                    } else if (val > 3) {
                        cellBg = 'rgba(139, 92, 246, 0.18)';
                        cellColor = '#8b5cf6';
                        cellIcon = '🟣';
                    } else if (val > 1) {
                        cellBg = 'rgba(59, 130, 246, 0.15)';
                        cellColor = '#3b82f6';
                        cellIcon = '🔵';
                    }
                    
                    heatHtml += `<td style="text-align:center;">
                        <div class="rz-heatmap-cell" style="background:${cellBg}; color:${cellColor}; font-size:9.5px; font-weight:800; display:inline-block; min-width:32px; padding:2px 4px; border-radius:4px;" title="Bajas: ${val}">
                            ${cellIcon} ${val}
                        </div>
                    </td>`;
                });
                heatHtml += `</tr>`;
            });
            
            if (top5Depts.length === 0) {
                heatHtml += `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b; font-weight:800;">No hay datos para generar el mapa de calor</td></tr>`;
            }
            
            heatHtml += `</tbody></table>`;
            const hmContainer = document.getElementById('retentionHeatmap');
            if (hmContainer) hmContainer.innerHTML = heatHtml;

            // EXECUTIVE ACTION INSIGHTS ENGINE
            let insightsHtml = '';
            const earlyPct = totalBajas > 0 ? (earlyBajas / totalBajas * 100) : 0;
            
            if (earlyBajas > 0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(239,68,68,0.08); color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Rotación Temprana Crítica</div>
                        <div class="rz-insight-desc">${earlyBajas} empleados con &lt;6 meses dejaron la empresa (${earlyPct.toFixed(1)}% del total). Acción: Revisar onboarding y selección.</div>
                    </div>
                </div>`;
            } else {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(16,185,129,0.08); color:#10b981;"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Retención Temprana Estable</div>
                        <div class="rz-insight-desc">No se registran fugas de talento en sus primeros 6 meses. Mantener políticas de inducción.</div>
                    </div>
                </div>`;
            }

            const churnVal = (totalBajas / period / (activeEmps.length || 1) * 100);
            if (churnVal > 2.0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(239,68,68,0.08); color:#ef4444;"><i class="fa-solid fa-gauge-high"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Tasa Churn Elevada</div>
                        <div class="rz-insight-desc">Churn promedio de ${churnVal.toFixed(1)}% mensual (benchmark ideal: &lt;1.5%). Acción: Ejecutar plan de contención.</div>
                    </div>
                </div>`;
            } else {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(16,185,129,0.08); color:#10b981;"><i class="fa-solid fa-thumbs-up"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Tasa Churn Saludable</div>
                        <div class="rz-insight-desc">Tasa Churn promedio mensual de ${churnVal.toFixed(1)}% se mantiene bajo control y dentro de rangos aceptables.</div>
                    </div>
                </div>`;
            }

            const worstDept = labels[0] || 'N/A';
            const worstCount = worstDept !== 'N/A' ? deptMap[worstDept].early : 0;
            if (worstCount > 0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(139,92,246,0.08); color:#8b5cf6;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Foco Rojo: ${worstDept}</div>
                        <div class="rz-insight-desc">Concentra la mayor fuga con ${worstCount} bajas críticas en el periodo. Se sugiere diagnóstico de clima laboral.</div>
                    </div>
                </div>`;
            }

            const savings = Math.round(earlyBajas * 0.3) * 4500;
            if (savings > 0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(59,130,246,0.08); color:#3b82f6;"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Oportunidad ROI de Retención</div>
                        <div class="rz-insight-desc">Retener el 30% de fugas críticas ahorraría aprox. Q${savings.toLocaleString()} en costos de reemplazo.</div>
                    </div>
                </div>`;
            }

            const insEl = document.getElementById('retentionInsights');
            if (insEl) insEl.innerHTML = insightsHtml;

            // UPDATE STATS FOOTER
            const fEarly = document.getElementById('rzFooterEarly');
            if (fEarly) fEarly.innerText = earlyBajas.toLocaleString();
            
            const fMid = document.getElementById('rzFooterMid');
            if (fMid) fMid.innerText = midBajas.toLocaleString();
            
            const fSenior = document.getElementById('rzFooterSenior');
            if (fSenior) fSenior.innerText = seniorBajas.toLocaleString();
            
            const fTotal = document.getElementById('rzFooterTotal');
            if (fTotal) fTotal.innerText = totalBajas.toLocaleString();
            
            const fScore = document.getElementById('rzFooterScore');
            if (fScore) fScore.innerText = Math.round(avgRiskScore) + '/100';
        }
function renderTenureThermometer(uniqueEmps) {
            const listEl = document.getElementById('tenureRankingList');
            if (!listEl) return;

            const deptMap = {};
            let totalTenure = 0;
            uniqueEmps.forEach(e => {
                const dept = e.d || 'Otros';
                if (!deptMap[dept]) deptMap[dept] = { total: 0, sum: 0 };
                deptMap[dept].total++;
                const hireDateStr = e.fi || e.fechadeingreso || e.fecha_ingreso || '';
                const tVal = (typeof calcTenure === 'function') ? calcTenure(hireDateStr) : 0;
                deptMap[dept].sum += tVal;
                totalTenure += tVal;
            });

            const sorted = Object.entries(deptMap)
                .map(([name, data]) => ({ name, avg: data.sum / data.total }))
                .sort((a,b) => b.avg - a.avg);

            let html = '';
            sorted.forEach(d => {
                const color = d.avg > 4 ? '#1e3a8a' : d.avg > 2 ? '#3b82f6' : d.avg > 1 ? '#60a5fa' : '#fbbf24';
                const pct = Math.min(100, (d.avg / 6) * 100); // Scale 0-6 years
                html += `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:800; color:#475569; margin-bottom:4px;">
                            <span>${d.name}</span>
                            <span>${d.avg.toFixed(1)} a </span>
                        </div>
                        <div style="height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:${color}; border-radius:10px;"></div>
                        </div>
                    </div>
                `;
            });
            listEl.innerHTML = html;

            const globalAvg = uniqueEmps.length > 0 ? totalTenure / uniqueEmps.length : 0;
            const globEl = document.getElementById('avgTenureGlobal');
            if(globEl) {
                globEl.innerText = globalAvg.toFixed(1);
            }

            // Tenure Dist Chart
            const dist = { '0-1': 0, '1-3': 0, '3-5': 0, '5+': 0 };
            uniqueEmps.forEach(e => {
                const t = (typeof calcTenure === 'function') ? calcTenure(e.fi) : 0;
                if (t < 1) dist['0-1']++;
                else if (t < 3) dist['1-3']++;
                else if (t < 5) dist['3-5']++;
                else dist['5+']++;
            });

            const ctxDist = document.getElementById('chartTenureDist');
            if (ctxDist) {
                if (window._tenDistChart) window._tenDistChart.destroy();
                window._tenDistChart = new Chart(ctxDist, {
                    type: 'doughnut',
                    data: {
                        labels: ['0-1 yr', '1-3 yr', '3-5 yr', '5+ yr'],
                        datasets: [{
                            data: [dist['0-1'], dist['1-3'], dist['3-5'], dist['5+']],
                            backgroundColor: ['#fbbf24', '#60a5fa', '#3b82f6', '#1e3a8a'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { legend: { position: 'right', labels: { boxWidth: 8, font: { size: 9, weight: 800 } } } }
                    }
                });
            }
        }


