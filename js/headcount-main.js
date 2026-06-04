// Main Headcount tab renderer and executive charts extracted from the main HTML.

function kpiCard(label, val, icon, color, view, statusType = "up", subLabel = "", exportType = null, headerExtra = "", extraContent = "", sparkData = null, labelSize = "11px") {
                const formattedVal = (typeof val === 'number') ? val.toLocaleString('en-US') : val;
                const isClickable = (statusType === 'sub' || statusType === 'view');
                const clickAttr = isClickable ? `onclick="switchView('${view}');"` : "";
                const cursor = isClickable ? 'pointer' : 'default';
                const premiumClasses = `premium-kpi stagger-reveal ${isClickable ? 'clickable-kpi' : ''}`;
                const sparklineHtml = (Array.isArray(sparkData) && sparkData.length > 0) ? 
                    `<div class="sparkline-container" data-sparkline='${JSON.stringify(sparkData)}' id="spark_${Math.random().toString(36).substr(2, 9)}"></div>` : '';
                const excelBtn = exportType ? `
                    <button onclick="exportKpiData('${exportType}', event)" 
                            style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.05); color:#94a3b8; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.3s; z-index:10;"
                            onmouseover="this.style.background='#8b5cf6'; this.style.color='#fff';"
                            onmouseout="this.style.background='rgba(0,0,0,0.03)'; this.style.color='#94a3b8';">
                        <i class="fas fa-file-excel" style="font-size:12px;"></i>
                    </button>` : '';

                return `
                    <div class="kpi-card ${premiumClasses}" ${clickAttr} style="cursor:${cursor}; border-left: 6px solid ${color} !important;"
                         onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 15px 35px rgba(15, 23, 42, 0.12)';"
                         onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(31, 38, 135, 0.07)';">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="kpi-icon" style="pointer-events:none; color:${color}; background: ${color}10; width: 34px; height: 34px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size: 16px; border: 1.5px solid ${color}25;">${icon}</div>
                                <div class="kpi-label" style="pointer-events:none; font-size: ${labelSize}; font-weight: 1000; color: #475569; text-transform: uppercase; letter-spacing: 0.8px;">${label}</div>
                            </div>
                            ${headerExtra ? `<div style="z-index:11;">${headerExtra}</div>` : ''} 
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:2;">
                            <div class="kpi-value kpi-value-pro" style="font-size:24px; font-weight:1000; color:#1e293b; letter-spacing:-1px;">${formattedVal}</div>
                            ${subLabel ? `<div class="kpi-sub" style="font-size: 9px; font-weight: 1000; color: #94a3b8; text-transform: uppercase; letter-spacing:0.3px;">${subLabel}</div>` : ''}
                            ${extraContent ? `<div style="margin-top:6px; z-index:5;">${extraContent}</div>` : ''}
                        </div>
                        ${sparklineHtml}
                        ${excelBtn}
                    </div>
                `;
            }

            function renderSparklines() {
                const canvases = document.querySelectorAll('canvas[data-sparkline]');
                canvases.forEach(canvas => {
                    const data = JSON.parse(canvas.getAttribute('data-sparkline'));
                    const color = canvas.closest('.card-box')?.style.getPropertyValue('--accent') || '#8b5cf6';
                    
                    if (window.Chart) {
                        const newChart = new Chart(canvas.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: data.map((_, i) => i),
                                datasets: [{
                                    data: data,
                                    borderColor: color,
                                    borderWidth: 2,
                                    pointRadius: 0,
                                    fill: true,
                                    backgroundColor: color + '10',
                                    tension: 0.4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                scales: { x: { display: false }, y: { display: false } },
                                animation: { duration: 1000 }
                            }
                        });
                        if (typeof window.activeCharts !== 'undefined') window.activeCharts.push(newChart);
                    }
                });
            }

            function renderGauges(rot, ret) {
                // Implementation for small radial indicators if needed
            }

            window.showTurnoverFormula = function(bajas, hc, rot, ret, event) {
                if(event) event.stopPropagation();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Fórmula de Rotación',
                        html: `
                            <div style="text-align:left; font-family:'Montserrat',sans-serif;">
                                <p style="font-weight:700;">Rotación = (Bajas del Periodo / Headcount Total) × 100</p>
                                <hr style="margin:10px 0; opacity:0.1;">
                                <p style="font-size:14px;">Calculado como: (${bajas} / ${hc}) × 100 = <b>${rot.toFixed(2)}%</b></p>
                                <p style="font-size:14px; margin-top:8px;">Retención = <b>${ret.toFixed(2)}%</b></p>
                            </div>
                        `,
                        icon: 'info',
                        confirmButtonColor: '#8b5cf6'
                    });
                } else {
                    alert(`Fórmula de Rotación:\n(Bajas: ${bajas} / HC: ${hc}) * 100 = ${rot.toFixed(2)}%`);
                }
            };

            window.applyCostSearch = function(val) {
                window.costSearch = val;
                renderAll();
            };

            function renderGeneral(summ_obj, uniqueEmps, empsRaw) {
                
                // FALLBACK: when called without args (e.g. radar dim-tab clicks) use cached data  
                if (!uniqueEmps || !empsRaw) {
                    if (cachedEmps) {
                        uniqueEmps = cachedEmps.unique;
                        empsRaw   = cachedEmps.raw;
                    } else {
                        // No cache yet   trigger a proper full render and exit
                        requestRenderAll();
                        return;
                    }
                }
                try {
                    let vsText = "";
                    // window.activeCharts cleanup moved to renderAll for global safety

                    const { p: pais2, e: emp2, a: areaSel, d: deptoSel, y, m, countries } = getFilters();
                    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

                    // Robust Fallback: If detail is missing (common for future dates like Feb 2026), get HC fromasummary
                    let activeHC = uniqueEmps.length;
                    if (activeHC === 0 && (app.summary || []).length > 0) {
                        const sumFiltered = app.summary.filter(s => {
                            const spa = normalizePa(s.pa);
                            const matchP = countries.length === 0 || countries.includes(spa);
                            const matchDate = (y === 'ALL' || s.y == y) && compareMonth(s.m, m);
                            return matchP && (emp2 === 'ALL' || s.e === emp2) && matchDate;
                        });
                        activeHC = sumFiltered.reduce((sum, current) => sum + (Number(current.hc) || 0), 0);
                        console.log('  Using Summary Fallback HC:', activeHC);
                    }

                    const allBajas = app.bajas_list || [];

                    // 1. ALTAS (Hires for selected period + Cumulative YTD)
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
                    let hiresPeriod = hiresSet.size;

                    let hiresYTD = 0;
                    if (y !== 'ALL') {
                        const targetM = (m === 'ALL') ? 12 : parseInt(m);
                        const hiresYTDSet = new Set();
                        empsRaw.forEach(e => {
                            if (!e.fi) return;
                            const fp = e.fi.split('/');
                            if (fp.length < 3) return;
                            const fy = parseInt(fp[2]), fm = parseInt(fp[1]);
                            const curPa = normalizePa(e.pa);
                            const matchPa = countries.length === 0 || countries.includes(curPa);

                            if (compareYear(fy, y) && fm <= targetM &&
                                matchPa && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) &&
                                (deptoSel === 'ALL' || e.d === deptoSel)) {
                                hiresYTDSet.add(e.c || e.n);
                            }
                        });
                        hiresYTD = hiresYTDSet.size;
                    }

                    // 2. BAJAS (Bajas for selected period + Cumulative YTD)
                    const filteredBajas = allBajas.filter(b => {
                        if(!b) return false;
                        const curPa = b._pa || normalizePa(b.pa);
                        const matchP = countries.length === 0 || countries.includes(curPa);
                        const matchE = emp2 === 'ALL' || b.e === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.depto) === deptoSel;
                        
                        const by = b._y || b.y;
                        const bm = b._m || b.m;
                        let matchDate = (y === 'ALL' || compareYear(by, y)) && compareMonth(bm, m);
                        return matchP && matchE && matchA && matchD && matchDate;
                    });
                    let bajasPeriod = filteredBajas.length;

                    let bajasYTD = 0;
                    if (y !== 'ALL') {
                        const targetM = (m === 'ALL') ? 12 : parseInt(m);
                        bajasYTD = allBajas.filter(b => {
                            if(!b) return false;
                            const curPa = normalizePa(b.pa);
                            const matchP = countries.length === 0 || countries.includes(curPa);
                            const matchE = emp2 === 'ALL' || b.e === emp2;
                            const matchA = areaSel === 'ALL' || b.dir === areaSel;
                            const matchD = deptoSel === 'ALL' || b.d === deptoSel;
                            return matchP && matchE && matchA && matchD && compareYear(b.y, y) && compareMonth(b.m, targetM, true);
                        }).length;
                    }

                    // Heatmap logic fix
                    const heatmapEl = document.getElementById('heatmapContainer');
                    if (heatmapEl) {
                        try {
                            const matrix = {};
                            const heatYears = [...new Set(allBajas.map(b => b.y))].filter(Boolean).sort();
                            heatYears.forEach(yr => { matrix[yr] = Array(12).fill(0); });
                            
                            allBajas.forEach(b => {
                                if(b && b.y && b.m && matrix[b.y]) {
                                    let mo = parseInt(b.m);
                                    if(mo >= 1 && mo <= 12) matrix[b.y][mo-1]++;
                                }
                            });
                            
                            const matrixValues = Object.values(matrix);
                            const allVals = matrixValues.flat();
                            const maxBajas = allVals.length > 0 ? Math.max(...allVals) : 0;
                            
                            let heatHTML = '';
                            heatYears.forEach(yr => {
                                heatHTML += `<div style="display: flex; align-items: center; margin-bottom: 2px;"><span style="width:40px; font-size:10px;">${yr}</span>`;
                                matrix[yr].forEach((val, idx) => {
                                    const alpha = maxBajas > 0 ? (val / maxBajas) : 0;
                                    heatHTML += `<div title="${monthNames[idx+1]} ${yr}: ${val} bajas" style="width:15px; height:15px; margin:1px; background: rgba(255, 68, 68, ${0.1 + alpha * 0.9}); border-radius: 2px;"></div>`;
                                });
                                heatHTML += `</div>`;
                            });
                            heatmapEl.innerHTML = heatHTML || '<p style="font-size:10px; opacity:0.6;">Sin datos de bajas</p>';
                        } catch (e) {
                            console.error("Error rendering heatmap:", e);
                            heatmapEl.innerHTML = "Error al cargar gráfico";
                        }
                    }

                    // 3. HC (Payroll Detail - respect Neto/Bruto toggle)
                    const isNeto = (window._hcType === 'neto');
                    const currentPeriodBajasSet = new Set(filteredBajas.map(personKey));
                    activeHC = isNeto ? uniqueEmps.filter(e => !currentPeriodBajasSet.has(personKey(e))).length : uniqueEmps.length;

                    // Year-only filters stay as full-year totals; month filters remain monthly.



                    // --- APLY MANUAL OVERRIDES (PRIORITY) ---
                    const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                    const ovrKey = `${pais2}_${emp2}_${y}_${m} `;
                    if (overrides[ovrKey]) {
                        const o = overrides[ovrKey];
                        if (o.hc !== null) activeHC = o.hc;
                        if (o.altas !== null) hiresPeriod = o.altas;
                        if (o.bajas !== null) bajasPeriod = o.bajas;
                    }

                    // 4. CRECIMIENTO COMPARATIVO
                    // Growth Period Logic (Default 1m)
                    let growthPeriod = window.selectedGrowthPeriod || '1m';
                    if (m === 'ALL' && growthPeriod === '1m') growthPeriod = '1y';

                    const growthLabels = { '1m': 'vs. Mes Anterior', '3m': 'vs. 3 Meses', '1y': 'vs. año Paísado' };

                    let prevHC = 0;
                    if (y !== 'ALL') {
                        curM = (m === 'ALL') ? 12 : parseInt(m);
                        curY = parseInt(y);
                        let targetM, targetY;

                        if (growthPeriod === '1m') {
                            targetM = curM === 1 ? 12 : curM - 1;
                            targetY = curM === 1 ? curY - 1 : curY;
                        } else if (growthPeriod === '3m') {
                            targetM = curM - 3;
                            targetY = curY;
                            if (targetM <= 0) { targetM += 12; targetY--; }
                        } else {
                            targetM = curM;
                            targetY = curY - 1;
                        }

                        const prevPayroll = new Set(empsRaw.filter(e => compareYear(e.y, targetY) && compareMonth(e.m, targetM) &&
                            (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                            (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) &&
                            (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)
                        ).map(e => e.c || e.n)).size;
                        const prevBajas = allBajas.filter(b => compareYear(b.y, targetY) && compareMonth(b.m, targetM) &&
                            (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2) &&
                            (areaSel === 'ALL' || b.dir === areaSel || b.area === areaSel) &&
                            (deptoSel === 'ALL' || b.d === deptoSel || b.depto === deptoSel)
                        ).length;
                        prevHC = Math.max(0, prevPayroll - prevBajas);
                        vsText = `${growthLabels[growthPeriod]} (${prevHC})`;
                    } else {
                        vsText = "vs. Periodo Anterior (0)";
                    }
                    let growth = activeHC - prevHC;

                    // ACTIVE COUNTRIES: Count all that have data in the selected YEAR if period is ALL
                    const paisesSet = new Set();
                    (m === 'ALL' ? empsRaw : uniqueEmps).forEach(e => {
                        let code = normalizePa(e.pa);
                        if (code && code !== 'NAT' && code !== 'PAIS') paisesSet.add(code);
                    });
                    const paisesSize = paisesSet.size;

                    let activeColor = "var(--ac)";
                    if (paisesSize === 1 && uniqueEmps.length > 0) activeColor = getStyle(uniqueEmps[0].pa).color;

                    // New Calculation: Turnover & Retention
                    const rotPct = activeHC > 0 ? (bajasPeriod / activeHC) * 100 : 0;
                    const retPct = 100 - rotPct;
                    const rotYTD = activeHC > 0 ? (bajasYTD / activeHC) * 100 : 0;

                    // Retención Bigger numbers + rolling promedio (3/6/12m)
                    const rotPeriod = window._rotPeriod || 3;
                    let rotSumBajas = 0, rotSumHC = 0;
                    for (let ri = 0; ri < rotPeriod; ri++) {
                        let rY = targetY || parseInt(y), rM = curM - ri;
                        while (rM < 1) { rM += 12; rY--; }
                        const rBajas = allBajas.filter(b => b.y == rY && b.m == rM && (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2)).length;
                        const rHC = new Set(empsRaw.filter(e => e.y == rY && compareMonth(e.m, rM) && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2)).map(e => e.c || e.n)).size;
                        rotSumBajas += rBajas; rotSumHC += rHC;
                    }
                    const rotRolling = rotSumHC > 0 ? (rotSumBajas / rotSumHC) * 100 : 0;

                    const turnoverValue = `
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-top:2px; padding: 1px 0;">
                            <div style="flex:1;">
                                <span style="font-size:20px; font-weight:1000; color:#f43f5e; letter-spacing:-1.2px;">${rotPct.toFixed(1)}%</span>
                                <span style="font-size:10px; display:block; text-transform:uppercase; color:#94a3b8; font-weight:900; margin-top:-2px;">Rotación</span>
                            </div>
                            <div style="flex:1; text-align:right;">
                                <span style="font-size:20px; font-weight:1000; color:#10b981; letter-spacing:-1.2px;">${retPct.toFixed(1)}%</span>
                                <span style="font-size:10px; display:block; text-transform:uppercase; color:#94a3b8; font-weight:900; margin-top:-2px;">Retención</span>
                            </div>
                        </div>
                    `;

                    const formulaBtn = `
                        <div style="display:flex; gap:4px; align-items:center;">
                            <button onclick="window.showTurnoverFormula(${bajasPeriod}, ${activeHC}, ${rotPct}, ${retPct}, event)" 
                                    style="background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.15); color:var(--ac); font-size:7px; font-weight:1000; padding:2px 8px; border-radius:20px; cursor:pointer;"
                                    title="Ver Fórmula">
                                <i class="fas fa-calculator" style="font-size:8px;"></i>
                            </button>
                        </div>
                                <script>
                                    (function(){
                                        [3,6,12].forEach(p => {
                                            const btn = document.getElementById('rot_btn_' + p);
                                            if(btn) {
                                                const isSel = (window._rotPeriod === p);
                                                btn.style.background = isSel ? '#fff' : 'transparent';
                                                btn.style.color = isSel ? '#8b5cf6' : 'rgba(255,255,255,0.6)';
                                                btn.style.boxShadow = isSel ? '0 2px 8px rgba(0,0,0,0.2)' : 'none';
                                            }
                                        });
                                    })();
                                <\/script>`;

                    const periodRange = (m === 'ALL' || m === '0') ? `Ene a Dic ${y}` : `Ene a ${monthNames[m]} ${y}`;

                    updateStatusPhrase(pais2, emp2, activeHC);

                    // --- Build smart date subtitle for HC ACTIVO ---
                    let hcActivoDate = '';
                    if (m !== 'ALL' && m !== '0') {
                        hcActivoDate = `${monthNames[m]} ${y}`;
                    } else if (y !== 'ALL') {
                        hcActivoDate = `AÑO ${y}`;
                    } else {
                        // ALL years: find absolute last month with data
                        let lastY2 = 0, lastM2 = 0;
                        empsRaw.forEach(e => { const ey = parseInt(e.y), em = parseInt(e.m); if (ey > lastY2 || (ey === lastY2 && em > lastM2)) { lastY2 = ey; lastM2 = em; } });
                        hcActivoDate = lastM2 > 0 ? `${monthNames[lastM2]} ${lastY2}` : '';
                    }

                    // --- TREND CALCULATION FOR SPARKLINES (STITCH STYLE) ---
                    const hcTrendArr = [], altasTrendArr = [], bajasTrendArr = [];
                    const trendMonthsCount = 6;

                    let tY_trend = parseInt(y);
                    let tM_trend = parseInt(m);
                    
                    if (isNaN(tY_trend)) tY_trend = new Date().getFullYear();
                    if (isNaN(tM_trend) || tM_trend === 0) {
                        let maxM = 0;
                        empsRaw.forEach(e => { if(parseInt(e.y) == tY_trend && parseInt(e.m) > maxM) maxM = parseInt(e.m); });
                        tM_trend = maxM || 12;
                    }

                    for (let i = trendMonthsCount - 1; i >= 0; i--) {
                        let cTY = tY_trend, cTM = tM_trend - i;
                        while(cTM < 1) { cTM += 12; cTY--; }
                        const mE = empsRaw.filter(e => parseInt(e.y) == cTY && parseInt(e.m) == cTM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2));
                        hcTrendArr.push(new Set(mE.map(e => e.c || e.n)).size);
                        const mH = empsRaw.filter(e => {
                            if(!e.fi) return false;
                            const fp = e.fi.split('/');
                            return fp.length >= 3 && parseInt(fp[2]) == cTY && parseInt(fp[1]) == cTM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2);
                        });
                        altasTrendArr.push(mH.length);
                        const mB = allBajas.filter(b => parseInt(b.y) == cTY && parseInt(b.m) == cTM && (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2));
                        bajasTrendArr.push(mB.length);
                    }

                    const kpi0El = document.getElementById('kpi0');
                    if (kpi0El) {
                        kpi0El.innerHTML = `
                            ${kpiCard("HEADCOUNT", activeHC, '<i class="fa-solid fa-users-viewfinder"></i>', "#3b82f6", "Detalle de HC", "sub", `A ${hcActivoDate.toUpperCase()}`, "hc", "", "", hcTrendArr, "15px")}
                            ${kpiCard("ALTAS", hiresPeriod, '<i class="fa-solid fa-user-plus"></i>', "#10b981", "Detalle de Altas", "sub", `EN EL AÑO: ${hiresYTD.toLocaleString('en-US')}`, "hires", "", "", altasTrendArr, "13px")}
                            ${kpiCard("BAJAS", bajasPeriod, '<i class="fa-solid fa-user-minus"></i>', "#ef4444", "Detalle de Bajas", "sub", `EN EL AÑO: ${bajasYTD.toLocaleString('en-US')}`, "bajas", "", "", bajasTrendArr, "13px")}
                            ${kpiCard("Retención & Rotación", "", '<i class="fa-solid fa-arrows-rotate"></i>', "#8b5cf6", "Detalle de Rotación", "sub", `PROMEDIO ${rotPeriod}M: ${rotRolling.toFixed(1)}%`, null, formulaBtn, turnoverValue, null, "12px")}
                            ${kpiCard("PAÍSES ACTIVOS", paisesSize, '<i class="fa-solid fa-earth-americas"></i>', "#f59e0b", "Detalle de Paises", "sub", "PRESENCIA REGIONAL", "countries", "", "", null, "13px")}
                        `;
                    }
                    
                    // Optimization: Don't render main charts if we are deep in a sub-view
                    if (window._currentSubView && window._currentSubView !== 'General') {
                         console.log('  renderGeneral: Skipping main charts (sub-view is active)');
                         // Just update sub-header count (if applicable)
                         const sSum = document.querySelector('.sub-header-sum');
                         if (sSum) {
                             if (window._currentSubView === 'Detalle de HC') sSum.innerText = `Total: ${activeHC.toLocaleString('en-US')} Colaboradores`;
                             if (window._currentSubView === 'Detalle de Altas') sSum.innerText = `Total: ${hiresPeriod.toLocaleString('en-US')} Ingresos`;
                             if (window._currentSubView === 'Detalle de Bajas') sSum.innerText = `Total: ${bajasPeriod.toLocaleString('en-US')} Egresos`;
                         }
                         return;
                    }

                    // Trigger Sparklines, Gauges and Staggered Animation
                    setTimeout(() => {
                        renderSparklines();
                        renderGauges(rotPct, retPct);
                        document.querySelectorAll('.stagger-reveal').forEach((el, index) => {
                            el.style.animationDelay = (index * 0.1) + 's';
                        });
                    }, 50);

                    // Filtrar Tenures para solo ACTIVOS
                    const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                    const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                    const activeEmpsForTenure = uniqueEmps.filter(e => {
                        const code = e.c || e.n;
                        const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                        return !isBaja;
                    });

                    const calcTenureSafe = (emp) => {
                        if (!emp) return 0;
                        const rawTenure = Number(emp.t ?? emp.tenure ?? emp.antiguedad ?? emp.antiguedad_anios ?? emp.anios_antiguedad ?? 0);
                        if (Number.isFinite(rawTenure) && rawTenure > 0) return rawTenure;
                        const hireDate = emp.fi || emp.fecha_ingreso || emp.fechaIngreso || emp.ingreso || emp.f_ingreso || emp.hireDate;
                        if (hireDate && typeof calcTenure === 'function') {
                            const parsed = Number(calcTenure(hireDate));
                            if (Number.isFinite(parsed) && parsed > 0) return parsed;
                        }
                        return 0;
                    };
                    const tenures = activeEmpsForTenure.map(e => ({ ...e, tenure: calcTenureSafe(e) }));

                    try {
                        renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw, activeHC, bajasPeriod, filteredBajas);

                        if (typeof renderHeatmap === 'function') renderHeatmap(uniqueEmps);
                        renderHCRegistry(uniqueEmps);
                        
                        // --- Strategic Components (With Safe Checks) ---
                        if (typeof renderTenureThermometer === 'function') renderTenureThermometer(uniqueEmps);
                    } catch (e) {
                        console.error("Error in renderGeneral sub-functions:", e);
                    }

                    // === RANKINGS (DEPTOS & areaS) ===
                    try {
                        const deptCounts = {};
                        const areaCounts = {};
                        uniqueEmps.forEach(emp => {
                            const dept = emp.d || 'Sin Departamento';
                            const area = emp.dir || emp.area || 'Sin area';
                            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                            areaCounts[area] = (areaCounts[area] || 0) + 1;
                        });
                        const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
                        const sortedareas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
                        const totalForRanking = uniqueEmps.length || 1;

                        const renderRankList = (containerId, items, accentColor, chkId, defaultCount) => {
                            const container = document.getElementById(containerId);
                            if (!container) return; // SAFE CHECK
                            if (items.length === 0) { 
                                container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Sin datos</p>'; 
                                return; 
                            }
                            const showAll = document.getElementById(chkId)?.checked;
                            const displayItems = showAll ? items : items.slice(0, defaultCount);
                            const maxVal = items[0][1];
                            container.innerHTML = displayItems.map(([name, count], i) => {
                                const pct = ((count / totalForRanking) * 100).toFixed(1);
                                const barPct = ((count / maxVal) * 100).toFixed(0);
                                const medal = i === 0 ? ' ' : i === 1 ? '  ' : i === 2 ? ' ' : `<span style="font-size:10px;font-weight:900;color:#94a3b8;width:18px;display:inline-block;text-align:center;">${i + 1}</span>`;
                                return `<div class="rank-row" style="position:relative; display:flex; align-items:center; gap:10px; margin-bottom:6px; padding:6px 10px; border-radius:10px; overflow:hidden; background: #f8fafc; border:1px solid #f1f5f9; transition:0.3s; cursor:pointer;" onclick="downloadRankExcel('${chkId.replace('chkAll','')}', '${name}')" title="Click para exportar detalle de ${name}">
                                    <div style="position:absolute; top:0; left:0; height:100%; width:${barPct}%; background:${accentColor}10; transition:width 0.8s ease;"></div>
                                    <div style="position:absolute; bottom:0; left:0; height:1px; width:${barPct}%; background:${accentColor}30;"></div>
                                    <span style="min-width:22px; text-align:center; z-index:1;">${medal}</span>
                                    <div style="flex:1; min-width:0; display:flex; justify-content:space-between; align-items:center; z-index:1;">
                                        <span style="font-size:11px; font-weight:800; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;" title="${name}">${name}</span>
                                        <div style="text-align:right;">
                                            <span style="font-size:11px; font-weight:1000; color:${accentColor};">${count}</span>
                                            <span style="font-size:8px; font-weight:700; color:#94a3b8; margin-left:2px;">(${pct}%)</span>
                                        </div>
                                    </div>
                                </div>`;
                            }).join('');
                        };

                        renderRankList('rankingTop10', sortedDepts, '#8b5cf6', 'chkAllDepts', 10);
                        renderRankList('rankingTopareas', sortedareas, '#8b5cf6', 'chkAllareas', 14);
                        const bottom5 = sortedDepts.filter(d => d[1] > 0).slice(-5).reverse();
                        renderRankList('rankingBottom5', bottom5, '#ef4444', 'chkAllBottom', 5);
                    } catch (e) { console.error("Error in renderRankings:", e); }

                    // === CALENDAR HEATMAP DE BAJAS ===
                    try {
                        const calContainer = document.getElementById('calendarHeatmap');
                        if (calContainer) {
                            const allBajasHeat = (window.allBajas || app.bajas_list || []);
                            const { countries: cFilter, e: empFilter, a: areaFilter, d: deptoFilter } = getFilters();
                            const filteredBajasHeat = allBajasHeat.filter(b => {
                                const curPa = (b.pa || '').trim().toUpperCase();
                                return (cFilter.length === 0 || cFilter.includes(curPa)) &&
                                       (empFilter === 'ALL' || b.e === empFilter) &&
                                       (areaFilter === 'ALL' || b.dir === areaFilter) &&
                                       (deptoFilter === 'ALL' || b.d === deptoFilter);
                            });

                            const normalizeYear = yr => (yr > 0 && yr < 100) ? 2000 + yr : yr;
                            const yearsSet = new Set();
                            filteredBajasHeat.forEach(b => { 
                                const yr = normalizeYear(parseInt(b.y));
                                if (yr > 0) yearsSet.add(yr); 
                            });
                            const years = [...yearsSet].sort();
                            const monthNms = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                            // Build heatmap matrix
                            const matrix = {};
                            years.forEach(yr => { matrix[yr] = Array(12).fill(0); });
                            filteredBajasHeat.forEach(b => {
                                const yr = normalizeYear(parseInt(b.y));
                                const mo = parseInt(b.m);
                                if (matrix[yr] && mo >= 1 && mo <= 12) matrix[yr][mo - 1]++;
                            });

                            let maxBajas = 0;
                            years.forEach(yr => matrix[yr].forEach(v => { if (v > maxBajas) maxBajas = v; }));
                            maxBajas = maxBajas || 1;

                            const getHeatColor = (val) => {
                                if (val === 0) return '#f8fafc';
                                const intensity = val / maxBajas;
                                if (intensity < 0.2) return '#fef3c7';
                                if (intensity < 0.4) return '#fde68a';
                                if (intensity < 0.6) return '#fbbf24';
                                if (intensity < 0.8) return '#f59e0b';
                                return '#ef4444';
                            };

                            let heatHTML = '<div style="display:grid;grid-template-columns:60px repeat(12,1fr);gap:3px;min-width:500px;">';
                            // Header row
                            heatHTML += '<div style="font-size:9px;font-weight:800;color:#94a3b8;"></div>';
                            monthNms.forEach(mn => { heatHTML += `<div style="font-size:9px;font-weight:900;color:#64748b;text-align:center;padding:4px 0;">${mn}</div>`; });

                            years.forEach(yr => {
                                heatHTML += `<div style="font-size:11px;font-weight:900;color:var(--ac);display:flex;align-items:center;">${yr}</div>`;
                                matrix[yr].forEach((val, mi) => {
                                    const bg = getHeatColor(val);
                                    const textColor = val > (maxBajas * 0.5) ? '#fff' : '#475569';
                                    heatHTML += `<div style="background:${bg};border-radius:6px;padding:8px 4px;text-align:center;font-size:12px;font-weight:800;color:${textColor};cursor:pointer;transition:transform 0.2s;" 
                                                     title="${monthNms[mi]} ${yr}: ${val} bajas"
                                                     onclick="window.renderHeatmapDetail(${yr}, ${mi + 1})"
                                                     onmouseenter="this.style.transform='scale(1.1)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                                                     onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='none';">${val || '-'}</div>`;
                                });
                            });
                            heatHTML += '</div>';

                            // Legend
                            heatHTML += `<div style="display:flex;align-items:center;gap:8px;margin-top:12px;justify-content:flex-end;">
                                <span style="font-size:9px;font-weight:700;color:#94a3b8;">Menos</span>
                                <div style="width:18px;height:12px;background:#f8fafc;border-radius:3px;border:1px solid #e2e8f0;"></div>
                                <div style="width:18px;height:12px;background:#fef3c7;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#fde68a;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#fbbf24;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#f59e0b;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#ef4444;border-radius:3px;"></div>
                                <span style="font-size:9px;font-weight:700;color:#94a3b8;">mas</span>
                            </div>`;

                            calContainer.innerHTML = heatHTML;
                        }
                    } catch (e) { console.error("Error in renderCalendarHeatmap:", e); }

                    try {
                        renderHCRegistry(uniqueEmps);
                    } catch (e) { console.error("Error in renderHCRegistry:", e); }
                } catch (err) { console.error('  renderGeneral ERROR:', err); }
            }

            function renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw, activeHC_val, bajasPeriod_val, filteredBajas_list = []) {
                window.lastActiveHC = uniqueEmps;
                const f = getFilters();
                const { p: pais2, e: emp2, a: areaSel, d: deptoSel, yc, mc, comp, countries } = f;


                // --- HC TYPE SWITCH LOGIC (NETO VS BRUTO) ---
                window._hcType = window._hcType || 'neto';
                const isNeto = window._hcType === 'neto';
                
                // UI Toggle Sync (Handles multiple instances)
                const fMode = window._flagMode || 'hc';
                // Unified High-Contrast Sync for all metric button groups
                document.querySelectorAll('.hc-type-btn-neto').forEach(b => b.classList.toggle('active', isNeto));
                document.querySelectorAll('.hc-type-btn-bruto').forEach(b => b.classList.toggle('active', !isNeto));
                document.querySelectorAll('.metric-btn-hc').forEach(b => b.classList.toggle('active', fMode === 'hc'));
                document.querySelectorAll('.metric-btn-altas').forEach(b => b.classList.toggle('active', fMode === 'altas'));
                document.querySelectorAll('.metric-btn-bajas').forEach(b => b.classList.toggle('active', fMode === 'bajas'));






                // 1. Time Scope Setup (Improved Fallback for Historical Charts)
                let historyYears = [...new Set(empsRaw.map(e => parseInt(e.y)))].sort((a,b)=>b-a);
                let maxHistoryYear = historyYears[0] || 2025;
                
                // If selected year has no history, use maxHistoryYear
                let selectedY = f.y === 'ALL' ? maxHistoryYear : parseInt(f.y);
                const hasHistoryForSelected = empsRaw.some(e => e.y == selectedY);
                const targetY = hasHistoryForSelected ? selectedY : maxHistoryYear;

                let latestHistoryM = 1;
                const yearHistory = empsRaw.filter(e => e.y == targetY);
                if (yearHistory.length > 0) {
                    latestHistoryM = Math.max(...yearHistory.map(e => parseInt(e.m)));
                }
                const targetM = (f.m === 'ALL' || f.m === '0') ? latestHistoryM : parseInt(f.m);

                var z_flagsTotalEl = document.getElementById('z_flagsTotalEl');
                if(z_flagsTotalEl) {
                    z_flagsTotalEl.innerText = `(${uniqueEmps.length})`;
                }

                const countryFlagMap = { 'TYT': 'tt', 'RD': 'do', 'GT': 'gt', 'CR': 'cr', 'HN': 'hn', 'SV': 'sv', 'NC': 'ni', 'PA': 'pa', 'PY': 'py', 'JM': 'jm' };
                // COMP DATA CALCULATION
                let compCountByPa = {};
                let compCostsByPa = {};
                if (comp) {
                    const compEmps = (app.employees || []).filter(item => {
                        const nPa = normalizePa(item.pa);
                        const mPa = countries.length === 0 || countries.includes(nPa);
                        return mPa && (emp2 === 'ALL' || item.e === emp2) && (areaSel === 'ALL' || item.dir === areaSel) && (deptoSel === 'ALL' || item.d === deptoSel) && (yc === 'ALL' || item.y == yc) && (mc === 'ALL' || item.m == mc);
                    });
                    compEmps.forEach(e => {
                        let c = normalizePa(e.pa);
                        compCountByPa[c] = (compCountByPa[c] || 0) + 1;
                        compCostsByPa[c] = (compCostsByPa[c] || 0) + (Number(e.so) || 0) + (Number(e.b37) || 0) + (Number(e.b78) || 0) + (Number(e.bv) || 0) + (Number(e.he) || 0);
                    });
                }

                // CONTEXT FILTERED DATA (Reserves Empresa/area/Depto but allows all Years/Months for recovery)
                const contextEmps = empsRaw.filter(e => {
                    const curPa = normalizePa(e.pa);
                    const matchPa = countries.length === 0 || countries.includes(curPa);
                    return matchPa &&
                        (emp2 === 'ALL' ? true : e.e === emp2) &&
                        (areaSel === 'ALL' ? true : e.dir === areaSel) &&
                        (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel);
                });
                const monthNamesArr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                // currentHC = unique active employees in current period
                const currentHC = uniqueEmps.length;
                const showMap = document.getElementById('toggleMapCheck')?.checked || false;

                const mapRow = document.getElementById('mapContainerRow');
                if (mapRow) {
                    mapRow.style.display = showMap ? 'flex' : 'none';
                    mapRow.style.marginTop = '-20px';
                }

                const btnMapa = document.getElementById('btnVerMapa');
                if (btnMapa) {
                    if (showMap) {
                        btnMapa.style.background = 'linear-gradient(135deg, var(--ac), var(--ac))';
                        btnMapa.style.color = '#fff';
                        btnMapa.style.boxShadow = '0 4px 15px rgba(99,102,241,0.4)';
                    } else {
                        btnMapa.style.background = 'transparent';
                        btnMapa.style.color = '#64748b';
                        btnMapa.style.boxShadow = 'none';
                    }
                }



                // --- OPTIMIZED WORKING SET FOR ALL VISUALS ---
                let workingSet = [];
                const isAllMonths = (f.m === 'ALL' || f.m === '0');

                if (fMode === 'hc') {
                    // Year-only filters stay as full-year totals; month filters remain monthly.
                    const snapshotM = parseInt(f.m);
                    const relevantUnique = isAllMonths
                        ? uniqueEmps.filter(e => e.y == targetY)
                        : uniqueEmps.filter(e => e.y == targetY && e.m == snapshotM);
                    const relevantBajas = isAllMonths
                        ? filteredBajas_list.filter(b => b.y == targetY)
                        : filteredBajas_list.filter(b => b.y == targetY && b.m == snapshotM);
                    const currentBajasSet = new Set(relevantBajas.map(personKey));
                    workingSet = isNeto ? relevantUnique.filter(e => !currentBajasSet.has(personKey(e))) : relevantUnique;
                } else if (fMode === 'altas') {
                    // For Altas, we show aggregate for the year if ALL, or month
                    workingSet = uniqueEmps.filter(e => {
                        const matchY = e._fiY == targetY;
                        const matchM = isAllMonths ? true : e._fiM == targetM;
                        return matchY && matchM;
                    });
                } else if (fMode === 'bajas') {
                    workingSet = (app.bajas_list || []).filter(b => {
                        const matchY = b.y == targetY;
                        const matchM = isAllMonths ? true : b.m == targetM;
                        return matchY && matchM;
                    });
                }

                // Accumulators for Regional/Radar/Flags - ULTRA pass
                const countByPa = {}, countByE = {}, countByDir = {};
                for (let i = 0, len = workingSet.length; i < len; i++) {
                    const e = workingSet[i];
                    const pa = e._pa || e.pa;
                    countByPa[pa] = (countByPa[pa] || 0) + 1;

                    const matchP = (countries.length === 0 || countries.includes(pa));
                    if (!matchP) continue;

                    const eDir = e._dir || e.dir || e.area || e.DIRECCION || e.d || 'Sin area';
                    const eEmp = e._e || e.e || e.EMPRESA;
                    
                    const matchD = (areaSel === 'ALL' || eDir === areaSel);
                    const matchE = (emp2 === 'ALL' || eEmp === emp2);

                    if (matchD) {
                        if(eEmp) countByE[eEmp] = (countByE[eEmp] || 0) + 1;
                    }
                    if (matchE) {
                        countByDir[eDir] = (countByDir[eDir] || 0) + 1;
                    }
                }

                const totalFlags = Object.values(countByPa).reduce((a,b) => a+b, 0) || 0;
                if (z_flagsTotalEl) z_flagsTotalEl.innerText = `${totalFlags.toLocaleString()}`;

                // --- DYNAMIC LABELS UPDATE ---
                let metricLabel = "TOTAL HC NETO";
                if (window._flagMode === 'altas') metricLabel = "TOTAL ALTAS";
                else if (window._flagMode === 'bajas') metricLabel = "TOTAL BAJAS";
                else if (window._hcType === 'bruto') metricLabel = "TOTAL HC BRUTO";

                const rLabel = document.getElementById('regBadgeLabel');
                const dLabel = document.getElementById('distBadgeLabel');
                if (rLabel) rLabel.innerText = metricLabel;
                if (dLabel) dLabel.innerText = metricLabel.replace("TOTAL", "DISTRIBUCIÓN");

                const radarTotalSum = document.getElementById('radarTotalSum');
                if (radarTotalSum) radarTotalSum.innerText = `${totalFlags.toLocaleString()}`;


                // Header Donut & Legend Redesigned
                const donutCanv = document.getElementById('regDonutChart');
                if (donutCanv) {
                    const fullData = Object.entries(countByPa).filter(e => e[1] > 0).sort((a,b) => b[1]-a[1]);
                    
                    // Logic for Top 2 + Resto
                    let dLabels = [], dValues = [], dColors = [], legendData = [];
                    let restoHc = 0;
                    
                    fullData.forEach((e, i) => {
                        if (i < 2) {
                            dLabels.push(e[0]);
                            dValues.push(e[1]);
                            const cCol = (countryStyles[e[0]] || {color:'#cbd5e1'}).color;
                            dColors.push(cCol);
                            legendData.push({ name: (paisMap[e[0]]||e[0]).replace('Rep  ', 'R. '), val: e[1], pct: Math.round((e[1]/totalFlags)*100), color: cCol });
                        } else {
                            restoHc += e[1];
                        }
                    });
                    
                    if (restoHc > 0) {
                        dLabels.push('RESTO');
                        dValues.push(restoHc);
                        const restoCol = 'rgba(139, 92, 246, 0.15)';
                        dColors.push(restoCol);
                        legendData.push({ name: 'Resto', val: restoHc, pct: Math.round((restoHc/totalFlags)*100), color: restoCol });
                    }

                    // Centered percentage (Top 2 combined)
                    const top2Pct = legendData.slice(0, 2).reduce((acc, curr) => acc + parseFloat(curr.pct), 0);
                    const regDonutPct = document.getElementById('regDonutPct');
                    if (regDonutPct) regDonutPct.innerText = `${Math.round(top2Pct)}%`;

                    window.activeCharts.push(new Chart(donutCanv.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: dLabels,
                            datasets: [{ data: dValues, backgroundColor: dColors, borderWidth: 0, hoverOffset: 4 }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '75%',
                            plugins: { legend: { display: false }, tooltip: { enabled: true } }
                        }
                    }));

                    const regLegend = document.getElementById('regLegend');
                    if (regLegend) {
                        regLegend.innerHTML = legendData.map(d => `
                            <div class="reg-legend-item">
                                <div class="reg-legend-tag">
                                    <div class="reg-legend-dot" style="background:${d.color}"></div>
                                    <span style="white-space:nowrap;">${d.name}</span>
                                </div>
                                <span class="reg-legend-val">${d.pct}%</span>
                            </div>
                        `).join('');
                    }
                }

                const radarTitleEl = document.getElementById('radarTitleEl');
                if (radarTitleEl) radarTitleEl.innerText = fMode === 'altas' ? 'RADAR: ALTAS' : (fMode === 'bajas' ? 'RADAR: BAJAS' : `DISTRIBUCIÓN Proporcional`);

                const priorityCountries = ['GT', 'CR', 'HN', 'SV', 'NC', 'PA', 'PY', 'JM', 'TYT', 'RD'];
                const countryGrid = document.getElementById('countryGrid');
                if (countryGrid) {
                    const showNoMovementCountries = !!document.getElementById('toggleNoMovementCheck')?.checked;
                    const noMovementBtn = document.getElementById('btnSinMov');
                    if (noMovementBtn) noMovementBtn.classList.toggle('active', showNoMovementCountries);
                    const sortedCountries = priorityCountries
                        .map(c => ({ code: c, val: countByPa[c] || 0 }))
                        .filter(({ code, val }) => code !== 'RD' || val > 0 || showNoMovementCountries)
                        .sort((a, b) => b.val - a.val);

                    const totalFlags = priorityCountries.reduce((a, c) => a + (countByPa[c] || 0), 0) || 1;
                    countryGrid.innerHTML = sortedCountries.map(({ code: c, val }) => {
                        const st = getStyle(c);
                        const isSel = window.selectedCountries.includes(c);
                        const pct = ((val / totalFlags) * 100).toFixed(1);
                        const bgCol = st.color ? st.color + '18' : 'rgba(0,0,0,0.05)';
                        const paCode = countryFlagMap[c] || c;

                        // MoM Trend logic
                        let pm = m === 'ALL' ? (window.lastM || 1) : parseInt(m);
                        let py = m === 'ALL' ? (window.lastY || 2026) : parseInt(y);
                        let prevPm = pm - 1; let prevPy = py;
                        if (prevPm === 0) { prevPm = 12; prevPy -= 1; }
                        const prevMoEmps = empsRaw.filter(e => {
                            const matchPa = normalizePa(e.pa) === c;
                            const matchDate = (e.y == prevPy && parseInt(e.m) == prevPm);
                            const matchE = (emp2 === 'ALL' || e.e === emp2 || e.EMPRESA === emp2);
                            const matchA = (areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel);
                            const matchD = (deptoSel === 'ALL' || (e.d || e.depto || e.DEPARTAMENTO) === deptoSel);
                            return matchPa && matchDate && matchE && matchA && matchD;
                        });
                        const diff = val - prevMoEmps.length;
                        
                        let trendHtml = `<div class="country-trend neutral"><i class="fas fa-minus"></i> 0</div>`;
                        if (diff > 0) trendHtml = `<div class="country-trend up"><i class="fas fa-caret-up"></i> +${diff}</div>`;
                        else if (diff < 0) trendHtml = `<div class="country-trend down"><i class="fas fa-caret-down"></i> ${diff}</div>`;

                        // Update Main Section Subtitle
                        const monthNamesFull = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                        const prevMonthName = monthNamesFull[(prevPm - 1 + 12) % 12];
                        const subHeader = document.getElementById('regionalSubTitle');
                        if (subHeader) subHeader.innerHTML = `Colaboradores en nomina <span style="font-weight:400; font-size:11px; opacity:0.6; margin-left:8px;">(Versus ${prevMonthName})</span>`;

                        return `
                            <div class="country-card ${isSel ? 'active' : ''}" onclick="toggleCountry('${c}')">
                                <div style="position: absolute; top: 10px; right: 10px; transform: scale(0.9);">
                                    ${trendHtml}
                                </div>
                                <div style="display:flex; align-items:center; justify-content:center; width:100%; margin-bottom: 6px; margin-top: 4px; flex-shrink: 0;">
                                    <div style="background: #fff; border-radius:6px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); padding: 3px;">
                                        <img src="https://flagcdn.com/w160/${paCode.toLowerCase()}.png" class="country-card-flag" alt="${c}" onerror="this.src='https://flagcdn.com/w160/un.png'" style="width:40px; height:28px; flex-shrink:0; border-radius: 4px; display:block; object-fit: cover;">
                                    </div>
                                </div>
                                <div class="country-card-name" style="margin-top: 4px; font-size: 11px; font-weight: 1000; letter-spacing: 0.5px; color:#64748b; flex-shrink: 0;">${(paisMap[c] || c).replace('Rep  ', 'R. ')}</div>
                                <div class="country-card-val" style="display: block !important; font-size: 26px !important; margin: 4px 0 !important; font-weight: 1000 !important; color: #1e293b !important; opacity: 1 !important; line-height: 1; flex-shrink: 0;">${val || '0'}</div>
                                <div class="country-card-footer" style="width: 100%; margin-top: auto; padding: 0 4px; flex-shrink: 0;">
                                    <div class="country-card-progress" style="background: ${bgCol}; height:10px; border-radius:10px;">
                                        <div class="country-card-bar" style="width: ${pct}%; height:100%; border-radius:10px; background: linear-gradient(90deg, ${st.color}, ${st.color}cc);"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // --- RADAR REGIONAL (Segmentador HC Real) ---
                try {
                    const ctxRadarReg = document.getElementById('radarRegional');
                    if (ctxRadarReg) {
                        const dim = window._radarDim || 'pa';
                        
                        // Sync active link
                        document.querySelectorAll('.radar-dim-link').forEach(el => el.style.color = '#64748b');
                        const dimLinkMap = { 'pa': 'dimPa', 'e': 'dimE', 'dir': 'dimDir' };
                        const activeDimLink = document.getElementById(dimLinkMap[dim]);
                        if (activeDimLink) activeDimLink.style.color = '#8b5cf6';

                        const dataMap = {};
                        workingSet.forEach(e => {
                            let key = '';
                            if (dim === 'pa') key = normalizePa(e.pa);
                            else if (dim === 'e') key = e.e || 'N/A';
                            else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                            if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                        });
                        const sorted = Object.entries(dataMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
                        if (sorted.length > 0) {
                            const labels = sorted.map(([k,v]) => {
                                if(dim==='pa') return (paisMap[k]||k).substring(0,12);
                                return k.substring(0,14);
                            });
                            const values = sorted.map(([,v])=>v);
                            const colors = sorted.map(([k]) => {
                                if(dim==='pa') return (window.countryStyles||{})[k]?.color || '#6366f1';
                                const p=['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
                                return p[sorted.indexOf(sorted.find(x=>x[0]===k)) % p.length];
                            });
                            window.activeCharts.push(new Chart(ctxRadarReg.getContext('2d'), {
                                type: 'radar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'HC',
                                        data: values,
                                        backgroundColor: colors.map(c => c + '33'),
                                        borderColor: colors,
                                        borderWidth: 3,
                                        pointRadius: 4,
                                        pointBackgroundColor: '#fff'
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        datalabels: {
                                            display: true, anchor: 'center', align: 'center',
                                            color: '#1e293b', font: { size: 10, weight: 1000 },
                                            formatter: (v) => v.toLocaleString()
                                        }
                                    },
                                    scales: {
                                        r: {
                                            ticks: { display: false },
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            angleLines: { color: 'rgba(0,0,0,0.05)' },
                                            pointLabels: { font: { size: 10, weight: 800, family: 'Montserrat' }, color: '#334155' }
                                        }
                                    },
                                    animation: false
                                },
                                plugins: [ChartDataLabels]
                            }));
                        }
                    }
                } catch (e) { console.error('radarRegional error:', e); }

                // --- CAMBIO 2: Premium HTML-Based List (DISTRIBUCIÓN Proporcional) ---
                const ctxDistProp = document.getElementById('chartDistPropBar');
                if (ctxDistProp) {
                    try {
                        const dim = window._distPropDim || 'e';
                        let dataMap = {};
                        
                        // Active dimension sync
                        document.querySelectorAll('.dist-prop-link').forEach(el => el.classList.remove('active'));
                        const dimIdMap = { 'pa': 'dpDimPa', 'e': 'dpDimE', 'dir': 'dpDimDir', 'd': 'dpDimD' };
                        if(document.getElementById(dimIdMap[dim])) document.getElementById(dimIdMap[dim]).classList.add('active');

                        // Data Aggregation (Uses workingSet)
                        workingSet.forEach(e => {
                            let key = '';
                            if (dim === 'pa') key = normalizePa(e.pa);
                            else if (dim === 'e') key = e.e || 'N/A';
                            else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                            else if (dim === 'd') key = e.d || e.depto || 'N/A';
                            
                            if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                        });

                        // Sorting (Major a Menor) & Rendering
                        const gridContainer = document.getElementById('distGridContainer');
                        if (gridContainer) {
                            const totalAll = Object.values(dataMap).reduce((a, b) => a + b, 0) || 1;
                            const sortedEntries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);

                            // 1. UPDATE LARGE DONUT (LEFT)
                            const ctxBigDonut = document.getElementById('chartDistPropDonutBig');
                            if (ctxBigDonut) {
                                const labels = sortedEntries.map(e => e[0]);
                                const values = sortedEntries.map(e => e[1]);
                                const colors = sortedEntries.map(e => {
                                    if (dim === 'pa') return (getStyle(e[0]).color || '#8b5cf6');
                                    // Use a varied palette for non-country dimensions
                                    const palettes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f472b6'];
                                    return palettes[labels.indexOf(e[0]) % palettes.length];
                                });

                                window.activeCharts.push(new Chart(ctxBigDonut.getContext('2d'), {
                                    type: 'doughnut',
                                    data: {
                                        labels: labels,
                                        datasets: [{
                                            data: values,
                                            backgroundColor: colors,
                                            borderWidth: 4,
                                            borderColor: '#ffffff',
                                            hoverBorderWidth: 5,
                                            hoverBorderColor: '#ffffff',
                                            hoverOffset: 18,
                                            spacing: 3
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '66%',
                                        layout: {
                                            padding: 20
                                        },
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true },
                                            datalabels: {
                                                display: (ctx) => {
                                                    const val = ctx.dataset.data[ctx.dataIndex];
                                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                                    return (val / total) > 0.04; // Umbral del 4% para mostrar etiqueta
                                                },
                                                color: '#fff',
                                                font: { weight: '1000', size: 14, family: "'Montserrat', sans-serif" }, 
                                                textShadowBlur: 4,
                                                textShadowColor: 'rgba(0,0,0,0.4)',
                                                formatter: (val, ctx) => {
                                                    const label = ctx.chart.data.labels[ctx.dataIndex];
                                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                                    const pct = Math.round((val / total) * 100);
                                                    const shortLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
                                                    return shortLabel + '\n' + pct + '%';
                                                },
                                                padding: 6,
                                                textAlign: 'center',
                                                align: 'center',
                                                anchor: 'center'
                                            }
                                        },
                                        animation: false
                                    },
                                    plugins: [ChartDataLabels]
                                }));
                                if (document.getElementById('distPropTotalLarge')) document.getElementById('distPropTotalLarge').innerText = totalAll.toLocaleString();
                            }

                            // 2. UPDATE CARDS (RIGHT)
                            gridContainer.innerHTML = sortedEntries.map(([k, val], idx) => {
                                const pct = (val / totalAll * 100).toFixed(0);
                                const st = (dim === 'pa') ? getStyle(k) : { 
                                    color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f472b6'][idx % 7] 
                                };
                                const fullName = (dim === 'pa') ? (paisMap[k] || k).toUpperCase() : k.toUpperCase();
                                
                                return `
                                    <div class="dist-card-premium" style="display:flex; align-items:center; gap:15px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.05); animation: fadeInRight 0.5s ease both ${idx * 0.05}s;">
                                        <div style="width:6px; height:52px; background:${st.color}; border-radius:12px; box-shadow:0 8px 18px ${st.color}33;"></div>
                                        <div style="flex:1; min-width:0;">
                                            <div style="font-size:13px; font-weight:1000; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fullName}</div>
                                            <div style="display:flex; align-items:baseline; gap:6px; margin-top:2px;">
                                                <span style="font-size:22px; font-weight:1000; color:#1e293b; line-height:1;">${val.toLocaleString()}</span>
                                                <span style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase;">COLABORADORES</span><span class="dist-card-pct">${pct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('');
                            
                            // 3. UPDATE SUMMARY BAR (BOTTOM)
                            const dimLabelMap = { 'pa': 'PAISES', 'e': 'EMPRESAS', 'dir': 'DIRECCIONES', 'd': 'DEPTOS' };
                            const dimLabel = dimLabelMap[dim] || 'DIMENSIONES';
                            
                            if (document.getElementById('distSummaryTotal')) document.getElementById('distSummaryTotal').innerText = totalAll.toLocaleString();
                            if (document.getElementById('distSummaryDims')) document.getElementById('distSummaryDims').innerText = sortedEntries.length;
                            if (document.getElementById('distSummaryDimsLabel')) document.getElementById('distSummaryDimsLabel').innerText = `${dimLabel} | DESGLOSE ACTIVO`;
                            if (document.getElementById('distPropTotal')) document.getElementById('distPropTotal').innerText = totalAll.toLocaleString();
                            
                            // Hide legacy items
                            ctxDistProp.style.display = 'none';
                        }
                    } catch (e) { console.error("DistProp Premium Render failed:", e); }
                }

                // --- CAMBIO 3: 5-Axis Talent Radar & Insights ---
                const ctxTalent = document.getElementById('chartTalentRadar');
                if (ctxTalent) {
                    try {
                        // Calculate Radar Metrics
                        const totalHC = uniqueEmps.length || 1;
                        const isAllM = (f.m === 'ALL' || f.m === '0');
                        const altas = uniqueEmps.filter(e => e._fiY == targetY && (isAllM ? true : e._fiM == targetM)).length;
                        const bajas = (app.bajas_list || []).filter(b => b.y == targetY && (isAllM ? true : b.m == targetM)).length;
                        
                        // 1. Altas Ratio (Altas / HC) scaled to 0-100
                        const altasScore = Math.min((altas / totalHC) * 500, 100); 
                        // 2. Bajas Ratio (Inverse: Low bajas = High score)
                        const bajasScore = Math.max(100 - (bajas / totalHC) * 500, 0);
                        // 3. Turnover (Inverse: Low turnover = High score)
                        const turnover = (bajas / totalHC) * 100;
                        const turnoverScore = Math.max(100 - (turnover * 5), 0);
                        // 4. Estabilidad (HC that stayed)
                        const stability = ((totalHC - bajas) / totalHC) * 100;
                        const stabilityScore = stability;
                        // 5. Crecimiento (Net change)
                        const growth = ((altas - bajas) / totalHC) * 100;
                        const growthScore = 50 + (growth * 2.5); // 50 is baseline

                        const radarData = [altasScore, bajasScore, turnoverScore, stabilityScore, growthScore];
                        const labels = ['ALTAS', 'Retención (INV. BAJAS)', 'FIDELIDAD (INV. TO)', 'ESTABILIDAD', 'CRECIMIENTO'];

                        window.activeCharts.push(new Chart(ctxTalent.getContext('2d'), {
                            type: 'radar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Más de Talento',
                                    data: radarData,
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                    borderColor: '#8b5cf6',
                                    borderWidth: 3,
                                    pointBackgroundColor: '#8b5cf6',
                                    pointBorderColor: '#fff',
                                    pointRadius: 5
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    r: {
                                        min: 0,
                                        max: 100,
                                        ticks: { display: false },
                                        pointLabels: {
                                            font: { size: 10, weight: 800, family: 'Montserrat' },
                                            color: '#64748b'
                                        },
                                        grid: { color: 'rgba(99,102,241,0.1)' }
                                    }
                                },
                                plugins: { legend: { display: false } }
                            }
                        }));

                        // Automated Insights logic
                        const insCont = document.getElementById('talentInsights');
                        if (insCont) {
                            let html = '';
                            const scoreAvg = radarData.reduce((a,b)=>a+b,0) / 5;
                            const status = scoreAvg > 75 ? 'Healthy' : (scoreAvg > 50 ? 'Stable' : 'Critical');
                            const statusCol = scoreAvg > 75 ? '#10b981' : (scoreAvg > 50 ? '#f59e0b' : '#ef4444');
                            
                            if(document.getElementById('talentScoreLabel')) {
                                document.getElementById('talentScoreLabel').innerText = status;
                                document.getElementById('talentScoreLabel').style.color = statusCol;
                            }

                            // Growth Insight
                            if (growth > 0) {
                                html += `<div class="insight-pill positive"><i class="fas fa-arrow-trend-up"></i><div>Crecimiento Neto Positivo: El equipo se expandi  un <b>${growth.toFixed(1)}%</b> este periodo.</div></div>`;
                            } else if (growth < 0) {
                                html += `<div class="insight-pill danger"><i class="fas fa-arrow-trend-down"></i><div>Contracci  de Equipo: Reducci  neta del <b>${Math.abs(growth).toFixed(1)}%</b> detected.</div></div>`;
                            }

                            // Turnover Insight
                            if (turnover < 2) {
                                html += `<div class="insight-pill positive"><i class="fas fa-check-circle"></i><div>Fidelidad Alta: Rotación mensual controlada por debajo del benchmark (<b>${turnover.toFixed(1)}%</b>).</div></div>`;
                            } else {
                                html += `<div class="insight-pill warning"><i class="fas fa-exclamation-triangle"></i><div>Alerta de Salidas: Rotación de <b>${turnover.toFixed(1)}%</b> requiere revisi  de clima.</div></div>`;
                            }

                            // Stability Insight
                            if (stability > 98) {
                                html += `<div class="insight-pill positive"><i class="fas fa-shield-alt"></i><div>N  Estable: El <b>${stability.toFixed(1)}%</b> de la fuerza laboral se mantiene firme.</div></div>`;
                            }

                            insCont.innerHTML = html;
                        }

                    } catch (e) { console.error("Talent Radar failed:", e); }
                }


                // Composition HC por Pais (LINE CHART)
                const ctxareaComp = document.getElementById('chartCompositionarea');
                if (ctxareaComp) {
                    try {
                        const vLen = window._hcViewLength || 6;
                        const labels = [];
                        const datasets = [];
                        const fColors = {
                             'GT': '#3b82f6', 'PA': '#ef4444', 'SV': '#6366f1', 'HN': '#0ea5e9', 
                             'NI': '#38bdf8', 'CR': '#f43f5e', 'DO': '#2563eb', 'US': '#1e293b',
                             'PY': '#F97316', 'TT': '#94A3B8'
                        };
                        const pMap = {
                            'GT': 'Guatemala', 'PA': 'Panamá', 'SV': 'El Salvador', 'HN': 'Honduras',
                            'NI': 'Nicaragua', 'CR': 'Costa Rica', 'DO': 'Rep. Dominicana', 'US': 'USA',
                            'PY': 'Paraguay', 'TT': 'Trinidad & Tobago'
                        };
                        const mShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                        const allPaCodes = [...new Set(empsRaw.map(e => normalizePa(e.pa)))].filter(c => c && c !== 'PENDIENTE').sort();
                        const countryDataArr = {};
                        allPaCodes.forEach(c => countryDataArr[c] = []);

                        for (let i = 0; i < vLen; i++) {
                            let cY = targetY, cM = targetM - (vLen - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            labels.push(mShort[cM - 1]);
                            
                            allPaCodes.forEach(c => {
                                const s = new Set();
                                for (let j = 0; j < empsRaw.length; j++) {
                                    const e = empsRaw[j];
                                    if (e.y == cY && e.m == cM && normalizePa(e.pa) === c && (emp2 === 'ALL' || e.e === emp2)) s.add(e.c || e.n);
                                }
                                countryDataArr[c].push(s.size);
                            });
                        }

                        const datasetsMapArr = allPaCodes.map(c => {
                            const bColor = fColors[c] || '#94a3b8';
                            return {
                                label: pMap[c] || c,
                                data: countryDataArr[c],
                                fill: false,
                                borderColor: bColor,
                                borderWidth: 4,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                tension: 0.4,
                                datalabels: {
                                    display: (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 && ctx.dataset.data[ctx.dataIndex] > 0,
                                    align: 'end',
                                    anchor: 'end',
                                    color: bColor,
                                    font: { weight: 1000, size: 10 },
                                    formatter: (v) => v
                                }
                            };
                        });

                        window.activeCharts.push(new Chart(ctxareaComp.getContext('2d'), {
                            type: 'line',
                            plugins: [ChartDataLabels],
                            data: { labels, datasets: datasetsMapArr },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        titleFont: { size: 13, weight: 800 },
                                        bodyFont: { size: 11, weight: 600 },
                                        padding: 12,
                                        cornerRadius: 10,
                                        callbacks: {
                                            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.03)' },
                                        ticks: { font: { size: 10, weight: 700 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { font: { size: 10, weight: 800 } }
                                    }
                                }
                            }
                        }));

                        // Update Legend and Total HC
                        const lastMonthData = allPaCodes.map(c => ({
                            code: c,
                            label: pMap[c] || c,
                            value: countryDataArr[c][vLen - 1],
                            color: fColors[c] || '#94a3b8'
                        })).sort((a, b) => b.value - a.value);

                        const totalLast = lastMonthData.reduce((s, v) => s + v.value, 0);
                        const totalEl = document.getElementById('compHeaderTotal');
                        if (totalEl) totalEl.querySelector('h4').innerText = totalLast.toLocaleString();

                        const legendContainer = document.getElementById('areaCompLegend');
                        if (legendContainer) {
                            legendContainer.innerHTML = lastMonthData.map(d => {
                                const pct = totalLast > 0 ? ((d.value / totalLast) * 100).toFixed(1) : '0.0';
                                return `
                                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; background:#f8fafc; border-radius:10px; border-left:4px solid ${d.color}; border-bottom: 1px solid #e2e8f0; min-height:48px;">
                                        <div style="display:flex; flex-direction:column; overflow:hidden;">
                                            <span style="font-size:11px; font-weight:800; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.label}</span>
                                            <span style="font-size:10px; font-weight:700; color:#64748b;">${pct}%</span>
                                        </div>
                                        <div style="font-size:12px; font-weight:1000; color:${d.color};">${d.value}</div>
                                    </div>
                                `;
                            }).join('');
                        }
                    } catch (e) { console.error("Composition area Chart failed:", e); }
                }

                // New Headcount Comparative Charts for HC Tab
                const ctxYoY = document.getElementById('chartAcumuladoYoY');
                if (ctxYoY) {
                    const curY = parseInt(targetY) || 2026;
                    const prevY = curY - 1;
                    const curD = Array(12).fill(0), prevD = Array(12).fill(0);
                    empsRaw.forEach(e => {
                        const curPa = normalizePa(e.pa);
                        const matchP = (countries.length === 0 || countries.includes(curPa));
                        const matchE = (emp2 === 'ALL' || e.e === emp2);
                        
                        let ey = parseInt(e._y || e.y || 0);
                        if(ey < 100) ey += 2000;
                        let em = parseInt(e._m || e.m || 1);
                        
                        if (matchP && matchE) {
                            if (ey === curY) {
                                if(em >= 1 && em <= 12) curD[em - 1]++;
                            } else if (ey === prevY) {
                                if(em >= 1 && em <= 12) prevD[em - 1]++;
                            }
                        }
                    });
                    let cS = 0, pS = 0;
                    const cA = curD.map(v => { cS += v; return cS; });
                    const pA = prevD.map(v => { pS += v; return pS; });
                    window.activeCharts.push(new Chart(ctxYoY.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                            datasets: [
                                { label: String(curY), data: cA, borderColor: '#8b5cf6', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
                                { label: String(prevY), data: pA, borderColor: '#94a3b8', borderDash: [5,5], fill: false, tension: 0.4 }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                    }));
                }

                const ctxareaReal2Main = document.getElementById('chartClassic14areas');
                if (ctxareaReal2Main) {
                    const dCounts = {};
                    uniqueEmps.forEach(e => { const d = e.dir || e.area || 'Sin area'; dCounts[d] = (dCounts[d] || 0) + 1; });
                    const topDir = Object.entries(dCounts).sort((a,b) => b[1]-a[1]).slice(0, 10);
                    window.activeCharts.push(new Chart(ctxareaReal2Main.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: topDir.map(d => d[0]),
                            datasets: [{
                                data: topDir.map(d => d[1]),
                                backgroundColor: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#14b8a6','#64748b']
                            }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9, weight: 700 } } } } }
                    }));
                }
                // Define DrawMap as a child of renderExecutiveCharts to access localized data
                // --- PREMIUmasVG MAP INTEGRATION ---
                window.drawMap = (data) => {
                    const mapEl = document.getElementById('mapRegionCtx');
                    if (!mapEl) return;

                    const countryCounts = Object.assign({}, countByPa || {});
                    const mapCountries = ['GT', 'CR', 'HN', 'SV', 'NC', 'NI', 'PA', 'PN', 'PY', 'JM', 'TYT', 'TT', 'RD', 'DO', 'BZ', 'CO', 'HT', 'PR', 'CU'];

                    if (!Object.keys(countryCounts).length) {
                        const empsToUse = data || uniqueEmps || [];
                        empsToUse.forEach(e => {
                            const pa = normalizePa(e.pa || e.p);
                            if (pa) countryCounts[pa] = (countryCounts[pa] || 0) + 1;
                        });
                    }

                    const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                    mapCountries.forEach(c => {
                        const ovrKey = `${c}_${emp2}_${y}_${m}`;
                        if (overrides[ovrKey] && overrides[ovrKey].hc !== null) {
                            countryCounts[c] = overrides[ovrKey].hc;
                        }
                    });

                    const legendHtml = `
                            <div style="position:absolute; bottom:16px; left:16px; z-index:10; pointer-events:none;">
                                <div class="map-legend">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:12px; height:12px; border-radius:3px; background:var(--ac);"></div>
                                        <span style="font-size:10px; font-weight:800; color:#475569;">Con Operación</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:12px; height:12px; border-radius:3px; background:#e8e8e0; border:1px solid #cbd5e1;"></div>
                                        <span style="font-size:10px; font-weight:800; color:#94a3b8;">Sin Operación</span>
                                    </div>
                                </div>
                            </div>`;

                    mapEl.innerHTML = `
                        <div class="map-container" style="position:relative; height:100%; min-height:440px; background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%); border-radius:20px;">
                            <div id="asysAmMap" style="width:100%; height:100%; min-height:440px;"></div>
                            <svg id="asysRegionalSvg" style="display:none; width:100%; height:100%; min-height:440px;"></svg>
                            ${legendHtml}
                        </div>
                    `;

                    const svgEl = document.getElementById('asysRegionalSvg');
                    const amEl = document.getElementById('asysAmMap');

                    const showSvgFallback = () => {
                        if (amEl) amEl.style.display = 'none';
                        if (svgEl) {
                            svgEl.style.display = 'block';
                            try { renderPremiumRegionalMap('asysRegionalSvg', countryCounts); } catch (e) { console.error('[MAP] SVG:', e); }
                        }
                    };

                    renderAmChartsMap('asysAmMap', countryCounts, (ok) => {
                        if (!ok) showSvgFallback();
                    });
                };

                if (showMap) {
                    drawMap(uniqueEmps);
                }

                // 3. Resumen Altas/Bajas (Doughnut)
                const hiresCount = hiresSet.size;
                const bajasList = app.bajas_list || [];
                const periodBajas = bajasList.filter(b => {
                    let match = true;
                    if (countries.length > 0 && !countries.includes(normalizePa(b.pa))) match = false;
                    if (emp2 !== 'ALL' && b.e !== emp2) match = false;
                    if (y !== 'ALL' && b.y != y) match = false;
                    if (m !== 'ALL' && !compareMonth(b.m, m)) match = false;
                    return match;
                });
                const bajasCount = periodBajas.length;

                const lblHC = document.getElementById('resumenHCLabel');
                if (lblHC) lblHC.innerText = currentHC.toLocaleString();
                const lblAltas = document.getElementById('lblAltasMes');
                if (lblAltas) lblAltas.innerText = '+' + hiresCount;
                const lblBajas = document.getElementById('lblBajasMes');
                if (lblBajas) lblBajas.innerText = '-' + bajasCount;



                const ctxRes = document.getElementById('chartResumenAB');

                if (ctxRes) {
                    window.activeCharts.push(new Chart(ctxRes.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Activos', 'Capacidad Restante'],
                            datasets: [{
                                data: [currentHC, Math.max(1, Math.round(currentHC * 0.15))],
                                backgroundColor: ['#8b5cf6', '#ede9fe'],
                                borderWidth: 0,
                                cutout: '80%',
                                borderRadius: 20
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                            animation: { animateScale: true, animateRotate: true }
                        }
                    }));
                }

                const vLenHeader = window._hcViewLength || 6;
                const hcTrendPeriodElHeader = document.getElementById('hcTrendPeriod');
                if (hcTrendPeriodElHeader) hcTrendPeriodElHeader.textContent = vLenHeader;

                // Point 10: Toggle button styles
                                                if (typeof window.updateHCBtnStyles === 'function') window.updateHCBtnStyles();


                // --- 0. DATA PREPARATION (FIXED & ROLLING) ---
                const trendData = Array(12).fill(0);
                const monthlyAltas = Array(12).fill(0);
                const monthlyBajas = Array(12).fill(0);

                // Use let to avoid redeclaration issues across re-renders if necessary, 
                // though renderExecutiveCharts is usually fresh. 
                // However, the linter caught a duplicate.
                let vLenRoll = window._hcViewLength || 6;
                let vLenOldRoll = window._hcViewLengthOld || 6;

                // Update trend card headers
                const hcTrendPeriodEl_2 = document.getElementById('hcTrendPeriod');
                if (hcTrendPeriodEl_2) hcTrendPeriodEl_2.innerText = vLenRoll;
                const hcTrendOldPeriodEl = document.getElementById('hcTrendOldPeriod');
                if (hcTrendOldPeriodEl) hcTrendOldPeriodEl.innerText = vLenOldRoll;


                // (targetY and targetM are now defined at the top)

                // Populate Annual logic
                for (let month = 1; month <= 12; month++) {
                    let count = 0;
                    const seen = new Set();
                    for (let i = 0; i < empsRaw.length; i++) {
                        const e = empsRaw[i];
                        if (e.y == targetY && compareMonth(e.m, month) &&
                            (countries.length === 0 || countries.includes(normalizePa(e.pa))) &&
                            (emp2 === 'ALL' || e.e === emp2) &&
                            (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) &&
                            (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)) {
                            seen.add(e.c || e.n);
                        }
                    }
                    trendData[month - 1] = seen.size;
                }

                const seenHires = new Set();
                empsRaw.forEach(e => {
                    if ((countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                        (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)) {
                        if (e.fi) {
                            const parts = e.fi.split('/');
                            if (parts.length >= 3 && parseInt(parts[2]) == targetY) {
                                const mIdx = parseInt(parts[1]);
                                const personKey = (e.c || e.n) + "|" + e.fi;
                                if (mIdx >= 1 && mIdx <= 12 && !seenHires.has(personKey)) {
                                    monthlyAltas[mIdx - 1]++;
                                    seenHires.add(personKey);
                                }
                            }
                        }
                    }
                });

                const bajasArray = app.bajas_list || [];
                bajasArray.forEach(b => {
                    if ((countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2) &&
                        (areaSel === 'ALL' || b.dir === areaSel || b.area === areaSel) && (deptoSel === 'ALL' || b.d === deptoSel || b.depto === deptoSel)) {
                        if (b.y == targetY && b.m >= 1 && b.m <= 12) monthlyBajas[b.m - 1]++;
                    }
                });

                // Rolling Window  
                const dLabels = []; const dTotal = []; const dAltas = []; const dBajas = [];
                const vLenRollAB = window._hcViewLength || 6;
                const hcTrendEndY = targetY;
                const hcTrendEndM = window._hcMirrorMode ? 12 : targetM;

                for (let i = 0; i < vLenRollAB; i++) {
                    let checkY = hcTrendEndY;
                    let checkM = hcTrendEndM - (vLenRollAB - 1 - i);
                    while (checkM < 1) { checkM += 12; checkY--; }
                    dLabels.push(monthNamesArr[checkM - 1] + (checkY !== hcTrendEndY ? " '" + String(checkY).slice(-2) : ""));

                    let c = 0; const s = new Set();
                    for (let j = 0; j < empsRaw.length; j++) {
                        const e = empsRaw[j];
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                        const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                        if (e.y == checkY && compareMonth(e.m, checkM) && matchPa && matchE && matchA && matchD) s.add(e.c || e.n);
                    }
                    
                    // Filter bajas for the period (intelligent net count)
                    const bSet = new Set((app.bajas_list || []).filter(b => {
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                        const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                        return b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD;
                    }).map(b => b.c || b.n));

                    const netCount = Array.from(s).filter(id => !bSet.has(id)).length;

                    // Push value based on Neto/Bruto mode
                    dTotal.push(isNeto ? netCount : s.size);

                    let ra = 0; const seenR = new Set();
                    for (let j = 0; j < empsRaw.length; j++) {
                        const e = empsRaw[j];
                        const pKey = (e.c || e.n);
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                        const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                        if (e.fi && matchPa && matchE && matchA && matchD) {
                            const p = e.fi.split('/');
                            if (p.length >= 3 && parseInt(p[2]) == checkY && compareMonth(parseInt(p[1]), checkM) && !seenR.has(pKey)) {
                                ra++; seenR.add(pKey);
                            }
                        }
                    }
                    dAltas.push(ra);

                    let rb = 0;
                    (app.bajas_list || []).forEach(b => {
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                        const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                        if (b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD) rb++;
                    });
                    dBajas.push(rb);
                }

                // POPULATE COMPARISON GRID
                const gridEl = document.getElementById('hcComparisonGrid');
                if (gridEl) {
                    const avgTotal = Math.round(dTotal.reduce((a, b) => a + b, 0) / dTotal.length);
                    const avgAltas = Math.round(dAltas.reduce((a, b) => a + b, 0) / dAltas.length);
                    const avgBajas = Math.round(dBajas.reduce((a, b) => a + b, 0) / dBajas.length);
                    const lastVal = { t: dTotal[dTotal.length - 1], a: dAltas[dAltas.length - 1], b: dBajas[dBajas.length - 1] };

                    gridEl.innerHTML = `
                        <div style="background:rgba(59,130,246,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(59,130,246,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(59,130,246,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#3b82f6; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">HC Promedio</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgTotal}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#3b82f6;">${lastVal.t}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#3b82f6; width:100%; opacity:0.1;"></div>
                        </div>
                        <div style="background:rgba(16,185,129,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(16,185,129,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(16,185,129,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#10b981; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">Prom. Ingresos</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgAltas}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#10b981;">${lastVal.a}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#10b981; width:100%; opacity:0.1;"></div>
                        </div>
                        <div style="background:rgba(244,63,94,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(244,63,94,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(244,63,94,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#f43f5e; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">Prom. Bajas</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgBajas}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#f43f5e;">${lastVal.b}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#f43f5e; width:100%; opacity:0.1;"></div>
                        </div>
                    `;
                }

                let ytdAcc = 0;
                const dataYTD = monthlyAltas.map(a => { ytdAcc += a; return ytdAcc; });
                const dataNeto = monthlyAltas.map((a, i) => a - monthlyBajas[i]);

                // -------------------------------------------------------------------------
                // UPDATE DYNAMIC DASHBOARD TITLE (HC [PAIS] [DIR] [DEPTO] [MES] [AÑO])
                // -------------------------------------------------------------------------
                const updateMainDashTitle = () => {
                    const titleEl = document.getElementById('dynamicHCTitle');
                    if (!titleEl) return;
                    
                    const f = getFilters();
                    let parts = ["HC"];
                    
                    // Solo agregamos si no es ALL
                    if (f.countries && f.countries.length > 0) {
                        const cNames = f.countries.map(c => window.paisMap ? window.paisMap[c] || c : c);
                        parts.push(cNames.join(', '));
                    }
                    if (f.a && f.a !== 'ALL') parts.push(f.a);
                    if (f.d && f.d !== 'ALL') parts.push(f.d);
                    
                    // Mes y año
                    if (m && m !== 'ALL') {
                        const mname = window.monthNamesArr ? window.monthNamesArr[parseInt(m)-1] : m;
                        parts.push(mname.toUpperCase());
                    }
                    if (y && y !== 'ALL') parts.push(y);
                    
                    titleEl.innerText = parts.join(' | ');
                };
                updateMainDashTitle();

                window.smartAlignLabels = function(ctx) {
                    const v = ctx.dataset.data[ctx.dataIndex];
                    if (v === null || v === undefined) return 'top';
                    const visibleVals = [];
                    for (let i = 0; i < ctx.chart.data.datasets.length; i++) {
                        const ds = ctx.chart.data.datasets[i];
                        if (!ds.hidden && ds.data[ctx.dataIndex] !== undefined && ds.data[ctx.dataIndex] !== null) {
                            visibleVals.push({ idx: i, val: ds.data[ctx.dataIndex] });
                        }
                    }
                    if (visibleVals.length <= 1) return 'top';
                    let greaterCount = 0;
                    let smallerCount = 0;
                    for(let item of visibleVals) {
                        if (item.idx === ctx.datasetIndex) continue;
                        if (Math.abs(item.val - v) < 5) {
                             if (item.idx > ctx.datasetIndex) greaterCount++;
                             else smallerCount++;
                        } else if (item.val > v) {
                             greaterCount++;
                        } else {
                             smallerCount++;
                        }
                    }
                    if (greaterCount === 0) return 'top';
                    if (smallerCount === 0) return 'bottom';
                    return (greaterCount % 2 === 0) ? 'bottom' : 'top';
                };

                const ctxTrendPro = document.getElementById('chartHCTrendPro');
                if (ctxTrendPro) {
                    // Sincronización dinámica con los filtros globales (Using outer targetY/targetM)
                    window._hcSeriesVisible = Object.assign({ 
                        total: true, ingresos: false, bajas: false, 
                        totalPrev: false, ingresosPrev: false, bajasPrev: false 
                    }, window._hcSeriesVisible || {});
                    
                    if (window._hcViewLength === undefined) window._hcViewLength = 6;

                    // Actualizar etiquetas de fila con año 
                    const lblActual = document.getElementById('lblHCActual');
                    if (lblActual) lblActual.innerText = `ACTUAL:`;
                    const lblAnterior = document.getElementById('lblHCAnterior');
                    if (lblAnterior) lblAnterior.innerText = `ANTERIOR:`;

                    // Update buttons
                    updateHCBtnStyles();

                    const hcGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    hcGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    hcGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    
                    const purpleGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    purpleGradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                    purpleGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

                    const greenGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    greenGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    greenGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

                    const redGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    redGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
                    redGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

                    const orangeGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    orangeGradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
                    orangeGradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

                    const pinkGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    pinkGradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
                    pinkGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');


                    // --- DYNAMIC PERIOD LOGIC (6/12 MONTHS) ---
                    const vLenRollChart = window._hcViewLength || 6;
                    const f = getFilters();
                    const yc = (f.yc === 'ALL' || !f.yc) ? null : parseInt(f.yc);
                    const mc = (f.mc === 'ALL' || !f.mc) ? null : parseInt(f.mc);

                    // Anterior Period Anchor (Mirror Year vs Sequential)
                    let antAnchorY, antAnchorM;
                    if (yc && mc) {
                        antAnchorY = yc;
                        antAnchorM = mc;
                    } else if (window._hcMirrorMode) {
                        // Mirror mode: uses exactly the same months but from the previous year
                        antAnchorY = hcTrendEndY - 1;
                        antAnchorM = hcTrendEndM;
                    } else {
                        // Sequential mode: uses the period immediately preceding the actual selection
                        antAnchorY = hcTrendEndY;
                        antAnchorM = hcTrendEndM - vLenRollChart;
                        while (antAnchorM < 1) { antAnchorM += 12; antAnchorY--; }
                    }

                    // Prepare Labels and Data Containers
                    const dLabels = [];
                    window._hcAnteriorLabels = []; // Temporary store for the plugin
                    const dTotalPrior = [];
                    const dAltasPrior = [];
                    const dBajasPrior = [];

                    for (let i = 0; i < vLenRollChart; i++) {
                        let cY = hcTrendEndY, cM = hcTrendEndM - (vLenRollChart - 1 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        
                        let aY = antAnchorY, aM = antAnchorM - (vLenRollChart - 1 - i);
                        while (aM < 1) { aM += 12; aY--; }

                        // Point 1: Dynamic Format (Full if space permits, compact if not)
                        let lblActual, lblAnterior;
                        if (vLenRollChart <= 6) {
                            lblActual = monthNamesArr[cM - 1] + " '" + String(cY).slice(-2);
                            lblAnterior = monthNamesArr[aM - 1] + " '" + String(aY).slice(-2);
                        } else {
                            lblActual = (cM < 10 ? '0' : '') + cM + '/' + String(cY).slice(-2);
                            lblAnterior = (aM < 10 ? '0' : '') + aM + '/' + String(aY).slice(-2);
                        }
                        
                        dLabels.push(lblActual);
                        window._hcAnteriorLabels.push(lblAnterior);
                    }

                    // Populate Prior Data (Using the relative anterior window)
                    for (let i = 0; i < vLenRollChart; i++) {
                        let checkY = antAnchorY;
                        let checkM = antAnchorM - (vLenRollChart - 1 - i);
                        while (checkM < 1) { checkM += 12; checkY--; }
                        
                        // Prev Total
                        let c = 0; const s = new Set();
                        for (let j = 0; j < empsRaw.length; j++) {
                            const e = empsRaw[j];
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                            const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                            
                            if (e.y == checkY && compareMonth(e.m, checkM) && matchPa && matchE && matchA && matchD) {
                                s.add(e.c || e.n);
                            }
                        }

                        // Filter bajas for the period (Prev - intelligent net count)
                        const bSetPrev = new Set((app.bajas_list || []).filter(b => {
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                            const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                            return b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD;
                        }).map(b => b.c || b.n));

                        const netCountPrev = Array.from(s).filter(id => !bSetPrev.has(id)).length;

                        dTotalPrior.push(isNeto ? netCountPrev : s.size);
                        dBajasPrior.push(bSetPrev.size);

                        // Prev Altas
                        let ra = 0; const seenR = new Set();
                        for (let j = 0; j < empsRaw.length; j++) {
                            const e = empsRaw[j];
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                            const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                            
                            if (e.fi && matchPa && matchE && matchA && matchD) {
                                const p = e.fi.split('/');
                                if (p.length >= 3 && parseInt(p[2]) == checkY && compareMonth(parseInt(p[1]), checkM) && !seenR.has(e.c || e.n)) {
                                    ra++; seenR.add(e.c || e.n);
                                }
                            }
                        }
                        dAltasPrior.push(ra);

                        // Prev Bajas logic already handled in dTotalPrior above
                    }

                    function getTrendLabels(colorStr, isPrev) {
    return {
        labels: {
            value: {
                display: true,
                align: window.smartAlignLabels,
                anchor: 'center',
                offset: 22,
                color: colorStr,
                font: { size: 14, weight: 1000, family: 'Montserrat' },
                formatter: (v, ctx) => ctx.dataIndex === 0 ? '      ' + v : v
            },
            year: {
                display: (ctx) => (ctx.dataIndex === ctx.dataset.data.length - 1),
                align: 'right',
                anchor: 'center',
                offset: 12,
                color: '#fff',
                backgroundColor: colorStr.startsWith('rgba') ? colorStr.replace(/0\.[0-9]+\)$/, '1)') : colorStr,
                borderRadius: 4,
                padding: { top: 2, bottom: 2, left: 6, right: 6 },
                font: { weight: 1000, size: 14, family: 'Montserrat' },
                formatter: () => ''
            }
        }
    };
}
                    window._hcProChart = new Chart(ctxTrendPro.getContext('2d'), {
                        type: 'line',
                        plugins: [ChartDataLabels, {
                            id: 'lilaTickPlugin',
                            afterDraw: (chart) => {
                                const {ctx, scales: {x}} = chart;
                                const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                if (!anyPrev) return;

                                ctx.save();
                                ctx.font = (vLenRollChart > 6) ? '1000 11px Montserrat' : '1000 13px Montserrat';
                                ctx.textBaseline = 'top';

                                const antLabels = window._hcAnteriorLabels || [];
                                const actLabels = chart.data.labels || [];

                                x.ticks.forEach((tick, idx) => {
                                    const xPixel = x.getPixelForTick(idx);
                                    const yPixel = x.top + 10;
                                    
                                    const txtAnt = antLabels[idx] || '';
                                    const txtAct = actLabels[idx] || '';
                                    const vs = " vs ";

                                    const wAnt = ctx.measureText(txtAnt).width;
                                    const wVs = ctx.measureText(vs).width;
                                    const wAct = ctx.measureText(txtAct).width;
                                    const totalW = wAnt + wVs + wAct;
                                    
                                    let startX = xPixel - totalW / 2;

                                    // Anterior (Purpura)
                                    ctx.fillStyle = '#8b5cf6';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(txtAnt, startX, yPixel);

                                    // "vs" (Gris)
                                    ctx.fillStyle = '#94a3b8';
                                    ctx.fillText(vs, startX + wAnt, yPixel);

                                    // Actual (Oscuro)
                                    ctx.fillStyle = '#1e293b';
                                    ctx.fillText(txtAct, startX + wAnt + wVs, yPixel);
                                });
                                ctx.restore();
                            }
                        }],
                        data: {
                            labels: dLabels,
                            datasets: [
                                {
                                    label: 'Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dTotalPrior,
                                    borderColor: '#8b5cf6', 
                                    backgroundColor: purpleGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#8b5cf6',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.totalPrev,
                                    datalabels: getTrendLabels('#8b5cf6', true)
                                },
                                {
                                    label: 'Ingresos Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dAltasPrior,
                                    borderColor: '#F97316', 
                                    backgroundColor: orangeGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#F97316',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.ingresosPrev,
                                    datalabels: getTrendLabels('#F97316', true)
                                },
                                {
                                    label: 'Bajas Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dBajasPrior,
                                    borderColor: '#EC4899', 
                                    backgroundColor: pinkGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#EC4899',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.bajasPrev,
                                    datalabels: getTrendLabels('#EC4899', true)
                                },
                                {
                                    label: 'Actual (' + targetY + ')',
                                    data: dTotal,
                                    borderColor: '#3b82f6', 
                                    backgroundColor: hcGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 7,
                                    pointHoverRadius: 9,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#3b82f6',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.total,
                                    datalabels: getTrendLabels('#3b82f6', false)
                                },
                                {
                                    label: 'Altas Actual (' + targetY + ')',
                                    data: dAltas,
                                    borderColor: '#10b981', 
                                    backgroundColor: greenGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.45,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#10b981',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.ingresos,
                                    datalabels: getTrendLabels('#10b981', false)
                                },
                                {
                                    label: 'Bajas Actual (' + targetY + ')',
                                    data: dBajas,
                                    borderColor: '#ef4444', 
                                    backgroundColor: redGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.45,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#ef4444',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.bajas,
                                    datalabels: getTrendLabels('#ef4444', false)
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        title: (ctx) => {
                                            const idx = ctx[0].dataIndex;
                                            const actLabel = ctx[0].chart.data.labels[idx];
                                            const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                            if (!anyPrev) return actLabel;
                                            const antLabel = (window._hcAnteriorLabels || [])[idx] || '';
                                            return `Ref: ${antLabel} | Actual: ${actLabel}`;
                                        }
                                    }
                                },
                                lilaLabels: {
                                    display: () => window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev,
                                    text: antAnchorY || 'Ref'
                                }
                            },
                            layout: { padding: { top: 60, left: 20, right: 90, bottom: 45 } },
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    grace: '15%',
                                    grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
                                    ticks: {
                                        font: { weight: 1000, size: 14, family: 'Montserrat' }, 
                                        color: '#1e293b',
                                        callback: function(value) { if (value % 1 === 0) return value; }
                                    }
                                },
                                x: { 
                                    offset: false,
                                    grid: { display: false }, 
                                    ticks: { 
                                        padding: 8,
                                        font: { weight: 1000, size: 13, family: 'Montserrat' }, 
                                        color: '#1e293b',
                                        maxRotation: 0,
                                        autoSkip: false,
                                        callback: function(value, index, ticks) {
                                            const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                            if (anyPrev) return '';
                                            return this.getLabelForValue(value);
                                        }
                                    } 
                                }
                            }
                        }
                    });
                    window.activeCharts.push(window._hcProChart);
                }

                const ctxTrendOld = document.getElementById('chartHCTrendOld');
                if (ctxTrendOld) {
                    try {
                        // Rolling Window para el gr  cl 
                        const dLabelsOld = []; const dTotalOld = [];
                        for (let i = 0; i < vLenOldRoll; i++) {
                            let checkY = targetY;
                            let checkM = targetM - (vLenOldRoll - 1 - i);
                            while (checkM < 1) { checkM += 12; checkY--; }
                            dLabelsOld.push(monthNamesArr[checkM - 1] + (checkY !== targetY ? " '" + String(checkY).slice(-2) : ""));

                            let c = 0; const s = new Set();
                            for (let j = 0; j < empsRaw.length; j++) {
                                const e = empsRaw[j];
                                if (e.y == checkY && e.m == checkM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)) s.add(e.c || e.n);
                            }
                            dTotalOld.push(s.size);
                        }

                        window.activeCharts.push(new Chart(ctxTrendOld.getContext('2d'), {
                            type: 'bar',
                            data: {
                                labels: dLabelsOld,
                                datasets: [{
                                    label: 'Colaboradores',
                                    data: dTotalOld,
                                    backgroundColor: '#c4b5fd',
                                    borderRadius: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    datalabels: {
                                        display: true,
                                        align: 'end',
                                        anchor: 'end',
                                        color: '#1e293b',
                                        font: { weight: 1000, size: 11 }
                                    }
                                },
                                scales: { 
                                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' } }, 
                                    x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                }
                            }
                        }));
                    } catch (e) { console.error("Old Trend Chart failed:", e); }

                    // --- POINT 1: COMPOSICI  HC POR Pais (area CHART) ---
                    const ctxareaComp = document.getElementById('chartCompositionarea');
                    if (ctxareaComp) {
                        try {
                            const vLen = window._hcViewLength || 6;
                            const dLabels = [];
                            const countryData = {};
                            const allPa = [...new Set(empsRaw.map(e => normalizePa(e.pa)))].sort();
                            allPa.forEach(c => countryData[c] = []);

                            for (let i = 0; i < vLen; i++) {
                                let cY = targetY, cM = targetM - (vLen - 1 - i);
                                while (cM < 1) { cM += 12; cY--; }
                                dLabels.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ''));
                                
                                allPa.forEach(c => {
                                    const s = new Set();
                                    for (let j = 0; j < empsRaw.length; j++) {
                                        const e = empsRaw[j];
                                        if (e.y == cY && e.m == cM && normalizePa(e.pa) === c && (emp2 === 'ALL' || e.e === emp2)) s.add(e.c || e.n);
                                    }
                                    countryData[c].push(s.size);
                                });
                            }

                            const flagColors = {
                                'GT': '#3b82f6', 'PA': '#ef4444', 'SV': '#6366f1', 'HN': '#0ea5e9', 
                                'NI': '#38bdf8', 'CR': '#f43f5e', 'DO': '#2563eb', 'US': '#1e293b'
                            };

                            const datasets = allPa.map(c => {
                                const baseColor = flagColors[c] || '#94a3b8';
                                return {
                                    label: paisMap[c] || c,
                                    data: countryData[c],
                                    fill: true,
                                    backgroundColor: (context) => {
                                        const chart = context.chart;
                                        const {ctx, chartarea} = chart;
                                        if (!chartarea) return null;
                                        const grad = ctx.createLinearGradient(0, chartarea.bottom, 0, chartarea.top);
                                        grad.addColorStop(0, baseColor + '10');
                                        grad.addColorStop(1, baseColor + '66');
                                        return grad;
                                    },
                                    borderColor: baseColor,
                                    borderWidth: 2,
                                    pointRadius: 3,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: baseColor,
                                    pointBorderWidth: 2,
                                    clip: false,
                                    tension: 0.4,
                                    datalabels: {
                                        display: (ctx) => {
                                            const v = ctx.dataset.data[ctx.dataIndex];
                                            const vLen = ctx.dataset.data.length;
                                            // Show if it's the last point or a high value
                                            return v > 10 || ctx.dataIndex === vLen - 1;
                                        },
                                        color: '#fff',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        borderRadius: 4,
                                        font: { weight: '1000', size: 12 },
                                        align: 'top',
                                        anchor: 'center',
                                        padding: 4,
                                        formatter: (v) => v
                                    }
                                };
                            });

                            const classicLen = window._hcViewLength || 6;
                            document.documentElement.style.setProperty('--classicPeriodColor6', classicLen === 6 ? '#8b5cf6' : 'transparent');
                            document.documentElement.style.setProperty('--classicPeriodText6', classicLen === 6 ? '#fff' : '#64748b');
                            document.documentElement.style.setProperty('--classicPeriodColor12', classicLen === 12 ? '#8b5cf6' : 'transparent');
                            document.documentElement.style.setProperty('--classicPeriodText12', classicLen === 12 ? '#fff' : '#64748b');

                            window.activeCharts.push(new Chart(ctxareaComp.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: { labels: dLabels, datasets: datasets },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { 
                                            position: 'bottom', 
                                            labels: { 
                                                boxWidth: 8, 
                                                usePointStyle: true,
                                                font: { size: 10, weight: 900 } 
                                            } 
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                            backdropFilter: 'blur(8px)',
                                            padding: 12,
                                            titleFont: { size: 13, weight: 900, family: 'Montserrat' },
                                            bodyFont: { size: 12, weight: 600, family: 'Montserrat' },
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            borderWidth: 1,
                                            cornerRadius: 12,
                                            displayColors: true,
                                            callbacks: {
                                                label: (context) => {
                                                    let label = context.dataset.label || '';
                                                    if (label) label += ': ';
                                                    if (context.parsed.y !== null) label += context.parsed.y;
                                                    return label;
                                                }
                                            }
                                        }
                                    },
                                    scales: { 
                                        y: { 
                                            stacked: true, 
                                            beginAtZero: true, 
                                            grid: { color: 'rgba(0,0,0,0.03)' },
                                            ticks: { font: { weight: 700 } }
                                        }, 
                                        x: { 
                                            grid: { display: false },
                                            ticks: { font: { weight: 700 } }
                                        } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("Composition area Chart failed:", e); }
                    }

                    // --- POINT 4: ACUMULADO A  VS A  ---
                    const ctxYoY = document.getElementById('chartAcumuladoYoY');
                    if (ctxYoY) {
                        try {
                            const months = [1,2,3,4,5,6,7,8,9,10,11,12];
                            const dataCur = [], dataPrev = [];
                            let accCur = 0, accPrev = 0;
                            const prevY = targetY - 1;

                            months.forEach(m => {
                                const sCur = new Set(), sPrev = new Set();
                                empsRaw.forEach(e => {
                                    const match = (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2);
                                    if (match) {
                                        if (e.y == targetY && e.m == m) sCur.add(e.c || e.n);
                                        if (e.y == prevY && e.m == m) sPrev.add(e.c || e.n);
                                    }
                                });
                                // Corrected: Monthly HC, not sum of sums
                                dataCur.push(sCur.size);
                                dataPrev.push(sPrev.size);
                            });

                            const lastCur = dataCur[targetM - 1] || 0;
                            const lastPrev = dataPrev[targetM - 1] || 0;
                            const growth = lastPrev > 0 ? (((lastCur - lastPrev) / lastPrev) * 100).toFixed(1) : 0;
                            
                            window.activeCharts.push(new Chart(ctxYoY.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: {
                                    labels: monthNamesArr,
                                    datasets: [
                                        { 
                                            label: `Actual (${targetY})`, 
                                            data: dataCur, 
                                            borderColor: '#8b5cf6', 
                                            borderWidth: 4, 
                                            tension: 0.4, 
                                            fill: true,
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const grad = ctx.createLinearGradient(0, 0, 0, 300);
                                                grad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
                                                grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
                                                return grad;
                                            },
                                            pointRadius: 4,
                                            pointBackgroundColor: '#fff',
                                            pointBorderWidth: 2,
                                    clip: false,
                                            datalabels: {
                                                display: true,
                                                align: 'top',
                                                offset: 5,
                                                color: '#8b5cf6',
                                                font: { weight: 1000, size: 11 }
                                            }
                                        },
                                        { 
                                            label: `Anterior (${prevY})`, 
                                            data: dataPrev, 
                                            borderColor: '#94a3b8', 
                                            borderWidth: 2, 
                                            borderDash: [6, 4], 
                                            tension: 0.4, 
                                            fill: false,
                                            pointRadius: 0,
                                            datalabels: { display: false }
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { 
                                            position: 'top', 
                                            align: 'end',
                                            labels: { boxWidth: 12, usePointStyle: true, font: { weight: 800, size: 11 } } 
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            padding: 12,
                                            titleFont: { size: 13, weight: 900 },
                                            bodyFont: { size: 12, weight: 600 },
                                            cornerRadius: 10
                                        }
                                    },
                                    scales: { 
                                        y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 700 } } }, 
                                        x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("YoY Chart failed:", e); }
                    }

                    // --- POINT 7: AN  CL  14 areaS ---
                    const ctx14 = document.getElementById('chartClassic14areas');
                    if (ctx14) {
                        try {
                            const vLen = 6; // Fixed for clarity in this specific view
                            const areas = [...new Set(empsRaw.map(e => e.dir || e.area || 'Sin area'))].slice(0, 14);
                            const dLabels = [];
                            const areaSeries = {};
                            areas.forEach(a => areaSeries[a] = []);

                            for (let i = 0; i < vLen; i++) {
                                let cY = targetY, cM = targetM - (vLen - 1 - i);
                                while (cM < 1) { cM += 12; cY--; }
                                dLabels.push(monthNamesArr[cM - 1]);
                                
                                areas.forEach(a => {
                                    const s = new Set();
                                    empsRaw.forEach(e => {
                                        if (e.y == cY && e.m == cM && (e.dir === a || e.area === a) && (countries.length === 0 || countries.includes(normalizePa(e.pa)))) s.add(e.c || e.n);
                                    });
                                    areaSeries[a].push(s.size);
                                });
                            }

                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
                            const datasets = areas.map((a, idx) => ({
                                label: a,
                                data: areaSeries[a],
                                borderColor: colors[idx % colors.length],
                                borderWidth: 3,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 8,
                                fill: false,
                                datalabels: {
                                    display: (ctx) => {
                                        // Show value only at the end point OR if hovered
                                        const chart = ctx.chart;
                                        const isLastPoint = ctx.dataIndex === ctx.dataset.data.length - 1;
                                        const hoveredIndex = chart.tooltip?.getActiveElements()[0]?.datasetIndex;
                                        return isLastPoint || hoveredIndex === ctx.datasetIndex;
                                    },
                                    backgroundColor: (ctx) => ctx.dataset.borderColor,
                                    color: '#fff',
                                    borderRadius: 6,
                                    offset: 8,
                                    align: 'end',
                                    anchor: 'end',
                                    padding: 6,
                                    font: { weight: 1000, size: 12 }
                                }
                            }));

                            const classicTitleLabel = document.getElementById('classicViewLenLabel');
                            if(classicTitleLabel) classicTitleLabel.innerText = vLen;

                            window.activeCharts.push(new Chart(ctx14.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: { labels: dLabels, datasets: datasets },
                                options: {
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { display: false }, 
                                        tooltip: { 
                                            mode: 'index', 
                                            intersect: false,
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            padding: 12,
                                            boxPadding: 6,
                                            callbacks: {
                                                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
                                            }
                                        } 
                                    },
                                    hover: {
                                        mode: 'dataset',
                                        intersect: false
                                    },
                                    onHover: (event, chartElement) => {
                                        const chart = event.chart;
                                        if (chartElement.length > 0) {
                                            const index = chartElement[0].datasetIndex;
                                            chart.data.datasets.forEach((ds, i) => {
                                                ds.borderWidth = (i === index) ? 4 : 1;
                                                ds.borderColor = (i === index) ? colors[i % colors.length] : colors[i % colors.length] + '44';
                                            });
                                        } else {
                                            chart.data.datasets.forEach((ds, i) => {
                                                ds.borderWidth = 2;
                                                ds.borderColor = colors[i % colors.length];
                                            });
                                        }
                                        chart.update('none');
                                    },
                                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                                    scales: { 
                                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 700 } } }, 
                                        x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("14 area Chart failed:", e); }
                    }
                }

                // --- 0.1 TOP PUESTOS (HEATMAP/LIST) ---
                renderHeatmap(uniqueEmps);

                // --- 0.2 DISTRIBUCIÓN CL  DEPARTAMENTO ---
                const ctxareaOld = document.getElementById('chartareaClassic');
                if (ctxareaOld) {
                    const deptCounts = {};
                    uniqueEmps.forEach(e => {
                        const d = e.d && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                        deptCounts[d] = (deptCounts[d] || 0) + 1;
                    });
                    // Point 5: Show all depts (or top 50 to avoid illegible legend)
                    const topDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

                    try {
                        const gradientColors = ['#8b5cf6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#64748b', '#14b8a6'];
                        window.activeCharts.push(new Chart(ctxareaOld.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: topDepts.map(d => d[0]),
                                datasets: [{
                                    data: topDepts.map(d => d[1]),
                                    backgroundColor: gradientColors,
                                    hoverOffset: 20,
                                    borderRadius: 8,
                                    borderWidth: 4,
                                    borderColor: document.body.classList.contains('dark') ? '#1e293b' : '#fff'
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '65%',
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            boxWidth: 12,
                                            padding: 15,
                                            font: { size: 11, weight: 800, family: 'Montserrat' },
                                            color: document.body.classList.contains('dark') ? '#cbd5e1' : '#475569'
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        padding: 12,
                                        titleFont: { size: 14, weight: 800 },
                                        bodyFont: { size: 13, weight: 600 }
                                    }
                                }
                            }
                        }));
                    } catch (e) { console.error("Classic area Chart failed:", e); }
                }

                // --- NEW: AN  CL  HC REAL 2 (trend + doughnut side-by-side) ---
                // --- HC HISTÓRICO REFINEMENT (Multi-Series & YoY) ---
                const ctxTrendReal2 = document.getElementById('chartHCTrendReal2');
                if (ctxTrendReal2) {
                    try {
                        const vLen2 = window._hcHistPeriod || 12;
                        const activeSeries = window._hcHistSeries || ['hc'];
                        const showComp = window._hcHistComp || false;
                        const compYear = targetY - 1;

                        const dLabels2 = [];
                        const datasets = [];

                        // 1. Prepare Main Datasets (Current Year)
                        const seriesConfig = {
                            'hc': { label: 'HC TOTAL', color: '#6366f1', data: [] },
                            'altas': { label: 'ALTAS', color: '#10b981', data: [] },
                            'bajas': { label: 'BAJAS', color: '#ef4444', data: [] }
                        };

                        // 2. Prepare Comparison Datasets (Previous Year)
                        const compConfig = {
                            'hc_comp': { label: `HC ${compYear}`, color: '#6366f1', data: [], dashed: true },
                            'altas_comp': { label: `ALTAS ${compYear}`, color: '#10b981', data: [], dashed: true },
                            'bajas_comp': { label: `BAJAS ${compYear}`, color: '#ef4444', data: [], dashed: true }
                        };

                        // 3. Calculation Loop
                        for (let i = 0; i < vLen2; i++) {
                            let cY = targetY, cM = targetM - (vLen2 - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            dLabels2.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ''));

                            // Current Period Data
                            const currentSlice = empsRaw.filter(e => e.y == cY && e.m == cM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel));
                            
                            if (activeSeries.includes('hc')) {
                                const s = new Set(currentSlice.map(e => e.c || e.n));
                                seriesConfig.hc.data.push(s.size);
                            }
                            if (activeSeries.includes('altas')) {
                                const h = currentSlice.filter(e => {
                                    if(!e.fi) return false;
                                    const p = e.fi.split('/');
                                    return p.length >= 3 && parseInt(p[2]) == cY && parseInt(p[1]) == cM;
                                });
                                seriesConfig.altas.data.push(h.length);
                            }
                            if (activeSeries.includes('bajas')) {
                                const b = (app.bajas_list || []).filter(bx => bx.y == cY && bx.m == cM && (countries.length === 0 || countries.includes(normalizePa(bx.pa))) && (emp2 === 'ALL' || bx.e === emp2) && (areaSel === 'ALL' || bx.dir === areaSel) && (deptoSel === 'ALL' || bx.d === deptoSel));
                                seriesConfig.bajas.data.push(b.length);
                            }

                            // Comparison Period Data (Year - 1)
                            if (showComp) {
                                let pY = cY - 1, pM = cM;
                                const compSlice = empsRaw.filter(e => e.y == pY && e.m == pM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel));
                                
                                if (activeSeries.includes('hc')) {
                                    const sP = new Set(compSlice.map(e => e.c || e.n));
                                    compConfig.hc_comp.data.push(sP.size);
                                }
                                if (activeSeries.includes('altas')) {
                                    const hP = compSlice.filter(e => {
                                        if(!e.fi) return false;
                                        const p = e.fi.split('/');
                                        return p.length >= 3 && parseInt(p[2]) == pY && parseInt(p[1]) == pM;
                                    });
                                    compConfig.altas_comp.data.push(hP.length);
                                }
                                if (activeSeries.includes('bajas')) {
                                    const bP = (app.bajas_list || []).filter(bx => bx.y == pY && bx.m == pM && (countries.length === 0 || countries.includes(normalizePa(bx.pa))) && (emp2 === 'ALL' || bx.e === emp2) && (areaSel === 'ALL' || bx.dir === areaSel) && (deptoSel === 'ALL' || bx.d === deptoSel));
                                    compConfig.bajas_comp.data.push(bP.length);
                                }
                            }
                        }

                        // 4. Build Dataset Array
                        activeSeries.forEach(s => {
                            const conf = seriesConfig[s];
                            datasets.push({
                                label: conf.label,
                                data: conf.data,
                                borderColor: conf.color,
                                borderWidth: 3,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: conf.color
                            });

                            if (showComp) {
                                const cConf = compConfig[s + '_comp'];
                                datasets.push({
                                    label: cConf.label,
                                    data: cConf.data,
                                    borderColor: cConf.color + '66', // 40% opacity
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0
                                });
                            }
                        });

                        window.activeCharts.push(new Chart(ctxTrendReal2.getContext('2d'), {
                            type: 'line',
                            data: { labels: dLabels2, datasets: datasets },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index', intersect: false,
                                        backgroundColor: 'rgba(15,23,42,0.95)',
                                        padding: 12,
                                        titleFont: { size: 12, weight: 1000 },
                                        bodyFont: { size: 11, weight: 700 }
                                    }
                                },
                                scales: {
                                    y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 800 } } },
                                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 800 } } }
                                }
                            }
                        }));
                    } catch(e) { console.error("Premium HC Historico failed:", e); }
                }


                const ctxarea2 = document.getElementById('chartareaReal2');
                if (ctxarea2) {
                    try {
                        const deptCounts2 = {};
                        uniqueEmps.forEach(e => {
                            const d = e.d && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                            deptCounts2[d] = (deptCounts2[d] || 0) + 1;
                        });
                        const top2 = Object.entries(deptCounts2).sort((a,b) => b[1]-a[1]).slice(0, 8);
                        const gc2 = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b'];
                        window.activeCharts.push(new Chart(ctxarea2.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: top2.map(d => d[0]),
                                datasets: [{ data: top2.map(d => d[1]), backgroundColor: gc2, hoverOffset: 20, borderRadius: 8, borderWidth: 4, borderColor: '#fff' }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false, cutout: '65%',
                                plugins: {
                                    legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10, weight: 800, family: 'Montserrat' }, color: '#475569' } },
                                    tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, titleFont: { size: 13, weight: 800 }, bodyFont: { size: 11, weight: 600 } }
                                }
                            }
                        }));
                    } catch(e) { console.error("area Real2 failed:", e); }
                }


                // Combined Altas vs Bajas Chart
                const ctxAB = document.getElementById('chartAltasBajas');
                if (ctxAB) {
                    try {
                        const vLenAB = document.getElementById('chk12mAB')?.checked ? 12 : 6;
                        const labelsAB = [];
                        const dataA = [];
                        const dataB = [];

                        for (let i = 0; i < vLenAB; i++) {
                            let cY = targetY;
                            let cM = targetM - (vLenAB - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            labelsAB.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ""));

                            // Recalculate monthly for AB specifically if needed or reuse logic
                            // For simplicity, let's use the monthlyAltas/monthlyBajas if it's within current year
                            // or better yet, recalculate precisely for the window
                            let aCount = 0; let bCount = 0;
                            const sA = new Set();
                            empsRaw.forEach(e => {
                                if (e.fi && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                    (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)) {
                                    const p = e.fi.split('/');
                                    if (p.length >= 3 && parseInt(p[2]) == cY && parseInt(p[1]) == cmasA.has(e.c || e.n)) {
                                        aCount++; sA.add(e.c || e.n);
                                    }
                                }
                            });
                            bajasArray.forEach(b => {
                                const curPa = (b.pa || '').trim().toUpperCase();
                                const matchPa = countries.length === 0 || countries.includes(curPa);
                                const matchE = emp2 === 'ALL' || b.e === emp2;
                                const matchA = areaSel === 'ALL' || b.dir === areaSel;
                                const matchD = deptoSel === 'ALL' || b.d === deptoSel;

                                if (b.y == cY && b.m == cM && matchPa && matchE && matchA && matchD) {
                                    bCount++;
                                }
                            });
                            dataA.push(aCount);
                            dataB.push(bCount);
                        }

                        window.activeCharts.push(new Chart(ctxAB.getContext('2d'), {
                            type: 'bar',
                            data: {
                                labels: labelsAB,
                                datasets: [
                                    { label: 'Ingresos', data: dataA, backgroundColor: '#10b981', borderRadius: 6, barThickness: vLenAB === 12 ? 15 : 25 },
                                    { label: 'Egresos', data: dataB, backgroundColor: '#ef4444', borderRadius: 6, barThickness: vLenAB === 12 ? 15 : 25 }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { weight: 800, family: 'Montserrat' } } }
                                },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { weight: 600 } } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 600, size: 10 } } }
                                }
                            }
                        }));
                    } catch (e) { console.error("Altas/Bajas Combined Chart failed:", e); }
                }

                // MINI CHARTS FOR KPI CARDS (FORCED 12 MONTHS)
                // 1. KPI HC Trend (12m)
                const kpiHCTrendCtx = document.getElementById('kpiHCTrendCanvas');
                if (kpiHCTrendCtx) {
                    const l12 = []; const d12 = [];
                    for (let i = 0; i < 12; i++) {
                        let cY = targetY, cM = targetM - (11 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        l12.push(monthNamesArr[cM - 1]);
                        const s = new Set(empsRaw.filter(e => e.y == cY && e.m == cM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2)).map(e => e.c || e.n));
                        d12.push(s.size);
                    }
                    window.activeCharts.push(new Chart(kpiHCTrendCtx, {
                        type: 'line',
                        data: { labels: l12, datasets: [{ data: d12, borderColor: activeColor, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: activeColor + '10', tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
                    }));
                }

                // 2. KPI AB Trend (12m)
                const kpiABTrendCtx = document.getElementById('kpiABTrendCanvas');
                if (kpiABTrendCtx) {
                    const l12 = []; const dA = []; const dB = [];
                    for (let i = 0; i < 12; i++) {
                        let cY = targetY, cM = targetM - (11 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        l12.push(monthNamesArr[cM - 1]);
                        let a = 0, b = 0;
                        const sA = new Set();
                        empsRaw.forEach(e => { if (e.fi && e.fi.includes('/') && (countries.length === 0 || countries.includes(normalizePa(e.pa)))) { const p = e.fi.split('/'); if (parseInt(p[2]) == cY && parseInt(p[1]) == cM) { a++; } } });
                        bajasArray.forEach(bj => { if (bj.y == cY && bj.m == cM && (countries.length === 0 || countries.includes(normalizePa(bj.pa)))) b++; });
                        dA.push(a); dB.push(b);
                    }
                    window.activeCharts.push(new Chart(kpiABTrendCtx, {
                        type: 'bar',
                        data: { labels: l12, datasets: [{ data: dA, backgroundColor: '#10b981' }, { data: dB, backgroundColor: '#ef4444' }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
                    }));
                }

                // 3. KPI RotRet (Doughnut)
                const kpiRotRetCtx = document.getElementById('kpiRotRetCanvas');
                if (kpiRotRetCtx) {
                    const rotRaw = activeHC_val > 0 ? (bajasPeriod_val / activeHC_val) * 100 : 0;
                    window.activeCharts.push(new Chart(kpiRotRetCtx, {
                        type: 'doughnut',
                        data: { datasets: [{ data: [rotRaw, 100 - rotRaw], backgroundColor: ['#ef4444', '#10b981'], borderWidth: 0 }] },
                        options: { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
                    }));
                }


                // B. Acumulado A  vs A  (Suma Acumulada Mes a Mes)
                const ctxYTD = document.getElementById('chartYTDContrataciones');
                if (ctxYTD) {
                    try {
                        const vLenYTD = 12; // Forced 12 months as requested
                        const labelsYTD = [];
                        const dataLY_cum = [];
                        const dataCY_cum = [];

                        let cumLY = 0;
                        let cumCY = 0;

                        // Calculate starting point for cumulative if we are on a rolling window?
                        // Actually, 'A  vs A ' usually starts from Jan of each respective year.
                        for (let i = 1; i <= 12; i++) {
                            labelsYTD.push(monthNamesArr[i - 1]);

                            // Last Year Hires for this month
                            const lyHires = new Set(empsRaw.filter(e => e.y == (targetY - 1) && e.m == i && e.fi &&
                                (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)
                            ).map(e => e.c || e.n)).size;

                            // Current Year Hires for this month
                            const cyHires = new Set(empsRaw.filter(e => e.y == targetY && e.m == i && e.fi &&
                                (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)
                            ).map(e => e.c || e.n)).size;

                            cumLY += lyHires;
                            cumCY += cyHires;

                            dataLY_cum.push(cumLY);
                            dataCY_cum.push(cumCY);
                        }

                        window.activeCharts.push(new Chart(ctxYTD.getContext('2d'), {
                            type: 'line',
                            plugins: [ChartDataLabels],
                            data: {
                                labels: labelsYTD,
                                datasets: [
                                    { label: 'Ingresos Acum. ' + targetY, data: dataCY_cum, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderWidth: 5, pointRadius: 6, fill: true, tension: 0.3, datalabels: { display: true, align: 'top', backgroundColor: '#fff', borderRadius: 8, padding: 6, font: { weight: 1000, size: 14 } } },
                                    { label: 'Ingresos Acum. ' + (targetY - 1), data: dataLY_cum, borderColor: '#cad4e0', backgroundColor: 'transparent', borderWidth: 4, pointRadius: 5, pointStyle: 'rectRot', tension: 0.3, datalabels: { display: true, align: 'bottom', font: { weight: 800, size: 11 } } }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { weight: 900, family: 'Montserrat' } } } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 800, size: 11 } } }
                                }
                            }
                        }));
                    } catch (e) { console.error("YTD Cumulative Chart failed:", e); }
                }

                // D. Tasa de Rotación (%)
                const dataRotacion = monthlyBajas.map(b => currentHC > 0 ? parseFloat(((b / currentHC) * 100).toFixed(1)) : 0);
                const ctxRot = document.getElementById('chartRotacion');
                if (ctxRot) {
                    try {
                        window.activeCharts.push(new Chart(ctxRot.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: monthNamesArr,
                                datasets: [
                                    { label: 'Rotación %', data: dataRotacion, borderColor: '#3b82f6', borderWidth: 3, tension: 0.4, pointBackgroundColor: '#fff', pointBorderWidth: 2,
                                    clip: false, pointRadius: 5 },
                                    { label: 'Meta', data: Array(12).fill(5), borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], pointRadius: 0 }
                                ]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
                        }));
                    } catch (e) { console.error("Rotation Chart failed:", e); }
                }

                // E. HC Neto por Mes
                const ctxNeto = document.getElementById('chartHCNeto');
                if (ctxNeto) {
                    const bgNeto = dataNeto.map(v => v >= 0 ? '#8b5cf6' : '#ef4444');
                    try {
                        window.activeCharts.push(new Chart(ctxNeto.getContext('2d'), {
                            type: 'bar',
                            data: { labels: monthNamesArr, datasets: [{ label: 'HC Neto', data: dataNeto, backgroundColor: bgNeto, borderRadius: 4 }] },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
                        }));
                    } catch (e) { console.error("Net HC Chart failed:", e); }
                }

                // F. Radar por Direccion
                const radareas = {};
                uniqueEmps.forEach(e => { const a = e.dir || 'Sin Direccion'; radareas[a] = (radareas[a] || 0) + 1; });
                const pareas = Object.keys(radareas).sort((a, b) => radareas[b] - radareas[a]).slice(0, 8);
                const radLabels = pareas.length > 0 ? pareas : ['Direccion'];
                const radData = radLabels.map(l => radareas[l] || 0);

                const ctxRadar = document.getElementById('chartRadar');
                if (ctxRadar) {
                    try {
                        window.activeCharts.push(new Chart(ctxRadar.getContext('2d'), {
                            type: 'radar',
                            data: {
                                labels: radLabels,
                                datasets: [{ label: 'Q. Colaboradores', data: radData, backgroundColor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8', pointBackgroundColor: '#fff', pointBorderColor: '#38bdf8' }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false } } } }
                        }));
                    } catch (e) { console.error("Radar by area Chart failed:", e); }
                }

                // F.2 TOP 5 Antigüedad
                const topAntRows = [...tenures].sort((a, b) => b.tenure - a.tenure).slice(0, 5);
                const antList = document.getElementById('topAntiquityList') || document.getElementById('tenureRankingList');
                if (antList) {
                    antList.innerHTML = topAntRows.map((e, i) => {
                        const st = getStyle(e.pa);
                        return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${st.color};">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: ${st.color}; border: 1px solid #e2e8f0; font-size: 14px;">${i + 1}</div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-weight: 800; color: #1e293b; font-size: 13px;">${e.n}</span>
                                <span style="font-size: 10px; color: #64748b; font-weight: 600;">${e.dir} | ${e.pa}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 900; color: #3b82f6; font-size: 16px;">${(Number(e.tenure) || 0).toFixed(1)} <span style="font-size: 9px; font-weight: 700; color: #94a3b8;">AÑO</span></div>
                            <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">Ingreso: ${e.fi}</div>
                        </div>
                    </div> `;
                    }).join('');
                }

                // G. Estructura por Antigüedad
                const ctxRetg = document.getElementById('chartRetenciónGauge');
                if (ctxRetg) {
                    const tRanges = { '0-1': 0, '1-3': 0, '3-5': 0, '5+': 0 };
                    let totalT = 0;
                    tenures.forEach(e => {
                        const tv = e.tenure || 0;
                        totalT += tv;
                        if (tv < 1) tRanges['0-1']++;
                        else if (tv < 3) tRanges['1-3']++;
                        else if (tv < 5) tRanges['3-5']++;
                        else tRanges['5+']++;
                    });

                    const avgT = tenures.length > 0 ? (totalT / tenures.length).toFixed(1) : '0';
                    const lblTMain = document.getElementById('lblTenureMain');
                    if (lblTMain) lblTMain.innerText = avgT;
                    const lblTAvg = document.getElementById('lblTenureAvgValue');
                    if (lblTAvg) lblTAvg.innerText = avgT + ' A ';
                    const lblT01 = document.getElementById('lblTenure01Val');
                    if (lblT01) lblT01.innerText = tRanges['0-1'];
                    const lblT13 = document.getElementById('lblTenure13Val');
                    if (lblT13) lblT13.innerText = tRanges['1-3'];

                    try {
                        window.activeCharts.push(new Chart(ctxRetg.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: Object.keys(tRanges),
                                datasets: [{
                                    data: Object.values(tRanges),
                                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                                    borderWidth: 0,
                                    cutout: '75%',
                                    borderRadius: 6
                                }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: true } }
                            }
                        }));
                    } catch (e) { console.error("Tenure Gauge Chart failed:", e); }
                }

                // ================= NEW COMPARATIVE GROWTH CHARTS =================
                const yValRaw = document.getElementById('yearSel').value;
                const mVal = document.getElementById('monthSel').value;

                // Handle 'ALL' by picking the last available year
                const yearsInDataset = [...new Set(empsRaw.map(e => e.y))].filter(y => y).sort((a, b) => b - a);
                let growthY = (yValRaw === 'ALL') ? (yearsInDataset[0] || 2026) : parseInt(yValRaw);
                const prevY = growthY - 1;

                // If month is ALL, we pick the last month that has data for the current year
                let growthM = 12;
                if (mVal !== 'ALL') {
                    growthM = parseInt(mVal);
                } else {
                    const monthsForYear = empsRaw.filter(e => e.y == growthY).map(e => e.m);
                    growthM = monthsForYear.length > 0 ? Math.max(...monthsForYear) : 12;
                }

                if (growthY) {

                    const getHCForPeriod = (year, month, groupingField) => {
                        const counts = {};
                        const filtered = empsRaw.filter(e => e.y == year && e.m == month);
                        filtered.forEach(e => {
                            const key = e[groupingField] || 'N/A';
                            if (!counts[key]) counts[key] = new Set();
                            counts[key].add(e.c || e.n);
                        });

                        const result = {};
                        Object.keys(counts).forEach(k => result[k] = counts[k].size);

                        // APPLY OVERRIDES TO THIS GROUPING
                        const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                        Object.keys(overrides).forEach(key => {
                            const [pa, emp, ovrY, ovrM] = key.split('_');
                            // We check if this override matches the current period
                            if (ovrY == year && ovrM == month) {
                                if (groupingField === 'pa') {
                                    if (overrides[key].hc !== null) result[pa] = overrides[key].hc;
                                } else if (groupingField === 'e') {
                                    if (overrides[key].hc !== null && (emp === 'ALL' || result[emp] !== undefined)) {
                                        // If override is for a specific company, apply it
                                        if (emp !== 'ALL') result[emp] = overrides[key].hc;
                                    }
                                }
                            }
                        });

                        return result;
                    };

                    const hcCurCountry = getHCForPeriod(growthY, growthM, 'pa');
                    const hcPrevCountry = getHCForPeriod(prevY, growthM, 'pa');
                    const hcCurEmp = getHCForPeriod(growthY, growthM, 'e');
                    const hcPrevEmp = getHCForPeriod(prevY, growthM, 'e');

                    const countryLabels = [...new Set([...Object.keys(hcCurCountry), ...Object.keys(hcPrevCountry)])].sort();
                    const growthDataCountry = countryLabels.map(l => (hcCurCountry[l] || 0) - (hcPrevCountry[l] || 0));

                    const empLabels = [...new Set([...Object.keys(hcCurEmp), ...Object.keys(hcPrevEmp)])]
                        .filter(e => (hcCurEmp[e] || 0) > 0 || (hcPrevEmp[e] || 0) > 0)
                        .sort((a, b) => (hcCurEmp[b] || 0) - (hcCurEmp[a] || 0))
                        .slice(0, 10);
                    const growthDataEmp = empLabels.map(l => (hcCurEmp[l] || 0) - (hcPrevEmp[l] || 0));

                    // Update UI Labels
                    const mnames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const monthName = mnames[growthM] || 'Diciembre';
                    const compStr = `Crecimiento ${monthName} ${growthY} vs.${monthName} ${prevY} `;
                    if (document.getElementById('lblGrowthPais')) document.getElementById('lblGrowthPais').innerText = compStr;
                    if (document.getElementById('lblGrowthEmpresa')) document.getElementById('lblGrowthEmpresa').innerText = compStr;

                    const renderGrowthChart = (ctxId, labels, data, typeLabel) => {
                        const ctx = document.getElementById(ctxId);
                        if (!ctx) return;
                        const bgs = data.map(v => v >= 0 ? '#10b981' : '#ef4444');
                        const borders = data.map(v => v >= 0 ? '#059669' : '#dc2626');

                        try {
                            window.activeCharts.push(new Chart(ctx.getContext('2d'), {
                                type: 'bar',
                                data: {
                                    labels: labels.map(l => (paisMap[l] || l)),
                                    datasets: [{
                                        label: 'Crecimiento HC',
                                        data: data,
                                        backgroundColor: bgs,
                                        borderColor: borders,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        barThickness: 25
                                    }]
                                },
                                options: {
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const val = context.raw;
                                                    return `${val >= 0 ? 'Crecimiento' : 'Baja'}: ${Math.abs(val)} colaboradores`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { grid: { color: '#f1f5f9' }, ticks: { font: { weight: 700 } } },
                                        y: { grid: { display: false }, ticks: { font: { weight: 800, size: 10 } } }
                                    }
                                }
                            }));
                        } catch (e) { console.error("Growth Chart failed:", e); }
                    };

                    const lblP = document.getElementById('lblGrowthPais');
                    const lblE = document.getElementById('lblGrowthEmpresa');
                    const periodText = mVal === 'ALL' ? `Diciembre ${growthY} vs ${prevY} ` : `${mnames[growthM]} ${growthY} vs ${prevY} `;
                    if (lblP) lblP.innerText = periodText;
                    if (lblE) lblE.innerText = periodText;

                    renderGrowthChart('chartCrecimientoPais', countryLabels, growthDataCountry, 'Pais');
                    renderGrowthChart('chartCrecimientoEmpresa', empLabels, growthDataEmp, 'Empresa');
                }
            }

            // MEGA PRO ROTATION HEATMAP
            function renderAttritionHeatmap() {
                const container = document.getElementById('areaRotationHeatmap');
                if (!container) return;

                const { p: pais, e: emp, a, d, y, m, countries } = getFilters();
                const bajasSource = app.bajas_list || [];
                const empsSource = app.employees || [];

                // 1. Calculate Bajas per area in current period
                const bajas = bajasSource.filter(b => {
                    const matchPa = countries.length === 0 || countries.includes((b.pa || '').toUpperCase());
                    return matchPa && (emp === 'ALL' || b.e === emp) && (y === 'ALL' || b.y == y) && compareMonth(b.m, m);
                });

                const bajasByarea = {};
                bajas.forEach(b => { const area = b.dir || 'Sin area'; bajasByarea[area] = (bajasByarea[area] || 0) + 1; });

                const hcByarea = {};
                const activeEmps = empsSource.filter(e => {
                    const matchPa = countries.length === 0 || countries.includes((e.pa || '').toUpperCase());
                    return matchPa && (emp === 'ALL' || e.e === emp) && (y === 'ALL' || e.y == y) && compareMonth(e.m, m);
                });
                activeEmps.forEach(e => { const area = e.dir || 'Sin area'; hcByarea[area] = (hcByarea[area] || 0) + 1; });

                const areas = [...new Set([...Object.keys(bajasByarea), ...Object.keys(hcByarea)])].sort();
                const stats = areas.map(name => {
                    const numBajas = bajasByarea[name] || 0;
                    const curHC = hcByarea[name] || 0;
                    const rate = curHC > 0 ? (numBajas / curHC) * 100 : 0;
                    return { name, bajas: numBajas, hc: curHC, rate };
                }).filter(s => s.bajas > 0).sort((a, b) => b.rate - a.rate);

                if (stats.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8; font-weight:700;">No hay datos de Rotación para los filtros seleccionados.</div>`;
                    return;
                }

                container.innerHTML = `
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:15px;">
                        ${stats.map(s => {
                    let color = '#10b981';
                    if (s.rate > 15) color = '#ef4444';
                    else if (s.rate > 5) color = '#f59e0b';

                    return `
                                <div style="background:${color}15; border:1.5px solid ${color}; padding:15px; border-radius:14px; text-align:center;">
                                    <div style="font-size:24px; font-weight:900; color:${color}; margin-bottom:4px;">${s.bajas}</div>
                                    <div style="font-size:10px; font-weight:800; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8;">${s.name}</div>
                                    <div style="font-size:9px; font-weight:900; color:${color}; margin-top:8px;">${s.rate.toFixed(1)}% Rotación</div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;
            }

            function renderHeatmap(emps) {
                const container = document.getElementById('regionalHeatmap');
                if (!container) return;
                const f = (typeof getFilters === 'function') ? getFilters() : {};
                const sourceEmps = emps || (cachedEmps ? cachedEmps.unique : []) || [];
                const mode = window._flagMode || 'hc';
                const hcType = window._hcType || 'neto';
                const isAllMonth = f.m === 'ALL' || f.m === '0' || f.m === 0 || f.m == null;
                const targetY = parseInt(f.y || f.yc || new Date().getFullYear());
                const targetM = (typeof normalizeMonth === 'function') ? normalizeMonth(f.m || f.mc || 0) : parseInt(f.m || f.mc || 0);
                const matchBase = (row) => {
                    const pa = row._pa || (typeof normalizePa === 'function' ? normalizePa(row.pa) : row.pa);
                    const emp = (row.e || '').toUpperCase().trim();
                    const area = (row.dir || row.area || '').toUpperCase().trim();
                    const dept = (row.d || row.depto || '').toUpperCase().trim();
                    const matchP = !f.countries || f.countries.length === 0 || f.countries.includes(pa);
                    const matchE = !f.e || f.e === 'ALL' || emp === String(f.e || '').toUpperCase().trim();
                    const matchA = !f.a || f.a === 'ALL' || area === String(f.a || '').toUpperCase().trim();
                    const matchD = !f.d || f.d === 'ALL' || dept === String(f.d || '').toUpperCase().trim();
                    return matchP && matchE && matchA && matchD;
                };
                let sourceRows = sourceEmps;
                let metricLabel = hcType === 'bruto' ? 'HC BRUTO' : 'HC NETO';
                if (mode === 'altas') {
                    const allEmployees = window.allEmployees || window.employees || window.app?.employees || app?.employees || [];
                    sourceRows = allEmployees.filter(e => {
                        const yy = parseInt(e._fiY || e.yi || e.y || 0);
                        const mm = parseInt(e._fiM || e.mi || e.m || 0);
                        return matchBase(e) && (!targetY || yy === targetY) && (isAllMonth || mm === targetM);
                    });
                    metricLabel = 'ALTAS';
                } else if (mode === 'bajas') {
                    const allBajas = window.allBajas || window.app?.bajas_list || app?.bajas_list || [];
                    sourceRows = allBajas.filter(b => {
                        const yy = parseInt(b._y || b.y || 0);
                        const mm = (typeof normalizeMonth === 'function') ? normalizeMonth(b._m || b.m) : parseInt(b._m || b.m || 0);
                        return matchBase(b) && (!targetY || yy === targetY) && (isAllMonth || mm === targetM);
                    });
                    metricLabel = 'BAJAS';
                }
                const totalEl = document.getElementById('positionDensityTotal');
                if (sourceRows.length === 0) {
                    if (totalEl) totalEl.innerHTML = '<span>0</span><small>' + metricLabel + '</small>';
                    container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8; font-weight:900;">Sin datos de puestos</div>';
                    return;
                }
                const showAll = document.getElementById('chkShowAllPos')?.checked || false;
                const counts = {};
                sourceRows.forEach(e => {
                    const p = (e.p || e.puesto || e.posicion || 'Sin Puesto').trim().toUpperCase();
                    counts[p] = (counts[p] || 0) + 1;
                });
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                if (totalEl) totalEl.innerHTML = '<span>' + total.toLocaleString() + '</span><small>' + metricLabel + '</small>';
                let sorted = Object.entries(counts).map(([name, hc]) => ({ name, hc })).sort((a, b) => b.hc - a.hc);
                if (!showAll) sorted = sorted.slice(0, 10);
                const maxVal = sorted[0]?.hc || 1;
                container.innerHTML = '<div class="position-density-grid" style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px; width:100%;">' + sorted.map(function(s, i) {
                    const ratio = Math.max(0.18, s.hc / maxVal);
                    const bg = i === 0 ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'linear-gradient(135deg,rgba(139,92,246,' + (0.12 + ratio * 0.32) + '),rgba(59,130,246,' + (0.08 + ratio * 0.22) + '))';
                    const color = i === 0 ? '#fff' : '#1e293b';
                    const isFull = i === sorted.length - 1 && sorted.length % 3 !== 0;
                    return '<div style="grid-column:' + (isFull ? '1 / -1' : 'auto') + '; background:' + bg + '; color:' + color + '; padding:18px 16px; border-radius:14px; text-align:left; transition:0.3s; box-shadow:0 10px 22px rgba(99,102,241,0.10); border:1px solid rgba(139,92,246,0.18); min-height:92px; display:flex; flex-direction:column; justify-content:space-between;"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><span style="font-size:27px; font-weight:1000; line-height:1;">' + s.hc.toLocaleString() + '</span><span style="font-size:10px;font-weight:1000;opacity:.78;">' + ((s.hc / total) * 100).toFixed(0) + '%</span></div><div style="font-size:10px; font-weight:1000; text-transform:uppercase; opacity:0.84; letter-spacing:0; line-height:1.25;">' + s.name + '</div></div>';
                }).join('') + '</div>';
            }




