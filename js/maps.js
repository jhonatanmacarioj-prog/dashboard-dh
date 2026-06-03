// Regional map engines extracted from the main HTML.

const MAP_COUNTRY_FLAG_MAP = { 'GT': 'gt', 'CR': 'cr', 'HN': 'hn', 'SV': 'sv', 'NC': 'ni', 'NI': 'ni', 'PA': 'pa', 'PN': 'pa', 'PY': 'py', 'JM': 'jm', 'TYT': 'tt', 'TT': 'tt', 'DM': 'do', 'DO': 'do', 'RD': 'do' };

function mapGetStyle(p) {
    const styles = window.countryStyles || {};
    return styles[p] || styles.OTHER || { color: '#8b5cf6', flag: p };
}
// --- PREMIUM SVG MAP ENGINE & PATHS ---
            window.REGIONAL_MAP_PATHS = window.REGIONAL_MAP_PATHS || {
                'GT': { d: "M75.2,192.4l-7.3-3.4l-5.6,3.4l-5.6-7.3l-11.8-0.6l-5.6-7.3l-3.9,0.6l-5.1,10.7l-7.3,1.7l-1.1,5.6l5.1,10.1l-1.1,10.1l5.6,7.3l6.7-1.1l5.1,8.4l15.2,0.6l9,9l11.2,1.7l1.1-7.9l7.3-5.6l0-14l6.2-7.3L75.2,192.4z", offX: 0, offY: 0 },
                'SV': { d: "M103.8,245.2L91,245.2l-7.3-3.9l-11.2-1.7l4.5,13.5l14.6,3.9l11.8,0l1.7-6.2L103.8,245.2z", offX: 0, offY: 15 },
                'HN': { d: "M163.4,195.2l-1.1-6.7l-9.6,0.6l-8.4,11.8l-12.4-1.7l-1.7-10.1l-12.9-4.5l-6.2-12.9l-14-3.4l-7.3,3.4l1.1,9.6l-6.2,7.3l0,14l7.3,5.6l-1.1,7.9l7.3,3.9l12.9,0l1.7-13.5l11.8,3.9l12.9,0.6l10.1-6.7l12.9-2.2l5.6-8.4l6.7,1.1l0-5.6L163.4,195.2z", offX: 0, offY: 0 },
                'NI': { d: "M229.2,284l-3.9-10.1l-11.2-6.2l-15.7,0l-6.2-8.4l-15.2-3.4l-11.8,0l-14.6-3.9l-4.5,1.7l-1.7,6.2l12.4,12.4l11.2,10.1l11.8,11.2l13.5,13.5l14-1.1l14.6-1.1l15.7-11.2l5.6-8.4L229.2,284z", offX: 0, offY: 0 },
                'NC': { d: "M229.2,284l-3.9-10.1l-11.2-6.2l-15.7,0l-6.2-8.4l-15.2-3.4l-11.8,0l-14.6-3.9l-4.5,1.7l-1.7,6.2l12.4,12.4l11.2,10.1l11.8,11.2l13.5,13.5l14-1.1l14.6-1.1l15.7-11.2l5.6-8.4L229.2,284z", offX: 0, offY: 0 },
                'CR': { d: "M281.4,360.4l-5.6-10.1l-14-1.7l-11.2,4.5l-2.8,10.7l-12.4,14l-14,1.1l-13.5-13.5l-11.8-11.2l3.4,12.4l11.8,11.2l15.2,15.2l18,7.9l18.5-3.4l15.2-11.8l2.2-12.9L281.4,360.4z", offX: 0, offY: 0 },
                'PA': { d: "M431.4,394.1l-9.6-9.6l-14.6,1.7l-15.7-7.3l-18-0.6l-11.2,6.7l-12.9-2.2l-14,3.4l-18.5,3.4l-18-7.9l1.7,11.2l11.8,6.2l14.6,7.9l13.5,3.9l16.3,1.7l15.7-1.1l20.2-2.8l16.9-6.2l9-7.3L431.4,394.1z", offX: 0, offY: 0 },
                'CO': { d: "M431.4,394.1l15.2,15.2l20.2,28.1l11.2,45.5l-5.6,33.7l-22.5,22.5l-28.1,5.6l-33.7-11.2l-22.5-33.7l11.2-45.5l22.5-28.1l20.2-32.2l11.2,0L431.4,394.1z", offX: 0, offY: 0 },
                'VE': { d: "M431.4,394.1l33.7-11.2l45.5,5.6l33.7,22.5l22.5,45.5l-5.6,33.7l-28.1,22.5l-45.5,5.6l-33.7-11.2l-22.5-45.5l0-67.5z", offX: 0, offY: 0 },
                'EC': { d: "M380,520l-15,5l-20,30l5,25l25,5l30,-15l10,-30l-15,-20l-20,0z", offX: 0, offY: 0 },
                'PE': { d: "M370,580l20,40l45,60l60,20l40,-20l10,-60l-30,-50l-50,-20l-70,0z", offX: 0, offY: 0 },
                'DO': { d: "M765.2,185.4l-15.2-5.6l-11.2,0l-12.4,6.7l-13.5,0l-7.3,7.9l0,12.9l11.8,6.2l14,3.4l16.3,0l12.4-5.6l9-10.1l0-11.2L765.2,185.4z", offX: 0, offY: 0 },
                'RD': { d: "M765.2,185.4l-15.2-5.6l-11.2,0l-12.4,6.7l-13.5,0l-7.3,7.9l0,12.9l11.8,6.2l14,3.4l16.3,0l12.4-5.6l9-10.1l0-11.2L765.2,185.4z", offX: 0, offY: 0 },
                'PY': { d: "M550.2,420.4l-11.2,0l-9,11.2l-1.1,15.2l10.1,12.4l16.3,6.7l14.6-3.4l10.1-13.5l-1.1-15.2l-10.1-11.2L550.2,420.4z", offX: 0, offY: 0 },
                'JM': { d: "M635.2,215.4l-11.2-1.7l-12.4,4.5l-9,12.4l5.6,11.2l14.6,3.4l16.3-5.6l6.7-11.8l-1.7-10.1L635.2,215.4z", offX: 0, offY: 0 },
                'TT': { d: "M840.2,350.4l-7.3-4.5l-7.9,7.3l2.8,11.2l12.4,2.8l5.6-7.3L840.2,350.4z", offX: 0, offY: 0 },
                'TYT': { d: "M840.2,350.4l-7.3-4.5l-7.9,7.3l2.8,11.2l12.4,2.8l5.6-7.3L840.2,350.4z", offX: 0, offY: 0 },
                'BZ': { d: "M105,145.2l-6.7-1.1l-5.6,8.4l-1.1,9.6l7.3,3.4l12.4,1.7l1.7-10.1l-1.1-6.7L105,145.2z", offX: 0, offY: 0 },
                'CU': { d: "M540.2,110.4l-15.2-5.6l-14.6,1.7l-18-0.6l-11.2,6.7l-12.9-2.2l3.4,13.5l14.6,3.9l13.5,13.5l15.2,0.6l11.2,1.7l16.3-5.6l9-10.1L540.2,110.4z", offX: 0, offY: 0 },
                'HT': { d: "M710.2,192.4l-7.3-3.4l-5.6,3.4l-5.6-7.3l-11.8-0.6l-5.6-7.3l-3.9,0.6l-5.1,10.7l1.1,10.1l5.6,7.3l6.7-1.1l5.1,8.4l15.2,0.6l9,9l11.2,1.7l1.1-7.9l7.3-5.6L710.2,192.4z", offX: 0, offY: 20 },
                'PR': { d: "M820,205l10.1-2.2l5.6,8.4l-6.7,1.1l-1.1,5.6l-7.9-1.1l-1.7-10.1L820,205z", offX: 0, offY: 0 }
            };

            function getPathPointBounds(d) {
                const parts = d.replace(/[A-Za-z]/g, ' ').trim().split(/\s+/);
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                for (let i = 0; i < parts.length; i += 2) {
                    const x = parseFloat(parts[i]), y = parseFloat(parts[i + 1]);
                    if (!isNaN(x) && !isNaN(y)) {
                        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                    }
                }
                return { minX, maxX, minY, maxY, x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
            }

            function getPathCenterPoint(d) {
                const b = getPathPointBounds(d);
                return { x: b.x, y: b.y };
            }

            /** Países visibles: Centroamérica + Jamaica + Trinidad + Paraguay + Caribe cercano */
            window.REGIONAL_MAP_VISIBLE = window.REGIONAL_MAP_VISIBLE || ['GT', 'BZ', 'SV', 'HN', 'NI', 'NC', 'CR', 'PA', 'PY', 'JM', 'TYT', 'TT', 'RD', 'DO', 'HT', 'CU', 'PR'];

            function showMapTooltip(e, code, val) {
                const tt = document.getElementById('mapTooltip');
                if(!tt) return;
                const name = paisMap[code] || code;
                const st = mapGetStyle(code);
                tt.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
                        <img src="https://flagcdn.com/w40/${(MAP_COUNTRY_FLAG_MAP[code]||code).toLowerCase()}.png" style="width:24px; border-radius:3px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <div style="flex:1;">
                            <div style="font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px;">${name}</div>
                            <div style="font-size:9px; font-weight:700; color:#94a3b8; text-transform:uppercase;">Región activa</div>
                        </div>
                        <div style="background:${st.color}15; color:${st.color}; padding:4px 10px; border-radius:8px; font-size:10px; font-weight:900;">${code}</div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div style="background:rgba(0,0,0,0.02); padding:10px; border-radius:10px;">
                            <div style="font-size:8px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Headcount</div>
                            <div style="font-size:22px; font-weight:1000; color:#1e293b;">${val||0}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; justify-content:center;">
                            <div style="font-size:9px; font-weight:800; color:${st.color}; display:flex; align-items:center; gap:4px;">
                                <i class="fas fa-chart-line"></i> + ${(val*0.05).toFixed(0)} este mes
                            </div>
                        </div>
                    </div>
                `;
                tt.style.display = 'block';
                moveMapTooltip(e);
            }

            function moveMapTooltip(e) {
                const tt = document.getElementById('mapTooltip');
                if(!tt) return;
                const offset = 20;
                let x = e.clientX + offset, y = e.clientY + offset;
                if(x + tt.offsetWidth > window.innerWidth) x = e.clientX - tt.offsetWidth - offset;
                if(y + tt.offsetHeight > window.innerHeight) y = e.clientY - tt.offsetHeight - offset;
                tt.style.left = x + 'px'; tt.style.top = y + 'px';
            }

            function hideMapTooltip() {
                const tt = document.getElementById('mapTooltip');
                if(tt) tt.style.display = 'none';
            }

            function getMapConfig() {
                return { scale: 1, originX: 0, originY: 0 };
            }

            function renderPremiumRegionalMap(svgId, counts) {
                const svg = document.getElementById(svgId);
                if (!svg) return false;
                svg.innerHTML = '';
                svg.style.backgroundColor = '#f8fafc';
                svg.style.borderRadius = '24px';

                const mergedCounts = Object.assign({}, counts || {});
                if (mergedCounts.TT && !mergedCounts.TYT) mergedCounts.TYT = mergedCounts.TT;
                if (mergedCounts.TYT && !mergedCounts.TT) mergedCounts.TT = mergedCounts.TYT;
                if (mergedCounts.DO && !mergedCounts.RD) mergedCounts.RD = mergedCounts.DO;
                if (mergedCounts.RD && !mergedCounts.DO) mergedCounts.DO = mergedCounts.RD;
                if (mergedCounts.NI && !mergedCounts.NC) mergedCounts.NC = mergedCounts.NI;

                const gCountries = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const gLabels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const pathRefs = [];

                REGIONAL_MAP_VISIBLE.forEach(code => {
                    const p = REGIONAL_MAP_PATHS[code];
                    if (!p) return;

                    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const sel = window.selectedCountries || [];
                    group.setAttribute('class', 'country-group' + (sel.includes(code) ? ' active' : ''));
                    group.setAttribute('data-pa', code);
                    group.onclick = (e) => { e.stopPropagation(); toggleCountry(code); };

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const st = mapGetStyle(code);
                    const val = mergedCounts[code] || 0;

                    path.setAttribute('d', p.d);
                    path.setAttribute('class', 'country-path');
                    path.setAttribute('fill', val > 0 ? (st.color || '#8b5cf6') : '#e2e8f0');
                    path.setAttribute('stroke', '#475569');
                    path.setAttribute('stroke-width', '1.2');
                    path.setAttribute('stroke-linejoin', 'round');
                    path.style.cursor = 'pointer';

                    path.onmouseover = (e) => { showMapTooltip(e, code, val); };
                    path.onmousemove = (e) => { moveMapTooltip(e); };
                    path.onmouseout = () => { hideMapTooltip(); };

                    group.appendChild(path);
                    gCountries.appendChild(group);
                    pathRefs.push({ code, path, val });
                });

                svg.appendChild(gCountries);

                let bb;
                try { bb = gCountries.getBBox(); } catch (e) { bb = null; }
                if (!bb || bb.width < 1) return false;

                const pad = Math.max(28, bb.width * 0.04);
                svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`);
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                const strokeW = Math.max(0.6, bb.width / 700);
                pathRefs.forEach(({ path, val }) => {
                    path.setAttribute('stroke-width', strokeW);
                    if (val <= 0) return;
                    let pb;
                    try { pb = path.getBBox(); } catch (e) { return; }
                    const cx = pb.x + pb.width / 2;
                    const cy = pb.y + pb.height / 2;
                    const labelFs = Math.max(7, Math.min(12, pb.width / 4.5));
                    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txt.textContent = String(val);
                    txt.setAttribute('x', cx);
                    txt.setAttribute('y', cy);
                    txt.setAttribute('text-anchor', 'middle');
                    txt.setAttribute('dominant-baseline', 'central');
                    txt.setAttribute('font-size', labelFs);
                    txt.setAttribute('font-weight', '900');
                    txt.setAttribute('font-family', 'Montserrat, sans-serif');
                    txt.setAttribute('fill', '#ffffff');
                    gLabels.appendChild(txt);
                });

                svg.appendChild(gLabels);
                return true;
            }

            window.renderPremiumRegionalMap = renderPremiumRegionalMap;

            // ============================================================
            // AMCHARTS 5 MAP   Real geographic rendering
            // PY (Paraguay) uses CO (Colombia) shape   adjacent to Panama
            // ============================================================
            window._asysMapRoot = window._asysMapRoot || null;

            function renderAmChartsMap(divId, counts, onDone) {
                const div = document.getElementById(divId);
                if (!div) { if (onDone) onDone(false); return; }

                const ISO_MAP = {
                    'GT':'GT','SV':'SV','CR':'CR','HN':'HN',
                    'NI':'NI','NC':'NI','PA':'PA','PN':'PA',
                    'PY':'PY',
                    'JM':'JM','TYT':'TT','TT':'TT',
                    'RD':'DO','DO':'DO','DM':'DO',
                    'HT':'HT','BZ':'BZ','CU':'CU','PR':'PR'
                };
                const ISO_TO_CODE = { GT:'GT',SV:'SV',CR:'CR',HN:'HN',NI:'NC',PA:'PA',PY:'PY',JM:'JM',TT:'TYT',DO:'RD',HT:'HT',BZ:'BZ',CU:'CU',PR:'PR' };
                const SHOW_COUNTRIES = ['BZ','GT','SV','HN','NI','CR','PA','PY','JM','CU','HT','DO','TT','PR'];

                const merged = Object.assign({}, counts || {});
                if (merged.TT && !merged.TYT) merged.TYT = merged.TT;
                if (merged.TYT && !merged.TT) merged.TT = merged.TYT;
                if (merged.DO && !merged.RD) merged.RD = merged.DO;
                if (merged.RD && !merged.DO) merged.DO = merged.RD;
                if (merged.NI && !merged.NC) merged.NC = merged.NI;

                const isoData = {};
                Object.entries(merged).forEach(([code, val]) => {
                    const iso = ISO_MAP[code];
                    if (!iso) return;
                    const n = Number(val) || 0;
                    const st = mapGetStyle(code);
                    const color = st?.color || '#8b5cf6';
                    const name = (window.paisMap && window.paisMap[code]) || code;
                    if (!isoData[iso]) isoData[iso] = { val: 0, name, color, code };
                    isoData[iso].val += n;
                });

                // Load amCharts 5 CDN scripts sequentially
                const CDN = [
                    'https://cdn.amcharts.com/lib/5/index.js',
                    'https://cdn.amcharts.com/lib/5/map.js',
                    'https://cdn.amcharts.com/lib/5/geodata/worldLow.js',
                    'https://cdn.amcharts.com/lib/5/themes/Animated.js'
                ];

                function am5MapReady() {
                    return !!(window.am5 && window.am5map && window.am5geodata_worldLow && window.am5themes_Animated);
                }

                function loadNext(i, cb) {
                    if (am5MapReady()) { cb(); return; }
                    if (i >= CDN.length) { cb(); return; }
                    const url = CDN[i];
                    const existing = document.querySelector(`script[src="${url}"]`);
                    if (existing) {
                        setTimeout(() => loadNext(i + 1, cb), 80);
                        return;
                    }
                    const s = document.createElement('script');
                    s.src = url;
                    s.onload = () => setTimeout(() => loadNext(i + 1, cb), 80);
                    s.onerror = () => { console.warn('[MAP] CDN falló:', url); cb(); };
                    document.head.appendChild(s);
                }

                loadNext(0, () => {
                    if (!am5MapReady()) {
                        if (onDone) onDone(false);
                        return;
                    }

                    try {
                        if (window._asysMapRoot) { try { window._asysMapRoot.dispose(); } catch (e) {} window._asysMapRoot = null; }

                        const root = am5.Root.new(divId);
                        window._asysMapRoot = root;
                        if (window.am5themes_Animated) root.setThemes([am5themes_Animated.new(root)]);

                        const isDark = document.body.classList.contains('dark');

                        const chart = root.container.children.push(
                            am5map.MapChart.new(root, {
                                projection: am5map.geoMercator(),
                                panX: 'translateX',
                                panY: 'translateY',
                                wheelY: 'zoom',
                                minZoomLevel: 1,
                                maxZoomLevel: 32,
                                homeZoomLevel: 2.45,
                                homeGeoPoint: { longitude: -84, latitude: 9 }
                            })
                        );

                        chart.set('zoomControl', am5map.ZoomControl.new(root, {}));

                        const polySeries = chart.series.push(
                            am5map.MapPolygonSeries.new(root, {
                                geoJSON: am5geodata_worldLow,
                                include: SHOW_COUNTRIES
                            })
                        );

                        polySeries.mapPolygons.template.setAll({
                            fill: am5.color(isDark ? '#334155' : '#e2e8f0'),
                            stroke: am5.color(isDark ? '#94a3b8' : '#64748b'),
                            strokeWidth: 0.9,
                            interactive: true,
                            cursorOverStyle: 'pointer'
                        });

                        polySeries.mapPolygons.template.states.create('hover', {
                            fill: am5.color(isDark ? '#475569' : '#cbd5e1'),
                            strokeWidth: 1.4
                        });

                        const tooltip = am5.Tooltip.new(root, {
                            getFillFromSprite: false,
                            autoTextColor: false,
                            background: am5.RoundedRectangle.new(root, {
                                fill: am5.color(0xffffff),
                                fillOpacity: 0.98,
                                strokeOpacity: 0,
                                cornerRadiusTL: 12,
                                cornerRadiusTR: 12,
                                cornerRadiusBL: 12,
                                cornerRadiusBR: 12
                            })
                        });
                        polySeries.mapPolygons.template.set('tooltip', tooltip);

                        const rows = Object.entries(isoData)
                            .filter(([, d]) => d.val > 0)
                            .map(([iso, d]) => ({
                                id: iso,
                                name: d.name,
                                value: d.val,
                                _fill: d.color,
                                _code: d.code,
                                _tooltip: `<div style="font-family:Montserrat,sans-serif;padding:12px 16px;min-width:140px;">
                                    <div style="font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;">${d.name}</div>
                                    <div style="font-size:26px;font-weight:1000;color:${d.color};line-height:1.1;">${d.val}</div>
                                    <div style="font-size:10px;color:#94a3b8;">colaboradores</div></div>`
                            }));
                        polySeries.data.setAll(rows);

                        polySeries.mapPolygons.template.adapters.add('fill', (fill, target) => {
                            const d = target.dataItem?.dataContext;
                            return d && d._fill ? am5.color(d._fill) : fill;
                        });
                        polySeries.mapPolygons.template.adapters.add('tooltipHTML', (html, target) => {
                            const d = target.dataItem?.dataContext;
                            if (d && d._tooltip) return d._tooltip;
                            const iso = target.dataItem?.get('id');
                            const c = ISO_TO_CODE[iso] || iso;
                            const nm = (window.paisMap && window.paisMap[c]) || iso || '';
                            return `<div style="font-family:Montserrat,sans-serif;padding:8px 12px;font-size:11px;font-weight:700;color:#64748b;">${nm}<br><span style="color:#94a3b8;">Sin operación</span></div>`;
                        });

                        polySeries.mapPolygons.template.events.on('click', (ev) => {
                            const iso = ev.target.dataItem?.get('id');
                            const code = ISO_TO_CODE[iso];
                            if (code && typeof toggleCountry === 'function') toggleCountry(code);
                        });

                        chart.goHome(0);
                        if (onDone) onDone(true);
                    } catch (err) {
                        console.error('[MAP] amCharts error:', err);
                        if (onDone) onDone(false);
                    }
                });
            }
            window.renderAmChartsMap = renderAmChartsMap;
