// Audit dashboard logic extracted from the main HTML.

// ============================================================
                        // ============================================================
                        // ============================================================
                        // AUDITORIA DE PERSONAL - JS v5 (Con Salidas vs Bajas)
                        // ============================================================
                        window._auditTab = 'recon';
                        window._subStatusFilter = ''; // for departures filtering

                        function auditSetTab(tab) {
                            window._auditTab = tab;
                            window._subStatusFilter = ''; // reset sub-status filter when tab changes
                            renderAudit();
                        }

                        function getAuditReconData() {
                            return (window.__HC_RECON_DATA__ || []);
                        }
                        function getAuditReingresoData() {
                            return (window.__REINGRESO_DATA__ || []);
                        }
                        function getAuditDoblePagoData() {
                            return (window.__DOBLE_PAGO_DATA__ || []);
                        }
                        function getAuditDeparturesData() {
                            return (window.__DEPARTURES_DATA__ || []);
                        }

                        const auditMonthNames = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

                        function auditMonthLabel(y, m) {
                            return `${auditMonthNames[Number(m)] || m} ${y}`;
                        }

                        function auditParseMonthLabel(label) {
                            const parts = String(label || '').trim().split(/\s+/);
                            if (parts.length < 2) return null;
                            const y = Number(parts[parts.length - 1]);
                            const mName = parts.slice(0, -1).join(' ').toUpperCase();
                            const m = auditMonthNames.indexOf(mName);
                            return (y && m > 0) ? { y, m } : null;
                        }

                        function auditPrevPeriod(y, m) {
                            return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
                        }

                        function auditNormText(v) {
                            return String(v || '')
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                                .toUpperCase().replace(/[^A-Z0-9]/g, ' ')
                                .replace(/\s+/g, ' ').trim();
                        }

                        function auditPersonKey(r) {
                            const code = String(r && r.c || '').trim().toUpperCase();
                            if (code && code !== 'NAN' && code !== 'NAT' && code !== '0') return `C:${code}`;
                            return `N:${auditNormText(r && r.n)}|${auditNormText(r && r.pa)}|${auditNormText(r && r.e)}`;
                        }

                        function auditUniqueMap(rows) {
                            const out = new Map();
                            (rows || []).forEach(r => {
                                const k = auditPersonKey(r);
                                if (!out.has(k)) out.set(k, r);
                            });
                            return out;
                        }

                        function auditDateParts(dmy) {
                            const p = String(dmy || '').split('/');
                            if (p.length < 3) return null;
                            const d = Number(p[0]), m = Number(p[1]), y = Number(p[2]);
                            return (d && m && y) ? { d, m, y } : null;
                        }

                        function auditMatchesScope(r, fEmp, fPa) {
                            return (!fEmp || r.e === fEmp) && (!fPa || r.pa === fPa);
                        }

                        function buildAuditPeopleBridge(filters) {
                            const appData = window.app || {};
                            const employees = appData.employees || [];
                            const bajas = appData.bajas_list || [];
                            const fMes = filters.fMes || '';
                            const fEmp = filters.fEmp || '';
                            const fPa = filters.fPa || '';
                            const fAn = filters.fAn || '';

                            let period = auditParseMonthLabel(fMes);
                            if (!period) {
                                const periods = (appData.summary || employees)
                                    .filter(r => !fAn || String(r.y) === fAn)
                                    .map(r => ({ y: Number(r.y), m: Number(r.m) }))
                                    .filter(r => r.y && r.m)
                                    .sort((a, b) => (b.y * 12 + b.m) - (a.y * 12 + a.m));
                                period = periods[0] || null;
                            }
                            if (!period) return null;

                            const prev = auditPrevPeriod(period.y, period.m);
                            const inPeriod = (r, p) => Number(r.y) === p.y && Number(r.m) === p.m && auditMatchesScope(r, fEmp, fPa);
                            const currentRows = employees.filter(r => inPeriod(r, period));
                            const prevRows = employees.filter(r => inPeriod(r, prev));
                            const hiresRows = currentRows.filter(r => {
                                const fi = auditDateParts(r.fi);
                                return fi && fi.y === period.y && fi.m === period.m;
                            });
                            const bajasPrevRows = bajas.filter(r => inPeriod(r, prev));
                            const bajasCurrentRows = bajas.filter(r => inPeriod(r, period));
                            const bajasBridgeRows = [...bajasPrevRows, ...bajasCurrentRows];

                            const prevMap = auditUniqueMap(prevRows);
                            const currentMap = auditUniqueMap(currentRows);
                            const hiresMap = auditUniqueMap(hiresRows);
                            const bajasCurrentMap = auditUniqueMap(bajasCurrentRows);
                            const bajasBridgeMap = auditUniqueMap(bajasBridgeRows);
                            const allBajasMap = auditUniqueMap(bajas.filter(r => auditMatchesScope(r, fEmp, fPa)));

                            const expectedMap = new Map(prevMap);
                            hiresMap.forEach((v, k) => expectedMap.set(k, v));
                            bajasBridgeMap.forEach((v, k) => expectedMap.delete(k));

                            const actualNetMap = new Map(currentMap);
                            bajasCurrentMap.forEach((v, k) => actualNetMap.delete(k));

                            const missing = [];
                            expectedMap.forEach((r, k) => {
                                if (!actualNetMap.has(k)) {
                                    missing.push({
                                        kind: 'FALTA EN HC ACTUAL',
                                        severity: 3,
                                        key: k,
                                        row: r,
                                        detail: 'Estaba esperado por el puente, pero no aparece en el HC neto actual.'
                                    });
                                }
                            });

                            const extra = [];
                            actualNetMap.forEach((r, k) => {
                                if (!expectedMap.has(k)) {
                                    extra.push({
                                        kind: 'SOBRA EN HC ACTUAL',
                                        severity: 2,
                                        key: k,
                                        row: r,
                                        detail: 'Aparece en el HC neto actual, pero no sale del puente manual.'
                                    });
                                }
                            });

                            const bajaStillActive = [];
                            bajasBridgeMap.forEach((b, k) => {
                                if (actualNetMap.has(k)) {
                                    bajaStillActive.push({
                                        kind: 'BAJA PERO SIGUE',
                                        severity: 3,
                                        key: k,
                                        row: actualNetMap.get(k),
                                        baja: b,
                                        detail: 'Tiene baja en el periodo puente, pero sigue apareciendo en el HC neto actual.'
                                    });
                                }
                            });

                            const disappearedNoBaja = [];
                            prevMap.forEach((r, k) => {
                                if (!currentMap.has(k) && !bajasBridgeMap.has(k)) {
                                    disappearedNoBaja.push({
                                        kind: 'DESAPARECE SIN BAJA',
                                        severity: 3,
                                        key: k,
                                        row: r,
                                        detail: 'Estaba en el mes anterior, no aparece en el mes actual y no hay baja en el puente.'
                                    });
                                }
                            });

                            const currentNoAlta = [];
                            currentMap.forEach((r, k) => {
                                if (!prevMap.has(k) && !hiresMap.has(k)) {
                                    currentNoAlta.push({
                                        kind: 'NUEVO SIN ALTA',
                                        severity: 2,
                                        key: k,
                                        row: r,
                                        detail: 'No estaba en el mes anterior, aparece en el mes actual, pero su fecha de ingreso no cae en el mes actual.'
                                    });
                                }
                            });

                            const disappearedNoBajaKeys = new Set(disappearedNoBaja.map(x => x.key));
                            const bajaStillActiveKeys = new Set(bajaStillActive.map(x => x.key));
                            const currentNoAltaKeys = new Set(currentNoAlta.map(x => x.key));
                            missing.forEach(x => {
                                const bajaAny = allBajasMap.get(x.key);
                                if (bajaAny && !bajasBridgeMap.has(x.key)) {
                                    const pago = bajaAny.pago_y && bajaAny.pago_m ? ` | Pago/MES BAJA: ${auditMonthLabel(bajaAny.pago_y, bajaAny.pago_m)}` : '';
                                    x.kind = 'BAJA FUERA DEL PUENTE';
                                    x.detail = `La baja si existe, pero su fecha de baja es ${auditMonthLabel(bajaAny.y, bajaAny.m)} y no cae dentro del puente.${pago}`;
                                } else if (disappearedNoBajaKeys.has(x.key)) {
                                    x.kind = 'DESAPARECE SIN BAJA';
                                    x.detail = 'Estaba en el mes anterior, no aparece en el HC neto actual y no hay baja en el puente ni en el archivo de bajas.';
                                }
                            });
                            extra.forEach(x => {
                                if (bajaStillActiveKeys.has(x.key)) {
                                    x.kind = 'BAJA PERO SIGUE';
                                    x.detail = 'Tiene baja en el puente, pero sigue apareciendo en el HC neto actual.';
                                } else if (currentNoAltaKeys.has(x.key)) {
                                    x.kind = 'NUEVO SIN ALTA';
                                    x.detail = 'Aparece en el HC neto actual, pero no estaba antes ni tiene alta del mes actual.';
                                }
                            });

                            const movementRows = [...missing, ...extra]
                                .sort((a, b) => b.severity - a.severity || String(a.row.n || '').localeCompare(String(b.row.n || '')));
                            const bajaFueraPuenteCount = movementRows.filter(x => x.kind === 'BAJA FUERA DEL PUENTE').length;
                            const sinBajaRealCount = movementRows.filter(x => x.kind === 'DESAPARECE SIN BAJA').length;

                            const bridgeExpected = prevMap.size + hiresMap.size - bajasPrevRows.length - bajasCurrentRows.length;
                            return {
                                period,
                                prev,
                                labels: {
                                    current: auditMonthLabel(period.y, period.m),
                                    previous: auditMonthLabel(prev.y, prev.m)
                                },
                                counts: {
                                    previousHC: prevMap.size,
                                    hires: hiresMap.size,
                                    bajasPrev: bajasPrevRows.length,
                                    bajasCurrent: bajasCurrentRows.length,
                                    bridgeExpected,
                                    currentPayroll: currentMap.size,
                                    currentNet: actualNetMap.size,
                                    netDiff: bridgeExpected - actualNetMap.size,
                                    missing: missing.length,
                                    extra: extra.length,
                                    bajaStillActive: bajaStillActive.length,
                                    disappearedNoBaja: sinBajaRealCount,
                                    bajaFueraPuente: bajaFueraPuenteCount,
                                    currentNoAlta: currentNoAlta.length
                                },
                                movementRows
                            };
                        }

                        function buildAuditPrevBajaStillActive(filters) {
                            const appData = window.app || {};
                            const employees = appData.employees || [];
                            const bajas = appData.bajas_list || [];
                            const fMes = filters.fMes || '';
                            const fEmp = filters.fEmp || '';
                            const fPa = filters.fPa || '';
                            const fAn = filters.fAn || '';

                            let period = auditParseMonthLabel(fMes);
                            if (!period) {
                                const periods = (appData.summary || employees)
                                    .filter(r => !fAn || String(r.y) === fAn)
                                    .map(r => ({ y: Number(r.y), m: Number(r.m) }))
                                    .filter(r => r.y && r.m)
                                    .sort((a, b) => (b.y * 12 + b.m) - (a.y * 12 + a.m));
                                period = periods[0] || null;
                            }
                            if (!period) return [];

                            const prev = auditPrevPeriod(period.y, period.m);
                            const inPeriod = (r, p) => Number(r.y) === p.y && Number(r.m) === p.m && auditMatchesScope(r, fEmp, fPa);
                            const currentRows = employees.filter(r => inPeriod(r, period));
                            const prevBajasRows = bajas.filter(r => inPeriod(r, prev));
                            const currentMap = auditUniqueMap(currentRows);
                            const prevBajasMap = auditUniqueMap(prevBajasRows);
                            const out = [];

                            prevBajasMap.forEach((baja, k) => {
                                const current = currentMap.get(k);
                                if (current) {
                                    out.push({
                                        c: current.c || baja.c || '',
                                        n: current.n || baja.n || '',
                                        pa: current.pa || baja.pa || '',
                                        e: current.e || baja.e || '',
                                        p: current.p || baja.p || '',
                                        fi: current.fi || baja.fi || '',
                                        baja_fecha: baja.f || '',
                                        baja_mes: auditMonthLabel(prev.y, prev.m),
                                        mes_actual: auditMonthLabel(period.y, period.m),
                                        fecha_pago: baja.fecha_pago || '',
                                        pago_label: (baja.pago_y && baja.pago_m) ? auditMonthLabel(baja.pago_y, baja.pago_m) : '',
                                        motivo: baja.motivo || baja.motivo_raw || '',
                                        detail: `Tenia baja en ${auditMonthLabel(prev.y, prev.m)} pero sigue activo en ${auditMonthLabel(period.y, period.m)}.`
                                    });
                                }
                            });

                            return out.sort((a, b) => String(a.n || '').localeCompare(String(b.n || '')));
                        }

                        function populateAuditFilters() {
                            const recon = getAuditReconData();
                            const departures = getAuditDeparturesData();
                            
                            const empresas = [...new Set(recon.map(r=>r.e))].sort();
                            const paises   = [...new Set(recon.map(r=>r.pa))].sort();
                            const anios    = [...new Set(recon.map(r=>r.y))].sort((a,b)=>b-a);
                            
                            const months_label = ['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
                            
                            const selE = document.getElementById('auditFilterEmpresa');
                            const selP = document.getElementById('auditFilterPa');
                            const selA = document.getElementById('auditFilterAnio');
                            const selM = document.getElementById('auditFilterMes');
                            
                            if (selE && selE.options.length <= 1) {
                                empresas.forEach(e => { const o = document.createElement('option'); o.value=e; o.textContent=e; selE.appendChild(o); });
                            }
                            if (selP && selP.options.length <= 1) {
                                paises.forEach(p => { const o = document.createElement('option'); o.value=p; o.textContent=p; selP.appendChild(o); });
                            }
                            if (selA && selA.options.length <= 1) {
                                anios.forEach(a => { const o = document.createElement('option'); o.value=a; o.textContent=a; selA.appendChild(o); });
                            }
                            if (selM && selM.options.length <= 1) {
                                // Populate months in reverse order
                                const years_months = [];
                                for (let y of anios) {
                                    for (let m = 12; m >= 1; m--) {
                                        const lbl = `${months_label[m]} ${y}`;
                                        if (recon.some(r => r.y === y && r.m === m) || departures.some(d => d.mes_salida_label === lbl)) {
                                            years_months.push({y, m, label: lbl});
                                        }
                                    }
                                }
                                years_months.forEach(ym => {
                                    const o = document.createElement('option');
                                    o.value = ym.label;
                                    o.textContent = ym.label;
                                    selM.appendChild(o);
                                });
                                
                                // Default to Mayo 2026 on first load!
                                if (!window.__DEFAULT_MONTH_SET__) {
                                    selM.value = "MAYO 2026";
                                    window.__DEFAULT_MONTH_SET__ = true;
                                }
                            }
                        }

                        function renderAudit() {
                            try {
                                populateAuditFilters();
                                const tab  = window._auditTab || 'recon';
                                const fMes = (document.getElementById('auditFilterMes')||{}).value || '';
                                const fEmp = (document.getElementById('auditFilterEmpresa')||{}).value || '';
                                const fPa  = (document.getElementById('auditFilterPa')||{}).value || '';
                                const fAn  = (document.getElementById('auditFilterAnio')||{}).value || '';

                                const months = ['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

                                // Tab styling and colors
                                const tabCfg = {
                                    recon:     { btn:'auditTabRecon',     color:'#6366f1' },
                                    faltantes: { btn:'auditTabFaltantes', color:'#ec4899' },
                                    reingreso: { btn:'auditTabReingreso', color:'#f59e0b' },
                                    doblePago: { btn:'auditTabDoblePago', color:'#ef4444' }
                                };
                                Object.entries(tabCfg).forEach(([t,cfg]) => {
                                    const el = document.getElementById(cfg.btn);
                                    if (!el) return;
                                    el.style.setProperty('--audit-color', cfg.color);
                                    el.classList.toggle('is-active', t === tab);
                                    el.style.color = cfg.color;
                                });

                                const badge    = document.getElementById('auditBadge');
                                const subtitle = document.getElementById('auditSubtitle');
                                const tableEl  = document.getElementById('auditTable');
                                const chartEl  = document.getElementById('auditChart');

                                // ---- HC RECONCILIACION ----
                                if (tab === 'recon') {
                                    let data = getAuditReconData().filter(r => r.diff !== null && r.diff !== undefined && r.hc_ant !== null);
                                    if (fEmp) data = data.filter(r => r.e === fEmp);
                                    if (fPa)  data = data.filter(r => r.pa === fPa);
                                    if (fAn)  data = data.filter(r => String(r.y) === fAn);
                                    if (fMes) data = data.filter(r => `${months[r.m]} ${r.y}` === fMes);

                                    const withDiff = data.filter(r => r.diff !== 0);
                                    const peopleBridge = buildAuditPeopleBridge({ fMes, fEmp, fPa, fAn });
                                    if (badge) {
                                        badge.textContent = peopleBridge
                                            ? `${Math.abs(peopleBridge.counts.netDiff)} diferencia neta`
                                            : `${withDiff.length} discrepancias`;
                                    }
                                    if (subtitle) subtitle.textContent = 'Cuadre persona por persona: HC anterior + altas - bajas del puente vs HC neto actual';

                                    if (chartEl && typeof Chart !== 'undefined') {
                                        if (chartEl._ci) chartEl._ci.destroy();
                                        if (peopleBridge) {
                                            const c = peopleBridge.counts;
                                            chartEl._ci = new Chart(chartEl.getContext('2d'), {
                                                type: 'bar',
                                                data: {
                                                    labels: ['Faltan', 'Sobran', 'Sin baja', 'Baja fuera puente', 'Baja pero sigue'],
                                                    datasets: [{
                                                        label: 'Personas',
                                                        data: [c.missing, c.extra, c.disappearedNoBaja, c.bajaFueraPuente || 0, c.bajaStillActive],
                                                        backgroundColor: ['#ef4444', '#2563eb', '#f97316', '#8b5cf6', '#f59e0b'],
                                                        borderRadius: 8,
                                                        barThickness: 34
                                                    }]
                                                },
                                                options: {
                                                    indexAxis: 'y',
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: { callbacks: { label: ctx => `${ctx.raw} persona${ctx.raw === 1 ? '' : 's'}` } }
                                                    },
                                                    scales: {
                                                        x: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { precision: 0 } },
                                                        y: { grid: { display: false }, ticks: { color: '#334155', font: { weight: 'bold' } } }
                                                    }
                                                }
                                            });
                                        } else {
                                            const byMonth = {};
                                            data.forEach(r => {
                                                const k = `${months[r.m]} ${r.y}`;
                                                if (!byMonth[k]) byMonth[k] = {ok:0, disc:0};
                                                if (r.diff !== 0) byMonth[k].disc++;
                                                else byMonth[k].ok++;
                                            });
                                            const mKeys = Object.keys(byMonth).sort((a,b)=>{
                                                const mo=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
                                                const [am,ay]=a.split(' '); const [bm,by]=b.split(' ');
                                                return Number(ay)*12+mo.indexOf(am) - (Number(by)*12+mo.indexOf(bm));
                                            }).slice(-18);

                                            chartEl._ci = new Chart(chartEl.getContext('2d'), {
                                                type: 'bar',
                                                data: {
                                                    labels: mKeys,
                                                    datasets: [
                                                        { label:'Con discrepancia', data: mKeys.map(k=>byMonth[k].disc||0), backgroundColor:'#ef4444', borderRadius:6 },
                                                        { label:'Sin discrepancia', data: mKeys.map(k=>byMonth[k].ok||0),   backgroundColor:'#22c55e', borderRadius:6 }
                                                    ]
                                                },
                                                options: {
                                                    responsive:true, maintainAspectRatio:false,
                                                    plugins:{ legend:{display:true,position:'top'} },
                                                    scales:{ x:{stacked:true,grid:{display:false}}, y:{stacked:true,grid:{color:'rgba(0,0,0,0.05)'}} }
                                                }
                                            });
                                        }
                                    }

                                    // Table
                                    if (tableEl) {
                                        const discOnly = withDiff.sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff));
                                        const allSorted = [...discOnly, ...data.filter(r=>r.diff===0)];
                                        const bridgeHtml = peopleBridge ? (() => {
                                            const c = peopleBridge.counts;
                                            const missingList = peopleBridge.movementRows.filter(x => x.kind.includes('DESAPARECE') || x.kind.includes('FALTA'));
                                            const extraList = peopleBridge.movementRows.filter(x => x.kind.includes('BAJA') || x.kind.includes('SOBRA') || x.kind.includes('NUEVO'));
                                            const maxIssue = Math.max(c.missing, c.extra, 1);
                                                                                                                                    let netIssueRows = c.netDiff > 0
                                                ? missingList.slice(0, Math.abs(c.netDiff))
                                                : c.netDiff < 0
                                                    ? extraList.slice(0, Math.abs(c.netDiff))
                                                    : [];
                                            const netIssueTarget = Math.abs(Number(c.netDiff || 0));
                                            if (netIssueTarget && netIssueRows.length < netIssueTarget) {
                                                const fallback = [];
                                                const fallbackRows = [...discOnly, ...data.filter(r => r.diff !== 0 && !discOnly.includes(r))];
                                                const pickNames = (r) => {
                                                    if (c.netDiff > 0) return (r.diff < 0 ? (r.altas_names || []) : []);
                                                    if (c.netDiff < 0) return (r.diff > 0 ? (r.bajas_names || []) : []);
                                                    return [];
                                                };
                                                const lookupPersonByName = (name, baseRow) => {
                                                    const key = auditNormText ? auditNormText(name) : String(name || '').toUpperCase();
                                                    const sources = [...((window.app && window.app.employees) || []), ...((window.app && window.app.bajas_list) || [])];
                                                    return sources.find(p => (!baseRow || ((!baseRow.pa || p.pa === baseRow.pa) && (!baseRow.e || p.e === baseRow.e))) && (auditNormText ? auditNormText(p.n) : String(p.n || '').toUpperCase()) === key) || {};
                                                };
                                                fallbackRows.forEach(r => {
                                                    pickNames(r).forEach(name => {
                                                        if (fallback.length >= netIssueTarget) return;
                                                        const cleanName = auditCleanText(name || '');
                                                        if (!cleanName) return;
                                                        const key = cleanName.toUpperCase();
                                                        if (fallback.some(x => String(x.row.n || '').toUpperCase() === key)) return;
                                                        const personMatch = lookupPersonByName(cleanName, r);
                                                        fallback.push({
                                                            kind: c.netDiff > 0 ? 'FALTA EN HC NETO' : 'SOBRA EN HC NETO',
                                                            row: { c: personMatch.c || '-', n: personMatch.n || cleanName, pa: personMatch.pa || r.pa || '', e: personMatch.e || r.e || '', p: personMatch.p || '' },
                                                            monthLabel: `${months[r.m] || ''} ${r.y || ''}`.trim() || peopleBridge.labels.current,
                                                            detail: c.netDiff > 0 ? ('FALTA EN PLANILLA CONSOLIDADA / HC NETO EN ' + ((personMatch.e || r.e || 'EMPRESA') + ' ' + (personMatch.pa || r.pa || '')).trim() + '. Revisar altas del mes.') : ('ESTA DE BAJA DE MAS EN BAJAS DE ' + ((personMatch.e || r.e || 'EMPRESA') + ' ' + (personMatch.pa || r.pa || '')).trim() + '. Revisar si la baja esta duplicada o aplicada de mas.')
                                                        });
                                                    });
                                                });
                                                if (fallback.length) netIssueRows = [...netIssueRows, ...fallback].slice(0, netIssueTarget);
                                            }
                                            const netIssueLabel = c.netDiff ? 'Diferencias' : 'Sin diferencia neta';
                                            const netIssueTableRows = netIssueRows.map((x, i) => {
                                                const mes = x.monthLabel || peopleBridge.labels.current || '-';
                                                const scopeTxt = `${x.row.e || 'EMPRESA'} ${x.row.pa || ''}`.trim();
                                                const motivo = x.detail || (x.kind === 'SOBRA EN HC NETO'
                                                    ? `ESTA DE MAS EN PLANILLA CONSOLIDADA / HC NETO EN ${scopeTxt}. Revisar si esta de baja de mas en Bajas.`
                                                    : x.kind === 'FALTA EN HC NETO'
                                                        ? `FALTA EN PLANILLA CONSOLIDADA / HC NETO EN ${scopeTxt}. Revisar altas del mes.`
                                                        : '-');
                                                const search = `${x.row.c || ''} ${x.row.n || ''} ${mes} ${motivo}`.toLowerCase();
                                                return `<tr data-search="${search}">
                                                  <td style="padding:10px 12px;font-weight:900;color:#334155;white-space:nowrap;">${x.row.pa || '-'}</td>
                                                  <td style="padding:10px 12px;font-weight:900;color:#334155;white-space:nowrap;">${x.row.e || '-'}</td>
                                                  <td style="padding:10px 12px;font-weight:900;color:#334155;white-space:nowrap;">${x.row.c || '-'}</td>
                                                  <td style="padding:10px 12px;font-weight:900;color:#0f172a;">${x.row.n || '-'}</td>
                                                  <td style="padding:10px 12px;font-weight:800;color:#6366f1;white-space:nowrap;">${mes}</td>
                                                  <td style="padding:10px 12px;color:#475569;font-weight:750;line-height:1.35;">${motivo}</td>
                                                </tr>`;
                                            }).join('');
const rowHtml = (items) => items.length ? items.map((x) => {
                                                const isBad = x.kind.includes('DESAPARECE') || x.kind.includes('FALTA');
                                                const tone = isBad ? 'danger' : 'warn';
                                            return `<article class="audit-person-card ${tone}">
                                                  <div class="audit-person-status">
                                                    <span class="audit-issue-pill ${tone}">${x.kind}</span>
                                                    <span class="audit-code">${x.row.c || '-'}</span>
                                                  </div>
                                                  <div class="audit-person-main">
                                                    <div class="audit-person-name">${x.row.n || '-'}</div>
                                                    <div class="audit-person-meta">
                                                      <span>${x.row.pa || '-'}</span>
                                                      <span>${x.row.e || '-'}</span>
                                                      <span>${x.row.p || '-'}</span>
                                                    </div>
                                                  </div>
                                                  <div class="audit-person-note">${x.detail}</div>
                                                </article>`;
                                            }).join('') : `<div class="audit-empty-row">Sin casos en esta categoria.</div>`;

                                            return `
                                            <section class="audit-people-board">
                                              <div class="audit-board-hero">
                                                <div>
                                                  <div class="audit-section-kicker">Auditoria de personas</div>
                                                  <h3>Reconciliacion HC + salidas vs bajas</h3>
                                                  <p>Cuadre persona por persona: HC anterior + altas - bajas del puente vs HC neto actual.</p>
                                                </div>
                                                <button type="button" class="audit-hero-diff ${c.netDiff ? 'has-gap' : 'ok'} ${c.netDiff ? 'is-clickable' : ''}" onclick="document.getElementById('auditPeopleIssues')?.scrollIntoView({behavior:'smooth', block:'start'});" title="Ver personas que explican la diferencia neta"><span>Diferencia neta</span><strong>${c.netDiff > 0 ? '+' : ''}${c.netDiff}</strong><small>${c.netDiff ? 'Click para ver detalle' : 'Sin diferencia'}</small></button>
                                              </div>

                                              <div class="audit-equation-card">
                                                <div class="audit-section-kicker">Puente manual</div>
                                                <div class="audit-equation-flow">
                                                  <div class="audit-eq-item base"><span>HC ${peopleBridge.labels.previous}</span><strong>${c.previousHC}</strong></div>
                                                  <div class="audit-eq-op">+</div>
                                                  <div class="audit-eq-item up"><span>Altas ${peopleBridge.labels.current}</span><strong>${c.hires}</strong></div>
                                                  <div class="audit-eq-op">-</div>
                                                  <div class="audit-eq-item down"><span>Bajas ${peopleBridge.labels.previous}</span><strong>${c.bajasPrev}</strong></div>
                                                  <div class="audit-eq-op">-</div>
                                                  <div class="audit-eq-item down"><span>Bajas ${peopleBridge.labels.current}</span><strong>${c.bajasCurrent}</strong></div>
                                                  <div class="audit-eq-op">=</div>
                                                  <div class="audit-eq-item expected"><span>Esperado</span><strong>${c.bridgeExpected}</strong></div>
                                                </div>
                                              </div>

                                              <div class="audit-conclusion-card ${c.netDiff ? 'has-gap' : 'ok'}">
                                                <div>
                                                  <div class="audit-section-kicker">Conclusion del cuadre</div>
                                                  <h3>${c.netDiff ? `Faltan ${Math.abs(c.netDiff)} personas netas` : 'Cuadre cerrado'}</h3>
                                                  <p>${c.missing} faltan menos ${c.extra} sobran = ${c.netDiff > 0 ? '+' : ''}${c.netDiff} diferencia neta.</p>
                                                </div>
                                                <div class="audit-net-number">
                                                  <span>HC neto</span>
                                                  <strong>${c.currentNet}</strong>
                                                  <small>Dashboard</small>
                                                </div>
                                              </div>
                                              <div id="auditPeopleIssues" class="audit-net-table-card" style="background:#fff;border:1px solid rgba(99,102,241,0.14);border-radius:14px;padding:14px;box-shadow:0 10px 24px rgba(15,23,42,0.05);">
                                                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap;">
                                                  <div>
                                                    <div style="font-size:11px;font-weight:1000;color:#6366f1;text-transform:uppercase;letter-spacing:.6px;">${netIssueLabel}</div>
                                                    <div style="font-family:'Montserrat';font-size:18px;font-weight:1000;color:#0f172a;">Total: ${netIssueRows.length}</div>
                                                  </div>
                                                  <span style="font-size:11px;font-weight:900;color:#64748b;background:#f8fafc;border-radius:999px;padding:6px 10px;">${peopleBridge.labels.current}</span>
                                                </div>
                                                <table class="audit-table" style="width:100%;border-collapse:collapse;font-size:12px;">
                                                  <thead>
                                                    <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Pais</th>
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Empresa</th>
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Codigo</th>
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Nombre</th>
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Mes</th>
                                                      <th style="padding:9px 12px;text-align:left;color:#64748b;font-size:10px;text-transform:uppercase;">Motivo</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    ${netIssueTableRows || '<tr><td colspan="6" style="padding:18px;text-align:center;color:#64748b;font-weight:900;">Sin personas para mostrar con el filtro actual.</td></tr>'}
                                                  </tbody>
                                                </table>
                                              </div>
</section>`;
                                        })() : '';
                                        tableEl.innerHTML = bridgeHtml + `
                                        <details class="audit-raw-details">
                                          <summary>Ver detalle tecnico por pais y empresa</summary>
                                        <table style="width:100%;border-collapse:collapse;font-size:11px;">
                                          <thead><tr style="background:rgba(99,102,241,0.08);position:sticky;top:0;">
                                            <th style="padding:9px 8px;text-align:left;">Pais</th>
                                            <th style="padding:9px 8px;text-align:left;">Empresa</th>
                                            <th style="padding:9px 8px;text-align:left;">Mes</th>
                                            <th style="padding:9px 8px;text-align:center;">HC Ant.</th>
                                            <th style="padding:9px 8px;text-align:center;color:#22c55e;">+ Altas</th>
                                            <th style="padding:9px 8px;text-align:center;color:#ef4444;">- Bajas</th>
                                            <th style="padding:9px 8px;text-align:center;">= Esperado</th>
                                            <th style="padding:9px 8px;text-align:center;">HC Real</th>
                                            <th style="padding:9px 8px;text-align:center;">Diferencia</th>
                                            <th style="padding:9px 8px;text-align:left;">Altas (nombres)</th>
                                            <th style="padding:9px 8px;text-align:left;">Bajas (nombres)</th>
                                          </tr></thead>
                                          <tbody>
                                            ${allSorted.map((r,i) => {
                                              const hasDiff = r.diff !== 0;
                                              const diffColor = r.diff > 0 ? '#22c55e' : '#ef4444';
                                              const rowBg = hasDiff ? (i%2===0?'rgba(239,68,68,0.05)':'rgba(239,68,68,0.02)') : (i%2===0?'rgba(0,0,0,0.02)':'transparent');
                                              const altasNames = (r.altas_names||[]).slice(0,5).join(', ') + ((r.altas_names||[]).length>5 ? ` +${r.altas_names.length-5} mÃ¡s`:'');
                                              const bajasNames = (r.bajas_names||[]).slice(0,5).join(', ') + ((r.bajas_names||[]).length>5 ? ` +${r.bajas_names.length-5} mÃ¡s`:'');
                                              return `<tr style="background:${rowBg};border-bottom:1px solid rgba(0,0,0,0.04);">
                                                <td style="padding:7px 8px;font-weight:700;">${r.pa}</td>
                                                <td style="padding:7px 8px;">${r.e}</td>
                                                <td style="padding:7px 8px;">${months[r.m]} ${r.y}</td>
                                                <td style="padding:7px 8px;text-align:center;">${r.hc_ant??'-'}</td>
                                                <td style="padding:7px 8px;text-align:center;color:#22c55e;font-weight:700;">+${r.altas}</td>
                                                <td style="padding:7px 8px;text-align:center;color:#ef4444;font-weight:700;">-${r.bajas}</td>
                                                <td style="padding:7px 8px;text-align:center;font-weight:700;">${r.hc_esp??'-'}</td>
                                                <td style="padding:7px 8px;text-align:center;font-weight:900;color:#6366f1;">${r.hc_real}</td>
                                                <td style="padding:7px 8px;text-align:center;">
                                                  ${hasDiff ? `<span style="background:${diffColor};color:#fff;padding:2px 10px;border-radius:20px;font-weight:900;font-size:12px;">${r.diff>0?'+':''}${r.diff}</span>` : '<span style="color:#22c55e;font-weight:700;">OK</span>'}
                                                </td>
                                                <td style="padding:7px 8px;font-size:10px;color:#475569;max-width:200px;word-break:break-word;">${altasNames||'-'}</td>
                                                <td style="padding:7px 8px;font-size:10px;color:#475569;max-width:200px;word-break:break-word;">${bajasNames||'-'}</td>
                                              </tr>`;
                                            }).join('')}
                                          </tbody>
                                        </table>
                                        </details>`;
                                    }
                                }

                                // ---- SALIDAS VS BAJAS (QUIÃ‰NES FALTAN) ----
                                else if (tab === 'faltantes') {
                                    let data = getAuditDeparturesData();
                                    if (fEmp) data = data.filter(r => r.e === fEmp);
                                    if (fPa)  data = data.filter(r => r.pa === fPa);
                                    if (fAn)  data = data.filter(r => String(r.mes_salida_y) === fAn);
                                    if (fMes) data = data.filter(r => r.mes_salida_label === fMes);

                                    // Filter by subStatus if selected
                                    const totalCount = data.length;
                                    const sinBajaCount = data.filter(r=>r.status==='SIN_BAJA_REGISTRADA').length;
                                    const desfaseCount = data.filter(r=>r.status==='CON_BAJA_DESFASE').length;
                                    const correctCount = data.filter(r=>r.status==='CON_BAJA_CORRECTA').length;

                                    if (window._subStatusFilter) {
                                        data = data.filter(r => r.status === window._subStatusFilter);
                                    }

                                    if (badge)    badge.textContent    = `${sinBajaCount + desfaseCount} alertas`;
                                    if (subtitle) subtitle.textContent = 'Salidas de planilla vs Planilla de Bajas registradas en Excel';

                                    // Render Metric Cards with active visual filter
                                    const activeBorder = '3px solid #ec4899';
                                    const metricHtml = `
                                    <div style="display:flex;gap:15px;margin-bottom:18px;flex-wrap:wrap;align-items:center;">
                                      <div onclick="window._subStatusFilter='';renderAudit();" style="flex:1;min-width:130px;background:rgba(236,72,153,0.05);border:1px solid rgba(236,72,153,0.2);${window._subStatusFilter===''?'border-bottom:'+activeBorder:''};border-radius:12px;padding:12px;text-align:center;cursor:pointer;transition:all 0.2s;">
                                        <div style="font-size:24px;font-weight:900;color:#ec4899;">${totalCount}</div>
                                        <div style="font-size:10px;color:#64748b;font-weight:700;">Total Salidas</div>
                                      </div>
                                      <div onclick="window._subStatusFilter='SIN_BAJA_REGISTRADA';renderAudit();" style="flex:1;min-width:150px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);${window._subStatusFilter==='SIN_BAJA_REGISTRADA'?'border-bottom:'+activeBorder:''};border-radius:12px;padding:12px;text-align:center;cursor:pointer;transition:all 0.2s;">
                                        <div style="font-size:24px;font-weight:900;color:#ef4444;">âš ï¸ ${sinBajaCount}</div>
                                        <div style="font-size:10px;color:#ef4444;font-weight:900;text-transform:uppercase;margin-top:2px;"><i class="fa-solid fa-circle-exclamation"></i> Sin Baja Registrada</div>
                                      </div>
                                      <div onclick="window._subStatusFilter='CON_BAJA_DESFASE';renderAudit();" style="flex:1;min-width:150px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);${window._subStatusFilter==='CON_BAJA_DESFASE'?'border-bottom:'+activeBorder:''};border-radius:12px;padding:12px;text-align:center;cursor:pointer;transition:all 0.2s;">
                                        <div style="font-size:24px;font-weight:900;color:#f59e0b;">âš ï¸ ${desfaseCount}</div>
                                        <div style="font-size:10px;color:#f59e0b;font-weight:900;text-transform:uppercase;margin-top:2px;"><i class="fa-solid fa-clock"></i> Mismatch / Desfase</div>
                                      </div>
                                      <div onclick="window._subStatusFilter='CON_BAJA_CORRECTA';renderAudit();" style="flex:1;min-width:150px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);${window._subStatusFilter==='CON_BAJA_CORRECTA'?'border-bottom:'+activeBorder:''};border-radius:12px;padding:12px;text-align:center;cursor:pointer;transition:all 0.2s;">
                                        <div style="font-size:24px;font-weight:900;color:#22c55e;">${correctCount}</div>
                                        <div style="font-size:10px;color:#22c55e;font-weight:900;text-transform:uppercase;margin-top:2px;"><i class="fa-solid fa-circle-check"></i> Bajas Correctas OK</div>
                                      </div>
                                    </div>`;

                                    // Chart for departures by month
                                    const byMonth = {};
                                    // Calculate chart over ALL unfiltered data to keep chart consistent
                                    let chartData = getAuditDeparturesData();
                                    if (fEmp) chartData = chartData.filter(r => r.e === fEmp);
                                    if (fPa)  chartData = chartData.filter(r => r.pa === fPa);
                                    if (fAn)  chartData = chartData.filter(r => String(r.mes_salida_y) === fAn);

                                    chartData.forEach(r => {
                                        const k = r.mes_salida_label;
                                        if (!byMonth[k]) byMonth[k] = {ok:0, desfase:0, sin:0};
                                        if (r.status === 'CON_BAJA_CORRECTA') byMonth[k].ok++;
                                        else if (r.status === 'CON_BAJA_DESFASE') byMonth[k].desfase++;
                                        else if (r.status === 'SIN_BAJA_REGISTRADA') byMonth[k].sin++;
                                    });

                                    const mKeys = [...new Set(chartData.map(r=>r.mes_salida_label))].sort((a,b)=>{
                                        const mo=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
                                        const [am,ay]=a.split(' '); const [bm,by]=b.split(' ');
                                        return Number(ay)*12+mo.indexOf(am) - (Number(by)*12+mo.indexOf(bm));
                                    }).slice(-18);

                                    if (chartEl && typeof Chart !== 'undefined') {
                                        if (chartEl._ci) chartEl._ci.destroy();
                                        chartEl._ci = new Chart(chartEl.getContext('2d'), {
                                            type: 'bar',
                                            data: {
                                                labels: mKeys,
                                                datasets: [
                                                    { label:'Sin baja registrada', data: mKeys.map(k=>byMonth[k]?.sin||0), backgroundColor:'#ef4444', borderRadius:6 },
                                                    { label:'Desfase de registro', data: mKeys.map(k=>byMonth[k]?.desfase||0), backgroundColor:'#f59e0b', borderRadius:6 },
                                                    { label:'Baja registrada OK',  data: mKeys.map(k=>byMonth[k]?.ok||0),  backgroundColor:'#22c55e', borderRadius:6 }
                                                ]
                                            },
                                            options: {
                                                responsive:true, maintainAspectRatio:false,
                                                plugins:{ legend:{display:true,position:'top'} },
                                                scales:{ x:{stacked:true,grid:{display:false}}, y:{stacked:true,grid:{color:'rgba(0,0,0,0.05)'}} }
                                            }
                                        });
                                    }

                                    // Render Table
                                    if (tableEl) {
                                        tableEl.innerHTML = metricHtml + (data.length ? `
                                        <table style="width:100%;border-collapse:collapse;font-size:11px;">
                                          <thead><tr style="background:rgba(236,72,153,0.08);position:sticky;top:0;">
                                            <th style="padding:9px 8px;text-align:left;">CÃ³digo</th>
                                            <th style="padding:9px 8px;text-align:left;">Colaborador</th>
                                            <th style="padding:9px 8px;text-align:left;">Pais</th>
                                            <th style="padding:9px 8px;text-align:left;">Empresa</th>
                                            <th style="padding:9px 8px;text-align:left;">Puesto</th>
                                            <th style="padding:9px 8px;text-align:center;">Ingreso</th>
                                            <th style="padding:9px 8px;text-align:center;">Ãšltimo Mes Activo</th>
                                            <th style="padding:9px 8px;text-align:center;">Mes Salida</th>
                                            <th style="padding:9px 8px;text-align:center;">Estado AuditorÃ­a</th>
                                            <th style="padding:9px 8px;text-align:left;">Detalle Registro de Baja</th>
                                          </tr></thead>
                                          <tbody>
                                            ${data.sort((a,b)=>a.n.localeCompare(b.n)).map((r,i) => {
                                                let badge = '';
                                                let detail = '';
                                                let rowBg = 'transparent';
                                                
                                                if (r.status === 'SIN_BAJA_REGISTRADA') {
                                                    badge = `<span style="background:#fef2f2;color:#ef4444;padding:3px 10px;border-radius:20px;font-weight:900;font-size:10px;border:1px solid #fee2e2;display:inline-block;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i>SIN BAJA</span>`;
                                                    detail = `<span style="color:#ef4444;font-weight:700;">âš ï¸ Faltante: No existe registro en planilla de bajas</span>`;
                                                    rowBg = i%2===0?'rgba(239,68,68,0.03)':'rgba(239,68,68,0.01)';
                                                } else if (r.status === 'CON_BAJA_DESFASE') {
                                                    badge = `<span style="background:#fffbeb;color:#d97706;padding:3px 10px;border-radius:20px;font-weight:900;font-size:10px;border:1px solid #fef3c7;display:inline-block;"><i class="fa-solid fa-clock" style="margin-right:4px;"></i>DESFASE</span>`;
                                                    const gapWord = r.diff_months > 0 ? `tardÃ­o (+${r.diff_months} mes${r.diff_months!==1?'es':''})` : `anticipado (${r.diff_months} mes${r.diff_months!==-1?'es':''})`;
                                                    detail = `<span style="color:#d97706;font-weight:700;">âš ï¸ Registrada en <b>${r.baja_label}</b> (${gapWord})<br><small style="color:#64748b;font-weight:600;">Fecha baja: ${r.baja_fecha} | Motivo: ${r.baja_motivo || 'No indicado'}</small></span>`;
                                                    rowBg = i%2===0?'rgba(245,158,11,0.03)':'rgba(245,158,11,0.01)';
                                                } else {
                                                    badge = `<span style="background:#f0fdf4;color:#16a34a;padding:3px 10px;border-radius:20px;font-weight:900;font-size:10px;border:1px solid #dcfce7;display:inline-block;"><i class="fa-solid fa-circle-check" style="margin-right:4px;"></i>OK</span>`;
                                                    detail = `<span style="color:#16a34a;font-weight:600;">Registrada en <b>${r.baja_label}</b><br><small style="color:#64748b;">Fecha baja: ${r.baja_fecha} | Motivo: ${r.baja_motivo || 'No indicado'}</small></span>`;
                                                    rowBg = i%2===0?'rgba(34,197,94,0.02)':'transparent';
                                                }
                                                
                                                return `<tr style="background:${rowBg};border-bottom:1px solid rgba(0,0,0,0.04);">
                                                  <td style="padding:7px 8px;font-weight:700;">${r.c}</td>
                                                  <td style="padding:7px 8px;font-weight:600;">${r.n}</td>
                                                  <td style="padding:7px 8px;font-weight:700;">${r.pa}</td>
                                                  <td style="padding:7px 8px;">${r.e}</td>
                                                  <td style="padding:7px 8px;color:#64748b;">${r.p}</td>
                                                  <td style="padding:7px 8px;text-align:center;">${r.fi}</td>
                                                  <td style="padding:7px 8px;text-align:center;font-weight:600;">${r.ultimo_mes_activo_label}</td>
                                                  <td style="padding:7px 8px;text-align:center;font-weight:800;color:#ec4899;">${r.mes_salida_label}</td>
                                                  <td style="padding:7px 8px;text-align:center;">${badge}</td>
                                                  <td style="padding:7px 8px;font-size:10px;line-height:1.2;">${detail}</td>
                                                </tr>`;
                                            }).join('')}
                                          </tbody>
                                        </table>` : `<p style="color:#94a3b8;padding:30px;text-align:center;font-weight:700;"><i class="fa-solid fa-circle-info" style="font-size:24px;margin-bottom:8px;display:block;color:#cbd5e1;"></i>No se encontraron salidas en el filtro seleccionado para la sub-categoria "${window._subStatusFilter || 'Todas'}"</p>`);
                                    }
                                }

                                // ---- REINGRESOS ----
                                // ---- REINGRESOS ----
                                else if (tab === 'reingreso') {
                                    let data = getAuditReingresoData();
                                    if (fEmp) data = data.filter(r => r.e === fEmp);
                                    if (fPa)  data = data.filter(r => r.pa === fPa);
                                    if (fAn)  data = data.filter(r => r.reingreso_anio && String(r.reingreso_anio) === fAn);
                                    if (fMes) data = data.filter(r => r.reingreso === fMes);
                                    const carryoverBajas = buildAuditPrevBajaStillActive({ fMes, fEmp, fPa, fAn });

                                    if (badge)    badge.textContent    = `${data.length + carryoverBajas.length} casos`;
                                    if (subtitle) subtitle.textContent = 'Reingresos reales y personal con baja del mes anterior que sigue activo en el mes actual';

                                    const byEmp = {};
                                    data.forEach(r => {
                                        const k = r.e || r.pa || 'SIN EMPRESA';
                                        if (!byEmp[k]) byEmp[k] = { reingresos: 0, carryover: 0 };
                                        byEmp[k].reingresos++;
                                    });
                                    carryoverBajas.forEach(r => {
                                        const k = r.e || r.pa || 'SIN EMPRESA';
                                        if (!byEmp[k]) byEmp[k] = { reingresos: 0, carryover: 0 };
                                        byEmp[k].carryover++;
                                    });
                                    const empEntries = Object.entries(byEmp).sort((a,b)=>(b[1].reingresos + b[1].carryover) - (a[1].reingresos + a[1].carryover));
                                    if (chartEl && typeof Chart !== 'undefined') {
                                        if (chartEl._ci) chartEl._ci.destroy();
                                        chartEl._ci = new Chart(chartEl.getContext('2d'), {
                                            type:'bar',
                                            data: {
                                                labels: empEntries.map(e=>e[0]),
                                                datasets:[
                                                    { label:'Reingresos reales', data:empEntries.map(e=>e[1].reingresos), backgroundColor:'#f59e0b', borderRadius:8 },
                                                    { label:'Baja mes anterior activo mes actual', data:empEntries.map(e=>e[1].carryover), backgroundColor:'#ef4444', borderRadius:8 }
                                                ]
                                            },
                                            options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:true,position:'top'}}, scales:{y:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{stepSize:1}},x:{grid:{display:false}}} }
                                        });
                                    }

                                    if (tableEl) {
                                        const summaryHtml = `
                                        <div style="display:flex;gap:15px;margin-bottom:18px;flex-wrap:wrap;">
                                          <div style="flex:1;min-width:180px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.18);border-radius:12px;padding:12px;text-align:center;">
                                            <div style="font-size:24px;font-weight:900;color:#f59e0b;">${data.length}</div>
                                            <div style="font-size:10px;color:#92400e;font-weight:900;text-transform:uppercase;">Reingresos reales</div>
                                          </div>
                                          <div style="flex:1;min-width:220px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.18);border-radius:12px;padding:12px;text-align:center;">
                                            <div style="font-size:24px;font-weight:900;color:#ef4444;">${carryoverBajas.length}</div>
                                            <div style="font-size:10px;color:#991b1b;font-weight:900;text-transform:uppercase;">Personal baja mes anterior activo mes actual</div>
                                          </div>
                                        </div>`;
                                        const carryoverHtml = carryoverBajas.length ? `
                                        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin-bottom:14px;">
                                          <div style="font-size:12px;font-weight:900;color:#991b1b;margin-bottom:8px;">Personal baja mes anterior activo mes actual</div>
                                          <table style="width:100%;border-collapse:collapse;font-size:11px;">
                                            <thead><tr style="background:rgba(239,68,68,0.08);position:sticky;top:0;">
                                              <th style="padding:9px 8px;text-align:left;">Codigo</th>
                                              <th style="padding:9px 8px;text-align:left;">Colaborador</th>
                                              <th style="padding:9px 8px;text-align:left;">Pais</th>
                                              <th style="padding:9px 8px;text-align:left;">Empresa</th>
                                              <th style="padding:9px 8px;text-align:left;">Puesto</th>
                                              <th style="padding:9px 8px;text-align:center;">Baja mes anterior</th>
                                              <th style="padding:9px 8px;text-align:center;">Mes actual activo</th>
                                              <th style="padding:9px 8px;text-align:left;">Detalle</th>
                                            </tr></thead>
                                            <tbody>
                                              ${carryoverBajas.map((r,i)=>`<tr style="background:${i%2===0?'rgba(239,68,68,0.03)':'transparent'};border-bottom:1px solid rgba(239,68,68,0.06);">
                                                <td style="padding:7px 8px;font-weight:700;color:#ef4444;">${r.c||'-'}</td>
                                                <td style="padding:7px 8px;font-weight:600;">${r.n||'-'}</td>
                                                <td style="padding:7px 8px;">${r.pa||'-'}</td>
                                                <td style="padding:7px 8px;">${r.e||'-'}</td>
                                                <td style="padding:7px 8px;color:#64748b;">${r.p||'-'}</td>
                                                <td style="padding:7px 8px;text-align:center;color:#ef4444;font-weight:800;">${r.baja_mes}</td>
                                                <td style="padding:7px 8px;text-align:center;color:#0f172a;font-weight:800;">${r.mes_actual}</td>
                                                <td style="padding:7px 8px;font-size:10px;line-height:1.25;color:#991b1b;">${r.detail}<br><span style="color:#64748b;">Fecha baja: ${r.baja_fecha || '-'}${r.pago_label ? ` | Pago: ${r.pago_label}` : ''}</span></td>
                                              </tr>`).join('')}
                                            </tbody>
                                          </table>
                                        </div>` : '';
                                        const reingresoTable = data.length ? `
                                        <table style="width:100%;border-collapse:collapse;font-size:11px;">
                                          <thead><tr style="background:rgba(245,158,11,0.08);position:sticky;top:0;">
                                            <th style="padding:9px 8px;text-align:left;">Codigo</th>
                                            <th style="padding:9px 8px;text-align:left;">Colaborador</th>
                                            <th style="padding:9px 8px;text-align:left;">Pais</th>
                                            <th style="padding:9px 8px;text-align:left;">Empresa</th>
                                            <th style="padding:9px 8px;text-align:left;">Ultimo mes activo</th>
                                            <th style="padding:9px 8px;text-align:left;">Mes de reingreso</th>
                                            <th style="padding:9px 8px;text-align:center;">Meses fuera</th>
                                          </tr></thead>
                                          <tbody>
                                            ${data.sort((a,b)=>b.meses_fuera-a.meses_fuera).map((r,i)=>`<tr style="background:${i%2===0?'rgba(245,158,11,0.03)':'transparent'};border-bottom:1px solid rgba(245,158,11,0.07);">
                                              <td style="padding:7px 8px;font-weight:700;color:#f59e0b;">${r.c||'-'}</td>
                                              <td style="padding:7px 8px;font-weight:600;">${r.n||'-'}</td>
                                              <td style="padding:7px 8px;">${r.pa||'-'}</td>
                                              <td style="padding:7px 8px;">${r.e||'-'}</td>
                                              <td style="padding:7px 8px;color:#ef4444;">${r.ultimo||'-'}</td>
                                              <td style="padding:7px 8px;color:#22c55e;">${r.reingreso||'-'}</td>
                                              <td style="padding:7px 8px;text-align:center;"><span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:50px;font-weight:900;">${r.meses_fuera} mes${r.meses_fuera!==1?'es':''}</span></td>
                                            </tr>`).join('')}
                                          </tbody>
                                        </table>` : '<p style="color:#94a3b8;padding:16px 0 4px;text-align:center;">Sin reingresos reales en el filtro seleccionado</p>';
                                        tableEl.innerHTML = summaryHtml + carryoverHtml + reingresoTable;
                                    }

                                // ---- DOBLE PAGO ----
                                } else if (tab === 'doblePago') {
                                    let data = getAuditDoblePagoData();
                                    if (fAn) data = data.filter(r => String(r.anio) === fAn);
                                    if (fMes) data = data.filter(r => r.mes === fMes.split(' ')[0]);

                                    if (badge)    badge.textContent    = `${data.length} alertas`;
                                    if (subtitle) subtitle.textContent = 'Personas en 2+ empresas el mismo mes â€” posible doble pago en planilla';

                                    // Chart
                                    const byM = {};
                                    data.forEach(d => { const k=`${d.mes} ${d.anio}`; if(!byM[k]) byM[k]=0; byM[k]++; });
                                    const mE = Object.entries(byM).sort((a,b)=>{
                                        const mo=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
                                        const [am,ay]=a[0].split(' '); const [bm,by]=b[0].split(' ');
                                        return Number(ay)*12+mo.indexOf(am) - (Number(by)*12+mo.indexOf(bm));
                                    });
                                    if (chartEl && typeof Chart !== 'undefined') {
                                        if (chartEl._ci) chartEl._ci.destroy();
                                        chartEl._ci = new Chart(chartEl.getContext('2d'), {
                                            type:'bar',
                                            data:{ labels:mE.map(e=>e[0]), datasets:[{label:'Personas doble pago', data:mE.map(e=>e[1]), backgroundColor:'#ef4444', borderRadius:8}] },
                                            options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:'rgba(0,0,0,0.05)'},ticks:{stepSize:1}},x:{grid:{display:false}}} }
                                        });
                                    }

                                    if (tableEl) {
                                        tableEl.innerHTML = data.length ? `
                                        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 18px;margin-bottom:14px;font-size:12px;color:#991b1b;">
                                          <b>âš ï¸ ALERTA:</b> Estas ${data.length} personas aparecen en 2+ empresas el mismo mes. Puede ser un error de registro o un doble pago real.
                                        </div>
                                        <table style="width:100%;border-collapse:collapse;font-size:11px;">
                                          <thead><tr style="background:rgba(239,68,68,0.08);position:sticky;top:0;">
                                            <th style="padding:9px 8px;text-align:left;">Colaborador</th>
                                            <th style="padding:9px 8px;text-align:left;">Mes</th>
                                            <th style="padding:9px 8px;text-align:left;">Empresas simultÃ¡neas</th>
                                          </tr></thead>
                                          <tbody>
                                            ${data.map((d,i)=>`<tr style="background:${i%2===0?'rgba(239,68,68,0.03)':'transparent'};border-bottom:1px solid rgba(239,68,68,0.06);">
                                              <td style="padding:7px 8px;font-weight:700;color:#ef4444;">âš ï¸ ${d.n}</td>
                                              <td style="padding:7px 8px;">${d.mes} ${d.anio}</td>
                                              <td style="padding:7px 8px;">${(d.empresas||[]).map(e=>`<span style="background:rgba(239,68,68,0.1);padding:2px 8px;border-radius:6px;margin-right:4px;font-size:10px;">${e}</span>`).join('')}</td>
                                            </tr>`).join('')}
                                          </tbody>
                                        </table>` : '<p style="color:#22c55e;padding:30px;text-align:center;">âœ… Sin alertas de doble pago en el filtro seleccionado</p>';
                                    }
                                }
                            } catch(err) {
                                console.error('renderAudit error:', err);
                            }
                        }

                        function auditExport() {
                            const tab  = window._auditTab || 'recon';
                            const fMes = (document.getElementById('auditFilterMes')||{}).value || '';
                            const fEmp = (document.getElementById('auditFilterEmpresa')||{}).value || '';
                            const fPa  = (document.getElementById('auditFilterPa')||{}).value || '';
                            const fAn  = (document.getElementById('auditFilterAnio')||{}).value || '';
                            const months = ['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
                            let headers, rows, filename;
                            
                            if (tab === 'recon') {
                                let data = getAuditReconData().filter(r=>r.hc_ant!==null);
                                if (fEmp) data = data.filter(r=>r.e===fEmp);
                                if (fPa)  data = data.filter(r=>r.pa===fPa);
                                if (fAn)  data = data.filter(r=>String(r.y)===fAn);
                                if (fMes) data = data.filter(r=>`${months[r.m]} ${r.y}`===fMes);

                                const peopleBridge = buildAuditPeopleBridge({ fMes, fEmp, fPa, fAn });
                                headers = ['SECCION','CASO','CODIGO','NOMBRE','PAIS','EMPRESA','PUESTO','MES_ACTUAL','HC_ANTERIOR','ALTAS','BAJAS_MES_ANT','BAJAS_MES_ACTUAL','HC_ESPERADO_MANUAL','HC_NETO_DASHBOARD','DIFERENCIA_NETA','DETALLE'];
                                rows = [];
                                if (peopleBridge) {
                                    rows.push([
                                        'RESUMEN_CUADRE',
                                        'PUENTE_PERSONAS',
                                        '',
                                        '',
                                        fPa || 'TODOS',
                                        fEmp || 'TODAS',
                                        '',
                                        peopleBridge.labels.current,
                                        peopleBridge.counts.previousHC,
                                        peopleBridge.counts.hires,
                                        peopleBridge.counts.bajasPrev,
                                        peopleBridge.counts.bajasCurrent,
                                        peopleBridge.counts.bridgeExpected,
                                        peopleBridge.counts.currentNet,
                                        peopleBridge.counts.netDiff,
                                        `${peopleBridge.counts.missing} faltan | ${peopleBridge.counts.extra} sobran | ${peopleBridge.counts.disappearedNoBaja} sin baja | ${peopleBridge.counts.bajaFueraPuente || 0} baja fuera del puente | ${peopleBridge.counts.currentNoAlta} nuevos sin alta`
                                    ]);
                                    peopleBridge.movementRows.forEach(x => rows.push([
                                        'PERSONAS_CUADRE',
                                        x.kind,
                                        x.row.c || '',
                                        x.row.n || '',
                                        x.row.pa || '',
                                        x.row.e || '',
                                        x.row.p || '',
                                        peopleBridge.labels.current,
                                        '',
                                        '',
                                        '',
                                        '',
                                        '',
                                        '',
                                        '',
                                        x.detail
                                    ]));
                                }
                                data.forEach(r => rows.push([
                                    'RECON_ORIGINAL',
                                    r.diff ? 'DISCREPANCIA' : 'OK',
                                    '',
                                    '',
                                    r.pa,
                                    r.e,
                                    '',
                                    `${months[r.m]} ${r.y}`,
                                    r.hc_ant,
                                    r.altas,
                                    '',
                                    r.bajas,
                                    r.hc_esp,
                                    r.hc_real,
                                    r.diff,
                                    `Altas: ${(r.altas_names||[]).join(' | ')} / Bajas: ${(r.bajas_names||[]).join(' | ')}`
                                ]));
                                filename = 'HC_Reconciliacion.csv';
                            } else if (tab === 'faltantes') {
                                let data = getAuditDeparturesData();
                                if (fEmp) data = data.filter(r=>r.e===fEmp);
                                if (fPa)  data = data.filter(r=>r.pa===fPa);
                                if (fAn)  data = data.filter(r=>String(r.mes_salida_y)===fAn);
                                if (fMes) data = data.filter(r=>r.mes_salida_label === fMes);
                                if (window._subStatusFilter) data = data.filter(r=>r.status === window._subStatusFilter);
                                
                                headers = ['CODIGO','NOMBRE','PAIS','EMPRESA','PUESTO','FECHA_INGRESO','ULTIMO_MES_ACTIVO','MES_SALIDA','ESTADO_AUDITORIA','FECHA_BAJA_REG','MES_BAJA_REG','MOTIVO_BAJA_REG','DESFASE_MESES'];
                                rows = data.map(r=>[r.c,r.n,r.pa,r.e,r.p,r.fi,r.ultimo_mes_activo_label,r.mes_salida_label,r.status,r.baja_fecha,r.baja_label,r.baja_motivo,r.diff_months]);
                                filename = `Salidas_Planilla_${window._subStatusFilter||'Todas'}.csv`;
                            } else if (tab === 'reingreso') {
                                let data = getAuditReingresoData();
                                if (fEmp) data = data.filter(r=>r.e===fEmp);
                                if (fPa)  data = data.filter(r=>r.pa===fPa);
                                if (fAn)  data = data.filter(r=>String(r.reingreso_anio)===fAn);
                                if (fMes) data = data.filter(r=>r.reingreso===fMes);
                                const carryoverBajas = buildAuditPrevBajaStillActive({ fMes, fEmp, fPa, fAn });
                                
                                headers = ['TIPO','CODIGO','NOMBRE','PAIS','EMPRESA','ULTIMO_MES','REINGRESO_MES','MESES_FUERA','BAJA_MES_ANTERIOR','MES_ACTUAL','FECHA_BAJA','PAGO_MES'];
                                rows = [];
                                carryoverBajas.forEach(r => rows.push(['BAJA_MES_ANTERIOR_ACTIVO_MES_ACTUAL',r.c,r.n,r.pa,r.e,'','', '',r.baja_mes,r.mes_actual,r.baja_fecha,r.pago_label]));
                                data.forEach(r => rows.push(['REINGRESO_REAL',r.c,r.n,r.pa,r.e,r.ultimo,r.reingreso,r.meses_fuera,'','','','']));
                                filename = 'Reingresos_y_Bajas_Activas.csv';
                            } else {
                                let data = getAuditDoblePagoData();
                                if (fAn) data = data.filter(r=>String(r.anio)===fAn);
                                if (fMes) data = data.filter(r=>r.mes===fMes.split(' ')[0]);
                                
                                headers = ['NOMBRE','MES','ANIO','EMPRESAS'];
                                rows = data.map(r=>[r.n,r.mes,r.anio,(r.empresas||[]).join(' | ')]);
                                filename = 'Doble_Pago.csv';
                            }
                            
                            const csv = [headers,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
                            const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href=url; a.download=filename;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                        }

                        // Make renderSustituciones point to renderAudit for compatibility
                        function renderSustituciones() { renderAudit(); }




