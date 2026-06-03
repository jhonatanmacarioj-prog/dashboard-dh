// Incidencias tab renderer extracted from the main HTML.

function renderIncidencias() {
                const pane = document.getElementById('pane3');
                if (!pane) return;

                window.activeCharts.forEach(c => { if(c && typeof c.destroy === 'function') c.destroy(); }); 
                window.activeCharts = [];
                const { p: pais, e: emp, a, d, y: yr, m: mo } = getFilters();
                const allIncs = app.incidencias || [];

                const incs = allIncs.filter(i =>
                    (pais === 'ALL' ? true : i.pa === pais) &&
                    (emp === 'ALL' ? true : i.e === emp) &&
                    (a === 'ALL' ? true : i.dir === a) &&
                    (d === 'ALL' ? true : i.d === d) &&
                    (yr === 'ALL' ? true : (i.f && i.f.includes(yr))) &&
                    (mo === 'ALL' ? true : (i.f && i.f.split('/').length >= 2 && parseInt(i.f.split('/')[1]) == parseInt(mo)))
                );

                const currentHC_list = (app.employees || []).filter(e =>
                    (pais === 'ALL' ? true : e.pa === pais) &&
                    (emp === 'ALL' ? true : e.e === emp) &&
                    (yr === 'ALL' ? true : e.y == yr) &&
                    compareMonth(e.m, mo)
                );
                const totalHC = new Set(currentHC_list.map(e => e.c || e.n)).size || 1;

                const totalInc = incs.length;
                const pctInc = ((totalInc / totalHC) * 100).toFixed(2);
                const tipos = {}; incs.forEach(i => { tipos[i.t] = (tipos[i.t] || 0) + 1; });
                const responsables = {}; incs.forEach(i => { const rName = i.r || 'S/R'; responsables[rName] = (responsables[rName] || 0) + 1; });
                const atrasos = incs.filter(i => (i.t || '').toLowerCase().includes('atras')).length;
                const cheques = incs.filter(i => (i.t || '').toLowerCase().includes('cheque')).length;

                const incKpi = (label, val, icon, color, sub) => `
                    <div style="background:#fff; border-radius:14px; padding:10px; box-shadow:0 2px 12px rgba(0,0,0,0.05); border-left:4px solid ${color};">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span style="font-size:22px;">${icon}</span>
                        ${sub ? `<span style="font-size:8px; font-weight:800; background:${color}15; color:${color}; padding:3px 8px; border-radius:12px;">${sub}</span>` : ''}
                    </div>
                    <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; font-weight:800;">${label}</div>
                    <div style="font-family:'Montserrat'; font-size:24px; font-weight:800; color:#1e293b;">${val}</div>
                </div> `;

                const incKpisEl = document.getElementById('incKpis');
                if (incKpisEl) {
                    incKpisEl.innerHTML = `
                ${incKpi('Total HC', totalHC.toLocaleString(), '<i class="fas fa-users"></i>', '#8b5cf6', 'Base')}
                ${incKpi('Total Incidencias', totalInc, '<i class="fas fa-triangle-exclamation"></i>', '#ef4444', 'Total')}
                ${incKpi('% Incidencia', pctInc + '%', '<i class="fas fa-percent"></i>', '#f59e0b', 'Sobre total')}
                ${incKpi('Satisfacción', totalInc > 0 ? ((1 - (totalInc / totalHC)) * 100).toFixed(2) + '%' : '100.00%', '<i class="fas fa-check-circle"></i>', '#10b981', 'Estable')}
                ${incKpi('Atrasos Pago', atrasos, '<i class="fas fa-clock"></i>', '#dc2626', 'Crítico')}
                ${incKpi('Cheques', cheques, '<i class="fas fa-money-check"></i>', '#8b5cf6', 'Seguimiento')}
                    `;
                }

                const alertAtrasos = document.getElementById('incAlertAtrasos');
                const alertCheques = document.getElementById('incAlertCheques');
                if (alertAtrasos) alertAtrasos.innerHTML = `<i class="fas fa-clock"></i> Atrasos (${atrasos})`;
                if (alertCheques) alertCheques.innerHTML = `<i class="fas fa-money-check"></i> Cheques (${cheques})`;

                const alertRows = incs.filter(i => {
                    const t = (i.t || '').toLowerCase();
                    return t.includes('atras') || t.includes('cheque');
                }).slice(0, 50);
                const tbodyAlerts = document.getElementById('tbodyIncAlerts');
                if (tbodyAlerts) {
                    tbodyAlerts.innerHTML = alertRows.length ? alertRows.map(i => `
                        <tr>
                            <td style="padding:8px; font-weight:700;">${i.n || i.c || '—'}</td>
                            <td style="padding:8px;">${i.t || '—'}</td>
                            <td style="padding:8px; text-align:right; font-weight:800; color:#64748b;">${i.f || '—'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" style="padding:20px; text-align:center; color:#94a3b8;">Sin alertas en el periodo</td></tr>';
                }

                // Charts
                const topTipos = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 8);
                const ctxT = document.getElementById('chartIncTipos');
                if (ctxT) window.activeCharts.push(new Chart(ctxT.getContext('2d'), {
                    type: 'bar', data: { labels: topTipos.map(d => d[0]), datasets: [{ data: topTipos.map(d => d[1]), backgroundColor: '#ef4444', borderRadius: 6 }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                const monthNamesArr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthlyInc = Array(12).fill(0);
                incs.forEach(i => { if (i.f && i.f.includes('/')) { const m = parseInt(i.f.split('/')[1]); if (m >= 1 && m <= 12) monthlyInc[m - 1]++; } });

                const ctxTr = document.getElementById('chartIncTrend');
                if (ctxTr) window.activeCharts.push(new Chart(ctxTr.getContext('2d'), {
                    type: 'line', data: { labels: monthNamesArr, datasets: [{ label: 'Incidencias', data: monthlyInc, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.4, fill: true }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                const companyIncs = {}; incs.forEach(i => { companyIncs[i.e] = (companyIncs[i.e] || 0) + 1; });
                const compEntries = Object.entries(companyIncs).sort((a, b) => b[1] - a[1]).slice(0, 8);
                const ctxE = document.getElementById('chartIncEmpresa');
                if (ctxE) window.activeCharts.push(new Chart(ctxE.getContext('2d'), {
                    type: 'doughnut', data: { labels: compEntries.map(d => d[0]), datasets: [{ data: compEntries.map(d => d[1]), backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'], borderWidth: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }
                }));

                // Ranking (Responsibles)
                const respEntries = Object.entries(responsables).sort((a, b) => b[1] - a[1]);
                const ranking = respEntries.slice(0, 6);
                const maxR = ranking.length > 0 ? ranking[0][1] : 1;
                const rankColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#8b5cf6', '#06b6d4'];
                const incRankingEl = document.getElementById('incRanking');
                if (!incRankingEl) return;
                incRankingEl.innerHTML = ranking.map((r, i) => {
                    const pct = ((r[1] / maxR) * 100).toFixed(0);
                    return `<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <span style="font-size:11px; font-weight:700; color:#64748b; width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r[0]}</span>
                        <div style="flex:1; height:22px; background:#f1f5f9; border-radius:6px; overflow:hidden; position:relative;">
                            <div style="height:100%; width:${pct}%; background:${rankColors[i] || '#8b5cf6'}; border-radius:6px; transition:width 0.5s;"></div>
                        </div>
                        <span style="font-size:12px; font-weight:800; color:#1e293b; min-width:30px; text-align:right;">${r[1]}</span>
                        <span style="font-size:10px; color:#94a3b8;">${totalInc > 0 ? ((r[1] / totalInc) * 100).toFixed(0) : 0}%</span>
                    </div> `;
                }).join('') || '<p style="color:#94a3b8; text-align:center; padding:30px;">Sin datos</p>';
            }

