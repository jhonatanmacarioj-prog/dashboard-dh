// Dashboard view switching extracted from the main HTML. Render functions remain global and are called at runtime.

window.switchView = switchView;
function switchView(view) {
    const main = document.getElementById('pane0Main');
    const sub = document.getElementById('pane0Sub');
    const title = document.getElementById('subViewTitle');
    const content = document.getElementById('subViewContent');

    window._currentSubView = view;

    if (view === 'General') {
        if (main) main.style.display = 'flex';
        if (sub) sub.style.display = 'none';
        renderAll();
        return;
    }

    if (main) main.style.display = 'none';
    if (sub) {
        sub.style.display = 'flex';
        sub.style.opacity = '0';
        setTimeout(() => { sub.style.transition = 'opacity 0.4s ease'; sub.style.opacity = '1'; }, 50);
    }
    if (title) title.innerText = view;

    const getIcon = (t) => { t=t.toUpperCase(); if(t.includes('RADAR')||t.includes('PRESENCIA')) return '🎯'; if(t.includes('ANTIGÜEDAD')||t.includes('ANTIGUEDAD')) return '⏳'; if(t.includes('DEPARTAMENTO')||t.includes('DIRECCIÓN')||t.includes('DIRECCION')||t.includes('EMPRESA')||t.includes('DIMENSIONES')) return '🏢'; if(t.includes('TENDENCIA')||t.includes('HISTÓRICO')||t.includes('HISTORICO')) return '📈'; if(t.includes('YTD')||t.includes('ACUMULAD')) return '📅'; if(t.includes('ROTACIÓN')||t.includes('ROTACION')||t.includes('MOTIVO')) return '🔄'; if(t.includes('PAÍS')||t.includes('PAIS')||t.includes('REGIONAL')||t.includes('REGION')) return '🌎'; return '📊'; };
    const subHeader = (emoji, title, subtitle) => `
        <div style="background:rgba(99,102,241,0.03); padding:15px; border-radius:15px; border:1px solid rgba(99,102,241,0.1); margin-bottom:10px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">${getIcon(title)}</span>
            <div style="flex:1;">
                <h3 style="font-size:16px; font-weight:900; color:var(--ac); text-transform:uppercase; letter-spacing:0.5px; margin:0;">${title}</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <p style="font-size:10px; color:#64748b; font-weight:700; margin:3px 0 0 0;">${subtitle}</p>
                    <span class="sub-header-sum" style="font-size:12px; font-weight:1000; color:var(--ac);"></span>
                </div>
            </div>
        </div>`;

    if (view === 'Detalle de HC') {
        content.innerHTML = `
            <!-- ROW 1: Executive Comparative (YoY & Areas) -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div class="card-box" style="padding:0; min-height:410px;">
                    <div class="card-title">
                        <h3>CRECIMIENTO YoY</h3>
                        <h2>Acumulado año vs año</h2>
                    </div>
                    <div class="card-body">
                        <div style="height:320px;"><canvas id="chartAcumuladoYoY"></canvas></div>
                    </div>
                </div>
                <div class="card-box" style="padding:0; min-height:410px;">
                    <div class="card-title" style="border-left-color:#f59e0b;">
                        <h3>ANÁLISIS CLÁSICO</h3>
                        <h2>Evolución de las 14 áreas</h2>
                        <div style="display:flex; background:rgba(0,0,0,0.05); border-radius:20px; padding:2px; margin-top:5px; width:max-content;">
                            <button onclick="setHCTrendRange('6m')" id="btnClassic6"
                                style="padding:5px 15px; border-radius:18px; border:none; font-size:10px; font-weight:800; cursor:pointer; background:var(--classicPeriodColor6, var(--ac)); color:var(--classicPeriodText6, #fff);">6M</button>
                            <button onclick="setHCTrendRange('12m')" id="btnClassic12"
                                style="padding:5px 15px; border-radius:18px; border:none; font-size:10px; font-weight:800; cursor:pointer; background:var(--classicPeriodColor12, transparent); color:var(--classicPeriodText12, #64748b);">12M</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div style="height:350px;"><canvas id="chartClassic14areas"></canvas></div>
                    </div>
                </div>
            </div>

            <!-- NEW: DIMENSIONS GRID (Previous Version) -->
            <div style="margin-bottom:20px;">
                <div class="card-box" style="min-height:200px; height:auto; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                        ${subHeader('x', 'DESGLOSE POR DIMENSIONES', 'Vista detallada con mini-indicadores')}
                        <div style="display:flex; gap:12px; background:rgba(0,0,0,0.03); padding:5px 15px; border-radius:12px; margin-top:10px;">
                            <span onclick="window._distPropDim='e'; renderAll();" style="font-size:10px; font-weight:1000; cursor:pointer; color:#8b5cf6; opacity:0.8;">EMPRESA</span>
                            <span onclick="window._distPropDim='dir'; renderAll();" style="font-size:10px; font-weight:1000; cursor:pointer; color:#8b5cf6; opacity:0.8;">DIRECCION</span>
                            <span onclick="window._distPropDim='d'; renderAll();" style="font-size:10px; font-weight:1000; cursor:pointer; color:#8b5cf6; opacity:0.8;">DEPTO</span>
                            <span onclick="window._distPropDim='pa'; renderAll();" style="font-size:10px; font-weight:1000; cursor:pointer; color:#8b5cf6; opacity:0.8;">PAIS</span>
                        </div>
                    </div>
                    <div id="subActMiniDonutsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px;"></div>
                </div>
            </div>

            <!-- ROW 1: RADAR | Antigüedad -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div class="card-box" style="height:480px;">${subHeader('🌎', 'RADAR REGIONAL', 'Distribución Proporcional')}<canvas id="subActRadar"></canvas></div>
                <div class="card-box" style="height:480px;">${subHeader('⏳', 'Distribución por Antigüedad', 'Rango de permanencia')}<canvas id="subActTenure"></canvas></div>
            </div>

            <!-- ROW 2: GENERADORR HC DINÁMICO (Full Width Highlight) -->
            <div style="display: block; margin-bottom: 20px;">
                <div class="card-box" style="padding:22px; border: 2.5px solid rgba(99,102,241,0.15); background: linear-gradient(180deg, #fff, #f8fafc);">
                    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <div>
                            <h3 style="font-size:16px; color:var(--ac); font-weight:1000;">🎛️ GENERADOR HC DINÁMICO</h3>
                            <p style="font-size:10px; color:#64748b; font-weight:800;">Dashboard Ejecutivo Inteligente  -  Dimensión y Generación</p>
                        </div>
                        <div style="display:flex; gap:12px; align-items:center;">
                            <select id="selDynamicDim" style="padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; font-size:11px; font-weight:800; color:#1e293b; background:#fff; cursor:pointer;">
                                <option value="pa">🌎 País</option>
                                <option value="e">🏢 Empresa</option>
                                <option value="dir" selected>🏢 Área</option>
                                <option value="d">👥 Departamento</option>
                            </select>
                            <button onclick="renderDynamicHC()" style="background:var(--ac); color:#fff; border:none; padding:8px 20px; border-radius:10px; font-size:11px; font-weight:900; cursor:pointer;">GENERAR</button>
                        </div>
                    </div>
                    <div style="height:400px;"><canvas id="chartDynamicHC"></canvas></div>
                </div>
            </div>

            <!-- ROW 3: Pirámide | DEPTO -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div class="card-box" style="height:450px;">${subHeader('⏳', 'Pirámide de Antigüedad', '¿Tu equipo es nuevo o estable?')}<canvas id="subActPyramid"></canvas></div>
                <div class="card-box" style="height:450px;">${subHeader('x', 'HC por Departamento', 'Top unidades operativas')}<canvas id="subActDepto"></canvas></div>
            </div>

            <!-- ROW 4: TREND (Full Width) -->
            <div class="card-box" style="height:420px; margin-bottom:30px;">${subHeader('📈', 'Headcount Histórico', 'Evolución total en el tiempo')}<canvas id="subActTrend"></canvas></div>
        `;
        setTimeout(() => {
            // Let renderAll handle the rendering logic to avoid duplication
            renderAll();
        }, 50);
    } else if (view === 'Detalle de Altas') {
        content.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
                <div class="card-box" style="height:400px;">${subHeader('📈', 'Tendencia Mensual de Altas', 'Ingresos registrados')}<canvas id="subHiresTrend"></canvas></div>
                <div class="card-box" style="height:400px;">${subHeader('🌎', 'RADAR REGIONAL ALTAS', 'Distribución Proporcional')}<canvas id="subHiresRadar"></canvas></div>
            </div>
            <div class="card-box" style="height:400px;">${subHeader('🏢', 'Altas por Dirección', 'Nuevos talentos por área')}<canvas id="subHiresDir"></canvas></div>
            <div class="card-box" style="height:450px;">${subHeader('🏢', 'Altas por Departamento', '¿Dónde se concentra el talento nuevo?')}<canvas id="subHiresDepto"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('x', 'Distribución por Empresa', 'Altas corporativas')}<canvas id="subHiresEmp"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('📈', 'Altas Acumuladas YTD', 'Total acumulado del año')}<canvas id="subHiresYTD"></canvas></div>
        `;
        setTimeout(() => renderSubHires(), 100);
    } else if (view === 'Detalle de Bajas') {
        content.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
                <div class="card-box" style="height:400px;">${subHeader('📈', 'Tendencia Mensual de Bajas', 'Salidas registradas')}<canvas id="subBajasTrend"></canvas></div>
                <div class="card-box" style="height:400px;">${subHeader('🌎', 'RADAR REGIONAL BAJAS', 'Distribución Proporcional')}<canvas id="subBajasRadar"></canvas></div>
            </div>
            <div class="card-box" style="height:400px;">${subHeader('🏢', 'Bajas por Dirección', 'Rotación por área')}<canvas id="subBajasDir"></canvas></div>
            <div class="card-box" style="height:450px;">${subHeader('🏢', 'Bajas por Departamento', 'Análisis de clima laboral')}<canvas id="subBajasDepto"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('📌', 'Principales Motivos', '¿Por qué se van?')}<canvas id="subBajasMotivos"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('📈', 'Bajas Acumuladas YTD', 'Total acumulado del año')}<canvas id="subBajasYTD"></canvas></div>
        `;
        setTimeout(() => renderSubBajas(), 100);
    } else if (view === 'Detalle de Rotación') {
        content.innerHTML = `
            <div class="card-box" style="height:400px;">${subHeader('🔄', 'Tipo de Rotación', 'Voluntaria vs Involuntaria')}<canvas id="subRotType"></canvas></div>
            <div class="card-box" style="min-height:550px; height:auto;">${subHeader('⏳', 'Treemap de Motivos', 'Proporción visual por razón de salida')}<div id="subRotTreemap" style="width:100%;height:420px;position:relative;"></div></div>
            <div class="card-box" style="height:400px;">${subHeader('⏳', 'Rotación Temprana (< 90 días)', 'Bajas en periodo de prueba')}<canvas id="subRotEarly"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('🌎', 'Rotación por País', 'Comparativa regional de bajas')}<canvas id="subRotPais"></canvas></div>
            <div class="card-box" style="height:400px;">${subHeader('📈', 'Tendencia de Rotación', 'Evolución mensual %')}<canvas id="subRotTrend"></canvas>
            </div>
            <div style="display: block; margin-bottom: 30px;">
                <div class="card-box">
                    <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="font-size:16px; color:var(--ac); font-weight:1000;">📊 MOVIMIENTOS: ALTAS VS BAJAS</h3>
                            <p style="font-size:10px; color:#64748b; font-weight:800;">Comparativo mensual de ingresos y desvinculaciones</p>
                        </div>
                        <label class="switch-glow" style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:10px; font-weight:800; color:var(--mu);">VER 12 MESES</span>
                            <input type="checkbox" id="chk12mAB" onchange="toggleABView()">
                            <div class="glow-slider"><div class="glow-dot"></div></div>
                        </label>
                    </div>
                    <div style="height: 320px;"><canvas id="chartAltasBajas"></canvas></div>
                </div>
            </div>
        `;
        setTimeout(() => renderSubTurnover(), 100);
    } else if (view === 'Detalle de Paises') {
        content.innerHTML = `
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
                <div class="card-box" style="height:480px;">${subHeader('🌎', 'HEADCOUNT POR PAÍS', 'Distribución absoluta del talento')}<canvas id="subCountryBar"></canvas></div>
                <div class="card-box" style="height:480px;">${subHeader('📊', 'DISTRIBUCIÓN REGIONAL', 'Participación proporcional (%)')}<canvas id="subCountryPie"></canvas></div>
            </div>
             <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
                <div class="card-box" style="height:480px;">${subHeader('📈', 'VARIACIÓN PERSONAL', 'Crecimiento mensual neto')}<canvas id="subCountryGrowth"></canvas></div>
                <div class="card-box" style="height:480px;">${subHeader('x}', 'RADAR DE PRESENCIA', 'Perfil regional consolidado')}<canvas id="subCountryRadar"></canvas></div>
            </div>
            <div class="card-box" style="margin-bottom:30px;">
                ${subHeader('🌎', 'DETALLE POR PAÍS', 'Indicadores clave y desvinculaciones por región')}
                <div id="subCountryGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; margin-top:15px;">
                    <!-- Grid populated by renderSubCountries -->
                </div>
            </div>
        `;
        setTimeout(() => renderSubCountries(), 100);
    }
}
window.switchView = switchView;

