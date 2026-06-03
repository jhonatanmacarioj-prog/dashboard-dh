// EMERGENCY RECOVERY SYSTEM
        window.forceRepair = function() {
            localStorage.clear(); sessionStorage.clear();
            const url = new URL(window.location.href); url.searchParams.set('v', new Date().getTime());
            window.location.href = url.toString();
        };

        // GLOBAL ERROR REPORTER (Antigravity Debug Mode)
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('ERROR DETECTADO:', msg, url, lineNo);
            const errDiv = document.getElementById('debugErrorBanner') || document.createElement('div');
            errDiv.id = 'debugErrorBanner';
            errDiv.style.position = 'fixed';
            errDiv.style.top = '0';
            errDiv.style.left = '0';
            errDiv.style.width = '100%';
            errDiv.style.background = '#800000';
            errDiv.style.color = '#fff';
            errDiv.style.zIndex = '999999';
            errDiv.style.padding = '15px';
            errDiv.style.fontFamily = 'monospace';
            errDiv.style.fontSize = '12px';
            errDiv.style.borderBottom = '3px solid red';
            errDiv.innerHTML = '<strong>ALERTA DE ERROR:</strong> ' + msg + ' <br> <small>Archivo: ' + url + ' | Linea: ' + lineNo + '</small>';
            if (document.body) {
                if (!document.getElementById('debugErrorBanner')) document.body.appendChild(errDiv);
            }
            return false;
        };

        // --- ASYS PREMIUM CHART.JS GLOBAL OVERRIDES ---
        if (window.Chart) {
            Chart.defaults.font.family = "'Montserrat', sans-serif";
            Chart.defaults.font.size = 11;
            Chart.defaults.color = '#64748b';
            
            Chart.defaults.plugins.tooltip = {
                ...Chart.defaults.plugins.tooltip,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                titleFont: { family: "'Montserrat', sans-serif", size: 14, weight: 'bold' },
                bodyFont: { family: "'Montserrat', sans-serif", size: 13, weight: '500' },
                padding: 14,
                cornerRadius: 12,
                borderColor: 'rgba(0,0,0,0.06)',
                borderWidth: 1,
                displayColors: true,
                boxPadding: 6,
                usePointStyle: true,
                caretSize: 6,
                caretPadding: 10
            };
            
            Chart.defaults.elements.line.tension = 0.4; 
            Chart.defaults.elements.line.borderWidth = 3;
            Chart.defaults.elements.point.hoverRadius = 6;
            Chart.defaults.elements.point.hoverBorderWidth = 3;
            
            Chart.defaults.elements.bar.borderRadius = 5;
            Chart.defaults.elements.bar.borderSkipped = false;

            const glowPlugin = {
                id: 'premiumGlow',
                beforeDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 8;
                },
                afterDatasetsDraw: function(chart) {
                    chart.ctx.restore();
                }
            };
            Chart.register(glowPlugin);
        }

        if (window.google && google.charts) { 
            google.charts.load('current', { 'packages': ['geochart'] });
        }

