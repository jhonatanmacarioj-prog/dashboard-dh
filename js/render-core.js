// Core render coordinator extracted from the main HTML.

let cachedEmps = null, lastFilterKey = "";
            let dashRenderTimeout = null;

            function updateOrphanAlert() {
                const alertEl = document.getElementById('globalOrphanAlert');
                if (!alertEl) return;
                const employees = (window.app && window.app.employees) ? window.app.employees : [];
                const filtered = (typeof applyDeepFilters === 'function') ? applyDeepFilters(employees) : employees;
                const isBad = v => !v || v === '0' || v === 'SIN DEPTO' || v === 'nan' || v === 'N/A' || v === 'PENDIENTE' || v === 'OTRO';
                const hasOrphans = filtered.some(e => isBad(e.dir) || isBad(e.d));
                alertEl.style.display = hasOrphans ? 'flex' : 'none';
            }

            function requestRenderAll() {
                if (dashRenderTimeout) clearTimeout(dashRenderTimeout);
                dashRenderTimeout = setTimeout(() => {
                    if (typeof updateOrphanAlert === 'function') { try { updateOrphanAlert(); } catch(e) {} }
                    _filterCache.clear();
                    renderAll();
                    dashRenderTimeout = null;
                }, 10);
            }

            function renderAll() {
                            try { renderSustituciones(); } catch(e) {}
                try {
                    const currentTab = window.activeTab || 0;
                    const pane = document.getElementById(`pane${currentTab}`);
                    if (!pane) return; // Silent guard
                    window._currentFilters = getFilters();
                    window._tcCache = null;

                    const filters = window._currentFilters;
                    const filterKey = JSON.stringify(filters);

                    window.activeCharts = Array.isArray(window.activeCharts) ? window.activeCharts : [];
                    window.activeCharts.forEach(c => { if (c && typeof c.destroy === 'function') { try { c.destroy(); } catch(e) {} } });
                    window.activeCharts = [];

                    if (!app.employees || app.employees.length === 0) {
                        const activePane = document.getElementById(`pane${currentTab}`);
                        const hasSummary = (app.summary && app.summary.length > 0);
                        
                        if (!hasSummary) {
                            if (activePane && !activePane.querySelector('#pane0Main')) {
                                activePane.innerHTML = `
                                <div style="height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; font-family:'Montserrat',sans-serif; text-align:center;">
                                    <div style="font-size:50px; margin-bottom:15px; animation: softPulse 2s infinite;">✨</div>
                                    <h3 style="font-weight:800; color:#1e293b;">Buscando Datos...</h3>
                                    <p style="max-width:300px; font-size:12px; margin-top:5px;">El dashboard está descargando la información... <br>Por favor espera unos segundos.</p>
                                </div>`;
                            }
                            console.warn('renderAll: No data available yet. Waiting and retrying in 1s...');
                            // ANTIGRAVITY FIX: Keep polling until data arrives
                            setTimeout(() => {
                                if (window.hcFullData && !app.employees.length) {
                                    if (typeof initApp === 'function') initApp();
                                }
                                if (typeof renderAll === 'function') renderAll();
                            }, 1000);
                            return;
                        }
                    }

                    if (!cachedEmps || filterKey !== lastFilterKey) {
                        const emps = applyDeepFilters(app.employees || []);
                        const sMap = new Map();
                        emps.forEach(x => {
                            const id = x.c || 'UA';
                            const name = (x.n || '').trim().toUpperCase();
                            const pa = normalizePa(x.pa || '??');
                            const emp = (x.e || '??').trim().toUpperCase();
                            const key = `${id}|${name}|${pa}|${emp}`;
                            sMap.set(key, x);
                        });
                        cachedEmps = { unique: [...sMap.values()], raw: emps, allRaw: app.employees || [] };
                        lastFilterKey = filterKey;
                        console.log('Stats:', { filtered: emps.length, unique: cachedEmps.unique.length });
                    }

                    const { unique: uniqueEmps, raw: emps, allRaw: empsRaw } = cachedEmps;

                    // --- HIGHLIGHT ACTIVE METRIC BUTTONS (Premium Sync) ---
                    document.querySelectorAll('.metric-group-wrap button').forEach(b => b.classList.remove('active'));
                    const netoBtn = document.getElementById('btnHCTypeNeto');
                    const brutoBtn = document.getElementById('btnHCTypeBruto');
                    if (window._hcType === 'neto' && netoBtn) netoBtn.classList.add('active');
                    if (window._hcType === 'bruto' && brutoBtn) brutoBtn.classList.add('active');

                    const hcBtn = document.getElementById('btnMetricHC');
                    const altasBtn = document.getElementById('btnMetricAltas');
                    const bajasBtn = document.getElementById('btnMetricBajas');
                    if (window._flagMode === 'hc' && hcBtn) hcBtn.classList.add('active');
                    if (window._flagMode === 'altas' && altasBtn) altasBtn.classList.add('active');
                    if (window._flagMode === 'bajas' && bajasBtn) bajasBtn.classList.add('active');

                    // Dynamic title with Month and Year persistence
                    const dynamicTitleEl = document.getElementById('dynamicHCTitle');
                    if (dynamicTitleEl) {
                        const { p, e, a, d, m, y } = filters;
                        const tabBaseNames = { 0: "HC", 1: "ORGANIGRAMA", 2: "DESVINCULACIONES", 3: "INCIDENCIAS DE PAGO", 4: "CONCILIACIÓN ISR", 5: "ANÁLISIS DE COSTOS", 6: "CONFIGURACIÓN", 7: "HC DINÁMICO" };
                        const monthNamesArr = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        
                        let baseName = tabBaseNames[currentTab] || "HC";
                        let titleParts = [`<span style="color:var(--ac);">${baseName}</span>`];
                        
                        if (p !== 'ALL') titleParts.push(typeof paisMap !== 'undefined' ? (paisMap[p] || p) : p);
                        if (e !== 'ALL') titleParts.push(e);
                        
                        let dateStr = "";
                        if (m !== 'ALL' && monthNamesArr[m]) dateStr += monthNamesArr[m] + " ";
                        if (y !== 'ALL') dateStr += y;
                        if (dateStr.trim()) titleParts.push(dateStr.trim());
                        
                        dynamicTitleEl.innerHTML = titleParts.join(" | ").toUpperCase();
                    }

                    if (currentTab === 0) {
                        renderGeneral({}, uniqueEmps, empsRaw);
                        if (window._currentSubView && window._currentSubView !== 'General') {
                            const v = window._currentSubView;
                            if (v === 'Detalle de HC') renderSubActives();
                            else if (v === 'Detalle de Altas') renderSubHires();
                            else if (v === 'Detalle de Bajas') renderSubBajas();
                            else if (v === 'Detalle de Rotación') renderSubTurnover();
                            else if (v === 'Tendencia') renderSubGrowth();
                            else if (v === 'Detalle de Paises') renderSubCountries();
                        }
                    }
                    if (currentTab === 1) openOrgChart();
                    if (currentTab === 2) renderBajas();
                    if (currentTab === 3) renderIncidencias();
                    if (currentTab === 4) renderISR(filters.p, filters.e, filters.y);
                    if (currentTab === 5) {
                        const empsToRender = (emps && emps.length > 0) ? emps : (cachedEmps.raw && cachedEmps.raw.length > 0 ? cachedEmps.raw : (app.employees || []));
                        try {
                           renderCostos({}, empsToRender);
                        } catch(ce) {
                           console.error('ERROR FATAL AL LLAMAR renderCostos:', ce);
                           if (pane) pane.innerHTML = `<div style="padding:100px; text-align:center;"><p>Error al renderizar costos. Verifica la consola.</p></div>`;
                        }
                    }
                    if (currentTab === 6) {
                        if (typeof renderTCMappings === 'function') renderTCMappings();
                        else if (pane) pane.innerHTML = `<div style="padding:100px; text-align:center;"><h3 style="color:var(--ac);">Cargando Configuración...</h3><p>Verifica que las funciones de mapeo estén cargadas correctamente.</p></div>`;
                    }
                    if (currentTab === 7 && window.updateDynOptions) updateDynOptions();

                    // --- FINAL SYNC ---
                    if (typeof updateHCBtnStyles === 'function') updateHCBtnStyles();

                } catch (err) { 
                    console.error('  ERROR en renderAll:', err.message, err); 
                }
                console.log('  Dashboard Render Complete');
            }

