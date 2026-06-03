// Bajas tab renderer extracted from the main HTML.

function renderBajas() {
                window.activeCharts.forEach(c => { if (c) c.destroy(); }); window.activeCharts = [];
                const { p: pais, e: emp, a: area, d: depto, y: yr, m: mo, countries } = getFilters();
                const bajasList = app.bajas_list || [];

                const filtered = bajasList.filter(b => {
                    const curPa = (b.pa || '').trim().toUpperCase();
                    const matchPa = countries.length === 0 || countries.includes(curPa);
                    const matcharea = (area === 'ALL' || b.dir === area);
                    const matchDepto = (depto === 'ALL' || b.d === depto);
                    return matchPa &&
                        (emp === 'ALL' ? true : b.e === emp) &&
                        matcharea && matchDepto &&
                        (yr === 'ALL' ? true : b.y == yr) &&
                        compareMonth(b.m, mo);
                });

                // KPI Update
                const totalB = filtered.length;
                const standardReasons = ['Renuncia', 'Despido con Responsabilidad Patronal', 'Despido sin Responsabilidad Patronal', 'Abandono de Labores', 'Sustitución Patronal'];
                const reasonsCount = {}; standardReasons.forEach(r => reasonsCount[r] = 0);
                filtered.forEach(b => { const r = b.mc || 'Renuncia'; if (reasonsCount.hasOwnProperty(r)) reasonsCount[r]++; else reasonsCount['Renuncia']++; });
                const topReason = Object.entries(reasonsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '---';

                document.getElementById('kpi2').innerHTML = `
                ${kpiCard("Bajas Totales", totalB, " ", "#ef4444", "Periodo", "down")}
                ${kpiCard("Principal Motivo", topReason.substring(0, 18), " ", "#f59e0b", null)}
                ${kpiCard("Empresas", new Set(filtered.map(b => b.e)).size, " ", "#3b82f6", null)}
                ${kpiCard("Paises", new Set(filtered.map(b => b.pa)).size, " ", "#10b981", null)}
                ${kpiCard("Prom. Antigüedad", calcAvgTenure(app.employees.filter(e => filtered.some(b => b.c === e.c))) + " a ", " ", "var(--ac)", null)}
                    `;

                const monthNamesArr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthlyB = Array(12).fill(0);
                filtered.forEach(b => { const nm = normalizeMonth(b.m); if (nm >= 1 && nm <= 12) monthlyB[nm - 1]++; });
                const peakMonth = monthlyB.indexOf(Math.max(...monthlyB));

                // Chart Motivos
                const ctxM = document.getElementById('chartBMotivos');
                if (ctxM) window.activeCharts.push(new Chart(ctxM.getContext('2d'), {
                    type: 'pie', data: { labels: standardReasons, datasets: [{ data: standardReasons.map(r => reasonsCount[r]), backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'] }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 9 } } } } }
                }));

                // Chart Bajas por Pais (using country colors)
                const paisesB = {}; filtered.forEach(b => { paisesB[b.pa] = (paisesB[b.pa] || 0) + 1; });
                const pData = Object.entries(paisesB).sort((a, b) => b[1] - a[1]);
                const ctxP = document.getElementById('chartBPais');
                if (ctxP) window.activeCharts.push(new Chart(ctxP.getContext('2d'), {
                    type: 'bar', data: { labels: pData.map(d => paisMap[d[0]] || d[0]), datasets: [{ data: pData.map(d => d[1]), backgroundColor: pData.map(d => getStyle(d[0]).color), borderRadius: 6 }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // Trend Chart (Full 12 months)
                const ctxT = document.getElementById('chartBTrend');
                if (ctxT) window.activeCharts.push(new Chart(ctxT.getContext('2d'), {
                    type: 'line', data: { labels: monthNamesArr, datasets: [{ label: 'Bajas', data: monthlyB, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // Peak Chart
                const ctxPk = document.getElementById('chartBPeaks');
                if (ctxPk) window.activeCharts.push(new Chart(ctxPk.getContext('2d'), {
                    type: 'bar', data: { labels: monthNamesArr, datasets: [{ data: monthlyB, backgroundColor: monthlyB.map((v, i) => i === peakMonth ? '#ef4444' : '#e2e8f0'), borderRadius: 6 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // Company Chart
                const empsB = {}; filtered.forEach(b => { empsB[b.e] = (empsB[b.e] || 0) + 1; });
                const eData = Object.entries(empsB).sort((a, b) => b[1] - a[1]).slice(0, 8);
                const ctxE = document.getElementById('chartBEmpresa');
                if (ctxE) window.activeCharts.push(new Chart(ctxE.getContext('2d'), {
                    type: 'bar', data: { labels: eData.map(d => d[0]), datasets: [{ data: eData.map(d => d[1]), backgroundColor: '#10b981', borderRadius: 6 }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // Attrition Heatmap
                renderAttritionHeatmap();

                if (typeof renderRetentionHealth === 'function') {
                    const activeHCForRisk = applyDeepFilters(app.employees || []);
                    renderRetentionHealth(activeHCForRisk, yr, mo);
                }
            }
