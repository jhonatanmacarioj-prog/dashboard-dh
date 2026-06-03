// ISR tab renderer extracted from the main HTML.

function renderISR(p, e, y) {
    const pane = document.getElementById('isrView');
    if (p !== 'GT' && p !== 'ALL') {
        pane.innerHTML = `<div style="padding:100px; text-align:center; background:rgba(0,0,0,0.05); border-radius:30px; color:var(--tx);">
                    <div style="font-size:50px; margin-bottom:20px;"> </div>
                    <h2 style="font-family:'Montserrat';">Más de Conciliación ISR</h2>
                    <p style="opacity:0.6; margin-top:10px;">Este módulo está disponible actualmente solo para operaciones en <b>Guatemala</b>.</p>
                    <p style="font-size:11px; margin-top:20px; color:var(--mu);">Seleccione Guatemala en el filtro superior para ver el detalle fiscal.</p>
                </div> `;
        return;
    }

    const data = Array.isArray(app.isr_data) ? app.isr_data : [];
    if (data.length === 0) {
        pane.innerHTML = `<div style="padding:100px; text-align:center; background:#fff; border-radius:30px; color:var(--tx); border:1px solid var(--bd);">
                        <div style="font-size:60px; margin-bottom:20px;"> </div>
                        <h2 style="font-family:'Montserrat'; font-weight: 800;">Más ISR en Sincronización</h2>
                        <p style="opacity:0.6; margin:15px auto; max-width: 400px;">Actualmente no hay datos cargados para la conciliación anual. Por favor, asegúrese de que el archivo <code>isr_data.js</code> esté presente en la carpeta de bases.</p>
                        <button onclick="location.reload()" style="background:var(--ac); color:#fff; border:none; padding:10px 20px; border-radius:12px; font-weight:800; cursor:pointer;">REINTENTAR CARGA</button>
                    </div>`;
        return;
    }

    let filtered = data;
    if (y !== 'ALL') filtered = filtered.filter(d => d.anio == y);
    if (e !== 'ALL') filtered = filtered.filter(d => d.empresa == e);

    if (filtered.length === 0) {
        pane.innerHTML = `<div style="padding:100px; text-align:center; background:#fff; border-radius:30px; color:var(--tx); border:1px solid var(--bd);">
                        <div style="font-size:50px; margin-bottom:20px;"> </div>
                        <h2 style="font-family:'Montserrat';">Sin Resultados de ISR</h2>
                        <p style="opacity:0.6; margin-top:10px;">No hay datos que coincidan con los filtros seleccionados (A  ${y}, Empresa: ${e}).</p>
                    </div>`;
        return;
    }

    const d = filtered.reduce((acc, c) => ({
        rb: acc.rb + (c.renta_bruta || 0),
        iap: acc.iap + (c.impuesto_anual_pagar || 0),
        rp: acc.rp + (c.retenciones_practicadas || 0),
        dt: acc.dt + (c.devolucion_total || 0),
        pp: acc.pp + (c.pendiente_pago || 0),
        db: acc.db + (c.devuelto_bajas || 0),
        tot: acc.tot + (c.colaboradores_total || 0),
        act: acc.act + (c.activas || 0),
        baj: acc.baj + (c.bajas || 0),
        iva: acc.iva + (c.iva || 0),
    }), { rb: 0, iap: 0, rp: 0, dt: 0, pp: 0, db: 0, tot: 0, act: 0, baj: 0, iva: 0 });

    const prevYearData = data.filter(dx => dx.anio == (y - 1) && (e === 'ALL' ? true : dx.empresa == e));
    const prevIVA = prevYearData.reduce((acc, c) => acc + (c.iva || 0), 0);
    const diffIVA = d.iva - prevIVA;
    const diffPct = prevIVA > 0 ? (diffIVA / prevIVA * 100).toFixed(1) : (prevIVA === 0 && d.iva > 0 ? '100+' : '0');
    const sign = diffIVA >= 0 ? '+' : '';

    pane.innerHTML = `
        <div class="sat-view" style="color:#fff; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 40px; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1.5px solid rgba(255,255,255,0.15); padding-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-family:'Montserrat'; font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: #fff; letter-spacing: -4px; line-height: 1;">ASYS</div>
                    <div style="font-family:'Montserrat'; font-size: clamp(14px, 2vw, 26px); font-weight: 700; color: #fff; letter-spacing: 2px; text-transform: uppercase; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 25px;">
                        ISR CONCILIACIÓN ANUAL
                        <div style="font-size: 10px; letter-spacing: 4px; color: #4ade80; margin-top: 5px; font-weight: 800;">CONCILIACIÓN OK | AL DÍA</div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:12px;">
                    <div class="search-wrapper" style="width:320px; position:relative;">
                        <input type="text" placeholder="Buscar en ISR..." onkeyup="filterTable('tbodyGeneral', this.value)" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 40px 12px 15px; color:#fff;">
                        <i class="fas fa-search" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.5);"></i>
                    </div>
                    <button class="btn-top" style="box-shadow:0 10px 20px rgba(0,0,0,0.4); width:320px;" onclick="exportData()">  Reporte Ejecutorio</button>
                    <div style="text-align: right; font-size: 11px; font-weight: 700; color: #fff; line-height: 1.4; opacity: 0.9;">
                        | DESARROLLO HUMANO<br>| NÓMINAS Y COMPENSACIONES
                    </div>
                </div>
            </div>

            <div class="sat-view-header-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 40px;">
                <div class="isr-kpi-black" style="background:transparent; padding:0;">
                    <label style="margin-bottom:8px; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">EMPRESA SELECCIONADA</label>
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 13px; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
                        <span>${e === 'ALL' ? 'TODAS (GT)' : e}</span>
                    </div>
                </div>
                <div class="isr-kpi-black" style="background:transparent; padding:0;">
                    <label style="margin-bottom:8px; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">PERIODO FISCAL</label>
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 13px; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
                        <span>${y === 'ALL' ? 'HIST ' : y}</span>
                    </div>
                </div>
                <div style="text-align:center;"><label style="font-size:9px; font-weight:800; opacity:0.6;">COLABORADORES</label><div style="font-size:42px; font-weight:800;">${d.tot}</div></div>
                <div style="text-align:center;"><label style="font-size:9px; font-weight:800; opacity:0.6;">ACTIVOS</label><div style="font-size:42px; font-weight:800; color:#4ade80;">${d.act}</div></div>
                <div style="text-align:center;"><label style="font-size:9px; font-weight:800; opacity:0.6;">DEVUELTO EN BAJAS</label><div style="font-size:42px; font-weight:800; color:#f87171;">${d.baj}</div></div>
            </div>

            <div class="sat-view-cards-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 40px;">
                ${isrCardHTML("RetenciónES A DEVOLVER", "Q " + d.dt.toLocaleString(), "DEVOLUCIÓN PATRONAL", "#4ade80")}
                ${isrCardHTML("PENDIENTE DE PAGO", "Q " + d.pp.toLocaleString(), "Retención PENDIENTE", "#f87171")}
                ${isrCardHTML("RetenciónES PRACTICADAS", "Q " + d.rp.toLocaleString(), "MONTO REAL RETENIDO", "#fff")}
                ${isrCardHTML("IMPUESTO A PAGAR", "Q " + d.iap.toLocaleString(), "MONTO DETERMINADO SAT", "#fff")}
                ${isrCardHTML("DEVUELTO EN BAJAS", "Q " + d.db.toLocaleString(), "GESTI  DE LIQUIDACI ", "#fff")}
            </div>

            <div class="grid-main" style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
                <div style="background:rgba(0,0,0,0.2); border-radius:25px; padding:30px; border:1px solid rgba(255,255,255,0.05);">
                    <h3 style="font-family:'Montserrat'; font-size:18px; margin-bottom:25px;">EVOLUCI  ANUAL: RETENIDO VS IMPUESTO A PAGAR</h3>
                    <div style="height:350px;"><canvas id="chartISR"></canvas></div>
                </div>
                <div style="background:rgba(0,0,0,0.2); border-radius:25px; padding:30px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; justify-content:space-between;">
                    <div style="display:flex; justify-content:space-between;"><h3>FORMULARIO SAT</h3><span style="font-size:8px; opacity:0.6; border: 1px solid #fff; padding: 2px 6px; border-radius: 4px;">ID: SAT-1481-${y === 'ALL' ? '2025' : y}</span></div>
                    <div style="text-align:center; margin: 20px 0; background:rgba(255,255,255,0.03); border-radius: 20px; padding: 20px;">
                        <div style="font-size:9px; font-weight: 800; opacity: 0.6; margin-bottom: 15px;">PLANILLAS IVA</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 30px;">
                            <div style="width:100px; height:100px; border:8px solid #06b6d4; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow: 0 0 20px rgba(6,182,212,0.2);">
                                <div style="font-size:24px; font-weight:800;">${d.iva}</div><div style="font-size:8px; font-weight:800; opacity:0.6;">DOCS</div>
                            </div>
                            <div style="text-align: left;">
                                <div style="font-size: 8px; font-weight: 800; opacity: 0.5;">A  ANTERIOR</div>
                                <div style="font-size: 16px; font-weight: 800; color: #06b6d4;">${prevIVA > 0 ? prevIVA : '---'}</div>
                                <div style="font-size: 12px; margin-top: 5px; color:${diffIVA >= 0 ? '#4ade80' : '#f87171'}; font-weight:800;">${sign}${diffPct}%</div>
                            </div>
                        </div>
                        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:15px; margin-top:20px; border-left: 4px solid #4ade80;">
                            <p style="font-size:10px; opacity:0.9; line-height:1.6; text-align: left;">Conciliaci  Grupo ASYS (${y === 'ALL' ? '2025' : y}): Retenido Q ${d.rp.toLocaleString()} vs Impuesto Q ${d.iap.toLocaleString()}. Devoluciones por ${d.tot} bajas: Q ${d.db.toLocaleString()}. Saldo Final: <b>Q ${d.dt.toLocaleString()} a favor.</b></p>
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:20px;">
                        <div style="font-size:9px; opacity:0.5; font-weight: 800; margin-bottom: 5px;">RENTAS BRUTAS</div>
                        <div style="font-size:24px; font-weight:800; display:flex; align-items:baseline; justify-content:center; gap:4px;">
                            <span style="font-size:0.6em; opacity:0.5;">Q</span>${d.rb.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initISRDetailCharts(filtered);
}

const createKPICard = (l, v, c) => {
    const formatted = String(v).startsWith('Q')
        ? `<span style="font-size:0.5em; opacity:0.6; margin-right:4px;"> Q</span> ${String(v).substring(1).trim()}`
        : String(v).startsWith('$')
            ? `<span style="font-size:0.5em; opacity:0.6; margin-right:4px;"> $</span> ${String(v).substring(1).trim()}`
            : v;
    return `<div class="kpi-card" style="display:flex; flex-direction:column; justify-content:center; padding:15px; min-height:95px; border-radius:15px; border:1px solid #e2e8f0; background:#fff;"><div style="font-size:12px; font-weight:800; color:#64748b; margin-bottom:10px; text-transform:uppercase;">${l}</div><div style="font-size:18px; font-weight:900; color:${c}; display:flex; align-items:center;">${formatted}</div></div> `;
};

function isrCardHTML(l, v, s, c) {
    const formatted = String(v).startsWith('Q')
        ? `<span style="font-size:0.5em; opacity:0.6; margin-right:4px;"> Q</span> ${String(v).substring(1).trim()}`
        : String(v).startsWith('$')
            ? `<span style="font-size:0.5em; opacity:0.6; margin-right:4px;"> $</span> ${String(v).substring(1).trim()}`
            : v;
    return `<div class="isr-kpi-black" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 25px; border-radius: 24px; backdrop-filter: blur(10px);"><label style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px;">${l}</label><div class="val" style="color:${c}; font-family: 'Montserrat'; font-size: 22px; font-weight: 800; display:flex; align-items:center;">${formatted}</div><div class="sub" style="font-size: 9px; font-weight: 700; color: #64748b; margin-top: 8px;">${s}</div></div> `;
}

function initISRDetailCharts(filtered) {
    const ctx = document.getElementById('chartISR').getContext('2d');
    const data = Array.isArray(app.isr_data) ? app.isr_data : [];
    const emp = document.getElementById('empresaSel').value;

    const years = [...new Set(data.map(d => d.anio))].sort();
    const trendData = emp === 'ALL' ? data : data.filter(d => d.empresa === emp);
    const retData = years.map(y => trendData.filter(f => f.anio == y).reduce((s, c) => s + c.retenciones_practicadas, 0));
    const impData = years.map(y => trendData.filter(f => f.anio == y).reduce((s, c) => s + c.impuesto_anual_pagar, 0));

    window.activeCharts.push(new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                { label: 'RETENIDO REAL', data: retData, backgroundColor: '#7b6cf6', borderRadius: 10, barPercentage: 0.6 },
                { label: 'IMPUESTO DETERMINADO', data: impData, backgroundColor: '#06b6d4', borderRadius: 10, barPercentage: 0.6 },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { ticks: { color: 'rgba(255,255,255,0.5)', callback: v => 'Q' + (v / 1e6).toFixed(1) + 'M' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: 'rgba(255,255,255,0.8)', font: { weight: '800' } }, grid: { display: false } },
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff', padding: 20, font: { family: 'Inter', weight: '700', size: 10 } } },
                tooltip: { backgroundColor: '#1e1642', titleFont: { family: 'Montserrat' }, padding: 15 },
            },
        },
    }));
}

