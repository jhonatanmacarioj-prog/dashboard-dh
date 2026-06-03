// Cost dashboard helpers and renderer extracted from the main HTML.

// Ayudantes de degradados lineales para Chart.js
function getVGrad(ctxEl, colorStart, colorEnd, height = 180) {
    if (!ctxEl) return colorStart;
    try {
        const c2d = ctxEl.getContext('2d');
        const grad = c2d.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        return grad;
    } catch(e) {
        return colorStart;
    }
}

function getHGrad(ctxEl, colorStart, colorEnd, width = 300) {
    if (!ctxEl) return colorStart;
    try {
        const c2d = ctxEl.getContext('2d');
        const grad = c2d.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        return grad;
    } catch(e) {
        return colorStart;
    }
}

function getCurrency() {
                const cMap = (typeof window.currencyMap !== 'undefined' ? window.currencyMap : (typeof currencyMap !== 'undefined' ? currencyMap : {}));
                const multi = window._selectedMS;
                if (multi && multi.msPa && multi.msPa.length === 1) return cMap[multi.msPa[0]] || '';
                return '';
            }
            

            function fmtMoney(val) {
                if (val === undefined || val === null || isNaN(val)) return '-';
                const c = window.useUSD ? '$' : (window.localCurrency || 'Q');
                const symbol = c ? c + '\u00A0' : '';
                return symbol + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            const fM = fmtMoney;

            // Global Conversion Helper for Costs (Robust & Optimized)
            window._tcCache = null; // Memory cache to avoid 10,000+ JSON.parse calls
            function getC(val, xr, showUSD, pa) {
                const v = parseFloat(val) || 0;
                if (!showUSD || v === 0) return v;

                if (!window._tcCache) {
                    try {
                        window._tcCache = JSON.parse(localStorage.getItem('asys_tc_map_v2') || '{}');
                    } catch(e) { window._tcCache = {}; }
                }
                const savedTC = window._tcCache;
                
                if (!window._currentFilters) window._currentFilters = getFilters();
                const f = window._currentFilters;
                const y = f.y !== 'ALL' ? f.y : 2026;
                const m = f.m !== 'ALL' ? f.m : 3;
                
                const userTC = savedTC[`${pa}|${y}|${m}`] || savedTC[`${pa}| ${y}| ${m} `];

                if (userTC && !isNaN(userTC) && userTC > 0) {
                    return v / parseFloat(userTC);
                }

                // Priority 2: Hardcoded Defaults (if no TC provided in data)
                if (pa === 'GT') return v / 7.66476;
                let r = (typeof xr === 'number') ? xr : parseFloat(xr);
                if (isNaN(r) || (typeof xr === 'string' && xr.indexOf('.', xr.indexOf('.') + 1) !== -1)) {
                    const parts = String(xr || "").split('.');
                    r = parseFloat(parts[0] + '.' + (parts[1] || '0'));
                }

                if (!r || r <= 1.1 || isNaN(r)) {
                    if (pa === 'CR') r = 600.0;
                    else if (pa === 'HN') r = 25.25;
                    else if (pa === 'SV' || pa === 'PA' || pa === 'PN' || pa === 'DM') r = 1.0;
                    else if (pa === 'PY') r = 7500.0;
                    else if (pa === 'TT' || pa === 'TYT' || pa === 'NI' || pa === 'NIC') r = (pa==='TT'?500:pa==='NI'?36:600);
                    else r = 1.0;
                }
                return v / r;
            }

            function costShort(v, currency) {
                const n = Number(v) || 0;
                const abs = Math.abs(n);
                const sym = currency ? currency + ' ' : '';
                if (abs >= 1000000) return sym + (n / 1000000).toFixed(2) + 'M';
                if (abs >= 1000) return sym + (n / 1000).toFixed(1) + 'K';
                return sym + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
            }

            function costFull(v, currency) {
                const sym = currency ? currency + ' ' : '';
                return sym + (Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            
function costAxisLabel(label, maxLen = 24) {
    const raw = String(label || 'N/A').trim();
    if (raw.length <= maxLen) return raw;
    const words = raw.split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(word => {
        if ((line + ' ' + word).trim().length > maxLen && line) {
            lines.push(line);
            line = word;
        } else {
            line = (line + ' ' + word).trim();
        }
    });
    if (line) lines.push(line);
    return lines.slice(0, 2).join(' ');
}

function costTotal(e, showUSD, includeVac = true, includeInd = true) {
                const gross = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                const prov = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (includeVac ? (Number(e.p_vac)||0) : 0) + (includeInd ? (Number(e.p_ind)||0) : 0);
                const patronal = Number(e.p_pat) || 0;
                return getC(gross + prov + patronal, e.xr, showUSD, e.pa);
            }

            function costGroup(rows, keyFn, valueFn) {
                const out = {};
                rows.forEach(r => {
                    const key = keyFn(r) || 'N/A';
                    out[key] = (out[key] || 0) + valueFn(r);
                });
                return Object.entries(out).sort((a, b) => b[1] - a[1]);
            }

            function costChartBase(currency) {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { 
                                color: '#334155', 
                                font: { family: 'Montserrat', size: 11, weight: '600' }, 
                                boxWidth: 8, 
                                usePointStyle: true 
                            } 
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', // Vidrio oscuro premium
                            titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                            bodyFont: { family: 'Montserrat', size: 12 },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            boxPadding: 4,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: { 
                                label: ctx => ` ${ctx.dataset.label || ctx.label}: ${costFull(ctx.raw, currency)}` 
                            }
                        }
                    },
                    scales: {
                        x: { 
                            grid: { display: false }, 
                            ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' } } 
                        },
                        y: { 
                            grid: { color: 'rgba(148, 163, 184, 0.08)' }, // Cuadrícula muy sutil y limpia
                            ticks: { 
                                color: '#64748b', 
                                font: { family: 'Montserrat', size: 10, weight: '600' }, 
                                callback: v => costShort(v, currency) 
                            } 
                        }
                    }
                };
            }

function renderCostos(s, emps) {
                const pane = document.getElementById('costosView');
                if (!pane) { console.error('R costosView element missing'); return; }

                // 1. Initial State & Filters
                window.activeCharts = Array.isArray(window.activeCharts) ? window.activeCharts : [];
                window.activeCharts.forEach(c => { if (c && typeof c.destroy === 'function') { try { c.destroy(); } catch(e) {} } });
                window.activeCharts = [];
                const { p: pais, e: emp, a: area, d: depto, y: yr, m: mo, countries } = getFilters();
                const showUSD = window.useUSD || false;
                const currency = showUSD ? '$' : getCurrency();
                const fM = (v) => (currency ? currency + ' ' : '') + (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                // 2. Filter Logic First
                let filtered = emps;
                if (window.costSearch) {
                    const sVal = window.costSearch.toLowerCase();
                    filtered = emps.filter(e =>
                        (e.n || '').toLowerCase().includes(sVal) ||
                        (e.p || '').toLowerCase().includes(sVal) ||
                        (e.c || '').toLowerCase().includes(sVal)
                    );
                }

                // Core Totals  -  10 exact cost columns from the data
                const tSO = filtered.reduce((a, b) => a + getC(b.so, b.xr, showUSD, b.pa), 0);
                const tB37 = filtered.reduce((a, b) => a + getC(b.b37, b.xr, showUSD, b.pa), 0);
                const tB78 = filtered.reduce((a, b) => a + getC(b.b78, b.xr, showUSD, b.pa), 0);
                const tVar = filtered.reduce((a, b) => a + getC(b.bv, b.xr, showUSD, b.pa), 0);
                const tHE = filtered.reduce((a, b) => a + getC(b.he, b.xr, showUSD, b.pa), 0);
                const tAgui = filtered.reduce((a, b) => a + getC(b.p_agui, b.xr, showUSD, b.pa), 0);
                const tB14 = filtered.reduce((a, b) => a + getC(b.p_b14, b.xr, showUSD, b.pa), 0);
                const tVac = filtered.reduce((a, b) => a + getC(b.p_vac, b.xr, showUSD, b.pa), 0);
                const tInd = filtered.reduce((a, b) => a + getC(b.p_ind, b.xr, showUSD, b.pa), 0);
                const tPat = filtered.reduce((a, b) => a + getC(b.p_pat, b.xr, showUSD, b.pa), 0);

                const tGross = tSO + tB37 + tB78 + tVar + tHE;
                const tProv = tAgui + tB14 + (window.inclVac !== false ? tVac : 0) + (window.inclInd !== false ? tInd : 0);
                const tTotalCurrent = tGross + tPat + tProv;

                // YoY Calculation (Same period previous year)
                let tTotalPrev = 0;
                if (yr !== 'ALL') {
                    const prevY = parseInt(yr) - 1;
                    const prevEmps = app.employees.filter(e => {
                        const cp = normalizePa(e.pa);
                        return (countries.length === 0 || countries.includes(cp)) && (emp === 'ALL' || e.e === emp) && (area === 'ALL' || e.dir === area) && (depto === 'ALL' || e.d === depto) && (e.y == prevY) && compareMonth(e.m, mo);
                    });
                    const pSO = prevEmps.reduce((a, b) => a + getC(b.so, b.xr, showUSD, b.pa), 0);
                    const pB37 = prevEmps.reduce((a, b) => a + getC(b.b37, b.xr, showUSD, b.pa), 0);
                    const pB78 = prevEmps.reduce((a, b) => a + getC(b.b78, b.xr, showUSD, b.pa), 0);
                    const pVar = prevEmps.reduce((a, b) => a + getC(b.bv, b.xr, showUSD, b.pa), 0);
                    const pHE = prevEmps.reduce((a, b) => a + getC(b.he, b.xr, showUSD, b.pa), 0);
                    const pAgui = prevEmps.reduce((a, b) => a + getC(b.p_agui, b.xr, showUSD, b.pa), 0);
                    const pB14 = prevEmps.reduce((a, b) => a + getC(b.p_b14, b.xr, showUSD, b.pa), 0);
                    const pVac = prevEmps.reduce((a, b) => a + getC(b.p_vac, b.xr, showUSD, b.pa), 0);
                    const pInd = prevEmps.reduce((a, b) => a + getC(b.p_ind, b.xr, showUSD, b.pa), 0);
                    const pPat = prevEmps.reduce((a, b) => a + getC(b.p_pat, b.xr, showUSD, b.pa), 0);
                    const pProv = pAgui + pB14 + (window.inclVac !== false ? pVac : 0) + (window.inclInd !== false ? pInd : 0);
                    tTotalPrev = pSO + pB37 + pB78 + pVar + pHE + pPat + pProv;
                }
                const yoyDiff = tTotalPrev > 0 ? ((tTotalCurrent - tTotalPrev) / tTotalPrev) * 100 : 0;
                const yoyText = yr === 'ALL' ? 'N/A' : (tTotalPrev > 0 ? `${yoyDiff.toFixed(1)}% vs año Ant.` : 'Sin histórico');


                // 3. Robust Trend Logic (Variable & Average Cost p/Head)
                const fullMonthsList = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                if (window._costViewLength === undefined) window._costViewLength = window.showFullYearTrend ? 12 : 6;
                const spanMonths = window._costViewLength || 6;
                window.showFullYearTrend = spanMonths >= 12;
                let anchorYear = yr !== 'ALL' ? parseInt(yr) : new Date().getFullYear();
                let anchorMonth = mo !== 'ALL' ? parseInt(mo) : new Date().getMonth() + 1;

                const trendSlots = [];
                for (let i = spanMonths - 1; i >= 0; i--) {
                    let m2 = anchorMonth - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    trendSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + ' ' + String(y2).slice(-2) });
                }

                const varTrend = new Array(spanMonths).fill(0);
                const costTrendForAvg = new Array(spanMonths).fill(0);
                const supportTrend = new Array(spanMonths).fill(0);
                const hcTrendForAvg = new Array(spanMonths).fill(0);

                app.employees.forEach(e => {
                    const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                    if (!matchPa || (emp !== 'ALL' && e.e !== emp) || (area !== 'ALL' && e.dir !== area) || (depto !== 'ALL' && e.d !== depto)) return;
                    for (let idx = 0; idx < spanMonths; idx++) {
                        if (e.y == trendSlots[idx].y && compareMonth(e.m, trendSlots[idx].m)) {
                            varTrend[idx] += getC(e.bv, e.xr, showUSD, e.pa);
                            const b = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                            const p = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_pat)||0);
                            const x = (window.inclVac !== false ? (Number(e.p_vac)||0) : 0) + (window.inclInd !== false ? (Number(e.p_ind)||0) : 0);
                            costTrendForAvg[idx] += getC(b + p + x, e.xr, showUSD, e.pa);
                            supportTrend[idx] += getC(p + x, e.xr, showUSD, e.pa);
                            hcTrendForAvg[idx]++;
                        }
                    }
                });
                const priorTrendSlots = [];
                for (let i = spanMonths - 1; i >= 0; i--) {
                    let m2 = anchorMonth - spanMonths - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    priorTrendSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + ' ' + String(y2).slice(-2) });
                }
                const priorVarTrend = new Array(spanMonths).fill(0);
                const priorCostTrend = new Array(spanMonths).fill(0);
                const priorSupportTrend = new Array(spanMonths).fill(0);
                const priorHcTrend = new Array(spanMonths).fill(0);
                app.employees.forEach(e => {
                    const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                    if (!matchPa || (emp !== 'ALL' && e.e !== emp) || (area !== 'ALL' && e.dir !== area) || (depto !== 'ALL' && e.d !== depto)) return;
                    for (let idx = 0; idx < spanMonths; idx++) {
                        if (e.y == priorTrendSlots[idx].y && compareMonth(e.m, priorTrendSlots[idx].m)) {
                            priorVarTrend[idx] += getC(e.bv, e.xr, showUSD, e.pa);
                            const b = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                            const p = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_pat)||0);
                            const x = (window.inclVac !== false ? (Number(e.p_vac)||0) : 0) + (window.inclInd !== false ? (Number(e.p_ind)||0) : 0);
                            priorCostTrend[idx] += getC(b + p + x, e.xr, showUSD, e.pa);
                            priorSupportTrend[idx] += getC(p + x, e.xr, showUSD, e.pa);
                            priorHcTrend[idx]++;
                        }
                    }
                });
                const finalCostPerEmp = costTrendForAvg.map((c, i) => hcTrendForAvg[i] > 0 ? c / hcTrendForAvg[i] : 0);
                const priorCostPerEmp = priorCostTrend.map((c, i) => priorHcTrend[i] > 0 ? c / priorHcTrend[i] : 0);
                const trendLabels = trendSlots.map(s => s.label);
                const avgCost = costTrendForAvg.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const avgVar = varTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const avgSupport = supportTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);

                // Annual Trend for Comparison (9th Chart)
                const twelveSlots = [];
                for (let i = 11; i >= 0; i--) {
                    let m2 = anchorMonth - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    twelveSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + "'" + String(y2).slice(-2) });
                }
                const annualTrendData = Array(12).fill(0);
                app.employees.forEach(e => {
                    if ((pais === 'ALL' || e.pa === pais) && (emp === 'ALL' || e.e === emp)) {
                        for (let i = 0; i < 12; i++) {
                            if (e.y == twelveSlots[i].y && compareMonth(e.m, twelveSlots[i].m)) {
                                const b = (Number(e.so)||0) + (Number(e.bv)||0) + (Number(e.p_pat)||0);
                                annualTrendData[i] += getC(b, e.xr, showUSD, e.pa);
                            }
                        }
                    }
                });

                // Update Header and HTML Structure
                const needsFullRender = !pane.querySelector('#tbodyCostos') || !pane.querySelector('#chartVarTrend') || !pane.querySelector('#chartAnnualCost') || pane.dataset.usdMode !== String(!!showUSD);
                if (needsFullRender) {
                    const pText = (mo === 'ALL' || !mo) ? `año ${yr}` : `${fullMonthsList[mo - 1]} ${yr}`;
                    pane.innerHTML = `
                        <div class="cost-hero-panel">
                            <div>
                                <h2><i class="fas fa-sack-dollar"></i> ANÁLISIS DE COSTOS | ${yr === 'ALL' ? 'TODOS' : yr}</h2>
                                <p>Análisis ${pText}: nómina base, variables, provisiones y cargas patronales</p>
                            </div>
                            <div class="cost-hero-actions">
                                <div id="currentTCDisp" class="cost-pill-stat">${showUSD ? 'USD activo' : 'Moneda local'}</div>
                                <div class="cost-currency-toggle">
                                    <button id="btnCostLocal" class="${!showUSD ? 'active' : ''}" onclick="window.useUSD=false; renderAll();">LOCAL</button>
                                    <button id="btnCostUSD" class="${showUSD ? 'active' : ''}" onclick="window.useUSD=true; renderAll();">USD ($)</button>
                                </div>
                            </div>
                        </div>

                        <div id="kpiCosts" class="kpi-row cost-kpi-grid"></div>

                        <div class="cost-history-panel">
                            <div class="cost-history-copy">
                                <h3><i class="fas fa-chart-line"></i> COSTOS HISTORICO</h3>
                                <p>Tendencia mensual de nomina, variables y cargas</p>
                            </div>
                            <div class="cost-history-controls">
                                <button id="btnCost6m" onclick="window._costViewLength=6; renderAll();">6 MESES</button>
                                <button id="btnCost12m" onclick="window._costViewLength=12; renderAll();">12 MESES</button>
                                <button id="btnCost1y" onclick="window._costViewLength=12; renderAll();">1 ANO</button>
                            </div>
                            <div class="cost-history-series">
                                <div class="cost-history-label">ACTUAL:</div>
                                <div><span class="cost-dot cost-dot-total"></span>TOTAL</div>
                                <div><span class="cost-dot cost-dot-var"></span>VARIABLES</div>
                                <div><span class="cost-dot cost-dot-support"></span>CARGAS</div>
                                <button onclick="window._costViewLength=6; window.inclVac=true; window.inclInd=true; renderAll();"><i class="fas fa-filter-circle-xmark"></i> LIMPIAR FILTROS</button>
                                <div class="cost-history-label cost-history-prev">ANTERIOR:</div>
                                <div><span class="cost-dot cost-dot-total prev"></span>TOTAL</div>
                                <div><span class="cost-dot cost-dot-var prev"></span>VARIABLES</div>
                                <div><span class="cost-dot cost-dot-support prev"></span>CARGAS</div>
                            </div>
                            <div id="costComparisonGrid" class="cost-comparison-grid"></div>
                        </div>

                        <div class="cost-control-strip">
                            <label>
                                <input type="checkbox" ${window.inclVac !== false ? 'checked' : ''} onchange="window.inclVac=this.checked; renderAll();">
                                <span>Incluir vacaciones</span>
                            </label>
                            <label>
                                <input type="checkbox" ${window.inclInd !== false ? 'checked' : ''} onchange="window.inclInd=this.checked; renderAll();">
                                <span>Incluir indemnización</span>
                            </label>
                        </div>

                        <div class="cost-grid-split">
                            <div class="card-box cost-chart-card cost-panel-dark">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-layer-group"></i> Costos por región y país</h3>
                                        <p>Comparativo por país de salario base, variables y cargas.</p>
                                    </div>
                                    <div id="costRegionTotalBadge" class="cost-pill-stat"></div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartRegStacked"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card cost-panel-dark">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-chart-pie"></i> Distribución de rubros</h3>
                                        <p>Participación de salario, variables, patronales y provisiones.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostBreakdownDonut"></canvas></div>
                            </div>
                        </div>

                        <div class="cost-grid-split">
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-chart-line"></i> Tendencia del costo de nómina</h3>
                                        <p>Evolución mensual consolidada del costo total.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartPayrollTrend"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-compass"></i> Mix por dirección</h3>
                                        <p>Concentración del gasto según la dirección operativa.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDirDonut"></canvas></div>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card">
                            <div class="cost-card-head">
                                <div>
                                    <h3><i class="fas fa-bolt"></i> Tendencia de bono variable</h3>
                                    <p>Evolución de pagos variables y extraordinarios contra promedio.</p>
                                </div>
                            </div>
                            <div class="cost-chart-stage cost-chart-stage-xl"><canvas id="chartVarTrend"></canvas></div>
                        </div>

                        <div id="costVariableInsights" class="cost-grid-split cost-grid-split-tight">
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head"><div><h3><i class="fa-solid fa-trophy"></i> Quién comisiona más</h3><p>Ranking de personas con mayor variable en el filtro actual.</p></div></div>
                                <div class="cost-chart-stage cost-chart-stage-lg"><canvas id="chartTopVariablePeople"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head"><div><h3><i class="fa-solid fa-compass"></i> Mapa de presión variable</h3><p>Relación del variable sobre costo total y concentración por área.</p></div></div>
                                <div id="costWowSummary" class="cost-wow-summary"></div>
                                <div class="cost-chart-stage cost-chart-stage-sm"><canvas id="chartVariableEfficiency"></canvas></div>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card">
                            <div class="cost-card-head"><div><h3><i class="fas fa-users"></i> Costo promedio mensual por colaborador</h3><p>Costo mensual promedio para sostener el headcount del periodo seleccionado.</p></div></div>
                            <div class="cost-chart-stage cost-chart-stage-lg"><canvas id="chartCostPerEmp"></canvas></div>
                        </div>

                        <div class="cost-grid-duo">
                            <div class="card-box cost-chart-card"><div class="cost-card-head"><div><h3><i class="fas fa-building"></i> Top 10 direcciones</h3><p>Direcciones con mayor participación en el costo total del periodo.</p></div></div><div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDir"></canvas></div></div>
                            <div class="card-box cost-chart-card"><div class="cost-card-head"><div><h3><i class="fas fa-diagram-project"></i> Top 10 departamentos</h3><p>Departamentos con mayor costo integrado: salario, variable y cargas patronales.</p></div></div><div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDepto"></canvas></div></div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card" style="background:#f8fafc;">
                            <div class="cost-card-head"><div><h3><i class="fas fa-chart-area"></i> Evolución mensual 12 meses</h3><p>Tendencia consolidada de los últimos 12 meses para identificar presión de costos y estacionalidad.</p></div></div>
                            <div class="cost-chart-stage cost-chart-stage-sm"><canvas id="chartAnnualCost"></canvas></div>
                        </div>

                        <div id="kpiCostPerCountry" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:14px; margin-bottom:25px;"></div>

                        <div class="card-box cost-simulator-card">
                            <div class="card-title" style="margin-bottom: 20px;">
                                <h3 style="color:#fff; font-size: 18px;"><i class="fas fa-calculator" style="color:var(--ac); margin-right: 10px;"></i> Simulador de Impacto Financiero</h3>
                            </div>
                            <div class="cost-simulator-grid">
                                <div><label style="font-size:11px; font-weight:700;">Ajuste Salarial (%)</label><input type="range" id="simSalary" min="-20" max="50" value="0" step="1" oninput="updateSimulation()" style="width:100%;"><div id="valSimSalary" style="font-weight:900;">0%</div></div>
                                <div><label style="font-size:11px; font-weight:700;">Ajuste Bonos (%)</label><input type="range" id="simBono" min="-50" max="100" value="0" step="5" oninput="updateSimulation()" style="width:100%;"><div id="valSimBono" style="font-weight:900;">0%</div></div>
                                <div><label style="font-size:11px; font-weight:700;">Reducción rotación (%)</label><input type="range" id="simRot" min="-100" max="0" value="0" step="5" oninput="updateSimulation()" style="width:100%;"><div id="valSimRot" style="font-weight:900;">0%</div></div>
                            </div>
                            <div class="cost-simulator-result">
                                <div id="labelSimImpact" style="font-size:28px; font-weight:1000; color:#10b981; font-family:'Montserrat';">+ 0.00</div>
                                <button onclick="resetSim()" class="btn-top" style="background:rgba(255,255,255,0.1); border:none; color:#fff; padding:10px 20px; border-radius:10px; cursor:pointer;">RESETEAR</button>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card">
                            <div class="cost-card-head cost-table-head">
                                <div><h3><i class="fas fa-table"></i> Detalle de colaboradores</h3><p>Desglose financiero pormenorizado por persona.</p></div>
                                <div class="cost-toolbar-right">
                                    <input type="text" id="costSearch" class="cost-search-input" placeholder="Buscar colaborador..." oninput="applyCostSearch(this.value)" value="${window.costSearch || ''}">
                                    <button onclick="exportData()" class="btn-top cost-export-btn"><i class="fas fa-file-excel"></i> Exportar Excel</button>
                                </div>
                            </div>
                            <div id="costLimitMsg" class="cost-limit-msg"></div>
                            <div class="table-wrap cost-table-wrap"><table id="costTable" class="cost-detail-table"><thead><tr><th>CÓDIGO</th><th>NOMBRE</th><th>PUESTO</th><th>ÁREA</th><th class="num total">TOTAL 10 COLS</th><th class="num">SALARIO</th><th class="num">BONO 37</th><th class="num">BONO 78</th><th class="num">VARIABLES</th><th class="num">HORAS EXTRA</th><th class="num">AGUINALDO</th><th class="num">BONO 14</th><th class="num">VACACIONES</th><th class="num">INDEMN.</th><th class="num">CUOTAS PAT.</th></tr></thead><tbody id="tbodyCostos"></tbody></table></div>
                        </div>
                    `;
                    pane.dataset.usdMode = String(!!showUSD);
                }
                // 4. Update Header and KPIs
                const subTitle = pane.querySelector('.cost-hero-panel p');
                if (subTitle) {
                    const pText = (mo === 'ALL' || !mo) ? `año ${yr}` : `${fullMonthsList[mo - 1]} ${yr}`;
                    subTitle.innerText = `Análisis ${pText}: nómina base, variables, provisiones y cargas patronales`;
                    const heroTitle = pane.querySelector('.cost-hero-panel h2');
                    if (heroTitle) heroTitle.innerHTML = `<i class="fas fa-sack-dollar"></i> ANÁLISIS DE COSTOS | ${yr === 'ALL' ? 'TODOS' : yr}`;
                }

                document.getElementById('kpiCosts').innerHTML = `
                    ${kpiCard("Gasto Total", fM(tTotalCurrent), '<i class="fa-solid fa-money-bill-trend-up"></i>', "#0f172a", "sub", yoyText, "", null, "", "Suma de todas las columnas")}
                    ${kpiCard("Salarios Base", fM(tSO), '<i class="fa-solid fa-receipt"></i>', "#8b5cf6", "sub", "", "", null, "", "Suma de Salario Base")}
                    ${kpiCard("Variables", fM(tVar), '<i class="fa-solid fa-bolt"></i>', "#ec4899", "sub", "", "", null, "", "Suma de Bonos Variables")}
                    ${kpiCard("Patronales", fM(tPat), '<i class="fa-solid fa-building-columns"></i>', "#10b981", "sub", "", "", null, "", "Suma Carga Patronal")}
                    ${kpiCard("Provisiones", fM(tProv), '<i class="fa-solid fa-vault"></i>', "#f59e0b", "sub", "", "", null, "", "Suma Prestaciones + Provisiones")}
                `;
                ['btnCost6m','btnCost12m','btnCost1y'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) btn.classList.toggle('active', (id === 'btnCost6m' && spanMonths === 6) || (id !== 'btnCost6m' && spanMonths === 12));
                });
                const costComparisonGrid = document.getElementById('costComparisonGrid');
                if (costComparisonGrid) {
                    const lastCost = costTrendForAvg[costTrendForAvg.length - 1] || 0;
                    const lastVar = varTrend[varTrend.length - 1] || 0;
                    const lastSupport = supportTrend[supportTrend.length - 1] || 0;
                    costComparisonGrid.innerHTML = `
                        <div class="cost-compare-card blue"><span>Costo Promedio</span><b>${fM(avgCost)}</b><small>vs Actual: <strong>${fM(lastCost)}</strong></small></div>
                        <div class="cost-compare-card pink"><span>Prom. Variables</span><b>${fM(avgVar)}</b><small>vs Actual: <strong>${fM(lastVar)}</strong></small></div>
                        <div class="cost-compare-card amber"><span>Prom. Cargas</span><b>${fM(avgSupport)}</b><small>vs Actual: <strong>${fM(lastSupport)}</strong></small></div>
                    `;
                }

                const tbody = document.getElementById('tbodyCostos');
                if (tbody) {
                    const dataLimit = filtered.slice(0, 500);
                    const msgEl = document.getElementById('costLimitMsg');
                    if (msgEl) msgEl.innerHTML = `<i class="fas fa-info-circle"></i> Encontrados: <b>${filtered.length.toLocaleString()}</b>. Mostrando 500 para rendimiento.`;
                    
                    tbody.innerHTML = dataLimit.map(e => {
                        const cv = (v) => getC(v, e.xr, showUSD, e.pa);
                        const rowTotal = cv(e.so) + cv(e.b37) + cv(e.b78) + cv(e.bv) + cv(e.he) + cv(e.p_agui) + cv(e.p_b14) + cv(e.p_vac) + cv(e.p_ind) + cv(e.p_pat);
                        return `<tr>
                            <td>${e.c}</td><td style="font-weight:700;">${e.n}</td><td>${e.p}</td><td>${e.dir}</td>
                            <td style="text-align:right; font-weight:900; color:var(--ac);">${fM(rowTotal)}</td>
                            <td style="text-align:right;">${fM(cv(e.so))}</td><td style="text-align:right;">${fM(cv(e.b37))}</td><td style="text-align:right;">${fM(cv(e.b78))}</td>
                            <td style="text-align:right; font-weight:700; color:#ec4899;">${fM(cv(e.bv))}</td><td style="text-align:right;">${fM(cv(e.he))}</td>
                            <td style="text-align:right; opacity:0.6;">${fM(cv(e.p_agui))}</td><td style="text-align:right; opacity:0.6;">${fM(cv(e.p_b14))}</td>
                            <td style="text-align:right; opacity:0.6;">${fM(cv(e.p_vac))}</td><td style="text-align:right; opacity:0.6;">${fM(cv(e.p_ind))}</td>
                            <td style="text-align:right;">${fM(cv(e.p_pat))}</td>
                        </tr>`;
                    }).join('');
                }

                // 6. Nine Executive Charts (Orchestrated for window.activeCharts tracking)
                const cOpts = costChartBase(currency);
                // 1. Chart Stacked Regions
                const ctxReg = document.getElementById('chartRegStacked');
                if (ctxReg) {
                    const regCosts = {};
                    filtered.forEach(e => {
                        const pa = e.pa; if (!regCosts[pa]) regCosts[pa] = { s:0, b:0, c:0, t:0 };
                        const s = getC(e.so, e.xr, showUSD, e.pa);
                        const b = getC((Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0), e.xr, showUSD, e.pa);
                        const c = getC((Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_vac)||0) + (Number(e.p_ind)||0) + (Number(e.p_pat)||0), e.xr, showUSD, e.pa);
                        regCosts[pa].s += s; regCosts[pa].b += b; regCosts[pa].c += c; regCosts[pa].t += (s+b+c);
                    });
                    const sortedReg = Object.entries(regCosts).sort((a,b) => b[1].t - a[1].t).slice(0, 8);
                    const regionTotal = sortedReg.reduce((sum, r) => sum + r[1].t, 0);
                    const regionBadge = document.getElementById('costRegionTotalBadge');
                    if (regionBadge) regionBadge.innerHTML = `TOTAL <b>${fM(regionTotal)}</b>`;
                    
                    const gradSO = getHGrad(ctxReg, '#6d28d9', '#a78bfa', 520);
                    const gradB = getHGrad(ctxReg, '#0e7490', '#67e8f9', 520);
                    const gradC = getHGrad(ctxReg, '#b45309', '#fcd34d', 520);
                    
                    window.activeCharts.push(new Chart(ctxReg, {
                        type: 'bar',
                        data: {
                            labels: sortedReg.map(r => paisMap[r[0]] || r[0]),
                            datasets: [
                                { label: 'Salario Base', data: sortedReg.map(r => r[1].s), backgroundColor: gradSO, borderColor: '#5b21b6', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 },
                                { label: 'Bonos/Extra', data: sortedReg.map(r => r[1].b), backgroundColor: gradB, borderColor: '#155e75', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 },
                                { label: 'Cargas/Prov', data: sortedReg.map(r => r[1].c), backgroundColor: gradC, borderColor: '#92400e', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 }
                            ]
                        },
                        options: { ...tOpts, indexAxis: 'y', animation: { duration: 800, easing: 'easeOutQuart' }, layout: { padding: { right: 170, left: 6, top: 4, bottom: 2 } }, plugins: { ...tOpts.plugins, legend: { position: 'top', labels: { color: '#1e293b', boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: 'rectRounded', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { ...tOpts.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fM(ctx.raw)}`, footer: items => `Total país: ${fM(items.reduce((sum, item) => sum + (Number(item.parsed.x) || 0), 0))}` } }, datalabels: { display: false } }, scales: { x: { stacked: true, border: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.10)', drawTicks: false }, ticks: { color: '#475569', padding: 8, font: { family: 'Montserrat', size: 10, weight: '800' }, callback: v => costShort(v, currency) } }, y: { stacked: true, border: { display: false }, grid: { display:false }, ticks: { color: '#1e293b', padding: 10, font: { family: 'Montserrat', size: 11, weight: '900' } } } } }
                    }));
                }

                // 2. Breakdown Donut
                const ctxBD = document.getElementById('chartCostBreakdownDonut');
                if (ctxBD) {
                    window.activeCharts.push(new Chart(ctxBD, {
                        type: 'doughnut',
                        data: {
                            labels: ['Salarios', 'Variables', 'Patronales', 'Aguinaldo/B14', 'Vacaciones/Ind'],
                            datasets: [{
                                data: [tSO, tVar, tPat, (tAgui + tB14), (tVac + tInd)],
                                backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'],
                                borderWidth: 2,
                                borderColor: '#ffffff'
                            }]
                        },
                        options: { ...cOpts, cutout: '72%', plugins: { legend: { position: 'right', labels: { color: '#334155', font: { family: 'Montserrat', size: 10, weight: '600' }, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 3. Payroll Trend
                const ctxPT = document.getElementById('chartPayrollTrend');
                if (ctxPT) {
                    const gradPT = getVGrad(ctxPT, 'rgba(139, 92, 246, 0.35)', 'rgba(139, 92, 246, 0.0)', 185);
                    window.activeCharts.push(new Chart(ctxPT, {
                        type: 'line',
                        data: { 
                            labels: trendLabels, 
                            datasets: [{ 
                                label: 'Costo Total', 
                                data: costTrendForAvg, 
                                borderColor: '#8b5cf6', 
                                fill: true, 
                                backgroundColor: gradPT, 
                                tension: 0.4,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#8b5cf6',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor: '#8b5cf6',
                                pointHoverBorderColor: '#ffffff',
                                pointHoverBorderWidth: 2
                            }, {
                                label: 'Anterior',
                                data: priorCostTrend,
                                borderColor: '#64748b',
                                borderDash: [7, 7],
                                borderWidth: 2,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 2,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#64748b'
                            }] 
                        },
                        options: { ...costChartBase(currency), plugins: { ...costChartBase(currency).plugins, legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 4. Mix Direction Donut
                const ctxDM = document.getElementById('chartCostDirDonut');
                if (ctxDM) {
                    const dirs = {}; filtered.forEach(e => { const d = e.dir || 'Otros'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); dirs[d] = (dirs[d]||0)+val; });
                    const sorted = Object.entries(dirs).sort((a,b)=>b[1]-a[1]).slice(0, 6);
                    window.activeCharts.push(new Chart(ctxDM, {
                        type: 'doughnut',
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 24)), datasets: [{ data: sorted.map(s => s[1]), backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#475569'], borderWidth: 2, borderColor: '#ffffff' }] },
                        options: { ...cOpts, cutout: '68%', plugins: { legend: { position: 'right', labels: { color: '#334155', font: { family: 'Montserrat', size: 10, weight: '600' }, usePointStyle: true } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 5. Variable Trend (Styled Magenta Line with Dots)
                const ctxVT = document.getElementById('chartVarTrend');
                if (ctxVT) {
                    const totalVar = varTrend.reduce((a,b)=>a+b,0);
                    const peakIdx = varTrend.reduce((best, v, i) => v > varTrend[best] ? i : best, 0);
                    let varBadge = document.getElementById('costVariableBadge');
                    if (!varBadge) {
                        const vtCard = ctxVT.closest('.card-box');
                        const title = vtCard && (vtCard.querySelector('.cost-card-head') || vtCard.querySelector('.card-title'));
                        if (title) {
                            varBadge = document.createElement('div');
                            varBadge.id = 'costVariableBadge';
                            varBadge.className = 'cost-pill-stat';
                            title.appendChild(varBadge);
                        }
                    }
                    if (varBadge) varBadge.innerHTML = `Pico: <b>${trendLabels[peakIdx]}</b> | ${fM(varTrend[peakIdx] || 0)}`;
                    
                    const gradVTPeak = getVGrad(ctxVT, '#db2777', 'rgba(219, 39, 119, 0.25)', 220);
                    const gradVTNorm = getVGrad(ctxVT, '#ec4899', 'rgba(236, 72, 153, 0.15)', 220);
                    
                    window.activeCharts.push(new Chart(ctxVT, {
                        type: 'bar',
                        data: {
                            labels: trendLabels,
                            datasets: [
                                {
                                    type: 'bar',
                                    label: 'Bono variable',
                                    data: varTrend,
                                    backgroundColor: varTrend.map((v, i) => i === peakIdx ? gradVTPeak : gradVTNorm),
                                    borderRadius: 8,
                                    barThickness: 34
                                },
                                {
                                    type: 'line',
                                    label: 'Promedio',
                                    data: varTrend.map(() => spanMonths ? totalVar / spanMonths : 0),
                                    borderColor: '#475569',
                                    borderDash: [6, 6],
                                    borderWidth: 2,
                                    pointRadius: 0,
                                    tension: 0.35
                                },
                                {
                                    type: 'line',
                                    label: 'Anterior',
                                    data: priorVarTrend,
                                    borderColor: '#64748b',
                                    borderDash: [7, 7],
                                    borderWidth: 2,
                                    pointRadius: 2,
                                    tension: 0.35
                                }
                            ]
                        },
                        options: {
                            ...costChartBase(currency),
                            plugins: {
                                legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '600' } } },
                                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } }
                            },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' } } },
                                y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' }, callback: v => costShort(v, currency) } }
                            }
                        }
                    }));
                }

                // 6. Quién comisiona más
                const ctxTopVar = document.getElementById('chartTopVariablePeople');
                if (ctxTopVar) {
                    const topPeople = filtered
                        .map(e => ({ e, val: getC(e.bv, e.xr, showUSD, e.pa), total: costTotal(e, showUSD, window.inclVac !== false, window.inclInd !== false) }))
                        .filter(x => x.val > 0)
                        .sort((a,b) => b.val - a.val)
                        .slice(0, 12);
                        
                    const gradTopVar = getHGrad(ctxTopVar, '#ec4899', 'rgba(236, 72, 153, 0.25)', 300);
                    
                    window.activeCharts.push(new Chart(ctxTopVar, {
                        type: 'bar',
                        data: {
                            labels: topPeople.map(x => (x.e.n || '').split(' ').slice(0, 3).join(' ')),
                            datasets: [{
                                label: 'Comisión / variable',
                                data: topPeople.map(x => x.val),
                                backgroundColor: gradTopVar,
                                borderRadius: 8
                            }]
                        },
                        options: {
                            ...costChartBase(currency),
                            indexAxis: 'y',
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                                    bodyFont: { family: 'Montserrat', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: {
                                        title: items => topPeople[items[0].dataIndex]?.e.n || '',
                                        label: item => `${topPeople[item.dataIndex]?.e.c || ''} | ${fM(item.raw)}`
                                    }
                                }
                            },
                            scales: {
                                x: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' }, callback: v => costShort(v, currency) } },
                                y: { grid: { display: false }, ticks: { color: '#334155', font: { family: 'Montserrat', size: 10, weight: '600' } } }
                            }
                        }
                    }));
                }

                // 7. Mapa de presión variable
                const ctxEff = document.getElementById('chartVariableEfficiency');
                if (ctxEff) {
                    const byArea = costGroup(filtered, e => e.dir || 'SIN AREA', e => getC(e.bv, e.xr, showUSD, e.pa))
                        .slice(0, 8);
                    const totalVarNow = filtered.reduce((a,e)=>a+getC(e.bv, e.xr, showUSD, e.pa),0);
                    const topArea = byArea[0] || ['Sin data', 0];
                    const wow = document.getElementById('costWowSummary');
                    if (wow) {
                        const ratio = tTotalCurrent > 0 ? (totalVarNow / tTotalCurrent) * 100 : 0;
                        wow.innerHTML = `
                            <div><span>Variable total</span><b>${fM(totalVarNow)}</b></div>
                            <div><span>% del costo</span><b>${ratio.toFixed(1)}%</b></div>
                            <div><span>Área líder</span><b>${topArea[0]}</b></div>
                        `;
                    }
                    window.activeCharts.push(new Chart(ctxEff, {
                        type: 'radar',
                        data: {
                            labels: byArea.map(x => costAxisLabel(x[0], 18)),
                            datasets: [{
                                label: 'Variable por área',
                                data: byArea.map(x => x[1]),
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                                pointBackgroundColor: '#8b5cf6',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 1.5,
                                pointRadius: 3.5,
                                pointHoverRadius: 5.5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false }, 
                                tooltip: { 
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                                    bodyFont: { family: 'Montserrat', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: { label: ctx => ` ${fM(ctx.raw)}` } 
                                } 
                            },
                            scales: { 
                                r: { 
                                    ticks: { display: false }, 
                                    grid: { color: 'rgba(148, 163, 184, 0.08)' }, 
                                    angleLines: { color: 'rgba(148, 163, 184, 0.08)' },
                                    pointLabels: { color: '#64748b', font: { family: 'Montserrat', size: 9, weight: '600' } } 
                                } 
                            }
                        }
                    }));
                }

                // 8. Cost Per Head
                const ctxCPE = document.getElementById('chartCostPerEmp');
                if (ctxCPE) {
                    const gradCPE = getVGrad(ctxCPE, 'rgba(16, 185, 129, 0.35)', 'rgba(16, 185, 129, 0.0)', 185);
                    window.activeCharts.push(new Chart(ctxCPE, {
                        type: 'line',
                        data: { 
                            labels: trendLabels, 
                            datasets: [{ 
                                label: 'Costo p/Cabeza', 
                                data: finalCostPerEmp, 
                                borderColor: '#10b981', 
                                borderWidth: 3, 
                                fill: true, 
                                backgroundColor: gradCPE,
                                tension: 0.4,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#10b981',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor: '#10b981',
                                pointHoverBorderColor: '#ffffff',
                                pointHoverBorderWidth: 2
                            }, {
                                label: 'Anterior',
                                data: priorCostPerEmp,
                                borderColor: '#64748b',
                                borderDash: [7, 7],
                                borderWidth: 2,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 2,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#64748b'
                            }] 
                        },
                        options: { ...costChartBase(currency), plugins: { ...costChartBase(currency).plugins, legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 9. Ranking Dir
                const ctxRankD = document.getElementById('chartCostDir');
                if (ctxRankD) {
                    const dirs = {}; filtered.forEach(e => { const d = e.dir || 'N/A'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); dirs[d] = (dirs[d]||0)+val; });
                    const sorted = Object.entries(dirs).sort((a,b)=>b[1]-a[1]).slice(0, 10);
                    const gradRankD = getHGrad(ctxRankD, '#8b5cf6', 'rgba(139, 92, 246, 0.25)', 350);
                    window.activeCharts.push(new Chart(ctxRankD, {
                        type: 'bar',
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 28)), datasets: [{ label: 'Gasto', data: sorted.map(s => s[1]), backgroundColor: gradRankD, borderRadius: 8, barThickness: 22 }] },
                        options: { ...costChartBase(currency), indexAxis: 'y', plugins: { ...costChartBase(currency).plugins, legend: { display:false } } }
                    }));
                }

                // 10. Ranking Depto
                const ctxRankDe = document.getElementById('chartCostDepto');
                if (ctxRankDe) {
                    const depts = {}; filtered.forEach(e => { const d = e.d || 'N/A'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); depts[d] = (depts[d]||0)+val; });
                    const sorted = Object.entries(depts).sort((a,b)=>b[1]-a[1]).slice(0, 10);
                    const gradRankDe = getHGrad(ctxRankDe, '#10b981', 'rgba(16, 185, 129, 0.25)', 350);
                    window.activeCharts.push(new Chart(ctxRankDe, {
                        type: 'bar',
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 28)), datasets: [{ label: 'Gasto', data: sorted.map(s => s[1]), backgroundColor: gradRankDe, borderRadius: 8, barThickness: 22 }] },
                        options: { ...costChartBase(currency), indexAxis: 'y', plugins: { ...costChartBase(currency).plugins, legend: { display:false } } }
                    }));
                }

                // 11. Annual Cost Compare (Final Chart)
                const ctxAC = document.getElementById('chartAnnualCost');
                if (ctxAC) {
                    const gradAC = getVGrad(ctxAC, '#8b5cf6', 'rgba(139, 92, 246, 0.2)', 185);
                    window.activeCharts.push(new Chart(ctxAC, {
                        type: 'bar',
                        data: { labels: twelveSlots.map(s => s.label), datasets: [{ label: 'Total histórico', data: annualTrendData, backgroundColor: gradAC, borderColor: '#8b5cf6', borderWidth: 1.5, borderRadius: 6 }] },
                        options: { ...costChartBase(currency), plugins: { ...costChartBase(currency).plugins, legend: { display:false } } }
                    }));
                }

                // 7. Simulation & Update Logic
                window.updateSimulation = function () {
                    const sal = parseFloat(document.getElementById('simSalary').value) / 100;
                    const bon = parseFloat(document.getElementById('simBono').value) / 100;
                    const rot = parseFloat(document.getElementById('simRot').value) / 100;
                    document.getElementById('valSimSalary').innerText = (sal * 100).toFixed(0) + '%';
                    document.getElementById('valSimBono').innerText = (bon * 100).toFixed(0) + '%';
                    document.getElementById('valSimRot').innerText = (rot * 100).toFixed(0) + '%';
                    const impact = (tSO * sal) + (tVar * bon) + (tTotalCurrent * 0.1 * rot);
                    const lab = document.getElementById('labelSimImpact');
                    lab.innerText = (impact >= 0 ? '+' : '') + fM(impact);
                    lab.style.color = impact > 0 ? '#ef4444' : '#10b981';
                };
                window.resetSim = () => { document.getElementById('simSalary').value=0; document.getElementById('simBono').value=0; document.getElementById('simRot').value=0; updateSimulation(); };
                
                // Update Suggested TC
                const tcDisp = document.getElementById('currentTCDisp');
                if (tcDisp && showUSD) {
                    const { p: ps } = getFilters();
                    if (ps !== 'ALL') {
                        const sample = filtered.length > 0 ? filtered[0].xr : 1.0;
                        tcDisp.innerHTML = `TC sugerido ${paisMap[ps] || ps}: <span style="color:var(--ac);">${Number(sample).toFixed(6)}</span>`;
                    } else tcDisp.innerHTML = "TC Variable por País";
                } else if (tcDisp) tcDisp.innerHTML = "Moneda Local";

                updateSimulation();
            }

            function applyCostSearch(val) {
                window.costSearch = val;
                renderAll();
            }

            function exportData() {
                const pais = document.getElementById('paisSel').value;
                const emp = document.getElementById('empresaSel').value;
                const yr = document.getElementById('yearSel').value;
                const mo = document.getElementById('monthSel').value;
                const showUSD = window.useUSD || false;
                const searchVal = (document.querySelector('.search-wrapper input')?.value || '').toLowerCase();

                const emps = app.employees.filter(e =>
                    (pais === 'ALL' ? true : e.pa === pais) &&
                    (emp === 'ALL' ? true : e.e === emp) &&
                    (yr === 'ALL' ? true : e.y == yr) &&
                    (mo === 'ALL' ? true : e.m == mo) &&
                    (searchVal === '' ? true : (
                        (e.n || '').toLowerCase().includes(searchVal) ||
                        (e.p || '').toLowerCase().includes(searchVal) ||
                        (e.c || '').toLowerCase().includes(searchVal)
                    ))
                );

                const rows = emps.map(e => {
                    const conv = (v) => getC(v, e.xr, showUSD, e.pa);
                    const rowTotal = conv(e.so) + conv(e.b37) + conv(e.b78) + conv(e.bv) + conv(e.he) + conv(e.p_agui) + conv(e.p_b14) + conv(e.p_vac) + conv(e.p_ind) + conv(e.p_pat);

                    // To show the actual rate used in the Excel column
                    let actualRateUsed = 1;
                    if (showUSD) {
                        const testVal = 1000;
                        const converted = getC(testVal, e.xr, true, e.pa);
                        actualRateUsed = converted > 0 ? (testVal / converted) : 1;
                    }

                    return {
                        'CÓDIGO': e.c, 'NOMBRE': e.n, 'DEPARTAMENTO': e.d, 'PUESTO': e.p,
                        'EMPRESA': e.e, 'PAÍS': e.pa, 'AÑO': e.y, 'MES': e.m,
                        'T. CAMBIO': showUSD ? actualRateUsed : (e.xr || 1),
                        'MONEDA': showUSD ? 'USD' : (currencyMap[e.pa] || 'Local'),
                        'TOTAL 10 COLS': rowTotal,
                        'SALARIO': conv(e.so),
                        'BONO 37': conv(e.b37),
                        'BONO 78': conv(e.b78),
                        'BONIF. VARIABLES': conv(e.bv),
                        'HORAS EXTRA': conv(e.he),
                        'PROV AGUINALDO': conv(e.p_agui),
                        'PROV BONO 14': conv(e.p_b14),
                        'PROV VACACIONES': conv(e.p_vac),
                        'PROV INDEMNIZACIÓN': conv(e.p_ind),
                        'CUOTAS PATRONALES': conv(e.p_pat)
                    };
                });

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Reporte Costos Detailed');
                XLSX.writeFile(wb, `Reporte_Costos_${showUSD ? 'USD' : 'Local'}_${yr}_${mo}.xlsx`);
            }
