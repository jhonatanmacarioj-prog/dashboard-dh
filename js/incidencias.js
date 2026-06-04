// Incidencias Pro: filtros internos, lectura ejecutiva y detalle exportable.

function renderIncidencias() {
    const pane = document.getElementById('pane3');
    if (!pane) return;

    window.activeCharts = window.activeCharts || (typeof activeCharts !== 'undefined' ? activeCharts : []);
    window.activeCharts.forEach(c => { if (c && typeof c.destroy === 'function') c.destroy(); });
    window.activeCharts = [];
    if (typeof activeCharts !== 'undefined') activeCharts = window.activeCharts;

    window._incFilters = Object.assign({ tipo: 'ALL', sev: 'ALL', fuente: 'ALL', responsable: 'ALL', search: '', monthScope: '6m', month: 'ALL', distDim: 'dir' }, window._incFilters || {});
    const local = window._incFilters;
    const { e: emp, a, d, y: yr, m: mo, countries } = getFilters();
    const allIncs = (app.incidencias && app.incidencias.length ? app.incidencias : ((window.hcFullData && window.hcFullData.incidencias && window.hcFullData.incidencias.length) ? window.hcFullData.incidencias : (app.bajas_list || app.departures || []).filter(r => r && (r.fecha_pago || r.pago_y || r.pago_m || r.mes_baja_excel)).map(r => {
        const yy = Number(r.pago_y || r.y || 0);
        const mm = Number(r.pago_m || r.m || 0);
        const bajaY = Number(r.y || 0);
        const bajaM = Number(r.m || 0);
        const posterior = yy && mm && bajaY && bajaM && ((yy * 12 + mm) > (bajaY * 12 + bajaM));
        return {
            c: r.c || r.codigo || '',
            n: r.n || r.nombre || '',
            p: r.p || r.puesto || '',
            pa: r.pa || r.pais || '',
            e: r.e || r.empresa || '',
            dir: r.dir || r.area || '',
            d: r.d || r.depto || r.departamento || '',
            y: yy || bajaY,
            m: mm || bajaM,
            f: r.fecha_pago || r.f || '',
            sev: posterior ? 'Alta' : 'Media',
            t: posterior ? 'Pago posterior a baja' : 'Baja con pago registrado',
            tipo: posterior ? 'Pago posterior a baja' : 'Baja con pago registrado',
            detalle: posterior ? `Fecha de baja ${r.f || '-'} con pago registrado en ${r.mes_baja_excel || `${mm}/${yy}`}.` : `Baja con pago registrado (${r.motivo || r.motivo_raw || 'Sin motivo'}).`,
            source: 'Bajas / pago',
            fuente: 'Bajas / pago',
            r: r.motivo || r.motivo_raw || 'Baja registrada',
            monto: Number(r.monto || 0)
        };
    })));
    const allEmployees = app.employees || [];
    const sevRank = { Alta: 3, Media: 2, Baja: 1 };
    const sevColor = { Alta: '#dc2626', Media: '#f59e0b', Baja: '#0f766e' };
    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const txt = v => String(v || '').trim().toUpperCase();
    const clean = v => String(v || '').trim();
    const rowPa = r => normalizePa(r.pa || r.p || r.pais || '');
    const money = n => (Number(n || 0)).toLocaleString('es-GT', { maximumFractionDigits: 0 });
    const esc = v => String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    const jsq = v => String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const dateParts = r => {
        const parts = String(r.f || r.fecha || '').split('/');
        return {
            y: Number(r.y || r.yr || (parts.length >= 3 ? parts[2] : 0)),
            m: Number(r.m || r.mo || (parts.length >= 2 ? parts[1] : 0))
        };
    };
    
    // Global filter matching:
    const matchBase = r => {
        const cp = rowPa(r);
        return (countries.length === 0 || countries.includes(cp)) &&
            (emp === 'ALL' || txt(r.e || r.empresa) === txt(emp)) &&
            (a === 'ALL' || txt(r.dir || r.area || r.direccion) === txt(a)) &&
            (d === 'ALL' || txt(r.d || r.depto || r.departamento) === txt(d));
    };
    
    const matchPeriod = (r, forceMonth) => {
        const fp = dateParts(r);
        const monthFilter = forceMonth === undefined ? mo : forceMonth;
        return (yr === 'ALL' || fp.y === Number(yr) || String(r.f || '').includes(String(yr))) &&
            (monthFilter === 'ALL' || fp.m === Number(monthFilter));
    };
    
    const getResp = i => clean(i.r || i.responsable || i.dir || i.area || i.source || 'Sin responsable');
    const getFuente = i => clean(i.source || i.fuente || 'Sin fuente');
    const getTipo = i => clean(i.t || i.tipo || 'Sin tipo');
    const haystack = i => txt([i.c, i.n, i.e, i.pa, i.dir, i.d, i.t, i.detalle, i.source, i.r, i.f].join(' '));
    const search = txt(local.search);

    // Internal and global filter helper, ignoring month filter (used for Trend chart counts):
    const matchFiltersExceptMonth = (i) => {
        const cp = rowPa(i);
        const fp = dateParts(i);
        const matchGlobalExceptMonth = (countries.length === 0 || countries.includes(cp)) &&
            (emp === 'ALL' || txt(i.e || i.empresa) === txt(emp)) &&
            (a === 'ALL' || txt(i.dir || i.area || i.direccion) === txt(a)) &&
            (d === 'ALL' || txt(i.d || i.depto || i.departamento) === txt(d)) &&
            (yr === 'ALL' || fp.y === Number(yr) || String(i.f || '').includes(String(yr)));
            
        const matchInternal = (local.tipo === 'ALL' || getTipo(i) === local.tipo) &&
            (local.sev === 'ALL' || clean(i.sev || 'Baja') === local.sev) &&
            (local.fuente === 'ALL' || getFuente(i) === local.fuente) &&
            (local.responsable === 'ALL' || getResp(i) === local.responsable) &&
            (!search || haystack(i).includes(search));
            
        return matchGlobalExceptMonth && matchInternal;
    };

    const periodBaseIncs = allIncs.filter(i => matchBase(i) && matchPeriod(i));
    const yearCandidates = periodBaseIncs.map(i => dateParts(i).y).filter(Boolean);
    const targetYear = yr !== 'ALL' ? Number(yr) : (yearCandidates.length ? Math.max(...yearCandidates) : new Date().getFullYear());
    
    const yearMonths = periodBaseIncs
        .map(i => dateParts(i))
        .filter(fp => fp.y === targetYear && fp.m >= 1 && fp.m <= 12)
        .map(fp => fp.m);
        
    const targetMonth = mo !== 'ALL'
        ? Number(mo)
        : (yearMonths.length ? Math.max(...yearMonths) : 12);
        
    const monthScope = local.monthScope === '12m' ? '12m' : '6m';
    const visibleMonths = monthScope === '12m'
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 6 }, (_, i) => targetMonth - 5 + i).filter(mn => mn >= 1 && mn <= 12);
        
    const visibleMonthSet = new Set(visibleMonths);
    if (local.month !== 'ALL' && !visibleMonthSet.has(Number(local.month))) local.month = 'ALL';
    
    const baseIncs = periodBaseIncs.filter(i => {
        const fp = dateParts(i);
        return fp.y === targetYear &&
            visibleMonthSet.has(fp.m) &&
            (local.month === 'ALL' || fp.m === Number(local.month));
    });
    
    // Trend month counts now reflect all active filters except month:
    const monthCounts = visibleMonths.map(mn => ({
        m: mn,
        count: allIncs.filter(i => {
            const fp = dateParts(i);
            return fp.y === targetYear && fp.m === mn && matchFiltersExceptMonth(i);
        }).length
    }));
    
    const optsFrom = (arr, fn) => [...new Set(arr.map(fn).filter(Boolean))].sort((x, y) => x.localeCompare(y));
    const tiposOpt = optsFrom(baseIncs, getTipo);
    const sevOpt = optsFrom(baseIncs, i => clean(i.sev || 'Baja'));
    const fuenteOpt = optsFrom(baseIncs, getFuente);
    const respOpt = optsFrom(baseIncs, getResp);
    const incs = baseIncs.filter(i =>
        (local.tipo === 'ALL' || getTipo(i) === local.tipo) &&
        (local.sev === 'ALL' || clean(i.sev || 'Baja') === local.sev) &&
        (local.fuente === 'ALL' || getFuente(i) === local.fuente) &&
        (local.responsable === 'ALL' || getResp(i) === local.responsable) &&
        (!search || haystack(i).includes(search))
    ).sort((x, y) => (sevRank[y.sev] || 0) - (sevRank[x.sev] || 0) || Number(y.monto || 0) - Number(x.monto || 0));

    window._incFilteredRows = incs;
    const metricMonth = local.month !== 'ALL' ? Number(local.month) : targetMonth;
    const isNetoInc = (window._hcType || 'neto') === 'neto';
    const flagModeInc = window._flagMode || 'hc';
    const keyOf = r => (typeof personKey === 'function' ? personKey(r) : String(r.c || r.n || '').trim().toUpperCase());
    const empMonthRows = allEmployees.filter(r => matchBase(r) && Number(r.y || 0) === Number(targetYear) && Number(r.m || 0) === Number(metricMonth));
    const bajasMonthRows = (app.bajas_list || app.departures || []).filter(r => matchBase(r) && Number(r.y || 0) === Number(targetYear) && Number(r.m || 0) === Number(metricMonth));
    const bajasMonthSet = new Set(bajasMonthRows.map(keyOf));
    const altasMonthRows = allEmployees.filter(r => {
        const parts = String(r.fi || r.fecha_ingreso || '').split('/');
        const fy = Number(r._fiY || r.fiY || (parts.length >= 3 ? parts[2] : 0));
        const fm = Number(r._fiM || r.fiM || (parts.length >= 2 ? parts[1] : 0));
        return matchBase(r) && fy === Number(targetYear) && fm === Number(metricMonth);
    });
    
    let totalHC = 1;
    let hcMetricLabel = isNetoInc ? 'HC Neto' : 'HC Bruto';
    if (flagModeInc === 'altas') {
        totalHC = new Set(altasMonthRows.map(keyOf)).size || 1;
        hcMetricLabel = 'HC Altas';
    } else if (flagModeInc === 'bajas') {
        totalHC = new Set(bajasMonthRows.map(keyOf)).size || 1;
        hcMetricLabel = 'HC Bajas';
    } else {
        const hcRows = isNetoInc ? empMonthRows.filter(r => !bajasMonthSet.has(keyOf(r))) : empMonthRows;
        totalHC = new Set(hcRows.map(keyOf)).size || 1;
    }
    
    const totalInc = incs.length;
    const altas = incs.filter(i => clean(i.sev) === 'Alta').length;
    const media = incs.filter(i => clean(i.sev) === 'Media').length;
    const baja = incs.filter(i => clean(i.sev || 'Baja') === 'Baja').length;
    const cheques = incs.filter(i => txt(getTipo(i)).includes('CHEQUE')).length;
    const atrasos = incs.filter(i => txt(getFuente(i)).includes('ATRAS') || txt(getTipo(i)).includes('ATRAS')).length;
    const totalMonto = incs.reduce((sum, i) => sum + Number(i.monto || 0), 0);
    const tasa = ((totalInc / totalHC) * 100).toFixed(1);

    const prevMo = mo !== 'ALL' ? (Number(mo) === 1 ? 12 : Number(mo) - 1) : 'ALL';
    const prevYr = mo !== 'ALL' && Number(mo) === 1 && yr !== 'ALL' ? String(Number(yr) - 1) : yr;
    const prevBase = allIncs.filter(i => {
        const fp = dateParts(i);
        return matchBase(i) && (prevYr === 'ALL' || fp.y === Number(prevYr)) && (prevMo === 'ALL' || fp.m === Number(prevMo));
    });
    const delta = prevBase.length ? (((totalInc - prevBase.length) / prevBase.length) * 100).toFixed(1) : (totalInc ? '100.0' : '0.0');
    const deltaColor = Number(delta) > 0 ? '#dc2626' : Number(delta) < 0 ? '#16a34a' : '#64748b';

    const countBy = (arr, keyFn) => arr.reduce((acc, row) => {
        const key = keyFn(row) || 'Sin dato';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    
    const tipos = countBy(incs, getTipo);
    const responsables = countBy(incs, getResp);
    const areas = countBy(incs, i => clean(i.dir || i.area || 'Sin area'));
    const colaboradores = countBy(incs, i => clean(i.n || i.c || 'Sin colaborador'));
    const monthlyInc = Array(12).fill(0);
    incs.forEach(i => {
        const mm = dateParts(i).m;
        if (mm >= 1 && mm <= 12) monthlyInc[mm - 1]++;
    });
    
    const topArea = Object.entries(areas).sort((a, b) => b[1] - a[1])[0] || ['Sin área', 0];
    const topTipo = Object.entries(tipos).sort((a, b) => b[1] - a[1])[0] || ['Sin tipo', 0];
    const topResp = Object.entries(responsables).sort((a, b) => b[1] - a[1])[0] || ['Sin responsable', 0];
    const fuentes = countBy(incs, getFuente);
    const topFuente = Object.entries(fuentes).sort((a, b) => b[1] - a[1])[0] || ['Sin fuente', 0];
    const distDim = ['dir', 'd', 'pa', 'e'].includes(local.distDim) ? local.distDim : 'dir';
    
    const distMeta = {
        dir: { label: 'Área', data: countBy(incs, i => clean(i.dir || i.area || 'Sin área')) },
        d: { label: 'Departamento', data: countBy(incs, i => clean(i.d || i.depto || i.departamento || 'Sin departamento')) },
        pa: { label: 'País', data: countBy(incs, i => rowPa(i) || 'Sin país') },
        e: { label: 'Empresa', data: countBy(incs, i => clean(i.e || i.empresa || 'Sin empresa')) }
    };
    
    const distEntries = Object.entries(distMeta[distDim].data).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([name, total]) => ({ name, total, pct: totalInc ? ((total / totalInc) * 100).toFixed(1) : '0.0' }));
    const topScorers = Object.entries(colaboradores).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, total], idx) => {
        const rowsCol = incs.filter(i => clean(i.n || i.c || 'Sin colaborador') === name);
        return { name, total, rank: idx + 1, alta: rowsCol.filter(i => clean(i.sev) === 'Alta').length, media: rowsCol.filter(i => clean(i.sev) === 'Media').length, baja: rowsCol.filter(i => clean(i.sev || 'Baja') === 'Baja').length, empresa: rowsCol[0]?.e || '', codigo: rowsCol[0]?.c || '' };
    });
    
    const severityPressure = totalInc ? ((altas / totalInc) * 48) + ((media / totalInc) * 28) + ((baja / totalInc) * 8) : 0;
    const alertPressure = totalInc ? ((cheques + atrasos) / totalInc) * 18 : 0;
    const incidencePressure = Math.min(32, Number(tasa) * 3.2);
    const riskScore = Math.min(100, Math.round(severityPressure + alertPressure + incidencePressure));
    const riskLabel = riskScore >= 65 ? 'CRÍTICO' : riskScore >= 20 ? 'EN OBSERVACIÓN' : 'CONTROLADO';
    const riskColor = riskScore >= 70 ? '#dc2626' : riskScore >= 35 ? '#f59e0b' : '#16a34a';
    
    const execBrief = [
        `${riskLabel}: ${totalInc.toLocaleString()} incidencias sobre ${totalHC.toLocaleString()} colaboradores (${tasa}%).`,
        `La causa principal es ${topTipo[0]} con ${topTipo[1]} casos; el área más expuesta es ${topArea[0]} con ${topArea[1]}.`,
        `El responsable/fuente con mayor concentración es ${topResp[0]} (${topResp[1]}); la fuente dominante es ${topFuente[0]} (${topFuente[1]}).`,
        `El movimiento contra el mes anterior es ${Number(delta) > 0 ? '+' : ''}${delta}%.`
    ];
    window._incExecutiveBrief = execBrief;

    const areaSeverity = Object.entries(areas).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([areaName, total]) => {
        const rowsArea = incs.filter(i => clean(i.dir || i.area || 'Sin área') === areaName);
        return { areaName, total, alta: rowsArea.filter(i => clean(i.sev) === 'Alta').length, media: rowsArea.filter(i => clean(i.sev) === 'Media').length, baja: rowsArea.filter(i => clean(i.sev || 'Baja') === 'Baja').length };
    });

    const select = (id, label, value, opts, setter) => `
        <label style="display:flex; flex-direction:column; gap:5px; min-width:132px; flex:1;">
            <span style="font-size:8px; color:#ddd6fe; font-weight:950; text-transform:uppercase; letter-spacing:.8px;">${label}</span>
            <select id="${id}" onchange="${setter}" style="height:34px; border:1px solid rgba(255,255,255,0.22); background:rgba(255,255,255,0.92); border-radius:10px; color:#2e1065; font-size:10px; font-weight:950; padding:0 10px; outline:none; box-shadow:0 8px 18px rgba(46,16,101,0.12);">
                <option value="ALL">Todos</option>
                ${opts.map(o => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}
            </select>
        </label>`;

    // Premium renderIncKpi with left border color and transition shadow:
    const renderIncKpi = (label, value, subtext, subtextColor, leftBorderColor) => `
        <div style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; border-left: 5px solid ${leftBorderColor || '#7c3aed'}; display: flex; flex-direction: column; justify-content: space-between; min-height: 100px; transition: transform 0.2s ease, box-shadow 0.2s ease;" class="inc-kpi-card-hover"
             onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 10px 22px rgba(0,0,0,0.06)';"
             onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 18px rgba(0,0,0,0.03)';">
            <div style="font-size: 11px; font-weight: 850; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${label}</div>
            <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 900; color: #0f172a; margin: 8px 0 4px; line-height: 1;">${value}</div>
            <div style="font-size: 11px; font-weight: 700; color: ${subtextColor || '#64748b'}; display: flex; align-items: center; gap: 4px;">
                ${subtext}
            </div>
        </div>`;

    const monthGrid = `
        <div style="margin:0 0 10px; padding:16px; border-radius:16px; background:linear-gradient(180deg,#ffffff 0%,#fbf7ff 100%); border:1px solid rgba(124,58,237,0.20); box-shadow:0 18px 34px rgba(88,28,135,0.11);">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:10px; flex-wrap:wrap;">
                <div>
                    <div style="font-size:11px; font-weight:1000; color:#7c3aed; text-transform:uppercase; letter-spacing:1.2px;">Centro de mando</div>
                    <div style="font-family:'Montserrat'; font-size:24px; font-weight:1000; color:#0f172a; line-height:1;">Incidencias por meses</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                    <div style="padding:8px 13px; border-radius:13px; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; box-shadow:0 12px 24px rgba(124,58,237,0.24);">
                        <div style="font-size:9px; font-weight:950; text-transform:uppercase; letter-spacing:.8px; opacity:.86;">Total seleccionado</div>
                        <div style="font-family:'Montserrat'; font-size:28px; line-height:1; font-weight:1000;">${totalInc.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(${monthScope === '12m' ? 6 : Math.max(1, visibleMonths.length)}, minmax(0,1fr)); gap:10px;">
                ${monthCounts.map(item => {
                    const isActive = Number(local.month) === item.m;
                    return `<button onclick="window._incFilters.month=window._incFilters.month==='${item.m}'?'ALL':'${item.m}'; renderIncidencias();" style="border:1px solid ${isActive ? '#7c3aed' : 'rgba(148,163,184,0.22)'}; background:${isActive ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#ffffff'}; color:${isActive ? '#fff' : '#334155'}; border-radius:13px; padding:11px 10px; cursor:pointer; box-shadow:0 12px 24px rgba(88,28,135,0.07);">
                        <div style="font-size:13px; font-weight:1000; text-transform:uppercase;">${monthNames[item.m]}</div>
                        <div style="font-family:'Montserrat'; font-size:28px; line-height:1; font-weight:1000; margin-top:6px;">${item.count}</div>
                    </button>`;
                }).join('')}
            </div>
        </div>`;

    const rows = incs.slice(0, 250).map(i => {
        const sev = clean(i.sev || 'Baja');
        return `<tr>
            <td style="padding:10px 12px; font-weight:900; color:#111827;">${esc(i.n || i.c || '-')}</td>
            <td style="padding:10px 12px; color:#475569; font-weight:800;">${esc(rowPa(i) || '-')} / ${esc(i.e || '-')}</td>
            <td style="padding:10px 12px;"><span style="display:inline-block; padding:4px 8px; border-radius:999px; background:${(sevColor[sev] || '#64748b')}18; color:${sevColor[sev] || '#64748b'}; font-size:10px; font-weight:950;">${esc(sev)}</span></td>
            <td style="padding:10px 12px; color:#111827; font-weight:800;">${esc(getTipo(i))}</td>
            <td style="padding:10px 12px; color:#475569;">${esc(i.detalle || '-')}</td>
            <td style="padding:10px 12px; color:#64748b; font-weight:800;">${esc(getResp(i))}</td>
            <td style="padding:10px 12px; text-align:right; font-weight:900; color:#0f172a;">${esc(getFuente(i))}</td>
            <td style="padding:10px 12px; text-align:right; color:#64748b; font-weight:800;">${esc(i.f || '-')}</td>
        </tr>`;
    }).join('');

    const deltaIcon = Number(delta) > 0 ? '<i class="fas fa-arrow-trend-up"></i>' : Number(delta) < 0 ? '<i class="fas fa-arrow-trend-down"></i>' : '<i class="fas fa-minus"></i>';
    const deltaLabel = `${deltaIcon} ${Number(delta) > 0 ? '+' : ''}${delta}% vs ${monthNames[prevMo] || 'mes anterior'}`;

    const sevIcon = riskLabel === 'CRÍTICO' ? '<i class="fas fa-circle-exclamation"></i>' : '<i class="fas fa-circle-info"></i>';
    const sevLabel = `${sevIcon} ${riskLabel === 'CRÍTICO' ? 'Alta severidad' : riskLabel === 'EN OBSERVACIÓN' ? 'Media severidad' : 'Baja severidad'}`;
    const sevColorVal = riskLabel === 'CRÍTICO' ? '#dc2626' : riskLabel === 'EN OBSERVACIÓN' ? '#f59e0b' : '#16a34a';

    const chequeIcon = cheques > 0 ? '<i class="fas fa-circle-exclamation"></i>' : '<i class="fas fa-circle-check"></i>';
    const chequeLabel = `${chequeIcon} ${cheques > 0 ? `${cheques} alerta(s)` : 'Sin alertas'}`;
    const chequeColorVal = cheques > 0 ? '#dc2626' : '#16a34a';

    const incKpiGrid = `
        <div style="display:grid; grid-template-columns:repeat(4, minmax(150px,1fr)); gap:15px; margin-bottom:20px;">
            ${renderIncKpi(`INCIDENCIAS (${(monthNames[metricMonth] || '').toUpperCase()})`, totalInc.toLocaleString(), deltaLabel, deltaColor, '#7c3aed')}
            ${renderIncKpi('INSATISFACCIÓN PAGO', tasa + '%', sevLabel, sevColorVal, sevColorVal)}
            ${renderIncKpi('HC NETO TOTAL', totalHC.toLocaleString(), 'Colaboradores activos', '#64748b', '#3b82f6')}
            ${renderIncKpi('CHEQUES ALERTAS', cheques.toLocaleString(), chequeLabel, chequeColorVal, chequeColorVal)}
        </div>`;

    const filterControls = `
        <div style="position:relative; z-index:1; width:min(760px, 100%); display:grid; grid-template-columns:repeat(4,minmax(120px,1fr)) 1.4fr auto auto auto; gap:8px; align-items:end;">
            ${select('incTipoFilter', 'Tipo', local.tipo, tiposOpt, "window._incFilters.tipo=this.value; renderIncidencias();")}
            ${select('incSevFilter', 'Severidad', local.sev, sevOpt, "window._incFilters.sev=this.value; renderIncidencias();")}
            ${select('incFuenteFilter', 'Fuente', local.fuente, fuenteOpt, "window._incFilters.fuente=this.value; renderIncidencias();")}
            ${select('incRespFilter', 'Responsable', local.responsable, respOpt, "window._incFilters.responsable=this.value; renderIncidencias();")}
            <label style="display:flex; flex-direction:column; gap:5px; min-width:150px;">
                <span style="font-size:8px; color:#ddd6fe; font-weight:950; text-transform:uppercase; letter-spacing:.8px;">Buscar</span>
                <input id="incSearchBox" value="${esc(local.search)}" oninput="window._incFilters.search=this.value; clearTimeout(window._incSearchTimer); window._incSearchTimer=setTimeout(renderIncidencias, 300);" placeholder="Colaborador, código..." style="height:34px; border:1px solid rgba(255,255,255,0.22); background:rgba(255,255,255,0.92); border-radius:10px; color:#2e1065; font-size:10px; font-weight:950; padding:0 10px; outline:none; box-shadow:0 8px 18px rgba(46,16,101,0.12);">
            </label>
            <button onclick="window._incFilters={tipo:'ALL',sev:'ALL',fuente:'ALL',responsable:'ALL',search:'',monthScope:'6m',month:'ALL',distDim:'dir'}; window._showAllRanking=false; renderIncidencias();" title="Limpiar filtros internos" style="height:34px; width:36px; border:none; border-radius:10px; background:rgba(255,255,255,0.16); color:#fff; cursor:pointer; font-size:12px;"><i class="fas fa-filter-circle-xmark"></i></button>
            <button onclick="exportIncidenciasFiltradas()" title="Exportar detalle filtrado" style="height:34px; width:36px; border:none; border-radius:10px; background:rgba(255,255,255,0.92); color:#6d28d9; cursor:pointer; font-size:12px;"><i class="fas fa-download"></i></button>
            <button onclick="showIncExecutiveBrief()" title="Resumen ejecutivo" style="height:34px; width:36px; border:none; border-radius:10px; background:#a855f7; color:#fff; cursor:pointer; font-size:12px;"><i class="fas fa-wand-magic-sparkles"></i></button>
        </div>`;

    const distDimButtons = [['dir','Área'],['d','Departamento'],['pa','País'],['e','Empresa']].map(([key,label]) =>
        `<button onclick="window._incFilters.distDim='${key}'; renderIncidencias();" style="height:28px; border:1px solid ${distDim === key ? '#7c3aed' : '#e9d5ff'}; background:${distDim === key ? '#7c3aed' : '#fff'}; color:${distDim === key ? '#fff' : '#6d28d9'}; border-radius:999px; padding:0 10px; font-size:9px; font-weight:1000; cursor:pointer;">${label}</button>`
    ).join('');
    
    const distRowsHtml = distEntries.map(row =>
        `<button onclick="window._incFilters.search='${jsq(row.name)}'; renderIncidencias();" style="text-align:left; border:1px solid rgba(124,58,237,0.12); background:#fff; border-radius:9px; padding:10px; cursor:pointer; box-shadow:0 6px 16px rgba(88,28,135,0.04);">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:1000; color:#334155; margin-bottom:7px; gap:10px;"><span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(row.name)}</span><span style="color:#7c3aed;">${row.total}</span></div>
            <div style="height:10px; border-radius:999px; overflow:hidden; background:#f3e8ff;">
                <div style="height:100%; width:${row.pct}%; background:linear-gradient(90deg,#7c3aed,#c084fc); border-radius:999px;"></div>
            </div>
            <div style="font-size:9px; color:#8b5cf6; font-weight:950; margin-top:5px;">${row.pct}% del filtro actual</div>
        </button>`
    ).join('') || '<div style="padding:20px; text-align:center; color:#94a3b8; font-weight:850;">Sin datos</div>';

    // Top 3 Areas progress list calculation:
    const sortedAreas = Object.entries(areas).sort((a, b) => b[1] - a[1]);
    const top3Areas = sortedAreas.slice(0, 3);
    const top3Sum = top3Areas.reduce((sum, item) => sum + item[1], 0);
    const otherAreasSum = totalInc - top3Sum;

    pane.innerHTML = `
        <!-- CABECERA DE INCIDENCIAS -->
        <div style="position:relative; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:10px; padding:15px 18px; border-radius:14px; background:linear-gradient(135deg,#1e1b4b 0%,#4c1d95 36%,#7c3aed 78%,#c084fc 132%); box-shadow:0 20px 42px rgba(76,29,149,0.26);">
            <div style="position:absolute; inset:auto -80px -120px auto; width:250px; height:250px; border-radius:50%; background:rgba(255,255,255,0.10);"></div>
            <div style="position:relative; display:flex; gap:12px; align-items:center; min-width:300px;">
                <div style="width:44px; height:44px; border-radius:13px; display:grid; place-items:center; background:rgba(255,255,255,0.15); color:#f5d0fe; border:1px solid rgba(255,255,255,0.22); font-size:18px;"><i class="fas fa-triangle-exclamation"></i></div>
                <div>
                    <h2 style="font-family:'Montserrat'; font-size:27px; margin:0; color:#fff; letter-spacing:0; text-transform:uppercase;">Incidencias de Pago</h2>
                </div>
            </div>
            ${filterControls}
        </div>

        <!-- TARJETAS KPI -->
        ${incKpiGrid}

        <!-- FILA 2: TENDENCIAS Y HALLAZGOS -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Tendencia Mensual de Incidencias -->
            <div style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">Tendencia mensual de incidencias</h3>
                        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
                            ${monthNames[visibleMonths[0]]} - ${monthNames[visibleMonths[visibleMonths.length - 1]]} ${targetYear} &middot; Total acumulado: ${monthCounts.reduce((sum, item) => sum + item.count, 0)}
                            ${local.month !== 'ALL' ? ` &middot; <span style="background:#ede9fe; color:#7c3aed; padding:2px 6px; border-radius:6px; font-weight:bold;">Filtrado: ${monthNames[Number(local.month)]}</span>` : ''}
                        </p>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="window._incFilters.monthScope='6m'; window._incFilters.month='ALL'; renderIncidencias();" style="height:28px; border:1px solid ${monthScope === '6m' ? '#7c3aed' : '#cbd5e1'}; background:${monthScope === '6m' ? '#7c3aed' : '#fff'}; color:${monthScope === '6m' ? '#fff' : '#64748b'}; border-radius:999px; padding:0 12px; font-size:10px; font-weight:800; cursor:pointer; transition: all 0.2s;">6 Meses</button>
                        <button onclick="window._incFilters.monthScope='12m'; window._incFilters.month='ALL'; renderIncidencias();" style="height:28px; border:1px solid ${monthScope === '12m' ? '#7c3aed' : '#cbd5e1'}; background:${monthScope === '12m' ? '#7c3aed' : '#fff'}; color:${monthScope === '12m' ? '#fff' : '#64748b'}; border-radius:999px; padding:0 12px; font-size:10px; font-weight:800; cursor:pointer; transition: all 0.2s;">12 Meses</button>
                    </div>
                </div>
                <div style="height: 250px; position: relative;">
                    <canvas id="chartIncTrend" style="cursor: pointer;"></canvas>
                </div>
            </div>
            
            <!-- Hallazgos clave -->
            <div style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; flex-direction: column;">
                <div style="margin-bottom: 15px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">Hallazgos clave</h3>
                    <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">${monthNames[metricMonth]} ${targetYear}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; flex: 1; justify-content: center;">
                    <!-- Mayor causa -->
                    <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border-radius:12px; padding:10px 14px; border: 1px solid #f1f5f9; border-left: 4px solid #ef4444;">
                        <div style="width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:#fee2e2; color:#ef4444; font-size:12px;"><i class="fas fa-triangle-exclamation"></i></div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.3px;">Mayor causa</div>
                            <div style="font-size:12px; color:#1e293b; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(topTipo[0])}">
                                ${esc(topTipo[0])} 
                                <span style="font-size:10px; background:#fee2e2; color:#b91c1c; padding:2px 6px; border-radius:6px; margin-left:4px; font-weight:bold;">${topTipo[1]}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Área con más casos -->
                    <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border-radius:12px; padding:10px 14px; border: 1px solid #f1f5f9; border-left: 4px solid #6366f1;">
                        <div style="width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:#ede9fe; color:#6366f1; font-size:12px;"><i class="fas fa-folder-tree"></i></div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.3px;">Área con más casos</div>
                            <div style="font-size:12px; color:#1e293b; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(topArea[0])}">
                                ${esc(topArea[0])} 
                                <span style="font-size:10px; background:#ede9fe; color:#6d28d9; padding:2px 6px; border-radius:6px; margin-left:4px; font-weight:bold;">${topArea[1]}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Movimiento vs mes anterior -->
                    <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border-radius:12px; padding:10px 14px; border: 1px solid #f1f5f9; border-left: 4px solid ${deltaColor};">
                        <div style="width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:${deltaColor}15; color:${deltaColor}; font-size:12px;">${deltaIcon}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.3px;">Movimiento vs mes anterior</div>
                            <div style="font-size:12px; color:#1e293b; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                <span style="color:${deltaColor};">${Number(delta) > 0 ? '+' : ''}${delta}%</span> 
                                <span style="font-size:10px; background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:6px; margin-left:4px; font-weight:bold;">${prevBase.length} &rarr; ${totalInc}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Fuente dominante -->
                    <div style="display:flex; align-items:center; gap:12px; background:#f8fafc; border-radius:12px; padding:10px 14px; border: 1px solid #f1f5f9; border-left: 4px solid #f59e0b;">
                        <div style="width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:#fef3c7; color:#f59e0b; font-size:12px;"><i class="fas fa-file-invoice"></i></div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.3px;">Fuente dominante</div>
                            <div style="font-size:12px; color:#1e293b; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(topFuente[0])}">
                                ${esc(topFuente[0])} 
                                <span style="font-size:10px; background:#fef3c7; color:#b45309; padding:2px 6px; border-radius:6px; margin-left:4px; font-weight:bold;">${topFuente[1]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- FILA 3: RANKING Y DISTRIBUCIÓN -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Ranking operativo -->
            <div style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; flex-direction: column; position: relative; min-height: 250px;">
                <div style="margin-bottom: 15px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">Ranking operativo</h3>
                    <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Responsable &middot; dirección o fuente</p>
                </div>
                <div id="incRanking" style="display: flex; flex-direction: column; gap: 2px; flex: 1;">
                    <!-- Se llena dinámicamente -->
                </div>
            </div>
            
            <!-- Distribución por área -->
            <div style="background: #ffffff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;">
                <div>
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">Distribución por área</h3>
                        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Principales focos de incidencias</p>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${top3Areas.map(([areaName, count], idx) => {
                            const colors = ['#4f46e5', '#8b5cf6', '#a855f7'];
                            const pct = totalInc ? Math.round((count / totalInc) * 100) : 0;
                            return `
                            <div style="display:flex; align-items:center; gap:16px;">
                                <span style="font-size:12px; font-weight:600; color:#1e293b; width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(areaName)}">
                                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${colors[idx]}; margin-right:8px;"></span>
                                    ${esc(areaName)}
                                </span>
                                <div style="flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden;">
                                    <div style="width:${pct}%; height:100%; background:${colors[idx]}; border-radius:999px;"></div>
                                </div>
                                <span style="font-size:12px; font-weight:700; color:#1e293b; width:55px; text-align:right;">
                                    ${count} <span style="font-size:10px; color:#64748b; font-weight:500; margin-left:2px;">${pct}%</span>
                                </span>
                            </div>`;
                        }).join('')}
                        
                        ${otherAreasSum > 0 ? `
                        <div style="display:flex; align-items:center; gap:16px;">
                            <span style="font-size:12px; font-weight:600; color:#1e293b; width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#cbd5e1; margin-right:8px;"></span>
                                Otras áreas
                            </span>
                            <div style="flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden;">
                                <div style="width:${totalInc ? Math.round((otherAreasSum / totalInc) * 100) : 0}%; height:100%; background:#cbd5e1; border-radius:999px;"></div>
                            </div>
                            <span style="font-size:12px; font-weight:700; color:#1e293b; width:55px; text-align:right;">
                                ${otherAreasSum} <span style="font-size:10px; color:#64748b; font-weight:500; margin-left:2px;">${totalInc ? Math.round((otherAreasSum / totalInc) * 100) : 0}%</span>
                            </span>
                        </div>` : ''}
                    </div>
                </div>
                
                <div>
                    <button onclick="document.getElementById('incDetailedDistribution').scrollIntoView({behavior: 'smooth'})" style="margin-top: 15px; background: #fff; border: 1px solid #cbd5e1; color: #1e293b; border-radius: 10px; padding: 8px 16px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background 0.2s;">
                        Ver desglose completo <i class="fas fa-arrow-up-right-from-square" style="font-size: 10px; color: #64748b;"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Month Selector Grid -->
        ${monthGrid}

        <!-- Centro de mando / Top areas list -->
        <div style="display:grid; grid-template-columns:1fr 1.35fr; gap:14px; margin-bottom:14px;">
            <div style="background:#fff; border:1px solid #e5e7eb; border-left:4px solid ${riskColor}; border-radius:8px; padding:16px; color:#0f172a; box-shadow:0 8px 22px rgba(15,23,42,0.06);">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
                    <div>
                        <div style="font-size:9px; font-weight:950; letter-spacing:.9px; color:#64748b; text-transform:uppercase;">Centro de mando</div>
                        <div style="font-size:21px; font-family:'Montserrat'; font-weight:950; color:#0f172a; letter-spacing:0;">${riskLabel}</div>
                    </div>
                    <div style="width:54px; height:54px; border-radius:50%; display:grid; place-items:center; background:${riskColor}12; border:1px solid ${riskColor}33; font-family:'Montserrat'; font-size:24px; font-weight:950; color:${riskColor};">${riskScore}</div>
                </div>
                <div style="height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin-bottom:14px;">
                    <div style="height:100%; width:${riskScore}%; background:${riskColor}; border-radius:999px;"></div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px;">
                    <button onclick="window._incFilters.sev='Alta'; renderIncidencias();" style="border:1px solid #fecaca; background:#fef2f2; color:#991b1b; border-radius:7px; padding:9px; cursor:pointer; font-size:10px; font-weight:950; font-family:'Montserrat';">ALTA<br><span style="font-size:20px;color:#0f172a;">${altas}</span></button>
                    <button onclick="window._incFilters.sev='Media'; renderIncidencias();" style="border:1px solid #fde68a; background:#fffbeb; color:#92400e; border-radius:7px; padding:9px; cursor:pointer; font-size:10px; font-weight:950; font-family:'Montserrat';">MEDIA<br><span style="font-size:20px;color:#0f172a;">${media}</span></button>
                    <button onclick="window._incFilters.sev='Baja'; renderIncidencias();" style="border:1px solid #99f6e4; background:#f0fdfa; color:#115e59; border-radius:7px; padding:9px; cursor:pointer; font-size:10px; font-weight:950; font-family:'Montserrat';">BAJA<br><span style="font-size:20px;color:#0f172a;">${baja}</span></button>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="window._incFilters.search='cheque'; renderIncidencias();" style="border:1px solid #ddd6fe; background:#faf5ff; color:#6d28d9; border-radius:999px; padding:7px 10px; font-size:10px; font-weight:950; cursor:pointer; font-family:'Montserrat';">Cheques</button>
                    <button onclick="window._incFilters.search='atras'; renderIncidencias();" style="border:1px solid #fecaca; background:#fff7ed; color:#b91c1c; border-radius:999px; padding:7px 10px; font-size:10px; font-weight:950; cursor:pointer; font-family:'Montserrat';">Atrasos</button>
                    <button onclick="window._incFilters.tipo='${jsq(topTipo[0])}'; renderIncidencias();" style="border:1px solid #bbf7d0; background:#f0fdf4; color:#166534; border-radius:999px; padding:7px 10px; font-size:10px; font-weight:950; cursor:pointer; font-family:'Montserrat';">Top causa</button>
                </div>
            </div>
            <div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;">
                    <div>
                        <h3 style="font-size:13px; margin:0 0 3px; color:#0f172a;"><i class="fas fa-layer-group"></i> Top áreas por severidad</h3>
                        <p style="font-size:10px; margin:0; color:#94a3b8; font-weight:800;">Priorización operativa para seguimiento</p>
                    </div>
                    <span style="font-size:10px; font-weight:950; color:#0f766e; background:#ccfbf1; padding:6px 9px; border-radius:999px;">Monto ${money(totalMonto)}</span>
                </div>
                <div style="display:grid; gap:8px;">
                    ${areaSeverity.map(aRow => {
                        const max = Math.max(aRow.total, 1);
                        return `<button onclick="window._incFilters.search='${jsq(aRow.areaName)}'; renderIncidencias();" style="text-align:left; border:1px solid #e5e7eb; background:#f8fafc; border-radius:7px; padding:9px; cursor:pointer;">
                            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:950; color:#334155; margin-bottom:6px;"><span>${esc(aRow.areaName)}</span><span>${aRow.total}</span></div>
                            <div style="height:8px; display:flex; border-radius:999px; overflow:hidden; background:#e2e8f0;">
                                <div style="width:${(aRow.alta / max) * 100}%; background:#dc2626;"></div>
                                <div style="width:${(aRow.media / max) * 100}%; background:#f59e0b;"></div>
                                <div style="width:${(aRow.baja / max) * 100}%; background:#0f766e;"></div>
                            </div>
                        </button>`;
                    }).join('') || '<div style="padding:20px; text-align:center; color:#94a3b8; font-weight:850;">Sin datos</div>'}
                </div>
            </div>
        </div>

        <!-- Distribución proporcional detallada (id="incDetailedDistribution") -->
        <div id="incDetailedDistribution" style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
                <div>
                    <h3 style="font-family:'Montserrat'; font-size:15px; margin:0 0 3px; color:#0f172a; font-weight:950;"><i class="fas fa-chart-pie"></i> Distribución proporcional detallada</h3>
                    <p style="font-size:10px; margin:0; color:#94a3b8; font-weight:800;">Vista por ${distMeta[distDim].label}</p>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
                    ${distDimButtons}
                </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                ${distRowsHtml}
            </div>
        </div>

        <!-- Gráficos secundarios -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
            <div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px; min-height:300px;">
                <h3 style="font-size:13px; margin:0 0 3px; color:#0f172a;"><i class="fas fa-list-check"></i> Causas principales</h3>
                <p style="font-size:10px; margin:0 0 10px; color:#94a3b8; font-weight:800;">Distribución global de incidencias</p>
                <div style="height:240px;"><canvas id="chartIncTipos"></canvas></div>
            </div>
            <div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px; min-height:300px;">
                <h3 style="font-size:13px; margin:0 0 3px; color:#0f172a;"><i class="fas fa-building"></i> Empresa / país</h3>
                <p style="font-size:10px; margin:0 0 10px; color:#94a3b8; font-weight:800;">Distribución por empresas</p>
                <div style="height:240px;"><canvas id="chartIncEmpresa"></canvas></div>
            </div>
        </div>

        <!-- Tabla de goleadores -->
        <div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px;">
                <div>
                    <h3 style="font-family:'Montserrat'; font-size:15px; font-weight:950; margin:0 0 3px; color:#0f172a; letter-spacing:0;"><i class="fas fa-trophy" style="color:#f59e0b;"></i> Tabla de goleadores de errores</h3>
                    <p style="font-size:10px; margin:0; color:#94a3b8; font-weight:850;">Colaboradores con mayor recurrencia de incidencias en el filtro actual</p>
                </div>
                <span style="font-size:10px; font-weight:950; color:#334155; background:#f1f5f9; padding:6px 9px; border-radius:999px;">Top ${topScorers.length}</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4,minmax(150px,1fr)); gap:10px;">
                ${topScorers.map(player => {
                    const medal = player.rank === 1 ? '#f59e0b' : player.rank === 2 ? '#94a3b8' : player.rank === 3 ? '#b45309' : '#64748b';
                    const initials = clean(player.name).split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase();
                    return `<button onclick="window._incFilters.search='${jsq(player.name)}'; renderIncidencias();" style="text-align:left; border:1px solid #e5e7eb; background:#fff; border-radius:8px; padding:11px; cursor:pointer; box-shadow:0 6px 16px rgba(15,23,42,0.04);">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:9px;">
                            <div style="width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:${medal}18; color:${medal}; font-family:'Montserrat'; font-weight:950; font-size:12px;">${player.rank}</div>
                            <div style="width:34px; height:34px; border-radius:8px; display:grid; place-items:center; background:#f1f5f9; color:#0f172a; font-family:'Montserrat'; font-weight:950; font-size:11px;">${esc(initials)}</div>
                            <div style="min-width:0; flex:1;">
                                <div style="font-family:'Montserrat'; font-size:11px; line-height:1.15; font-weight:950; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(player.name)}</div>
                                <div style="font-size:9px; font-weight:850; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(player.codigo || player.empresa || 'Sin código')}</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:end; justify-content:space-between; gap:8px;">
                            <div>
                                <div style="font-family:'Montserrat'; font-size:25px; line-height:1; font-weight:950; color:#0f172a;">${player.total}</div>
                                <div style="font-size:9px; font-weight:950; color:#64748b;">errores</div>
                            </div>
                            <div style="display:flex; gap:4px; font-size:9px; font-weight:950;">
                                <span style="color:#dc2626; background:#fee2e2; border-radius:999px; padding:3px 5px;">A ${player.alta}</span>
                                <span style="color:#b45309; background:#fef3c7; border-radius:999px; padding:3px 5px;">M ${player.media}</span>
                                <span style="color:#0f766e; background:#ccfbf1; border-radius:999px; padding:3px 5px;">B ${player.baja}</span>
                            </div>
                        </div>
                    </button>`;
                }).join('') || '<div style="grid-column:1/-1; padding:24px; text-align:center; color:#94a3b8; font-weight:900;">Sin colaboradores en el filtro seleccionado</div>'}
            </div>
        </div>

        <!-- Detalle priorizado -->
        <div style="display:grid; grid-template-columns:1fr; gap:14px;">
            <div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; box-shadow:0 10px 24px rgba(88,28,135,0.06);">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px; border-bottom:1px solid #e5e7eb;">
                    <div>
                        <h3 style="font-size:13px; margin:0 0 3px; color:#0f172a;"><i class="fas fa-table-list"></i> Detalle priorizado</h3>
                        <p style="font-size:10px; margin:0; color:#94a3b8; font-weight:800;">Mostrando hasta 250 registros por severidad y monto</p>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                        <span style="font-size:10px; font-weight:950; color:#dc2626; background:#fee2e2; padding:6px 9px; border-radius:999px;">Atrasos ${atrasos}</span>
                        <span style="font-size:10px; font-weight:950; color:#7c3aed; background:#ede9fe; padding:6px 9px; border-radius:999px;">Cheques ${cheques}</span>
                    </div>
                </div>
                <div style="max-height:430px; overflow:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:11px;">
                        <thead style="position:sticky; top:0; background:#f8fafc; z-index:1;">
                            <tr style="color:#64748b; text-transform:uppercase; font-size:9px;">
                                <th style="padding:9px 12px; text-align:left;">Colaborador</th>
                                <th style="padding:9px 12px; text-align:left;">Empresa</th>
                                <th style="padding:9px 12px; text-align:left;">Sev.</th>
                                <th style="padding:9px 12px; text-align:left;">Tipo</th>
                                <th style="padding:9px 12px; text-align:left;">Detalle</th>
                                <th style="padding:9px 12px; text-align:left;">Responsable</th>
                                <th style="padding:9px 12px; text-align:right;">Fuente</th>
                                <th style="padding:9px 12px; text-align:right;">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>${rows || '<tr><td colspan="8" style="padding:24px; text-align:center; color:#94a3b8; font-weight:900;">Sin incidencias para los filtros seleccionados</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>`;

    const topTipos = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 9);
    const ctxT = document.getElementById('chartIncTipos');
    if (ctxT) window.activeCharts.push(new Chart(ctxT.getContext('2d'), {
        type: 'bar',
        data: { labels: topTipos.map(d => d[0]), datasets: [{ data: topTipos.map(d => d[1]), backgroundColor: ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a855f7', '#c084fc', '#db2777', '#f59e0b', '#475569'], borderRadius: 8 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#f3e8ff' }, ticks: { color: '#6d28d9', font: { size: 11, weight: 900 } } }, y: { grid: { display: false }, ticks: { color: '#2e1065', font: { size: 11, weight: 900 } } } } }
    }));

    const ctxTr = document.getElementById('chartIncTrend');
    if (ctxTr) window.activeCharts.push(new Chart(ctxTr.getContext('2d'), {
        type: 'bar',
        data: {
            labels: visibleMonths.map(mn => monthNames[mn]),
            datasets: [{
                label: 'Incidencias',
                data: monthCounts.map(item => item.count),
                backgroundColor: monthCounts.map((item, idx) => {
                    if (local.month !== 'ALL') {
                        return item.m === Number(local.month) ? '#7c3aed' : '#e2e8f0';
                    }
                    if (idx === monthCounts.length - 1) return '#4f46e5';
                    return '#a78bfa';
                }),
                hoverBackgroundColor: monthCounts.map((item, idx) => {
                    if (local.month !== 'ALL') {
                        return item.m === Number(local.month) ? '#6d28d9' : '#cbd5e1';
                    }
                    if (idx === monthCounts.length - 1) return '#3730a3';
                    return '#8b5cf6';
                }),
                borderRadius: 8
            }]
        },
        plugins: (typeof ChartDataLabels !== 'undefined') ? [ChartDataLabels] : [],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, elements) => {
                if (elements && elements.length > 0) {
                    const index = elements[0].index;
                    const clickedMonth = visibleMonths[index];
                    window._incFilters.month = window._incFilters.month === String(clickedMonth) ? 'ALL' : String(clickedMonth);
                    renderIncidencias();
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    color: '#475569',
                    font: {
                        family: 'Montserrat',
                        weight: '900',
                        size: 11
                    },
                    formatter: (val) => val || '0'
                }
            },
            scales: {
                y: {
                    display: false,
                    beginAtZero: true
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#475569', font: { family: 'Montserrat', weight: 'bold', size: 12 } }
                }
            }
        }
    }));

    const compEntries = Object.entries(empresas).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const ctxE = document.getElementById('chartIncEmpresa');
    if (ctxE) window.activeCharts.push(new Chart(ctxE.getContext('2d'), {
        type: 'doughnut',
        data: { labels: compEntries.map(d => d[0]), datasets: [{ data: compEntries.map(d => d[1]), backgroundColor: ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a855f7', '#c084fc', '#db2777', '#f59e0b'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: '#2e1065', boxWidth: 9, font: { size: 10, weight: 900 } } } } }
    }));

    // ── Rellenar Ranking operativo ──────────────────────────────────────────
    const ranking = Object.entries(responsables).sort((a, b) => b[1] - a[1]);
    const showAllRanking = !!window._showAllRanking;
    const visibleRanking = showAllRanking ? ranking : ranking.slice(0, 5);
    const maxR = ranking.length ? ranking[0][1] : 1;
    const incRankingEl = document.getElementById('incRanking');
    if (incRankingEl) {
        const rankingListHtml = visibleRanking.map(([name, count], idx) => {
            const pct = ((count / maxR) * 100).toFixed(0);
            const rankColor = idx === 0 ? '#f87171' : idx === 1 ? '#d97706' : idx === 2 ? '#10b981' : '#8b5cf6';
            return `<button onclick="window._incFilters.responsable='${jsq(name)}'; renderIncidencias();" style="display:flex; align-items:center; width:100%; text-align:left; border:none; background:transparent; padding:6px 0; cursor:pointer; gap:16px;">
                <span style="font-size:12px; font-weight:600; color:#1e293b; width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(name)}">${esc(name)}</span>
                <div style="flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:${rankColor}; border-radius:999px;"></div>
                </div>
                <span style="font-size:12px; font-weight:700; color:#1e293b; width:24px; text-align:right;">${count}</span>
            </button>`;
        }).join('') || '<div style="padding:28px; text-align:center; color:#94a3b8; font-weight:850;">Sin datos</div>';

        const showMoreBtnHtml = ranking.length > 5 ? `
            <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                <button onclick="window._showAllRanking = !window._showAllRanking; renderIncidencias();" style="background: #fff; border: 1px solid #cbd5e1; color: #1e293b; border-radius: 8px; padding: 4px 10px; font-size: 10px; font-weight: 850; cursor: pointer; transition: all 0.2s;">
                    ${showAllRanking ? 'Ver menos' : 'Ver todos'}
                </button>
            </div>
        ` : '';

        incRankingEl.innerHTML = rankingListHtml + showMoreBtnHtml;
    }
}

function showIncExecutiveBrief() {
    const lines = window._incExecutiveBrief || [];
    const html = `<div style="text-align:left; display:grid; gap:10px;">${lines.map((line, idx) => `
        <div style="display:flex; gap:10px; align-items:flex-start; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <span style="width:22px; height:22px; display:grid; place-items:center; border-radius:999px; background:#0f766e; color:#fff; font-size:11px; font-weight:900;">${idx + 1}</span>
            <span style="font-size:12px; color:#334155; font-weight:750;">${line}</span>
        </div>`).join('')}</div>`;
    if (window.Swal) Swal.fire({ title: 'Resumen ejecutivo', html, icon: 'info', confirmButtonText: 'Listo' });
}

function exportIncidenciasFiltradas() {
    const rows = (window._incFilteredRows || []).map(i => ({
        Código: i.c || '',
        Colaborador: i.n || '',
        País: normalizePa(i.pa || ''),
        Empresa: i.e || '',
        Dirección: i.dir || i.area || '',
        Departamento: i.d || i.depto || '',
        Severidad: i.sev || '',
        Tipo: i.t || '',
        Detalle: i.detalle || '',
        Responsable: i.r || i.dir || i.source || '',
        Fuente: i.source || '',
        Fecha: i.f || '',
        Monto: Number(i.monto || 0)
    }));
    if (!rows.length) {
        if (window.Swal) Swal.fire('Sin datos', 'No hay incidencias para exportar con los filtros actuales.', 'info');
        return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Incidencias Filtradas');
    XLSX.writeFile(wb, `Incidencias_Filtradas_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
