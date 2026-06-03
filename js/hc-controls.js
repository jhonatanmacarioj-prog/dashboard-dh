// Headcount control helpers extracted from the main HTML.

function personKey(row) {
                return (row?.c || row?.n || '').toString().trim();
            }

            function hcSnapshotKey(row) {
                const id = (row?.c || 'UA').toString().trim();
                const name = (row?.n || '').toString().trim().toUpperCase();
                const pa = normalizePa(row?.pa || '??');
                const emp = (row?.e || '??').toString().trim().toUpperCase();
                return `${id}|${name}|${pa}|${emp}`;
            }

            function toggleCountry(code) {
                if (!window.selectedCountries) window.selectedCountries = [];
                const idx = window.selectedCountries.indexOf(code);
                if (idx >= 0) {
                    window.selectedCountries.splice(idx, 1);
                } else {
                    window.selectedCountries.push(code);
                }
                renderAll();
            }

            function toggleHCSeries(series, isPrevious) {
                // Sincronizaci  robusta del objeto de visibilidad
                if (!window._hcSeriesVisible) window._hcSeriesVisible = {};
                window._hcSeriesVisible = Object.assign({ 
                    total: true, ingresos: false, bajas: false, 
                    totalPrev: false, ingresosPrev: false, bajasPrev: false 
                }, window._hcSeriesVisible);

                const key = isPrevious ? series + 'Prev' : series;
                window._hcSeriesVisible[key] = !window._hcSeriesVisible[key];
                
                // Forzar actualizaci  visual inmediata de los botones
                if (typeof updateHCBtnStyles === 'function') updateHCBtnStyles();

                // Redibujar todo el dashboard
                if (typeof renderAll === 'function') renderAll();
            }

            function clearHCFilters() {
                window._hcSeriesVisible = { total: true, ingresos: false, bajas: false, totalPrev: false, ingresosPrev: false, bajasPrev: false };
                window._hcViewLength = 6;
                window._hcMirrorMode = false;
                if (typeof updateHCBtnStyles === 'function') updateHCBtnStyles();
                if (typeof renderAll === 'function') {
                    renderAll();
                }
            }

            function setHCTrendRange(mode) {
                if (!window._hcSeriesVisible) window._hcSeriesVisible = {};
                window._hcSeriesVisible = Object.assign({
                    total: true, ingresos: false, bajas: false,
                    totalPrev: false, ingresosPrev: false, bajasPrev: false
                }, window._hcSeriesVisible);

                if (mode === '6m') {
                    window._hcViewLength = 6;
                    window._hcMirrorMode = false;
                    window._hcSeriesVisible.totalPrev = false;
                    window._hcSeriesVisible.ingresosPrev = false;
                    window._hcSeriesVisible.bajasPrev = false;
                } else if (mode === '12m') {
                    window._hcViewLength = 12;
                    window._hcMirrorMode = false;
                    window._hcSeriesVisible.totalPrev = false;
                    window._hcSeriesVisible.ingresosPrev = false;
                    window._hcSeriesVisible.bajasPrev = false;
                } else if (mode === '1y') {
                    window._hcViewLength = 12;
                    window._hcMirrorMode = true;
                    window._hcSeriesVisible.totalPrev = true;
                }

                if (typeof updateHCBtnStyles === 'function') updateHCBtnStyles();
                if (typeof renderAll === 'function') renderAll();
            }

            function updateHCBtnStyles() {
                // Asegurar que vis est  poblado
                const vis = window._hcSeriesVisible = Object.assign({ 
                    total: true, ingresos: false, bajas: false, 
                    totalPrev: false, ingresosPrev: false, bajasPrev: false 
                }, window._hcSeriesVisible || {});

                const configs = {
                    total: { id: 'btnToggleHCTotal', color: '#3b82f6' },
                    ingresos: { id: 'btnToggleIngresos', color: '#10b981' },
                    bajas: { id: 'btnToggleBajas', color: '#ef4444' },
                    totalPrev: { id: 'btnToggleHCTotalPrev', color: '#8b5cf6' },
                    ingresosPrev: { id: 'btnToggleIngresosPrev', color: '#F97316' },
                    bajasPrev: { id: 'btnToggleBajasPrev', color: '#EC4899' }
                };

                Object.entries(configs).forEach(([key, cfg]) => {
                    const btn = document.getElementById(cfg.id);
                    if (!btn) return;
                    
                    const isVisible = vis[key];
                    if (isVisible) {
                        btn.style.setProperty('background', cfg.color, 'important');
                        btn.style.setProperty('border-color', cfg.color, 'important');
                        btn.style.setProperty('color', '#ffffff', 'important');
                        btn.style.setProperty('opacity', '1', 'important');
                        btn.style.setProperty('box-shadow', `0 6px 15px ${cfg.color}66`, 'important');
                        btn.style.setProperty('transform', 'translateY(-2px)', 'important');
                        const dot = btn.querySelector('div');
                        if (dot) dot.style.setProperty('background', '#ffffff', 'important');
                    } else {
                        btn.style.setProperty('background', 'transparent', 'important');
                        btn.style.setProperty('border-color', cfg.color, 'important');
                        btn.style.setProperty('color', cfg.color, 'important');
                        btn.style.setProperty('opacity', '0.4', 'important');
                        btn.style.setProperty('box-shadow', 'none', 'important');
                        btn.style.setProperty('transform', 'none', 'important');
                        const dot = btn.querySelector('div');
                        if (dot) dot.style.setProperty('background', cfg.color, 'important');
                    }
                    // Garantizar interactividad
                    btn.style.setProperty('cursor', 'pointer', 'important');
                    btn.style.setProperty('pointer-events', 'auto', 'important');
                    btn.style.setProperty('position', 'relative', 'important');
                    btn.style.setProperty('z-index', '1000', 'important');
                });
                
                // Botones de rango actualizados
                const btn6 = document.getElementById('btnHC6m');
                const btn12 = document.getElementById('btnHC12m');
                const btnAnio = document.getElementById('btnHCanio');
                const currLen = window._hcViewLength || 6;
                const isMirror = !!window._hcMirrorMode;

                if (btn6) {
                    const isActive = currLen === 6 && !isMirror;
                    btn6.style.background = isActive ? '#8b5cf6' : 'transparent';
                    btn6.style.color = isActive ? '#fff' : '#64748b';
                    btn6.style.boxShadow = isActive ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none';
                }
                if (btn12) {
                    const isActive = currLen === 12 && !isMirror;
                    btn12.style.background = isActive ? '#8b5cf6' : 'transparent';
                    btn12.style.color = isActive ? '#fff' : '#64748b';
                    btn12.style.boxShadow = isActive ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none';
                }
                if (btnAnio) {
                    btnAnio.style.background = isMirror ? '#8b5cf6' : 'transparent';
                    btnAnio.style.color = isMirror ? '#fff' : '#64748b';
                    btnAnio.style.boxShadow = isMirror ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none';
                }
            }
