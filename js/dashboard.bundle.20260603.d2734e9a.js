/* ===== dashboard-init.js ===== */
﻿// EMERGENCY RECOVERY SYSTEM
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



/* ===== data-loader.js ===== */
// SMART DATA LOADER (Antigravity Optimized v6.1)
function loadData(callback) {
    console.log("[INIT] Starting Data Loader v6.1");
    var isPublishedSite = location.hostname.indexOf('github.io') !== -1;
    var currentScript = document.currentScript || Array.from(document.scripts).find(function (s) {
        return s.src && s.src.indexOf('data-loader.js') !== -1;
    });
    var scriptSrc = currentScript && currentScript.getAttribute('src') || "";
    var isPublishedBundle = isPublishedSite
        || scriptSrc.indexOf('js/data-loader.js') !== -1
        || scriptSrc.indexOf('dashboard.bundle.') !== -1
        || location.pathname.indexOf('publicacion_web') !== -1
        || location.pathname.indexOf('publicacion%20web') !== -1;
    var paths = isPublishedBundle ? [
        'data/full_hc_data_v3.js'
    ] : [
        'data/02. Consolidado data/01. Data Generada/full_hc_data_v3.js',
        '../../02. Consolidado data/01. Data Generada/full_hc_data_v3.js'
    ];
    var idx = 0;

    function loadExtraScripts(cb) {
        var successfulPath = paths[idx] || "";
        var extras;

        if (isPublishedBundle || successfulPath.indexOf('data/full_hc_data_v3.js') === 0) {
            extras = [
                { src: 'data/position_master.js', required: true },
                { src: 'data/isr_data.js', required: true },
                { src: 'data/auth_config.js', required: false }
            ];
        } else if (successfulPath.indexOf('../../02. Consolidado data') === 0) {
            extras = [
                { src: '../../03. Data Dashboard/01. Maestros/position_master.js', required: true },
                { src: '../../03. Data Dashboard/01. Maestros/isr_data.js', required: true },
                { src: '../../03. Data Dashboard/02. Config/auth_config.js', required: false }
            ];
        } else {
            extras = [
                { src: 'data/03. Data Dashboard/01. Maestros/position_master.js', required: true },
                { src: 'data/03. Data Dashboard/01. Maestros/isr_data.js', required: true },
                { src: 'data/03. Data Dashboard/02. Config/auth_config.js', required: false }
            ];
        }

        var ei = 0;
        function nextExtra() {
            if (ei >= extras.length) {
                console.log("[OK] All extra scripts checked.");
                if (typeof cb === 'function') cb();
                return;
            }
            var extra = extras[ei];
            var s = document.createElement("script");
            s.src = extra.src + "?v=" + new Date().getTime();
            s.onload = function () { console.log("[OK] Loaded extra:", extra.src); ei++; nextExtra(); };
            s.onerror = function () {
                if (extra.required) console.warn("[WARN] Required extra not at:", extra.src);
                ei++;
                nextExtra();
            };
            document.head.appendChild(s);
        }
        nextExtra();
    }

    function dataIsReady() {
        return typeof window.hcFullData !== 'undefined'
            && window.hcFullData.summary
            && window.hcFullData.summary.length > 0;
    }

    function loadByScript(path, onOk, onFail) {
        var done = false;
        var s = document.createElement("script");
        var timer = setTimeout(function() {
            if (done) return;
            done = true;
            console.warn("[WARN] Script data timeout:", path);
            try { s.remove(); } catch(e) {}
            onFail();
        }, 18000);

        s.src = path + "?v=" + new Date().getTime();
        s.onload = function () {
            if (done) return;
            done = true;
            clearTimeout(timer);
            if (dataIsReady()) onOk();
            else {
                console.warn("[FAIL] Script loaded but hcFullData invalid at:", path);
                onFail();
            }
        };
        s.onerror = function () {
            if (done) return;
            done = true;
            clearTimeout(timer);
            console.warn("[WARN] Path unreachable:", path);
            onFail();
        };
        document.head.appendChild(s);
    }

    function tryNext() {
        if (idx >= paths.length) {
            console.error("[ERROR] No more data paths to try. Starting extras...");
            loadExtraScripts(callback);
            return;
        }
        console.log("[INFO] Trying data path (" + (idx+1) + "/" + paths.length + "):", paths[idx]);

        var currentPath = paths[idx];
        var success = function() {
            console.log("[SUCCESS] VALID DATA FOUND at:", currentPath);
            loadExtraScripts(callback);
        };
        var fail = function() {
            idx++;
            tryNext();
        };

        loadByScript(currentPath, success, fail);
    }
    tryNext();
}


/* ===== filters.js ===== */
// Dashboard filter helpers extracted from the main HTML. Keep these globals stable; inline dashboard code calls them directly.

function showNoData(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    let msg = container.querySelector('.no-data-msg');
    if (!msg) {
        msg = document.createElement('div');
        msg.className = 'no-data-msg';
        msg.innerHTML = '<i class="fas fa-info-circle"></i> No hay datos para los filtros seleccionados';
        container.appendChild(msg);
    }
    canvas.style.display = 'none';
    msg.style.display = 'flex';
}

function hideNoData(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    const msg = container.querySelector('.no-data-msg');
    if (msg) msg.style.display = 'none';
    canvas.style.display = 'block';
}

function initFilters() {
    const pSel = document.getElementById('paisSel');
    const eSel = document.getElementById('empresaSel');
    const aSel = document.getElementById('areaSel');
    const dSel = document.getElementById('deptoSel');
    const ySel = document.getElementById('yearSel');
    const mSel = document.getElementById('monthSel');

    // MAPPING FIRST (Dynamic Source from Master)
    performGlobalMapping();

    const summary = app.summary || [];
    const employees = app.employees || [];

    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const paises = [...new Set(summary.map(s => normalizePa(s.pa)))].filter(p => p && p !== '2' && p !== '3').sort();
    const empresas = [...new Set(summary.map(s => (s.e || '').trim()))].filter(e => e && e !== 'VARIOS' && e !== 'GLOBAL' && e !== 'RD').sort();

    // DYNAMIC DIRECTIONS AND DEPARTMENTS (Derived from Mapped Data)
    const areas = [...new Set(employees.map(e => e.dir))].filter(a => a && a !== 'OTRO').sort();
    const deptos = [...new Set(employees.map(e => e.d))].filter(d => d && d !== 'OTRO').sort();

    const years = [...new Set([...summary.map(s => s.y), ...employees.map(e => e.y)])].filter(y => y).sort((a, b) => b - a);

    pSel.innerHTML = '<option value="ALL">Pais</option>' + paises.map(p => `<option value="${p}">${paisMap[p] || p}</option>`).join('');
    eSel.innerHTML = '<option value="ALL">EMPRESA</option>' + empresas.map(e => `<option value="${e}">${toTitleCase(e)}</option>`).join('');
    aSel.innerHTML = '<option value="ALL">Direccion</option>' + areas.map(a => `<option value="${a}">${toTitleCase(a)}</option>`).join('');
    dSel.innerHTML = '<option value="ALL">DEPARTAMENTO</option>' + deptos.map(d => `<option value="${d}">${toTitleCase(d)}</option>`).join('');
    ySel.innerHTML = '<option value="ALL">AÑO</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    mSel.innerHTML = '<option value="ALL">MES</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => `<option value="${m}">${monthNames[m]}</option>`).join('');

    const ycSel = document.getElementById('yearSelComp');
    const mcSel = document.getElementById('monthSelComp');
    if (ycSel) ycSel.innerHTML = '<option value="ALL">AÑO REF</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (mcSel) mcSel.innerHTML = '<option value="ALL">MES REF</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => `<option value="${m}">${monthNames[m]}</option>`).join('');

    // SUPER RESET (Ensures F5 behaves exactly like clicking "Clear Filters")
    window.selectedCountries = [];
    [pSel, eSel, aSel, dSel, ySel, mSel].forEach(s => { if (s) s.value = 'ALL'; });
    if (ySel && years.length > 0) ySel.value = String(years[0]);
    const ycSel2 = document.getElementById('yearSelComp');
    const mcSel2 = document.getElementById('monthSelComp');
    if (ycSel2) ycSel2.value = 'ALL';
    if (mcSel2) mcSel2.value = 'ALL';
}

function compareYear(y1, y2) {
    const s1 = String(y1 || "").trim();
    const s2 = String(y2 || "").trim();
    if (s1 === s2) return true;
    if (s2 === 'ALL') return true;
    if (s1.length === 2 && s2 === '20' + s1) return true;
    if (s2.length === 2 && s1 === '20' + s2) return true;
    return false;
}

// --- ULTRA-FAST BULLETPROOF CACHING ---
const _filterCache = new Map();
function applyDeepFilters(data, overrides = {}) {
    if (!data || !Array.isArray(data)) return [];
    const baseFilters = getFilters();
    const f = Object.assign({}, baseFilters, overrides);
    
    // Robust Cache Key
    const cacheKey = JSON.stringify(f) + (data.length) + (data[0] ? (data[0].c || data[0].n || '') : '');
    if (_filterCache.has(cacheKey)) return _filterCache.get(cacheKey);

    const result = data.filter(item => {
        if (!item) return false;
        const itemPa = item._pa || item.pa || '??';
        const matchPa = f.countries.length === 0 || f.countries.includes(itemPa);
        if (!matchPa) return false;

        const matchE = (f.e === 'ALL' || String(item._e || item.e || '').trim().toUpperCase() === f.e);
        if (!matchE) return false;

        const matchA = (f.a === 'ALL' || String(item._dir || item.dir || item.area || '').trim().toUpperCase() === f.a);
        if (!matchA) return false;

        const matchD = (f.d === 'ALL' || String(item._d || item.d || item.depto || '').trim().toUpperCase() === f.d);
        if (!matchD) return false;

        const itemY = item._y || String(item.y || '');
        const matchY = (f.y === 'ALL' || itemY === String(f.y));
        if (!matchY) return false;

        const itemM = item._m || item.m;
        const matchM = (f.m === 'ALL' || itemM == f.m);
        if (!matchM) return false;

        return true;
    });
    
    _filterCache.set(cacheKey, result);
    if (_filterCache.size > 50) _filterCache.delete(_filterCache.keys().next().value); 
    return result;
}

function getFilters() {
    const p = document.getElementById('paisSel')?.value || 'ALL';
    const e = document.getElementById('empresaSel')?.value || 'ALL';
    const a = document.getElementById('areaSel')?.value || 'ALL';
    const d = document.getElementById('deptoSel')?.value || 'ALL';
    const y = document.getElementById('yearSel')?.value || 'ALL';
    const m = document.getElementById('monthSel')?.value || 'ALL';

    const yc = document.getElementById('yearSelComp')?.value || 'ALL';
    const mc = document.getElementById('monthSelComp')?.value || 'ALL';
    const comp = document.getElementById('compToggle')?.checked || false;

    const countries = (window.selectedCountries && window.selectedCountries.length > 0) ? window.selectedCountries : (p === 'ALL' ? [] : [p]);
    return { p, e, a, d, y, m, yc, mc, comp, countries };
}

window.syncFilter = function(sel) {
    if (['paisSel', 'empresaSel', 'areaSel', 'deptoSel'].includes(sel.id)) {
        window.updateCascadeFilters(sel.id);
    }
    window.updateFilterLabels();
    requestRenderAll();
};

window.updateCascadeFilters = function(changedId) {
    const fP = document.getElementById('paisSel');
    const fE = document.getElementById('empresaSel');
    const fA = document.getElementById('areaSel');
    const fD = document.getElementById('deptoSel');
    if (!fP || !fE || !fA || !fD) return;

    const allEmps = app.employees || [];
    const allSummary = app.summary || [];

    const updateSelect = (sel, data, prop, label) => {
        if (!sel) return;
        const prevVal = sel.value;
        const rawValues = data.map(item => {
            if (prop === 'pa') return normalizePa(item.pa || item.p || item.pais || '');
            if (prop === 'e') return (item.e || '').trim().toUpperCase();
            if (prop === 'dir') return (item.dir || item.area || '').trim().toUpperCase();
            if (prop === 'd') return (item.d || item.depto || '').trim().toUpperCase();
            return '';
        });

        const uniqueValues = [...new Set(rawValues)]
            .filter(v => v && v !== 'OTRO' && v !== 'VARIOS' && v !== 'GLOBAL' && v !== 'RD' && v !== '0' && v !== 'nan' && v !== 'OTROS')
            .sort();

        const toTitleCase = (str) => {
            if (!str) return '';
            if (prop === 'pa') return window.paisMap[str] || str;
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };

        sel.innerHTML = `<option value="ALL">${label}</option>` + uniqueValues.map(v => `<option value="${v}">${toTitleCase(v)}</option>`).join('');
        sel.value = uniqueValues.includes(prevVal) ? prevVal : 'ALL';
    };

    if (changedId === 'paisSel') {
        const p = fP.value;
        const dataForE = (p === 'ALL') ? allSummary : allSummary.filter(item => normalizePa(item.pa || item.pais || '') === p);
        updateSelect(fE, dataForE, 'e', 'EMPRESA');
        changedId = 'empresaSel';
    }

    if (changedId === 'empresaSel') {
        const p = fP.value;
        const e = fE.value;
        let dataForA = allEmps;
        if (p !== 'ALL') dataForA = dataForA.filter(item => normalizePa(item.pa || item.p || item.pais || '') === p);
        if (e !== 'ALL') dataForA = dataForA.filter(item => (item.e || '').toUpperCase().trim() === e);
        updateSelect(fA, dataForA, 'dir', 'Direccion');
        changedId = 'areaSel';
    }

    if (changedId === 'areaSel') {
        const p = fP.value;
        const e = fE.value;
        const a = fA.value;
        let dataForD = allEmps;
        if (p !== 'ALL') dataForD = dataForD.filter(item => normalizePa(item.pa || item.p || item.pais || '') === p);
        if (e !== 'ALL') dataForD = dataForD.filter(item => (item.e || '').toUpperCase().trim() === e);
        if (a !== 'ALL') dataForD = dataForD.filter(item => (item.dir || item.area || '').toUpperCase().trim() === a);
        updateSelect(fD, dataForD, 'd', 'DEPARTAMENTO');
    }
};

window.updateFilterLabels = function() {
    const ids = ['paisSel', 'empresaSel', 'areaSel', 'deptoSel', 'yearSel', 'monthSel', 'yearSelComp', 'monthSelComp'];
    ids.forEach(id => {
        const sel = document.getElementById(id);
        const valSpan = document.getElementById('val_' + id);
        if (sel && valSpan) {
            valSpan.innerText = sel.options[sel.selectedIndex]?.text || '';
        }
    });
    if (typeof updateChips === 'function') updateChips();
};

window.clearFilters = function clearFilters() {
    window.selectedCountries = [];
    window._hcType = 'neto';
    window._flagMode = 'hc';
    window._hcMirrorMode = false;

    let latestYear = 2026;
    let latestMonth = 4;
    if (window.app && window.app.summary && window.app.summary.length > 0) {
        let maxYear = 0;
        window.app.summary.forEach(s => {
            const y = parseInt(s.y);
            if (y > maxYear) maxYear = y;
        });
        if (maxYear > 0) {
            latestYear = maxYear;
            let maxMonth = 0;
            window.app.summary.forEach(s => {
                if (parseInt(s.y) === latestYear) {
                    const m = parseInt(s.m);
                    if (m > maxMonth) maxMonth = m;
                }
            });
            if (maxMonth > 0) latestMonth = maxMonth;
        }
    }

    const masterFilters = ['paisSel', 'empresaSel', 'areaSel', 'deptoSel', 'monthSel', 'yearSel', 'yearSelComp', 'monthSelComp'];
    masterFilters.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        if (id === 'yearSel') {
            el.value = String(latestYear);
        } else {
            el.value = 'ALL';
        }

        const lbl = document.getElementById('val_' + id);
        if (lbl) {
            const opt = el.options[el.selectedIndex];
            lbl.textContent = opt ? opt.text : el.value;
            lbl.style.opacity = "1";
        }
    });

    const compChk = document.getElementById('compToggle');
    if (compChk && compChk.checked) {
        compChk.checked = false;
        if (typeof toggleCompMode === 'function') toggleCompMode();
    }

    cachedEmps = null;
    lastFilterKey = "";

    if (typeof window.updateCascadeFilters === 'function') {
        window.updateCascadeFilters('paisSel');
    }

    if (typeof window._incFilters !== 'undefined') {
        window._incFilters = {
            tipo: 'ALL',
            sev: 'ALL',
            fuente: 'ALL',
            responsable: 'ALL',
            search: '',
            monthScope: '6m',
            month: 'ALL',
            distDim: 'dir'
        };
    }
    window._showAllRanking = false;

    requestRenderAll();
};

window.toggleCompMode = function() {
    const toggle = document.getElementById('compToggle');
    const colRef = document.getElementById('col_refFilters');
    const track = document.getElementById('compTrack');
    const knob = document.getElementById('compKnob');
    const icon = document.getElementById('compIconSide');

    if (!toggle || !colRef) return;

    if (toggle.checked) {
        colRef.style.display = 'flex';
        if (track) track.style.background = '#6366f1';
        if (knob) knob.style.left = '21px';
        if (icon) icon.style.color = '#6366f1';
    } else {
        colRef.style.display = 'none';
        if (track) track.style.background = 'rgba(255,255,255,0.1)';
        if (knob) knob.style.left = '3px';
        if (icon) icon.style.color = '#94a3b8';

        const yc = document.getElementById('yearSelComp');
        const mc = document.getElementById('monthSelComp');
        if (yc) yc.value = 'ALL';
        if (mc) mc.value = 'ALL';
    }

    requestRenderAll();
};



/* ===== ui.js ===== */
// General UI helpers extracted from the main HTML.

function applySavedUI() {
    const saved = JSON.parse(localStorage.getItem('asys_ui_custom') || '{}');
    const root = document.documentElement;
    if (saved['prop_ac']) {
        root.style.setProperty('--ac', saved['prop_ac']);
        root.style.setProperty('--ac-light', saved['prop_ac'] + '15');
    }
    if (saved['prop_radius']) {
        root.style.setProperty('--radius', saved['prop_radius'] + 'px');
    }
}

function applySavedTheme() {
    const isDark = localStorage.getItem('asys_dark_mode') === 'true';
    if (!document.body) return;
    document.body.classList.toggle('dark', isDark);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const icon = document.getElementById('darkIcon');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('asys_dark_mode', isDark);
    renderAll();
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const main = document.querySelector('.main');
    if (sb) sb.classList.toggle('collapsed');
    if (main) main.classList.toggle('shrunk');
}

function authorizeCode() {
    if (typeof switchTab === 'function') switchTab(6);
    if (window.Swal) {
        Swal.fire({
            icon: 'info',
            title: 'Panel de autorizacion',
            text: 'Entraste al panel de configuracion para revisar y guardar cambios autorizados.',
            confirmButtonColor: '#3b82f6'
        });
    }
}

function switchTab(n) {
    console.log('  switchTab:', n);
    window.activeTab = n;

    const titles = ["HEADCOUNT", "ORGANIGRAMA", "DESVINCULACIONES", "INCIDENCIAS DE PAGO", "CONCILIACION ISR", "ANALISIS DE COSTOS", "CONFIGURACION", "HC DINAMICO"];
    const titleEl = document.getElementById('dynamicHCTitle');
    const fastTitle = titles[n] || "Dashboard";

    if (titleEl) titleEl.innerText = fastTitle;

    document.querySelectorAll('.nav-item').forEach(it => it.classList.remove('on'));
    const navIndexes = [0, 5, 2, 1, 3, 4, 6, 7];
    const activeNavIdx = navIndexes.indexOf(n);
    const activeNav = document.querySelectorAll('.nav-item')[activeNavIdx];
    if (activeNav) activeNav.classList.add('on');

    document.querySelectorAll('.pane').forEach((p, i) => {
        if (n === i) p.classList.add('on');
        else p.classList.remove('on');
    });

    const monthSel = document.getElementById('monthSel');
    if (monthSel) monthSel.style.display = (n === 0 || n === 1 || n === 3 || n === 4 || n === 5) ? 'block' : 'none';

    if (n === 6) renderAdminPanel();
    if (n === 1) openOrgChart();
    renderAll();
}

window.applySavedUI = applySavedUI;
window.toggleDarkMode = toggleDarkMode;
window.toggleSidebar = toggleSidebar;
window.authorizeCode = authorizeCode;
window.switchTab = switchTab;

applySavedUI();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySavedTheme);
} else {
    applySavedTheme();
}


/* ===== maps.js ===== */
// Regional map engines extracted from the main HTML.



const MAP_COUNTRY_FLAG_MAP = { 'GT': 'gt', 'CR': 'cr', 'HN': 'hn', 'SV': 'sv', 'NC': 'ni', 'NI': 'ni', 'PA': 'pa', 'PN': 'pa', 'PY': 'py', 'JM': 'jm', 'TYT': 'tt', 'TT': 'tt', 'DM': 'do', 'DO': 'do', 'RD': 'do' };



function mapGetStyle(p) {

    const styles = window.countryStyles || {};

    return styles[p] || styles.OTHER || { color: '#8b5cf6', flag: p };

}

// --- PREMIUM SVG MAP ENGINE & PATHS ---

            const REGIONAL_MAP_PATHS = {

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

            const REGIONAL_MAP_VISIBLE = ['GT', 'BZ', 'SV', 'HN', 'NI', 'NC', 'CR', 'PA', 'PY', 'JM', 'TYT', 'TT', 'RD', 'DO', 'HT', 'CU', 'PR'];



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

            let _asysMapRoot = null;



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

                const ISO_TO_CODE = { 

                    GT:'GT',SV:'SV',CR:'CR',HN:'HN',NI:'NC',PA:'PA',

                    PY:'PY',JM:'JM',TT:'TYT',DO:'RD',HT:'HT',BZ:'BZ',CU:'CU',PR:'PR' 

                };

                const SHOW_COUNTRIES = ['BZ','GT','SV','HN','NI','CR','PA','PY','JM','CU','HT','DO','TT','PR'];

                

                const countryFlagMap = { 

                    'GT': 'gt', 'CR': 'cr', 'HN': 'hn', 'SV': 'sv', 'NC': 'ni', 'NI': 'ni', 

                    'PA': 'pa', 'PN': 'pa', 'PY': 'py', 'JM': 'jm', 'TYT': 'tt', 'TT': 'tt', 

                    'DM': 'do', 'DO': 'do', 'RD': 'do', 'HT': 'ht', 'BZ': 'bz', 'CU': 'cu', 'PR': 'pr' 

                };



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

                    const st = typeof mapGetStyle === 'function' ? mapGetStyle(code) : (typeof getStyle === 'function' ? getStyle(code) : { color: '#8b5cf6' });

                    const color = st?.color || '#8b5cf6';

                    const name = (window.paisMap && window.paisMap[code]) || code;

                    if (!isoData[iso]) isoData[iso] = { val: 0, name, color, code };

                    isoData[iso].val += n;

                });



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

                    if (document.querySelector(`script[src="${url}"]`)) {

                        setTimeout(() => loadNext(i + 1, cb), 80);

                        return;

                    }

                    const s = document.createElement('script');

                    s.src = url;

                    s.onload = () => setTimeout(() => loadNext(i + 1, cb), 80);

                    s.onerror = () => { console.warn('[MAP] CDN failed:', url); cb(); };

                    document.head.appendChild(s);

                }



                loadNext(0, () => {

                    if (!am5MapReady()) { if (onDone) onDone(false); return; }

                    try {

                        if (window._asysMapRoot) { 

                            try { window._asysMapRoot.dispose(); } catch(e) {} 

                            window._asysMapRoot = null; 

                        }

                        const isDark = document.body.classList.contains('dark') || !!window.isDark;

                        const root = am5.Root.new(divId);

                        window._asysMapRoot = root;

                        root.setThemes([am5themes_Animated.new(root)]);



                        const chart = root.container.children.push(

                            am5map.MapChart.new(root, {

                                projection: am5map.geoMercator(),

                                panX: "none",

                                panY: "none",

                                wheelX: "none",

                                wheelY: "none",

                                pinchZoomX: false,

                                pinchZoomY: false,

                                doubleClickZoom: false,

                                homeZoomLevel: 2.45,

                                homeGeoPoint: { longitude: -84, latitude: 9 },

                                background: am5.Rectangle.new(root, { fill: am5.color(isDark ? "#1e293b" : "#f1f5f9"), fillOpacity: 0 })

                            })

                        );



                        const polygonSeries = chart.series.push(

                            am5map.MapPolygonSeries.new(root, {

                                geoJSON: am5geodata_worldLow,

                                include: SHOW_COUNTRIES

                            })

                        );



                        polygonSeries.mapPolygons.template.setAll({

                            fill: am5.color(isDark ? '#334155' : '#e2e8f0'),

                            stroke: am5.color(isDark ? '#475569' : '#cbd5e1'),

                            strokeWidth: 1.0,

                            interactive: true,

                            cursorOverStyle: 'pointer'

                        });



                        polygonSeries.mapPolygons.template.states.create('hover', {

                            fill: am5.color(isDark ? '#475569' : '#cbd5e1'),

                            strokeWidth: 1.5

                        });



                        const tooltip = am5.Tooltip.new(root, {

                            getFillFromSprite: false,

                            autoTextColor: false,

                            background: am5.RoundedRectangle.new(root, {

                                fill: am5.color(isDark ? '#0f172a' : '#ffffff'),

                                fillOpacity: 0.98,

                                stroke: am5.color(isDark ? '#334155' : '#e2e8f0'),

                                strokeWidth: 1.5,

                                cornerRadiusTL: 12,

                                cornerRadiusTR: 12,

                                cornerRadiusBL: 12,

                                cornerRadiusBR: 12

                            })

                        });

                        polygonSeries.mapPolygons.template.set('tooltip', tooltip);



                        const rows = Object.entries(isoData)

                            .filter(([, d]) => d.val > 0)

                            .map(([iso, d]) => {

                                const flagCode = (countryFlagMap[d.code] || d.code).toLowerCase();

                                const trendVal = (d.val * 0.05).toFixed(0);

                                return {

                                    id: iso,

                                    name: d.name,

                                    value: d.val,

                                    _fill: d.color,

                                    _code: d.code,

                                    _tooltip: `

                                        <div style="font-family: Montserrat, sans-serif; padding: 12px; min-width: 220px; color: ${isDark ? '#f8fafc' : '#1e293b'}; text-align: left;">

                                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}; padding-bottom:8px;">

                                                <img src="https://flagcdn.com/w40/${flagCode}.png" style="width:20px; height:auto; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,0.15);">

                                                <div style="flex:1;">

                                                    <div style="font-size:11px; font-weight:850; color:${isDark ? '#f8fafc' : '#1e293b'}; text-transform:uppercase; letter-spacing:0.3px; line-height:1.2;">${d.name}</div>

                                                    <div style="font-size:8px; font-weight:700; color:#94a3b8; text-transform:uppercase; line-height:1.2;">Región activa</div>

                                                </div>

                                                <div style="background:${d.color}25; color:${d.color}; padding:2px 6px; border-radius:6px; font-size:9px; font-weight:800;">${d.code}</div>

                                            </div>

                                            <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:8px; align-items:center;">

                                                <div style="background:${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; padding:6px 8px; border-radius:8px;">

                                                    <div style="font-size:7px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:1px;">Headcount</div>

                                                    <div style="font-size:16px; font-weight:1000; color:${isDark ? '#f8fafc' : '#1e293b'}; line-height:1;">${d.val}</div>

                                                </div>

                                                <div style="font-size:8px; font-weight:800; color:${d.color}; line-height:1.2;">

                                                    <i class="fas fa-chart-line"></i> +${trendVal} este mes

                                                </div>

                                            </div>

                                        </div>

                                    `

                                };

                            });

                        polygonSeries.data.setAll(rows);



                        polygonSeries.mapPolygons.template.adapters.add('fill', (fill, target) => {

                            const d = target.dataItem?.dataContext;

                            return d && d._fill ? am5.color(d._fill) : fill;

                        });



                        polygonSeries.mapPolygons.template.adapters.add('tooltipHTML', (html, target) => {

                            const d = target.dataItem?.dataContext;

                            if (d && d._tooltip) return d._tooltip;

                            const iso = target.dataItem?.get('id');

                            const code = ISO_TO_CODE[iso] || iso;

                            const name = (window.paisMap && window.paisMap[code]) || iso || '';

                            const flagCode = (countryFlagMap[code] || code).toLowerCase();

                            return `

                                <div style="font-family: Montserrat, sans-serif; padding: 10px; min-width: 140px; text-align: left; color: #64748b;">

                                    <div style="display:flex; align-items:center; gap:8px;">

                                        <img src="https://flagcdn.com/w40/${flagCode}.png" style="width:16px; border-radius:2px; box-shadow:0 1px 2px rgba(0,0,0,0.1);">

                                        <div>

                                            <div style="font-size:10px; font-weight:800; color:${isDark ? '#94a3b8' : '#475569'};">${name}</div>

                                            <div style="font-size:8px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-top:1px;">Sin operación</div>

                                        </div>

                                    </div>

                                </div>

                            `;

                        });



                        polygonSeries.mapPolygons.template.events.on('click', (ev) => {

                            const iso = ev.target.dataItem?.get('id');

                            const code = ISO_TO_CODE[iso];

                            if (code && typeof toggleCountry === 'function') toggleCountry(code);

                        });



                        chart.goHome(0);

                        if (onDone) onDone(true);

                    } catch(err) {

                        console.error('[MAP] amCharts error:', err);

                        if (onDone) onDone(false);

                    }

                });

            }

            window.renderAmChartsMap = renderAmChartsMap;



/* ===== audit.js ===== */
﻿// Audit dashboard logic extracted from the main HTML.

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
                                    el.style.background = (t===tab) ? cfg.color : 'transparent';
                                    el.style.color      = (t===tab) ? '#fff'   : cfg.color;
                                    el.style.border     = `1.5px solid ${cfg.color}`;
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

                                              <div class="audit-balance-grid">
                                                <div class="audit-balance-card danger">
                                                  <div class="audit-balance-head"><span>Faltan / desaparecen</span><strong>${c.missing}</strong></div>
                                                  <div class="audit-bar"><i style="width:${Math.round((c.missing / maxIssue) * 100)}%;"></i></div>
                                                  <p>${c.disappearedNoBaja} sin baja encontrada y ${c.bajaFueraPuente || 0} con baja fuera del puente.</p>
                                                </div>
                                                <div class="audit-balance-card warn">
                                                  <div class="audit-balance-head"><span>Sobran / siguen activos</span><strong>${c.extra}</strong></div>
                                                  <div class="audit-bar"><i style="width:${Math.round((c.extra / maxIssue) * 100)}%;"></i></div>
                                                  <p>${c.bajaStillActive} tienen baja, pero siguen dentro del HC neto.</p>
                                                </div>
                                              </div>

                                              <div id="auditPeopleIssues" class="audit-issue-grid">
                                                <div class="audit-issue-panel">
                                                  <div class="audit-panel-title"><span>Personas que faltan</span><b>${missingList.length}</b></div>
                                                  <div class="audit-people-list">${rowHtml(missingList)}</div>
                                                </div>
                                                <div class="audit-issue-panel">
                                                  <div class="audit-panel-title"><span>Personas que sobran</span><b>${extraList.length}</b></div>
                                                  <div class="audit-people-list">${rowHtml(extraList)}</div>
                                                </div>
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



/* ===== hc-controls.js ===== */
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


/* ===== render-core.js ===== */
// Core render coordinator extracted from the main HTML.

var cachedEmps = null, lastFilterKey = "";
            var dashRenderTimeout = null;

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


/* ===== costs.js ===== */
// Cost dashboard helpers and renderer extracted from the main HTML.

// Ayudantes de degradados lineales para Chart.js
function getVGrad(ctxEl, colorStart, colorEnd, height = 180) {
    if (!ctxEl) return colorStart;
    try {
        const c2d = ctxEl.getContext('2d');
        const grad = c2d.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        return grad;
    } catch(e) {
        return colorStart;
    }
}

function getHGrad(ctxEl, colorStart, colorEnd, width = 300) {
    if (!ctxEl) return colorStart;
    try {
        const c2d = ctxEl.getContext('2d');
        const grad = c2d.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(1, colorEnd);
        return grad;
    } catch(e) {
        return colorStart;
    }
}

function getCurrency() {
                const cMap = (typeof window.currencyMap !== 'undefined' ? window.currencyMap : (typeof currencyMap !== 'undefined' ? currencyMap : {}));
                const multi = window._selectedMS;
                if (multi && multi.msPa && multi.msPa.length === 1) return cMap[multi.msPa[0]] || '';
                return '';
            }
            

            function fmtMoney(val) {
                if (val === undefined || val === null || isNaN(val)) return '-';
                const c = window.useUSD ? '$' : (window.localCurrency || 'Q');
                const symbol = c ? c + '\u00A0' : '';
                return symbol + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            var fM = fmtMoney;

            // Global Conversion Helper for Costs (Robust & Optimized)
            window._tcCache = null; // Memory cache to avoid 10,000+ JSON.parse calls
            function getC(val, xr, showUSD, pa) {
                const v = parseFloat(val) || 0;
                if (!showUSD || v === 0) return v;

                if (!window._tcCache) {
                    try {
                        window._tcCache = JSON.parse(localStorage.getItem('asys_tc_map_v2') || '{}');
                    } catch(e) { window._tcCache = {}; }
                }
                const savedTC = window._tcCache;
                
                if (!window._currentFilters) window._currentFilters = getFilters();
                const f = window._currentFilters;
                const y = f.y !== 'ALL' ? f.y : 2026;
                const m = f.m !== 'ALL' ? f.m : 3;
                
                const userTC = savedTC[`${pa}|${y}|${m}`] || savedTC[`${pa}| ${y}| ${m} `];

                if (userTC && !isNaN(userTC) && userTC > 0) {
                    return v / parseFloat(userTC);
                }

                // Priority 2: Hardcoded Defaults (if no TC provided in data)
                if (pa === 'GT') return v / 7.66476;
                let r = (typeof xr === 'number') ? xr : parseFloat(xr);
                if (isNaN(r) || (typeof xr === 'string' && xr.indexOf('.', xr.indexOf('.') + 1) !== -1)) {
                    const parts = String(xr || "").split('.');
                    r = parseFloat(parts[0] + '.' + (parts[1] || '0'));
                }

                if (!r || r <= 1.1 || isNaN(r)) {
                    if (pa === 'CR') r = 600.0;
                    else if (pa === 'HN') r = 25.25;
                    else if (pa === 'SV' || pa === 'PA' || pa === 'PN' || pa === 'DM') r = 1.0;
                    else if (pa === 'PY') r = 7500.0;
                    else if (pa === 'TT' || pa === 'TYT' || pa === 'NI' || pa === 'NIC') r = (pa==='TT'?500:pa==='NI'?36:600);
                    else r = 1.0;
                }
                return v / r;
            }

            function costShort(v, currency) {
                const n = Number(v) || 0;
                const abs = Math.abs(n);
                const sym = currency ? currency + ' ' : '';
                if (abs >= 1000000) return sym + (n / 1000000).toFixed(2) + 'M';
                if (abs >= 1000) return sym + (n / 1000).toFixed(1) + 'K';
                return sym + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
            }

            function costFull(v, currency) {
                const sym = currency ? currency + ' ' : '';
                return sym + (Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            
function costAxisLabel(label, maxLen = 24) {
    const raw = String(label || 'N/A').trim();
    if (raw.length <= maxLen) return raw;
    const words = raw.split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(word => {
        if ((line + ' ' + word).trim().length > maxLen && line) {
            lines.push(line);
            line = word;
        } else {
            line = (line + ' ' + word).trim();
        }
    });
    if (line) lines.push(line);
    return lines.slice(0, 2).join(' ');
}

function costTotal(e, showUSD, includeVac = true, includeInd = true) {
                const gross = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                const prov = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (includeVac ? (Number(e.p_vac)||0) : 0) + (includeInd ? (Number(e.p_ind)||0) : 0);
                const patronal = Number(e.p_pat) || 0;
                return getC(gross + prov + patronal, e.xr, showUSD, e.pa);
            }

            function costValueLabelOptions(currency, extra = {}) {
                return {
                    display: ctx => (ctx.dataset.data[ctx.dataIndex] || 0) > 0,
                    anchor: extra.anchor || 'end',
                    align: extra.align || 'top',
                    offset: extra.offset ?? 4,
                    clamp: true,
                    clip: false,
                    color: extra.color || '#334155',
                    backgroundColor: extra.backgroundColor || 'rgba(255,255,255,0.92)',
                    borderColor: extra.borderColor || 'rgba(148, 163, 184, 0.22)',
                    borderWidth: extra.borderWidth ?? 1,
                    borderRadius: extra.borderRadius ?? 7,
                    padding: extra.padding ?? { top: 3, right: 5, bottom: 3, left: 5 },
                    font: extra.font || { family: 'Montserrat', size: 10, weight: '900' },
                    formatter: (v, ctx) => {
                        if (!v || v <= 0) return null;
                        const label = extra.preferCategory
                            ? (ctx.chart?.data?.labels?.[ctx.dataIndex] || ctx.dataset.label || '')
                            : (ctx.dataset.label || ctx.chart?.data?.labels?.[ctx.dataIndex] || '');
                        return `${label}: ${costShort(v, currency)}`;
                    }
                };
            }

            function costGroup(rows, keyFn, valueFn) {
                const out = {};
                rows.forEach(r => {
                    const key = keyFn(r) || 'N/A';
                    out[key] = (out[key] || 0) + valueFn(r);
                });
                return Object.entries(out).sort((a, b) => b[1] - a[1]);
            }

            function costChartBase(currency) {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { 
                                color: '#334155', 
                                font: { family: 'Montserrat', size: 11, weight: '600' }, 
                                boxWidth: 8, 
                                usePointStyle: true 
                            } 
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)', // Vidrio oscuro premium
                            titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                            bodyFont: { family: 'Montserrat', size: 12 },
                            padding: 10,
                            cornerRadius: 8,
                            displayColors: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            boxPadding: 4,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: { 
                                label: ctx => ` ${ctx.dataset.label || ctx.label}: ${costFull(ctx.raw, currency)}` 
                            }
                        },
                        datalabels: costValueLabelOptions(currency)
                    },
                    scales: {
                        x: { 
                            grid: { display: false }, 
                            ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' } } 
                        },
                        y: { 
                            grid: { color: 'rgba(148, 163, 184, 0.08)' }, // Cuadrícula muy sutil y limpia
                            ticks: { 
                                color: '#64748b', 
                                font: { family: 'Montserrat', size: 10, weight: '600' }, 
                                callback: v => costShort(v, currency) 
                            } 
                        }
                    }
                };
            }

function renderCostos(s, emps) {
                const pane = document.getElementById('costosView');
                if (!pane) { console.error('R costosView element missing'); return; }

                // 1. Initial State & Filters
                window.activeCharts = Array.isArray(window.activeCharts) ? window.activeCharts : [];
                window.activeCharts.forEach(c => { if (c && typeof c.destroy === 'function') { try { c.destroy(); } catch(e) {} } });
                window.activeCharts = [];
                const { p: pais, e: emp, a: area, d: depto, y: yr, m: mo, countries } = getFilters();
                const showUSD = window.useUSD || false;
                const currency = showUSD ? '$' : getCurrency();
                const fM = (v) => (currency ? currency + ' ' : '') + (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const fShort = (v) => costShort(v, currency);
                const costBarEndLabelPlugin = {
                    id: 'costBarEndLabelPlugin',
                    afterDatasetsDraw(chart) {
                        const { ctx, chartArea } = chart;
                        const labels = chart.data.labels || [];
                        const datasets = chart.data.datasets || [];
                        const isHorizontal = chart.options.indexAxis === 'y';
                        ctx.save();
                        ctx.font = '900 11px Montserrat, sans-serif';
                        ctx.textBaseline = 'middle';
                        labels.forEach((label, dataIndex) => {
                            const total = datasets.reduce((sum, ds) => {
                                if (ds.type === 'line') return sum;
                                return sum + (Number(ds.data?.[dataIndex]) || 0);
                            }, 0);
                            if (!total) return;
                            let lastPoint = null;
                            for (let i = datasets.length - 1; i >= 0; i--) {
                                const meta = chart.getDatasetMeta(i);
                                const point = meta?.data?.[dataIndex];
                                if (!meta?.hidden && point) { lastPoint = point; break; }
                            }
                            if (!lastPoint) return;
                            const text = `${label}: ${fShort(total)}`;
                            const width = ctx.measureText(text).width + 12;
                            const x = isHorizontal ? Math.min(lastPoint.x + 10, chartArea.right - width) : Math.max(chartArea.left, Math.min(lastPoint.x - (width / 2), chartArea.right - width));
                            const y = isHorizontal ? lastPoint.y : Math.max(chartArea.top + 11, lastPoint.y - 14);
                            ctx.fillStyle = 'rgba(255,255,255,0.96)';
                            ctx.strokeStyle = 'rgba(148,163,184,0.35)';
                            ctx.lineWidth = 1;
                            if (ctx.roundRect) {
                                ctx.beginPath();
                                ctx.roundRect(x - 6, y - 11, width, 22, 7);
                                ctx.fill();
                                ctx.stroke();
                            }
                            ctx.fillStyle = '#0f172a';
                            ctx.fillText(text, x, y);
                        });
                        ctx.restore();
                    }
                };
                const costDonutOuterLabelPlugin = {
                    id: 'costDonutOuterLabelPlugin',
                    afterDatasetsDraw(chart) {
                        const meta = chart.getDatasetMeta(0);
                        if (!meta?.data?.length) return;
                        const { ctx, chartArea } = chart;
                        const values = chart.data.datasets?.[0]?.data || [];
                        const labels = chart.data.labels || [];
                        ctx.save();
                        ctx.font = '900 11px Montserrat, sans-serif';
                        ctx.textBaseline = 'middle';
                        meta.data.forEach((arc, i) => {
                            const val = Number(values[i]) || 0;
                            if (!val) return;
                            const angle = (arc.startAngle + arc.endAngle) / 2;
                            const sx = arc.x + Math.cos(angle) * (arc.outerRadius + 4);
                            const sy = arc.y + Math.sin(angle) * (arc.outerRadius + 4);
                            const mx = arc.x + Math.cos(angle) * (arc.outerRadius + 22);
                            const my = arc.y + Math.sin(angle) * (arc.outerRadius + 22);
                            const rightSide = Math.cos(angle) >= 0;
                            const ex = rightSide ? Math.min(chartArea.right + 118, mx + 72) : Math.max(chartArea.left - 118, mx - 72);
                            const text = `${labels[i]}: ${fShort(val)}`;
                            ctx.strokeStyle = arc.options.backgroundColor || '#64748b';
                            ctx.fillStyle = ctx.strokeStyle;
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(sx, sy);
                            ctx.lineTo(mx, my);
                            ctx.lineTo(ex, my);
                            ctx.stroke();
                            ctx.textAlign = rightSide ? 'left' : 'right';
                            ctx.fillStyle = '#0f172a';
                            ctx.fillText(text, rightSide ? ex + 5 : ex - 5, my);
                        });
                        ctx.restore();
                    }
                };
                const costLegendWithValues = (labelsColor = '#334155') => ({
                    position: 'right',
                    labels: {
                        color: labelsColor,
                        font: { family: 'Montserrat', size: 10, weight: '800' },
                        usePointStyle: true,
                        generateLabels(chart) {
                            const base = Chart.overrides.doughnut.plugins.legend.labels.generateLabels(chart);
                            const values = chart.data.datasets?.[0]?.data || [];
                            return base.map(item => ({
                                ...item,
                                text: `${item.text}: ${fShort(values[item.index] || 0)}`
                            }));
                        }
                    }
                });

                // 2. Filter Logic First
                let filtered = emps;
                if (window.costSearch) {
                    const sVal = window.costSearch.toLowerCase();
                    filtered = emps.filter(e =>
                        (e.n || '').toLowerCase().includes(sVal) ||
                        (e.p || '').toLowerCase().includes(sVal) ||
                        (e.c || '').toLowerCase().includes(sVal)
                    );
                }

                // Core Totals  -  10 exact cost columns from the data
                const tSO = filtered.reduce((a, b) => a + getC(b.so, b.xr, showUSD, b.pa), 0);
                const tB37 = filtered.reduce((a, b) => a + getC(b.b37, b.xr, showUSD, b.pa), 0);
                const tB78 = filtered.reduce((a, b) => a + getC(b.b78, b.xr, showUSD, b.pa), 0);
                const tVar = filtered.reduce((a, b) => a + getC(b.bv, b.xr, showUSD, b.pa), 0);
                const tHE = filtered.reduce((a, b) => a + getC(b.he, b.xr, showUSD, b.pa), 0);
                const tAgui = filtered.reduce((a, b) => a + getC(b.p_agui, b.xr, showUSD, b.pa), 0);
                const tB14 = filtered.reduce((a, b) => a + getC(b.p_b14, b.xr, showUSD, b.pa), 0);
                const tVac = filtered.reduce((a, b) => a + getC(b.p_vac, b.xr, showUSD, b.pa), 0);
                const tInd = filtered.reduce((a, b) => a + getC(b.p_ind, b.xr, showUSD, b.pa), 0);
                const tPat = filtered.reduce((a, b) => a + getC(b.p_pat, b.xr, showUSD, b.pa), 0);

                const tGross = tSO + tB37 + tB78 + tVar + tHE;
                const tProv = tAgui + tB14 + (window.inclVac !== false ? tVac : 0) + (window.inclInd !== false ? tInd : 0);
                const tTotalCurrent = tGross + tPat + tProv;

                // YoY Calculation (Same period previous year)
                let tTotalPrev = 0;
                if (yr !== 'ALL') {
                    const prevY = parseInt(yr) - 1;
                    const prevEmps = app.employees.filter(e => {
                        const cp = normalizePa(e.pa);
                        return (countries.length === 0 || countries.includes(cp)) && (emp === 'ALL' || e.e === emp) && (area === 'ALL' || e.dir === area) && (depto === 'ALL' || e.d === depto) && (e.y == prevY) && compareMonth(e.m, mo);
                    });
                    const pSO = prevEmps.reduce((a, b) => a + getC(b.so, b.xr, showUSD, b.pa), 0);
                    const pB37 = prevEmps.reduce((a, b) => a + getC(b.b37, b.xr, showUSD, b.pa), 0);
                    const pB78 = prevEmps.reduce((a, b) => a + getC(b.b78, b.xr, showUSD, b.pa), 0);
                    const pVar = prevEmps.reduce((a, b) => a + getC(b.bv, b.xr, showUSD, b.pa), 0);
                    const pHE = prevEmps.reduce((a, b) => a + getC(b.he, b.xr, showUSD, b.pa), 0);
                    const pAgui = prevEmps.reduce((a, b) => a + getC(b.p_agui, b.xr, showUSD, b.pa), 0);
                    const pB14 = prevEmps.reduce((a, b) => a + getC(b.p_b14, b.xr, showUSD, b.pa), 0);
                    const pVac = prevEmps.reduce((a, b) => a + getC(b.p_vac, b.xr, showUSD, b.pa), 0);
                    const pInd = prevEmps.reduce((a, b) => a + getC(b.p_ind, b.xr, showUSD, b.pa), 0);
                    const pPat = prevEmps.reduce((a, b) => a + getC(b.p_pat, b.xr, showUSD, b.pa), 0);
                    const pProv = pAgui + pB14 + (window.inclVac !== false ? pVac : 0) + (window.inclInd !== false ? pInd : 0);
                    tTotalPrev = pSO + pB37 + pB78 + pVar + pHE + pPat + pProv;
                }
                const yoyDiff = tTotalPrev > 0 ? ((tTotalCurrent - tTotalPrev) / tTotalPrev) * 100 : 0;
                const yoyText = yr === 'ALL' ? 'N/A' : (tTotalPrev > 0 ? `${yoyDiff.toFixed(1)}% vs año Ant.` : 'Sin histórico');


                // 3. Robust Trend Logic (Variable & Average Cost p/Head)
                const fullMonthsList = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                if (window._costViewLength === undefined) window._costViewLength = window.showFullYearTrend ? 12 : 6;
                const spanMonths = window._costViewLength || 6;
                window.showFullYearTrend = spanMonths >= 12;
                let anchorYear = yr !== 'ALL' ? parseInt(yr) : new Date().getFullYear();
                let anchorMonth = mo !== 'ALL' ? parseInt(mo) : new Date().getMonth() + 1;

                const trendSlots = [];
                for (let i = spanMonths - 1; i >= 0; i--) {
                    let m2 = anchorMonth - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    trendSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + ' ' + String(y2).slice(-2) });
                }

                const varTrend = new Array(spanMonths).fill(0);
                const costTrendForAvg = new Array(spanMonths).fill(0);
                const supportTrend = new Array(spanMonths).fill(0);
                const hcTrendForAvg = new Array(spanMonths).fill(0);

                app.employees.forEach(e => {
                    const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                    if (!matchPa || (emp !== 'ALL' && e.e !== emp) || (area !== 'ALL' && e.dir !== area) || (depto !== 'ALL' && e.d !== depto)) return;
                    for (let idx = 0; idx < spanMonths; idx++) {
                        if (e.y == trendSlots[idx].y && compareMonth(e.m, trendSlots[idx].m)) {
                            varTrend[idx] += getC(e.bv, e.xr, showUSD, e.pa);
                            const b = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                            const p = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_pat)||0);
                            const x = (window.inclVac !== false ? (Number(e.p_vac)||0) : 0) + (window.inclInd !== false ? (Number(e.p_ind)||0) : 0);
                            costTrendForAvg[idx] += getC(b + p + x, e.xr, showUSD, e.pa);
                            supportTrend[idx] += getC(p + x, e.xr, showUSD, e.pa);
                            hcTrendForAvg[idx]++;
                        }
                    }
                });
                const priorTrendSlots = [];
                for (let i = spanMonths - 1; i >= 0; i--) {
                    let m2 = anchorMonth - spanMonths - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    priorTrendSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + ' ' + String(y2).slice(-2) });
                }
                const priorVarTrend = new Array(spanMonths).fill(0);
                const priorCostTrend = new Array(spanMonths).fill(0);
                const priorSupportTrend = new Array(spanMonths).fill(0);
                const priorHcTrend = new Array(spanMonths).fill(0);
                app.employees.forEach(e => {
                    const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                    if (!matchPa || (emp !== 'ALL' && e.e !== emp) || (area !== 'ALL' && e.dir !== area) || (depto !== 'ALL' && e.d !== depto)) return;
                    for (let idx = 0; idx < spanMonths; idx++) {
                        if (e.y == priorTrendSlots[idx].y && compareMonth(e.m, priorTrendSlots[idx].m)) {
                            priorVarTrend[idx] += getC(e.bv, e.xr, showUSD, e.pa);
                            const b = (Number(e.so)||0) + (Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0);
                            const p = (Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_pat)||0);
                            const x = (window.inclVac !== false ? (Number(e.p_vac)||0) : 0) + (window.inclInd !== false ? (Number(e.p_ind)||0) : 0);
                            priorCostTrend[idx] += getC(b + p + x, e.xr, showUSD, e.pa);
                            priorSupportTrend[idx] += getC(p + x, e.xr, showUSD, e.pa);
                            priorHcTrend[idx]++;
                        }
                    }
                });
                const finalCostPerEmp = costTrendForAvg.map((c, i) => hcTrendForAvg[i] > 0 ? c / hcTrendForAvg[i] : 0);
                const priorCostPerEmp = priorCostTrend.map((c, i) => priorHcTrend[i] > 0 ? c / priorHcTrend[i] : 0);
                const trendLabels = trendSlots.map(s => s.label);
                const priorTrendLabels = priorTrendSlots.map(s => s.label);
                const avgCost = costTrendForAvg.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const avgVar = varTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const avgSupport = supportTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const priorAvgCost = priorCostTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const priorAvgVar = priorVarTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);
                const priorAvgSupport = priorSupportTrend.reduce((a,b)=>a+b,0) / (spanMonths || 1);

                // Annual Trend for Comparison (9th Chart)
                const twelveSlots = [];
                for (let i = 11; i >= 0; i--) {
                    let m2 = anchorMonth - i; let y2 = anchorYear;
                    while (m2 <= 0) { m2 += 12; y2--; }
                    twelveSlots.push({ y: y2, m: m2, label: fullMonthsList[m2 - 1] + "'" + String(y2).slice(-2) });
                }
                const annualTrendData = Array(12).fill(0);
                app.employees.forEach(e => {
                    if ((pais === 'ALL' || e.pa === pais) && (emp === 'ALL' || e.e === emp)) {
                        for (let i = 0; i < 12; i++) {
                            if (e.y == twelveSlots[i].y && compareMonth(e.m, twelveSlots[i].m)) {
                                const b = (Number(e.so)||0) + (Number(e.bv)||0) + (Number(e.p_pat)||0);
                                annualTrendData[i] += getC(b, e.xr, showUSD, e.pa);
                            }
                        }
                    }
                });

                // Update Header and HTML Structure
                const needsFullRender = !pane.querySelector('#tbodyCostos') || !pane.querySelector('#chartVarTrend') || !pane.querySelector('#chartAnnualCost') || pane.dataset.usdMode !== String(!!showUSD);
                if (needsFullRender) {
                    const pText = (mo === 'ALL' || !mo) ? `año ${yr}` : `${fullMonthsList[mo - 1]} ${yr}`;
                    pane.innerHTML = `
                        <div class="cost-hero-panel">
                            <div>
                                <h2><i class="fas fa-sack-dollar"></i> ANÁLISIS DE COSTOS | ${yr === 'ALL' ? 'TODOS' : yr}</h2>
                                <p>Análisis ${pText}: nómina base, variables, provisiones y cargas patronales</p>
                            </div>
                            <div class="cost-hero-actions">
                                <div id="currentTCDisp" class="cost-pill-stat">${showUSD ? 'USD activo' : 'Moneda local'}</div>
                                <div class="cost-currency-toggle">
                                    <button id="btnCostLocal" class="${!showUSD ? 'active' : ''}" onclick="window.useUSD=false; renderAll();">LOCAL</button>
                                    <button id="btnCostUSD" class="${showUSD ? 'active' : ''}" onclick="window.useUSD=true; renderAll();">USD ($)</button>
                                </div>
                            </div>
                        </div>

                        <div id="kpiCosts" class="kpi-row cost-kpi-grid"></div>

                        <div class="cost-history-panel">
                            <div class="cost-history-copy">
                                <h3><i class="fas fa-chart-line"></i> COSTOS HISTORICO</h3>
                                <p>Tendencia mensual de nomina, variables y cargas</p>
                            </div>
                            <div class="cost-history-controls">
                                <button id="btnCost6m" onclick="window._costViewLength=6; renderAll();">6 MESES</button>
                                <button id="btnCost12m" onclick="window._costViewLength=12; renderAll();">12 MESES</button>
                                <button id="btnCost1y" onclick="window._costViewLength=12; renderAll();">1 ANO</button>
                            </div>
                            <div class="cost-history-series">
                                <div class="cost-history-label">ACTUAL:</div>
                                <div><span class="cost-dot cost-dot-total"></span>TOTAL</div>
                                <div><span class="cost-dot cost-dot-var"></span>VARIABLES</div>
                                <div><span class="cost-dot cost-dot-support"></span>CARGAS</div>
                                <button onclick="window._costViewLength=6; window.inclVac=true; window.inclInd=true; renderAll();"><i class="fas fa-filter-circle-xmark"></i> LIMPIAR FILTROS</button>
                                <div class="cost-history-label cost-history-prev">ANTERIOR:</div>
                                <div><span class="cost-dot cost-dot-total prev"></span>TOTAL</div>
                                <div><span class="cost-dot cost-dot-var prev"></span>VARIABLES</div>
                                <div><span class="cost-dot cost-dot-support prev"></span>CARGAS</div>
                            </div>
                            <div id="costComparisonGrid" class="cost-comparison-grid"></div>
                        </div>

                        <div class="cost-control-strip">
                            <label>
                                <input type="checkbox" ${window.inclVac !== false ? 'checked' : ''} onchange="window.inclVac=this.checked; renderAll();">
                                <span>Incluir vacaciones</span>
                            </label>
                            <label>
                                <input type="checkbox" ${window.inclInd !== false ? 'checked' : ''} onchange="window.inclInd=this.checked; renderAll();">
                                <span>Incluir indemnización</span>
                            </label>
                        </div>

                        <div class="cost-grid-split">
                            <div class="card-box cost-chart-card cost-panel-dark">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-layer-group"></i> Costos por región y país</h3>
                                        <p>Comparativo por país de salario base, variables y cargas.</p>
                                    </div>
                                    <div id="costRegionTotalBadge" class="cost-pill-stat"></div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartRegStacked"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card cost-panel-dark">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-chart-pie"></i> Distribución de rubros</h3>
                                        <p>Participación de salario, variables, patronales y provisiones.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostBreakdownDonut"></canvas></div>
                            </div>
                        </div>

                        <div class="cost-grid-split">
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-chart-line"></i> Tendencia del costo de nómina</h3>
                                        <p>Evolución mensual consolidada del costo total.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartPayrollTrend"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head">
                                    <div>
                                        <h3><i class="fas fa-compass"></i> Mix por dirección</h3>
                                        <p>Concentración del gasto según la dirección operativa.</p>
                                    </div>
                                </div>
                                <div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDirDonut"></canvas></div>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card">
                            <div class="cost-card-head">
                                <div>
                                    <h3><i class="fas fa-bolt"></i> Tendencia de bono variable</h3>
                                    <p>Evolución de pagos variables y extraordinarios contra promedio.</p>
                                </div>
                            </div>
                            <div class="cost-chart-stage cost-chart-stage-xl"><canvas id="chartVarTrend"></canvas></div>
                        </div>

                        <div id="costVariableInsights" class="cost-grid-split cost-grid-split-tight">
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head"><div><h3><i class="fa-solid fa-trophy"></i> Quién comisiona más</h3><p>Ranking de personas con mayor variable en el filtro actual.</p></div></div>
                                <div class="cost-chart-stage cost-chart-stage-lg"><canvas id="chartTopVariablePeople"></canvas></div>
                            </div>
                            <div class="card-box cost-chart-card">
                                <div class="cost-card-head"><div><h3><i class="fa-solid fa-compass"></i> Mapa de presión variable</h3><p>Relación del variable sobre costo total y concentración por área.</p></div></div>
                                <div id="costWowSummary" class="cost-wow-summary"></div>
                                <div class="cost-chart-stage cost-chart-stage-sm"><canvas id="chartVariableEfficiency"></canvas></div>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card">
                            <div class="cost-card-head"><div><h3><i class="fas fa-users"></i> Costo promedio mensual por colaborador</h3><p>Costo mensual promedio para sostener el headcount del periodo seleccionado.</p></div></div>
                            <div class="cost-chart-stage cost-chart-stage-lg"><canvas id="chartCostPerEmp"></canvas></div>
                        </div>

                        <div class="cost-grid-duo">
                            <div class="card-box cost-chart-card"><div class="cost-card-head"><div><h3><i class="fas fa-building"></i> Top 10 direcciones</h3><p>Direcciones con mayor participación en el costo total del periodo.</p></div></div><div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDir"></canvas></div></div>
                            <div class="card-box cost-chart-card"><div class="cost-card-head"><div><h3><i class="fas fa-diagram-project"></i> Top 10 departamentos</h3><p>Departamentos con mayor costo integrado: salario, variable y cargas patronales.</p></div></div><div class="cost-chart-stage cost-chart-stage-md"><canvas id="chartCostDepto"></canvas></div></div>
                        </div>

                        <div class="card-box cost-chart-card cost-wide-card" style="background:#f8fafc;">
                            <div class="cost-card-head"><div><h3><i class="fas fa-chart-area"></i> Evolución mensual 12 meses</h3><p>Tendencia consolidada de los últimos 12 meses para identificar presión de costos y estacionalidad.</p></div></div>
                            <div class="cost-chart-stage cost-chart-stage-sm"><canvas id="chartAnnualCost"></canvas></div>
                        </div>

                        <div id="kpiCostPerCountry" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:14px; margin-bottom:25px;"></div>

                        <div class="card-box cost-simulator-card">
                            <div class="card-title" style="margin-bottom: 20px;">
                                <h3 style="color:#fff; font-size: 18px;"><i class="fas fa-calculator" style="color:var(--ac); margin-right: 10px;"></i> Simulador de Impacto Financiero</h3>
                            </div>
                            <div class="cost-simulator-grid">
                                <div><label style="font-size:11px; font-weight:700;">Ajuste Salarial (%)</label><input type="range" id="simSalary" min="-20" max="50" value="0" step="1" oninput="updateSimulation()" style="width:100%;"><div id="valSimSalary" style="font-weight:900;">0%</div></div>
                                <div><label style="font-size:11px; font-weight:700;">Ajuste Bonos (%)</label><input type="range" id="simBono" min="-50" max="100" value="0" step="5" oninput="updateSimulation()" style="width:100%;"><div id="valSimBono" style="font-weight:900;">0%</div></div>
                                <div><label style="font-size:11px; font-weight:700;">Reducción rotación (%)</label><input type="range" id="simRot" min="-100" max="0" value="0" step="5" oninput="updateSimulation()" style="width:100%;"><div id="valSimRot" style="font-weight:900;">0%</div></div>
                            </div>
                            <div class="cost-simulator-result">
                                <div id="labelSimImpact" style="font-size:28px; font-weight:1000; color:#10b981; font-family:'Montserrat';">+ 0.00</div>
                                <button onclick="resetSim()" class="btn-top" style="background:rgba(255,255,255,0.1); border:none; color:#fff; padding:10px 20px; border-radius:10px; cursor:pointer;">RESETEAR</button>
                            </div>
                        </div>

                        <div class="card-box cost-chart-card">
                            <div class="cost-card-head cost-table-head">
                                <div><h3><i class="fas fa-table"></i> Detalle de colaboradores</h3><p>Desglose financiero pormenorizado por persona.</p></div>
                                <div class="cost-toolbar-right">
                                    <input type="text" id="costSearch" class="cost-search-input" placeholder="Buscar colaborador..." oninput="applyCostSearch(this.value)" value="${window.costSearch || ''}">
                                    <button onclick="exportData()" class="btn-top cost-export-btn"><i class="fas fa-file-excel"></i> Exportar Excel</button>
                                </div>
                            </div>
                            <div id="costLimitMsg" class="cost-limit-msg"></div>
                            <div class="table-wrap cost-table-wrap"><table id="costTable" class="cost-detail-table"><thead><tr><th>CÓDIGO</th><th>NOMBRE</th><th>PUESTO</th><th>ÁREA</th><th class="num total">TOTAL 10 COLS</th><th class="num">SALARIO</th><th class="num">BONO 37</th><th class="num">BONO 78</th><th class="num">VARIABLES</th><th class="num">HORAS EXTRA</th><th class="num">AGUINALDO</th><th class="num">BONO 14</th><th class="num">VACACIONES</th><th class="num">INDEMN.</th><th class="num">CUOTAS PAT.</th></tr></thead><tbody id="tbodyCostos"></tbody></table></div>
                        </div>
                    `;
                    pane.dataset.usdMode = String(!!showUSD);
                }
                // 4. Update Header and KPIs
                const subTitle = pane.querySelector('.cost-hero-panel p');
                if (subTitle) {
                    const pText = (mo === 'ALL' || !mo) ? `año ${yr}` : `${fullMonthsList[mo - 1]} ${yr}`;
                    subTitle.innerText = `Análisis ${pText}: nómina base, variables, provisiones y cargas patronales`;
                    const heroTitle = pane.querySelector('.cost-hero-panel h2');
                    if (heroTitle) heroTitle.innerHTML = `<i class="fas fa-sack-dollar"></i> ANÁLISIS DE COSTOS | ${yr === 'ALL' ? 'TODOS' : yr}`;
                }

                document.getElementById('kpiCosts').innerHTML = `
                    ${kpiCard("Gasto Total", fM(tTotalCurrent), '<i class="fa-solid fa-money-bill-trend-up"></i>', "#0f172a", "sub", yoyText, "", null, "", "Suma de todas las columnas")}
                    ${kpiCard("Salarios Base", fM(tSO), '<i class="fa-solid fa-receipt"></i>', "#8b5cf6", "sub", "", "", null, "", "Suma de Salario Base")}
                    ${kpiCard("Variables", fM(tVar), '<i class="fa-solid fa-bolt"></i>', "#ec4899", "sub", "", "", null, "", "Suma de Bonos Variables")}
                    ${kpiCard("Patronales", fM(tPat), '<i class="fa-solid fa-building-columns"></i>', "#10b981", "sub", "", "", null, "", "Suma Carga Patronal")}
                    ${kpiCard("Provisiones", fM(tProv), '<i class="fa-solid fa-vault"></i>', "#f59e0b", "sub", "", "", null, "", "Suma Prestaciones + Provisiones")}
                `;
                ['btnCost6m','btnCost12m','btnCost1y'].forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) btn.classList.toggle('active', (id === 'btnCost6m' && spanMonths === 6) || (id !== 'btnCost6m' && spanMonths === 12));
                });
                const costComparisonGrid = document.getElementById('costComparisonGrid');
                if (costComparisonGrid) {
                    const lastCost = costTrendForAvg[costTrendForAvg.length - 1] || 0;
                    const lastVar = varTrend[varTrend.length - 1] || 0;
                    const lastSupport = supportTrend[supportTrend.length - 1] || 0;
                    costComparisonGrid.innerHTML = `
                        <div class="cost-compare-card blue"><span>Costo Promedio</span><b>${fM(avgCost)}</b><small>vs Actual: <strong>${fM(lastCost)}</strong></small></div>
                        <div class="cost-compare-card pink"><span>Prom. Variables</span><b>${fM(avgVar)}</b><small>vs Actual: <strong>${fM(lastVar)}</strong></small></div>
                        <div class="cost-compare-card amber"><span>Prom. Cargas</span><b>${fM(avgSupport)}</b><small>vs Actual: <strong>${fM(lastSupport)}</strong></small></div>
                    `;
                }

                const tbody = document.getElementById('tbodyCostos');
                if (tbody) {
                    const dataLimit = filtered.slice(0, 500);
                    const msgEl = document.getElementById('costLimitMsg');
                    if (msgEl) msgEl.innerHTML = `<i class="fas fa-info-circle"></i> Encontrados: <b>${filtered.length.toLocaleString()}</b>. Mostrando 500 para rendimiento.`;
                    
                    tbody.innerHTML = dataLimit.map(e => {
                        const cv = (v) => getC(v, e.xr, showUSD, e.pa);
                        const rowTotal = cv(e.so) + cv(e.b37) + cv(e.b78) + cv(e.bv) + cv(e.he) + cv(e.p_agui) + cv(e.p_b14) + cv(e.p_vac) + cv(e.p_ind) + cv(e.p_pat);
                        return `<tr>
                            <td>${e.c}</td><td style="font-weight:700;">${e.n}</td><td>${e.p}</td><td>${e.dir}</td>
                            <td style="text-align:right; font-weight:900; color:var(--ac);">${fM(rowTotal)}</td>
                            <td style="text-align:right;">${fM(cv(e.so))}</td><td style="text-align:right;">${fM(cv(e.b37))}</td><td style="text-align:right;">${fM(cv(e.b78))}</td>
                            <td style="text-align:right; font-weight:700; color:#ec4899;">${fM(cv(e.bv))}</td><td style="text-align:right;">${fM(cv(e.he))}</td>
                            <td style="text-align:right; opacity:0.6;">${fM(cv(e.p_agui))}</td><td style="text-align:right; opacity:0.6;">${fM(cv(e.p_b14))}</td>
                            <td style="text-align:right; opacity:0.6;">${fM(cv(e.p_vac))}</td><td style="text-align:right; opacity:0.6;">${fM(cv(e.p_ind))}</td>
                            <td style="text-align:right;">${fM(cv(e.p_pat))}</td>
                        </tr>`;
                    }).join('');
                }

                // 6. Nine Executive Charts (Orchestrated for window.activeCharts tracking)
                const cOpts = costChartBase(currency);
                const tOpts = costChartBase(currency);
                // 1. Chart Stacked Regions
                const ctxReg = document.getElementById('chartRegStacked');
                if (ctxReg) {
                    const regCosts = {};
                    filtered.forEach(e => {
                        const pa = e.pa; if (!regCosts[pa]) regCosts[pa] = { s:0, b:0, c:0, t:0 };
                        const s = getC(e.so, e.xr, showUSD, e.pa);
                        const b = getC((Number(e.b37)||0) + (Number(e.b78)||0) + (Number(e.bv)||0) + (Number(e.he)||0), e.xr, showUSD, e.pa);
                        const c = getC((Number(e.p_agui)||0) + (Number(e.p_b14)||0) + (Number(e.p_vac)||0) + (Number(e.p_ind)||0) + (Number(e.p_pat)||0), e.xr, showUSD, e.pa);
                        regCosts[pa].s += s; regCosts[pa].b += b; regCosts[pa].c += c; regCosts[pa].t += (s+b+c);
                    });
                    const sortedReg = Object.entries(regCosts).sort((a,b) => b[1].t - a[1].t).slice(0, 8);
                    const regionTotal = sortedReg.reduce((sum, r) => sum + r[1].t, 0);
                    const regionBadge = document.getElementById('costRegionTotalBadge');
                    if (regionBadge) regionBadge.innerHTML = `TOTAL <b>${fM(regionTotal)}</b>`;
                    
                    const gradSO = getHGrad(ctxReg, '#6d28d9', '#a78bfa', 520);
                    const gradB = getHGrad(ctxReg, '#0e7490', '#67e8f9', 520);
                    const gradC = getHGrad(ctxReg, '#b45309', '#fcd34d', 520);
                    
                    window.activeCharts.push(new Chart(ctxReg, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels, costBarEndLabelPlugin] : [costBarEndLabelPlugin],
                        data: {
                            labels: sortedReg.map(r => paisMap[r[0]] || r[0]),
                            datasets: [
                                { label: 'Salario Base', data: sortedReg.map(r => r[1].s), backgroundColor: gradSO, borderColor: '#5b21b6', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 },
                                { label: 'Bonos/Extra', data: sortedReg.map(r => r[1].b), backgroundColor: gradB, borderColor: '#155e75', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 },
                                { label: 'Cargas/Prov', data: sortedReg.map(r => r[1].c), backgroundColor: gradC, borderColor: '#92400e', borderWidth: 1, borderSkipped: false, borderRadius: 7, barPercentage: 0.76, categoryPercentage: 0.72 }
                            ]
                        },
                        options: { ...tOpts, indexAxis: 'y', animation: { duration: 800, easing: 'easeOutQuart' }, layout: { padding: { right: 170, left: 6, top: 4, bottom: 2 } }, plugins: { ...tOpts.plugins, legend: { position: 'top', labels: { color: '#1e293b', boxWidth: 11, boxHeight: 11, usePointStyle: true, pointStyle: 'rectRounded', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { ...tOpts.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fM(ctx.raw)}`, footer: items => `Total país: ${fM(items.reduce((sum, item) => sum + (Number(item.parsed.x) || 0), 0))}` } }, datalabels: { display: false } }, scales: { x: { stacked: true, border: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.10)', drawTicks: false }, ticks: { color: '#475569', padding: 8, font: { family: 'Montserrat', size: 10, weight: '800' }, callback: v => costShort(v, currency) } }, y: { stacked: true, border: { display: false }, grid: { display:false }, ticks: { color: '#1e293b', padding: 10, font: { family: 'Montserrat', size: 11, weight: '900' } } } } }
                    }));
                }

                // 2. Breakdown Donut
                const ctxBD = document.getElementById('chartCostBreakdownDonut');
                if (ctxBD) {
                    window.activeCharts.push(new Chart(ctxBD, {
                        type: 'doughnut',
                        plugins: window.ChartDataLabels ? [ChartDataLabels, costDonutOuterLabelPlugin] : [costDonutOuterLabelPlugin],
                        data: {
                            labels: ['Salarios', 'Variables', 'Patronales', 'Aguinaldo/B14', 'Vacaciones/Ind'],
                            datasets: [{
                                data: [tSO, tVar, tPat, (tAgui + tB14), (tVac + tInd)],
                                backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'],
                                borderWidth: 2,
                                borderColor: '#ffffff'
                            }]
                        },
                        options: { ...cOpts, cutout: '72%', layout: { padding: { left: 135, right: 135 } }, plugins: { legend: costLegendWithValues('#334155'), tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fM(ctx.raw)}` } }, datalabels: { display: false } } }
                    }));
                }

                // 3. Payroll Trend
                const ctxPT = document.getElementById('chartPayrollTrend');
                if (ctxPT) {
                    const gradPT = getVGrad(ctxPT, 'rgba(139, 92, 246, 0.35)', 'rgba(139, 92, 246, 0.0)', 185);
                    window.activeCharts.push(new Chart(ctxPT, {
                        type: 'line',
                        plugins: window.ChartDataLabels ? [ChartDataLabels, costDonutOuterLabelPlugin] : [costDonutOuterLabelPlugin],
                        data: { 
                            labels: trendLabels, 
                            datasets: [{ 
                                label: 'Costo Total', 
                                data: costTrendForAvg, 
                                borderColor: '#8b5cf6', 
                                fill: true, 
                                backgroundColor: gradPT, 
                                tension: 0.4,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#8b5cf6',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor: '#8b5cf6',
                                pointHoverBorderColor: '#ffffff',
                                pointHoverBorderWidth: 2
                            }, {
                                label: 'Anterior',
                                data: priorCostTrend,
                                borderColor: '#64748b',
                                borderDash: [7, 7],
                                borderWidth: 2,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 2,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#64748b',
                                datalabels: { display: false }
                            }] 
                        },
                        options: { ...costChartBase(currency), plugins: { ...costChartBase(currency).plugins, legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 4. Mix Direction Donut
                const ctxDM = document.getElementById('chartCostDirDonut');
                if (ctxDM) {
                    const dirs = {}; filtered.forEach(e => { const d = e.dir || 'Otros'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); dirs[d] = (dirs[d]||0)+val; });
                    const sorted = Object.entries(dirs).sort((a,b)=>b[1]-a[1]).slice(0, 6);
                    window.activeCharts.push(new Chart(ctxDM, {
                        type: 'doughnut',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 24)), datasets: [{ data: sorted.map(s => s[1]), backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#475569'], borderWidth: 2, borderColor: '#ffffff' }] },
                        options: { ...cOpts, cutout: '68%', layout: { padding: { left: 135, right: 135 } }, plugins: { legend: costLegendWithValues('#334155'), tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fM(ctx.raw)}` } }, datalabels: { display: false } } }
                    }));
                }

                // 5. Variable Trend (Styled Magenta Line with Dots)
                const ctxVT = document.getElementById('chartVarTrend');
                if (ctxVT) {
                    const totalVar = varTrend.reduce((a,b)=>a+b,0);
                    const peakIdx = varTrend.reduce((best, v, i) => v > varTrend[best] ? i : best, 0);
                    let varBadge = document.getElementById('costVariableBadge');
                    if (!varBadge) {
                        const vtCard = ctxVT.closest('.card-box');
                        const title = vtCard && (vtCard.querySelector('.cost-card-head') || vtCard.querySelector('.card-title'));
                        if (title) {
                            varBadge = document.createElement('div');
                            varBadge.id = 'costVariableBadge';
                            varBadge.className = 'cost-pill-stat';
                            title.appendChild(varBadge);
                        }
                    }
                    if (varBadge) varBadge.innerHTML = `Pico: <b>${trendLabels[peakIdx]}</b> | ${fM(varTrend[peakIdx] || 0)}`;
                    
                    const gradVTPeak = getVGrad(ctxVT, '#db2777', 'rgba(219, 39, 119, 0.25)', 220);
                    const gradVTNorm = getVGrad(ctxVT, '#ec4899', 'rgba(236, 72, 153, 0.15)', 220);
                    
                    window.activeCharts.push(new Chart(ctxVT, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels, costBarEndLabelPlugin] : [costBarEndLabelPlugin],
                        data: {
                            labels: trendLabels,
                            datasets: [
                                {
                                    type: 'bar',
                                    label: 'Bono variable',
                                    data: varTrend,
                                    backgroundColor: varTrend.map((v, i) => i === peakIdx ? gradVTPeak : gradVTNorm),
                                    borderRadius: 8,
                                    barThickness: 34
                                },
                                {
                                    type: 'line',
                                    label: 'Promedio',
                                    data: varTrend.map(() => spanMonths ? totalVar / spanMonths : 0),
                                    borderColor: '#475569',
                                    borderDash: [6, 6],
                                    borderWidth: 2,
                                    pointRadius: 0,
                                    tension: 0.35,
                                    datalabels: { display: false }
                                },
                                {
                                    type: 'line',
                                    label: 'Anterior',
                                    data: priorVarTrend,
                                    borderColor: '#64748b',
                                    borderDash: [7, 7],
                                    borderWidth: 2,
                                    pointRadius: 2,
                                    tension: 0.35,
                                    datalabels: { display: false }
                                }
                            ]
                        },
                        options: {
                            ...costChartBase(currency),
                            plugins: {
                                legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '600' } } },
                                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } },
                                datalabels: { display: false }
                            },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' } } },
                                y: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' }, callback: v => costShort(v, currency) } }
                            }
                        }
                    }));
                }

                // 6. Quién comisiona más
                const ctxTopVar = document.getElementById('chartTopVariablePeople');
                if (ctxTopVar) {
                    const topPeople = filtered
                        .map(e => ({ e, val: getC(e.bv, e.xr, showUSD, e.pa), total: costTotal(e, showUSD, window.inclVac !== false, window.inclInd !== false) }))
                        .filter(x => x.val > 0)
                        .sort((a,b) => b.val - a.val)
                        .slice(0, 12);
                        
                    const gradTopVar = getHGrad(ctxTopVar, '#ec4899', 'rgba(236, 72, 153, 0.25)', 300);
                    
                    window.activeCharts.push(new Chart(ctxTopVar, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels, costBarEndLabelPlugin] : [costBarEndLabelPlugin],
                        data: {
                            labels: topPeople.map(x => (x.e.n || '').split(' ').slice(0, 3).join(' ')),
                            datasets: [{
                                label: 'Comisión / variable',
                                data: topPeople.map(x => x.val),
                                backgroundColor: gradTopVar,
                                borderRadius: 8
                            }]
                        },
                        options: {
                            ...costChartBase(currency),
                            indexAxis: 'y',
                            layout: { padding: { right: 240 } },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                                    bodyFont: { family: 'Montserrat', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: {
                                        title: items => topPeople[items[0].dataIndex]?.e.n || '',
                                        label: item => `${topPeople[item.dataIndex]?.e.c || ''} | ${fM(item.raw)}`
                                    }
                                },
                                datalabels: { display: false }
                            },
                            scales: {
                                x: { grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#64748b', font: { family: 'Montserrat', size: 10, weight: '600' }, callback: v => costShort(v, currency) } },
                                y: { grid: { display: false }, ticks: { color: '#334155', font: { family: 'Montserrat', size: 10, weight: '600' } } }
                            }
                        }
                    }));
                }

                // 7. Mapa de presión variable
                const ctxEff = document.getElementById('chartVariableEfficiency');
                if (ctxEff) {
                    const byArea = costGroup(filtered, e => e.dir || 'SIN AREA', e => getC(e.bv, e.xr, showUSD, e.pa))
                        .slice(0, 8);
                    const totalVarNow = filtered.reduce((a,e)=>a+getC(e.bv, e.xr, showUSD, e.pa),0);
                    const topArea = byArea[0] || ['Sin data', 0];
                    const wow = document.getElementById('costWowSummary');
                    if (wow) {
                        const ratio = tTotalCurrent > 0 ? (totalVarNow / tTotalCurrent) * 100 : 0;
                        wow.innerHTML = `
                            <div><span>Variable total</span><b>${fM(totalVarNow)}</b></div>
                            <div><span>% del costo</span><b>${ratio.toFixed(1)}%</b></div>
                            <div><span>Área líder</span><b>${topArea[0]}</b></div>
                        `;
                    }
                    window.activeCharts.push(new Chart(ctxEff, {
                        type: 'radar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: {
                            labels: byArea.map(x => costAxisLabel(x[0], 18)),
                            datasets: [{
                                label: 'Variable por área',
                                data: byArea.map(x => x[1]),
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                                pointBackgroundColor: '#8b5cf6',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 1.5,
                                pointRadius: 3.5,
                                pointHoverRadius: 5.5
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false }, 
                                tooltip: { 
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    titleFont: { family: 'Montserrat', size: 12, weight: 'bold' },
                                    bodyFont: { family: 'Montserrat', size: 12 },
                                    padding: 10,
                                    cornerRadius: 8,
                                    callbacks: { label: ctx => ` ${fM(ctx.raw)}` } 
                                },
                                datalabels: costValueLabelOptions(currency, { backgroundColor: 'rgba(255,255,255,0.78)', font: { family: 'Montserrat', size: 9, weight: '900' } })
                            },
                            scales: { 
                                r: { 
                                    ticks: { display: false }, 
                                    grid: { color: 'rgba(148, 163, 184, 0.08)' }, 
                                    angleLines: { color: 'rgba(148, 163, 184, 0.08)' },
                                    pointLabels: { color: '#64748b', font: { family: 'Montserrat', size: 9, weight: '600' } } 
                                } 
                            }
                        }
                    }));
                }

                // 8. Cost Per Head
                const ctxCPE = document.getElementById('chartCostPerEmp');
                if (ctxCPE) {
                    const gradCPE = getVGrad(ctxCPE, 'rgba(16, 185, 129, 0.35)', 'rgba(16, 185, 129, 0.0)', 185);
                    window.activeCharts.push(new Chart(ctxCPE, {
                        type: 'line',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: { 
                            labels: trendLabels, 
                            datasets: [{ 
                                label: 'Costo p/Cabeza', 
                                data: finalCostPerEmp, 
                                borderColor: '#10b981', 
                                borderWidth: 3, 
                                fill: true, 
                                backgroundColor: gradCPE,
                                tension: 0.4,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#10b981',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor: '#10b981',
                                pointHoverBorderColor: '#ffffff',
                                pointHoverBorderWidth: 2
                            }, {
                                label: 'Anterior',
                                data: priorCostPerEmp,
                                borderColor: '#64748b',
                                borderDash: [7, 7],
                                borderWidth: 2,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 2,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#64748b',
                                datalabels: { display: false }
                            }] 
                        },
                        options: { ...costChartBase(currency), plugins: { ...costChartBase(currency).plugins, legend: { position: 'top', labels: { color: '#334155', font: { family: 'Montserrat', size: 11, weight: '800' } } }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fM(ctx.raw)}` } } } }
                    }));
                }

                // 9. Ranking Dir
                const ctxRankD = document.getElementById('chartCostDir');
                if (ctxRankD) {
                    const dirs = {}; filtered.forEach(e => { const d = e.dir || 'N/A'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); dirs[d] = (dirs[d]||0)+val; });
                    const sorted = Object.entries(dirs).sort((a,b)=>b[1]-a[1]).slice(0, 10);
                    const gradRankD = getHGrad(ctxRankD, '#8b5cf6', 'rgba(139, 92, 246, 0.25)', 350);
                    window.activeCharts.push(new Chart(ctxRankD, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 28)), datasets: [{ label: 'Gasto', data: sorted.map(s => s[1]), backgroundColor: gradRankD, borderRadius: 8, barThickness: 22 }] },
                        options: { ...costChartBase(currency), indexAxis: 'y', layout: { padding: { right: 120, left: 4, top: 4, bottom: 4 } }, plugins: { ...costChartBase(currency).plugins, legend: { display:false }, datalabels: { anchor: 'end', align: 'right', offset: 8, color: '#111827', clamp: true, clip: false, formatter: value => value > 0 ? costShort(value, currency) : '', font: { family: 'Montserrat', size: 10, weight: '900' }, backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(148, 163, 184, 0.22)', borderWidth: 1, borderRadius: 7, padding: { top: 3, right: 6, bottom: 3, left: 6 } } }, scales: { ...costChartBase(currency).scales, x: { ...costChartBase(currency).scales.x, grace: '18%' } } }
                    }));
                }

                // 10. Ranking Depto
                const ctxRankDe = document.getElementById('chartCostDepto');
                if (ctxRankDe) {
                    const depts = {}; filtered.forEach(e => { const d = e.d || 'N/A'; const val = getC(e.so+e.bv+e.p_pat, e.xr, showUSD, e.pa); depts[d] = (depts[d]||0)+val; });
                    const sorted = Object.entries(depts).sort((a,b)=>b[1]-a[1]).slice(0, 10);
                    const gradRankDe = getHGrad(ctxRankDe, '#10b981', 'rgba(16, 185, 129, 0.25)', 350);
                    window.activeCharts.push(new Chart(ctxRankDe, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: { labels: sorted.map(s => costAxisLabel(s[0], 28)), datasets: [{ label: 'Gasto', data: sorted.map(s => s[1]), backgroundColor: gradRankDe, borderRadius: 8, barThickness: 22 }] },
                        options: { ...costChartBase(currency), indexAxis: 'y', layout: { padding: { right: 120, left: 4, top: 4, bottom: 4 } }, plugins: { ...costChartBase(currency).plugins, legend: { display:false }, datalabels: { anchor: 'end', align: 'right', offset: 8, color: '#111827', clamp: true, clip: false, formatter: value => value > 0 ? costShort(value, currency) : '', font: { family: 'Montserrat', size: 10, weight: '900' }, backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(148, 163, 184, 0.22)', borderWidth: 1, borderRadius: 7, padding: { top: 3, right: 6, bottom: 3, left: 6 } } }, scales: { ...costChartBase(currency).scales, x: { ...costChartBase(currency).scales.x, grace: '18%' } } }
                    }));
                }

                // 11. Annual Cost Compare (Final Chart)
                const ctxAC = document.getElementById('chartAnnualCost');
                if (ctxAC) {
                    const gradAC = getVGrad(ctxAC, '#8b5cf6', 'rgba(139, 92, 246, 0.2)', 185);
                    window.activeCharts.push(new Chart(ctxAC, {
                        type: 'bar',
                        plugins: window.ChartDataLabels ? [ChartDataLabels] : [],
                        data: { labels: twelveSlots.map(s => s.label), datasets: [{ label: 'Total histórico', data: annualTrendData, backgroundColor: gradAC, borderColor: '#8b5cf6', borderWidth: 1.5, borderRadius: 6 }] },
                        options: { ...costChartBase(currency), layout: { padding: { top: 30, right: 18, left: 8, bottom: 4 } }, plugins: { ...costChartBase(currency).plugins, legend: { display:false }, datalabels: { anchor: 'end', align: 'top', offset: 6, color: '#111827', clamp: true, clip: false, formatter: value => value > 0 ? costShort(value, currency) : '', font: { family: 'Montserrat', size: 10, weight: '900' }, backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(148, 163, 184, 0.22)', borderWidth: 1, borderRadius: 7, padding: { top: 3, right: 6, bottom: 3, left: 6 } } }, scales: { ...costChartBase(currency).scales, y: { ...costChartBase(currency).scales.y, grace: '18%' } } }
                    }));
                }

                // 7. Simulation & Update Logic
                window.updateSimulation = function () {
                    const sal = parseFloat(document.getElementById('simSalary').value) / 100;
                    const bon = parseFloat(document.getElementById('simBono').value) / 100;
                    const rot = parseFloat(document.getElementById('simRot').value) / 100;
                    document.getElementById('valSimSalary').innerText = (sal * 100).toFixed(0) + '%';
                    document.getElementById('valSimBono').innerText = (bon * 100).toFixed(0) + '%';
                    document.getElementById('valSimRot').innerText = (rot * 100).toFixed(0) + '%';
                    const impact = (tSO * sal) + (tVar * bon) + (tTotalCurrent * 0.1 * rot);
                    const lab = document.getElementById('labelSimImpact');
                    lab.innerText = (impact >= 0 ? '+' : '') + fM(impact);
                    lab.style.color = impact > 0 ? '#ef4444' : '#10b981';
                };
                window.resetSim = () => { document.getElementById('simSalary').value=0; document.getElementById('simBono').value=0; document.getElementById('simRot').value=0; updateSimulation(); };
                
                // Update Suggested TC
                const tcDisp = document.getElementById('currentTCDisp');
                if (tcDisp && showUSD) {
                    const { p: ps } = getFilters();
                    if (ps !== 'ALL') {
                        const sample = filtered.length > 0 ? filtered[0].xr : 1.0;
                        tcDisp.innerHTML = `TC sugerido ${paisMap[ps] || ps}: <span style="color:var(--ac);">${Number(sample).toFixed(6)}</span>`;
                    } else tcDisp.innerHTML = "TC Variable por País";
                } else if (tcDisp) tcDisp.innerHTML = "Moneda Local";

                updateSimulation();
            }

            function applyCostSearch(val) {
                window.costSearch = val;
                renderAll();
            }

            function exportData() {
                const pais = document.getElementById('paisSel').value;
                const emp = document.getElementById('empresaSel').value;
                const yr = document.getElementById('yearSel').value;
                const mo = document.getElementById('monthSel').value;
                const showUSD = window.useUSD || false;
                const searchVal = (document.querySelector('.search-wrapper input')?.value || '').toLowerCase();

                const emps = app.employees.filter(e =>
                    (pais === 'ALL' ? true : e.pa === pais) &&
                    (emp === 'ALL' ? true : e.e === emp) &&
                    (yr === 'ALL' ? true : e.y == yr) &&
                    (mo === 'ALL' ? true : e.m == mo) &&
                    (searchVal === '' ? true : (
                        (e.n || '').toLowerCase().includes(searchVal) ||
                        (e.p || '').toLowerCase().includes(searchVal) ||
                        (e.c || '').toLowerCase().includes(searchVal)
                    ))
                );

                const rows = emps.map(e => {
                    const conv = (v) => getC(v, e.xr, showUSD, e.pa);
                    const rowTotal = conv(e.so) + conv(e.b37) + conv(e.b78) + conv(e.bv) + conv(e.he) + conv(e.p_agui) + conv(e.p_b14) + conv(e.p_vac) + conv(e.p_ind) + conv(e.p_pat);

                    // To show the actual rate used in the Excel column
                    let actualRateUsed = 1;
                    if (showUSD) {
                        const testVal = 1000;
                        const converted = getC(testVal, e.xr, true, e.pa);
                        actualRateUsed = converted > 0 ? (testVal / converted) : 1;
                    }

                    return {
                        'CÓDIGO': e.c, 'NOMBRE': e.n, 'DEPARTAMENTO': e.d, 'PUESTO': e.p,
                        'EMPRESA': e.e, 'PAÍS': e.pa, 'AÑO': e.y, 'MES': e.m,
                        'T. CAMBIO': showUSD ? actualRateUsed : (e.xr || 1),
                        'MONEDA': showUSD ? 'USD' : (currencyMap[e.pa] || 'Local'),
                        'TOTAL 10 COLS': rowTotal,
                        'SALARIO': conv(e.so),
                        'BONO 37': conv(e.b37),
                        'BONO 78': conv(e.b78),
                        'BONIF. VARIABLES': conv(e.bv),
                        'HORAS EXTRA': conv(e.he),
                        'PROV AGUINALDO': conv(e.p_agui),
                        'PROV BONO 14': conv(e.p_b14),
                        'PROV VACACIONES': conv(e.p_vac),
                        'PROV INDEMNIZACIÓN': conv(e.p_ind),
                        'CUOTAS PATRONALES': conv(e.p_pat)
                    };
                });

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Reporte Costos Detailed');
                XLSX.writeFile(wb, `Reporte_Costos_${showUSD ? 'USD' : 'Local'}_${yr}_${mo}.xlsx`);
            }


/* ===== headcount-main.js ===== */
﻿// Main Headcount tab renderer and executive charts extracted from the main HTML.

function kpiCard(label, val, icon, color, view, statusType = "up", subLabel = "", exportType = null, headerExtra = "", extraContent = "", sparkData = null, labelSize = "11px") {
                const formattedVal = (typeof val === 'number') ? val.toLocaleString('en-US') : val;
                const isClickable = (statusType === 'sub' || statusType === 'view');
                const clickAttr = isClickable ? `onclick="switchView('${view}');"` : "";
                const cursor = isClickable ? 'pointer' : 'default';
                const premiumClasses = `premium-kpi stagger-reveal ${isClickable ? 'clickable-kpi' : ''}`;
                const sparklineHtml = (Array.isArray(sparkData) && sparkData.length > 0) ? 
                    `<div class="sparkline-container" data-sparkline='${JSON.stringify(sparkData)}' id="spark_${Math.random().toString(36).substr(2, 9)}"></div>` : '';
                const excelBtn = exportType ? `
                    <button onclick="exportKpiData('${exportType}', event)" 
                            style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.05); color:#94a3b8; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:0.3s; z-index:10;"
                            onmouseover="this.style.background='#8b5cf6'; this.style.color='#fff';"
                            onmouseout="this.style.background='rgba(0,0,0,0.03)'; this.style.color='#94a3b8';">
                        <i class="fas fa-file-excel" style="font-size:12px;"></i>
                    </button>` : '';

                return `
                    <div class="kpi-card ${premiumClasses}" ${clickAttr} style="cursor:${cursor}; border-left: 6px solid ${color} !important;"
                         onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 15px 35px rgba(15, 23, 42, 0.12)';"
                         onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(31, 38, 135, 0.07)';">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="kpi-icon" style="pointer-events:none; color:${color}; background: ${color}10; width: 34px; height: 34px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size: 16px; border: 1.5px solid ${color}25;">${icon}</div>
                                <div class="kpi-label" style="pointer-events:none; font-size: ${labelSize}; font-weight: 1000; color: #475569; text-transform: uppercase; letter-spacing: 0.8px;">${label}</div>
                            </div>
                            ${headerExtra ? `<div style="z-index:11;">${headerExtra}</div>` : ''} 
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:2;">
                            <div class="kpi-value kpi-value-pro" style="font-size:24px; font-weight:1000; color:#1e293b; letter-spacing:-1px;">${formattedVal}</div>
                            ${subLabel ? `<div class="kpi-sub" style="font-size: 9px; font-weight: 1000; color: #94a3b8; text-transform: uppercase; letter-spacing:0.3px;">${subLabel}</div>` : ''}
                            ${extraContent ? `<div style="margin-top:6px; z-index:5;">${extraContent}</div>` : ''}
                        </div>
                        ${sparklineHtml}
                        ${excelBtn}
                    </div>
                `;
            }

            function renderSparklines() {
                const canvases = document.querySelectorAll('canvas[data-sparkline]');
                canvases.forEach(canvas => {
                    const data = JSON.parse(canvas.getAttribute('data-sparkline'));
                    const color = canvas.closest('.card-box')?.style.getPropertyValue('--accent') || '#8b5cf6';
                    
                    if (window.Chart) {
                        const newChart = new Chart(canvas.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: data.map((_, i) => i),
                                datasets: [{
                                    data: data,
                                    borderColor: color,
                                    borderWidth: 2,
                                    pointRadius: 0,
                                    fill: true,
                                    backgroundColor: color + '10',
                                    tension: 0.4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                scales: { x: { display: false }, y: { display: false } },
                                animation: { duration: 1000 }
                            }
                        });
                        if (typeof window.activeCharts !== 'undefined') window.activeCharts.push(newChart);
                    }
                });
            }

            function renderGauges(rot, ret) {
                // Implementation for small radial indicators if needed
            }

            window.showTurnoverFormula = function(bajas, hc, rot, ret, event) {
                if(event) event.stopPropagation();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'FÃ³rmula de RotaciÃ³n',
                        html: `
                            <div style="text-align:left; font-family:'Montserrat',sans-serif;">
                                <p style="font-weight:700;">RotaciÃ³n = (Bajas del Periodo / Headcount Total) Ã— 100</p>
                                <hr style="margin:10px 0; opacity:0.1;">
                                <p style="font-size:14px;">Calculado como: (${bajas} / ${hc}) Ã— 100 = <b>${rot.toFixed(2)}%</b></p>
                                <p style="font-size:14px; margin-top:8px;">RetenciÃ³n = <b>${ret.toFixed(2)}%</b></p>
                            </div>
                        `,
                        icon: 'info',
                        confirmButtonColor: '#8b5cf6'
                    });
                } else {
                    alert(`FÃ³rmula de RotaciÃ³n:\n(Bajas: ${bajas} / HC: ${hc}) * 100 = ${rot.toFixed(2)}%`);
                }
            };

            window.applyCostSearch = function(val) {
                window.costSearch = val;
                renderAll();
            };

            function renderGeneral(summ_obj, uniqueEmps, empsRaw) {
                
                // FALLBACK: when called without args (e.g. radar dim-tab clicks) use cached data  
                if (!uniqueEmps || !empsRaw) {
                    if (cachedEmps) {
                        uniqueEmps = cachedEmps.unique;
                        empsRaw   = cachedEmps.raw;
                    } else {
                        // No cache yet   trigger a proper full render and exit
                        requestRenderAll();
                        return;
                    }
                }
                try {
                    let vsText = "";
                    // window.activeCharts cleanup moved to renderAll for global safety

                    const { p: pais2, e: emp2, a: areaSel, d: deptoSel, y, m, countries } = getFilters();
                    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

                    // Robust Fallback: If detail is missing (common for future dates like Feb 2026), get HC fromasummary
                    let activeHC = uniqueEmps.length;
                    if (activeHC === 0 && (app.summary || []).length > 0) {
                        const sumFiltered = app.summary.filter(s => {
                            const spa = normalizePa(s.pa);
                            const matchP = countries.length === 0 || countries.includes(spa);
                            const matchDate = (y === 'ALL' || s.y == y) && compareMonth(s.m, m);
                            return matchP && (emp2 === 'ALL' || s.e === emp2) && matchDate;
                        });
                        activeHC = sumFiltered.reduce((sum, current) => sum + (Number(current.hc) || 0), 0);
                        console.log('  Using Summary Fallback HC:', activeHC);
                    }

                    const allBajas = app.bajas_list || [];

                    // 1. ALTAS (Hires for selected period + Cumulative YTD)
                    const hiresSet = new Set();
                    uniqueEmps.forEach(item => {
                        if (!item.fi) return;
                        const fparts = item.fi.split('/');
                        if (fparts.length < 3) return;
                        const fy = parseInt(fparts[2]);
                        const fm = parseInt(fparts[1]);
                        if ((y === 'ALL' || fy == parseInt(y)) && (m === 'ALL' || fm == parseInt(m))) {
                            hiresSet.add(item.c || item.n);
                        }
                    });
                    let hiresPeriod = hiresSet.size;

                    let hiresYTD = 0;
                    if (y !== 'ALL') {
                        const targetM = (m === 'ALL') ? 12 : parseInt(m);
                        const hiresYTDSet = new Set();
                        empsRaw.forEach(e => {
                            if (!e.fi) return;
                            const fp = e.fi.split('/');
                            if (fp.length < 3) return;
                            const fy = parseInt(fp[2]), fm = parseInt(fp[1]);
                            const curPa = normalizePa(e.pa);
                            const matchPa = countries.length === 0 || countries.includes(curPa);

                            if (compareYear(fy, y) && fm <= targetM &&
                                matchPa && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) &&
                                (deptoSel === 'ALL' || e.d === deptoSel)) {
                                hiresYTDSet.add(e.c || e.n);
                            }
                        });
                        hiresYTD = hiresYTDSet.size;
                    }

                    // 2. BAJAS (Bajas for selected period + Cumulative YTD)
                    const filteredBajas = allBajas.filter(b => {
                        if(!b) return false;
                        const curPa = b._pa || normalizePa(b.pa);
                        const matchP = countries.length === 0 || countries.includes(curPa);
                        const matchE = emp2 === 'ALL' || b.e === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.depto) === deptoSel;
                        
                        const by = b._y || b.y;
                        const bm = b._m || b.m;
                        let matchDate = (y === 'ALL' || compareYear(by, y)) && compareMonth(bm, m);
                        return matchP && matchE && matchA && matchD && matchDate;
                    });
                    let bajasPeriod = filteredBajas.length;

                    let bajasYTD = 0;
                    if (y !== 'ALL') {
                        const targetM = (m === 'ALL') ? 12 : parseInt(m);
                        bajasYTD = allBajas.filter(b => {
                            if(!b) return false;
                            const curPa = normalizePa(b.pa);
                            const matchP = countries.length === 0 || countries.includes(curPa);
                            const matchE = emp2 === 'ALL' || b.e === emp2;
                            const matchA = areaSel === 'ALL' || b.dir === areaSel;
                            const matchD = deptoSel === 'ALL' || b.d === deptoSel;
                            return matchP && matchE && matchA && matchD && compareYear(b.y, y) && compareMonth(b.m, targetM, true);
                        }).length;
                    }

                    // Heatmap logic fix
                    const heatmapEl = document.getElementById('heatmapContainer');
                    if (heatmapEl) {
                        try {
                            const matrix = {};
                            const heatYears = [...new Set(allBajas.map(b => b.y))].filter(Boolean).sort();
                            heatYears.forEach(yr => { matrix[yr] = Array(12).fill(0); });
                            
                            allBajas.forEach(b => {
                                if(b && b.y && b.m && matrix[b.y]) {
                                    let mo = parseInt(b.m);
                                    if(mo >= 1 && mo <= 12) matrix[b.y][mo-1]++;
                                }
                            });
                            
                            const matrixValues = Object.values(matrix);
                            const allVals = matrixValues.flat();
                            const maxBajas = allVals.length > 0 ? Math.max(...allVals) : 0;
                            
                            let heatHTML = '';
                            heatYears.forEach(yr => {
                                heatHTML += `<div style="display: flex; align-items: center; margin-bottom: 2px;"><span style="width:40px; font-size:10px;">${yr}</span>`;
                                matrix[yr].forEach((val, idx) => {
                                    const alpha = maxBajas > 0 ? (val / maxBajas) : 0;
                                    heatHTML += `<div title="${monthNames[idx+1]} ${yr}: ${val} bajas" style="width:15px; height:15px; margin:1px; background: rgba(255, 68, 68, ${0.1 + alpha * 0.9}); border-radius: 2px;"></div>`;
                                });
                                heatHTML += `</div>`;
                            });
                            heatmapEl.innerHTML = heatHTML || '<p style="font-size:10px; opacity:0.6;">Sin datos de bajas</p>';
                        } catch (e) {
                            console.error("Error rendering heatmap:", e);
                            heatmapEl.innerHTML = "Error al cargar grÃ¡fico";
                        }
                    }

                    // 3. HC (Payroll Detail - respect Neto/Bruto toggle)
                    const isNeto = (window._hcType === 'neto');
                    const currentPeriodBajasSet = new Set(filteredBajas.map(personKey));
                    activeHC = isNeto ? uniqueEmps.filter(e => !currentPeriodBajasSet.has(personKey(e))).length : uniqueEmps.length;

                    // Year-only filters stay as full-year totals; month filters remain monthly.



                    // --- APLY MANUAL OVERRIDES (PRIORITY) ---
                    const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                    const ovrKey = `${pais2}_${emp2}_${y}_${m} `;
                    if (overrides[ovrKey]) {
                        const o = overrides[ovrKey];
                        if (o.hc !== null) activeHC = o.hc;
                        if (o.altas !== null) hiresPeriod = o.altas;
                        if (o.bajas !== null) bajasPeriod = o.bajas;
                    }

                    // 4. CRECIMIENTO COMPARATIVO
                    // Growth Period Logic (Default 1m)
                    let growthPeriod = window.selectedGrowthPeriod || '1m';
                    if (m === 'ALL' && growthPeriod === '1m') growthPeriod = '1y';

                    const growthLabels = { '1m': 'vs. Mes Anterior', '3m': 'vs. 3 Meses', '1y': 'vs. aÃ±o PaÃ­sado' };

                    let prevHC = 0;
                    if (y !== 'ALL') {
                        curM = (m === 'ALL') ? 12 : parseInt(m);
                        curY = parseInt(y);
                        let targetM, targetY;

                        if (growthPeriod === '1m') {
                            targetM = curM === 1 ? 12 : curM - 1;
                            targetY = curM === 1 ? curY - 1 : curY;
                        } else if (growthPeriod === '3m') {
                            targetM = curM - 3;
                            targetY = curY;
                            if (targetM <= 0) { targetM += 12; targetY--; }
                        } else {
                            targetM = curM;
                            targetY = curY - 1;
                        }

                        const prevPayroll = new Set(empsRaw.filter(e => compareYear(e.y, targetY) && compareMonth(e.m, targetM) &&
                            (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                            (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) &&
                            (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)
                        ).map(e => e.c || e.n)).size;
                        const prevBajas = allBajas.filter(b => compareYear(b.y, targetY) && compareMonth(b.m, targetM) &&
                            (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2) &&
                            (areaSel === 'ALL' || b.dir === areaSel || b.area === areaSel) &&
                            (deptoSel === 'ALL' || b.d === deptoSel || b.depto === deptoSel)
                        ).length;
                        prevHC = Math.max(0, prevPayroll - prevBajas);
                        vsText = `${growthLabels[growthPeriod]} (${prevHC})`;
                    } else {
                        vsText = "vs. Periodo Anterior (0)";
                    }
                    let growth = activeHC - prevHC;

                    // ACTIVE COUNTRIES: Count all that have data in the selected YEAR if period is ALL
                    const paisesSet = new Set();
                    (m === 'ALL' ? empsRaw : uniqueEmps).forEach(e => {
                        let code = normalizePa(e.pa);
                        if (code && code !== 'NAT' && code !== 'PAIS') paisesSet.add(code);
                    });
                    const paisesSize = paisesSet.size;

                    let activeColor = "var(--ac)";
                    if (paisesSize === 1 && uniqueEmps.length > 0) activeColor = getStyle(uniqueEmps[0].pa).color;

                    // New Calculation: Turnover & Retention
                    const rotPct = activeHC > 0 ? (bajasPeriod / activeHC) * 100 : 0;
                    const retPct = 100 - rotPct;
                    const rotYTD = activeHC > 0 ? (bajasYTD / activeHC) * 100 : 0;

                    // RetenciÃ³n Bigger numbers + rolling promedio (3/6/12m)
                    const rotPeriod = window._rotPeriod || 3;
                    let rotSumBajas = 0, rotSumHC = 0;
                    for (let ri = 0; ri < rotPeriod; ri++) {
                        let rY = targetY || parseInt(y), rM = curM - ri;
                        while (rM < 1) { rM += 12; rY--; }
                        const rBajas = allBajas.filter(b => b.y == rY && b.m == rM && (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2)).length;
                        const rHC = new Set(empsRaw.filter(e => e.y == rY && compareMonth(e.m, rM) && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2)).map(e => e.c || e.n)).size;
                        rotSumBajas += rBajas; rotSumHC += rHC;
                    }
                    const rotRolling = rotSumHC > 0 ? (rotSumBajas / rotSumHC) * 100 : 0;

                    const turnoverValue = `
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-top:2px; padding: 1px 0;">
                            <div style="flex:1;">
                                <span style="font-size:20px; font-weight:1000; color:#f43f5e; letter-spacing:-1.2px;">${rotPct.toFixed(1)}%</span>
                                <span style="font-size:10px; display:block; text-transform:uppercase; color:#94a3b8; font-weight:900; margin-top:-2px;">RotaciÃ³n</span>
                            </div>
                            <div style="flex:1; text-align:right;">
                                <span style="font-size:20px; font-weight:1000; color:#10b981; letter-spacing:-1.2px;">${retPct.toFixed(1)}%</span>
                                <span style="font-size:10px; display:block; text-transform:uppercase; color:#94a3b8; font-weight:900; margin-top:-2px;">RetenciÃ³n</span>
                            </div>
                        </div>
                    `;

                    const formulaBtn = `
                        <div style="display:flex; gap:4px; align-items:center;">
                            <button onclick="window.showTurnoverFormula(${bajasPeriod}, ${activeHC}, ${rotPct}, ${retPct}, event)" 
                                    style="background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.15); color:var(--ac); font-size:7px; font-weight:1000; padding:2px 8px; border-radius:20px; cursor:pointer;"
                                    title="Ver FÃ³rmula">
                                <i class="fas fa-calculator" style="font-size:8px;"></i>
                            </button>
                        </div>
                                <script>
                                    (function(){
                                        [3,6,12].forEach(p => {
                                            const btn = document.getElementById('rot_btn_' + p);
                                            if(btn) {
                                                const isSel = (window._rotPeriod === p);
                                                btn.style.background = isSel ? '#fff' : 'transparent';
                                                btn.style.color = isSel ? '#8b5cf6' : 'rgba(255,255,255,0.6)';
                                                btn.style.boxShadow = isSel ? '0 2px 8px rgba(0,0,0,0.2)' : 'none';
                                            }
                                        });
                                    })();
                                <\/script>`;

                    const periodRange = (m === 'ALL' || m === '0') ? `Ene a Dic ${y}` : `Ene a ${monthNames[m]} ${y}`;

                    updateStatusPhrase(pais2, emp2, activeHC);

                    // --- Build smart date subtitle for HC ACTIVO ---
                    let hcActivoDate = '';
                    if (m !== 'ALL' && m !== '0') {
                        hcActivoDate = `${monthNames[m]} ${y}`;
                    } else if (y !== 'ALL') {
                        hcActivoDate = `AÃ‘O ${y}`;
                    } else {
                        // ALL years: find absolute last month with data
                        let lastY2 = 0, lastM2 = 0;
                        empsRaw.forEach(e => { const ey = parseInt(e.y), em = parseInt(e.m); if (ey > lastY2 || (ey === lastY2 && em > lastM2)) { lastY2 = ey; lastM2 = em; } });
                        hcActivoDate = lastM2 > 0 ? `${monthNames[lastM2]} ${lastY2}` : '';
                    }

                    // --- TREND CALCULATION FOR SPARKLINES (STITCH STYLE) ---
                    const hcTrendArr = [], altasTrendArr = [], bajasTrendArr = [];
                    const trendMonthsCount = 6;

                    let tY_trend = parseInt(y);
                    let tM_trend = parseInt(m);
                    
                    if (isNaN(tY_trend)) tY_trend = new Date().getFullYear();
                    if (isNaN(tM_trend) || tM_trend === 0) {
                        let maxM = 0;
                        empsRaw.forEach(e => { if(parseInt(e.y) == tY_trend && parseInt(e.m) > maxM) maxM = parseInt(e.m); });
                        tM_trend = maxM || 12;
                    }

                    for (let i = trendMonthsCount - 1; i >= 0; i--) {
                        let cTY = tY_trend, cTM = tM_trend - i;
                        while(cTM < 1) { cTM += 12; cTY--; }
                        const mE = empsRaw.filter(e => parseInt(e.y) == cTY && parseInt(e.m) == cTM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2));
                        hcTrendArr.push(new Set(mE.map(e => e.c || e.n)).size);
                        const mH = empsRaw.filter(e => {
                            if(!e.fi) return false;
                            const fp = e.fi.split('/');
                            return fp.length >= 3 && parseInt(fp[2]) == cTY && parseInt(fp[1]) == cTM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2);
                        });
                        altasTrendArr.push(mH.length);
                        const mB = allBajas.filter(b => parseInt(b.y) == cTY && parseInt(b.m) == cTM && (countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2));
                        bajasTrendArr.push(mB.length);
                    }

                    const kpi0El = document.getElementById('kpi0');
                    if (kpi0El) {
                        kpi0El.innerHTML = `
                            ${kpiCard("HEADCOUNT", activeHC, '<i class="fa-solid fa-users-viewfinder"></i>', "#3b82f6", "Detalle de HC", "sub", `A ${hcActivoDate.toUpperCase()}`, "hc", "", "", hcTrendArr, "15px")}
                            ${kpiCard("ALTAS", hiresPeriod, '<i class="fa-solid fa-user-plus"></i>', "#10b981", "Detalle de Altas", "sub", `EN EL AÃ‘O: ${hiresYTD.toLocaleString('en-US')}`, "hires", "", "", altasTrendArr, "13px")}
                            ${kpiCard("BAJAS", bajasPeriod, '<i class="fa-solid fa-user-minus"></i>', "#ef4444", "Detalle de Bajas", "sub", `EN EL AÃ‘O: ${bajasYTD.toLocaleString('en-US')}`, "bajas", "", "", bajasTrendArr, "13px")}
                            ${kpiCard("RetenciÃ³n & RotaciÃ³n", "", '<i class="fa-solid fa-arrows-rotate"></i>', "#8b5cf6", "Detalle de RotaciÃ³n", "sub", `PROMEDIO ${rotPeriod}M: ${rotRolling.toFixed(1)}%`, null, formulaBtn, turnoverValue, null, "12px")}
                            ${kpiCard("PAÃSES ACTIVOS", paisesSize, '<i class="fa-solid fa-earth-americas"></i>', "#f59e0b", "Detalle de Paises", "sub", "PRESENCIA REGIONAL", "countries", "", "", null, "13px")}
                        `;
                    }
                    
                    // Optimization: Don't render main charts if we are deep in a sub-view
                    if (window._currentSubView && window._currentSubView !== 'General') {
                         console.log('  renderGeneral: Skipping main charts (sub-view is active)');
                         // Just update sub-header count (if applicable)
                         const sSum = document.querySelector('.sub-header-sum');
                         if (sSum) {
                             if (window._currentSubView === 'Detalle de HC') sSum.innerText = `Total: ${activeHC.toLocaleString('en-US')} Colaboradores`;
                             if (window._currentSubView === 'Detalle de Altas') sSum.innerText = `Total: ${hiresPeriod.toLocaleString('en-US')} Ingresos`;
                             if (window._currentSubView === 'Detalle de Bajas') sSum.innerText = `Total: ${bajasPeriod.toLocaleString('en-US')} Egresos`;
                         }
                         return;
                    }

                    // Trigger Sparklines, Gauges and Staggered Animation
                    setTimeout(() => {
                        renderSparklines();
                        renderGauges(rotPct, retPct);
                        document.querySelectorAll('.stagger-reveal').forEach((el, index) => {
                            el.style.animationDelay = (index * 0.1) + 's';
                        });
                    }, 50);

                    // Filtrar Tenures para solo ACTIVOS
                    const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                    const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                    const activeEmpsForTenure = uniqueEmps.filter(e => {
                        const code = e.c || e.n;
                        const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                        return !isBaja;
                    });

                    const tenures = activeEmpsForTenure.map(e => ({ ...e, tenure: e.t || 0 }));

                    try {
                        renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw, activeHC, bajasPeriod, filteredBajas);

                        if (typeof renderHeatmap === 'function') renderHeatmap(uniqueEmps);
                        renderHCRegistry(uniqueEmps);
                        
                        // --- Strategic Components (With Safe Checks) ---
                        if (typeof renderTenureThermometer === 'function') renderTenureThermometer(uniqueEmps);
                    } catch (e) {
                        console.error("Error in renderGeneral sub-functions:", e);
                    }

                    // === RANKINGS (DEPTOS & areaS) ===
                    try {
                        const deptCounts = {};
                        const areaCounts = {};
                        uniqueEmps.forEach(emp => {
                            const dept = emp.d || 'Sin Departamento';
                            const area = emp.dir || emp.area || 'Sin area';
                            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                            areaCounts[area] = (areaCounts[area] || 0) + 1;
                        });
                        const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
                        const sortedareas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
                        const totalForRanking = uniqueEmps.length || 1;

                        const renderRankList = (containerId, items, accentColor, chkId, defaultCount) => {
                            const container = document.getElementById(containerId);
                            if (!container) return; // SAFE CHECK
                            if (items.length === 0) { 
                                container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Sin datos</p>'; 
                                return; 
                            }
                            const showAll = document.getElementById(chkId)?.checked;
                            const displayItems = showAll ? items : items.slice(0, defaultCount);
                            const maxVal = items[0][1];
                            container.innerHTML = displayItems.map(([name, count], i) => {
                                const pct = ((count / totalForRanking) * 100).toFixed(1);
                                const barPct = ((count / maxVal) * 100).toFixed(0);
                                const medal = i === 0 ? ' ' : i === 1 ? '  ' : i === 2 ? ' ' : `<span style="font-size:10px;font-weight:900;color:#94a3b8;width:18px;display:inline-block;text-align:center;">${i + 1}</span>`;
                                return `<div class="rank-row" style="position:relative; display:flex; align-items:center; gap:10px; margin-bottom:6px; padding:6px 10px; border-radius:10px; overflow:hidden; background: #f8fafc; border:1px solid #f1f5f9; transition:0.3s; cursor:pointer;" onclick="downloadRankExcel('${chkId.replace('chkAll','')}', '${name}')" title="Click para exportar detalle de ${name}">
                                    <div style="position:absolute; top:0; left:0; height:100%; width:${barPct}%; background:${accentColor}10; transition:width 0.8s ease;"></div>
                                    <div style="position:absolute; bottom:0; left:0; height:1px; width:${barPct}%; background:${accentColor}30;"></div>
                                    <span style="min-width:22px; text-align:center; z-index:1;">${medal}</span>
                                    <div style="flex:1; min-width:0; display:flex; justify-content:space-between; align-items:center; z-index:1;">
                                        <span style="font-size:11px; font-weight:800; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;" title="${name}">${name}</span>
                                        <div style="text-align:right;">
                                            <span style="font-size:11px; font-weight:1000; color:${accentColor};">${count}</span>
                                            <span style="font-size:8px; font-weight:700; color:#94a3b8; margin-left:2px;">(${pct}%)</span>
                                        </div>
                                    </div>
                                </div>`;
                            }).join('');
                        };

                        renderRankList('rankingTop10', sortedDepts, '#8b5cf6', 'chkAllDepts', 10);
                        renderRankList('rankingTopareas', sortedareas, '#8b5cf6', 'chkAllareas', 14);
                        const bottom5 = sortedDepts.filter(d => d[1] > 0).slice(-5).reverse();
                        renderRankList('rankingBottom5', bottom5, '#ef4444', 'chkAllBottom', 5);
                    } catch (e) { console.error("Error in renderRankings:", e); }

                    // === CALENDAR HEATMAP DE BAJAS ===
                    try {
                        const calContainer = document.getElementById('calendarHeatmap');
                        if (calContainer) {
                            const allBajasHeat = (window.allBajas || app.bajas_list || []);
                            const { countries: cFilter, e: empFilter, a: areaFilter, d: deptoFilter } = getFilters();
                            const filteredBajasHeat = allBajasHeat.filter(b => {
                                const curPa = (b.pa || '').trim().toUpperCase();
                                return (cFilter.length === 0 || cFilter.includes(curPa)) &&
                                       (empFilter === 'ALL' || b.e === empFilter) &&
                                       (areaFilter === 'ALL' || b.dir === areaFilter) &&
                                       (deptoFilter === 'ALL' || b.d === deptoFilter);
                            });

                            const normalizeYear = yr => (yr > 0 && yr < 100) ? 2000 + yr : yr;
                            const yearsSet = new Set();
                            filteredBajasHeat.forEach(b => { 
                                const yr = normalizeYear(parseInt(b.y));
                                if (yr > 0) yearsSet.add(yr); 
                            });
                            const years = [...yearsSet].sort();
                            const monthNms = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                            // Build heatmap matrix
                            const matrix = {};
                            years.forEach(yr => { matrix[yr] = Array(12).fill(0); });
                            filteredBajasHeat.forEach(b => {
                                const yr = normalizeYear(parseInt(b.y));
                                const mo = parseInt(b.m);
                                if (matrix[yr] && mo >= 1 && mo <= 12) matrix[yr][mo - 1]++;
                            });

                            let maxBajas = 0;
                            years.forEach(yr => matrix[yr].forEach(v => { if (v > maxBajas) maxBajas = v; }));
                            maxBajas = maxBajas || 1;

                            const getHeatColor = (val) => {
                                if (val === 0) return '#f8fafc';
                                const intensity = val / maxBajas;
                                if (intensity < 0.2) return '#fef3c7';
                                if (intensity < 0.4) return '#fde68a';
                                if (intensity < 0.6) return '#fbbf24';
                                if (intensity < 0.8) return '#f59e0b';
                                return '#ef4444';
                            };

                            let heatHTML = '<div style="display:grid;grid-template-columns:60px repeat(12,1fr);gap:3px;min-width:500px;">';
                            // Header row
                            heatHTML += '<div style="font-size:9px;font-weight:800;color:#94a3b8;"></div>';
                            monthNms.forEach(mn => { heatHTML += `<div style="font-size:9px;font-weight:900;color:#64748b;text-align:center;padding:4px 0;">${mn}</div>`; });

                            years.forEach(yr => {
                                heatHTML += `<div style="font-size:11px;font-weight:900;color:var(--ac);display:flex;align-items:center;">${yr}</div>`;
                                matrix[yr].forEach((val, mi) => {
                                    const bg = getHeatColor(val);
                                    const textColor = val > (maxBajas * 0.5) ? '#fff' : '#475569';
                                    heatHTML += `<div style="background:${bg};border-radius:6px;padding:8px 4px;text-align:center;font-size:12px;font-weight:800;color:${textColor};cursor:pointer;transition:transform 0.2s;" 
                                                     title="${monthNms[mi]} ${yr}: ${val} bajas"
                                                     onclick="window.renderHeatmapDetail(${yr}, ${mi + 1})"
                                                     onmouseenter="this.style.transform='scale(1.1)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                                                     onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='none';">${val || '-'}</div>`;
                                });
                            });
                            heatHTML += '</div>';

                            // Legend
                            heatHTML += `<div style="display:flex;align-items:center;gap:8px;margin-top:12px;justify-content:flex-end;">
                                <span style="font-size:9px;font-weight:700;color:#94a3b8;">Menos</span>
                                <div style="width:18px;height:12px;background:#f8fafc;border-radius:3px;border:1px solid #e2e8f0;"></div>
                                <div style="width:18px;height:12px;background:#fef3c7;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#fde68a;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#fbbf24;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#f59e0b;border-radius:3px;"></div>
                                <div style="width:18px;height:12px;background:#ef4444;border-radius:3px;"></div>
                                <span style="font-size:9px;font-weight:700;color:#94a3b8;">mas</span>
                            </div>`;

                            calContainer.innerHTML = heatHTML;
                        }
                    } catch (e) { console.error("Error in renderCalendarHeatmap:", e); }

                    try {
                        renderHCRegistry(uniqueEmps);
                    } catch (e) { console.error("Error in renderHCRegistry:", e); }
                } catch (err) { console.error('  renderGeneral ERROR:', err); }
            }

            function renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw, activeHC_val, bajasPeriod_val, filteredBajas_list = []) {
                window.lastActiveHC = uniqueEmps;
                const f = getFilters();
                const { p: pais2, e: emp2, a: areaSel, d: deptoSel, yc, mc, comp, countries } = f;


                // --- HC TYPE SWITCH LOGIC (NETO VS BRUTO) ---
                window._hcType = window._hcType || 'neto';
                const isNeto = window._hcType === 'neto';
                
                // UI Toggle Sync (Handles multiple instances)
                const fMode = window._flagMode || 'hc';
                // Unified High-Contrast Sync for all metric button groups
                document.querySelectorAll('.hc-type-btn-neto').forEach(b => b.classList.toggle('active', isNeto));
                document.querySelectorAll('.hc-type-btn-bruto').forEach(b => b.classList.toggle('active', !isNeto));
                document.querySelectorAll('.metric-btn-hc').forEach(b => b.classList.toggle('active', fMode === 'hc'));
                document.querySelectorAll('.metric-btn-altas').forEach(b => b.classList.toggle('active', fMode === 'altas'));
                document.querySelectorAll('.metric-btn-bajas').forEach(b => b.classList.toggle('active', fMode === 'bajas'));






                // 1. Time Scope Setup (Improved Fallback for Historical Charts)
                let historyYears = [...new Set(empsRaw.map(e => parseInt(e.y)))].sort((a,b)=>b-a);
                let maxHistoryYear = historyYears[0] || 2025;
                
                // If selected year has no history, use maxHistoryYear
                let selectedY = f.y === 'ALL' ? maxHistoryYear : parseInt(f.y);
                const hasHistoryForSelected = empsRaw.some(e => e.y == selectedY);
                const targetY = hasHistoryForSelected ? selectedY : maxHistoryYear;

                let latestHistoryM = 1;
                const yearHistory = empsRaw.filter(e => e.y == targetY);
                if (yearHistory.length > 0) {
                    latestHistoryM = Math.max(...yearHistory.map(e => parseInt(e.m)));
                }
                const targetM = (f.m === 'ALL' || f.m === '0') ? latestHistoryM : parseInt(f.m);

                var z_flagsTotalEl = document.getElementById('z_flagsTotalEl');
                if(z_flagsTotalEl) {
                    z_flagsTotalEl.innerText = `(${uniqueEmps.length})`;
                }

                const countryFlagMap = { 'TYT': 'tt', 'RD': 'do', 'GT': 'gt', 'CR': 'cr', 'HN': 'hn', 'SV': 'sv', 'NC': 'ni', 'PA': 'pa', 'PY': 'py', 'JM': 'jm' };
                // COMP DATA CALCULATION
                let compCountByPa = {};
                let compCostsByPa = {};
                if (comp) {
                    const compEmps = (app.employees || []).filter(item => {
                        const nPa = normalizePa(item.pa);
                        const mPa = countries.length === 0 || countries.includes(nPa);
                        return mPa && (emp2 === 'ALL' || item.e === emp2) && (areaSel === 'ALL' || item.dir === areaSel) && (deptoSel === 'ALL' || item.d === deptoSel) && (yc === 'ALL' || item.y == yc) && (mc === 'ALL' || item.m == mc);
                    });
                    compEmps.forEach(e => {
                        let c = normalizePa(e.pa);
                        compCountByPa[c] = (compCountByPa[c] || 0) + 1;
                        compCostsByPa[c] = (compCostsByPa[c] || 0) + (Number(e.so) || 0) + (Number(e.b37) || 0) + (Number(e.b78) || 0) + (Number(e.bv) || 0) + (Number(e.he) || 0);
                    });
                }

                // CONTEXT FILTERED DATA (Reserves Empresa/area/Depto but allows all Years/Months for recovery)
                const contextEmps = empsRaw.filter(e => {
                    const curPa = normalizePa(e.pa);
                    const matchPa = countries.length === 0 || countries.includes(curPa);
                    return matchPa &&
                        (emp2 === 'ALL' ? true : e.e === emp2) &&
                        (areaSel === 'ALL' ? true : e.dir === areaSel) &&
                        (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel);
                });
                const monthNamesArr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                // currentHC = unique active employees in current period
                const currentHC = uniqueEmps.length;
                const showMap = document.getElementById('toggleMapCheck')?.checked || false;

                const mapRow = document.getElementById('mapContainerRow');
                if (mapRow) {
                    mapRow.style.display = showMap ? 'flex' : 'none';
                    mapRow.style.marginTop = '-20px';
                }

                const btnMapa = document.getElementById('btnVerMapa');
                if (btnMapa) {
                    if (showMap) {
                        btnMapa.style.background = 'linear-gradient(135deg, var(--ac), var(--ac))';
                        btnMapa.style.color = '#fff';
                        btnMapa.style.boxShadow = '0 4px 15px rgba(99,102,241,0.4)';
                    } else {
                        btnMapa.style.background = 'transparent';
                        btnMapa.style.color = '#64748b';
                        btnMapa.style.boxShadow = 'none';
                    }
                }



                // --- OPTIMIZED WORKING SET FOR ALL VISUALS ---
                let workingSet = [];
                const isAllMonths = (f.m === 'ALL' || f.m === '0');

                if (fMode === 'hc') {
                    // Year-only filters stay as full-year totals; month filters remain monthly.
                    const snapshotM = parseInt(f.m);
                    const relevantUnique = isAllMonths
                        ? uniqueEmps.filter(e => e.y == targetY)
                        : uniqueEmps.filter(e => e.y == targetY && e.m == snapshotM);
                    const relevantBajas = isAllMonths
                        ? filteredBajas_list.filter(b => b.y == targetY)
                        : filteredBajas_list.filter(b => b.y == targetY && b.m == snapshotM);
                    const currentBajasSet = new Set(relevantBajas.map(personKey));
                    workingSet = isNeto ? relevantUnique.filter(e => !currentBajasSet.has(personKey(e))) : relevantUnique;
                } else if (fMode === 'altas') {
                    // For Altas, we show aggregate for the year if ALL, or month
                    workingSet = uniqueEmps.filter(e => {
                        const matchY = e._fiY == targetY;
                        const matchM = isAllMonths ? true : e._fiM == targetM;
                        return matchY && matchM;
                    });
                } else if (fMode === 'bajas') {
                    workingSet = (app.bajas_list || []).filter(b => {
                        const matchY = b.y == targetY;
                        const matchM = isAllMonths ? true : b.m == targetM;
                        return matchY && matchM;
                    });
                }

                // Accumulators for Regional/Radar/Flags - ULTRA pass
                const countByPa = {}, countByE = {}, countByDir = {};
                for (let i = 0, len = workingSet.length; i < len; i++) {
                    const e = workingSet[i];
                    const pa = e._pa || e.pa;
                    countByPa[pa] = (countByPa[pa] || 0) + 1;

                    const matchP = (countries.length === 0 || countries.includes(pa));
                    if (!matchP) continue;

                    const eDir = e._dir || e.dir || e.area || e.DIRECCION || e.d || 'Sin area';
                    const eEmp = e._e || e.e || e.EMPRESA;
                    
                    const matchD = (areaSel === 'ALL' || eDir === areaSel);
                    const matchE = (emp2 === 'ALL' || eEmp === emp2);

                    if (matchD) {
                        if(eEmp) countByE[eEmp] = (countByE[eEmp] || 0) + 1;
                    }
                    if (matchE) {
                        countByDir[eDir] = (countByDir[eDir] || 0) + 1;
                    }
                }

                const totalFlags = Object.values(countByPa).reduce((a,b) => a+b, 0) || 0;
                if (z_flagsTotalEl) z_flagsTotalEl.innerText = `${totalFlags.toLocaleString()}`;

                // --- DYNAMIC LABELS UPDATE ---
                let metricLabel = "TOTAL HC NETO";
                if (window._flagMode === 'altas') metricLabel = "TOTAL ALTAS";
                else if (window._flagMode === 'bajas') metricLabel = "TOTAL BAJAS";
                else if (window._hcType === 'bruto') metricLabel = "TOTAL HC BRUTO";

                const rLabel = document.getElementById('regBadgeLabel');
                const dLabel = document.getElementById('distBadgeLabel');
                if (rLabel) rLabel.innerText = metricLabel;
                if (dLabel) dLabel.innerText = metricLabel.replace("TOTAL", "DISTRIBUCIÃ“N");

                const radarTotalSum = document.getElementById('radarTotalSum');
                if (radarTotalSum) radarTotalSum.innerText = `${totalFlags.toLocaleString()}`;


                // Header Donut & Legend Redesigned
                const donutCanv = document.getElementById('regDonutChart');
                if (donutCanv) {
                    const fullData = Object.entries(countByPa).filter(e => e[1] > 0).sort((a,b) => b[1]-a[1]);
                    
                    // Logic for Top 2 + Resto
                    let dLabels = [], dValues = [], dColors = [], legendData = [];
                    let restoHc = 0;
                    
                    fullData.forEach((e, i) => {
                        if (i < 2) {
                            dLabels.push(e[0]);
                            dValues.push(e[1]);
                            const cCol = (countryStyles[e[0]] || {color:'#cbd5e1'}).color;
                            dColors.push(cCol);
                            legendData.push({ name: (paisMap[e[0]]||e[0]).replace('Rep  ', 'R. '), val: e[1], pct: Math.round((e[1]/totalFlags)*100), color: cCol });
                        } else {
                            restoHc += e[1];
                        }
                    });
                    
                    if (restoHc > 0) {
                        dLabels.push('RESTO');
                        dValues.push(restoHc);
                        const restoCol = 'rgba(139, 92, 246, 0.15)';
                        dColors.push(restoCol);
                        legendData.push({ name: 'Resto', val: restoHc, pct: Math.round((restoHc/totalFlags)*100), color: restoCol });
                    }

                    // Centered percentage (Top 2 combined)
                    const top2Pct = legendData.slice(0, 2).reduce((acc, curr) => acc + parseFloat(curr.pct), 0);
                    const regDonutPct = document.getElementById('regDonutPct');
                    if (regDonutPct) regDonutPct.innerText = `${Math.round(top2Pct)}%`;

                    window.activeCharts.push(new Chart(donutCanv.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: dLabels,
                            datasets: [{ data: dValues, backgroundColor: dColors, borderWidth: 0, hoverOffset: 4 }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '75%',
                            plugins: { legend: { display: false }, tooltip: { enabled: true } }
                        }
                    }));

                    const regLegend = document.getElementById('regLegend');
                    if (regLegend) {
                        regLegend.innerHTML = legendData.map(d => `
                            <div class="reg-legend-item">
                                <div class="reg-legend-tag">
                                    <div class="reg-legend-dot" style="background:${d.color}"></div>
                                    <span style="white-space:nowrap;">${d.name}</span>
                                </div>
                                <span class="reg-legend-val">${d.pct}%</span>
                            </div>
                        `).join('');
                    }
                }

                const radarTitleEl = document.getElementById('radarTitleEl');
                if (radarTitleEl) radarTitleEl.innerText = fMode === 'altas' ? 'RADAR: ALTAS' : (fMode === 'bajas' ? 'RADAR: BAJAS' : `DISTRIBUCIÃ“N Proporcional`);

                const priorityCountries = ['GT', 'CR', 'HN', 'SV', 'NC', 'PA', 'PY', 'JM', 'TYT', 'RD'];
                const countryGrid = document.getElementById('countryGrid');
                if (countryGrid) {
                    const showNoMovementCountries = !!document.getElementById('toggleNoMovementCheck')?.checked;
                    const noMovementBtn = document.getElementById('btnSinMov');
                    if (noMovementBtn) noMovementBtn.classList.toggle('active', showNoMovementCountries);
                    const sortedCountries = priorityCountries
                        .map(c => ({ code: c, val: countByPa[c] || 0 }))
                        .filter(({ code, val }) => code !== 'RD' || val > 0 || showNoMovementCountries)
                        .sort((a, b) => b.val - a.val);

                    const totalFlags = priorityCountries.reduce((a, c) => a + (countByPa[c] || 0), 0) || 1;
                    countryGrid.innerHTML = sortedCountries.map(({ code: c, val }) => {
                        const st = getStyle(c);
                        const isSel = window.selectedCountries.includes(c);
                        const pct = ((val / totalFlags) * 100).toFixed(1);
                        const bgCol = st.color ? st.color + '18' : 'rgba(0,0,0,0.05)';
                        const paCode = countryFlagMap[c] || c;

                        // MoM Trend logic
                        let pm = m === 'ALL' ? (window.lastM || 1) : parseInt(m);
                        let py = m === 'ALL' ? (window.lastY || 2026) : parseInt(y);
                        let prevPm = pm - 1; let prevPy = py;
                        if (prevPm === 0) { prevPm = 12; prevPy -= 1; }
                        const prevMoEmps = empsRaw.filter(e => {
                            const matchPa = normalizePa(e.pa) === c;
                            const matchDate = (e.y == prevPy && parseInt(e.m) == prevPm);
                            const matchE = (emp2 === 'ALL' || e.e === emp2 || e.EMPRESA === emp2);
                            const matchA = (areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel);
                            const matchD = (deptoSel === 'ALL' || (e.d || e.depto || e.DEPARTAMENTO) === deptoSel);
                            return matchPa && matchDate && matchE && matchA && matchD;
                        });
                        const diff = val - prevMoEmps.length;
                        
                        let trendHtml = `<div class="country-trend neutral"><i class="fas fa-minus"></i> 0</div>`;
                        if (diff > 0) trendHtml = `<div class="country-trend up"><i class="fas fa-caret-up"></i> +${diff}</div>`;
                        else if (diff < 0) trendHtml = `<div class="country-trend down"><i class="fas fa-caret-down"></i> ${diff}</div>`;

                        // Update Main Section Subtitle
                        const monthNamesFull = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                        const prevMonthName = monthNamesFull[(prevPm - 1 + 12) % 12];
                        const subHeader = document.getElementById('regionalSubTitle');
                        if (subHeader) subHeader.innerHTML = `Colaboradores en nomina <span style="font-weight:400; font-size:11px; opacity:0.6; margin-left:8px;">(Versus ${prevMonthName})</span>`;

                        return `
                            <div class="country-card ${isSel ? 'active' : ''}" onclick="toggleCountry('${c}')">
                                <div style="position: absolute; top: 10px; right: 10px; transform: scale(0.9);">
                                    ${trendHtml}
                                </div>
                                <div style="display:flex; align-items:center; justify-content:center; width:100%; margin-bottom: 6px; margin-top: 4px; flex-shrink: 0;">
                                    <div style="background: #fff; border-radius:6px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); padding: 3px;">
                                        <img src="https://flagcdn.com/w160/${paCode.toLowerCase()}.png" class="country-card-flag" alt="${c}" onerror="this.src='https://flagcdn.com/w160/un.png'" style="width:40px; height:28px; flex-shrink:0; border-radius: 4px; display:block; object-fit: cover;">
                                    </div>
                                </div>
                                <div class="country-card-name" style="margin-top: 4px; font-size: 11px; font-weight: 1000; letter-spacing: 0.5px; color:#64748b; flex-shrink: 0;">${(paisMap[c] || c).replace('Rep  ', 'R. ')}</div>
                                <div class="country-card-val" style="display: block !important; font-size: 26px !important; margin: 4px 0 !important; font-weight: 1000 !important; color: #1e293b !important; opacity: 1 !important; line-height: 1; flex-shrink: 0;">${val || '0'}</div>
                                <div class="country-card-footer" style="width: 100%; margin-top: auto; padding: 0 4px; flex-shrink: 0;">
                                    <div class="country-card-progress" style="background: ${bgCol}; height:10px; border-radius:10px;">
                                        <div class="country-card-bar" style="width: ${pct}%; height:100%; border-radius:10px; background: linear-gradient(90deg, ${st.color}, ${st.color}cc);"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // --- RADAR REGIONAL (Segmentador HC Real) ---
                try {
                    const ctxRadarReg = document.getElementById('radarRegional');
                    if (ctxRadarReg) {
                        const dim = window._radarDim || 'pa';
                        
                        // Sync active link
                        document.querySelectorAll('.radar-dim-link').forEach(el => el.style.color = '#64748b');
                        const dimLinkMap = { 'pa': 'dimPa', 'e': 'dimE', 'dir': 'dimDir' };
                        const activeDimLink = document.getElementById(dimLinkMap[dim]);
                        if (activeDimLink) activeDimLink.style.color = '#8b5cf6';

                        const dataMap = {};
                        workingSet.forEach(e => {
                            let key = '';
                            if (dim === 'pa') key = normalizePa(e.pa);
                            else if (dim === 'e') key = e.e || 'N/A';
                            else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                            if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                        });
                        const sorted = Object.entries(dataMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
                        if (sorted.length > 0) {
                            const labels = sorted.map(([k,v]) => {
                                if(dim==='pa') return (paisMap[k]||k).substring(0,12);
                                return k.substring(0,14);
                            });
                            const values = sorted.map(([,v])=>v);
                            const colors = sorted.map(([k]) => {
                                if(dim==='pa') return (window.countryStyles||{})[k]?.color || '#6366f1';
                                const p=['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
                                return p[sorted.indexOf(sorted.find(x=>x[0]===k)) % p.length];
                            });
                            window.activeCharts.push(new Chart(ctxRadarReg.getContext('2d'), {
                                type: 'radar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'HC',
                                        data: values,
                                        backgroundColor: colors.map(c => c + '33'),
                                        borderColor: colors,
                                        borderWidth: 3,
                                        pointRadius: 4,
                                        pointBackgroundColor: '#fff'
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        datalabels: {
                                            display: true, anchor: 'center', align: 'center',
                                            color: '#1e293b', font: { size: 10, weight: 1000 },
                                            formatter: (v) => v.toLocaleString()
                                        }
                                    },
                                    scales: {
                                        r: {
                                            ticks: { display: false },
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            angleLines: { color: 'rgba(0,0,0,0.05)' },
                                            pointLabels: { font: { size: 10, weight: 800, family: 'Montserrat' }, color: '#334155' }
                                        }
                                    },
                                    animation: false
                                },
                                plugins: [ChartDataLabels]
                            }));
                        }
                    }
                } catch (e) { console.error('radarRegional error:', e); }

                // --- CAMBIO 2: Premium HTML-Based List (DISTRIBUCIÃ“N Proporcional) ---
                const ctxDistProp = document.getElementById('chartDistPropBar');
                if (ctxDistProp) {
                    try {
                        const dim = window._distPropDim || 'e';
                        let dataMap = {};
                        
                        // Active dimension sync
                        document.querySelectorAll('.dist-prop-link').forEach(el => el.classList.remove('active'));
                        const dimIdMap = { 'pa': 'dpDimPa', 'e': 'dpDimE', 'dir': 'dpDimDir', 'd': 'dpDimD' };
                        if(document.getElementById(dimIdMap[dim])) document.getElementById(dimIdMap[dim]).classList.add('active');

                        // Data Aggregation (Uses workingSet)
                        workingSet.forEach(e => {
                            let key = '';
                            if (dim === 'pa') key = normalizePa(e.pa);
                            else if (dim === 'e') key = e.e || 'N/A';
                            else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                            else if (dim === 'd') key = e.d || e.depto || 'N/A';
                            
                            if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                        });

                        // Sorting (Major a Menor) & Rendering
                        const gridContainer = document.getElementById('distGridContainer');
                        if (gridContainer) {
                            const totalAll = Object.values(dataMap).reduce((a, b) => a + b, 0) || 1;
                            const sortedEntries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);

                            // 1. UPDATE LARGE DONUT (LEFT)
                            const ctxBigDonut = document.getElementById('chartDistPropDonutBig');
                            if (ctxBigDonut) {
                                const labels = sortedEntries.map(e => e[0]);
                                const values = sortedEntries.map(e => e[1]);
                                const colors = sortedEntries.map(e => {
                                    if (dim === 'pa') return (getStyle(e[0]).color || '#8b5cf6');
                                    // Use a varied palette for non-country dimensions
                                    const palettes = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f472b6'];
                                    return palettes[labels.indexOf(e[0]) % palettes.length];
                                });

                                window.activeCharts.push(new Chart(ctxBigDonut.getContext('2d'), {
                                    type: 'doughnut',
                                    data: {
                                        labels: labels,
                                        datasets: [{
                                            data: values,
                                            backgroundColor: colors,
                                            borderWidth: 2,
                                            borderColor: '#fff',
                                            hoverOffset: 15
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '60%',
                                        layout: {
                                            padding: 20
                                        },
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true },
                                            datalabels: {
                                                display: (ctx) => {
                                                    const val = ctx.dataset.data[ctx.dataIndex];
                                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                                    return (val / total) > 0.04; // Umbral del 4% para mostrar etiqueta
                                                },
                                                color: '#fff',
                                                font: { weight: '900', size: 11, family: "'Montserrat', sans-serif" }, 
                                                textShadowBlur: 4,
                                                textShadowColor: 'rgba(0,0,0,0.4)',
                                                formatter: (val, ctx) => {
                                                    const label = ctx.chart.data.labels[ctx.dataIndex];
                                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                                    const pct = Math.round((val / total) * 100);
                                                    const shortLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
                                                    return shortLabel + '\n' + pct + '%';
                                                },
                                                padding: 6,
                                                textAlign: 'center',
                                                align: 'center',
                                                anchor: 'center'
                                            }
                                        },
                                        animation: false
                                    },
                                    plugins: [ChartDataLabels]
                                }));
                                if (document.getElementById('distPropTotalLarge')) document.getElementById('distPropTotalLarge').innerText = totalAll.toLocaleString();
                            }

                            // 2. UPDATE CARDS (RIGHT)
                            gridContainer.innerHTML = sortedEntries.map(([k, val], idx) => {
                                const pct = (val / totalAll * 100).toFixed(0);
                                const st = (dim === 'pa') ? getStyle(k) : { 
                                    color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f472b6'][idx % 7] 
                                };
                                const fullName = (dim === 'pa') ? (paisMap[k] || k).toUpperCase() : k.toUpperCase();
                                
                                return `
                                    <div class="dist-card-premium" style="display:flex; align-items:center; gap:15px; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.05); animation: fadeInRight 0.5s ease both ${idx * 0.05}s;">
                                        <div style="width:4px; height:45px; background:${st.color}; border-radius:10px;"></div>
                                        <div style="flex:1; min-width:0;">
                                            <div style="font-size:13px; font-weight:1000; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fullName}</div>
                                            <div style="display:flex; align-items:baseline; gap:6px; margin-top:2px;">
                                                <span style="font-size:22px; font-weight:1000; color:#1e293b; line-height:1;">${val.toLocaleString()}</span>
                                                <span style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase;">COLABORADORES</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('');
                            
                            // 3. UPDATE SUMMARY BAR (BOTTOM)
                            const dimLabelMap = { 'pa': 'PAISES', 'e': 'EMPRESAS', 'dir': 'DIRECCIONES', 'd': 'DEPTOS' };
                            const dimLabel = dimLabelMap[dim] || 'DIMENSIONES';
                            
                            if (document.getElementById('distSummaryTotal')) document.getElementById('distSummaryTotal').innerText = totalAll.toLocaleString();
                            if (document.getElementById('distSummaryDims')) document.getElementById('distSummaryDims').innerText = sortedEntries.length;
                            if (document.getElementById('distSummaryDimsLabel')) document.getElementById('distSummaryDimsLabel').innerText = `${dimLabel} | DESGLOSE ACTIVO`;
                            if (document.getElementById('distPropTotal')) document.getElementById('distPropTotal').innerText = totalAll.toLocaleString();
                            
                            // Hide legacy items
                            ctxDistProp.style.display = 'none';
                        }
                    } catch (e) { console.error("DistProp Premium Render failed:", e); }
                }

                // --- CAMBIO 3: 5-Axis Talent Radar & Insights ---
                const ctxTalent = document.getElementById('chartTalentRadar');
                if (ctxTalent) {
                    try {
                        // Calculate Radar Metrics
                        const totalHC = uniqueEmps.length || 1;
                        const isAllM = (f.m === 'ALL' || f.m === '0');
                        const altas = uniqueEmps.filter(e => e._fiY == targetY && (isAllM ? true : e._fiM == targetM)).length;
                        const bajas = (app.bajas_list || []).filter(b => b.y == targetY && (isAllM ? true : b.m == targetM)).length;
                        
                        // 1. Altas Ratio (Altas / HC) scaled to 0-100
                        const altasScore = Math.min((altas / totalHC) * 500, 100); 
                        // 2. Bajas Ratio (Inverse: Low bajas = High score)
                        const bajasScore = Math.max(100 - (bajas / totalHC) * 500, 0);
                        // 3. Turnover (Inverse: Low turnover = High score)
                        const turnover = (bajas / totalHC) * 100;
                        const turnoverScore = Math.max(100 - (turnover * 5), 0);
                        // 4. Estabilidad (HC that stayed)
                        const stability = ((totalHC - bajas) / totalHC) * 100;
                        const stabilityScore = stability;
                        // 5. Crecimiento (Net change)
                        const growth = ((altas - bajas) / totalHC) * 100;
                        const growthScore = 50 + (growth * 2.5); // 50 is baseline

                        const radarData = [altasScore, bajasScore, turnoverScore, stabilityScore, growthScore];
                        const labels = ['ALTAS', 'RetenciÃ³n (INV. BAJAS)', 'FIDELIDAD (INV. TO)', 'ESTABILIDAD', 'CRECIMIENTO'];

                        window.activeCharts.push(new Chart(ctxTalent.getContext('2d'), {
                            type: 'radar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'MÃ¡s de Talento',
                                    data: radarData,
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                    borderColor: '#8b5cf6',
                                    borderWidth: 3,
                                    pointBackgroundColor: '#8b5cf6',
                                    pointBorderColor: '#fff',
                                    pointRadius: 5
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    r: {
                                        min: 0,
                                        max: 100,
                                        ticks: { display: false },
                                        pointLabels: {
                                            font: { size: 10, weight: 800, family: 'Montserrat' },
                                            color: '#64748b'
                                        },
                                        grid: { color: 'rgba(99,102,241,0.1)' }
                                    }
                                },
                                plugins: { legend: { display: false } }
                            }
                        }));

                        // Automated Insights logic
                        const insCont = document.getElementById('talentInsights');
                        if (insCont) {
                            let html = '';
                            const scoreAvg = radarData.reduce((a,b)=>a+b,0) / 5;
                            const status = scoreAvg > 75 ? 'Healthy' : (scoreAvg > 50 ? 'Stable' : 'Critical');
                            const statusCol = scoreAvg > 75 ? '#10b981' : (scoreAvg > 50 ? '#f59e0b' : '#ef4444');
                            
                            if(document.getElementById('talentScoreLabel')) {
                                document.getElementById('talentScoreLabel').innerText = status;
                                document.getElementById('talentScoreLabel').style.color = statusCol;
                            }

                            // Growth Insight
                            if (growth > 0) {
                                html += `<div class="insight-pill positive"><i class="fas fa-arrow-trend-up"></i><div>Crecimiento Neto Positivo: El equipo se expandi  un <b>${growth.toFixed(1)}%</b> este periodo.</div></div>`;
                            } else if (growth < 0) {
                                html += `<div class="insight-pill danger"><i class="fas fa-arrow-trend-down"></i><div>Contracci  de Equipo: Reducci  neta del <b>${Math.abs(growth).toFixed(1)}%</b> detected.</div></div>`;
                            }

                            // Turnover Insight
                            if (turnover < 2) {
                                html += `<div class="insight-pill positive"><i class="fas fa-check-circle"></i><div>Fidelidad Alta: RotaciÃ³n mensual controlada por debajo del benchmark (<b>${turnover.toFixed(1)}%</b>).</div></div>`;
                            } else {
                                html += `<div class="insight-pill warning"><i class="fas fa-exclamation-triangle"></i><div>Alerta de Salidas: RotaciÃ³n de <b>${turnover.toFixed(1)}%</b> requiere revisi  de clima.</div></div>`;
                            }

                            // Stability Insight
                            if (stability > 98) {
                                html += `<div class="insight-pill positive"><i class="fas fa-shield-alt"></i><div>N  Estable: El <b>${stability.toFixed(1)}%</b> de la fuerza laboral se mantiene firme.</div></div>`;
                            }

                            insCont.innerHTML = html;
                        }

                    } catch (e) { console.error("Talent Radar failed:", e); }
                }


                // Composition HC por Pais (LINE CHART)
                const ctxareaComp = document.getElementById('chartCompositionarea');
                if (ctxareaComp) {
                    try {
                        const vLen = window._hcViewLength || 6;
                        const labels = [];
                        const datasets = [];
                        const fColors = {
                             'GT': '#3b82f6', 'PA': '#ef4444', 'SV': '#6366f1', 'HN': '#0ea5e9', 
                             'NI': '#38bdf8', 'CR': '#f43f5e', 'DO': '#2563eb', 'US': '#1e293b',
                             'PY': '#F97316', 'TT': '#94A3B8'
                        };
                        const pMap = {
                            'GT': 'Guatemala', 'PA': 'PanamÃ¡', 'SV': 'El Salvador', 'HN': 'Honduras',
                            'NI': 'Nicaragua', 'CR': 'Costa Rica', 'DO': 'Rep. Dominicana', 'US': 'USA',
                            'PY': 'Paraguay', 'TT': 'Trinidad & Tobago'
                        };
                        const mShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                        const allPaCodes = [...new Set(empsRaw.map(e => normalizePa(e.pa)))].filter(c => c && c !== 'PENDIENTE').sort();
                        const countryDataArr = {};
                        allPaCodes.forEach(c => countryDataArr[c] = []);

                        for (let i = 0; i < vLen; i++) {
                            let cY = targetY, cM = targetM - (vLen - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            labels.push(mShort[cM - 1]);
                            
                            allPaCodes.forEach(c => {
                                const s = new Set();
                                for (let j = 0; j < empsRaw.length; j++) {
                                    const e = empsRaw[j];
                                    if (e.y == cY && e.m == cM && normalizePa(e.pa) === c && (emp2 === 'ALL' || e.e === emp2)) s.add(e.c || e.n);
                                }
                                countryDataArr[c].push(s.size);
                            });
                        }

                        const datasetsMapArr = allPaCodes.map(c => {
                            const bColor = fColors[c] || '#94a3b8';
                            return {
                                label: pMap[c] || c,
                                data: countryDataArr[c],
                                fill: false,
                                borderColor: bColor,
                                borderWidth: 4,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                tension: 0.4,
                                datalabels: {
                                    display: (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 && ctx.dataset.data[ctx.dataIndex] > 0,
                                    align: 'end',
                                    anchor: 'end',
                                    color: bColor,
                                    font: { weight: 1000, size: 10 },
                                    formatter: (v) => v
                                }
                            };
                        });

                        window.activeCharts.push(new Chart(ctxareaComp.getContext('2d'), {
                            type: 'line',
                            plugins: [ChartDataLabels],
                            data: { labels, datasets: datasetsMapArr },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        titleFont: { size: 13, weight: 800 },
                                        bodyFont: { size: 11, weight: 600 },
                                        padding: 12,
                                        cornerRadius: 10,
                                        callbacks: {
                                            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.03)' },
                                        ticks: { font: { size: 10, weight: 700 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { font: { size: 10, weight: 800 } }
                                    }
                                }
                            }
                        }));

                        // Update Legend and Total HC
                        const lastMonthData = allPaCodes.map(c => ({
                            code: c,
                            label: pMap[c] || c,
                            value: countryDataArr[c][vLen - 1],
                            color: fColors[c] || '#94a3b8'
                        })).sort((a, b) => b.value - a.value);

                        const totalLast = lastMonthData.reduce((s, v) => s + v.value, 0);
                        const totalEl = document.getElementById('compHeaderTotal');
                        if (totalEl) totalEl.querySelector('h4').innerText = totalLast.toLocaleString();

                        const legendContainer = document.getElementById('areaCompLegend');
                        if (legendContainer) {
                            legendContainer.innerHTML = lastMonthData.map(d => {
                                const pct = totalLast > 0 ? ((d.value / totalLast) * 100).toFixed(1) : '0.0';
                                return `
                                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; background:#f8fafc; border-radius:10px; border-left:4px solid ${d.color}; border-bottom: 1px solid #e2e8f0; min-height:48px;">
                                        <div style="display:flex; flex-direction:column; overflow:hidden;">
                                            <span style="font-size:11px; font-weight:800; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.label}</span>
                                            <span style="font-size:10px; font-weight:700; color:#64748b;">${pct}%</span>
                                        </div>
                                        <div style="font-size:12px; font-weight:1000; color:${d.color};">${d.value}</div>
                                    </div>
                                `;
                            }).join('');
                        }
                    } catch (e) { console.error("Composition area Chart failed:", e); }
                }

                // New Headcount Comparative Charts for HC Tab
                const ctxYoY = document.getElementById('chartAcumuladoYoY');
                if (ctxYoY) {
                    const curY = parseInt(targetY) || 2026;
                    const prevY = curY - 1;
                    const curD = Array(12).fill(0), prevD = Array(12).fill(0);
                    empsRaw.forEach(e => {
                        const curPa = normalizePa(e.pa);
                        const matchP = (countries.length === 0 || countries.includes(curPa));
                        const matchE = (emp2 === 'ALL' || e.e === emp2);
                        
                        let ey = parseInt(e._y || e.y || 0);
                        if(ey < 100) ey += 2000;
                        let em = parseInt(e._m || e.m || 1);
                        
                        if (matchP && matchE) {
                            if (ey === curY) {
                                if(em >= 1 && em <= 12) curD[em - 1]++;
                            } else if (ey === prevY) {
                                if(em >= 1 && em <= 12) prevD[em - 1]++;
                            }
                        }
                    });
                    let cS = 0, pS = 0;
                    const cA = curD.map(v => { cS += v; return cS; });
                    const pA = prevD.map(v => { pS += v; return pS; });
                    window.activeCharts.push(new Chart(ctxYoY.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
                            datasets: [
                                { label: String(curY), data: cA, borderColor: '#8b5cf6', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
                                { label: String(prevY), data: pA, borderColor: '#94a3b8', borderDash: [5,5], fill: false, tension: 0.4 }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                    }));
                }

                const ctxareaReal2Main = document.getElementById('chartClassic14areas');
                if (ctxareaReal2Main) {
                    const dCounts = {};
                    uniqueEmps.forEach(e => { const d = e.dir || e.area || 'Sin area'; dCounts[d] = (dCounts[d] || 0) + 1; });
                    const topDir = Object.entries(dCounts).sort((a,b) => b[1]-a[1]).slice(0, 10);
                    window.activeCharts.push(new Chart(ctxareaReal2Main.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: topDir.map(d => d[0]),
                            datasets: [{
                                data: topDir.map(d => d[1]),
                                backgroundColor: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#14b8a6','#64748b']
                            }]
},
                        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 9, weight: 700 } } } } }
                    }));
                }
                // Define DrawMap as a child of renderExecutiveCharts to access localized data
                // --- PREMIUmasVG MAP INTEGRATION ---
                window.drawMap = (data) => {
                    const mapEl = document.getElementById('mapRegionCtx');
                    if (!mapEl) return;

                    const countryCounts = Object.assign({}, countByPa || {});
                    const mapCountries = ['GT', 'CR', 'HN', 'SV', 'NC', 'NI', 'PA', 'PN', 'PY', 'JM', 'TYT', 'TT', 'RD', 'DO', 'BZ', 'HT', 'PR', 'CU'];

                    if (!Object.keys(countryCounts).length) {
                        const empsToUse = data || uniqueEmps || [];
                        empsToUse.forEach(e => {
                            const pa = normalizePa(e.pa || e.p);
                            if (pa) countryCounts[pa] = (countryCounts[pa] || 0) + 1;
                        });
                    }

                    // Merge aliases
                    if (countryCounts.TT && !countryCounts.TYT) countryCounts.TYT = countryCounts.TT;
                    if (countryCounts.TYT && !countryCounts.TT) countryCounts.TT = countryCounts.TYT;
                    if (countryCounts.DO && !countryCounts.RD) countryCounts.RD = countryCounts.DO;
                    if (countryCounts.RD && !countryCounts.DO) countryCounts.DO = countryCounts.RD;
                    if (countryCounts.NI && !countryCounts.NC) countryCounts.NC = countryCounts.NI;

                    const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                    mapCountries.forEach(c => {
                        const ovrKey = `${c}_${emp2}_${y}_${m}`;
                        if (overrides[ovrKey] && overrides[ovrKey].hc !== null) {
                            countryCounts[c] = overrides[ovrKey].hc;
                        }
                    });

                    // Build SVG HTML directly â€” NO DOM API, just template string
                    // The original REGIONAL_MAP_PATHS uses a coordinate system where
                    // Central America spans roughly x=0-432, y=140-400
                    // Caribbean/insets span much wider: x=540-840, y=185-420
                    // We'll use viewBox="0 0 900 460" and render everything

                    const isDark = document.body.classList.contains('dark');

                    function colorForCode(code) {
                        const st = getStyle(code);
                        const val = countryCounts[code] || 0;
                        return val > 0 ? (st.color || '#8b5cf6') : (isDark ? '#334155' : '#e2e8f0');
                    }

                    function strokeForCode(code) {
                        const val = countryCounts[code] || 0;
                        return val > 0 ? '#ffffff' : (isDark ? '#475569' : '#cbd5e1');
                    }

                    function labelForCode(code) {
                        const val = countryCounts[code] || 0;
                        return val > 0 ? String(val) : '';
                    }

                    // Center points for labels (manually calibrated for each country's path)
                    const labelCenters = {
                        'GT': [53, 220], 'BZ': [97, 160], 'SV': [95, 256], 'HN': [130, 205],
                        'NC': [185, 285], 'NI': [185, 285], 'CR': [240, 375], 'PA': [360, 400],
                        'JM': [620, 228], 'RD': [726, 200], 'DO': [726, 200],
                        'HT': [670, 205], 'TT': [836, 358], 'TYT': [836, 358],
                        'PY': [537, 450], 'CU': [500, 130], 'PR': [823, 213]
                    };

                    function buildCountryPath(code, extraClass) {
                        const p = window.REGIONAL_MAP_PATHS ? window.REGIONAL_MAP_PATHS[code] : REGIONAL_MAP_PATHS[code];
                        if (!p) return '';
                        const fill = colorForCode(code);
                        const stroke = strokeForCode(code);
                        const val = countryCounts[code] || 0;
                        const lbl = labelForCode(code);
                        const sel = (window.selectedCountries || []).includes(code);
                        const cls = sel ? 'country-path active-country' : 'country-path';
                        const sw = sel ? '2.5' : '1.2';
                        const strokeCol = sel ? '#7c3aed' : stroke;
                        let html = `<g class="country-group ${extraClass||''}" data-pa="${code}" onclick="event.stopPropagation();toggleCountry('${code}')" onmouseover="showMapTooltip(event,'${code}',${val})" onmousemove="moveMapTooltip(event)" onmouseout="hideMapTooltip()">`;
                        html += `<path d="${p.d}" fill="${fill}" stroke="${strokeCol}" stroke-width="${sw}" stroke-linejoin="round" class="${cls}" style="cursor:pointer;transition:fill 0.3s,opacity 0.3s;"/>`;
                        if (lbl) {
                            const [lx, ly] = labelCenters[code] || [0, 0];
                            html += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900" font-family="Montserrat,sans-serif" fill="#fff" style="pointer-events:none">${lbl}</text>`;
                        }
                        html += '</g>';
                        return html;
                    }

                    // Build inset cards for isolated island/distant countries
                    function buildInsetCard(code, name, flagCode, cx, cy, miniPath, miniBB) {
                        const val = countryCounts[code] || countryCounts[code.toUpperCase()] || 0;
                        const st = getStyle(code);
                        const color = val > 0 ? (st.color || '#8b5cf6') : '#94a3b8';
                        const bgFill = isDark ? '#1e293b' : '#ffffff';
                        const borderColor = val > 0 ? color + '33' : '#e2e8f0';
                        const sel = (window.selectedCountries || []).includes(code);
                        const w = 190, h = 74, r = 14;
                        const x = cx - w/2, y = cy - h/2;

                        let card = `<g class="inset-card" onclick="event.stopPropagation();toggleCountry('${code}')" onmouseover="showMapTooltip(event,'${code}',${val})" onmousemove="moveMapTooltip(event)" onmouseout="hideMapTooltip()" style="cursor:pointer">`;
                        // Card background
                        card += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bgFill}" stroke="${sel ? '#8b5cf6' : borderColor}" stroke-width="${sel ? 2 : 1.2}" filter="url(#card-drop-shadow)"/>`;
                        // Left accent bar
                        card += `<rect x="${x}" y="${y + 10}" width="4" height="${h - 20}" rx="2" fill="${color}"/>`;
                        // Country name
                        card += `<text x="${x + 16}" y="${cy - 14}" font-size="9" font-weight="900" font-family="Montserrat,sans-serif" fill="${isDark ? '#94a3b8' : '#64748b'}" letter-spacing="1">PAÃS</text>`;
                        card += `<text x="${x + 16}" y="${cy + 1}" font-size="12" font-weight="900" font-family="Montserrat,sans-serif" fill="${isDark ? '#f1f5f9' : '#1e293b'}">${name}</text>`;
                        // Headcount
                        card += `<text x="${x + 16}" y="${cy + 20}" font-size="10" font-weight="800" font-family="Montserrat,sans-serif" fill="${color}">HC: ${val}</text>`;
                        // Flag image
                        card += `<image x="${x + w - 46}" y="${cy - 16}" width="36" height="24" href="https://flagcdn.com/w40/${flagCode}.png" style="border-radius:4px"/>`;
                        card += '</g>';
                        return card;
                    }

                    const svgContent = `
<defs>
  <filter id="card-drop-shadow" x="-10%" y="-10%" width="120%" height="140%">
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#8b5cf6" flood-opacity="0.08"/>
  </filter>
  <filter id="map-glow" x="-5%" y="-5%" width="110%" height="120%">
    <feDropShadow dx="1" dy="5" stdDeviation="6" flood-color="#8b5cf6" flood-opacity="0.12"/>
  </filter>
  <style>
    .country-path { transition: fill 0.25s, opacity 0.25s; }
    .country-group:hover .country-path { opacity:0.78; }
    .inset-card:hover rect:first-child { stroke: #8b5cf6 !important; stroke-width: 1.8px !important; }
  </style>
</defs>

<!-- Ocean background -->
<rect width="900" height="460" fill="${isDark ? '#0f172a' : '#f0f4f8'}" rx="0"/>

<!-- Central America continent group -->
<g filter="url(#map-glow)">
  ${buildCountryPath('GT')}
  ${buildCountryPath('BZ')}
  ${buildCountryPath('SV')}
  ${buildCountryPath('HN')}
  ${buildCountryPath('NC')}
  ${buildCountryPath('CR')}
  ${buildCountryPath('PA')}
</g>

<!-- Caribbean islands -->
<g filter="url(#map-glow)">
  ${buildCountryPath('CU')}
  ${buildCountryPath('HT')}
  ${buildCountryPath('RD')}
  ${buildCountryPath('JM')}
  ${buildCountryPath('PR')}
  ${buildCountryPath('TT')}
  ${buildCountryPath('TYT')}
</g>

<!-- Inset cards for distant countries -->
${buildInsetCard('PY', 'Paraguay', 'py', 730, 310, null, null)}
${buildInsetCard('TT', 'Trinidad & Tobago', 'tt', 730, 390, null, null)}

<!-- Legend -->
<g transform="translate(14, 400)">
  <rect x="0" y="0" width="140" height="46" rx="10" fill="${isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)'}"/>
  <rect x="10" y="11" width="10" height="10" rx="2" fill="#8b5cf6"/>
  <text x="26" y="20" font-size="9" font-weight="800" font-family="Montserrat,sans-serif" fill="${isDark ? '#94a3b8' : '#475569'}">Con OperaciÃ³n</text>
  <rect x="10" y="28" width="10" height="10" rx="2" fill="${isDark ? '#334155' : '#e2e8f0'}" stroke="#cbd5e1" stroke-width="0.8"/>
  <text x="26" y="37" font-size="9" font-weight="800" font-family="Montserrat,sans-serif" fill="${isDark ? '#64748b' : '#94a3b8'}">Sin OperaciÃ³n</text>
</g>`;

                    mapEl.innerHTML = `<div style="position:relative;height:100%;min-height:480px;background:${isDark ? '#0f172a' : '#f0f4f8'};border-radius:20px;overflow:hidden;">
<svg id="asysRegionalSvg" viewBox="0 0 900 460" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;min-height:480px;">${svgContent}</svg>
</div>`;
                };

                if (showMap) {
                    drawMap(uniqueEmps);

                // 3. Resumen Altas/Bajas (Doughnut)
                const hiresCount = hiresSet.size;
                const bajasList = app.bajas_list || [];
                const periodBajas = bajasList.filter(b => {
                    let match = true;
                    if (countries.length > 0 && !countries.includes(normalizePa(b.pa))) match = false;
                    if (emp2 !== 'ALL' && b.e !== emp2) match = false;
                    if (y !== 'ALL' && b.y != y) match = false;
                    if (m !== 'ALL' && !compareMonth(b.m, m)) match = false;
                    return match;
                });
                const bajasCount = periodBajas.length;

                const lblHC = document.getElementById('resumenHCLabel');
                if (lblHC) lblHC.innerText = currentHC.toLocaleString();
                const lblAltas = document.getElementById('lblAltasMes');
                if (lblAltas) lblAltas.innerText = '+' + hiresCount;
                const lblBajas = document.getElementById('lblBajasMes');
                if (lblBajas) lblBajas.innerText = '-' + bajasCount;



                const ctxRes = document.getElementById('chartResumenAB');

                if (ctxRes) {
                    window.activeCharts.push(new Chart(ctxRes.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Activos', 'Capacidad Restante'],
                            datasets: [{
                                data: [currentHC, Math.max(1, Math.round(currentHC * 0.15))],
                                backgroundColor: ['#8b5cf6', '#ede9fe'],
                                borderWidth: 0,
                                cutout: '80%',
                                borderRadius: 20
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                            animation: { animateScale: true, animateRotate: true }
                        }
                    }));
                }

                const vLenHeader = window._hcViewLength || 6;
                const hcTrendPeriodElHeader = document.getElementById('hcTrendPeriod');
                if (hcTrendPeriodElHeader) hcTrendPeriodElHeader.textContent = vLenHeader;

                // Point 10: Toggle button styles
                                                if (typeof window.updateHCBtnStyles === 'function') window.updateHCBtnStyles();


                // --- 0. DATA PREPARATION (FIXED & ROLLING) ---
                const trendData = Array(12).fill(0);
                const monthlyAltas = Array(12).fill(0);
                const monthlyBajas = Array(12).fill(0);

                // Use let to avoid redeclaration issues across re-renders if necessary, 
                // though renderExecutiveCharts is usually fresh. 
                // However, the linter caught a duplicate.
                let vLenRoll = window._hcViewLength || 6;
                let vLenOldRoll = window._hcViewLengthOld || 6;

                // Update trend card headers
                const hcTrendPeriodEl_2 = document.getElementById('hcTrendPeriod');
                if (hcTrendPeriodEl_2) hcTrendPeriodEl_2.innerText = vLenRoll;
                const hcTrendOldPeriodEl = document.getElementById('hcTrendOldPeriod');
                if (hcTrendOldPeriodEl) hcTrendOldPeriodEl.innerText = vLenOldRoll;


                // (targetY and targetM are now defined at the top)

                // Populate Annual logic
                for (let month = 1; month <= 12; month++) {
                    let count = 0;
                    const seen = new Set();
                    for (let i = 0; i < empsRaw.length; i++) {
                        const e = empsRaw[i];
                        if (e.y == targetY && compareMonth(e.m, month) &&
                            (countries.length === 0 || countries.includes(normalizePa(e.pa))) &&
                            (emp2 === 'ALL' || e.e === emp2) &&
                            (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) &&
                            (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)) {
                            seen.add(e.c || e.n);
                        }
                    }
                    trendData[month - 1] = seen.size;
                }

                const seenHires = new Set();
                empsRaw.forEach(e => {
                    if ((countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                        (areaSel === 'ALL' || e.dir === areaSel || e.area === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel || e.depto === deptoSel)) {
                        if (e.fi) {
                            const parts = e.fi.split('/');
                            if (parts.length >= 3 && parseInt(parts[2]) == targetY) {
                                const mIdx = parseInt(parts[1]);
                                const personKey = (e.c || e.n) + "|" + e.fi;
                                if (mIdx >= 1 && mIdx <= 12 && !seenHires.has(personKey)) {
                                    monthlyAltas[mIdx - 1]++;
                                    seenHires.add(personKey);
                                }
                            }
                        }
                    }
                });

                const bajasArray = app.bajas_list || [];
                bajasArray.forEach(b => {
                    if ((countries.length === 0 || countries.includes(normalizePa(b.pa))) && (emp2 === 'ALL' || b.e === emp2) &&
                        (areaSel === 'ALL' || b.dir === areaSel || b.area === areaSel) && (deptoSel === 'ALL' || b.d === deptoSel || b.depto === deptoSel)) {
                        if (b.y == targetY && b.m >= 1 && b.m <= 12) monthlyBajas[b.m - 1]++;
                    }
                });

                // Rolling Window  
                const dLabels = []; const dTotal = []; const dAltas = []; const dBajas = [];
                const vLenRollAB = window._hcViewLength || 6;
                const hcTrendEndY = targetY;
                const hcTrendEndM = window._hcMirrorMode ? 12 : targetM;

                for (let i = 0; i < vLenRollAB; i++) {
                    let checkY = hcTrendEndY;
                    let checkM = hcTrendEndM - (vLenRollAB - 1 - i);
                    while (checkM < 1) { checkM += 12; checkY--; }
                    dLabels.push(monthNamesArr[checkM - 1] + (checkY !== hcTrendEndY ? " '" + String(checkY).slice(-2) : ""));

                    let c = 0; const s = new Set();
                    for (let j = 0; j < empsRaw.length; j++) {
                        const e = empsRaw[j];
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                        const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                        if (e.y == checkY && compareMonth(e.m, checkM) && matchPa && matchE && matchA && matchD) s.add(e.c || e.n);
                    }
                    
                    // Filter bajas for the period (intelligent net count)
                    const bSet = new Set((app.bajas_list || []).filter(b => {
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                        const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                        return b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD;
                    }).map(b => b.c || b.n));

                    const netCount = Array.from(s).filter(id => !bSet.has(id)).length;

                    // Push value based on Neto/Bruto mode
                    dTotal.push(isNeto ? netCount : s.size);

                    let ra = 0; const seenR = new Set();
                    for (let j = 0; j < empsRaw.length; j++) {
                        const e = empsRaw[j];
                        const pKey = (e.c || e.n);
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                        const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                        if (e.fi && matchPa && matchE && matchA && matchD) {
                            const p = e.fi.split('/');
                            if (p.length >= 3 && parseInt(p[2]) == checkY && compareMonth(parseInt(p[1]), checkM) && !seenR.has(pKey)) {
                                ra++; seenR.add(pKey);
                            }
                        }
                    }
                    dAltas.push(ra);

                    let rb = 0;
                    (app.bajas_list || []).forEach(b => {
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                        const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                        const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                        const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                        if (b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD) rb++;
                    });
                    dBajas.push(rb);
                }

                // POPULATE COMPARISON GRID
                const gridEl = document.getElementById('hcComparisonGrid');
                if (gridEl) {
                    const avgTotal = Math.round(dTotal.reduce((a, b) => a + b, 0) / dTotal.length);
                    const avgAltas = Math.round(dAltas.reduce((a, b) => a + b, 0) / dAltas.length);
                    const avgBajas = Math.round(dBajas.reduce((a, b) => a + b, 0) / dBajas.length);
                    const lastVal = { t: dTotal[dTotal.length - 1], a: dAltas[dAltas.length - 1], b: dBajas[dBajas.length - 1] };

                    gridEl.innerHTML = `
                        <div style="background:rgba(59,130,246,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(59,130,246,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(59,130,246,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#3b82f6; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">HC Promedio</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgTotal}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#3b82f6;">${lastVal.t}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#3b82f6; width:100%; opacity:0.1;"></div>
                        </div>
                        <div style="background:rgba(16,185,129,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(16,185,129,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(16,185,129,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#10b981; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">Prom. Ingresos</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgAltas}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#10b981;">${lastVal.a}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#10b981; width:100%; opacity:0.1;"></div>
                        </div>
                        <div style="background:rgba(244,63,94,0.04); padding:8px 15px; border-radius:18px; border:1.5px solid rgba(244,63,94,0.12); text-align:center; position:relative; overflow:hidden; box-shadow:0 4px 15px rgba(244,63,94,0.05);">
                            <div style="font-size:10px; font-weight:1000; color:#f43f5e; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.5px;">Prom. Bajas</div>
                            <div style="font-size:24px; font-weight:1000; color:#1e1b4b; line-height:1; letter-spacing:-1px;">${avgBajas}</div>
                            <div style="font-size:10px; font-weight:900; color:#64748b; margin-top:2px;">vs Actual: <b style="color:#f43f5e;">${lastVal.b}</b></div>
                            <div style="position:absolute; bottom:0; left:0; height:3px; background:#f43f5e; width:100%; opacity:0.1;"></div>
                        </div>
                    `;
                }

                let ytdAcc = 0;
                const dataYTD = monthlyAltas.map(a => { ytdAcc += a; return ytdAcc; });
                const dataNeto = monthlyAltas.map((a, i) => a - monthlyBajas[i]);

                // -------------------------------------------------------------------------
                // UPDATE DYNAMIC DASHBOARD TITLE (HC [PAIS] [DIR] [DEPTO] [MES] [AÃ‘O])
                // -------------------------------------------------------------------------
                const updateMainDashTitle = () => {
                    const titleEl = document.getElementById('dynamicHCTitle');
                    if (!titleEl) return;
                    
                    const f = getFilters();
                    let parts = ["HC"];
                    
                    // Solo agregamos si no es ALL
                    if (f.countries && f.countries.length > 0) {
                        const cNames = f.countries.map(c => window.paisMap ? window.paisMap[c] || c : c);
                        parts.push(cNames.join(', '));
                    }
                    if (f.a && f.a !== 'ALL') parts.push(f.a);
                    if (f.d && f.d !== 'ALL') parts.push(f.d);
                    
                    // Mes y aÃ±o
                    if (m && m !== 'ALL') {
                        const mname = window.monthNamesArr ? window.monthNamesArr[parseInt(m)-1] : m;
                        parts.push(mname.toUpperCase());
                    }
                    if (y && y !== 'ALL') parts.push(y);
                    
                    titleEl.innerText = parts.join(' | ');
                };
                updateMainDashTitle();

                window.smartAlignLabels = function(ctx) {
                    const v = ctx.dataset.data[ctx.dataIndex];
                    if (v === null || v === undefined) return 'top';
                    const visibleVals = [];
                    for (let i = 0; i < ctx.chart.data.datasets.length; i++) {
                        const ds = ctx.chart.data.datasets[i];
                        if (!ds.hidden && ds.data[ctx.dataIndex] !== undefined && ds.data[ctx.dataIndex] !== null) {
                            visibleVals.push({ idx: i, val: ds.data[ctx.dataIndex] });
                        }
                    }
                    if (visibleVals.length <= 1) return 'top';
                    let greaterCount = 0;
                    let smallerCount = 0;
                    for(let item of visibleVals) {
                        if (item.idx === ctx.datasetIndex) continue;
                        if (Math.abs(item.val - v) < 5) {
                             if (item.idx > ctx.datasetIndex) greaterCount++;
                             else smallerCount++;
                        } else if (item.val > v) {
                             greaterCount++;
                        } else {
                             smallerCount++;
                        }
                    }
                    if (greaterCount === 0) return 'top';
                    if (smallerCount === 0) return 'bottom';
                    return (greaterCount % 2 === 0) ? 'bottom' : 'top';
                };

                const ctxTrendPro = document.getElementById('chartHCTrendPro');
                if (ctxTrendPro) {
                    // SincronizaciÃ³n dinÃ¡mica con los filtros globales (Using outer targetY/targetM)
                    window._hcSeriesVisible = Object.assign({ 
                        total: true, ingresos: false, bajas: false, 
                        totalPrev: false, ingresosPrev: false, bajasPrev: false 
                    }, window._hcSeriesVisible || {});
                    
                    if (window._hcViewLength === undefined) window._hcViewLength = 6;

                    // Actualizar etiquetas de fila con aÃ±o 
                    const lblActual = document.getElementById('lblHCActual');
                    if (lblActual) lblActual.innerText = `ACTUAL:`;
                    const lblAnterior = document.getElementById('lblHCAnterior');
                    if (lblAnterior) lblAnterior.innerText = `ANTERIOR:`;

                    // Update buttons
                    updateHCBtnStyles();

                    const hcGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    hcGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    hcGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    
                    const purpleGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    purpleGradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                    purpleGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

                    const greenGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    greenGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    greenGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

                    const redGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    redGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
                    redGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

                    const orangeGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    orangeGradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
                    orangeGradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

                    const pinkGradient = ctxTrendPro.getContext('2d').createLinearGradient(0, 0, 0, 400);
                    pinkGradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
                    pinkGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');


                    // --- DYNAMIC PERIOD LOGIC (6/12 MONTHS) ---
                    const vLenRollChart = window._hcViewLength || 6;
                    const f = getFilters();
                    const yc = (f.yc === 'ALL' || !f.yc) ? null : parseInt(f.yc);
                    const mc = (f.mc === 'ALL' || !f.mc) ? null : parseInt(f.mc);

                    // Anterior Period Anchor (Mirror Year vs Sequential)
                    let antAnchorY, antAnchorM;
                    if (yc && mc) {
                        antAnchorY = yc;
                        antAnchorM = mc;
                    } else if (window._hcMirrorMode) {
                        // Mirror mode: uses exactly the same months but from the previous year
                        antAnchorY = hcTrendEndY - 1;
                        antAnchorM = hcTrendEndM;
                    } else {
                        // Sequential mode: uses the period immediately preceding the actual selection
                        antAnchorY = hcTrendEndY;
                        antAnchorM = hcTrendEndM - vLenRollChart;
                        while (antAnchorM < 1) { antAnchorM += 12; antAnchorY--; }
                    }

                    // Prepare Labels and Data Containers
                    const dLabels = [];
                    window._hcAnteriorLabels = []; // Temporary store for the plugin
                    const dTotalPrior = [];
                    const dAltasPrior = [];
                    const dBajasPrior = [];

                    for (let i = 0; i < vLenRollChart; i++) {
                        let cY = hcTrendEndY, cM = hcTrendEndM - (vLenRollChart - 1 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        
                        let aY = antAnchorY, aM = antAnchorM - (vLenRollChart - 1 - i);
                        while (aM < 1) { aM += 12; aY--; }

                        // Point 1: Dynamic Format (Full if space permits, compact if not)
                        let lblActual, lblAnterior;
                        if (vLenRollChart <= 6) {
                            lblActual = monthNamesArr[cM - 1] + " '" + String(cY).slice(-2);
                            lblAnterior = monthNamesArr[aM - 1] + " '" + String(aY).slice(-2);
                        } else {
                            lblActual = (cM < 10 ? '0' : '') + cM + '/' + String(cY).slice(-2);
                            lblAnterior = (aM < 10 ? '0' : '') + aM + '/' + String(aY).slice(-2);
                        }
                        
                        dLabels.push(lblActual);
                        window._hcAnteriorLabels.push(lblAnterior);
                    }

                    // Populate Prior Data (Using the relative anterior window)
                    for (let i = 0; i < vLenRollChart; i++) {
                        let checkY = antAnchorY;
                        let checkM = antAnchorM - (vLenRollChart - 1 - i);
                        while (checkM < 1) { checkM += 12; checkY--; }
                        
                        // Prev Total
                        let c = 0; const s = new Set();
                        for (let j = 0; j < empsRaw.length; j++) {
                            const e = empsRaw[j];
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                            const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                            
                            if (e.y == checkY && compareMonth(e.m, checkM) && matchPa && matchE && matchA && matchD) {
                                s.add(e.c || e.n);
                            }
                        }

                        // Filter bajas for the period (Prev - intelligent net count)
                        const bSetPrev = new Set((app.bajas_list || []).filter(b => {
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(b.pa));
                            const matchE = emp2 === 'ALL' || (b.e || b.EMPRESA || b.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (b.dir || b.area || b.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (b.d || b.DEPARTAMENTO || b.depto) === deptoSel;
                            return b.y == checkY && compareMonth(b.m, checkM) && matchPa && matchE && matchA && matchD;
                        }).map(b => b.c || b.n));

                        const netCountPrev = Array.from(s).filter(id => !bSetPrev.has(id)).length;

                        dTotalPrior.push(isNeto ? netCountPrev : s.size);
                        dBajasPrior.push(bSetPrev.size);

                        // Prev Altas
                        let ra = 0; const seenR = new Set();
                        for (let j = 0; j < empsRaw.length; j++) {
                            const e = empsRaw[j];
                            const matchPa = countries.length === 0 || countries.includes(normalizePa(e.pa));
                            const matchE = emp2 === 'ALL' || (e.e || e.EMPRESA || e.empresa) === emp2;
                            const matchA = areaSel === 'ALL' || (e.dir || e.area || e.DIRECCION) === areaSel;
                            const matchD = deptoSel === 'ALL' || (e.d || e.DEPARTAMENTO || e.depto) === deptoSel;
                            
                            if (e.fi && matchPa && matchE && matchA && matchD) {
                                const p = e.fi.split('/');
                                if (p.length >= 3 && parseInt(p[2]) == checkY && compareMonth(parseInt(p[1]), checkM) && !seenR.has(e.c || e.n)) {
                                    ra++; seenR.add(e.c || e.n);
                                }
                            }
                        }
                        dAltasPrior.push(ra);

                        // Prev Bajas logic already handled in dTotalPrior above
                    }

                    function getTrendLabels(colorStr, isPrev) {
    return {
        labels: {
            value: {
                display: true,
                align: window.smartAlignLabels,
                anchor: 'center',
                offset: 22,
                color: colorStr,
                font: { size: 14, weight: 1000, family: 'Montserrat' },
                formatter: (v, ctx) => ctx.dataIndex === 0 ? '      ' + v : v
            },
            year: {
                display: (ctx) => (ctx.dataIndex === ctx.dataset.data.length - 1),
                align: 'right',
                anchor: 'center',
                offset: 12,
                color: '#fff',
                backgroundColor: colorStr.startsWith('rgba') ? colorStr.replace(/0\.[0-9]+\)$/, '1)') : colorStr,
                borderRadius: 4,
                padding: { top: 2, bottom: 2, left: 6, right: 6 },
                font: { weight: 1000, size: 14, family: 'Montserrat' },
                formatter: () => ''
            }
        }
    };
}
                    window._hcProChart = new Chart(ctxTrendPro.getContext('2d'), {
                        type: 'line',
                        plugins: [ChartDataLabels, {
                            id: 'lilaTickPlugin',
                            afterDraw: (chart) => {
                                const {ctx, scales: {x}} = chart;
                                const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                if (!anyPrev) return;

                                ctx.save();
                                ctx.font = (vLenRollChart > 6) ? '1000 11px Montserrat' : '1000 13px Montserrat';
                                ctx.textBaseline = 'top';

                                const antLabels = window._hcAnteriorLabels || [];
                                const actLabels = chart.data.labels || [];

                                x.ticks.forEach((tick, idx) => {
                                    const xPixel = x.getPixelForTick(idx);
                                    const yPixel = x.top + 10;
                                    
                                    const txtAnt = antLabels[idx] || '';
                                    const txtAct = actLabels[idx] || '';
                                    const vs = " vs ";

                                    const wAnt = ctx.measureText(txtAnt).width;
                                    const wVs = ctx.measureText(vs).width;
                                    const wAct = ctx.measureText(txtAct).width;
                                    const totalW = wAnt + wVs + wAct;
                                    
                                    let startX = xPixel - totalW / 2;

                                    // Anterior (Purpura)
                                    ctx.fillStyle = '#8b5cf6';
                                    ctx.textAlign = 'left';
                                    ctx.fillText(txtAnt, startX, yPixel);

                                    // "vs" (Gris)
                                    ctx.fillStyle = '#94a3b8';
                                    ctx.fillText(vs, startX + wAnt, yPixel);

                                    // Actual (Oscuro)
                                    ctx.fillStyle = '#1e293b';
                                    ctx.fillText(txtAct, startX + wAnt + wVs, yPixel);
                                });
                                ctx.restore();
                            }
                        }],
                        data: {
                            labels: dLabels,
                            datasets: [
                                {
                                    label: 'Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dTotalPrior,
                                    borderColor: '#8b5cf6', 
                                    backgroundColor: purpleGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#8b5cf6',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.totalPrev,
                                    datalabels: getTrendLabels('#8b5cf6', true)
                                },
                                {
                                    label: 'Ingresos Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dAltasPrior,
                                    borderColor: '#F97316', 
                                    backgroundColor: orangeGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#F97316',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.ingresosPrev,
                                    datalabels: getTrendLabels('#F97316', true)
                                },
                                {
                                    label: 'Bajas Anterior (' + (antAnchorY || 'Ref') + ')',
                                    data: dBajasPrior,
                                    borderColor: '#EC4899', 
                                    backgroundColor: pinkGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#EC4899',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.bajasPrev,
                                    datalabels: getTrendLabels('#EC4899', true)
                                },
                                {
                                    label: 'Actual (' + targetY + ')',
                                    data: dTotal,
                                    borderColor: '#3b82f6', 
                                    backgroundColor: hcGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 7,
                                    pointHoverRadius: 9,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#3b82f6',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.total,
                                    datalabels: getTrendLabels('#3b82f6', false)
                                },
                                {
                                    label: 'Altas Actual (' + targetY + ')',
                                    data: dAltas,
                                    borderColor: '#10b981', 
                                    backgroundColor: greenGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.45,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#10b981',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.ingresos,
                                    datalabels: getTrendLabels('#10b981', false)
                                },
                                {
                                    label: 'Bajas Actual (' + targetY + ')',
                                    data: dBajas,
                                    borderColor: '#ef4444', 
                                    backgroundColor: redGradient,
                                    borderWidth: 4, 
                                    fill: true,
                                    tension: 0.45,
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointBorderColor: '#ef4444',
                                    clip: false,
                                    hidden: !window._hcSeriesVisible.bajas,
                                    datalabels: getTrendLabels('#ef4444', false)
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        title: (ctx) => {
                                            const idx = ctx[0].dataIndex;
                                            const actLabel = ctx[0].chart.data.labels[idx];
                                            const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                            if (!anyPrev) return actLabel;
                                            const antLabel = (window._hcAnteriorLabels || [])[idx] || '';
                                            return `Ref: ${antLabel} | Actual: ${actLabel}`;
                                        }
                                    }
                                },
                                lilaLabels: {
                                    display: () => window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev,
                                    text: antAnchorY || 'Ref'
                                }
                            },
                            layout: { padding: { top: 60, left: 20, right: 90, bottom: 45 } },
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    grace: '15%',
                                    grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false },
                                    ticks: {
                                        font: { weight: 1000, size: 14, family: 'Montserrat' }, 
                                        color: '#1e293b',
                                        callback: function(value) { if (value % 1 === 0) return value; }
                                    }
                                },
                                x: { 
                                    offset: false,
                                    grid: { display: false }, 
                                    ticks: { 
                                        padding: 8,
                                        font: { weight: 1000, size: 13, family: 'Montserrat' }, 
                                        color: '#1e293b',
                                        maxRotation: 0,
                                        autoSkip: false,
                                        callback: function(value, index, ticks) {
                                            const anyPrev = window._hcSeriesVisible.totalPrev || window._hcSeriesVisible.ingresosPrev || window._hcSeriesVisible.bajasPrev;
                                            if (anyPrev) return '';
                                            return this.getLabelForValue(value);
                                        }
                                    } 
                                }
                            }
                        }
                    });
                    window.activeCharts.push(window._hcProChart);
                }

                const ctxTrendOld = document.getElementById('chartHCTrendOld');
                if (ctxTrendOld) {
                    try {
                        // Rolling Window para el gr  cl 
                        const dLabelsOld = []; const dTotalOld = [];
                        for (let i = 0; i < vLenOldRoll; i++) {
                            let checkY = targetY;
                            let checkM = targetM - (vLenOldRoll - 1 - i);
                            while (checkM < 1) { checkM += 12; checkY--; }
                            dLabelsOld.push(monthNamesArr[checkM - 1] + (checkY !== targetY ? " '" + String(checkY).slice(-2) : ""));

                            let c = 0; const s = new Set();
                            for (let j = 0; j < empsRaw.length; j++) {
                                const e = empsRaw[j];
                                if (e.y == checkY && e.m == checkM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)) s.add(e.c || e.n);
                            }
                            dTotalOld.push(s.size);
                        }

                        window.activeCharts.push(new Chart(ctxTrendOld.getContext('2d'), {
                            type: 'bar',
                            data: {
                                labels: dLabelsOld,
                                datasets: [{
                                    label: 'Colaboradores',
                                    data: dTotalOld,
                                    backgroundColor: '#c4b5fd',
                                    borderRadius: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    datalabels: {
                                        display: true,
                                        align: 'end',
                                        anchor: 'end',
                                        color: '#1e293b',
                                        font: { weight: 1000, size: 11 }
                                    }
                                },
                                scales: { 
                                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' } }, 
                                    x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                }
                            }
                        }));
                    } catch (e) { console.error("Old Trend Chart failed:", e); }

                    // --- POINT 1: COMPOSICI  HC POR Pais (area CHART) ---
                    const ctxareaComp = document.getElementById('chartCompositionarea');
                    if (ctxareaComp) {
                        try {
                            const vLen = window._hcViewLength || 6;
                            const dLabels = [];
                            const countryData = {};
                            const allPa = [...new Set(empsRaw.map(e => normalizePa(e.pa)))].sort();
                            allPa.forEach(c => countryData[c] = []);

                            for (let i = 0; i < vLen; i++) {
                                let cY = targetY, cM = targetM - (vLen - 1 - i);
                                while (cM < 1) { cM += 12; cY--; }
                                dLabels.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ''));
                                
                                allPa.forEach(c => {
                                    const s = new Set();
                                    for (let j = 0; j < empsRaw.length; j++) {
                                        const e = empsRaw[j];
                                        if (e.y == cY && e.m == cM && normalizePa(e.pa) === c && (emp2 === 'ALL' || e.e === emp2)) s.add(e.c || e.n);
                                    }
                                    countryData[c].push(s.size);
                                });
                            }

                            const flagColors = {
                                'GT': '#3b82f6', 'PA': '#ef4444', 'SV': '#6366f1', 'HN': '#0ea5e9', 
                                'NI': '#38bdf8', 'CR': '#f43f5e', 'DO': '#2563eb', 'US': '#1e293b'
                            };

                            const datasets = allPa.map(c => {
                                const baseColor = flagColors[c] || '#94a3b8';
                                return {
                                    label: paisMap[c] || c,
                                    data: countryData[c],
                                    fill: true,
                                    backgroundColor: (context) => {
                                        const chart = context.chart;
                                        const {ctx, chartarea} = chart;
                                        if (!chartarea) return null;
                                        const grad = ctx.createLinearGradient(0, chartarea.bottom, 0, chartarea.top);
                                        grad.addColorStop(0, baseColor + '10');
                                        grad.addColorStop(1, baseColor + '66');
                                        return grad;
                                    },
                                    borderColor: baseColor,
                                    borderWidth: 2,
                                    pointRadius: 3,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: baseColor,
                                    pointBorderWidth: 2,
                                    clip: false,
                                    tension: 0.4,
                                    datalabels: {
                                        display: (ctx) => {
                                            const v = ctx.dataset.data[ctx.dataIndex];
                                            const vLen = ctx.dataset.data.length;
                                            // Show if it's the last point or a high value
                                            return v > 10 || ctx.dataIndex === vLen - 1;
                                        },
                                        color: '#fff',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        borderRadius: 4,
                                        font: { weight: '1000', size: 12 },
                                        align: 'top',
                                        anchor: 'center',
                                        padding: 4,
                                        formatter: (v) => v
                                    }
                                };
                            });

                            const classicLen = window._hcViewLength || 6;
                            document.documentElement.style.setProperty('--classicPeriodColor6', classicLen === 6 ? '#8b5cf6' : 'transparent');
                            document.documentElement.style.setProperty('--classicPeriodText6', classicLen === 6 ? '#fff' : '#64748b');
                            document.documentElement.style.setProperty('--classicPeriodColor12', classicLen === 12 ? '#8b5cf6' : 'transparent');
                            document.documentElement.style.setProperty('--classicPeriodText12', classicLen === 12 ? '#fff' : '#64748b');

                            window.activeCharts.push(new Chart(ctxareaComp.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: { labels: dLabels, datasets: datasets },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { 
                                            position: 'bottom', 
                                            labels: { 
                                                boxWidth: 8, 
                                                usePointStyle: true,
                                                font: { size: 10, weight: 900 } 
                                            } 
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                            backdropFilter: 'blur(8px)',
                                            padding: 12,
                                            titleFont: { size: 13, weight: 900, family: 'Montserrat' },
                                            bodyFont: { size: 12, weight: 600, family: 'Montserrat' },
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            borderWidth: 1,
                                            cornerRadius: 12,
                                            displayColors: true,
                                            callbacks: {
                                                label: (context) => {
                                                    let label = context.dataset.label || '';
                                                    if (label) label += ': ';
                                                    if (context.parsed.y !== null) label += context.parsed.y;
                                                    return label;
                                                }
                                            }
                                        }
                                    },
                                    scales: { 
                                        y: { 
                                            stacked: true, 
                                            beginAtZero: true, 
                                            grid: { color: 'rgba(0,0,0,0.03)' },
                                            ticks: { font: { weight: 700 } }
                                        }, 
                                        x: { 
                                            grid: { display: false },
                                            ticks: { font: { weight: 700 } }
                                        } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("Composition area Chart failed:", e); }
                    }

                    // --- POINT 4: ACUMULADO A  VS A  ---
                    const ctxYoY = document.getElementById('chartAcumuladoYoY');
                    if (ctxYoY) {
                        try {
                            const months = [1,2,3,4,5,6,7,8,9,10,11,12];
                            const dataCur = [], dataPrev = [];
                            let accCur = 0, accPrev = 0;
                            const prevY = targetY - 1;

                            months.forEach(m => {
                                const sCur = new Set(), sPrev = new Set();
                                empsRaw.forEach(e => {
                                    const match = (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2);
                                    if (match) {
                                        if (e.y == targetY && e.m == m) sCur.add(e.c || e.n);
                                        if (e.y == prevY && e.m == m) sPrev.add(e.c || e.n);
                                    }
                                });
                                // Corrected: Monthly HC, not sum of sums
                                dataCur.push(sCur.size);
                                dataPrev.push(sPrev.size);
                            });

                            const lastCur = dataCur[targetM - 1] || 0;
                            const lastPrev = dataPrev[targetM - 1] || 0;
                            const growth = lastPrev > 0 ? (((lastCur - lastPrev) / lastPrev) * 100).toFixed(1) : 0;
                            
                            window.activeCharts.push(new Chart(ctxYoY.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: {
                                    labels: monthNamesArr,
                                    datasets: [
                                        { 
                                            label: `Actual (${targetY})`, 
                                            data: dataCur, 
                                            borderColor: '#8b5cf6', 
                                            borderWidth: 4, 
                                            tension: 0.4, 
                                            fill: true,
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const grad = ctx.createLinearGradient(0, 0, 0, 300);
                                                grad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
                                                grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
                                                return grad;
                                            },
                                            pointRadius: 4,
                                            pointBackgroundColor: '#fff',
                                            pointBorderWidth: 2,
                                    clip: false,
                                            datalabels: {
                                                display: true,
                                                align: 'top',
                                                offset: 5,
                                                color: '#8b5cf6',
                                                font: { weight: 1000, size: 11 }
                                            }
                                        },
                                        { 
                                            label: `Anterior (${prevY})`, 
                                            data: dataPrev, 
                                            borderColor: '#94a3b8', 
                                            borderWidth: 2, 
                                            borderDash: [6, 4], 
                                            tension: 0.4, 
                                            fill: false,
                                            pointRadius: 0,
                                            datalabels: { display: false }
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { 
                                            position: 'top', 
                                            align: 'end',
                                            labels: { boxWidth: 12, usePointStyle: true, font: { weight: 800, size: 11 } } 
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            padding: 12,
                                            titleFont: { size: 13, weight: 900 },
                                            bodyFont: { size: 12, weight: 600 },
                                            cornerRadius: 10
                                        }
                                    },
                                    scales: { 
                                        y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 700 } } }, 
                                        x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("YoY Chart failed:", e); }
                    }

                    // --- POINT 7: AN  CL  14 areaS ---
                    const ctx14 = document.getElementById('chartClassic14areas');
                    if (ctx14) {
                        try {
                            const vLen = 6; // Fixed for clarity in this specific view
                            const areas = [...new Set(empsRaw.map(e => e.dir || e.area || 'Sin area'))].slice(0, 14);
                            const dLabels = [];
                            const areaSeries = {};
                            areas.forEach(a => areaSeries[a] = []);

                            for (let i = 0; i < vLen; i++) {
                                let cY = targetY, cM = targetM - (vLen - 1 - i);
                                while (cM < 1) { cM += 12; cY--; }
                                dLabels.push(monthNamesArr[cM - 1]);
                                
                                areas.forEach(a => {
                                    const s = new Set();
                                    empsRaw.forEach(e => {
                                        if (e.y == cY && e.m == cM && (e.dir === a || e.area === a) && (countries.length === 0 || countries.includes(normalizePa(e.pa)))) s.add(e.c || e.n);
                                    });
                                    areaSeries[a].push(s.size);
                                });
                            }

                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
                            const datasets = areas.map((a, idx) => ({
                                label: a,
                                data: areaSeries[a],
                                borderColor: colors[idx % colors.length],
                                borderWidth: 3,
                                tension: 0.4,
                                pointRadius: 4,
                                pointHoverRadius: 8,
                                fill: false,
                                datalabels: {
                                    display: (ctx) => {
                                        // Show value only at the end point OR if hovered
                                        const chart = ctx.chart;
                                        const isLastPoint = ctx.dataIndex === ctx.dataset.data.length - 1;
                                        const hoveredIndex = chart.tooltip?.getActiveElements()[0]?.datasetIndex;
                                        return isLastPoint || hoveredIndex === ctx.datasetIndex;
                                    },
                                    backgroundColor: (ctx) => ctx.dataset.borderColor,
                                    color: '#fff',
                                    borderRadius: 6,
                                    offset: 8,
                                    align: 'end',
                                    anchor: 'end',
                                    padding: 6,
                                    font: { weight: 1000, size: 12 }
                                }
                            }));

                            const classicTitleLabel = document.getElementById('classicViewLenLabel');
                            if(classicTitleLabel) classicTitleLabel.innerText = vLen;

                            window.activeCharts.push(new Chart(ctx14.getContext('2d'), {
                                type: 'line',
                                plugins: [ChartDataLabels],
                                data: { labels: dLabels, datasets: datasets },
                                options: {
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { display: false }, 
                                        tooltip: { 
                                            mode: 'index', 
                                            intersect: false,
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            padding: 12,
                                            boxPadding: 6,
                                            callbacks: {
                                                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
                                            }
                                        } 
                                    },
                                    hover: {
                                        mode: 'dataset',
                                        intersect: false
                                    },
                                    onHover: (event, chartElement) => {
                                        const chart = event.chart;
                                        if (chartElement.length > 0) {
                                            const index = chartElement[0].datasetIndex;
                                            chart.data.datasets.forEach((ds, i) => {
                                                ds.borderWidth = (i === index) ? 4 : 1;
                                                ds.borderColor = (i === index) ? colors[i % colors.length] : colors[i % colors.length] + '44';
                                            });
                                        } else {
                                            chart.data.datasets.forEach((ds, i) => {
                                                ds.borderWidth = 2;
                                                ds.borderColor = colors[i % colors.length];
                                            });
                                        }
                                        chart.update('none');
                                    },
                                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                                    scales: { 
                                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { weight: 700 } } }, 
                                        x: { grid: { display: false }, ticks: { font: { weight: 700 } } } 
                                    }
                                }
                            }));
                        } catch (e) { console.error("14 area Chart failed:", e); }
                    }
                }

                // --- 0.1 TOP PUESTOS (HEATMAP/LIST) ---
                renderHeatmap(uniqueEmps);

                // --- 0.2 DISTRIBUCIÃ“N CL  DEPARTAMENTO ---
                const ctxareaOld = document.getElementById('chartareaClassic');
                if (ctxareaOld) {
                    const deptCounts = {};
                    uniqueEmps.forEach(e => {
                        const d = e.d && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                        deptCounts[d] = (deptCounts[d] || 0) + 1;
                    });
                    // Point 5: Show all depts (or top 50 to avoid illegible legend)
                    const topDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

                    try {
                        const gradientColors = ['#8b5cf6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#64748b', '#14b8a6'];
                        window.activeCharts.push(new Chart(ctxareaOld.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: topDepts.map(d => d[0]),
                                datasets: [{
                                    data: topDepts.map(d => d[1]),
                                    backgroundColor: gradientColors,
                                    hoverOffset: 20,
                                    borderRadius: 8,
                                    borderWidth: 4,
                                    borderColor: document.body.classList.contains('dark') ? '#1e293b' : '#fff'
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '65%',
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            boxWidth: 12,
                                            padding: 15,
                                            font: { size: 11, weight: 800, family: 'Montserrat' },
                                            color: document.body.classList.contains('dark') ? '#cbd5e1' : '#475569'
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        padding: 12,
                                        titleFont: { size: 14, weight: 800 },
                                        bodyFont: { size: 13, weight: 600 }
                                    }
                                }
                            }
                        }));
                    } catch (e) { console.error("Classic area Chart failed:", e); }
                }

                // --- NEW: AN  CL  HC REAL 2 (trend + doughnut side-by-side) ---
                // --- HC HISTÃ“RICO REFINEMENT (Multi-Series & YoY) ---
                const ctxTrendReal2 = document.getElementById('chartHCTrendReal2');
                if (ctxTrendReal2) {
                    try {
                        const vLen2 = window._hcHistPeriod || 12;
                        const activeSeries = window._hcHistSeries || ['hc'];
                        const showComp = window._hcHistComp || false;
                        const compYear = targetY - 1;

                        const dLabels2 = [];
                        const datasets = [];

                        // 1. Prepare Main Datasets (Current Year)
                        const seriesConfig = {
                            'hc': { label: 'HC TOTAL', color: '#6366f1', data: [] },
                            'altas': { label: 'ALTAS', color: '#10b981', data: [] },
                            'bajas': { label: 'BAJAS', color: '#ef4444', data: [] }
                        };

                        // 2. Prepare Comparison Datasets (Previous Year)
                        const compConfig = {
                            'hc_comp': { label: `HC ${compYear}`, color: '#6366f1', data: [], dashed: true },
                            'altas_comp': { label: `ALTAS ${compYear}`, color: '#10b981', data: [], dashed: true },
                            'bajas_comp': { label: `BAJAS ${compYear}`, color: '#ef4444', data: [], dashed: true }
                        };

                        // 3. Calculation Loop
                        for (let i = 0; i < vLen2; i++) {
                            let cY = targetY, cM = targetM - (vLen2 - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            dLabels2.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ''));

                            // Current Period Data
                            const currentSlice = empsRaw.filter(e => e.y == cY && e.m == cM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel));
                            
                            if (activeSeries.includes('hc')) {
                                const s = new Set(currentSlice.map(e => e.c || e.n));
                                seriesConfig.hc.data.push(s.size);
                            }
                            if (activeSeries.includes('altas')) {
                                const h = currentSlice.filter(e => {
                                    if(!e.fi) return false;
                                    const p = e.fi.split('/');
                                    return p.length >= 3 && parseInt(p[2]) == cY && parseInt(p[1]) == cM;
                                });
                                seriesConfig.altas.data.push(h.length);
                            }
                            if (activeSeries.includes('bajas')) {
                                const b = (app.bajas_list || []).filter(bx => bx.y == cY && bx.m == cM && (countries.length === 0 || countries.includes(normalizePa(bx.pa))) && (emp2 === 'ALL' || bx.e === emp2) && (areaSel === 'ALL' || bx.dir === areaSel) && (deptoSel === 'ALL' || bx.d === deptoSel));
                                seriesConfig.bajas.data.push(b.length);
                            }

                            // Comparison Period Data (Year - 1)
                            if (showComp) {
                                let pY = cY - 1, pM = cM;
                                const compSlice = empsRaw.filter(e => e.y == pY && e.m == pM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) && (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel));
                                
                                if (activeSeries.includes('hc')) {
                                    const sP = new Set(compSlice.map(e => e.c || e.n));
                                    compConfig.hc_comp.data.push(sP.size);
                                }
                                if (activeSeries.includes('altas')) {
                                    const hP = compSlice.filter(e => {
                                        if(!e.fi) return false;
                                        const p = e.fi.split('/');
                                        return p.length >= 3 && parseInt(p[2]) == pY && parseInt(p[1]) == pM;
                                    });
                                    compConfig.altas_comp.data.push(hP.length);
                                }
                                if (activeSeries.includes('bajas')) {
                                    const bP = (app.bajas_list || []).filter(bx => bx.y == pY && bx.m == pM && (countries.length === 0 || countries.includes(normalizePa(bx.pa))) && (emp2 === 'ALL' || bx.e === emp2) && (areaSel === 'ALL' || bx.dir === areaSel) && (deptoSel === 'ALL' || bx.d === deptoSel));
                                    compConfig.bajas_comp.data.push(bP.length);
                                }
                            }
                        }

                        // 4. Build Dataset Array
                        activeSeries.forEach(s => {
                            const conf = seriesConfig[s];
                            datasets.push({
                                label: conf.label,
                                data: conf.data,
                                borderColor: conf.color,
                                borderWidth: 3,
                                fill: false,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: conf.color
                            });

                            if (showComp) {
                                const cConf = compConfig[s + '_comp'];
                                datasets.push({
                                    label: cConf.label,
                                    data: cConf.data,
                                    borderColor: cConf.color + '66', // 40% opacity
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    fill: false,
                                    tension: 0.4,
                                    pointRadius: 0
                                });
                            }
                        });

                        window.activeCharts.push(new Chart(ctxTrendReal2.getContext('2d'), {
                            type: 'line',
                            data: { labels: dLabels2, datasets: datasets },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index', intersect: false,
                                        backgroundColor: 'rgba(15,23,42,0.95)',
                                        padding: 12,
                                        titleFont: { size: 12, weight: 1000 },
                                        bodyFont: { size: 11, weight: 700 }
                                    }
                                },
                                scales: {
                                    y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 10, weight: 800 } } },
                                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 800 } } }
                                }
                            }
                        }));
                    } catch(e) { console.error("Premium HC Historico failed:", e); }
                }


                const ctxarea2 = document.getElementById('chartareaReal2');
                if (ctxarea2) {
                    try {
                        const deptCounts2 = {};
                        uniqueEmps.forEach(e => {
                            const d = e.d && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                            deptCounts2[d] = (deptCounts2[d] || 0) + 1;
                        });
                        const top2 = Object.entries(deptCounts2).sort((a,b) => b[1]-a[1]).slice(0, 8);
                        const gc2 = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b'];
                        window.activeCharts.push(new Chart(ctxarea2.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: top2.map(d => d[0]),
                                datasets: [{ data: top2.map(d => d[1]), backgroundColor: gc2, hoverOffset: 20, borderRadius: 8, borderWidth: 4, borderColor: '#fff' }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false, cutout: '65%',
                                plugins: {
                                    legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10, weight: 800, family: 'Montserrat' }, color: '#475569' } },
                                    tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, titleFont: { size: 13, weight: 800 }, bodyFont: { size: 11, weight: 600 } }
                                }
                            }
                        }));
                    } catch(e) { console.error("area Real2 failed:", e); }
                }


                // Combined Altas vs Bajas Chart
                const ctxAB = document.getElementById('chartAltasBajas');
                if (ctxAB) {
                    try {
                        const vLenAB = document.getElementById('chk12mAB')?.checked ? 12 : 6;
                        const labelsAB = [];
                        const dataA = [];
                        const dataB = [];

                        for (let i = 0; i < vLenAB; i++) {
                            let cY = targetY;
                            let cM = targetM - (vLenAB - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            labelsAB.push(monthNamesArr[cM - 1] + (cY !== targetY ? " '" + String(cY).slice(-2) : ""));

                            // Recalculate monthly for AB specifically if needed or reuse logic
                            // For simplicity, let's use the monthlyAltas/monthlyBajas if it's within current year
                            // or better yet, recalculate precisely for the window
                            let aCount = 0; let bCount = 0;
                            const sA = new Set();
                            empsRaw.forEach(e => {
                                if (e.fi && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                    (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)) {
                                    const p = e.fi.split('/');
                                    if (p.length >= 3 && parseInt(p[2]) == cY && parseInt(p[1]) == cmasA.has(e.c || e.n)) {
                                        aCount++; sA.add(e.c || e.n);
                                    }
                                }
                            });
                            bajasArray.forEach(b => {
                                const curPa = (b.pa || '').trim().toUpperCase();
                                const matchPa = countries.length === 0 || countries.includes(curPa);
                                const matchE = emp2 === 'ALL' || b.e === emp2;
                                const matchA = areaSel === 'ALL' || b.dir === areaSel;
                                const matchD = deptoSel === 'ALL' || b.d === deptoSel;

                                if (b.y == cY && b.m == cM && matchPa && matchE && matchA && matchD) {
                                    bCount++;
                                }
                            });
                            dataA.push(aCount);
                            dataB.push(bCount);
                        }

                        window.activeCharts.push(new Chart(ctxAB.getContext('2d'), {
                            type: 'bar',
                            data: {
                                labels: labelsAB,
                                datasets: [
                                    { label: 'Ingresos', data: dataA, backgroundColor: '#10b981', borderRadius: 6, barThickness: vLenAB === 12 ? 15 : 25 },
                                    { label: 'Egresos', data: dataB, backgroundColor: '#ef4444', borderRadius: 6, barThickness: vLenAB === 12 ? 15 : 25 }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { weight: 800, family: 'Montserrat' } } }
                                },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { weight: 600 } } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 600, size: 10 } } }
                                }
                            }
                        }));
                    } catch (e) { console.error("Altas/Bajas Combined Chart failed:", e); }
                }

                // MINI CHARTS FOR KPI CARDS (FORCED 12 MONTHS)
                // 1. KPI HC Trend (12m)
                const kpiHCTrendCtx = document.getElementById('kpiHCTrendCanvas');
                if (kpiHCTrendCtx) {
                    const l12 = []; const d12 = [];
                    for (let i = 0; i < 12; i++) {
                        let cY = targetY, cM = targetM - (11 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        l12.push(monthNamesArr[cM - 1]);
                        const s = new Set(empsRaw.filter(e => e.y == cY && e.m == cM && (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2)).map(e => e.c || e.n));
                        d12.push(s.size);
                    }
                    window.activeCharts.push(new Chart(kpiHCTrendCtx, {
                        type: 'line',
                        data: { labels: l12, datasets: [{ data: d12, borderColor: activeColor, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: activeColor + '10', tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
                    }));
                }

                // 2. KPI AB Trend (12m)
                const kpiABTrendCtx = document.getElementById('kpiABTrendCanvas');
                if (kpiABTrendCtx) {
                    const l12 = []; const dA = []; const dB = [];
                    for (let i = 0; i < 12; i++) {
                        let cY = targetY, cM = targetM - (11 - i);
                        while (cM < 1) { cM += 12; cY--; }
                        l12.push(monthNamesArr[cM - 1]);
                        let a = 0, b = 0;
                        const sA = new Set();
                        empsRaw.forEach(e => { if (e.fi && e.fi.includes('/') && (countries.length === 0 || countries.includes(normalizePa(e.pa)))) { const p = e.fi.split('/'); if (parseInt(p[2]) == cY && parseInt(p[1]) == cM) { a++; } } });
                        bajasArray.forEach(bj => { if (bj.y == cY && bj.m == cM && (countries.length === 0 || countries.includes(normalizePa(bj.pa)))) b++; });
                        dA.push(a); dB.push(b);
                    }
                    window.activeCharts.push(new Chart(kpiABTrendCtx, {
                        type: 'bar',
                        data: { labels: l12, datasets: [{ data: dA, backgroundColor: '#10b981' }, { data: dB, backgroundColor: '#ef4444' }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
                    }));
                }

                // 3. KPI RotRet (Doughnut)
                const kpiRotRetCtx = document.getElementById('kpiRotRetCanvas');
                if (kpiRotRetCtx) {
                    const rotRaw = activeHC_val > 0 ? (bajasPeriod_val / activeHC_val) * 100 : 0;
                    window.activeCharts.push(new Chart(kpiRotRetCtx, {
                        type: 'doughnut',
                        data: { datasets: [{ data: [rotRaw, 100 - rotRaw], backgroundColor: ['#ef4444', '#10b981'], borderWidth: 0 }] },
                        options: { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
                    }));
                }


                // B. Acumulado A  vs A  (Suma Acumulada Mes a Mes)
                const ctxYTD = document.getElementById('chartYTDContrataciones');
                if (ctxYTD) {
                    try {
                        const vLenYTD = 12; // Forced 12 months as requested
                        const labelsYTD = [];
                        const dataLY_cum = [];
                        const dataCY_cum = [];

                        let cumLY = 0;
                        let cumCY = 0;

                        // Calculate starting point for cumulative if we are on a rolling window?
                        // Actually, 'A  vs A ' usually starts from Jan of each respective year.
                        for (let i = 1; i <= 12; i++) {
                            labelsYTD.push(monthNamesArr[i - 1]);

                            // Last Year Hires for this month
                            const lyHires = new Set(empsRaw.filter(e => e.y == (targetY - 1) && e.m == i && e.fi &&
                                (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)
                            ).map(e => e.c || e.n)).size;

                            // Current Year Hires for this month
                            const cyHires = new Set(empsRaw.filter(e => e.y == targetY && e.m == i && e.fi &&
                                (countries.length === 0 || countries.includes(normalizePa(e.pa))) && (emp2 === 'ALL' || e.e === emp2) &&
                                (areaSel === 'ALL' || e.dir === areaSel) && (deptoSel === 'ALL' || e.d === deptoSel)
                            ).map(e => e.c || e.n)).size;

                            cumLY += lyHires;
                            cumCY += cyHires;

                            dataLY_cum.push(cumLY);
                            dataCY_cum.push(cumCY);
                        }

                        window.activeCharts.push(new Chart(ctxYTD.getContext('2d'), {
                            type: 'line',
                            plugins: [ChartDataLabels],
                            data: {
                                labels: labelsYTD,
                                datasets: [
                                    { label: 'Ingresos Acum. ' + targetY, data: dataCY_cum, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderWidth: 5, pointRadius: 6, fill: true, tension: 0.3, datalabels: { display: true, align: 'top', backgroundColor: '#fff', borderRadius: 8, padding: 6, font: { weight: 1000, size: 14 } } },
                                    { label: 'Ingresos Acum. ' + (targetY - 1), data: dataLY_cum, borderColor: '#cad4e0', backgroundColor: 'transparent', borderWidth: 4, pointRadius: 5, pointStyle: 'rectRot', tension: 0.3, datalabels: { display: true, align: 'bottom', font: { weight: 800, size: 11 } } }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { weight: 900, family: 'Montserrat' } } } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 800, size: 11 } } }
                                }
                            }
                        }));
                    } catch (e) { console.error("YTD Cumulative Chart failed:", e); }
                }

                // D. Tasa de RotaciÃ³n (%)
                const dataRotacion = monthlyBajas.map(b => currentHC > 0 ? parseFloat(((b / currentHC) * 100).toFixed(1)) : 0);
                const ctxRot = document.getElementById('chartRotacion');
                if (ctxRot) {
                    try {
                        window.activeCharts.push(new Chart(ctxRot.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: monthNamesArr,
                                datasets: [
                                    { label: 'RotaciÃ³n %', data: dataRotacion, borderColor: '#3b82f6', borderWidth: 3, tension: 0.4, pointBackgroundColor: '#fff', pointBorderWidth: 2,
                                    clip: false, pointRadius: 5 },
                                    { label: 'Meta', data: Array(12).fill(5), borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], pointRadius: 0 }
                                ]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
                        }));
                    } catch (e) { console.error("Rotation Chart failed:", e); }
                }

                // E. HC Neto por Mes
                const ctxNeto = document.getElementById('chartHCNeto');
                if (ctxNeto) {
                    const bgNeto = dataNeto.map(v => v >= 0 ? '#8b5cf6' : '#ef4444');
                    try {
                        window.activeCharts.push(new Chart(ctxNeto.getContext('2d'), {
                            type: 'bar',
                            data: { labels: monthNamesArr, datasets: [{ label: 'HC Neto', data: dataNeto, backgroundColor: bgNeto, borderRadius: 4 }] },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
                        }));
                    } catch (e) { console.error("Net HC Chart failed:", e); }
                }

                // F. Radar por Direccion
                const radareas = {};
                uniqueEmps.forEach(e => { const a = e.dir || 'Sin Direccion'; radareas[a] = (radareas[a] || 0) + 1; });
                const pareas = Object.keys(radareas).sort((a, b) => radareas[b] - radareas[a]).slice(0, 8);
                const radLabels = pareas.length > 0 ? pareas : ['Direccion'];
                const radData = radLabels.map(l => radareas[l] || 0);

                const ctxRadar = document.getElementById('chartRadar');
                if (ctxRadar) {
                    try {
                        window.activeCharts.push(new Chart(ctxRadar.getContext('2d'), {
                            type: 'radar',
                            data: {
                                labels: radLabels,
                                datasets: [{ label: 'Q. Colaboradores', data: radData, backgroundColor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8', pointBackgroundColor: '#fff', pointBorderColor: '#38bdf8' }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false } } } }
                        }));
                    } catch (e) { console.error("Radar by area Chart failed:", e); }
                }

                // F.2 TOP 5 AntigÃ¼edad
                const topAntRows = [...tenures].sort((a, b) => b.tenure - a.tenure).slice(0, 5);
                const antList = document.getElementById('topAntiquityList');
                if (antList) {
                    antList.innerHTML = topAntRows.map((e, i) => {
                        const st = getStyle(e.pa);
                        return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${st.color};">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: ${st.color}; border: 1px solid #e2e8f0; font-size: 14px;">${i + 1}</div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-weight: 800; color: #1e293b; font-size: 13px;">${e.n}</span>
                                <span style="font-size: 10px; color: #64748b; font-weight: 600;">${e.dir} | ${e.pa}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 900; color: #3b82f6; font-size: 16px;">${(Number(e.tenure) || 0).toFixed(1)} <span style="font-size: 9px; font-weight: 700; color: #94a3b8;">AÃ‘O</span></div>
                            <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">Ingreso: ${e.fi}</div>
                        </div>
                    </div> `;
                    }).join('');
                }

                // G. Estructura por AntigÃ¼edad
                const ctxRetg = document.getElementById('chartRetenciÃ³nGauge');
                if (ctxRetg) {
                    const tRanges = { '0-1': 0, '1-3': 0, '3-5': 0, '5+': 0 };
                    let totalT = 0;
                    tenures.forEach(e => {
                        const tv = e.tenure || 0;
                        totalT += tv;
                        if (tv < 1) tRanges['0-1']++;
                        else if (tv < 3) tRanges['1-3']++;
                        else if (tv < 5) tRanges['3-5']++;
                        else tRanges['5+']++;
                    });

                    const avgT = tenures.length > 0 ? (totalT / tenures.length).toFixed(1) : '0';
                    const lblTMain = document.getElementById('lblTenureMain');
                    if (lblTMain) lblTMain.innerText = avgT;
                    const lblTAvg = document.getElementById('lblTenureAvgValue');
                    if (lblTAvg) lblTAvg.innerText = avgT + ' A ';
                    const lblT01 = document.getElementById('lblTenure01Val');
                    if (lblT01) lblT01.innerText = tRanges['0-1'];
                    const lblT13 = document.getElementById('lblTenure13Val');
                    if (lblT13) lblT13.innerText = tRanges['1-3'];

                    try {
                        window.activeCharts.push(new Chart(ctxRetg.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: Object.keys(tRanges),
                                datasets: [{
                                    data: Object.values(tRanges),
                                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                                    borderWidth: 0,
                                    cutout: '75%',
                                    borderRadius: 6
                                }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: true } }
                            }
                        }));
                    } catch (e) { console.error("Tenure Gauge Chart failed:", e); }
                }

                // ================= NEW COMPARATIVE GROWTH CHARTS =================
                const yValRaw = document.getElementById('yearSel').value;
                const mVal = document.getElementById('monthSel').value;

                // Handle 'ALL' by picking the last available year
                const yearsInDataset = [...new Set(empsRaw.map(e => e.y))].filter(y => y).sort((a, b) => b - a);
                let growthY = (yValRaw === 'ALL') ? (yearsInDataset[0] || 2026) : parseInt(yValRaw);
                const prevY = growthY - 1;

                // If month is ALL, we pick the last month that has data for the current year
                let growthM = 12;
                if (mVal !== 'ALL') {
                    growthM = parseInt(mVal);
                } else {
                    const monthsForYear = empsRaw.filter(e => e.y == growthY).map(e => e.m);
                    growthM = monthsForYear.length > 0 ? Math.max(...monthsForYear) : 12;
                }

                if (growthY) {

                    const getHCForPeriod = (year, month, groupingField) => {
                        const counts = {};
                        const filtered = empsRaw.filter(e => e.y == year && e.m == month);
                        filtered.forEach(e => {
                            const key = e[groupingField] || 'N/A';
                            if (!counts[key]) counts[key] = new Set();
                            counts[key].add(e.c || e.n);
                        });

                        const result = {};
                        Object.keys(counts).forEach(k => result[k] = counts[k].size);

                        // APPLY OVERRIDES TO THIS GROUPING
                        const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                        Object.keys(overrides).forEach(key => {
                            const [pa, emp, ovrY, ovrM] = key.split('_');
                            // We check if this override matches the current period
                            if (ovrY == year && ovrM == month) {
                                if (groupingField === 'pa') {
                                    if (overrides[key].hc !== null) result[pa] = overrides[key].hc;
                                } else if (groupingField === 'e') {
                                    if (overrides[key].hc !== null && (emp === 'ALL' || result[emp] !== undefined)) {
                                        // If override is for a specific company, apply it
                                        if (emp !== 'ALL') result[emp] = overrides[key].hc;
                                    }
                                }
                            }
                        });

                        return result;
                    };

                    const hcCurCountry = getHCForPeriod(growthY, growthM, 'pa');
                    const hcPrevCountry = getHCForPeriod(prevY, growthM, 'pa');
                    const hcCurEmp = getHCForPeriod(growthY, growthM, 'e');
                    const hcPrevEmp = getHCForPeriod(prevY, growthM, 'e');

                    const countryLabels = [...new Set([...Object.keys(hcCurCountry), ...Object.keys(hcPrevCountry)])].sort();
                    const growthDataCountry = countryLabels.map(l => (hcCurCountry[l] || 0) - (hcPrevCountry[l] || 0));

                    const empLabels = [...new Set([...Object.keys(hcCurEmp), ...Object.keys(hcPrevEmp)])]
                        .filter(e => (hcCurEmp[e] || 0) > 0 || (hcPrevEmp[e] || 0) > 0)
                        .sort((a, b) => (hcCurEmp[b] || 0) - (hcCurEmp[a] || 0))
                        .slice(0, 10);
                    const growthDataEmp = empLabels.map(l => (hcCurEmp[l] || 0) - (hcPrevEmp[l] || 0));

                    // Update UI Labels
                    const mnames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const monthName = mnames[growthM] || 'Diciembre';
                    const compStr = `Crecimiento ${monthName} ${growthY} vs.${monthName} ${prevY} `;
                    if (document.getElementById('lblGrowthPais')) document.getElementById('lblGrowthPais').innerText = compStr;
                    if (document.getElementById('lblGrowthEmpresa')) document.getElementById('lblGrowthEmpresa').innerText = compStr;

                    const renderGrowthChart = (ctxId, labels, data, typeLabel) => {
                        const ctx = document.getElementById(ctxId);
                        if (!ctx) return;
                        const bgs = data.map(v => v >= 0 ? '#10b981' : '#ef4444');
                        const borders = data.map(v => v >= 0 ? '#059669' : '#dc2626');

                        try {
                            window.activeCharts.push(new Chart(ctx.getContext('2d'), {
                                type: 'bar',
                                data: {
                                    labels: labels.map(l => (paisMap[l] || l)),
                                    datasets: [{
                                        label: 'Crecimiento HC',
                                        data: data,
                                        backgroundColor: bgs,
                                        borderColor: borders,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        barThickness: 25
                                    }]
                                },
                                options: {
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const val = context.raw;
                                                    return `${val >= 0 ? 'Crecimiento' : 'Baja'}: ${Math.abs(val)} colaboradores`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { grid: { color: '#f1f5f9' }, ticks: { font: { weight: 700 } } },
                                        y: { grid: { display: false }, ticks: { font: { weight: 800, size: 10 } } }
                                    }
                                }
                            }));
                        } catch (e) { console.error("Growth Chart failed:", e); }
                    };

                    const lblP = document.getElementById('lblGrowthPais');
                    const lblE = document.getElementById('lblGrowthEmpresa');
                    const periodText = mVal === 'ALL' ? `Diciembre ${growthY} vs ${prevY} ` : `${mnames[growthM]} ${growthY} vs ${prevY} `;
                    if (lblP) lblP.innerText = periodText;
                    if (lblE) lblE.innerText = periodText;

                    renderGrowthChart('chartCrecimientoPais', countryLabels, growthDataCountry, 'Pais');
                    renderGrowthChart('chartCrecimientoEmpresa', empLabels, growthDataEmp, 'Empresa');
                }
            }

            // MEGA PRO ROTATION HEATMAP
            function renderAttritionHeatmap() {
                const container = document.getElementById('areaRotationHeatmap');
                if (!container) return;

                const { p: pais, e: emp, a, d, y, m, countries } = getFilters();
                const bajasSource = app.bajas_list || [];
                const empsSource = app.employees || [];

                // 1. Calculate Bajas per area in current period
                const bajas = bajasSource.filter(b => {
                    const matchPa = countries.length === 0 || countries.includes((b.pa || '').toUpperCase());
                    return matchPa && (emp === 'ALL' || b.e === emp) && (y === 'ALL' || b.y == y) && compareMonth(b.m, m);
                });

                const bajasByarea = {};
                bajas.forEach(b => { const area = b.dir || 'Sin area'; bajasByarea[area] = (bajasByarea[area] || 0) + 1; });

                const hcByarea = {};
                const activeEmps = empsSource.filter(e => {
                    const matchPa = countries.length === 0 || countries.includes((e.pa || '').toUpperCase());
                    return matchPa && (emp === 'ALL' || e.e === emp) && (y === 'ALL' || e.y == y) && compareMonth(e.m, m);
                });
                activeEmps.forEach(e => { const area = e.dir || 'Sin area'; hcByarea[area] = (hcByarea[area] || 0) + 1; });

                const areas = [...new Set([...Object.keys(bajasByarea), ...Object.keys(hcByarea)])].sort();
                const stats = areas.map(name => {
                    const numBajas = bajasByarea[name] || 0;
                    const curHC = hcByarea[name] || 0;
                    const rate = curHC > 0 ? (numBajas / curHC) * 100 : 0;
                    return { name, bajas: numBajas, hc: curHC, rate };
                }).filter(s => s.bajas > 0).sort((a, b) => b.rate - a.rate);

                if (stats.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8; font-weight:700;">No hay datos de RotaciÃ³n para los filtros seleccionados.</div>`;
                    return;
                }

                container.innerHTML = `
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:15px;">
                        ${stats.map(s => {
                    let color = '#10b981';
                    if (s.rate > 15) color = '#ef4444';
                    else if (s.rate > 5) color = '#f59e0b';

                    return `
                                <div style="background:${color}15; border:1.5px solid ${color}; padding:15px; border-radius:14px; text-align:center;">
                                    <div style="font-size:24px; font-weight:900; color:${color}; margin-bottom:4px;">${s.bajas}</div>
                                    <div style="font-size:10px; font-weight:800; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8;">${s.name}</div>
                                    <div style="font-size:9px; font-weight:900; color:${color}; margin-top:8px;">${s.rate.toFixed(1)}% RotaciÃ³n</div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;
            }

            function renderHeatmap(emps) {
                const container = document.getElementById('regionalHeatmap');
                if (!container) return;

                const sourceEmps = emps || (cachedEmps ? cachedEmps.unique : []);
                if (sourceEmps.length === 0) {
                    container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;">Sin datos de puestos</div>`;
                    return;
                }

                const showAll = document.getElementById('chkShowAllPos')?.checked || false;
                const counts = {};
                sourceEmps.forEach(e => {
                    const p = (e.p || 'Sin Puesto').trim().toUpperCase();
                    counts[p] = (counts[p] || 0) + 1;
                });

                let sorted = Object.entries(counts).map(([name, hc]) => ({ name, hc })).sort((a, b) => b.hc - a.hc);
                if (!showAll) sorted = sorted.slice(0, 10); // Match UI to show a few but big

                container.innerHTML = `
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; width:100%;">
                        ${sorted.map((s, i) => {
                    const op = i === 0 ? 0.9 : Math.max(0.1, 0.4 - (i * 0.04));
                    const isFull = i === sorted.length - 1 && sorted.length % 3 !== 0;
                    return `
                                <div style="grid-column: ${isFull ? '1 / -1' : 'auto'}; background:rgba(139, 92, 246, ${op}); color:${i === 0 ? '#fff' : '#1e293b'}; padding:22px; border-radius:16px; text-align:center; transition:0.3s; box-shadow:0 4px 12px rgba(139, 92, 246, 0.1); border:1px solid rgba(139, 92, 246, 0.2);">
                                    <div style="font-size:26px; font-weight:1000; margin-bottom:4px;">${s.hc}</div>
                                    <div style="font-size:9px; font-weight:900; text-transform:uppercase; opacity:0.8; letter-spacing:0.5px;">${s.name}</div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;
            }


}




/* ===== headcount-subviews.js ===== */
﻿// Headcount subviews extracted from the main HTML.

function renderSubActives() {
                try {
                const emps = applyDeepFilters(app.employees);
                if (emps.length === 0) {
                    ['subActRadar', 'subActTenure', 'subActPyramid', 'subActDepto', 'subActTrend', 'chartAcumuladoYoY', 'chartClassic14areas'].forEach(id => showNoData(id));
                    return;
                }
                ['subActRadar', 'subActTenure', 'subActPyramid', 'subActDepto', 'subActTrend', 'chartAcumuladoYoY', 'chartClassic14areas'].forEach(id => hideNoData(id));

                    const filters = getFilters();
                    const { y, m } = filters;
                    const allBajas = app.bajas_list || [];
                    const hiresSet = new Set();
                    emps.forEach(item => {
                        if (!item.fi) return;
                        const fparts = item.fi.split('/');
                        if (fparts.length < 3) return;
                        const fy = parseInt(fparts[2]);
                        const fm = parseInt(fparts[1]);
                        if ((y === 'ALL' || fy == parseInt(y)) && (m === 'ALL' || fm == parseInt(m))) {
                            hiresSet.add(item.c || item.n);
                        }
                    });

                    const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                    const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                    const activeEmpsForTenure = emps.filter(e => {
                        const code = e.c || e.n;
                        const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                        return !isBaja;
                    });
                    const tenures = activeEmpsForTenure.map(e => ({ ...e, tenure: e.t || calcTenure(e.fi) }));
                    const filteredBajas = applyDeepFilters(allBajas);
                    if ((document.getElementById('chartAcumuladoYoY') || document.getElementById('chartClassic14areas')) && typeof renderExecutiveCharts === 'function') {
                        renderExecutiveCharts(tenures, y, m, hiresSet, emps, app.employees || [], emps.length, filteredBajas.length, filteredBajas);
                    }

                    // --- RENDER MINI DONUTS GRID (PREVIOUS VERSION REBORN) ---
                    const dim = window._distPropDim || 'e';
                    const dataMap = {};
                    emps.forEach(e => {
                        let key = '';
                        if (dim === 'pa') key = normalizePa(e.pa);
                        else if (dim === 'e') key = e.e || 'N/A';
                        else if (dim === 'dir') key = e.dir || e.area || 'N/A';
                        else if (dim === 'd') key = e.d || e.depto || 'N/A';
                        if (key) dataMap[key] = (dataMap[key] || 0) + 1;
                    });
                    const gridContainer = document.getElementById('subActMiniDonutsGrid');
                    if (gridContainer) {
                        const totalAll = Object.values(dataMap).reduce((a, b) => a + b, 0) || 1;
                        const sortedEntries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);
                        const getMiniDonut = (pct, color) => {
                            const r = 20; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ;
                            return `<div style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                <svg width="64" height="64" viewBox="0 0 52 52" style="transform: rotate(-90deg)">
                                    <circle cx="26" cy="26" r="${r}" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="4" />
                                    <circle cx="26" cy="26" r="${r}" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" />
                                </svg>
                                <span style="position:absolute; font-size:12px; font-weight:1000; color:#1e293b;">${Math.round(pct)}%</span>
                            </div>`;
                        };
                        gridContainer.innerHTML = sortedEntries.map(([k, val], idx) => {
                            const pct = (val / totalAll * 100).toFixed(1);
                            const st = (dim === 'pa') ? getStyle(k) : { color: '#8b5cf6' };
                            const fullName = (dim === 'pa') ? (paisMap[k] || k).toUpperCase() : k.toUpperCase();
                            return `<div class="dist-row-premium" style="display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.6); backdrop-filter:blur(10px); padding:11px 16px; border-radius:18px; border:1px solid rgba(255,255,255,0.8); box-shadow:0 4px 15px rgba(0,0,0,0.03); transition:all 0.3s ease;">
                                ${getMiniDonut(pct, st.color)}
                                <div style="flex:1; min-width:0;">
                                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                                        <span style="font-size:12px; font-weight:1000; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fullName}</span>
                                    </div>
                                    <div style="width:100%; height:9px; background:rgba(0,0,0,0.04); border-radius:10px; overflow:hidden; position:relative;">
                                        <div style="height:100%; width:${(val / sortedEntries[0][1] * 100)}%; background:${st.color}; border-radius:10px;"></div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; margin-top:5px;">
                                        <span style="font-size:12px; font-weight:1000; color:${st.color};">${val.toLocaleString()}</span>
                                        <span style="font-size:9px; font-weight:800; color:#94a3b8;">COLABORADORES</span>
                                    </div>
                                </div>
                            </div>`;
                        }).join('');
                    }

                    const areas = {}; 
                    emps.forEach(emp => { 
                        const d = emp.dir || emp.area || emp.DIRECCION || 'Sin area';
                        areas[d] = (areas[d] || 0) + 1; 
                    });
                    const sareas = Object.keys(areas).sort((a,b) => areas[b] - areas[a]).slice(0, 10);
                    const radarLabels = sareas.map(a => [a.substring(0, 16), `${areas[a]}`]);
                    const radarValues = sareas.map(a => areas[a]);
                    window.activeCharts.push(new Chart(document.getElementById('subActRadar').getContext('2d'), {
                        type: 'radar', 
                        data: { labels: radarLabels, datasets: [{
                            data: radarValues,
                            backgroundColor: 'rgba(139, 92, 246, 0.4)',
                            borderColor: '#8b5cf6',
                            borderWidth: 2,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#8b5cf6'
                        }]
                    },
                    options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));


                    const tMap = { 'Nuevo (<1 año)': 0, 'Junior (1-3 años)': 0, 'Mid (3-5 años)': 0, 'Senior (5+ años)': 0 };
                    emps.forEach(e => { if (e.fi) tMap[classifyRango(calcTenure(e.fi))]++; });
                    window.activeCharts.push(new Chart(document.getElementById('subActTenure').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: Object.keys(tMap), datasets: [{ label: 'Colaboradores', data: Object.values(tMap), backgroundColor: ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'], borderRadius: 8 }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
                    }));

                    const pira = { '0-1': 0, '1-2': 0, '2-3': 0, '3-5': 0, '5-10': 0, '10+': 0 };
                    emps.forEach(e => {
                        const t = calcTenure(e.fi);
                        if (t < 1) pira['0-1']++; else if (t < 2) pira['1-2']++; else if (t < 3) pira['2-3']++;
                        else if (t < 5) pira['3-5']++; else if (t < 10) pira['5-10']++; else pira['10+']++;
                    });
                    window.activeCharts.push(new Chart(document.getElementById('subActPyramid').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: Object.keys(pira), datasets: [{ label: 'Personal', data: Object.values(pira), backgroundColor: 'rgba(139, 92, 246, 0.6)', borderColor: '#8b5cf6', borderWidth: 1 }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));

                    const deptoMap = {};
                    emps.forEach(e => { 
                        const d = e.d || e.depto || e.DEPARTAMENTO || 'Sin depto';
                        deptoMap[d] = (deptoMap[d] || 0) + 1; 
                    });
                    const sDepto = Object.entries(deptoMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
                    window.activeCharts.push(new Chart(document.getElementById('subActDepto').getContext('2d'), {
                        type: 'bar',
                        data: { labels: sDepto.map(x => x[0]), datasets: [{ label: 'HC', data: sDepto.map(x => x[1]), backgroundColor: '#6366f1', borderRadius: 5 }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                    }));

                    const histData = Array(12).fill(0);
                    app.employees.forEach(e => {
                        if (compareYear((e.y || e.yr), y)) {
                            const mVal = e.m || e.mo;
                            if (mVal >= 1 && mVal <= 12) histData[mVal-1]++;
                        }
                    });
                    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    window.activeCharts.push(new Chart(document.getElementById('subActTrend').getContext('2d'), {
                        type: 'line', 
                        data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Evolución HC', data: histData, borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));

                    // --- NEW: INTEGRATED CLASSIC ANALYSIS FOR HC REAL ---
                    const ctxTrendReal2 = document.getElementById('chartHCTrendReal2');
                    if (ctxTrendReal2) {
                        const vLen2 = window._hcViewLengthReal2 || 6;
                        const dLabels2 = [], dData2 = [], dDiff2 = [];
                        const { y: targetY, m: targetM } = getFilters();
                        const tyNums = parseInt(targetY) || 2026;
                        const tmnums = parseInt(targetM) || 3;

                        const f = getFilters();
                        for (let i = 0; i < vLen2; i++) {
                            let cY = tyNums, cM = tmnums - (vLen2 - 1 - i);
                            while (cM < 1) { cM += 12; cY--; }
                            dLabels2.push(monthNames[cM] + (cY !== tyNums ? " '" + String(cY).slice(-2) : ''));
                            
                            const s = new Set();
                            app.employees.forEach(e => {
                                const itemPa = normalizePa(e.pa);
                                const matchPa = (f.countries.length === 0 || f.countries.includes(itemPa));
                                const matchEmp = (f.e === 'ALL' || (e.e || "").trim().toUpperCase() === f.e.trim().toUpperCase());
                                const matcharea = (f.a === 'ALL' || (e.dir || e.area || "").trim().toUpperCase() === f.a.trim().toUpperCase());
                                const matchDepto = (f.d === 'ALL' || (e.d || e.depto || "").trim().toUpperCase() === f.d.trim().toUpperCase());
                                
                                if (matchPa && matchEmp && matcharea && matchDepto && (e.y || e.yr) == cY && (e.m || e.mo) == cM) {
                                    s.add(e.c || e.n);
                                }
                            });
                            dData2.push(s.size);
                        }
                        for (let i = 0; i < dData2.length; i++) { dDiff2.push(i > 0 ? dData2[i] - dData2[i-1] : 0); }

                        window.activeCharts.push(new Chart(ctxTrendReal2.getContext('2d'), {
                            type: 'line',
                            data: {
                                labels: dLabels2,
                                datasets: [{
                                    label: 'HC',
                                    data: dData2,
                                    borderColor: '#6366f1',
                                    borderWidth: 3,
                                    backgroundColor: 'rgba(99,102,241,0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4
                                }]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const diff = dDiff2[ctx.dataIndex];
                                                const arrow = diff > 0 ? ' ' : diff < 0 ? ' ' : '   ';
                                                return ` HC: ${ctx.parsed.y} (${arrow} ${diff})`;
                                            }
                                        }
                                    }
                                }
                            }
                        }));
                    }

                    const ctxarea2 = document.getElementById('chartareaReal2');
                    if (ctxarea2) {
                        const deptCounts = {};
                        emps.forEach(e => { if (e.d) deptCounts[e.d] = (deptCounts[e.d] || 0) + 1; });
                        const top8 = Object.entries(deptCounts).sort((a,b) => b[1]-a[1]).slice(0, 8);
                        window.activeCharts.push(new Chart(ctxarea2.getContext('2d'), {
                            type: 'doughnut',
                            data: {
                                labels: top8.map(d => d[0]),
                                datasets: [{ data: top8.map(d => d[1]), backgroundColor: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b'] }]
                            },
                            options: { responsive: true, maintainAspectRatio: false, cutout: '65%' }
                        }));
                    }
                    // --- END INTEGRATED CLASSIC ANALYSIS ---
                } catch(e) { console.error("Error in renderSubActives:", e); }
            }

            function renderSubHires() {
                try {
                const hires = applyDeepFilters(app.employees);
                if (hires.length === 0) {
                    ['subHiresTrend', 'subHiresRadar', 'subHiresDir', 'subHiresDepto', 'subHiresEmp', 'subHiresYTD'].forEach(id => showNoData(id));
                    return;
                }
                ['subHiresTrend', 'subHiresRadar', 'subHiresDir', 'subHiresDepto', 'subHiresEmp', 'subHiresYTD'].forEach(id => hideNoData(id));
                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const trend = Array(12).fill(0); 
                hires.forEach(h => { const mv = h.m || h.mo; if (mv >= 1 && mv <= 12) trend[mv - 1]++; });
                window.activeCharts.push(new Chart(document.getElementById('subHiresTrend').getContext('2d'), {
                    type: 'line', 
                    data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Altas', data: trend, borderColor: '#10b981', fill: true, backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const radarCtx = document.getElementById('subHiresRadar');
                if (radarCtx) {
                    const dirCounts = {};
                    hires.forEach(h => { if (h.dir) dirCounts[h.dir] = (dirCounts[h.dir] || 0) + 1; });
                    const rLabels = Object.keys(dirCounts);
                    const radarLabels = rLabels.map(l => [l.substring(0, 16), `${dirCounts[l]}`]);
                    window.activeCharts.push(new Chart(radarCtx.getContext('2d'), {
                        type: 'radar',
                        data: {
                            labels: radarLabels,
                            datasets: [{
                                label: 'DISTRIBUCIÓN Altas',
                                data: Object.values(dirCounts),
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                borderColor: '#10b981',
                                pointBackgroundColor: '#10b981'
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    beginAtZero: true, 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));

                }

                const dirMap = {};
                hires.forEach(h => { if (h.dir) dirMap[h.dir] = (dirMap[h.dir] || 0) + 1; });
                const sDir = Object.entries(dirMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
                window.activeCharts.push(new Chart(document.getElementById('subHiresDir').getContext('2d'), {
                    type: 'bar',
                    data: { labels: sDir.map(x => x[0]), datasets: [{ label: 'Altas', data: sDir.map(x => x[1]), backgroundColor: '#3b82f6', borderRadius: 6 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const deptoMap = {};
                hires.forEach(h => { if (h.d) deptoMap[h.d] = (deptoMap[h.d] || 0) + 1; });
                const sDept = Object.entries(deptoMap).sort((a,b) => b[1]-a[1]).slice(0, 15);
                window.activeCharts.push(new Chart(document.getElementById('subHiresDepto').getContext('2d'), {
                    type: 'bar',
                    data: { labels: sDept.map(x => x[0].substring(0, 20)), datasets: [{ label: 'Altas', data: sDept.map(x => x[1]), backgroundColor: '#10b981', borderRadius: 8 }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const empMap = {};
                hires.forEach(h => { if (h.e) empMap[h.e] = (empMap[h.e] || 0) + 1; });
                window.activeCharts.push(new Chart(document.getElementById('subHiresEmp').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: Object.keys(empMap), datasets: [{ data: Object.values(empMap), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
                }));

                let acc = 0;
                const accData = Array(12).fill(0);
                for(let i=0; i<12; i++) { acc += trend[i]; accData[i] = acc; }
                window.activeCharts.push(new Chart(document.getElementById('subHiresYTD').getContext('2d'), {
                    type: 'line', 
                    data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Acumulado YTD', data: accData, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubHires:", e); }
            }

            function renderSubBajas() {
                try {
                const context = applyDeepFilters(app.bajas_list);
                if (context.length === 0) {
                    ['subBajasTrend', 'subBajasRadar', 'subBajasDir', 'subBajasMotivos', 'subBajasYTD'].forEach(id => showNoData(id));
                    const dEl = document.getElementById('subBajasDepto'); if(dEl) showNoData('subBajasDepto');
                    return;
                }
                ['subBajasTrend', 'subBajasRadar', 'subBajasDir', 'subBajasMotivos', 'subBajasYTD'].forEach(id => hideNoData(id));
                const dEl2 = document.getElementById('subBajasDepto'); if(dEl2) hideNoData('subBajasDepto');

                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const trend = Array(12).fill(0);
                context.forEach(b => { 
                    const mv = parseInt(normalizeMonth(b.m || b.mo)); 
                    if(mv >= 1 && mv <= 12) trend[mv-1]++; 
                });
                window.activeCharts.push(new Chart(document.getElementById('subBajasTrend').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Bajas', data: trend, borderColor: '#ef4444', fill: true, backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const radarCtxB = document.getElementById('subBajasRadar');
                if (radarCtxB) {
                    const dirCounts = {};
                    context.forEach(b => { if (b.dir) dirCounts[b.dir] = (dirCounts[b.dir] || 0) + 1; });
                    const radarLabels = Object.keys(dirCounts).map(l => [l.substring(0, 16), `${dirCounts[l]}`]);
                    window.activeCharts.push(new Chart(radarCtxB.getContext('2d'), {
                        type: 'radar',
                        data: {
                            labels: radarLabels,
                            datasets: [{
                                label: 'DISTRIBUCIÓN Bajas',
                                data: Object.values(dirCounts),
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: '#ef4444',
                                pointBackgroundColor: '#ef4444'
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                r: { 
                                    beginAtZero: true, 
                                    ticks: { display: false },
                                    pointLabels: {
                                        font: { size: 14, weight: 1000, family: 'Montserrat' },
                                        color: '#8b5cf6',
                                        padding: 8
                                    }
                                } 
                            } 
                        }
                    }));

                }

                const dirMap = {};
                context.forEach(b => { if(b.dir) dirMap[b.dir] = (dirMap[b.dir]||0)+1; });
                const sDir = Object.entries(dirMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
                window.activeCharts.push(new Chart(document.getElementById('subBajasDir').getContext('2d'), {
                    type: 'bar', data: { labels: sDir.map(x=>x[0]), datasets: [{ label: 'Bajas', data: sDir.map(x=>x[1]), backgroundColor: '#ef4444' }] },
                    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                }));

                const deptoMap = {};
                context.forEach(b => { if(b.d) deptoMap[b.d] = (deptoMap[b.d]||0)+1; });
                const sDept = Object.entries(deptoMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
                const deptoCanvas = document.getElementById('subBajasDepto');
                if (deptoCanvas) {
                    window.activeCharts.push(new Chart(deptoCanvas.getContext('2d'), {
                        type: 'bar', data: { labels: sDept.map(x=>x[0]), datasets: [{ label: 'Bajas', data: sDept.map(x=>x[1]), backgroundColor: '#fca5a5' }] },
                        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
                    }));
                }

                const motMap = {};
                context.forEach(b => { const mStr = b.mc || 'S/M'; motMap[mStr] = (motMap[mStr]||0)+1; });
                const sMot = Object.entries(motMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
                window.activeCharts.push(new Chart(document.getElementById('subBajasMotivos').getContext('2d'), {
                    type: 'pie', data: { labels: sMot.map(x=>x[0]), datasets: [{ data: sMot.map(x=>x[1]), backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#4f46e5', '#3730a3'] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                let acc = 0;
                const accData = Array(12).fill(0);
                for(let i=0; i<12; i++) { acc += trend[i]; accData[i] = acc; }
                window.activeCharts.push(new Chart(document.getElementById('subBajasYTD').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Total Acumulado', data: accData, borderColor: '#dc2626', fill: false }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubBajas:", e); }
            }

            function renderSubTurnover() {
                try {
                const bajas = applyDeepFilters(app.bajas_list);
                if (bajas.length === 0) {
                    ['subRotType', 'subRotEarly', 'subRotPais', 'subRotTrend'].forEach(id => showNoData(id));
                    const tr = document.getElementById('subRotTreemap'); if(tr) tr.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#64748b;">No hay datos</div>';
                    return;
                }
                ['subRotType', 'subRotEarly', 'subRotPais', 'subRotTrend'].forEach(id => hideNoData(id));
                const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                const types = { 'Voluntaria': 0, 'Involuntaria': 0 };
                bajas.forEach(b => { if ((b.mc || '').toLowerCase().includes('renuncia')) types['Voluntaria']++; else types['Involuntaria']++; });
                window.activeCharts.push(new Chart(document.getElementById('subRotType').getContext('2d'), {
                    type: 'bar', data: { labels: ['VOLUNTARIA', 'INVOLUNTARIA'], datasets: [{ data: [types['Voluntaria'], types['Involuntaria']], backgroundColor: ['#10b981', '#ef4444'] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const treemapContainer = document.getElementById('subRotTreemap');
                if (treemapContainer) {
                    const reasonCounts = {};
                    bajas.forEach(b => {
                        const reason = b.mc || 'Sin motivo';
                        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                    });
                    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
                    const totalBajasTree = sortedReasons.reduce((a, b) => a + b[1], 0) || 1;
                    const treemapColors = {
                        'Renuncia': '#3b82f6', 'Renuncia Voluntaria': '#60a5fa',
                        'Despido con Responsabilidad Patronal': '#ef4444', 'Despido sin Responsabilidad Patronal': '#dc2626',
                        'Abandono de Labores': '#f59e0b', 'Sustitución Patronal': '#8b5cf6',
                        'Fallecimiento': '#64748b', 'Jubilaci ': '#10b981',
                        'Fin de Contrato': '#0ea5e9', 'Mutuo Acuerdo': '#a855f7'
                    };
                    const getReasonColor = (reason) => {
                        if (treemapColors[reason]) return treemapColors[reason];
                        const lower = reason.toLowerCase();
                        if (lower.includes('renuncia') || lower.includes('voluntaria')) return '#3b82f6';
                        if (lower.includes('despido') || lower.includes('involuntaria')) return '#ef4444';
                        return '#8b5cf6';
                    };
                    let treemapHTML = '<div style="display:flex;flex-wrap:wrap;gap:4px;width:100%;height:100%;align-content:flex-start;">';
                    sortedReasons.forEach(([reason, count]) => {
                        const pct = (count / totalBajasTree) * 100;
                        const minWidth = Math.max(80, pct * 4);
                        const height = Math.max(60, Math.min(120, pct * 3));
                        const color = getReasonColor(reason);
                        treemapHTML += `
                            <div style="flex:1 1 ${minWidth}px; min-width:${minWidth}px; height:${height}px; background:${color}; border-radius:12px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;"
                                 onmouseenter="this.style.transform='scale(1.03)';" onmouseleave="this.style.transform='scale(1)';">
                                <span style="font-size:8px; font-weight:900; color:#fff; text-transform:uppercase;">${reason.length > 30 ? reason.substring(0, 30) + ' ' : reason}</span>
                                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                                    <span style="font-size:22px; font-weight:1000; color:#fff;">${count}</span>
                                    <span style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.8);">${pct.toFixed(1)}%</span>
                                </div>
                            </div>`;
                    });
                    treemapHTML += '</div>';
                    treemapContainer.innerHTML = treemapHTML;
                }

                let early = 0, late = 0;
                bajas.forEach(b => { if (parseFloat(b.t) < 0.25) early++; else late++; });
                window.activeCharts.push(new Chart(document.getElementById('subRotEarly').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: ['< 90 D ', '> 90 D '], datasets: [{ data: [early, late], backgroundColor: ['#ef4444', '#3b82f6'] }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
                }));

                const pRot = {};
                bajas.forEach(b => { const pa = normalizePa(b.pa); pRot[pa] = (pRot[pa] || 0) + 1; });
                window.activeCharts.push(new Chart(document.getElementById('subRotPais').getContext('2d'), {
                    type: 'bar',
                    data: { labels: Object.keys(pRot).map(k => paisMap[k] || k), datasets: [{ label: 'Bajas', data: Object.values(pRot), backgroundColor: '#8b5cf6' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));

                const { y } = getFilters();
                const trendR = Array(12).fill(0);
                bajas.forEach(b => { if(compareYear(b.y, y)) { const m = b.m||b.mo; if(m>=1 && m<=12) trendR[m-1]++; } });
                window.activeCharts.push(new Chart(document.getElementById('subRotTrend').getContext('2d'), {
                    type: 'line', data: { labels: monthNames.slice(1,13), datasets: [{ label: 'Bajas Mensuales', data: trendR, borderColor: '#8b5cf6', fill: true, backgroundColor: 'rgba(139,92,246,0.1)' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
                } catch(e) { console.error("Error in renderSubTurnover:", e); }
            }

            function renderSubGrowth() {
                try {
                    const emps = applyDeepFilters(app.employees);
                    const bajas = applyDeepFilters(app.bajas_list);
                    const mH = Array(12).fill(0), mB = Array(12).fill(0);
                    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                    emps.forEach(h => { const mv = h.m || h.mo; if (mv >= 1 && mv <= 12) mH[mv - 1]++; });
                    bajas.forEach(b => { const mv = b.m || b.mo; if (mv >= 1 && mv <= 12) mB[mv - 1]++; });
                    window.activeCharts.push(new Chart(document.getElementById('subGrowthTrend').getContext('2d'), {
                        type: 'bar', data: { labels: monthNames.slice(1, 13), datasets: [{ label: 'Altas', data: mH, backgroundColor: '#10b981' }, { label: 'Bajas', data: mB.map(x => -x), backgroundColor: '#ef4444' }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    }));
                } catch(e) { console.error("Error in renderSubGrowth:", e); }
            }

            function renderSubCountries() {
                try {
                    const { y, m } = getFilters();
                    const rawEmps = applyDeepFilters(app.employees);
                    const bajasRaw = applyDeepFilters(app.bajas_list);
                    
                    // Deduplicate emps: Keep only the latest record per person in the current filtered set
                    const empsMap = new Map();
                    rawEmps.forEach(x => {
                        const personKey = (x.c || x.n || '').toString().trim();
                        if (!personKey) return;
                        const existing = empsMap.get(personKey);
                        const currM = parseInt(x.m) || 0;
                        const existM = existing ? (parseInt(existing.m) || 0) : -1;
                        if (!existing || currM > existM) {
                            empsMap.set(personKey, x);
                        }
                    });
                    const emps = Array.from(empsMap.values());

                    if (emps.length === 0) {
                        ['subCountryBar', 'subCountryRadar', 'subCountryPie', 'subCountryGrowth'].forEach(id => showNoData(id));
                        const grid = document.getElementById('subCountryGrid');
                        if (grid) grid.innerHTML = '<div style="grid-column:1/-1; padding:40px; text-align:center; color:#64748b; font-weight:800;">No se encontraron colaboradores para los criterios seleccionados.</div>';
                        return;
                    }

                    ['subCountryBar', 'subCountryRadar', 'subCountryPie', 'subCountryGrowth'].forEach(id => hideNoData(id));

                    // 1. Data Aggregation
                    const counts = {};
                    const prevCounts = {};
                    const bajasCounts = {};

                    // Current Period Counts
                    emps.forEach(x => { 
                        const p = normalizePa(x.pa); 
                        counts[p] = (counts[p] || 0) + 1; 
                    });

                    // Bajas Counts
                    bajasRaw.forEach(b => {
                        const p = normalizePa(b.pa);
                        bajasCounts[p] = (bajasCounts[p] || 0) + 1;
                    });

                    // Previous Period Counts (for Growth & Deltas)
                    if (y !== 'ALL') {
                        let py, pm;
                        if (m !== 'ALL') {
                            py = (m == 1) ? parseInt(y) - 1 : parseInt(y);
                            pm = (m == 1) ? 12 : parseInt(m) - 1;
                        } else {
                            py = parseInt(y) - 1;
                            pm = 'ALL'; 
                        }
                        
                        const rawPrev = applyDeepFilters(app.employees, { y: py, m: pm });
                        const prevMap = new Map();
                        rawPrev.forEach(x => {
                            const personKey = (x.c || x.n || '').toString().trim();
                            if (!personKey) return;
                            const existing = prevMap.get(personKey);
                            const currM = parseInt(x.m) || 0;
                            const existM = existing ? (parseInt(existing.m) || 0) : -1;
                            if (!existing || currM > existM) {
                                prevMap.set(personKey, x);
                            }
                        });
                        
                        prevMap.forEach(e => {
                            const p = normalizePa(e.pa);
                            prevCounts[p] = (prevCounts[p] || 0) + 1;
                        });
                    }

                    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
                    const data = labels.map(l => counts[l]);
                    const colors = labels.map(l => (countryStyles[l] || countryStyles['OTHER']).color);

                    // 2. Render Charts
                    // Bar Chart
                    window.activeCharts.push(new Chart(document.getElementById('subCountryBar').getContext('2d'), {
                        type: 'bar', 
                        data: { labels: labels.map(l => paisMap[l] || l), datasets: [{ label: 'Personal', data: data, backgroundColor: colors, borderRadius: 8 }] },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    }));

                    // Pie Chart
                    window.activeCharts.push(new Chart(document.getElementById('subCountryPie').getContext('2d'), {
                        type: 'doughnut', 
                        data: { labels: labels.map(l => paisMap[l] || l), datasets: [{ data: data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
                        options: { 
                            responsive: true, maintainAspectRatio: false, cutout: '70%',
                            plugins: { legend: { position: 'right', labels: { font: { family: 'Montserrat', weight: 800 }, color: '#64748b' } } }
                        }
                    }));

                    // Radar Chart
                    const radarLabels = labels.map((l, i) => [paisMap[l] || l, `${data[i]}`]);
                    window.activeCharts.push(new Chart(document.getElementById('subCountryRadar').getContext('2d'), {
                        type: 'radar', 
                        data: { 
                            labels: radarLabels, 
                            datasets: [{ label: 'Presencia', data: data, backgroundColor: 'rgba(99,102,241,0.1)', borderColor: '#8b5cf6', borderWidth: 2, pointBackgroundColor: '#8b5cf6' }] 
                        },
                        options: { 
                            responsive: true, maintainAspectRatio: false, 
                            scales: { r: { ticks: { display: false }, pointLabels: { font: { size: 11, weight: 1000, family: 'Montserrat' }, color: '#8b5cf6' } } } 
                        }
                    }));

                    // Growth Chart
                    const growthData = labels.map(l => {
                        const curr = counts[l] || 0;
                        const prev = prevCounts[l] || 0;
                        return prev === 0 ? 0 : ((curr - prev) / prev) * 100;
                    });
                    window.activeCharts.push(new Chart(document.getElementById('subCountryGrowth').getContext('2d'), {
                        type: 'bar', 
                        data: { 
                            labels: labels.map(l => paisMap[l] || l), 
                            datasets: [{ 
                                label: 'Crecimiento %', 
                                data: growthData, 
                                backgroundColor: growthData.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                                borderRadius: 5
                            }] 
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    }));

                    // 3. Populate Country Grid
                    const grid = document.getElementById('subCountryGrid');
                    if (grid) {
                        grid.innerHTML = labels.map(code => {
                            const name = paisMap[code] || code;
                            const style = countryStyles[code] || countryStyles['OTHER'];
                            const hc = counts[code] || 0;
                            const prevHc = prevCounts[code] || 0;
                            const diff = hc - prevHc;
                            const pct = prevHc === 0 ? 0 : (diff / prevHc) * 100;
                            const bajas = bajasCounts[code] || 0;
                            const turnover = hc === 0 ? 0 : (bajas / hc) * 100;

                            const arrow = diff > 0 ? 'â–²' : (diff < 0 ? 'â–¼' : 'â†’');
                            const diffColor = diff > 0 ? '#10b981' : (diff < 0 ? '#ef4444' : '#94a3b8');

                            return `
                                <div class="country-card" style="background:white; border-radius:18px; padding:20px; border:1px solid #f1f5f9; box-shadow:0 10px 25px -10px rgba(0,0,0,0.05); transition:0.3s; position:relative; overflow:hidden;"
                                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 30px -10px rgba(0,0,0,0.08)';"
                                     onmouseout="this.style.transform='none'; this.style.boxShadow='0 10px 25px -10px rgba(0,0,0,0.05)';">
                                    
                                    <div style="position:absolute; top:-20px; right:-20px; width:80px; height:80px; background:${style.color}08; border-radius:50%;"></div>
                                    
                                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                                        <div style="width:44px; height:32px; border-radius:6px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                                            <img src="${style.fUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://flagcdn.com/w80/un.png'">
                                        </div>
                                        <div>
                                            <h4 style="margin:0; font-size:15px; font-weight:900; color:#1e293b; text-transform:uppercase;">${name}</h4>
                                            <span style="font-size:9px; font-weight:800; color:#94a3b8; letter-spacing:1px;">ID: ${code}</span>
                                        </div>
                                    </div>

                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                                        <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                                            <span style="display:block; font-size:8px; font-weight:1000; color:#94a3b8; margin-bottom:5px;">HEADCOUNT</span>
                                            <div style="display:flex; align-items:baseline; gap:5px;">
                                                <span style="font-size:20px; font-weight:1000; color:#1e293b;">${hc}</span>
                                                <span style="font-size:10px; font-weight:900; color:${diffColor};">${arrow} ${Math.abs(diff)}</span>
                                            </div>
                                        </div>
                                        <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                                            <span style="display:block; font-size:8px; font-weight:1000; color:#94a3b8; margin-bottom:5px;">BAJAS</span>
                                            <div style="display:flex; align-items:baseline; gap:5px;">
                                                <span style="font-size:20px; font-weight:1000; color:#ef4444;">${bajas}</span>
                                                <span style="font-size:9px; font-weight:800; color:#64748b;">TOTAL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                                        <div>
                                            <span style="display:block; font-size:8px; font-weight:900; color:#64748b;">CRECIMIENTO</span>
                                            <span style="font-size:11px; font-weight:1000; color:${diffColor};">${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%</span>
                                        </div>
                                        <div style="text-align:right;">
                                            <span style="display:block; font-size:8px; font-weight:900; color:#64748b;">Rotación</span>
                                            <span style="font-size:11px; font-weight:1000; color:#1e293b;">${turnover.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    }

                } catch(e) { 
                    console.error("Error in renderSubCountries:", e); 
                }
            }



/* ===== headcount-advanced.js ===== */
// Advanced Headcount helpers extracted from the main HTML.

function renderHCRegistry(emps) {
                const tbody = document.getElementById('tbodyHCReg');
                if (!tbody) return;

                const data = emps.slice(0, 300);

                tbody.innerHTML = data.map(e => {
                    const puesto = (e.p && e.p !== 'N/A' && e.p !== 'nan') ? e.p : 'Sin Asignar';
                    const area = (e.d && e.d !== 'N/A' && e.d !== 'nan' && e.d !== 'SIN DEPTO') ? e.d : ' ';
                    const flag = getStyle(e.pa).flag;
                    return `
                        <tr style="color:#000;">
                    <td style="font-weight:700; color:#64748b; white-space:nowrap;">${e.c || 'N/A'}</td>
                    <td><div style="font-weight:700; color:#0f172a;">${e.n}</div></td>
                    <td style="font-weight:600;">${puesto}</td>
                    <td style="font-weight:500; color:#64748b;">${area}</td>
                    <td style="white-space:nowrap; color:#0f172a; font-weight:600;">${e.fi || ' '}</td>
                    <td style="font-weight:800; color:var(--ac);">${flag} ${paisMap[e.pa] || e.pa}</td>
                    <td style="color:#64748b;">${e.e}</td>
                </tr> `;
                }).join('');
            }

            var currentRegistryTab = 'altas';
            function switchRegistry(el, tab) {
                currentRegistryTab = tab;
                if (el && el.parentNode) {
                    el.parentNode.querySelectorAll('.toggle-tab').forEach(t => t.classList.remove('active'));
                    el.classList.add('active');
                }
                const titleEl = document.getElementById('registryTitle');
                if (titleEl) titleEl.innerText = tab === 'altas' ? 'Personal en el Periodo' : 'Registro de Salidas';

                renderAll();
            }

            function renderPlantilla(uniqueEmps, empsRaw) {
                const y = document.getElementById('yearSel').value;
                const m = document.getElementById('monthSel').value;
                const hiresSet = new Set();
                uniqueEmps.forEach(item => {
                    if (!item.fi) return;
                    const fparts = item.fi.split('/');
                    if (fparts.length < 3) return;
                    const fy = parseInt(fparts[2]);
                    const fm = parseInt(fparts[1]);
                    if ((y === 'ALL' || fy == parseInt(y)) && (m === 'ALL' || fm == parseInt(m))) {
                        hiresSet.add(item.c || item.n);
                    }
                });

                // For Tenure (Active only)
                const allBajas = app.bajas_list || [];
                const targetYear = y === 'ALL' ? 9999 : parseInt(y);
                const targetMonth = m === 'ALL' ? 12 : parseInt(m);
                const tenures = uniqueEmps.filter(e => {
                    const code = e.c || e.n;
                    const isBaja = allBajas.some(b => (b.c === code || b.n === code) && (b.y < targetYear || (b.y == targetYear && b.m <= targetMonth)));
                    return !isBaja;
                }).map(e => ({ ...e, tenure: calcTenure(e.fi) }));

                // Render Classic sections now included in Plantilla
                renderExecutiveCharts(tenures, y, m, hiresSet, uniqueEmps, empsRaw);

                const paisSel = document.getElementById('paisSel').value;
                const empSel = document.getElementById('empresaSel').value;
                const areaSel = document.getElementById('areaSel').value;
                const deptoSel = document.getElementById('deptoSel').value;
                const yrSel = document.getElementById('yearSel').value;
                const moSel = document.getElementById('monthSel').value;

                // Get filtered bajas for the same period
                const filteredBajas = allBajas.filter(b => {
                    const matchPais = paisSel === 'ALL' || b.pa === paisSel;
                    const matchEmp = empSel === 'ALL' || b.e === empSel;
                    const matcharea = areaSel === 'ALL' || b.dir === areaSel;
                    const matchDepto = deptoSel === 'ALL' || b.d === deptoSel;
                    let matchDate = true;
                    if (yrSel !== 'ALL' || moSel !== 'ALL') {
                        try {
                            const parts = b.f.split('/');
                            if (parts.length >= 3) {
                                const by = parseInt(parts[2]); const bm = parseInt(parts[1]);
                                if (yrSel !== 'ALL' && by != parseInt(yrSel)) matchDate = false;
                                if (moSel !== 'ALL' && bm != parseInt(moSel)) matchDate = false;
                            }
                        } catch (ex) { }
                    }
                    return matchPais && matchEmp && matcharea && matchDepto && matchDate;
                });

                const totalHC = uniqueEmps.length;
                const totalBajas = filteredBajas.length;
                const totalHires = hiresSet.size;
                const rotationRate = totalHC > 0 ? ((totalBajas / totalHC) * 100).toFixed(1) : 0;
                const retentionRate = (100 - rotationRate).toFixed(1);
                const activeCountriesCount = new Set(uniqueEmps.map(e => e.pa)).size;

                document.getElementById('kpi1').innerHTML = `
                ${kpiCard("HEADCOUNT HC", totalHC.toLocaleString(), " ", "#8b5cf6", "Actual en periodo", "up", "", null, "", "", null, "15px")}
                ${kpiCard("Movimientos: Altas vs Bajas", `${totalHires} / ${totalBajas}`, " ", "#10b981", "Altas: " + totalHires + " / Bajas: " + totalBajas, "up", "", null, "", "", null, "13px")}
                ${kpiCard("Bajas Totales", totalBajas.toLocaleString(), " ", "#ef4444", "Salidas del periodo", "down", "", null, "", "", null, "13px")}
                ${kpiCard("Retención & Rotación", `${retentionRate}% / ${rotationRate}%`, "  ", "#f59e0b", "Índice vs Bajas", "up", "", null, "", "", null, "13px")}
                ${kpiCard("Países Activos", activeCountriesCount, " ", "#6366f1", "Alcance Regional", "up", "", null, "", "", null, "13px")}
                    `;

                const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

                // Chart 1: HC por Direccion (Horizontal Bar)
                const countDir = {};
                uniqueEmps.forEach(e => {
                    const k = e.dir && e.dir !== '0' && e.dir !== 'OTRO' && e.dir !== 'nan' ? e.dir : 'Direccion NO ASIGNADA';
                    countDir[k] = (countDir[k] || 0) + 1;
                });
                const dirData = Object.entries(countDir).sort((a, b) => b[1] - a[1]);
                const ctx1 = document.getElementById('chartPlDir').getContext('2d');
                window.activeCharts.push(new Chart(ctx1, {
                    type: 'bar', data: {
                        labels: dirData.map(d => d[0]),
                        datasets: [{ data: dirData.map(d => d[1]), backgroundColor: chartColors.slice(0, dirData.length), borderRadius: 6 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 10, weight: 700 } } } }
                    }
                }));

                // Chart 2: HC por Departamento (Horizontal Bar - ALL)
                const countDepto = {};
                uniqueEmps.forEach(e => {
                    const k = e.d && e.d !== 'SIN DEPTO' && e.d !== 'N/A' && e.d !== 'PENDIENTE' ? e.d : 'OPERACIONES';
                    countDepto[k] = (countDepto[k] || 0) + 1;
                });
                const deptoData = Object.entries(countDepto).sort((a, b) => b[1] - a[1]);
                const ctx2 = document.getElementById('chartPlDepto').getContext('2d');
                window.activeCharts.push(new Chart(ctx2, {
                    type: 'bar', data: {
                        labels: deptoData.map(d => d[0]),
                        datasets: [{ data: deptoData.map(d => d[1]), backgroundColor: '#8b5cf6', borderRadius: 6 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Montserrat', size: 10, weight: 700 } } },
                            y: {
                                grid: { display: false },
                                ticks: {
                                    autoSkip: false,
                                    font: { family: 'Montserrat', size: 9, weight: 600 }
                                }
                            }
                        }
                    }
                }));

                // Chart 3: Antigüedad (Donut)
                const ten = { '< 1 a ': 0, '1-3 a ': 0, '3-5 a ': 0, '5-10 a ': 0, '10+ a ': 0 };
                uniqueEmps.forEach(e => {
                    const t = calcTenure(e.fi);
                    if (t < 1) ten['< 1 a ']++; else if (t < 3) ten['1-3 a ']++; else if (t < 5) ten['3-5 a ']++; else if (t < 10) ten['5-10 a ']++; else ten['10+ a ']++;
                });
                const ctx3 = document.getElementById('chartPlTenure').getContext('2d');
                window.activeCharts.push(new Chart(ctx3, {
                    type: 'doughnut', data: {
                        labels: Object.keys(ten), datasets: [{ data: Object.values(ten), backgroundColor: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'], borderWidth: 0, cutout: '60%' }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Montserrat', size: 10 } } } } }
                }));

                // Chart 4: Tasa de Rotación Mensual (area)
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const hcByMonth = Array(12).fill(0);
                const bajasByMonth = Array(12).fill(0);
                uniqueEmps.forEach(e => { const nm = normalizeMonth(e.m); if (nm >= 1 && nm <= 12) hcByMonth[nm - 1]++; });
                filteredBajas.forEach(b => {
                    try {
                        const parts = b.f.split('/');
                        if (parts.length >= 2) { const m = parseInt(parts[1]); if (m >= 1 && m <= 12) bajasByMonth[m - 1]++; }
                    } catch (ex) { }
                });
                const rotByMonth = hcByMonth.map((h, i) => h > 0 ? ((bajasByMonth[i] / h) * 100).toFixed(1) : 0);
                const ctx4 = document.getElementById('chartPlRotation').getContext('2d');
                window.activeCharts.push(new Chart(ctx4, {
                    type: 'line', data: {
                        labels: monthNames,
                        datasets: [{ label: 'Rotación %', data: rotByMonth, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, pointRadius: 4 }]
                    }, options: {
                        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                    }
                }));

                // Chart 5: Top Puestos (Horizontal Bar)
                const countPuesto = {};
                uniqueEmps.forEach(e => { const k = e.p || 'N/A'; countPuesto[k] = (countPuesto[k] || 0) + 1; });
                const puestoData = Object.entries(countPuesto).sort((a, b) => b[1] - a[1]).slice(0, 8);
                const ctx5 = document.getElementById('chartPlPuestos').getContext('2d');
                window.activeCharts.push(new Chart(ctx5, {
                    type: 'bar', data: {
                        labels: puestoData.map(d => d[0].substring(0, 20)),
                        datasets: [{ data: puestoData.map(d => d[1]), backgroundColor: '#14b8a6', borderRadius: 4 }]
                    }, options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                        scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false }, ticks: { font: { family: 'Montserrat', size: 9 } } } }
                    }
                }));

                // NEW CHARTS: Gender, Age, Tenure by Dept
                // 1. Gender Pie Chart
                const genderCounts = { 'Masculino': 0, 'Femenino': 0, 'Otro': 0 };
                uniqueEmps.forEach(e => {
                    const g = (e.g || '').toLowerCase();
                    if (g.startsWith('m')) genderCounts['Masculino']++;
                    else if (g.startsWith('f')) genderCounts['Femenino']++;
                    else genderCounts['Otro']++;
                });
                const ctxG = document.getElementById('chartPlGender').getContext('2d');
                window.activeCharts.push(new Chart(ctxG, {
                    type: 'doughnut', data: {
                        labels: ['Masculino', 'Femenino'],
                        datasets: [{ data: [genderCounts['Masculino'], genderCounts['Femenino']], backgroundColor: ['#8b5cf6', '#ec4899'], borderWidth: 0, cutout: '65%' }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
                }));

                // 2. Age Range Chart
                const ageRanges = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
                uniqueEmps.forEach(e => {
                    const age = parseInt(e.age);
                    if (!age) return;
                    if (age <= 25) ageRanges['18-25']++;
                    else if (age <= 35) ageRanges['26-35']++;
                    else if (age <= 45) ageRanges['36-45']++;
                    else if (age <= 55) ageRanges['46-55']++;
                    else ageRanges['56+']++;
                });
                const ctxAge = document.getElementById('chartPlAge').getContext('2d');
                window.activeCharts.push(new Chart(ctxAge, {
                    type: 'bar', data: {
                        labels: Object.keys(ageRanges),
                        datasets: [{ label: 'Colaboradores', data: Object.values(ageRanges), backgroundColor: '#a78bfa', borderRadius: 6 }]
                    }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));

                // 3. Avg Tenure per Dept
                const deptTenureSum = {}; const deptTenureCount = {};
                uniqueEmps.forEach(e => {
                    const d = e.d && e.d !== 'SIN DEPTO' ? e.d : 'OPERACIONES';
                    const t = calcTenure(e.fi);
                    deptTenureSum[d] = (deptTenureSum[d] || 0) + t;
                    deptTenureCount[d] = (deptTenureCount[d] || 0) + 1;
                });
                const avgTenureDept = Object.keys(deptTenureSum).map(d => ({ name: d, val: (deptTenureSum[d] / deptTenureCount[d]).toFixed(1) })).sort((a, b) => b.val - a.val).slice(0, 10);
                const ctxTD = document.getElementById('chartPlTenureDept').getContext('2d');
                window.activeCharts.push(new Chart(ctxTD, {
                    type: 'bar', data: {
                        labels: avgTenureDept.map(a => a.name),
                        datasets: [{ label: 'A  Promedio', data: avgTenureDept.map(a => a.val), backgroundColor: '#7c3aed', borderRadius: 4 }]
                    }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                }));
            }

            function calcAvgTenure(emps) {
                let sum = 0, count = 0;
                emps.forEach(e => { const t = calcTenure(e.fi); if (t > 0) { sum += t; count++; } });
                return count > 0 ? (sum / count).toFixed(1) : '0';
            }

            function toggleABView() { renderAll(); }
            function toggleYTDView() { renderAll(); }



function openOrgChart() {
            const inner = document.getElementById('orgInner');
            if (!inner) return;
            if (inner.children.length > 0) return; // Already init
            initOrg();
        }

        function orgNodeSizes(depth) {
            if (depth === 0) return { w: 150, fs: 13, fsr: 9, fss: 9, p: '10px 12px' }
            if (depth === 1) return { w: 130, fs: 11, fsr: 8, fss: 8, p: '8px 10px' }
            if (depth === 2) return { w: 116, fs: 10, fsr: 7.5, fss: 7.5, p: '7px 9px' }
            return { w: 104, fs: 9, fsr: 7, fss: 7, p: '5px 8px' }
        }

        function orgHBar(row) {
            const ws = row.querySelectorAll(':scope>.nw');
            if (ws.length < 2) return;
            const rr = row.getBoundingClientRect();
            const f = ws[0].getBoundingClientRect();
            const l = ws[ws.length - 1].getBoundingClientRect();
            row.style.setProperty('--hl', (f.left - rr.left + f.width / 2) + 'px');
            row.style.setProperty('--hr', (rr.width - (l.left - rr.left + l.width / 2)) + 'px');
            row.classList.add('hb');
        }

        function orgGType(nd) {
            if (nd.id === 'root') return 'root';
            if (nd.id === 'laura') return 'laura';
            const m = { area: 'area', dept: 'dept', 'lvl-dir': 'dir', 'lvl-ger': 'ger', 'lvl-jef': 'jef', 'lvl-coord': 'coord', 'lvl-sup': 'sup', 'lvl-sr': 'sr', 'lvl-base': 'base' };
            return m[nd.lclass] || 'base';
        }

        function mkOrgNode(nd, depth, areaColor) {
            const hasK = nd.children && nd.children.length > 0;
            const tp = orgGType(nd);
            const isVac = (nd.label || '').toLowerCase().includes('vacante');
            const sz = orgNodeSizes(depth);
            const gap = depth <= 1 ? 10 : 6;

            const wrap = document.createElement('div');
            wrap.className = 'nw'; wrap.dataset.d = depth;
            wrap.style.padding = `0 ${gap}px`;

            if (depth > 0) {
                const vu = document.createElement('div');
                vu.className = 'vl'; vu.style.height = depth <= 1 ? '16px' : '12px';
                wrap.appendChild(vu);
            }

            const box = document.createElement('div');
            box.className = `nd t-${tp}${isVac ? ' t-vac' : ''}`;
            box.style.width = sz.w + 'px';
            box.style.padding = sz.p;

            if (tp === 'area' && areaColor) {
                box.style.background = areaColor;
                box.style.borderColor = areaColor;
                box.style.borderWidth = '2px';
            }

            const role = document.createElement('div'); role.className = 'nr';
            role.style.fontSize = sz.fsr + 'px';
            const name = document.createElement('div'); name.className = 'nn';
            name.style.fontSize = sz.fs + 'px';
            const sub = document.createElement('div'); sub.className = 'ns';
            sub.style.fontSize = sz.fss + 'px';

            if (tp === 'root' || tp === 'laura') {
                role.textContent = 'Director Ejecutivo';
                name.style.fontWeight = '900';
                name.style.color = 'white';
                name.textContent = nd.label;
                box.appendChild(role); box.appendChild(name);
            } else if (tp === 'area') {
                name.style.color = 'white'; name.style.fontWeight = '800';
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(name); box.appendChild(sub);
            } else if (tp === 'dept') {
                role.textContent = 'Depto';
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(role); box.appendChild(name); box.appendChild(sub);
            } else {
                role.textContent = nd.nivel || tp;
                name.textContent = nd.label;
                sub.textContent = nd.sublabel;
                box.appendChild(role); box.appendChild(name); box.appendChild(sub);
            }

            if (hasK) {
                const cnt = document.createElement('div'); cnt.className = 'nc';
                cnt.style.cssText = `font-size:${Math.max(7, sz.fsr - 1)}px;min-width:${sz.fsr + 8}px;height:${sz.fsr + 8}px;`;
                if (tp === 'area') cnt.style.background = 'rgba(255,255,255,.25)';
                cnt.textContent = nd.children.length;
                box.appendChild(cnt);
                const tog = document.createElement('div'); tog.className = 'nt';
                tog.style.cssText = `width:${sz.fsr + 8}px;height:${sz.fsr + 8}px;font-size:${sz.fsr - 1}px;bottom: -${(sz.fsr + 8) / 2 + 2}px;`;
                tog.textContent = '';
                box.appendChild(tog);
            }

            box.addEventListener('click', e => {
                e.stopPropagation();
                if (!hasK) return;
                const kc = wrap.querySelector(':scope>.kids');
                const vd = wrap.querySelector(':scope>.vd');
                if (kc.classList.contains('open')) {
                    kc.classList.remove('open'); box.classList.remove('exp');
                    if (vd) vd.style.height = '0';
                    kc.querySelectorAll('.kids.open').forEach(k => k.classList.remove('open'));
                    kc.querySelectorAll('.nd.exp').forEach(n => n.classList.remove('exp'));
                    kc.querySelectorAll('.vd').forEach(v => v.style.height = '0');
                } else {
                    kc.classList.add('open'); box.classList.add('exp');
                    if (vd) vd.style.height = '16px';
                    requestAnimationFrame(() => {
                        kc.querySelectorAll(':scope>.row').forEach(r => orgHBar(r));
                        setTimeout(autoFitOrg, 80);
                    });
                }
            });

            wrap.appendChild(box);

            if (hasK) {
                const vd = document.createElement('div');
                vd.className = 'vl vd'; vd.style.height = '0'; vd.style.transition = 'height .15s';
                wrap.appendChild(vd);
                const kc = document.createElement('div'); kc.className = 'kids';

                if (tp === 'root') {
                    const PER = 5;
                    for (let i = 0; i < nd.children.length; i += PER) {
                        if (i > 0) {
                            const sep = document.createElement('div');
                            sep.className = 'vl'; sep.style.height = '10px';
                            kc.appendChild(sep);
                        }
                        const row = document.createElement('div'); row.className = 'row';
                        nd.children.slice(i, i + PER).forEach((ch, j) => {
                            const col = _orgAC[(i + j) % _orgAC.length];
                            row.appendChild(mkOrgNode(ch, depth + 1, col));
                        });
                        kc.appendChild(row);
                        requestAnimationFrame(() => orgHBar(row));
                    }
                } else {
                    const row = document.createElement('div'); row.className = 'row';
                    nd.children.forEach(ch => row.appendChild(mkOrgNode(ch, depth + 1, areaColor)));
                    kc.appendChild(row);
                    requestAnimationFrame(() => orgHBar(row));
                }
                wrap.appendChild(kc);
            }
            return wrap;
        }

        function autoFitOrg() {
            const canvas = document.getElementById('orgCanvas');
            const tc = document.getElementById('orgInner');
            if (!canvas || !tc) return;
            tc.style.transform = 'scale(1)';
            requestAnimationFrame(() => {
                const cw = canvas.clientWidth - 80;
                const ch = canvas.clientHeight - 80;
                const tw = tc.scrollWidth;
                const th = tc.scrollHeight;
                _orgSc = Math.min(cw / tw, ch / th, 1);
                _orgSc = Math.max(_orgSc, 0.12);
                tc.style.transform = `scale(${_orgSc})`;
                const lbl = document.getElementById('orgZLbl');
                if (lbl) lbl.textContent = Math.round(_orgSc * 100) + '%';
                setTimeout(() => {
                    const scaledW = tc.scrollWidth * _orgSc;
                    if (scaledW < canvas.clientWidth) canvas.scrollLeft = 0;
                    else canvas.scrollLeft = (scaledW - canvas.clientWidth) / 2;
                    canvas.scrollTop = 0;
                }, 50);
            });
        }

        function orgDz(d) {
            _orgSc = Math.min(2, Math.max(.1, _orgSc + d));
            const tc = document.getElementById('orgInner');
            if (tc) tc.style.transform = `scale(${_orgSc})`;
            const lbl = document.getElementById('orgZLbl');
            if (lbl) lbl.textContent = Math.round(_orgSc * 100) + '%';
        }

        function orgCollapseAll() {
            document.querySelectorAll('.kids.open').forEach(k => k.classList.remove('open'));
            document.querySelectorAll('.nd.exp').forEach(n => n.classList.remove('exp'));
            document.querySelectorAll('.vd').forEach(v => v.style.height = '0');
            setTimeout(autoFitOrg, 50);
        }

        function orgExpandTo(max) {
            orgCollapseAll();
            document.querySelectorAll('.nw').forEach(w => {
                if (parseInt(w.dataset.d || 0) < max) {
                    const kc = w.querySelector(':scope>.kids');
                    const vd = w.querySelector(':scope>.vd');
                    const bx = w.querySelector(':scope>.nd');
                    if (kc) { kc.classList.add('open'); if (vd) vd.style.height = '16px'; if (bx) bx.classList.add('exp'); }
                }
            });
            requestAnimationFrame(() => {
                document.querySelectorAll('.row').forEach(r => orgHBar(r));
                setTimeout(autoFitOrg, 100);
            });
        }

        function initOrg() {
            const tc = document.getElementById('orgInner');
            if (!tc) return;
            tc.innerHTML = '';
            const data = window._orgTreeData || {};
            if (!data.oliver) {
                 tc.innerHTML = '<div style="padding:40px; color:#64748b; font-weight:700;">Cargando estructura organizacional...</div>';
                 return;
            }
            const rrow = document.createElement('div');
            rrow.style.cssText = 'display:flex;align-items:flex-start;justify-content:center;gap:0';

            const ow = mkOrgNode(data.oliver, 0, null);
            const lw = mkOrgNode(data.laura, 0, null);

            const conn = document.createElement('div');
            conn.style.cssText = 'display:flex;align-items:center;padding:28px 6px 0;flex-shrink:0';
            conn.innerHTML = `<div style="width:18px;height:2px;background:var(--org-conn)"></div>
                <div style="font-family:\'DM Mono\',monospace;font-size:7.5px;color:var(--org-muted);background:var(--org-surf2);border:1px solid var(--org-border);border-radius:4px;padding:2px 7px;white-space:nowrap;letter-spacing:.5px">mismo nivel</div>
                <div style="width:18px;height:2px;background:var(--org-conn)"></div>`;

            rrow.appendChild(ow); rrow.appendChild(conn); rrow.appendChild(lw);
            tc.appendChild(rrow);
            requestAnimationFrame(() => setTimeout(autoFitOrg, 150));
        }

        window.addEventListener('resize', () => {
            const pane1 = document.getElementById('pane1');
            if (pane1 && pane1.classList.contains('on')) {
                setTimeout(autoFitOrg, 100);
            }
        });

        // --- HC DINÁMICO ---
        window._dynChart = null;
        function updateDynOptions() {
            const dim = document.getElementById('dynDimension').value;
            const empsSource = (window.app && window.app.employees) ? window.app.employees : (window.hcFullData || []);
            const emps = Array.isArray(empsSource) ? empsSource : (empsSource.employees || []);
            let options = [];
            if (dim === 'pa') options = [...new Set(emps.map(e => normalizePa(e.pa)))].filter(x => x).sort();
            else if (dim === 'e') options = [...new Set(emps.map(e => (e.e || '').trim()))].filter(x => x).sort();
            else if (dim === 'dir') options = [...new Set(emps.map(e => (e.dir || '').trim()))].filter(x => x).sort();
            else if (dim === 'd') options = [...new Set(emps.map(e => (e.d || '').trim()))].filter(x => x).sort();
            document.getElementById('dynCheckList').innerHTML = options.map(opt => `<label style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:11px; font-weight:700;"><input type="checkbox" class="dyn-opt-check" value="${opt}" checked> ${opt}</label>`).join('');
        }

        function createDynChart() {
            const dim = document.getElementById('dynDimension').value;
            const selected = Array.from(document.querySelectorAll('.dyn-opt-check:checked')).map(c => c.value);
            if (!selected.length) return Swal.fire('Error', 'Seleccione al menos una opción', 'warning');
            const empsSource = (window.app && window.app.employees) ? window.app.employees : (window.hcFullData || []);
            const emps = Array.isArray(empsSource) ? empsSource : (empsSource.employees || []);
            const f = typeof getFilters === 'function' ? getFilters() : { y: 'ALL', m: 'ALL' };
            const filtered = emps.filter(e => (f.y === 'ALL' || e.y == f.y) && (f.m === 'ALL' || e.m == f.m));
            const counts = {}; selected.forEach(s => counts[s] = 0);
            filtered.forEach(e => { let v = ''; if (dim === 'pa') v = normalizePa(e.pa); else if (dim === 'e') v = (e.e || ''); else if (dim === 'dir') v = (e.dir || ''); else if (dim === 'd') v = (e.d || ''); if (counts.hasOwnProperty(v)) counts[v]++; });

            document.getElementById('dynEmptyState').style.display = 'none';
            document.getElementById('dynChartCanvas').style.display = 'block';
            document.getElementById('dynInfoOverlay').style.display = 'block';
            document.getElementById('dynTotalCount').innerText = Object.values(counts).reduce((a, b) => a + b, 0).toLocaleString();

            const ctx = document.getElementById('dynChartCanvas').getContext('2d');
            if (window._dynChart) window._dynChart.destroy();
            window._dynChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: 'HC',
                        data: Object.values(counts),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        function clearDynHC() {
            document.querySelectorAll('.dyn-opt-check').forEach(c => c.checked = false);
            if (window._dynChart) window._dynChart.destroy();
            document.getElementById('dynEmptyState').style.display = 'block';
            document.getElementById('dynChartCanvas').style.display = 'none';
            document.getElementById('dynInfoOverlay').style.display = 'none';
        }


        // --- REPARAR PENDIENTES: Intelligent Auto-Fix ---
        function repararPendientes() {
            if (!app || !app.employees) { alert('No hay datos cargados.'); return; }
            
            const NOISE = /\b(SR|JR|SENIOR|JUNIOR|REGIONAL|DE|LA|EL|LOS|LAS|EN|Y|AND|ASG|ASEGURO|BILINGUE|BILINGUE)\b/gi;
            const overrides = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
            const changes = [];
            
            // Collect all positions that are still PENDIENTE, OTRO, or unmapped
            const isBad = v => !v || v === 'PENDIENTE' || v === 'OTRO' || v === '0' || v === 'nan' || v === 'SIN DEPTO' || v === 'N/A';
            
            const allRecords = [
                ...(app.employees || []),
                ...(app.bajas_list || []),
                ...(app.incidencias || [])
            ];
            
            // Build a "known good" map from already-mapped records
            const knownMap = new Map();
            allRecords.forEach(emp => {
                if (!isBad(emp.dir) && !isBad(emp.d)) {
                    const pNorm = (emp.p || emp.position || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                    if (pNorm && !knownMap.has(pNorm)) {
                        knownMap.set(pNorm, { dir: emp.dir, d: emp.d });
                    }
                    // Also store stripped version
                    const stripped = pNorm.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                    if (stripped && !knownMap.has(stripped)) {
                        knownMap.set(stripped, { dir: emp.dir, d: emp.d });
                    }
                }
            });
            
            // Also add POSITION_MAP entries
            if (typeof POSITION_MAP !== 'undefined') {
                Object.entries(POSITION_MAP).forEach(([key, val]) => {
                    if (!knownMap.has(key)) knownMap.set(key, val);
                    const stripped = key.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                    if (stripped && !knownMap.has(stripped)) knownMap.set(stripped, val);
                });
            }
            
            // Now scan for pending positions
            allRecords.forEach(emp => {
                if (!isBad(emp.dir) && !isBad(emp.d)) return; // Already good
                
                const pRaw = (emp.p || emp.position || '').trim();
                if (!pRaw || pRaw === 'PENDIENTE') return;
                
                const pNorm = pRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                const stripped = pNorm.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                const paRaw = (emp.pa || '').trim();
                const eRaw = (emp.e || '').trim();
                const exactKey = `${pNorm}|${normalizePa(paRaw)}|${eRaw.toUpperCase()}`;
                
                let newDir = null;
                let newDepto = null;
                let method = '';
                
                // Strategy 1: Exact match in knownMap
                const exact = knownMap.get(pNorm);
                if (exact) {
                    newDir = exact.dir; newDepto = exact.d; method = 'Exacto';
                }
                
                // Strategy 2: Stripped match
                if (!newDir && stripped !== pNorm) {
                    const hit = knownMap.get(stripped);
                    if (hit) {
                        newDir = hit.dir; newDepto = hit.d; method = 'Similar';
                    }
                }
                
                // Strategy 3: Word-overlap scoring
                if (!newDir) {
                    const words = stripped.split(' ').filter(w => w.length > 2);
                    if (words.length >= 1) {
                        let bestScore = 0;
                        let bestMatch = null;
                        for (const [key, val] of knownMap.entries()) {
                            const keyWords = key.split(' ').filter(w => w.length > 2);
                            let score = 0;
                            for (const w of words) { if (keyWords.includes(w)) score++; }
                            const ratio = score / Math.max(words.length, keyWords.length);
                            if (ratio > 0.3 && score > bestScore) {
                                bestScore = score;
                                bestMatch = { dir: val.dir, d: val.d, from: key };
                            }
                        }
                        if (bestMatch) {
                            newDir = bestMatch.dir; newDepto = bestMatch.d; method = 'Fuzzy (' + bestMatch.from + ')';
                        }
                    }
                }
                
                // Strategy 4: getAutoMapping keyword fallback
                if (!newDir && typeof getAutoMapping === 'function') {
                    const auto = getAutoMapping(pRaw);
                    if (auto) {
                        newDir = auto.dir; newDepto = auto.d; method = 'Palabras Clave';
                    }
                }
                
                // Apply if we found something
                if (newDir && newDepto) {
                    const oldDir = emp.dir || 'PENDIENTE';
                    const oldD = emp.d || 'PENDIENTE';
                    
                    // Only record if it actually changed
                    if (oldDir !== newDir || oldD !== newDepto) {
                        changes.push({
                            puesto: pRaw,
                            pais: paisMap[normalizePa(paRaw)] || paRaw,
                            empresa: eRaw,
                            oldDir, oldD,
                            newDir, newDepto,
                            method
                        });
                        
                        emp.dir = newDir;
                        emp.d = newDepto;
                        
                        // Save as permanent override
                        overrides[exactKey] = { dir: newDir, depto: newDepto };
                    }
                }
            });
            
            // Save all overrides
            localStorage.setItem('asys_pos_overrides', JSON.stringify(overrides));
            
            // Re-render
            cachedEmps = null;
            lastFilterKey = "";
            requestRenderAll();
            
            // Show results modal
            showRepairLog(changes);
        }
        
        function showRepairLog(changes) {
            // Remove old modal if exists
            const old = document.getElementById('repairLogModal');
            if (old) old.remove();
            
            const modal = document.createElement('div');
            modal.id = 'repairLogModal';
            modal.style.cssText = `
                position:fixed; top:0; left:0; width:100vw; height:100vh;
                background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
                z-index:99999; display:flex; align-items:center; justify-content:center;
                animation: fadeIn 0.3s ease;
            `;
            
            const count = changes.length;
            let tableRows = '';
            if (count > 0) {
                tableRows = changes.map((c, i) => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05); ${i % 2 === 0 ? 'background:rgba(255,255,255,0.02)' : ''}">
                        <td style="padding:10px 12px; font-weight:700; color:#e2e8f0; font-size:11px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.puesto}">${c.puesto}</td>
                        <td style="padding:10px 8px; color:#ef4444; font-size:10px; font-weight:600;">${c.oldDir}</td>
                        <td style="padding:10px 8px; color:#10b981; font-size:10px; font-weight:800;">${c.newDir}</td>
                        <td style="padding:10px 8px; color:#10b981; font-size:10px; font-weight:800;">${c.newDepto}</td>
                        <td style="padding:10px 8px; color:#94a3b8; font-size:9px; font-style:italic;">${c.method}</td>
                    </tr>
                `).join('');
            }
            
            modal.innerHTML = `
                <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:24px; width:90%; max-width:900px; max-height:85vh; overflow:hidden; display:flex; flex-direction:column; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
                    <div style="padding:25px 30px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#fff; font-size:18px; font-weight:900; margin:0;">  Reparaci  de Pendientes</h2>
                            <p style="color:#94a3b8; font-size:12px; margin:5px 0 0 0;">${count > 0 ? `Se repararon <span style="color:#10b981; font-weight:900;">${count}</span> puestos autom ` : 'No se encontraron puestos pendientes por reparar  '}</p>
                        </div>
                        <button onclick="document.getElementById('repairLogModal').remove()" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center;"> </button>
                    </div>
                    ${count > 0 ? `
                    <div style="overflow-y:auto; flex:1; padding:0;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="position:sticky; top:0; background:#1e293b; z-index:5;">
                                <tr>
                                    <th style="padding:12px; text-align:left; color:#94a3b8; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">PUESTO</th>
                                    <th style="padding:12px; text-align:left; color:#ef4444; font-size:10px; font-weight:800; text-transform:uppercase;">ANTES</th>
                                    <th style="padding:12px; text-align:left; color:#10b981; font-size:10px; font-weight:800; text-transform:uppercase;">Direccion</th>
                                    <th style="padding:12px; text-align:left; color:#10b981; font-size:10px; font-weight:800; text-transform:uppercase;">DEPTO</th>
                                    <th style="padding:12px; text-align:left; color:#94a3b8; font-size:10px; font-weight:800; text-transform:uppercase;">M </th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                    ` : '<div style="padding:60px; text-align:center;"><span style="font-size:48px;"> </span><p style="color:#94a3b8; font-size:14px; margin-top:15px;">Todos los puestos ya están clasificados correctamente.</p></div>'}
                    <div style="padding:15px 30px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:#64748b; font-size:10px;">Los cambios se guardaron en localStorage automaspan>
                        <button onclick="document.getElementById('repairLogModal').remove()" style="background:var(--ac); color:#fff; border:none; padding:10px 24px; border-radius:12px; font-weight:800; font-size:12px; cursor:pointer;">CERRAR</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        // (clearFilters now defined once globally above   this duplicate removed)

        // Global event listeners for idle tracking
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => window.addEventListener(evt, () => {
            const dashboard = document.getElementById('mainDashboard');
            if (dashboard && dashboard.style.display === 'block') {
                if (typeof resetIdleTimer === 'function') resetIdleTimer();
            }
        }));

        // --- POINT 8: DYNAMIC HC GENERADORR ---
        window.renderDynamicHC = function() {
            const dim = document.getElementById('selDynamicDim').value;
            const canvas = document.getElementById('chartDynamicHC');
            if (!canvas) return;

            const f = getFilters();
            const emps = window.lastActiveHC || []; // Use currently active HC from renderGeneral
            const counts = {};
            
            emps.forEach(e => {
                let key = e[dim] || 'Sin Dato';
                if (dim === 'dir' && !e.dir) key = e.area || 'Sin area';
                counts[key] = (counts[key] || 0) + 1;
            });

            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
            const labels = sorted.map(d => d[0]);
            const data = sorted.map(d => d[1]);

            if (window._dynamicChartHC) window._dynamicChartHC.destroy();

            window._dynamicChartHC = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Colaboradores (HC Real)',
                        data: data,
                        backgroundColor: labels.map((_, i) => i%2 === 0 ? '#8b5cf6' : '#8b5cf6'),
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true } }
                }
            });
        };

        // --- POINT 15b: MONTHLY SNAPSHOT DRILL-DOWN ---
        // --- POINT 15b: HEATMAP DETAIL DRILL-DOWN (Modernized) ---
        window.renderHeatmapDetail = function(y, m) {
            const row = document.getElementById('calendarDetailRow');
            if (!row) return;
            
            const mname = (window.monthNames && window.monthNames[m]) || 'Mes';
            row.style.display = 'block';
            row.innerHTML = `
                <div style="background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); border:1px solid rgba(226,232,240,0.8); border-radius:24px; padding:30px; box-shadow:0 15px 35px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; border-bottom:1px solid #f1f5f9; padding-bottom:15px;">
                        <div>
                            <h3 style="font-size:18px; font-weight:1000; color:#1e293b; margin:0;">   Detalle Mensual: <span style="color:var(--ac);">${mname} ${y}</span></h3>
                            <p style="font-size:11px; color:#64748b; font-weight:700; margin-top:4px;">Análisis profundo de bajas y movimientos</p>
                        </div>
                        <button onclick="document.getElementById('calendarDetailRow').style.display='none'" style="background:#f1f5f9; border:none; color:#64748b; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseenter="this.style.background='#e2e8f0'" onmouseleave="this.style.background='#f1f5f9'"> </button>
                    </div>
                    <div id="heatmapChartsGrid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapPa"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapEmp"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snaparea"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapDepto"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapAnt"></canvas></div>
                        <div class="card-box" style="height:280px; background:#fff; box-shadow:none; border:1px solid #f1f5f9; padding:15px;"><canvas id="snapMotivo"></canvas></div>
                    </div>
                </div>
            `;

            setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

            const allBajas = (window.allBajas || app.bajas_list || []);
            const { countries: cFilter, e: empFilter } = getFilters();
            const monthlyBajas = allBajas.filter(b => b.y == y && b.m == m && (cFilter.length === 0 || cFilter.includes(normalizePa(b.pa))) && (empFilter === 'ALL' || b.e === empFilter));

            const makeChart = (id, dataObj, title, type = 'doughnut', colorSource = 'auto') => {
                const ctx = document.getElementById(id);
                if (!ctx) return;
                const entries = Object.entries(dataObj).sort((a,b)=>b[1]-a[1]).slice(0, 8);
                if (entries.length === 0) {
                    ctx.parentElement.innerHTML = `<div style="height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:11px; font-weight:700;">No hay datos para ${title}</div>`;
                    return;
                }

                const total = Object.values(dataObj).reduce((a, b) => a + b, 0);
                const labels = entries.map(e => {
                    const pct = total > 0 ? ((e[1] / total) * 100).toFixed(1) : 0;
                    return `${e[0].substring(0,18)}: ${e[1]} (${pct}%)`;
                });

                const colors = entries.map((e, i) => {
                    if (colorSource === 'pa') {
                        const code = normalizePa(e[0]);
                        return (window.countryStyles && window.countryStyles[code] || {color:'#3b82f6'}).color;
                    }
                    return ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'][i % 8];
                });

                new Chart(ctx.getContext('2d'), {
                    type: type,
                    data: {
                        labels: labels,
                        datasets: [{ 
                            data: entries.map(e => e[1]), 
                            backgroundColor: colors,
                            borderWidth: 0,
                            hoverOffset: 15
                        }]
                    },
                    options: { 
                        responsive:true, 
                        maintainAspectRatio:false, 
                        cutout: type === 'doughnut' ? '65%' : 0,
                        plugins: { 
                            title: { display:true, text:title, font:{size:12, weight:1000}, color: '#334155', padding:{bottom:15} },
                            legend:{ display: type === 'doughnut', position:'bottom', labels:{ boxWidth:8, usePointStyle:true, font:{size:9, weight:700} } } 
                        },
                        scales: type === 'bar' ? { x:{ grid:{display:false} }, y:{ beginAtZero:true } } : {}
                    }
                });
            };

            const pa= {}, em= {}, ar= {}, de= {}, an= {}, mo= {};
            monthlyBajas.forEach(b => {
                const p = b.pa || 'N/A';
                pa[p] = (pa[p]||0)+1;
                const e = b.e || 'N/A';
                em[e] = (em[e]||0)+1;
                const area = b.dir || b.area || 'Sin area';
                ar[area] = (ar[area]||0)+1;
                de[b.d||'Sin Depto'] = (de[b.d||'Sin Depto']||0)+1;
                const t = Number(b.t) || 0;
                const range = t < 1 ? '< 1 a ' : t < 2 ? '1-2 a ' : t < 5 ? '2-5 a ' : '5+ a ';
                an[range] = (an[range]||0)+1;
                const mot = b.mo || 'No especificado';
                mo[mot] = (mo[mot]||0)+1;
            });

            makeChart('snapPa', pa, '  POR Pais', 'doughnut', 'pa');
            makeChart('snapEmp', em, '  POR EMPRESA');
            makeChart('snaparea', ar, '  POR Direccion');
            makeChart('snapDepto', de, '  POR DEPARTAMENTO', 'bar');
            makeChart('snapAnt', an, '  POR Antigüedad');
            makeChart('snapMotivo', mo, '  MOTIVOS DE BAJA', 'bar');
        };

        // ---   ESTRAT  RENDER RETENTION HEALTH (RISK ZONE) ---
function renderRetentionHealth(uniqueEmps, y, m) {
            const ctx = document.getElementById('chartRetentionHealth');
            if (!ctx) return;

            const { countries, e: emp2, a: areaSel, d: deptoSel } = getFilters();
            const period = window._retPeriod || 6;
            
            // Sync active state on buttons
            const btn6 = document.getElementById('rzBtn6');
            const btn12 = document.getElementById('rzBtn12');
            if (btn6 && btn12) {
                if (period === 6) {
                    btn6.classList.add('active');
                    btn12.classList.remove('active');
                } else {
                    btn12.classList.add('active');
                    btn6.classList.remove('active');
                }
            }

            // Build period dates
            let targetY = parseInt(y);
            let targetM = parseInt(m);
            const allBajas = (window.allBajas || app.bajas_list || window.app?.bajas_list || []);

            if (isNaN(targetY)) targetY = 2026; // Default
            
            const isSpecificMonth = !isNaN(targetM);
            if (!isSpecificMonth) {
                const yB = allBajas.filter(b => parseInt(b.y) === targetY);
                targetM = yB.length > 0 ? Math.max(...yB.map(b => parseInt(b.m) || 1)) : 12;
            }

            const endDate = new Date(targetY, targetM, 0); 
            const startDate = new Date(targetY, targetM - period, 1);
            
            // 1. FILTER FOR PERIOD CHARTS (6 or 12 months)
            const periodBajas = allBajas.filter(b => {
                const curPa = b._pa || normalizePa(b.pa);
                const by = parseInt(b._y || b.y);
                const bm = normalizeMonth(b._m || b.m);
                const bajDate = new Date(by, bm - 1, 15);

                const matchP = countries.length === 0 || countries.includes(curPa);
                const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                
                const matchDate = (bajDate >= startDate && bajDate <= endDate);
                return matchP && matchE && matchA && matchD && matchDate;
            });

            // 2. FILTER FOR KPIs (Strictly the selected month/year)
            const kpiBajas = allBajas.filter(b => {
                const curPa = b._pa || normalizePa(b.pa);
                const by = parseInt(b._y || b.y);
                const bm = normalizeMonth(b._m || b.m);

                const matchP = countries.length === 0 || countries.includes(curPa);
                const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                
                const matchY = y === 'ALL' || by == targetY;
                const matchM = m === 'ALL' || bm == targetM;
                
                return matchP && matchE && matchA && matchD && matchY && matchM;
            });

            const deptMap = {};
            let earlyBajas = 0;
            let midBajas = 0;
            let seniorBajas = 0;

            const parseD = (s) => {
                if(!s || typeof s !== 'string') return null;
                let p = [];
                if (s.includes('/')) p = s.split('/');
                else if (s.includes('-')) p = s.split('-');
                if (p.length < 3) return null;
                
                if (p[0].length === 4) {
                    let yr = parseInt(p[0]);
                    let mon = parseInt(p[1]);
                    let day = parseInt(p[2]);
                    return new Date(yr, mon - 1, day);
                } else {
                    let day = parseInt(p[0]);
                    let mon = parseInt(p[1]);
                    let yr = parseInt(p[2]);
                    if (yr < 100) yr += 2000;
                    return new Date(yr, mon - 1, day);
                }
            };

            // Calculate KPIs from kpiBajas
            kpiBajas.forEach(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);

                if (years < 0.5) earlyBajas++;
                else if (years < 1) midBajas++;
                else seniorBajas++;
            });

            // Calculate department totals from periodBajas for the stacked chart
            periodBajas.forEach(b => {
                const dept = b.d || 'Otros';
                if (!deptMap[dept]) deptMap[dept] = { total: 0, early: 0, mid: 0, senior: 0 };
                deptMap[dept].total++;

                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);

                if (years < 0.5) deptMap[dept].early++;
                else if (years < 1) deptMap[dept].mid++;
                else deptMap[dept].senior++;
            });

            const labels = Object.keys(deptMap).sort((a,b) => deptMap[b].early - deptMap[a].early).slice(0, 10);
            const dataEarly = labels.map(l => deptMap[l].early);
            const dataMid = labels.map(l => deptMap[l].mid);
            const dataSenior = labels.map(l => deptMap[l].senior);

            // RENDER DEPARTMENT STACKED CHART
            if (window._retChart) window._retChart.destroy();
            window._retChart = new Chart(ctx, {
                type: 'bar',
                plugins: [ChartDataLabels],
                data: {
                    labels: labels,
                    datasets: [
                        { 
                            label: '< 6 Meses (Crítico)', data: dataEarly, backgroundColor: '#ef4444', 
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        },
                        { 
                            label: '6-12 Meses (Riesgo)', data: dataMid, backgroundColor: '#8b5cf6',
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        },
                        { 
                            label: '> 12 Meses (Natural)', data: dataSenior, backgroundColor: '#3b82f6',
                            datalabels: { display: (context) => context.dataset.data[context.dataIndex] > 0, color: '#fff', font: { weight: 800, size: 10 } } 
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 800 }, color: '#64748b' } } 
                    },
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(139, 92, 246, 0.08)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                        y: { stacked: true, grid: { display: false }, ticks: { font: { size: 10, weight: 800 }, color: '#475569' } }
                    }
                }
            });

            // UPDATE DYNAMIC KPI CARDS (using kpiBajas)
            const totalBajas = kpiBajas.length;
            const earlyPctVal = totalBajas > 0 ? (earlyBajas / totalBajas * 100) : 0;
            const midPctVal = totalBajas > 0 ? (midBajas / totalBajas * 100) : 0;
            const seniorPctVal = totalBajas > 0 ? (seniorBajas / totalBajas * 100) : 0;

            const earlyValEl = document.getElementById('retKpiEarlyCount');
            if (earlyValEl) earlyValEl.innerText = earlyBajas.toLocaleString();
            const earlyPctEl = document.getElementById('retKpiEarlyPct');
            if (earlyPctEl) earlyPctEl.innerText = earlyPctVal.toFixed(1) + '% de total bajas';

            const midValEl = document.getElementById('retKpiMidCount');
            if (midValEl) midValEl.innerText = midBajas.toLocaleString();
            const midPctEl = document.getElementById('retKpiMidPct');
            if (midPctEl) midPctEl.innerText = midPctVal.toFixed(1) + '% de total bajas';

            const seniorValEl = document.getElementById('retKpiSeniorCount');
            if (seniorValEl) seniorValEl.innerText = seniorBajas.toLocaleString();
            const seniorPctEl = document.getElementById('retKpiSeniorPct');
            if (seniorPctEl) seniorPctEl.innerText = seniorPctVal.toFixed(1) + '% de total bajas';

            // TREND COMPARISON (Previous Period for KPIs)
            let prevY = targetY;
            let prevM = targetM;
            if (isSpecificMonth) {
                prevM = targetM - 1;
                if (prevM === 0) {
                    prevM = 12;
                    prevY = targetY - 1;
                }
            } else {
                prevY = targetY - 1;
            }

            const prevKpiBajas = allBajas.filter(b => {
                const curPa = b._pa || normalizePa(b.pa);
                const by = parseInt(b._y || b.y);
                const bm = normalizeMonth(b._m || b.m);
                const matchP = countries.length === 0 || countries.includes(curPa);
                const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                
                const matchY = by == prevY;
                const matchM = isSpecificMonth ? bm == prevM : true;
                return matchP && matchE && matchA && matchD && matchY && matchM;
            });

            let prevEarly = 0, prevMid = 0, prevSenior = 0;
            prevKpiBajas.forEach(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
                if (years < 0.5) prevEarly++;
                else if (years < 1) prevMid++;
                else prevSenior++;
            });

            const formatTrend = (curr, prev, elId) => {
                const el = document.getElementById(elId);
                if (!el) return;
                const diff = curr - prev;
                if (diff > 0) {
                    el.className = 'rz-kpi-trend up';
                    el.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> <span>+${diff} vs per. anterior</span>`;
                } else if (diff < 0) {
                    el.className = 'rz-kpi-trend down';
                    el.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> <span>${diff} vs per. anterior</span>`;
                } else {
                    el.className = 'rz-kpi-trend neutral';
                    el.innerHTML = `<i class="fa-solid fa-arrow-right"></i> <span>Sin cambios</span>`;
                }
            };
            formatTrend(earlyBajas, prevEarly, 'retKpiEarlyTrend');
            formatTrend(midBajas, prevMid, 'retKpiMidTrend');
            formatTrend(seniorBajas, prevSenior, 'retKpiSeniorTrend');

            // GLOBAL RETENTION INDEX & STATUS BADGE (using kpiBajas)
            const globalIndex = totalBajas > 0 ? (earlyBajas / totalBajas) * 100 : 0;
            const idxEl = document.getElementById('retentionGlobalIndex');
            if (idxEl) idxEl.innerText = globalIndex.toFixed(1) + '%';
            
            const badgeEl = document.getElementById('retentionStatusBadge');
            const dotEl = document.getElementById('statusDot');
            const txtEl = document.getElementById('statusText');
            
            if (badgeEl && dotEl && txtEl) {
                if (globalIndex > 35) {
                    badgeEl.style.cssText = 'background:rgba(239, 68, 68, 0.08); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot red';
                    txtEl.innerText = 'CRÍTICO';
                } else if (globalIndex > 20) {
                    badgeEl.style.cssText = 'background:rgba(245, 158, 11, 0.08); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot orange';
                    txtEl.innerText = 'RIESGO ALTO';
                } else {
                    badgeEl.style.cssText = 'background:rgba(16, 185, 129, 0.08); color:#10b981; border:1px solid rgba(16, 185, 129, 0.15); display:flex; align-items:center; padding:4px 10px; border-radius:30px; font-weight:900; font-size:10px; letter-spacing:0.5px;';
                    dotEl.className = 'rz-pulse-dot green';
                    txtEl.innerText = 'ESTABLE';
                }
            }

            // 12-MONTH TREND LINE CHART
            const trendLabels = [];
            const trendData = [];
            const monthNamesAbbr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            for (let i = 11; i >= 0; i--) {
                const d = new Date(targetY, targetM - i - 1, 15);
                const yr = d.getFullYear();
                const mo = d.getMonth() + 1;
                const lbl = monthNamesAbbr[mo - 1] + ' ' + (yr % 100);
                trendLabels.push(lbl);
                
                const mBajas = allBajas.filter(b => {
                    const curPa = b._pa || normalizePa(b.pa);
                    const by = parseInt(b._y || b.y);
                    const bm = normalizeMonth(b._m || b.m);
                    const matchP = countries.length === 0 || countries.includes(curPa);
                    const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                    const matchA = areaSel === 'ALL' || (b.dir || b.area || '').toUpperCase().trim() === (areaSel || '').toUpperCase().trim();
                    const matchD = deptoSel === 'ALL' || (b.d || b.depto || '').toUpperCase().trim() === (deptoSel || '').toUpperCase().trim();
                    return matchP && matchE && matchA && matchD && by === yr && bm === mo;
                }).length;
                trendData.push(mBajas);
            }

            const trendCanvas = document.getElementById('chartRetentionTrend');
            if (trendCanvas) {
                const trendCtx = trendCanvas.getContext('2d');
                const trendGrad = trendCtx.createLinearGradient(0, 0, 0, 180);
                trendGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
                trendGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                
                if (window._retTrendChart) window._retTrendChart.destroy();
                window._retTrendChart = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendLabels,
                        datasets: [{
                            label: 'Bajas',
                            data: trendData,
                            borderColor: '#8b5cf6',
                            backgroundColor: trendGrad,
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointHoverRadius: 6,
                            datalabels: { display: false }
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            datalabels: { display: false }
                        },
                        scales: {
                            x: { grid: { color: 'rgba(139, 92, 246, 0.05)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                            y: { grid: { color: 'rgba(139, 92, 246, 0.05)' }, ticks: { color: '#64748b', font: { size: 9 } }, beginAtZero: true }
                        }
                    }
                });
            }

            // RISK SCORE CALCULATION FOR ACTIVE EMPLOYEES
            const activeRiskScores = [];
            const activeEmps = uniqueEmps || [];
            const salaries = activeEmps.map(e => Number(e.so) || 0).filter(s => s > 0).sort((a,b)=>a-b);
            const q1 = salaries[Math.floor(salaries.length * 0.25)] || 1500;
            const q3 = salaries[Math.floor(salaries.length * 0.85)] || 5000;
            
            const deptBajaCounts = {};
            periodBajas.forEach(b => {
                const d = b.d || 'Otros';
                deptBajaCounts[d] = (deptBajaCounts[d] || 0) + 1;
            });

            activeEmps.forEach(emp => {
                const d1 = parseD(emp.fi);
                let tenureMonths = 12;
                if (d1) {
                    tenureMonths = (endDate - d1) / (1000 * 60 * 60 * 24 * 30.44);
                }
                let tenureScore = 5;
                if (tenureMonths < 6) tenureScore = 40;
                else if (tenureMonths < 12) tenureScore = 25;
                else if (tenureMonths < 24) tenureScore = 15;
                
                let salaryScore = 5;
                const sal = Number(emp.so) || 0;
                if (sal > 0) {
                    if (sal < q1) salaryScore = 20;
                    else if (sal > q3) salaryScore = 15;
                }
                
                const dept = emp.d || 'Otros';
                const churnVal = deptBajaCounts[dept] || 0;
                let churnScore = 0;
                if (churnVal > 10) churnScore = 30;
                else if (churnVal > 5) churnScore = 20;
                else if (churnVal > 2) churnScore = 10;
                
                const score = Math.min(100, tenureScore + salaryScore + churnScore);
                activeRiskScores.push(score);
            });

            const buckets = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
            let sumScore = 0;
            activeRiskScores.forEach(sc => {
                sumScore += sc;
                if (sc <= 20) buckets['0-20']++;
                else if (sc <= 40) buckets['20-40']++;
                else if (sc <= 60) buckets['40-60']++;
                else if (sc <= 80) buckets['60-80']++;
                else buckets['80-100']++;
            });
                                                const avgRiskScore = activeRiskScores.length > 0 ? (sumScore / activeRiskScores.length) : 0;
            const riskCanvas = document.getElementById('chartRetentionRiskDist');
            const riskTotal = activeRiskScores.length || 1;
            const riskPanel = riskCanvas?.closest('.rz-chart-panel');
            const healthPanel = ctx.closest('.rz-chart-panel');
            
            if (riskPanel && healthPanel && riskPanel !== healthPanel.nextElementSibling) {
                healthPanel.insertAdjacentElement('afterend', riskPanel);
                riskPanel.style.marginTop = '0';
                riskPanel.style.marginBottom = '25px';
            }
            
            const riskTitle = riskPanel?.querySelector('.rz-chart-title');
            if (riskTitle) {
                riskTitle.innerHTML = `<span style="display:flex;flex-direction:column;gap:3px;"><span style="display:flex;align-items:center;gap:9px;color:#0f172a;font-size:16px;font-weight:1000;text-transform:uppercase;"><i class="fa-solid fa-circle-nodes" style="color:#8b5cf6;"></i> Distribucion de Riesgo de Salida</span><small style="font-size:11px;color:#64748b;font-weight:1000;text-transform:none;">${retRangeLabel}</small></span><span class="rz-chart-total" style="background:#f5f3ff;color:#7c3aed;border:1px solid rgba(139,92,246,0.18);"><i class="fa-solid fa-users"></i> ${riskTotal.toLocaleString()} evaluados</span>`;
            }
            
            if (riskPanel) {
                riskPanel.style.padding = '18px 22px';
            }

            // Actualizar score promedio central con animación de conteo
            const avgValEl = document.getElementById('retRiskAvgVal');
            if (avgValEl) {
                const targetVal = avgRiskScore;
                const duration = 750;
                const startTime = performance.now();
                
                function animateCount(timestamp) {
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const ease = progress * (2 - progress); // Ease Out
                    const currentVal = ease * targetVal;
                    avgValEl.innerText = currentVal.toFixed(1);
                    if (progress < 1) {
                        requestAnimationFrame(animateCount);
                    } else {
                        avgValEl.innerText = targetVal.toFixed(1);
                    }
                }
                requestAnimationFrame(animateCount);
            }
            
            const avgLabelEl = document.getElementById('retRiskAvgLabel');
            if (avgLabelEl) {
                let scoreLabel = 'Estable';
                let scoreColor = '#10b981';
                let scoreBg = '#ecfdf5';
                let scoreBorder = 'rgba(16,185,129,0.15)';
                if (avgRiskScore > 80) {
                    scoreLabel = 'Crítico';
                    scoreColor = '#ef4444';
                    scoreBg = '#fef2f2';
                    scoreBorder = 'rgba(239,68,68,0.15)';
                } else if (avgRiskScore > 60) {
                    scoreLabel = 'Alto';
                    scoreColor = '#f97316';
                    scoreBg = '#fff7ed';
                    scoreBorder = 'rgba(249,115,22,0.15)';
                } else if (avgRiskScore > 40) {
                    scoreLabel = 'Medio';
                    scoreColor = '#f59e0b';
                    scoreBg = '#fffbeb';
                    scoreBorder = 'rgba(245,158,11,0.15)';
                } else if (avgRiskScore > 20) {
                    scoreLabel = 'Bajo';
                    scoreColor = '#3b82f6';
                    scoreBg = '#eff6ff';
                    scoreBorder = 'rgba(59,130,246,0.15)';
                }
                avgLabelEl.innerText = scoreLabel;
                avgLabelEl.style.color = scoreColor;
                avgLabelEl.style.background = scoreBg;
                avgLabelEl.style.borderColor = scoreBorder;
            }

            // Exponer funciones globales de enlace interactivo con la dona
            window.highlightRiskSlice = function(idx) {
                if (window._retRiskChart) {
                    window._retRiskChart.setActiveElements([{ datasetIndex: 0, index: idx }]);
                    window._retRiskChart.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
                    window._retRiskChart.update();
                }
            };
            window.resetRiskSlice = function() {
                if (window._retRiskChart) {
                    window._retRiskChart.setActiveElements([]);
                    window._retRiskChart.tooltip.setActiveElements([], { x: 0, y: 0 });
                    window._retRiskChart.update();
                }
            };

            // Inyectar barras de progreso a la derecha con animación e interacciones
            const detailsCol = document.getElementById('retRiskDetailsCol');
            if (detailsCol) {
                const labelMap = { '0-20': 'Estable', '20-40': 'Bajo', '40-60': 'Medio', '60-80': 'Alto', '80-100': 'Crítico' };
                const colorMap = { '0-20': '#10b981', '20-40': '#3b82f6', '40-60': '#f59e0b', '60-80': '#f97316', '80-100': '#ef4444' };
                const bgMap = { '0-20': 'rgba(16,185,129,0.06)', '20-40': 'rgba(59,130,246,0.06)', '40-60': 'rgba(245,158,11,0.06)', '60-80': 'rgba(249,115,22,0.06)', '80-100': 'rgba(239,68,68,0.06)' };
                const gradientMap = {
                    '0-20': 'linear-gradient(90deg, #34d399, #10b981)',
                    '20-40': 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                    '40-60': 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    '60-80': 'linear-gradient(90deg, #fb923c, #f97316)',
                    '80-100': 'linear-gradient(90deg, #f87171, #ef4444)'
                };
                
                let idx = 0;
                const barsHtml = Object.entries(buckets).map(([range, count]) => {
                    const pct = (count / riskTotal * 100).toFixed(1);
                    const currentIdx = idx;
                    idx++;
                    return `<div style="display:flex; flex-direction:column; gap:4px; width:100%; padding:6px 10px; border-radius:10px; border-left:3px solid transparent; transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor:pointer;" 
                        onmouseenter="this.style.background='rgba(248,250,252,0.9)'; this.style.transform='translateX(4px)'; this.style.borderLeftColor='${colorMap[range]}'; window.highlightRiskSlice(${currentIdx});" 
                        onmouseleave="this.style.background='transparent'; this.style.transform='none'; this.style.borderLeftColor='transparent'; window.resetRiskSlice();">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:900;">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <i class="fa-solid fa-circle" style="font-size:5px; color:${colorMap[range]};"></i>
                                <b style="color:#0f172a;">${labelMap[range]}</b>
                                <span style="color:#64748b; font-size:9.5px; font-weight:800;">(${range})</span>
                            </span>
                            <span style="color:#0f172a; font-weight:1000;">${count.toLocaleString()} <span style="color:#64748b; font-size:9.5px; font-weight:800; margin-left:3px;">(${pct}%)</span></span>
                        </div>
                        <div style="width:100%; height:6px; background:${bgMap[range]}; border-radius:99px; overflow:hidden; border:1px solid rgba(226,232,240,0.5); position:relative;">
                            <div style="width:${pct}%; height:100%; background:${gradientMap[range]}; border-radius:99px; transition:width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                        </div>
                    </div>`;
                }).join('');
                detailsCol.innerHTML = barsHtml;
            }

            if (riskCanvas) {
                const riskCtx = riskCanvas.getContext('2d');
                if (window._retRiskChart) window._retRiskChart.destroy();
                window._retRiskChart = new Chart(riskCtx, {
                    type: 'doughnut',
                    plugins: [ChartDataLabels],
                    data: {
                        labels: ['Estable', 'Bajo', 'Medio', 'Alto', 'Crítico'],
                        datasets: [{
                            data: [buckets['0-20'], buckets['20-40'], buckets['40-60'], buckets['60-80'], buckets['80-100']],
                            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            hoverOffset: 12
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '78%',
                        layout: { padding: 12 },
                        plugins: {
                            legend: { display: false },
                            datalabels: {
                                display: (context) => {
                                    const val = Number(context.dataset.data[context.dataIndex] || 0);
                                    const pct = (val / riskTotal) * 100;
                                    return pct > 7; 
                                },
                                formatter: (value) => ((Number(value || 0) / riskTotal) * 100).toFixed(0) + '%',
                                color: '#ffffff',
                                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                                borderRadius: 99,
                                padding: { top: 3, right: 6, bottom: 3, left: 6 },
                                font: { size: 9.5, weight: 1000, family: 'Montserrat, sans-serif' },
                                align: 'center',
                                anchor: 'center',
                                shadowColor: 'rgba(0,0,0,0.15)',
                                shadowBlur: 4
                            }
                        }
                    }
                });
            }

            // HEATMAP GENERATOR (Top 5 Depts in periodBajas)
            const deptTotalBajas = {};
            periodBajas.forEach(b => {
                const d = b.d || 'Otros';
                deptTotalBajas[d] = (deptTotalBajas[d] || 0) + 1;
            });
            const top5Depts = Object.entries(deptTotalBajas)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 5)
                .map(d => d[0]);
            
            const heatMonths = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(targetY, targetM - i - 1, 15);
                heatMonths.push({ y: d.getFullYear(), m: d.getMonth() + 1, label: monthNamesAbbr[d.getMonth()] });
            }

            let heatHtml = `<table class="rz-heatmap-table">
                <thead>
                    <tr>
                        <th style="color:#64748b; text-align:left;">Dpto</th>`;
            heatMonths.forEach(hm => {
                heatHtml += `<th style="color:#64748b; text-align:center;">${hm.label}</th>`;
            });
            heatHtml += `</tr>
                </thead>
                <tbody>`;
            
            top5Depts.forEach(dept => {
                heatHtml += `<tr><td style="color:#475569; font-weight:800; font-size:10px; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;" title="${dept}">${dept}</td>`;
                heatMonths.forEach(hm => {
                    const val = allBajas.filter(b => {
                        const curPa = b._pa || normalizePa(b.pa);
                        const by = parseInt(b._y || b.y);
                        const bm = normalizeMonth(b._m || b.m);
                        const matchP = countries.length === 0 || countries.includes(curPa);
                        const matchE = emp2 === 'ALL' || (b.e || '').toUpperCase().trim() === (emp2 || '').toUpperCase().trim();
                        const matchD = (b.d || b.depto || '').toUpperCase().trim() === dept.toUpperCase().trim();
                        return matchP && matchE && matchD && by === hm.y && bm === hm.m;
                    }).length;
                    
                    let cellBg = 'rgba(16, 185, 129, 0.15)';
                    let cellColor = '#10b981';
                    let cellIcon = '🟢';
                    if (val >= 3) {
                        cellBg = 'rgba(239, 68, 68, 0.15)';
                        cellColor = '#ef4444';
                        cellIcon = '🔴';
                    } else if (val === 2) {
                        cellBg = 'rgba(59, 130, 246, 0.15)';
                        cellColor = '#3b82f6';
                        cellIcon = '🔵';
                    }
                    
                    heatHtml += `<td style="text-align:center;">
                        <div class="rz-heatmap-cell" style="background:${cellBg}; color:${cellColor}; font-size:9.5px; font-weight:800; display:inline-block; min-width:32px; padding:2px 4px; border-radius:4px;" title="Bajas: ${val}">
                            ${cellIcon} ${val}
                        </div>
                    </td>`;
                });
                heatHtml += `</tr>`;
            });
            
            if (top5Depts.length === 0) {
                heatHtml += `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b; font-weight:800;">No hay datos para generar el mapa de calor</td></tr>`;
            }
            
            heatHtml += `</tbody></table>`;
            const hmContainer = document.getElementById('retentionHeatmap');
            if (hmContainer) hmContainer.innerHTML = heatHtml;

            // EXECUTIVE ACTION INSIGHTS ENGINE
            let insightsHtml = '';
            const periodTotalBajas = periodBajas.length;
            const periodEarlyBajas = periodBajas.filter(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
                return years < 0.5;
            }).length;
            const periodEarlyPct = periodTotalBajas > 0 ? (periodEarlyBajas / periodTotalBajas * 100) : 0;
            
            if (periodEarlyBajas > 0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(239,68,68,0.08); color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Rotación Temprana Crítica</div>
                        <div class="rz-insight-desc">${periodEarlyBajas} empleados con &lt;6 meses dejaron la empresa (${periodEarlyPct.toFixed(1)}% del total). Acción: Revisar onboarding y selección.</div>
                    </div>
                </div>`;
            } else {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(16,185,129,0.08); color:#10b981;"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Retención Temprana Estable</div>
                        <div class="rz-insight-desc">No se registran fugas de talento en sus primeros 6 meses. Mantener políticas de inducción.</div>
                    </div>
                </div>`;
            }

            const churnVal = (periodTotalBajas / period / (activeEmps.length || 1) * 100);
            if (churnVal > 2.0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(239,68,68,0.08); color:#ef4444;"><i class="fa-solid fa-gauge-high"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Tasa Churn Elevada</div>
                        <div class="rz-insight-desc">Churn promedio de ${churnVal.toFixed(1)}% mensual (benchmark ideal: &lt;1.5%). Acción: Ejecutar plan de contención.</div>
                    </div>
                </div>`;
            } else {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(16,185,129,0.08); color:#10b981;"><i class="fa-solid fa-thumbs-up"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Tasa Churn Saludable</div>
                        <div class="rz-insight-desc">Tasa Churn promedio mensual de ${churnVal.toFixed(1)}% se mantiene bajo control y dentro de rangos normales.</div>
                    </div>
                </div>`;
            }

            // Find worst department in periodBajas
            const deptBajas = {};
            periodBajas.forEach(b => { const d = b.d || 'Otros'; deptBajas[d] = (deptBajas[d] || 0) + 1; });
            const worstDept = Object.entries(deptBajas).sort((a,b) => b[1] - a[1])[0];
            if (worstDept) {
                const worstName = worstDept[0];
                const worstCount = worstDept[1];
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(139,92,246,0.08); color:#8b5cf6;"><i class="fa-solid fa-chart-line"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Dirección de Mayor Impacto</div>
                        <div class="rz-insight-desc">El departamento <strong>${worstName}</strong> concentra la mayor fuga con ${worstCount} bajas críticas en el periodo. Se sugiere diagnóstico de clima laboral.</div>
                    </div>
                </div>`;
            }

            const savings = Math.round(periodEarlyBajas * 0.3) * 4500;
            if (savings > 0) {
                insightsHtml += `
                <div class="rz-insight-card">
                    <div class="rz-insight-icon" style="background:rgba(59,130,246,0.08); color:#3b82f6;"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    <div class="rz-insight-text">
                        <div class="rz-insight-title">Oportunidad ROI de Retención</div>
                        <div class="rz-insight-desc">Retener el 30% de fugas críticas ahorraría aprox. Q${savings.toLocaleString()} en costos de reemplazo.</div>
                    </div>
                </div>`;
            }

            const insEl = document.getElementById('retentionInsights');
            if (insEl) insEl.innerHTML = insightsHtml;

            // UPDATE STATS FOOTER (using periodBajas for the footer stats)
            const fEarly = document.getElementById('rzFooterEarly');
            if (fEarly) fEarly.innerText = periodEarlyBajas.toLocaleString();
            
            const fMid = document.getElementById('rzFooterMid');
            if (fMid) fMid.innerText = periodBajas.filter(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
                return years >= 0.5 && years < 1;
            }).length.toLocaleString();
            
            const fSenior = document.getElementById('rzFooterSenior');
            if (fSenior) fSenior.innerText = periodBajas.filter(b => {
                let years = 0;
                const d1 = parseD(b.fi || b.f_ing || b.fecha_ingreso);
                const d2 = parseD(b.f || b.f_baja || b.fecha_baja);
                if(d1 && d2) years = (d2 - d1) / (1000 * 60 * 60 * 24 * 365.25);
                return years >= 1;
            }).length.toLocaleString();
            
            const fTotal = document.getElementById('rzFooterTotal');
            if (fTotal) fTotal.innerText = periodTotalBajas.toLocaleString();
            
            const fScore = document.getElementById('rzFooterScore');
            if (fScore) fScore.innerText = Math.round(avgRiskScore) + '/100';

            // Generate Insights Summary Text
            if (typeof updateInsightsSummaryText === 'function') {
                updateInsightsSummaryText(earlyBajas, totalBajas, top5Depts, avgRiskScore);
            }
        }


function updateInsightsSummaryText(earlyBajas, totalBajas, top5Depts, avgRiskScore) {
    const textEl = document.getElementById('insightsSummaryText');
    if (!textEl) return;
    
    const earlyPct = totalBajas > 0 ? (earlyBajas / totalBajas * 100).toFixed(1) : 0;
    const deptsStr = top5Depts.length > 0 ? top5Depts.slice(0, 2).join(' y ') : 'ninguno';
    
    let advice = 'Se observa estabilidad general en el periodo analizado.';
    if (earlyPct > 35) {
        advice = `⚠️ Alerta de Rotación Temprana: La fuga de personal en sus primeros 6 meses representa el ${earlyPct}% de las bajas. Se requiere intervención en selección y onboarding para los departamentos de ${deptsStr}.`;
    } else if (earlyPct > 20) {
        advice = `📈 Nivel de Riesgo Medio: Se detecta un ${earlyPct}% de bajas prematuras. Se sugiere implementar entrevistas de permanencia en las áreas críticas de ${deptsStr}.`;
    } else if (totalBajas > 0) {
        advice = `✅ Retención Óptima: La rotación temprana está bajo control (${earlyPct}%). Foco principal en retención de mandos medios.`;
    }
    
    textEl.innerHTML = `
        <div style="margin-bottom: 6px;">
            En este periodo se registran <strong>${totalBajas} bajas totales</strong>, con un score de riesgo promedio de <strong>${Math.round(avgRiskScore)}/100</strong>.
        </div>
        <div>
            ${advice}
        </div>
    `;
}

window.toggleInsightsSummary = function() {
    const block = document.getElementById('insightsSummaryBlock');
    const btn = document.getElementById('btnVerResumen');
    if (!block || !btn) return;
    
    if (block.style.display === 'none') {
        block.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-compress"></i> Ocultar';
        btn.style.background = 'rgba(139,92,246,0.12)';
        btn.style.color = '#7c3aed';
    } else {
        block.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Ver Resumen';
        btn.style.background = 'rgba(245,158,11,0.12)';
        btn.style.color = '#d97706';
    }
};

function renderTenureThermometer(uniqueEmps) {
            const listEl = document.getElementById('tenureRankingList');
            if (!listEl) return;

            const deptMap = {};
            let totalTenure = 0;
            uniqueEmps.forEach(e => {
                const dept = e.d || 'Otros';
                if (!deptMap[dept]) deptMap[dept] = { total: 0, sum: 0 };
                deptMap[dept].total++;
                const hireDateStr = e.fi || e.fechadeingreso || e.fecha_ingreso || '';
                const tVal = (typeof calcTenure === 'function') ? calcTenure(hireDateStr) : 0;
                deptMap[dept].sum += tVal;
                totalTenure += tVal;
            });

            const sorted = Object.entries(deptMap)
                .map(([name, data]) => ({ name, avg: data.sum / data.total }))
                .sort((a,b) => b.avg - a.avg);

            let html = '';
            sorted.forEach(d => {
                const color = d.avg > 4 ? '#1e3a8a' : d.avg > 2 ? '#3b82f6' : d.avg > 1 ? '#60a5fa' : '#fbbf24';
                const pct = Math.min(100, (d.avg / 6) * 100); // Scale 0-6 years
                html += `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:800; color:#475569; margin-bottom:4px;">
                            <span>${d.name}</span>
                            <span>${d.avg.toFixed(1)} a </span>
                        </div>
                        <div style="height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:${color}; border-radius:10px;"></div>
                        </div>
                    </div>
                `;
            });
            listEl.innerHTML = html;

            const globalAvg = uniqueEmps.length > 0 ? totalTenure / uniqueEmps.length : 0;
            const globEl = document.getElementById('avgTenureGlobal');
            if(globEl) {
                globEl.innerText = globalAvg.toFixed(1);
            }

            // Tenure Dist Chart
            const dist = { '0-1': 0, '1-3': 0, '3-5': 0, '5+': 0 };
            uniqueEmps.forEach(e => {
                const t = (typeof calcTenure === 'function') ? calcTenure(e.fi) : 0;
                if (t < 1) dist['0-1']++;
                else if (t < 3) dist['1-3']++;
                else if (t < 5) dist['3-5']++;
                else dist['5+']++;
            });

            const ctxDist = document.getElementById('chartTenureDist');
            if (ctxDist) {
                if (window._tenDistChart) window._tenDistChart.destroy();
                window._tenDistChart = new Chart(ctxDist, {
                    type: 'doughnut',
                    data: {
                        labels: ['0-1 yr', '1-3 yr', '3-5 yr', '5+ yr'],
                        datasets: [{
                            data: [dist['0-1'], dist['1-3'], dist['3-5'], dist['5+']],
                            backgroundColor: ['#fbbf24', '#60a5fa', '#3b82f6', '#1e3a8a'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { legend: { position: 'right', labels: { boxWidth: 8, font: { size: 9, weight: 800 } } } }
                    }
                });
            }
        }




/* ===== bajas.js ===== */
﻿// Bajas tab renderer extracted from the main HTML.

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


/* ===== incidencias.js ===== */
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
    const allIncs = app.incidencias || [];
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
    const search = txt(local.search);

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


/* ===== isr.js ===== */
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


// createKPICard está definida en inline-core.js (scope global compartido)

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



/* ===== views.js ===== */
﻿// Dashboard view switching extracted from the main HTML. Render functions remain global and are called at runtime.

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



/* ===== admin.js ===== */
// Admin and master-data helpers extracted from the main HTML.

function renderAdminSustituciones() {
                            const sustData = buildSustitData();
                            const reinData = buildReingresoData();
                            const tab = window._adminSustActiveTab || 'sustit';
                            const rawData = tab === 'reingreso' ? reinData : sustData;

                            const query = (document.getElementById('adminSustSearch') || {value:''}).value.toUpperCase().trim();
                            const data = query ? rawData.filter(s => {
                                const n = (s.n||'').toUpperCase();
                                const c = (s.c||'').toUpperCase();
                                const p = (s.puesto||'').toUpperCase();
                                return n.includes(query) || c.includes(query) || p.includes(query);
                            }) : rawData;

                            // Update tabs styling
                            const tabS = document.getElementById('adminSustTabSustit');
                            const tabR = document.getElementById('adminSustTabReingreso');
                            if (tabS) tabS.style.background = tab === 'sustit' ? '#6366f1' : 'transparent';
                            if (tabS) tabS.style.color = tab === 'sustit' ? '#fff' : '#6366f1';
                            if (tabR) tabR.style.background = tab === 'reingreso' ? '#f59e0b' : 'transparent';
                            if (tabR) tabR.style.color = tab === 'reingreso' ? '#fff' : '#f59e0b';

                            // Count
                            const countEl = document.getElementById('adminSustCount');
                            if (countEl) countEl.textContent = data.length;

                            // Table
                            const tbl = document.getElementById('adminSustTableContainer');
                            if (tbl) {
                                if (!data.length) {
                                    tbl.innerHTML = '<div style="padding:40px 20px; text-align:center; color:#94a3b8; font-size:12px;">Sin datos para mostrar</div>';
                                } else if (tab === 'sustit') {
                                    tbl.innerHTML = `
                                    <table style="width:100%; border-collapse:collapse; font-size:11px;">
                                        <thead>
                                            <tr style="background:#f8fafc; position:sticky; top:0; z-index:2; border-bottom:2px solid #e2e8f0;">
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">CÓDIGO</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">NOMBRE</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">ORIGEN</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">DESTINO</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">MES TRASLADO</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">PUESTO NUEVO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${data.map((s, i) => `
                                                <tr style="border-bottom:1px solid #f1f5f9; background:${i%2===0?'#fff':'#f8fafc'}; transition:0.2s;" onmouseover="this.style.background='rgba(99,102,241,0.04)'" onmouseout="this.style.background='${i%2===0?'#fff':'#f8fafc'}'">
                                                    <td style="padding:10px 15px; font-weight:800; color:#6366f1;">${s.c}</td>
                                                    <td style="padding:10px 15px; font-weight:700; color:#1e293b;">${s.n}</td>
                                                    <td style="padding:10px 15px;"><span style="background:rgba(239,68,68,0.08); color:#dc2626; padding:3px 8px; border-radius:8px; font-weight:800;">${s.pa_orig}-${s.e_orig}</span></td>
                                                    <td style="padding:10px 15px;"><span style="background:rgba(16,185,129,0.08); color:#059669; padding:3px 8px; border-radius:8px; font-weight:800;">${s.pa_dest}-${s.e_dest}</span></td>
                                                    <td style="padding:10px 15px; font-weight:800; color:#475569;">${s.mes} ${s.anio}</td>
                                                    <td style="padding:10px 15px; font-weight:700; color:#334155;">${s.puesto}</td>
                                                </tr>`).join('')}
                                        </tbody>
                                    </table>`;
                                } else {
                                    tbl.innerHTML = `
                                    <table style="width:100%; border-collapse:collapse; font-size:11px;">
                                        <thead>
                                            <tr style="background:#f8fafc; position:sticky; top:0; z-index:2; border-bottom:2px solid #e2e8f0;">
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">CÓDIGO</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">NOMBRE</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">EMPRESA</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">ÚLTIMO MES</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">REINGRESO</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:center;">MESES AUSENTE</th>
                                                <th style="padding:12px 15px; font-weight:800; color:#475569; text-align:left;">PUESTO NUEVO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${data.map((s, i) => `
                                                <tr style="border-bottom:1px solid #f1f5f9; background:${i%2===0?'#fff':'#f8fafc'}; transition:0.2s;" onmouseover="this.style.background='rgba(245,158,11,0.04)'" onmouseout="this.style.background='${i%2===0?'#fff':'#f8fafc'}'">
                                                    <td style="padding:10px 15px; font-weight:800; color:#d97706;">${s.c}</td>
                                                    <td style="padding:10px 15px; font-weight:700; color:#1e293b;">${s.n}</td>
                                                    <td style="padding:10px 15px;"><span style="background:rgba(99,102,241,0.08); color:#4f46e5; padding:3px 8px; border-radius:8px; font-weight:800;">${s.pa}-${s.e}</span></td>
                                                    <td style="padding:10px 15px; font-weight:700; color:#64748b;">${s.ultimo_mes} ${s.ultimo_anio}</td>
                                                    <td style="padding:10px 15px;"><span style="background:rgba(16,185,129,0.1); color:#059669; padding:3px 8px; border-radius:8px; font-weight:800;">${s.reingreso_mes} ${s.reingreso_anio}</span></td>
                                                    <td style="padding:10px 15px; text-align:center;"><span style="background:rgba(239,68,68,0.1); color:#dc2626; padding:3px 10px; border-radius:8px; font-weight:1000; font-size:12px;">${s.meses_ausente}</span></td>
                                                    <td style="padding:10px 15px; font-weight:700; color:#334155;">${s.puesto}</td>
                                                </tr>`).join('')}
                                        </tbody>
                                    </table>`;
                                }
                            }
                        }

                        function downloadAdminSustitExcel() {
                            const tab = window._adminSustActiveTab || 'sustit';
                            const data = tab === 'reingreso' ? buildReingresoData() : buildSustitData();
                            if (!data.length) { alert('No hay datos para exportar.'); return; }
                            let headers, rows;
                            if (tab === 'sustit') {
                                headers = ['CODIGO','NOMBRE','PAIS_ORIGEN','EMPRESA_ORIGEN','PAIS_DESTINO','EMPRESA_DESTINO','MES_TRASLADO','AÑO','PUESTO'];
                                rows = data.map(s => [s.c, s.n, s.pa_orig, s.e_orig, s.pa_dest, s.e_dest, s.mes, s.anio, s.puesto]);
                            } else {
                                headers = ['CODIGO','NOMBRE','PAIS','EMPRESA','ULTIMO_MES','ULTIMO_ANIO','REINGRESO_MES','REINGRESO_ANIO','MESES_AUSENTE','PUESTO_AL_REGRESAR'];
                                rows = data.map(s => [s.c, s.n, s.pa, s.e, s.ultimo_mes, s.ultimo_anio, s.reingreso_mes, s.reingreso_anio, s.meses_ausente, s.puesto]);
                            }
                            const csv = [headers, ...rows].map(r => r.map(v => '"' + String(v||'').replace(/"/g, '""') + '"').join(',')).join('\n');
                            const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = tab === 'reingreso' ? 'Reingresos_Planilla.csv' : 'Sustituciones_Patronales.csv';
                            document.body.appendChild(a); a.click();
                            document.body.removeChild(a); URL.revokeObjectURL(url);
                        }


function renderAdminPanel() {
                const pane = document.getElementById('pane6');
                if (!pane) return;
                console.log("    Rendering Config Panel...");
                pane.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 5px; height: 100%; padding:0 20px;">
                    <div style="display: flex; gap: 8px; background: rgba(241, 245, 249, 0.8); backdrop-filter: blur(15px); padding: 6px 15px; border-radius: 20px; width: fit-content; border: 1.5px solid rgba(255,255,255,0.8); margin-bottom: 2px; box-shadow: 0 4px 15px -5px rgba(0,0,0,0.05); margin-top: 5px;">
                        <button onclick="switchAdminSub(0)" class="admin-tab-btn active" style="padding: 10px 25px; font-size: 11px; white-space: nowrap;">   MAPEO PUESTOS</button>
                        <button onclick="switchAdminSub(1)" class="admin-tab-btn" style="padding: 10px 25px; font-size: 11px; white-space: nowrap;">  USUARIOS</button>
                        <button onclick="switchAdminSub(2)" class="admin-tab-btn" style="padding: 10px 25px; font-size: 11px; white-space: nowrap;">  TIPOS CAMBIO</button>
                        <button onclick="switchAdminSub(3)" class="admin-tab-btn" style="padding: 10px 25px; font-size: 11px; white-space: nowrap;">  DATOS MAESTROS</button>
                        <button onclick="switchAdminSub(4)" class="admin-tab-btn" style="padding: 10px 25px; font-size: 11px; white-space: nowrap;"><i class="fa-solid fa-shuffle" style="margin-right:4px;"></i> SUSTITUCIONES / REINGRESOS</button>
                    </div>
                    <div id="adminContent" style="flex: 1; overflow: hidden; display: flex; flex-direction: column; gap:10px;"></div>
                </div>
                `;
                try {
                    switchAdminSub(window._lastAdminSub || 0);
                } catch(e) {
                    console.error("Config Render Error:", e);
                    document.getElementById('adminContent').innerHTML = '<div style="padding:40px; color:red;">Error al cargar CONFIGURACIÓN. Revisa la consola.</div>';
                }
            }

            function switchAdminSub(n) {
                window._lastAdminSub = n;
                document.querySelectorAll('.admin-tab-btn').forEach((b, i) => i === n ? b.classList.add('active') : b.classList.remove('active'));
                const container = document.getElementById('adminContent');
                if (n === 0) {
                    container.innerHTML = `
                    <div id="mappingHealthBar" style="background:#fff; padding:20px; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 10px 30px -10px rgba(0,0,0,0.05); margin-bottom:15px; display:none;"></div>
                    <div class="card-box" style="background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(243,244,246,0.9)); backdrop-filter:blur(20px); border-radius:24px; padding:10px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1); border:1px solid rgba(255,255,255,0.6); position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:15px; flex-wrap:wrap;">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <h3 style="font-size:22px; font-weight:950; background:linear-gradient(90deg, #1e1b4b, var(--ac-dark)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0; letter-spacing:-0.5px; white-space:nowrap;">Hoja de Puestos</h3>
                                <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(99, 102, 241, 0.1); color:var(--ac-dark); padding:4px 10px; border-radius:100px; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:1px; border:1px solid rgba(99,102,241,0.2);">
                                    <i class="fas fa-bolt"></i> PRO v5
                                </div>
                            </div>
                            
                            <!-- Universal Tools (Requested) -->
                            <div style="display:flex; align-items:center; gap:12px; flex:1; justify-content:flex-end;">
                                <div style="position:relative; width:220px;">
                                    <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:12px; color:#94a3b8;"></i>
                                    <input type="text" id="fltMappingGeneral" oninput="debouncedRenderMappings()" placeholder="Busqueda Universal..." 
                                        style="width:100%; padding:10px 12px 10px 35px; border-radius:12px; border:1px solid #e2e8f0; font-size:11px; font-weight:700; outline:none; transition:0.3s; background:#fff;">
                                </div>
                                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; background:#f1f5f9; padding:8px 12px; border-radius:12px; font-size:10px; font-weight:900; color:#475569; user-select:none; border:1px solid #e2e8f0;">
                                    <input type="checkbox" id="chkOnlyPending" onchange="debouncedRenderMappings()" style="accent-color:var(--ac);"> 
                                    AUDIT: PENDIENTES
                                </label>
                                <button onclick="repararPendientes()" class="btn-top" 
                                    style="background: #10b981; color: #fff; border: none; padding: 8px 15px; border-radius: 12px; font-weight: 900; font-size: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-wand-magic-sparkles"></i> REPARAR PENDIENTES
                                </button>
                                <div id="unmappedInfo"></div>
                            </div>
                        </div>

                        <!-- Bulk Action Bar (Hidden by default) -->
                        <div id="bulkActionBar" style="display:none; position:sticky; top:2px; z-index:1000; background:rgba(15, 23, 42, 0.9); backdrop-filter:blur(10px); color:white; padding:12px 20px; border-radius:16px; align-items:center; gap:15px; margin-bottom:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); animation:slideIn 0.3s ease;">
                            <span style="font-size:11px; font-weight:800;"><i class="fas fa-check-double"></i> <span id="bulkCount">0</span> SELECCIONADOS</span>
                            <div style="width:1px; height:20px; background:rgba(255,255,255,0.2);"></div>
                            <div style="display:flex; gap:8px;">
                                <select id="bulkDirSet" style="height:35px; padding:0 10px; font-size:10px; background:#1e293b; border-color:rgba(255,255,255,0.1);">
                                    <option value="">  Cambiar Direccion...</option>
                                    ${window.ASYS_DIRECCIONES.map(d => `<option value="${d}">${d}</option>`).join('')}
                                </select>
                                <select id="bulkDepSet" style="height:35px; padding:0 10px; font-size:10px; background:#1e293b; border-color:rgba(255,255,255,0.1);">
                                    <option value="">  Cambiar Departamento...</option>
                                    ${window.ASYS_DEPARTAMENTOS.map(d => `<option value="${d}">${d}</option>`).join('')}
                                </select>
                                <button onclick="applyBulkMapping()" style="background:var(--ac); color:white; border:none; padding:0 15px; border-radius:8px; font-size:10px; font-weight:900; cursor:pointer; height:35px;">APLICAR CAMBIOS</button>
                                <button onclick="clearBulkSelect()" style="background:transparent; color:#94a3b8; border:1px solid #334155; padding:0 12px; border-radius:8px; font-size:10px; cursor:pointer;"><i class="fas fa-times"></i></button>
                            </div>
                        </div>

                        <style>
                            @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
                            .btn-mega-mini {
                                padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);
                                background: linear-gradient(135deg, var(--c1, #6366f1), var(--c2, #4f46e5));
                                color: white; font-size: 14px; cursor: pointer; transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                                display: flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            }
                            .btn-mega-mini:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); filter: brightness(1.1); }
                            .glass-action-bar {
                                background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6);
                                padding: 8px 12px; border-radius: 16px; display: flex; gap: 10px; align-items: center; margin-bottom: 20px;
                                box-shadow: 0 10px 25px -10px rgba(0,0,0,0.05); overflow-x: auto; scrollbar-width: none;
                            }
                        
        /* --- PRESENTATION MODE IMPROVEMENTS --- */
        #presOverlay {
            position: fixed;
            inset: 0;
            background: #0f172a;
            z-index: 30000;
            display: none;
            flex-direction: column;
            color: #fff;
            font-family: 'Montserrat', sans-serif;
        }
        #presOverlay.on { display: flex; animation: presFadeIn 0.5s ease; }
        @keyframes presFadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .pres-topbar {
            height: 70px;
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(15, 23, 42, 0.95);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }
        .pres-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            position: relative;
        }
        .pres-slide {
            position: absolute;
            inset: 0;
            display: none;
            flex-direction: column;
            padding: 40px 60px;
        }
        .pres-slide.active { display: flex; animation: slideEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideEnter { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        
        .pres-section-title { font-size: 14px; font-weight: 1000; color: var(--ac); letter-spacing: 5px; margin-bottom: 5px; text-transform: uppercase; }
        .pres-section-sub { font-size: 32px; font-weight: 1000; color: #fff; letter-spacing: -1px; margin-bottom: 40px; }
        
        .pres-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 40px; height: 160px; }
        .pres-kpi-card { background: rgba(255,255,255,0.04); border-radius: 20px; padding: 25px; border: 1px solid rgba(255,255,255,0.06); }
        .pres-kpi-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 8px; }
        .pres-kpi-val { font-size: 28px; font-weight: 1000; color: #fff; margin-bottom: 4px; }
        .pres-kpi-sub { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); }

        .pres-chart-wrap {
            flex: 1;
            background: rgba(255,255,255,0.02);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            padding: 25px !important;
            min-height: 0;
            position: relative;
            margin-top: 20px;
        }
        .pres-chart-container { flex: 1; min-height: 450px; position: relative; }
        .pres-chart-wrap canvas { width: 100% !important; height: 100% !important; }
    
        .btn-zoom-hd:hover { background: rgba(139, 92, 246, 0.2) !important; transform: scale(1.05); }
    </style>
                        <div class="glass-action-bar">
                            <input type="file" id="importMappingsFile" accept=".xlsx,.xls,.csv" style="display:none" onchange="importMappingsFromExcel(this)">
                            
                            <div style="display:flex; gap:6px;">
                                <button onclick="document.getElementById('importMappingsFile').click()" class="btn-mega-mini" title="Importar Excel" style="--c1:#8b5cf6; --c2:#6d28d9;"><i class="fas fa-file-import"></i></button>
                                <button onclick="exportMappings()" class="btn-mega-mini" title="Exportar Excel" style="--c1:#3b82f6; --c2:#1d4ed8;"><i class="fas fa-file-excel"></i></button>
                            </div>
                            
                            <div style="width:1px; height:24px; background:rgba(0,0,0,0.08); margin:0 5px;"></div>
                            
                            <div style="display:flex; gap:8px; flex:1;">
                                <button onclick="addManualPos()" class="btn-mega" title="Crear Nuevo Puesto" style="--c1:#f59e0b; --c2:#d97706; flex:none; padding:10px 20px; font-size:10px;"><i class="fas fa-plus-circle"></i> CREAR PUESTO</button>
                                <button onclick="repairPendingMappings()" class="btn-mega" title="Reparar autom  los PENDIENTES" style="--c1:#6366f1; --c2:#4338ca; flex:none; padding:10px 20px; font-size:10px;"><i class="fas fa-magic"></i> REPARAR PENDIENTES</button>
                                <button onclick="fullResetMappings()" class="btn-mega-mini" title="RESET TOTAL de Mapeos" style="--c1:#64748b; --c2:#475569;"><i class="fas fa-trash-alt"></i></button>
                            </div>

                            <button onclick="discardPendingChanges()" class="btn-mega-mini" id="btnDiscardChanges" title="Descartar cambios" style="display:none; --c1:#ef4444; --c2:#b91c1c;"><i class="fas fa-undo"></i></button>
                            
                            <button onclick="saveMappings()" class="btn-mega ${Object.keys(window.pendingOverrides).length > 0 ? 'btn-pulse' : ''}" id="btnSyncMappings" title="Guardar Cambios" style="--c1:#10b981; --c2:#047857; min-width:200px; padding:10px 25px;">
                                <i class="fas fa-check-circle"></i> <span style="font-size:11px;">GUARDAR CAMBIOS</span>
                            </button>
                        </div>

                        <!-- DataLists for Filters -->
                        <datalist id="listPa"></datalist>
                        <datalist id="listEmp"></datalist>
                        <datalist id="listPos"></datalist>
                        <datalist id="listDir"></datalist>
                        <datalist id="listDep"></datalist>

                        <div style="max-height:800px; overflow-y:auto; border-radius:18px; border:1px solid rgba(255,255,255,0.8); background:rgba(255,255,255,0.1); backdrop-filter:blur(40px); box-shadow: 0 15px 40px -10px rgba(0,0,0,0.08); scrollbar-width:thin;">
                            <table style="width:100%; border-collapse:separate; border-spacing:0;">
                                <thead style="position:sticky; top:0; z-index:100;">
                                    <tr style="background:rgba(235, 245, 255, 0.98); backdrop-filter:blur(15px);">
                                        <th style="padding:10px; width:40px; text-align:center; border-bottom:1.5px solid #e2e8f0;"><input type="checkbox" onclick="toggleAllMappingRows(this)"></th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; width:80px;">Regi </th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; width:100px;">Unidad</th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; width:150px;">Puesto en NÓMINA</th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; width:100px;">  Vez</th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; width:150px;">  Ocupante</th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; min-width:200px;">Arquitectura (DIR)</th>
                                        <th style="padding:10px; text-align:left; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:1px; border-bottom:1.5px solid #e2e8f0; min-width:200px;">Estructura (DEP)</th>
                                        <th style="padding:10px; text-align:center; font-size:9px; font-weight:900; color:#475569; text-transform:uppercase; border-bottom:1.5px solid #e2e8f0; width:65px;">Acci </th>
                                    </tr>
                                    <tr style="background:rgba(255,255,255,0.85); backdrop-filter:blur(10px);">
                                        <th style="padding:6px;"></th>
                                        <th style="padding:6px;"><input id="fltPa" list="listPa" oninput="debouncedRenderMappings()" placeholder="Pais..." class="flt-mega"></th>
                                        <th style="padding:6px;"><input id="fltEmp" list="listEmp" oninput="debouncedRenderMappings()" placeholder="Unidad..." class="flt-mega"></th>
                                        <th style="padding:6px;"><input id="fltPos" list="listPos" oninput="debouncedRenderMappings()" placeholder="Puesto..." class="flt-mega"></th>
                                        <th style="padding:6px; position:relative;">
                                            <input id="fltLastDate" oninput="debouncedRenderMappings()" placeholder="Fecha..." class="flt-mega">
                                            <div style="display:flex; gap:2px; margin-top:4px;">
                                                <button onclick="setMappingDateRange(3)" style="padding:2px 4px; font-size:8px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">3m</button>
                                                <button onclick="setMappingDateRange(12)" style="padding:2px 4px; font-size:8px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">1y</button>
                                                <button onclick="setMappingDateRange(0)" style="padding:2px 4px; font-size:8px; border-radius:4px; border:1px solid #ddd; background:#fff; cursor:pointer;">All</button>
                                            </div>
                                        </th>
                                        <th style="padding:6px;"><input id="fltLastPerson" oninput="debouncedRenderMappings()" placeholder="Persona..." class="flt-mega"></th>
                                        <th style="padding:6px;"><input id="fltDir" list="listDir" oninput="debouncedRenderMappings()" placeholder="DIR..." class="flt-mega"></th>
                                        <th style="padding:6px;"><input id="fltDep" list="listDep" oninput="debouncedRenderMappings()" placeholder="DEP..." class="flt-mega"></th>
                                        <th style="padding:6px; text-align:center; color:#cbd5e1;"><i class="fas fa-search" style="font-size:12px;"></i></th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyMappings"></tbody>
                            </table>
                        </div>
                    </div>
                    `;
                    renderMappings();
                } else if (n === 2) {
                    container.innerHTML = `
                    <div class="pane-header" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="font-size:20px; font-weight:800; color:var(--tx); margin:0;">Administraci  de TC</h2>
                        </div>
                        <div class="pane-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
                            <select id="paisTCAdminSel" onchange="renderTCMappings()" class="admin-select"
                                style="width:140px; height:42px; border:1px solid #e2e8f0; color:#1e293b; background:#fff; border-radius:12px;">
                                <option value="ALL">  Todos los Paises</option>
                            </select>
                            <select id="empTCAdminSel" onchange="renderTCMappings()" class="admin-select"
                                style="width:140px; height:42px; border:1px solid #e2e8f0; color:#1e293b; background:#fff; border-radius:12px;">
                                <option value="ALL">  Todas las Empresas</option>
                            </select>
                            <select id="yearTCAdminSel" onchange="renderTCMappings()" class="admin-select"
                                style="width:100px; height:42px; border:1px solid #e2e8f0; color:#1e293b; background:#fff; border-radius:12px;">
                                <option value="ALL">  A  Todo</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                            <select id="monthTCAdminSel" onchange="renderTCMappings()" class="admin-select"
                                style="width:110px; height:42px; border:1px solid #e2e8f0; color:#1e293b; background:#fff; border-radius:12px;">
                                <option value="ALL">  Mes: Todo</option>
                                <option value="1">Enero</option>
                                <option value="2">Febrero</option>
                                <option value="3">Marzo</option>
                                <option value="4">Abril</option>
                                <option value="5">Mayo</option>
                                <option value="6">Junio</option>
                                <option value="7">Julio</option>
                                <option value="8">Agosto</option>
                                <option value="9">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option>
                            </select>
                            <button class="btn-top" style="background:#f59e0b; font-size:10px;" onclick="loadSuggestedRates()">  TASAS SUGERIDAS</button>
                            <button class="btn-top" style="background:var(--ac); font-size:10px;" onclick="exportTCMappings()">  EXPORTAR</button>
                            <button class="btn-top" style="background:var(--ac); font-size:10px;" onclick="document.getElementById('importTCFile').click()">  IMPORTAR</button>
                            <input type="file" id="importTCFile" style="display:none" onchange="importTCMappings(this)">
                            <button class="btn-top" style="background:#10b981; font-size:10px;" onclick="saveTCMappings()">  GUARDAR</button>
                             <button class="btn-top" style="background:#475569; font-size:10px;" onclick="addFutureTC()">  AGREGAR PERIODO</button>
                        </div>
                    </div>
                    <div id="futureTCFormastyle="display:none; margin-bottom:15px; padding:15px; background:white; border-radius:12px; border:1px solid #e2e8f0; gap:10px; align-items:center;">
                        <input type="number" id="newTC_Y" placeholder="AÑO" style="padding:8px; border-radius:8px; border:1px solid #ddd; width:80px;">
                        <input type="number" id="newTC_Val" step="0.0001" placeholder="TC" style="padding:8px; border-radius:8px; border:1px solid #ddd; width:100px;">
                        <button onclick="commitFutureTC()" style="background:var(--ac); color:white; border:none; padding:8px 15px; border-radius:8px; font-weight:700;">1 A&Ntilde;O</button>
                    </div>
                    <div class="card-box" style="padding:0; overflow:hidden;">
                        <div style="max-height: 50vh; overflow-y: auto;">
                            <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                                <thead style="background:#f8fafc; border-bottom:1px solid #e2e8f0; position: sticky; top: 0; z-index: 10;">
                                    <tr>
                                        <th style="padding:15px; width:25%;">Pais</th>
                                        <th style="padding:15px; width:15%;">AÑO</th>
                                        <th style="padding:15px; width:15%;">MES</th>
                                        <th style="padding:15px; width:45%;">VALORR TC (USD)</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyTCMappings"></tbody>
                            </table>
                        </div>
                    </div>
                    `;
                    renderTCMappings();
                } else if (n === 3) {
                    container.innerHTML = `
                    <div id="datosTabContainer" style="display: flex; gap: 20px; flex-direction: column;">
                        <div class="card-box" style="padding: 40px; text-align: center;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--ac); margin-bottom: 15px;"></i>
                            <p>Iniciando panel de gestión de datos...</p>
                        </div>
                    </div>
                    `;
                    renderDatos();
                } else if (n === 1) {
                    container.innerHTML = `
                    <div class="card-box">
                        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <div>
                                <h3 style="margin:0;">Gestión de Usuarios</h3>
                                <p style="font-size:12px; margin-top:4px; opacity:0.7;">Administraci  de credenciales de acceso</p>
                            </div>
                            <button onclick="addUserModal()" class="btn-top" style="background:var(--ac);"><i class="fas fa-user-plus"></i> NUEVO USUARIO</button>
                        </div>
                        <div style="max-height:600px; overflow-y:auto; border-radius:12px; border:1px solid #f1f5f9;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead style="position:sticky; top:0; background:#f8fafc; z-index:10; border-bottom:2px solid #e2e8f0;">
                                    <tr>
                                        <th style="padding:15px; text-align:left; font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Usuario</th>
                                        <th style="padding:15px; text-align:left; font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Fecha Creaci </th>
                                        <th style="padding:15px; text-align:left; font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyUsers"></tbody>
                            </table>
                        </div>
                    </div>
                    `;
                    renderUserList();
                } else if (n === 4) {
                    container.innerHTML = `
                    <div class="card-box" style="padding: 25px 35px; background: #fff; border-radius: 20px; box-shadow: var(--shadow); border: 1.5px solid rgba(99,102,241,0.15);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 15px;">
                            <div>
                                <h3 style="font-size:12px; font-weight:800; color:#6366f1; text-transform:uppercase; margin-bottom:4px;"><i class="fa-solid fa-shuffle"></i> Auditoría de Movimientos</h3>
                                <h2 style="font-size:22px; font-weight:950; color:#1e293b; margin:0;">Sustituciones Patronales & Reingresos</h2>
                                <p style="font-size:12px; color:#64748b; margin-top:4px;">Historial completo de traslados entre empresas y reingresos temporales</p>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <div style="display:flex; gap:2px; align-items:center; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 50px;">
                                    <button id="adminSustTabSustit" onclick="window._adminSustActiveTab='sustit'; renderAdminSustituciones();" style="font-size:10px; font-weight:1000; padding: 8px 18px; border-radius: 50px; border:none; cursor:pointer; background:#6366f1; color:#fff; transition: all 0.2s;">SUSTITUCIONES</button>
                                    <button id="adminSustTabReingreso" onclick="window._adminSustActiveTab='reingreso'; renderAdminSustituciones();" style="font-size:10px; font-weight:1000; padding: 8px 18px; border-radius: 50px; border:none; cursor:pointer; background:transparent; color:#f59e0b; transition: all 0.2s;">REINGRESOS</button>
                                </div>
                                <button onclick="downloadAdminSustitExcel()" style="display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; padding:10px 20px; border-radius:12px; font-size:11px; font-weight:900; cursor:pointer; box-shadow:0 8px 20px rgba(99,102,241,0.25);" title="Exportar Excel">
                                    <i class="fas fa-file-excel"></i> EXPORTAR
                                </button>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; gap: 15px;">
                            <div style="position:relative; width:300px;">
                                <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:12px; color:#94a3b8;"></i>
                                <input type="text" id="adminSustSearch" oninput="renderAdminSustituciones()" placeholder="Buscar empleado..." style="width:100%; padding:10px 12px 10px 35px; border-radius:12px; border:1px solid #e2e8f0; font-size:12px; font-weight:700; outline:none;">
                            </div>
                            <span style="font-size:12px; font-weight:800; color:#475569; background:#f1f5f9; padding:8px 15px; border-radius:10px;">
                                Total Registros: <span id="adminSustCount" style="color:#6366f1; font-weight:1000; font-size:14px;">0</span>
                            </span>
                        </div>
                        <div id="adminSustTableContainer" style="max-height:480px; overflow-y:auto; border-radius:14px; border:1px solid #e2e8f0; background:#fff; scrollbar-width:thin;"></div>
                    </div>
                    `;
                    renderAdminSustituciones();
                }
            }

            function renderUserList() {
                const tbody = document.getElementById('tbodyUsers');
                if (!tbody) return;
                const users = JSON.parse(localStorage.getItem('asys_managed_users') || '[]');
                tbody.innerHTML = users.map(u => `
                <tr>
                    <td style="padding:15px; font-size:12px; font-weight:800; color:var(--tx);">${u.u}</td>
                    <td style="padding:15px; font-size:11px; color:var(--mu);">${u.created}</td>
                    <td style="padding:15px;">
                        <button onclick="deleteUser('${u.u}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
                `).join('');
                if (users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="padding:40px; text-align:center; color:var(--mu); font-size:12px;">No hay usuarios adicionales. El administrador maestro siempre está activo.</td></tr>';
                }
            }

            function addUserModal() {
                Swal.fire({
                    title: 'Nuevo Usuario',
                    html: `
                    <div style="text-align:left;">
                        <label style="font-size:11px; font-weight:800; color:var(--mu);">USUARIO CORPORATIVO</label>
                        <input id="new_u" class="swal2-input" placeholder="p.ej: jhonatan.macario" style="margin:10px 0;">
                        <label style="font-size:11px; font-weight:800; color:var(--mu);">CONTRASE  TEMPORAL</label>
                        <input id="new_p" type="password" class="swal2-input" placeholder="********" style="margin:10px 0;">
                    </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Crear Usuario',
                    preConfirm: () => {
                        const u = document.getElementById('new_u').value;
                        const p = document.getElementById('new_p').value;
                        if (!u || !p) return Swal.showValidationMessage('Todos los campos son obligatorios');
                        return { u, p };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const users = JSON.parse(localStorage.getItem('asys_managed_users') || '[]');
                        if (users.find(x => x.u === result.value.u)) return Swal.fire('Error', 'El usuario ya existe', 'error');
                        users.push({ u: result.value.u, p: result.value.p, created: new Date().toLocaleDateString() });
                        localStorage.setItem('asys_managed_users', JSON.stringify(users));
                        renderUserList();
                    }
                });
            }

            function deleteUser(username) {
                Swal.fire({
                    title: '  usuario?',
                    text: `  seguro que deseas eliminar a ${username}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'Sí, eliminar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        let users = JSON.parse(localStorage.getItem('asys_managed_users') || '[]');
                        users = users.filter(x => x.u !== username);
                        localStorage.setItem('asys_managed_users', JSON.stringify(users));
                        renderUserList();
                    }
                });
            }

            // --- ASYS MAPPING SYSTEM (AUTHORIZED WORKFLOW) ---
            window.selectedMappingKeys = new Set();

            function setMappingDateRange(months) {
                const flt = document.getElementById('fltLastDate');
                if (!flt) return;
                if (months === 0) { flt.value = ''; }
                else if (months === 3) { flt.value = '> 3m'; }
                else if (months === 12) { flt.value = '> 1y'; }
                debouncedRenderMappings();
            }

            function toggleAllMappingRows(source) {
                const checkboxes = document.querySelectorAll('.row-chk');
                checkboxes.forEach(c => {
                    c.checked = source.checked;
                    const key = c.dataset.key;
                    if (source.checked) window.selectedMappingKeys.add(key);
                    else window.selectedMappingKeys.delete(key);
                });
                updateBulkUI();
            }

            function toggleMappingRow(key, source) {
                if (source.checked) window.selectedMappingKeys.add(key);
                else window.selectedMappingKeys.delete(key);
                updateBulkUI();
            }

            function updateBulkUI() {
                const bar = document.getElementById('bulkActionBar');
                const count = document.getElementById('bulkCount');
                if (!bar || !count) return;
                const size = window.selectedMappingKeys.size;
                bar.style.display = size > 0 ? 'flex' : 'none';
                count.innerText = size;
            }

            function clearBulkSelect() {
                window.selectedMappingKeys.clear();
                document.querySelectorAll('.row-chk, input[onclick*="toggleAllMappingRows"]').forEach(c => c.checked = false);
                updateBulkUI();
            }

            async function applyBulkMapping() {
                const dir = document.getElementById('bulkDirSet').value;
                const dep = document.getElementById('bulkDepSet').value;
                if (!dir && !dep) return Swal.fire('Error', 'Selecciona al menos un valor (DIR o DEP) para aplicar.', 'warning');
                
                const size = window.selectedMappingKeys.size;
                const { isConfirmed } = await Swal.fire({
                    title: `  cambios a ${size} puestos?`,
                    text: `Se asignar  masivamente la Clasificación seleccionada.`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, aplicar todo'
                });

                if (isConfirmed) {
                    window.selectedMappingKeys.forEach(key => {
                        const payload = {};
                        if (dir) payload.dir = dir;
                        if (dep) payload.depto = dep;
                        trackMappingChange(key, payload, 'bulk');
                    });
                    clearBulkSelect();
                    renderMappings();
                    Swal.fire(' ', 'Cambios aplicados correctamente.', 'success');
                }
            }

            function renderMappings() {
                const tbody = document.getElementById('tbodyMappings');
                if (!tbody) return;

                const fPa = (document.getElementById('fltPa')?.value || '').trim().toUpperCase();
                const fEmp = (document.getElementById('fltEmp')?.value || '').trim().toUpperCase();
                const fPos = (document.getElementById('fltPos')?.value || '').trim().toUpperCase();
                const fDir = (document.getElementById('fltDir')?.value || '').trim().toUpperCase();
                const fDep = (document.getElementById('fltDep')?.value || '').trim().toUpperCase();
                const fDate = (document.getElementById('fltLastDate')?.value || '').trim().toUpperCase();
                const fPerson = (document.getElementById('fltLastPerson')?.value || '').trim().toUpperCase();
                const fGeneral = (document.getElementById('fltMappingGeneral')?.value || '').trim().toUpperCase();
                const onlyPending = document.getElementById('chkOnlyPending')?.checked;

                const keys = new Set();
                const combos = [];
                const emps = (app && app.employees) ? app.employees : [];
                const currentOverrides = getSavedMappings();

                const sPa = new Set(), sEmp = new Set(), sPos = new Set(), sDir = new Set(), sDep = new Set();
                const normalizeCountry = (c) => typeof normalizePa === 'function' ? normalizePa(c) : c.toUpperCase().trim();

                // 0. Pre-calcular ocupantes y   vez
                const posMeta = new Map(); // key -> { score, year, month, names: Set }
                const allSourceData = [...emps, ...(app && app.bajas_list ? app.bajas_list : [])];
                
                allSourceData.forEach(e => {
                    const pNorm = (e.p || e.position || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
                    const paNorm = normalizePa(e.pa || '');
                    const empNorm = (e.e || '').toUpperCase().trim();
                    const key = `${pNorm}|${paNorm}|${empNorm}`;
                    
                    const year = parseInt(e.y) || 0;
                    const month = parseInt(normalizeMonth(e.m)) || 0;
                    const score = year * 100 + month;

                    if (!posMeta.has(key)) {
                        posMeta.set(key, { score, year, month, names: new Set() });
                    }
                    const m = posMeta.get(key);
                    m.names.add(e.n || e.nombre || 'Desconocido');
                    if (score > m.score) {
                        m.score = score;
                        m.year = year;
                        m.month = month;
                    }
                });

                // Helper to check if mapping is bad/pending
                const isBad = v => !v || v === '0' || v === 'SIN DEPTO' || v === 'nan' || v === 'N/A' || v === 'PENDIENTE' || v === 'OTRO';

                // 1. Logic to collect combos
                const processEntry = (p_raw, paRaw, empRaw, d_raw, dep_raw, isManual = false) => {
                    const p = (p_raw || ' ').toString();
                    const pa = normalizePa(paRaw || ' ');
                    const emp = (empRaw || ' ').toString().toUpperCase().trim();
                    const normP = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
                    const d = (d_raw || ' ').toString();
                    const dep = (dep_raw || ' ').toString();
                    const key = `${normP}|${pa}|${emp}`;

                    if (keys.has(key)) return;
                    keys.add(key);

                    if (pa) sPa.add(pa);
                    if (emp !== ' ') sEmp.add(emp);
                    if (p_raw) sPos.add(p);
                    sDir.add(d); sDep.add(dep);

                    // Check overrides
                    const pen = window.pendingOverrides[key] || currentOverrides[key];
                    const finalDir = (pen ? (pen.dir || d) : d);
                    const finalDep = (pen ? (pen.depto || pen.d || dep) : dep);

                    // Apply filters
                    const meta = posMeta.get(key);
                    const mnames = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                    const lastDateTxt = (meta ? `${mnames[meta.month] || meta.month} ${meta.year}` : '---');
                    const lastPersonTxt = (meta ? Array.from(meta.names).sort().join(', ') : '-');
                    const primaryName = meta ? Array.from(meta.names)[0] : '-';
                    const occupantCount = meta ? meta.names.size : 0;

                    const passGeneral = !fGeneral || [normP, pa, emp, finalDir.toUpperCase(), finalDep.toUpperCase(), lastPersonTxt.toUpperCase()].some(s => s.includes(fGeneral));
                    const passAudit = !onlyPending || (isBad(finalDir) || isBad(finalDep));
                    
                    const passTable = 
                        (!fPa || pa.includes(fPa)) &&
                        (!fEmp || emp.includes(fEmp)) &&
                        (!fPos || normP.includes(fPos)) &&
                        (!fDir || finalDir.toUpperCase().includes(fDir)) &&
                        (!fDep || finalDep.toUpperCase().includes(fDep));

                    const passDateShortcut = !fDate || (
                        (fDate === '> 3M' && meta && (new Date().getFullYear() * 12 + new Date().getMonth() - (meta.year * 12 + meta.month) > 3)) ||
                        (fDate === '> 1Y' && meta && (new Date().getFullYear() * 12 + new Date().getMonth() - (meta.year * 12 + meta.month) > 12)) ||
                        lastDateTxt.toUpperCase().includes(fDate)
                    );
                    const passPerson = !fPerson || lastPersonTxt.toUpperCase().includes(fPerson);

                    if (passGeneral && passAudit && passTable && passDateShortcut && passPerson) {
                        combos.push({
                            p: p.toUpperCase(), pa, emp, key, 
                            dir: finalDir, depto: finalDep, 
                            lastDateTxt, lastPersonTxt, primaryName, occupantCount,
                            isManual: isManual || !!pen,
                            isPending: !!window.pendingOverrides[key]
                        });
                    }
                };

                // Load positions
                if (window.POSITION_MASTER) {
                    window.POSITION_MASTER.forEach(m => {
                        const p = (m[Object.keys(m).find(k => k.indexOf("POSICI") !== -1) || "POSICIÓN (PLANILLA)"] || '').toString().trim();
                        const autoM = typeof getAutoMapping === 'function' ? getAutoMapping(p) : { dir: 'BI & OPERACIONES', d: 'OPERACIONES' };
                        processEntry(p, m[Object.keys(m).find(k => k.indexOf("PA") !== -1) || "PAÍS"] || ' ', m["EMPRESA"] || ' ', m[Object.keys(m).find(k => k.indexOf("DIREC") !== -1) || "DIRECCIÓN"]||autoM.dir, m[Object.keys(m).find(k => k.indexOf("DEPAR") !== -1) || "DEPARTAMENTO"]||autoM.d);
                    });
                }
                allSourceData.forEach(e => {
                    const p = (e.p || e.position || '').toString().trim();
                    const auto = typeof getAutoMapping === 'function' ? getAutoMapping(p) : { dir: 'BI & OPERACIONES', d: 'OPERACIONES' };
                    processEntry(p, e.pa || ' ', e.e || ' ', e.dir||auto.dir, e.d||auto.d);
                });
                for (const k in currentOverrides) {
                    const parts = k.split('|');
                    processEntry(parts[0], parts[1], parts[2], currentOverrides[k].dir, currentOverrides[k].depto || currentOverrides[k].d, true);
                }

                // Sorting
                combos.sort((a,b) => a.p.localeCompare(b.p) || a.pa.localeCompare(b.pa));
                window._CURRENT_LEVELS_FOR_EXPORT = combos;

                // Render Datalists
                const updateDL = (id, set) => {
                    const dl = document.getElementById(id); if (!dl) return;
                    dl.innerHTML = Array.from(set).sort().map(v => `<option value="${v}">`).join('');
                };
                updateDL('listPa', sPa); updateDL('listEmp', sEmp); updateDL('listPos', sPos); updateDL('listDir', sDir); updateDL('listDep', sDep);

                // Check sync button
                const hasPendingGlobal = Object.keys(window.pendingOverrides).length > 0;
                const discardBtn = document.getElementById('btnDiscardChanges');
                if (discardBtn) discardBtn.style.display = hasPendingGlobal ? 'flex' : 'none';

                // Render Rows
                tbody.innerHTML = combos.map((c, i) => {
                    const badDir = isBad(c.dir);
                    const badDepto = isBad(c.depto);
                    const rowAnim = `animation: slideRight 0.4s ease-out forwards; animation-delay: ${Math.min(i * 0.005, 0.4)}s; opacity: 0;`;
                    
                    const dirStyle = c.isPending ? 'border: 2px dashed #f59e0b; background: rgba(245,158,11,0.05);' : `background:${badDir ? '#fff1f2' : '#f8fafc'}; border:1.5px solid ${badDir ? '#fecaca' : '#e2e8f0'};`;
                    const deptoStyle = c.isPending ? 'border: 2px dashed var(--ac); background: rgba(99,102,241,0.05);' : `background:${badDepto ? '#fff1f2' : '#f8fafc'}; border:1.5px solid ${badDepto ? '#fecaca' : '#e2e8f0'};`;
                    
                    const persDisplay = c.occupantCount > 1 
                        ? `<span style="border-bottom: 1px dashed var(--ac); cursor: help;" title="${c.lastPersonTxt}">${c.primaryName} <b style="color:var(--ac)">+${c.occupantCount - 1} mas</b></span>`
                        : c.primaryName;

                    return `
                        <tr style="${rowAnim}" class="mapping-row" onmouseover="this.style.background='rgba(99,102,241,0.04)';" onmouseout="this.style.background='transparent';">
                            <td style="padding:10px; text-align:center;"><input type="checkbox" class="row-chk" data-key="${c.key}" ${window.selectedMappingKeys.has(c.key)?'checked':''} onclick="toggleMappingRow('${c.key}', this)"></td>
                            <td style="padding:8px 10px;"><div style="background:rgba(71, 85, 105, 0.06); color:#475569; padding:4px 10px; border-radius:8px; font-size:10px; font-weight:900; display:inline-block; border:1px solid rgba(71, 85, 105, 0.08);">${c.pa}</div></td>
                            <td style="padding:8px 10px;"><div style="color:#1e293b; font-size:10px; font-weight:700; opacity:0.8;">${c.emp}</div></td>
                            <td style="padding:8px 10px;"><div style="font-size:10px; font-weight:900; color:#1e1b4b; text-transform:uppercase; line-height:1.2;">${c.p} ${(c.isManual) ? '<i class="fas fa-hand-paper" style="color:#f59e0b; font-size:9px; margin-left:4px;"></i>' : ''}</div></td>
                            <td style="padding:8px 10px;"><div style="font-size:10px; font-weight:800; color:#64748b;">${c.lastDateTxt}</div></td>
                            <td style="padding:8px 10px;"><div style="font-size:9px; font-weight:600; color:var(--ac); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${persDisplay}</div></td>
                            <td style="padding:8px 10px; min-width:200px;"><div onclick="inlineEditMapping(this, '${c.key}', 'dir', '${c.dir}')" style="${dirStyle} border-radius:14px; padding:8px 15px; font-size:10px; font-weight:800; color:${badDir ? '#e11d48' : '#1e1b4b'}; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><span>${c.dir}</span><i class="fas fa-chevron-down" style="opacity:0.3; font-size:8px;"></i></div></td>
                            <td style="padding:8px 10px; min-width:200px;"><div onclick="inlineEditMapping(this, '${c.key}', 'depto', '${c.depto}')" style="${deptoStyle} border-radius:14px; padding:8px 15px; font-size:10px; font-weight:800; color:${badDepto ? '#e11d48' : '#1e1b4b'}; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><span>${c.depto}</span><i class="fas fa-chevron-down" style="opacity:0.3; font-size:8px;"></i></div></td>
                            <td style="padding:8px 10px; text-align:right;">${(c.isManual) ? `<button onclick="deleteOverrideMapping('${c.key}')" style="background:transparent; border:none; color:#f43f5e; cursor:pointer;" title="Eliminar ajuste"><i class="fas fa-trash-alt"></i></button>` : ''}</td>
                        </tr>
                    `;
                }).join('');

                const badCount = combos.filter(c => isBad(c.dir) || isBad(c.depto)).length;
                const totalCount = combos.length;
                const mappedCount = totalCount - badCount;
                const pct = totalCount > 0 ? Math.round((mappedCount / totalCount) * 100) : 100;

                const healthEl = document.getElementById('mappingHealthBar');
                if (healthEl) {
                    healthEl.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
                            <div>
                                <span style="font-size:11px; font-weight:900; color:#64748b; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;">Salud de la Clasificación</span>
                                <h2 style="font-size:24px; font-weight:1000; color:${pct===100?'#10b981':'#1e293b'}; margin:0; letter-spacing:-0.5px;">${pct}% de Cobertura</h2>
                            </div>
                            <div style="text-align:right;">
                                <span style="background:${badCount>0?'#fee2e2':'#dcfce3'}; color:${badCount>0?'#ef4444':'#10b981'}; padding:6px 14px; border-radius:12px; border:1px solid ${badCount>0?'#fecaca':'#bbf7d0'}; font-size:11px; font-weight:900;">
                                    <i class="fas fa-${badCount>0?'bolt':'check-double'}"></i> ${badCount > 0 ? badCount + ' PUESTOS PENDIENTES' : '100% MAPEADO'}
                                </span>
                            </div>
                        </div>
                        <div style="height:12px; background:#f1f5f9; border-radius:100px; overflow:hidden; border:1px solid rgba(0,0,0,0.05); position:relative;">
                            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, ${pct < 100 ? '#f59e0b' : '#10b981'}, #10b981); transition:width 1s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 0 15px ${pct < 100 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}"></div>
                        </div>
                    `;
                }

                // Global Alert
                const alertEl = document.getElementById('globalOrphanAlert');
                if (alertEl) alertEl.style.display = badCount > 0 ? 'flex' : 'none';
            }

            function trackMappingChange(key, data, field) {
                if (!window.pendingOverrides) window.pendingOverrides = {};
                const current = window.pendingOverrides[key] || {};
                if (field === 'bulk') {
                    window.pendingOverrides[key] = { ...current, ...data };
                } else {
                    window.pendingOverrides[key] = { ...current, [field]: data.value };
                }
                const btn = document.getElementById('btnSyncMappings');
                if (btn) btn.classList.add('btn-pulse');
                renderMappings();
            }

            function inlineEditMapping(container, key, field, currentVal) {
                if (container.querySelector('select')) return;
                const opts = field === 'dir' ? (window.ASYS_DIRECCIONES || []) : (window.ASYS_DEPARTAMENTOS || []);
                let html = `<select style="width:100%; border:none; background:transparent; font-size:11px; font-weight:800; color:#1e293b; outline:none; padding:0; cursor:pointer;">`;
                html += opts.map(o => `<option value="${o}" ${o === currentVal ? 'selected' : ''}>${o}</option>`).join('');
                html += `</select>`;
                container.innerHTML = html;
                const sel = container.querySelector('select');
                sel.focus();

                const finalizeEdit = () => {
                    const newVal = sel.value;
                    trackMappingChange(key, { value: newVal }, field);
                    container.style.background = field === 'dir' ? 'rgba(245,158,11,0.05)' : 'rgba(99,102,241,0.05)';
                    container.style.borderColor = field === 'dir' ? '#f59e0b' : '#8b5cf6';
                    container.innerHTML = `<span>${newVal}</span><i class="fas fa-chevron-down" style="font-size:9px; opacity:0.3;"></i>`;
                };

                sel.onblur = finalizeEdit;
                sel.onchange = finalizeEdit;
            }

            function deleteOverrideMapping(key) {
                Swal.fire({
                    title: '  ajuste?',
                    text: 'Se restablecer  la Clasificación original para este puesto.',
                    icon: 'question',
                    showCancelButton: true
                }).then(r => {
                    if (r.isConfirmed) {
                        const current = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
                        delete current[key];
                        if (window.pendingOverrides[key]) delete window.pendingOverrides[key];
                        localStorage.setItem('asys_pos_overrides', JSON.stringify(current));
                        renderMappings();
                        renderAll();
                    }
                });
            }

            function fullResetMappings() {
                Swal.fire({
                    title: '  Todo?',
                    text: 'Se borrar  los filtros de b  Y todas las personalizaciones guardadas en este navegador.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, resetear todo',
                    cancelButtonText: 'Solo filtros'
                }).then(r => {
                    if (r.isConfirmed) {
                        localStorage.removeItem('asys_pos_overrides');
                        if (window.initFilters) window.initFilters();
                        clearMappingFilters();
                        Swal.fire(' ', 'Memoria limpiada. Recalculando...', 'success');
                    } else if (r.dismiss === Swal.DismissReason.cancel) {
                        clearMappingFilters();
                    }
                });
            }

            function repairPendingMappings() {
                const current = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
                let repaired = 0;
                
                // 1. Recolectar TODOS los casos "PENDIENTE" de los datos en memoria
                const pendingCombos = new Set();
                const allData = [...(app.employees || []), ...(app.bajas_list || []), ...(app.incidencias || [])];
                
                allData.forEach(e => {
                    if (e.dir === 'PENDIENTE' || e.d === 'PENDIENTE') {
                        const p = (e.p || e.position || 'PENDIENTE').trim();
                        const pa = (e.pa || ' ').trim();
                        const e_name = (e.e || ' ').trim();
                        pendingCombos.add(`${p}|${pa}|${e_name}`);
                    }
                });

                // 2. Intentar reparar cada combo  
                pendingCombos.forEach(key => {
                    const parts = key.split('|');
                    const tempObj = { p: parts[0], pa: parts[1], e: parts[2] };
                    
                    // Forzamos el mapeo sin usar overrides (para ver si el Maestro o la L  lo agarran)
                    mapSingleRecord(tempObj, {}); 
                    
                    if (tempObj.dir !== 'PENDIENTE' || tempObj.d !== 'PENDIENTE') {
                        // Lo agregamos a los overrides permanentes
                        current[key] = { dir: tempObj.dir, depto: tempObj.d };
                        repaired++;
                    }
                });

                if (repaired > 0) {
                    localStorage.setItem('asys_pos_overrides', JSON.stringify(current));
                    Swal.fire(' ', `He reparado ${repaired} combinaciones que estaban como PENDIENTE.`, 'success');
                    renderMappings();
                    renderAll();
                } else {
                    Swal.fire('Info', `No se encontraron combinaciones adicionales para reparar. Puedes usar el bot  REPARAR en la barra de filtros para clasificar pendientes autom `, 'info');
                }
            }

            function clearMappingFilters() {
                ['fltPa', 'fltEmp', 'fltPos', 'fltDir', 'fltDep'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                renderMappings();
            }

            window._tcRenderTimeout = window._tcRenderTimeout || null;
            function debouncedRenderMappings() {
                clearTimeout(window._tcRenderTimeout);
                window._tcRenderTimeout = setTimeout(renderMappings, 250);
            }

            function exportMappings() {
                const combos = window._CURRENT_LEVELS_FOR_EXPORT || [];
                if (combos.length === 0) return Swal.fire('Error', 'No hay datos para exportar. Asegúrese de que la tabla esté cargada.', 'error');
                
                const rows = combos.map(c => ({
                    'Pais': c.pa,
                    'EMPRESA': c.emp,
                    'PUESTO_EN_NÓMINA': c.p,
                    'ARQUITECTURA_DIRECCION': c.dir,
                    'ESTRUCTURA_DEPARTAMENTO': c.depto
                }));

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Mapeo Maestros');
                XLSX.writeFile(wb, `ASYS_Mapeo_Puestos_FULL_${new Date().toISOString().slice(0, 10)}.xlsx`);
                Swal.fire({ icon: 'success', title: 'Excel Exportado Correctamente (Todo lo visible)', showConfirmButton: true });
            }

            function addManualPos() {
                Swal.fire({
                    title: 'Nuevo Puesto Manual',
                    html: `
                        <input id="n_pa" placeholder="Pais (p.ej. GT)" class="swal2-input">
                        <input id="n_emp" placeholder="Empresa (p.ej. ASYS)" class="swal2-input">
                        <input id="n_pos" placeholder="Nombre del Puesto" class="swal2-input">
                    `,
                    showCancelButton: true,
                    preConfirm: () => {
                        const pa = document.getElementById('n_pa').value.toUpperCase().trim();
                        const emp = document.getElementById('n_emp').value.toUpperCase().trim();
                        const pos = document.getElementById('n_pos').value.trim();
                        if (!pa || !emp || !pos) return Swal.showValidationMessage('Faltan campos');
                        return { pa, emp, pos };
                    }
                }).then(r => {
                    if (r.isConfirmed) {
                        const key = `${r.value.pos}|${r.value.pa}|${r.value.emp}`;
                        const current = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
                        current[key] = { dir: 'OTRO', depto: 'OTRO' };
                        localStorage.setItem('asys_pos_overrides', JSON.stringify(current));
                        renderMappings();
                        Swal.fire(' ', 'Ya puedes clasificarlo en la tabla.', 'success');
                    }
                });
            }

            window.pendingOverrides = window.pendingOverrides || {};
            function trackMappingChange(key, el, field) {
                if (!window.pendingOverrides[key]) {
                    const current = getSavedMappings();
                    window.pendingOverrides[key] = current[key] || {};
                }
                window.pendingOverrides[key][field] = el.value.toUpperCase();
                renderMappings(); // Real-time feedback
            }

            function discardPendingChanges() {
                if (Object.keys(window.pendingOverrides).length === 0) return;
                Swal.fire({
                    title: '  cambios?',
                    text: 'Se perder  las ediciones que no hayas sincronizado a ',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, borrar',
                    cancelButtonText: 'No, mantener'
                }).then(r => {
                    if (r.isConfirmed) {
                        window.pendingOverrides = {};
                        renderMappings();
                        Swal.fire('Borrados', 'Tus cambios temporales han sido eliminados.', 'success');
                    }
                });
            }

            function saveMappings() {
                if (Object.keys(window.pendingOverrides).length === 0) {
                    return Swal.fire('Sin cambios', 'No hay nada nuevo que sincronizar.', 'info');
                }

                const current = getSavedMappings();
                Object.assign(current, window.pendingOverrides);
                localStorage.setItem('asys_pos_overrides', JSON.stringify(current));

                window.pendingOverrides = {};

                // CRITICAL: Force cache flush and re-mapping
                Swal.fire({
                    title: 'Sincronizando...',
                    html: 'Actualizando arquitectura y recalculando gr ',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                window.app.employeesWithOverrides = null;
                lastFilterKey = "";

                setTimeout(() => {
                    console.log("Forcing sync with overrides:", current);
                    if (window.performGlobalMapping) window.performGlobalMapping();
                    if (window.initFilters) window.initFilters();
                    renderMappings();
                    renderAll();
                    Swal.fire({
                        title: ' ',
                        text: 'La arquitectura ha sido actualizada y los filtros refrescados.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }, 500);
            }

            function importMappingsFromExcel(input) {
                const file = input.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const json = XLSX.utils.sheet_to_json(sheet);
                        const current = getSavedMappings();
                        let imported = 0;

                        json.forEach(row => {
                            const find = (arr) => {
                                for (let k in row) { if (arr.includes(k.toUpperCase().trim())) return row[k]; }
                                return null;
                            };
                            const p = find(['PUESTO', 'POSITION', 'NOMBRE']);
                            const pa = find(['Pais', 'PAIS', 'COUNTRY', 'REGION']);
                            const emp = find(['EMPRESA', 'COMPANY', 'ENTITY']);
                            const dir = find(['Direccion', 'DIRECCION', 'area']);
                            const dep = find(['DEPARTAMENTO', 'DEPTO', 'DEPARTMENT']);

                            if (p && pa && emp) {
                                const key = `${p}|${String(pa).toUpperCase().trimastring(emp).toUpperCase().trim()}`;
                                current[key] = { dir: (dir || 'OTRO').toString().toUpperCase().trim(), depto: (dep || 'OTRO').toString().toUpperCase().trim() };
                                imported++;
                            }
                        });

                        localStorage.setItem('asys_pos_overrides', JSON.stringify(current));
                        renderMappings();
                        renderAll();
                        Swal.fire(' ', `Sincronizados ${imported} puestos.`, 'success');
                    } catch (err) { Swal.fire('Error', 'Archivo inv ', 'error'); }
                };
                reader.readAsArrayBuffer(file);
                input.value = "";
            }

            function renderDatos() {
                const container = document.getElementById('datosTabContainer');
                if (!container) return;

                container.innerHTML = `
                        <div style="max-width: 900px; margin: 0 auto; width: 100%;">

                    <!-- SECTION: VISUAL IDENTITY -->
                    <div style="margin-bottom: 35px;">
                        <h4 style="font-size: 11px; font-weight: 800; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-left: 10px;">Identidad Visual</h4>
                        <div class="card-box" style="padding: 0; overflow: hidden; border-radius: 20px;">
                            <div id="uiSettingsVisual"></div>
                        </div>
                    </div>

                    <!--SECTION: UX & STRUCTURE-->
                    <div style="margin-bottom: 35px;">
                        <h4 style="font-size: 11px; font-weight: 800; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-left: 10px;">Estructura y Experiencia</h4>
                        <div class="card-box" style="padding: 0; overflow: hidden; border-radius: 20px;">
                            <div id="uiSettingsUX"></div>
                        </div>
                    </div>

                    <!--SECTION: MAP CALIBRATION(CRITICAL FIX)-->
                    <div style="margin-bottom: 35px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; padding: 0 10px;">
                            <h4 style="font-size: 11px; font-weight: 800; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; margin:0;">Calibraci  de Mapa</h4>
                            <span style="font-size:10px; color:#f59e0b; font-weight:700;"><i class="fas fa-magic"></i> Calibraci  Activa</span>
                        </div>
                        <div class="card-box" style="padding: 25px; border-radius: 20px;">
                            <p style="font-size:12px; color:var(--mu); margin-bottom:20px;">Si los n  del maPaise ven desalineados en tu pantalla, selecci  aqu  y aj  p  por p </p>
                            <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap;">
                                <div style="flex:1; min-width:150px;">
                                    <label style="font-size:10px; font-weight:800; color:var(--tx); display:block; margin-bottom:6px;">Pais A CALIBRAR</label>
                                    <select id="cal_country" style="width:100%; padding:10px; border-radius:12px; border:1px solid #e2e8f0; font-family:var(--ff); font-weight:700;">
                                        ${Object.keys(paisMap).map(c => `<option value="${c}">${paisMap[c]}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn-top" onclick="adjustCal('x', -1)" style="width:45px; background:#f1f5f9; color:var(--tx);"><i class="fas fa-chevron-left"></i></button>
                                    <button class="btn-top" onclick="adjustCal('x', 1)" style="width:45px; background:#f1f5f9; color:var(--tx);"><i class="fas fa-chevron-right"></i></button>
                                    <div style="width:1px; height:40px; background:#e2e8f0;"></div>
                                    <button class="btn-top" onclick="adjustCal('y', -1)" style="width:45px; background:#f1f5f9; color:var(--tx);"><i class="fas fa-chevron-up"></i></button>
                                    <button class="btn-top" onclick="adjustCal('y', 1)" style="width:45px; background:#f1f5f9; color:var(--tx);"><i class="fas fa-chevron-down"></i></button>
                                </div>
                                <button class="btn-top" onclick="resetCal()" style="background:#fee2e2; color:#ef4444; border:none;"><i class="fas fa-undo"></i> Reset</button>
                            </div>
                            <div id="calDisp" style="margin-top:15px; font-size:11px; font-weight:700; color:var(--ac); text-align:center; height:15px;"></div>
                        </div>
                    </div>

                    <!--SECTION: DATA MANAGEMENT-->
                        <div style="margin-bottom: 50px;">
                            <h4 style="font-size: 11px; font-weight: 800; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-left: 10px;">Gestión de Datos Maestros</h4>
                            <div class="card-box" style="padding: 25px; border-radius: 20px;">
                                <div id="dataOverridePanel"></div>
                            </div>
                        </div>
                </div>
                        `;

                initLiteralSettings();
                initDataOverrides();
            }

            function adjustCal(axis, delta) {
                const country = document.getElementById('cal_country').value;
                const key = `asys_map_cal_${country} `;
                const current = JSON.parse(localStorage.getItem(key) || '{"x":0, "y":0}');

                current[axis] += delta;
                localStorage.setItem(key, JSON.stringify(current));

                document.getElementById('calDisp').innerText = `Ajuste para ${paisMap[country]}: X = ${current.x} px, Y = ${current.y} px`;

                // Re-render map only
                if (typeof drawMap === 'function') drawMap();
            }

            function resetCal() {
                const country = document.getElementById('cal_country').value;
                localStorage.removeItem(`asys_map_cal_${country} `);
                document.getElementById('calDisp').innerText = `Reset completado para ${paisMap[country]} `;
                if (typeof drawMap === 'function') drawMap();
            }

            function updateUIProp(id, val) {
                console.log("Updating UI Prop:", id, val);
                const root = document.documentElement;
                if (id === 'prop_ac') {
                    root.style.setProperty('--ac', val);
                    // Also update ac-dark and ac-light if possible
                    root.style.setProperty('--ac-light', val + '15');
                }
                if (id === 'prop_radius') {
                    root.style.setProperty('--radius', val + 'px');
                }
                // Save to localstorage for persistence
                const current = JSON.parse(localStorage.getItem('asys_ui_custom') || '{}');
                current[id] = val;
                localStorage.setItem('asys_ui_custom', JSON.stringify(current));
            }

            function initDataOverrides() {
                const panel = document.getElementById('dataOverridePanel');
                if (!panel) return;

                panel.innerHTML = `
                        <p style="font-size: 11px; color: var(--mu); margin-bottom: 20px; line-height: 1.5;"> Modifica manualmente el Headcount, Altas o Bajas para cualquier Pais y periodo.Estos valores tendrán prioridad sobre los datos extraídos</p>
                <button class="btn-top" style="width:100%; height: 48px; display: flex; align-items:center; justify-content:center; gap: 10px; background: linear-gradient(135deg, #f59e0b, #fbbf24);" onclick="openOverrideModal()">
                    <i class="fas fa-plus-circle"></i> NUEVO AJUSTE MANUAL
                </button>
                <div id="overridesListContainer" style="margin-top: 20px;"></div>
                    `;
                refreshOverrideList();
            }

            // Added stub to prevent ReferenceError
            function initLiteralSettings() {
                // Noâ€‘op placeholder – extend as needed for UI defaults
                console.log('initLiteralSettings called');
            }

            function openOverrideModal() {
                const modalId = 'overrideModalContainer';
                let modal = document.getElementById(modalId);
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = modalId;
                    modal.className = 'modal-backdrop';
                    modal.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center;";
                    document.body.appendChild(modal);
                }

                const countries = Object.keys(paisMap).map(c => `<option value = "${c}"> ${paisMap[c]}</option> `).join('');
                const companies = [...new Set(app.employees.map(e => e.e))].map(c => `<option value = "${c}"> ${c}</option> `).join('');
                const years = [2024, 2025, 2026].map(y => `<option value = "${y}" ${y == 2026 ? 'selected' : ''}> ${y}</option> `).join('');
                const months = monthNames.filter(m => m).map((m, i) => `<option value = "${i + 1}"> ${m}</option> `).join('');

                modal.innerHTML = `
                        <div class="card-box" style="width: 450px; padding: 30px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); background:#fff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                        <h2 style="font-size:20px; font-weight:900; color:var(--tx);"><i class="fas fa-edit" style="color:#f59e0b; margin-right:10px;"></i> Ajuste Manual</h2>
                        <button onclick="document.getElementById('overrideModalContainer').style.display='none'" style="background:none; border:none; color:var(--mu); cursor:pointer; font-size:18px;"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                        <div>
                            <label style="font-size:10px; font-weight:800; color:var(--mu); display:block; margin-bottom:6px;">Pais</label>
                            <select id="ovr_pa" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">${countries}</select>
                        </div>
                        <div>
                            <label style="font-size:10px; font-weight:800; color:var(--mu); display:block; margin-bottom:6px;">EMPRESA</label>
                            <select id="ovr_emp" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;"><option value="ALL">Todas</option>${companies}</select>
                        </div>
                        <div>
                            <label style="font-size:10px; font-weight:800; color:var(--mu); display:block; margin-bottom:6px;">AÑO</label>
                            <select id="ovr_y" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">${years}</select>
                        </div>
                        <div>
                            <label style="font-size:10px; font-weight:800; color:var(--mu); display:block; margin-bottom:6px;">MES</label>
                            <select id="ovr_m" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">${months}</select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:25px;">
                        <label style="font-size:10px; font-weight:800; color:var(--mu); display:block; margin-bottom:12px; border-bottom: 2px solid #f1f5f9; padding-bottom:5px;">VALORRES A FORZAR</label>
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                            <div>
                                <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">HEADCOUNT</label>
                                <input type="number" id="ovr_hc" placeholder="HC" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                            </div>
                            <div>
                                <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">ALTAS</label>
                                <input type="number" id="ovr_altas" placeholder="Altas" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                            </div>
                            <div>
                                <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">BAJAS</label>
                                <input type="number" id="ovr_bajas" placeholder="Bajas" style="width:100%; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-top" style="width:100%; height:50px; font-size:14px; background:var(--ac);" onclick="saveOverride()">
                        <i class="fas fa-save" style="margin-right:8px;"></i> GUARDAR CAMBIOS
                    </button>
                    <p style="text-align:center; font-size:10px; color:var(--mu); margin-top:15px;"><i class="fas fa-info-circle"></i> Esto reiniciar  el dashboard para aplicar los cambios.</p>
                </div>
                        `;
                modal.style.display = 'flex';
            }

            function saveOverride() {
                const pa = document.getElementById('ovr_pa').value;
                const emp = document.getElementById('ovr_emp').value;
                const y = document.getElementById('ovr_y').value;
                const m = document.getElementById('ovr_m').value;

                const hc = document.getElementById('ovr_hc').value;
                const altas = document.getElementById('ovr_altas').value;
                const bajas = document.getElementById('ovr_bajas').value;

                const key = `${pa}_${emp}_${y}_${m} `;
                const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');

                overrides[key] = {
                    pa, emp, y, m,
                    hc: hc !== "" ? parseInt(hc) : null,
                    altas: altas !== "" ? parseInt(altas) : null,
                    bajas: bajas !== "" ? parseInt(bajas) : null,
                };

                localStorage.setItem('asys_data_overrides', JSON.stringify(overrides));
                document.getElementById('overrideModalContainer').style.display = 'none';

                // Reload fully or re-render
                location.reload();
            }

            function refreshOverrideList() {
                const container = document.getElementById('overridesListContainer');
                const historyPanel = document.getElementById('historyPanel');
                if (!container) return;

                const overrides = JSON.parse(localStorage.getItem('asys_data_overrides') || '{}');
                const keys = Object.keys(overrides);

                if (keys.length === 0) {
                    container.innerHTML = `<div style="padding: 20px; text-align:center; color: var(--mu); font-size:12px; border: 1px dashed #e2e8f0; border-radius: 12px;"> No hay ajustes manuales activos.</div> `;
                    return;
                }

                let html = `<div style="display:flex; flex-direction:column; gap:10px;"> `;
                let historyHtml = `<table style="width:100%; border-collapse:collapse;"><thead><tr style="text-align:left; border-bottom:1px solid #f1f5f9;"><th style="padding:10px; font-size:10px;">ID / FECHA</th><th style="padding:10px; font-size:10px;">AJUSTE</th><th style="padding:10px; font-size:10px;">ACCI </th></tr></thead><tbody>`;

                keys.sort((a, b) => new Date(overrides[b].ts) - new Date(overrides[a].ts)).forEach(k => {
                    const o = overrides[k];
                    const dateStr = new Date(o.ts).toLocaleString();
                    html += `
                    <div style="background:#f8fafc; border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid #f1f5f9;">
                        <div>
                            <div style="font-size:11px; font-weight:900; color:var(--tx);">${paisMap[o.pa] || o.pa} | ${o.y}-${o.m} (${o.emp === 'ALL' ? 'Todas' : o.emp})</div>
                            <div style="font-size:10px; color:var(--mu);">HC: ${o.hc ?? '-'} | Altas: ${o.altas ?? '-'} | Bajas: ${o.bajas ?? '-'}</div>
                        </div>
                        <button onclick="deleteOverride('${k}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                    historyHtml += `<tr><td style="padding:10px;">${k}<br><small>${dateStr}</small></td><td style="padding:10px;">HC:${o.hc ?? 'N/A'}, A:${o.altas ?? 'N/A'}, B:${o.bajas ?? 'N/A'}</td><td style="padding:10px;"><button onclick="deleteOverride('${k}')" style="color:#ef4444; border:none; background:none; cursor:pointer;">Borrar</button></td></tr>`;
                });

                html += `</div>`;
                historyHtml += `</tbody></table> `;
                container.innerHTML = html;
                if (historyPanel) historyPanel.innerHTML = historyHtml;
            }

            function getHCExportRows() {
                const { p, e, a, d, y, m, countries } = getFilters();
                const emps = window.app.employees || [];
                const bajas = window.app.bajas_list || [];
                const isNeto = (window._hcType || 'neto') === 'neto';
                const matchBase = (x) => {
                    const pa = normalizePa(x.pa);
                    return (countries.length === 0 || countries.includes(pa)) &&
                        (e === 'ALL' || x.e === e) &&
                        (a === 'ALL' || (x.dir || x.area) === a) &&
                        (d === 'ALL' || (x.d || x.depto) === d);
                };
                const matchBaja = (b, by, bm) => {
                    if (!b) return false;
                    const curPa = b._pa || normalizePa(b.pa);
                    const bajaY = b._y || b.y;
                    const bajaM = b._m || b.m;
                    return (countries.length === 0 || countries.includes(curPa)) &&
                        (e === 'ALL' || b.e === e) &&
                        (a === 'ALL' || (b.dir || b.area) === a) &&
                        (d === 'ALL' || (b.d || b.depto) === d) &&
                        compareYear(bajaY, by) &&
                        compareMonth(bajaM, bm);
                };

                let targetY = y;
                let targetM = m;
                if (targetY === 'ALL') {
                    emps.forEach(x => {
                        if (!matchBase(x)) return;
                        if (targetY === 'ALL' || parseInt(x.y) > parseInt(targetY) || (parseInt(x.y) === parseInt(targetY) && parseInt(x.m) > parseInt(targetM || 0))) {
                            targetY = x.y;
                            targetM = x.m;
                        }
                    });
                }
                if (targetY === 'ALL' && (targetM === 'ALL' || targetM === '0')) {
                    let lastM = 0;
                    emps.forEach(x => {
                        if (!matchBase(x) || x.y != targetY) return;
                        const xm = parseInt(x.m);
                        if (xm > lastM) lastM = xm;
                    });
                    targetM = lastM || targetM;
                }

                const isYearOnlyExport = targetY !== 'ALL' && (targetM === 'ALL' || targetM === '0');
                const periodRows = emps.filter(x => matchBase(x) && x.y == targetY && (isYearOnlyExport || x.m == targetM));
                const uniqueMap = new Map();
                periodRows.forEach(x => {
                    const key = hcSnapshotKey(x);
                    if (key && !uniqueMap.has(key)) uniqueMap.set(key, x);
                });

                const bajaSet = new Set(
                    bajas
                        .filter(b => isYearOnlyExport
                            ? matchBase({ ...b, pa: b.pa, e: b.e, dir: b.dir || b.area, d: b.d || b.depto }) && compareYear(b.y, targetY)
                            : matchBaja(b, targetY, targetM)
                        )
                        .map(b => (b.c || b.n || '').toString().trim())
                );

                const rows = Array.from(uniqueMap.values()).filter(x => {
                    const key = (x.c || x.n || '').toString().trim();
                    return !isNeto || !bajaSet.has(key);
                });

                return rows.map(x => ({
                    ...x,
                    _hc_export_tipo: isNeto ? 'HC NETO' : 'HC BRUTO',
                    _hc_export_y: targetY,
                    _hc_export_m: targetM
                }));
            }


            function exportKpiData(type, event) {
                if (event) event.stopPropagation();
                const { p, e, a, d, y, m, countries } = getFilters();
                const emps = window.app.employees || [];
                const bajas = window.app.bajas_list || [];

                let dataToExport = [];
                const isBajas = type === 'bajas';
                const isHires = type === 'hires';
                const isActiveHC = type === 'hc' || type === 'active';
                const isGrowth = type === 'growth';
                const isCountries = type === 'countries';

                const findEmp = (id) => emps.find(x => (x.c && x.c == id) || (x.n && x.n == id));

                if (isActiveHC) {
                    dataToExport = getHCExportRows();
                } else if (isHires) {
                    dataToExport = emps.filter(x => {
                        if (!x.fi) return false;
                        const f = x.fi.split('/');
                        if (f.length < 3) return false;
                        const matchY = y === 'ALL' || f[2] == y;
                        const matchM = m === 'ALL' || parseInt(f[1]) == m;
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(x.pa));
                        const matchE = e === 'ALL' || x.e === e;
                        const matchA = a === 'ALL' || x.dir === a;
                        const matchD = d === 'ALL' || x.d === d;
                        return matchY && matchM && matchPa && matchE && matchA && matchD;
                    });
                    const seenH = new Set();
                    dataToExport = dataToExport.filter(x => {
                        const id = (x.c || x.n) + '|' + x.fi;
                        if (seenH.has(id)) return false;
                        seenH.add(id);
                        return true;
                    });
                } else if (isBajas) {
                    dataToExport = bajas.filter(x => {
                        const matchY = y === 'ALL' || x.y == y;
                        const matchM = m === 'ALL' || x.m == m;
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(x.pa));
                        const matchE = e === 'ALL' || x.e === e;
                        const matchA = a === 'ALL' || x.dir === a;
                        const matchD = d === 'ALL' || x.d === d;
                        return matchY && matchM && matchPa && matchE && matchA && matchD;
                    }).map(b => {
                        const person = findEmp(b.c || b.n);
                        // Priorizamos lo que viene del Excel de Bajas, fallback al person si algo falta
                        return {
                            ...b,
                            c: b.c || (person ? person.c : ''),
                            p: b.p || (person ? (person.p || person.position) : ''),
                            fi: b.fi || (person ? person.fi : ''),
                            dir: (b.dir && b.dir !== 'OTRO') ? b.dir : (person ? person.dir : 'OTRO'),
                            d: (b.d && b.d !== 'OTRO') ? b.d : (person ? person.d : 'OTRO'),
                            motivo: b.motivo || b.mc || ''
                        };
                    });
                } else if (isGrowth) {
                    const periodHires = emps.filter(x => {
                        if (!x.fi) return false;
                        const f = x.fi.split('/'); if (f.length < 3) return false;
                        const matchY = y === 'ALL' || f[2] == y;
                        const matchM = m === 'ALL' || parseInt(f[1]) == m;
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(x.pa));
                        const matchE = e === 'ALL' || x.e === e;
                        const matchA = a === 'ALL' || x.dir === a;
                        const matchD = d === 'ALL' || x.d === d;
                        return matchY && matchM && matchPa && matchE && matchA && matchD;
                    }).map(h => ({ ...h, type: "ALTA", date: h.fi }));
                    const periodBajas = bajas.filter(x => {
                        const matchY = y === 'ALL' || x.y == y;
                        const matchM = m === 'ALL' || x.m == m;
                        const matchPa = countries.length === 0 || countries.includes(normalizePa(x.pa));
                        const matchE = e === 'ALL' || x.e === e;
                        const matchA = a === 'ALL' || x.dir === a;
                        const matchD = d === 'ALL' || x.d === d;
                        return matchY && matchM && matchPa && matchE && matchA && matchD;
                    }).map(b => {
                        const person = findEmp(b.c || b.n);
                        return {
                            ...b,
                            type: "BAJA",
                            date: b.f || b.fb,
                            fi: b.fi || (person ? person.fi : ''),
                            c: b.c || (person ? person.c : ''),
                            dir: (b.dir && b.dir !== 'OTRO') ? b.dir : (person ? person.dir : 'OTRO'),
                            d: (b.d && b.d !== 'OTRO') ? b.d : (person ? person.d : 'OTRO')
                        };
                    });
                    dataToExport = [...periodHires, ...periodBajas];
                } else if (isCountries) {
                    // Deduplicate employees first (same person in multiple months)
                    const dedupMap = new Map();
                    emps.forEach(x => {
                        if (y !== 'ALL' && x.y != y) return;
                        if (m !== 'ALL' && x.m != m) return;
                        const pa = normalizePa(x.pa);
                        if (countries.length > 0 && !countries.includes(pa)) return;
                        if (e !== 'ALL' && x.e !== e) return;
                        if (a !== 'ALL' && x.dir !== a) return;
                        if (d !== 'ALL' && x.d !== d) return;
                        const personKey = (x.c || x.n || '').toString().trim();
                        if (!personKey) return;
                        const existing = dedupMap.get(personKey);
                        if (!existing || (x.m > existing.m)) {
                            dedupMap.set(personKey, x);
                        }
                    });
                    const counts = {};
                    dedupMap.forEach(x => {
                        const pa = normalizePa(x.pa);
                        const key = `${pa}|${x.e}`;
                        counts[key] = (counts[key] || 0) + 1;
                    });
                    dataToExport = Object.keys(counts).map(key => {
                        const [pa, emp] = key.split('|');
                        return { pa, e: emp, hc: counts[key] };
                    });
                }

                if (dataToExport.length === 0 && !isGrowth) {
                    Swal.fire("Sin Datos", "No hay registros que coincidan con los filtros actuales.", "info");
                    return;
                }

                function styleSheet(ws) {
                    if (!ws['!ref']) return;
                    // Attempt basic styling
                    try {
                        const range = XLSX.utils.decode_range(ws['!ref']);
                        for (let R = range.s.r; R <= range.e.r; ++R) {
                            for (let C = range.s.c; C <= range.e.c; ++C) {
                                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                                if (!ws[cellRef]) continue;
                                ws[cellRef].s = {
                                    font: { sz: 10, name: "Calibri" },
                                    alignment: { vertical: "center" }
                                };
                                if (R === 0) {
                                    ws[cellRef].s.fill = { fgColor: { rgb: "002060" } };
                                    ws[cellRef].s.font = { color: { rgb: "FFFFFF" }, bold: true, sz: 11 };
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("Excel styling failed, continuing with raw data.", e);
                    }
                }
                function autoColWidths(ws, headers, rows) {
                    ws['!cols'] = headers.map((h, i) => {
                        let maxLen = h.length;
                        rows.forEach(r => { if (String(r[i] || "").length > maxLen) maxLen = String(r[i] || "").length; });
                        return { wch: Math.min(maxLen + 4, 30) };
                    });
                }

                // --- GROWTH EXPORT: Multi-sheet ---
                if (isGrowth) {
                    const monthNamesUpper = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

                    // Determine current and previous periods
                    let curY = y, curM = m, prevY, prevM;
                    let periodLabel = '', prevPeriodLabel = '';
                    if (m !== 'ALL') {
                        curM = parseInt(m);
                        curY = parseInt(y !== 'ALL' ? y : new Date().getFullYear());
                        prevM = curM - 1; prevY = curY;
                        if (prevM < 1) { prevM = 12; prevY = curY - 1; }
                        periodLabel = `${monthNamesUpper[curM]} ${curY}`;
                        prevPeriodLabel = `${monthNamesUpper[prevM]} ${prevY}`;
                    } else {
                        curY = parseInt(y !== 'ALL' ? y : new Date().getFullYear());
                        prevY = curY - 1;
                        curM = 'ALL'; prevM = 'ALL';
                        periodLabel = `${curY}`;
                        prevPeriodLabel = `${prevY}`;
                    }

                    // Helper to get deduplicated HC for a period
                    function getHCForPeriod(filterY, filterM) {
                        const personMap = new Map();
                        emps.forEach(x => {
                            if (filterY !== 'ALL' && x.y != filterY) return;
                            if (filterM !== 'ALL' && x.m != filterM) return;
                            const pa = normalizePa(x.pa);
                            if (countries.length > 0 && !countries.includes(pa)) return;
                            if (e !== 'ALL' && x.e !== e) return;
                            if (a !== 'ALL' && x.dir !== a) return;
                            if (d !== 'ALL' && x.d !== d) return;
                            const key = (x.c || x.n || '').toString().trim();
                            if (!key) return;
                            const existing = personMap.get(key);
                            if (!existing || (x.m > existing.m)) personMap.set(key, x);
                        });
                        return Array.from(personMap.values());
                    }

                    const curHC = getHCForPeriod(curY, curM);
                    const prevHC = getHCForPeriod(prevY, prevM);

                    // ---- HOJA 1: RESUMEN ----
                    const resumenRows = [];
                    resumenRows.push(["COMPARATIVA DE CRECIMIENTO", "", "", "", ""]);
                    resumenRows.push(["", "", "", "", ""]);
                    resumenRows.push(["CONCEPTO", `HC ${prevPeriodLabel}`, `HC ${periodLabel}`, "DIFERENCIA", "% CRECIMIENTO"]);
                    const diff = curHC.length - prevHC.length;
                    const pct = prevHC.length > 0 ? ((diff / prevHC.length) * 100).toFixed(1) + '%' : 'N/A';
                    resumenRows.push(["TOTAL GENERAL", prevHC.length, curHC.length, diff, pct]);

                    // By Empresa
                    resumenRows.push(["", "", "", "", ""]);
                    resumenRows.push(["POR EMPRESA", "", "", "", ""]);
                    resumenRows.push(["EMPRESA", `HC ${prevPeriodLabel}`, `HC ${periodLabel}`, "DIFERENCIA", "% CRECIMIENTO"]);
                    const empSet = new Set();
                    curHC.forEach(x => empSet.add(x.e || 'N/A'));
                    prevHC.forEach(x => empSet.add(x.e || 'N/A'));
                    Array.from(empSet).sort().forEach(empresa => {
                        const curCount = curHC.filter(x => (x.e || 'N/A') === empresa).length;
                        const prevCount = prevHC.filter(x => (x.e || 'N/A') === empresa).length;
                        const d2 = curCount - prevCount;
                        const p2 = prevCount > 0 ? ((d2 / prevCount) * 100).toFixed(1) + '%' : 'N/A';
                        resumenRows.push([empresa, prevCount, curCount, d2, p2]);
                    });

                    // By Pais
                    resumenRows.push(["", "", "", "", ""]);
                    resumenRows.push(["POR Pais", "", "", "", ""]);
                    resumenRows.push(["Pais", `HC ${prevPeriodLabel}`, `HC ${periodLabel}`, "DIFERENCIA", "% CRECIMIENTO"]);
                    const paset = new Set();
                    curHC.forEach(x => paset.add(normalizePa(x.pa)));
                    prevHC.forEach(x => paset.add(normalizePa(x.pa)));
                    Array.from(paset).sort().forEach(pa => {
                        const curCount = curHC.filter(x => normalizePa(x.pa) === pa).length;
                        const prevCount = prevHC.filter(x => normalizePa(x.pa) === pa).length;
                        const d3 = curCount - prevCount;
                        const p3 = prevCount > 0 ? ((d3 / prevCount) * 100).toFixed(1) + '%' : 'N/A';
                        resumenRows.push([paisMap[pa] || pa, prevCount, curCount, d3, p3]);
                    });

                    const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
                    wsResumen['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 }];
                    styleSheet(wsResumen);

                    // ---- HOJA 2: MOVIMIENTOS (altas + bajas como antes) ----
                    const movHeaders = ["TIPO MOVIMIENTO", "AÑO", "MES", "PAIS", "EMPRESA", "CODIGO", "NOMBRE", "FECHA INGRESO", "PUESTO", "FECHA MOVIMIENTO", "area", "DEPARTAMENTO", "MOTIVO (SI ES BAJA)"];
                    const movRows = dataToExport.map(x => {
                        let mesVal = (monthNames[x.m] || '').toUpperCase();
                        return [x.type, x.y || '', mesVal, x.pa || '', x.e || '', x.c || '', x.n || '', x.fi || '', x.p || x.position || '', x.date || '', x.dir || '', x.d || '', x.motivo || ''];
                    });
                    const wsMovData = [movHeaders, ...movRows];
                    const wsMov = XLSX.utils.aoa_to_sheet(wsMovData);
                    autoColWidths(wsMov, movHeaders, movRows);
                    styleSheet(wsMov);

                    // ---- HOJA 3: CAMBIOS DE PUESTO ----
                    const posChanges = [];
                    const personPositions = new Map();
                    // Collect all positions per person across all months in the current period
                    emps.forEach(x => {
                        if (curY !== 'ALL' && x.y != curY) return;
                        if (curM !== 'ALL' && x.m != curM) return;
                        const pa = normalizePa(x.pa);
                        if (countries.length > 0 && !countries.includes(pa)) return;
                        if (e !== 'ALL' && x.e !== e) return;
                        const key = (x.c || x.n || '').toString().trim();
                        if (!key) return;
                        if (!personPositions.has(key)) personPositions.set(key, []);
                        personPositions.get(key).push({ m: x.m, y: x.y, p: (x.p || x.position || '').trim(), pa: x.pa, e: x.e, n: x.n, c: x.c, dir: x.dir, d: x.d });
                    });
                    // Also check previous period for changes
                    emps.forEach(x => {
                        if (prevY !== 'ALL' && x.y != prevY) return;
                        if (prevM !== 'ALL' && x.m != prevM) return;
                        const pa = normalizePa(x.pa);
                        if (countries.length > 0 && !countries.includes(pa)) return;
                        if (e !== 'ALL' && x.e !== e) return;
                        const key = (x.c || x.n || '').toString().trim();
                        if (!key) return;
                        if (!personPositions.has(key)) personPositions.set(key, []);
                        personPositions.get(key).push({ m: x.m, y: x.y, p: (x.p || x.position || '').trim(), pa: x.pa, e: x.e, n: x.n, c: x.c, dir: x.dir, d: x.d });
                    });
                    personPositions.forEach((records, key) => {
                        records.sort((a, b) => (a.y - b.y) || (a.m - b.m));
                        for (let i = 1; i < records.length; i++) {
                            if (records[i].p && records[i - 1].p && records[i].p !== records[i - 1].p) {
                                posChanges.push([
                                    records[i].c || '', records[i].n || '', records[i].pa || '', records[i].e || '',
                                    records[i - 1].p, records[i].p,
                                    `${monthNamesUpper[records[i - 1].m] || records[i - 1].m} ${records[i - 1].y}`,
                                    `${monthNamesUpper[records[i].m] || records[i].m} ${records[i].y}`,
                                    records[i].dir || '', records[i].d || ''
                                ]);
                            }
                        }
                    });
                    const posHeaders = ["CODIGO", "NOMBRE", "PAIS", "EMPRESA", "PUESTO ANTERIOR", "PUESTO NUEVO", "PERIODO ANTERIOR", "PERIODO NUEVO", "area", "DEPARTAMENTO"];
                    const wsPosData = [posHeaders, ...posChanges];
                    const wsPos = XLSX.utils.aoa_to_sheet(wsPosData);
                    autoColWidths(wsPos, posHeaders, posChanges);
                    styleSheet(wsPos);

                    // Build workbook with 3 sheets
                    let dynamicBase = "CRECIMIENTO ASYS";
                    if (d !== 'ALL') dynamicBase = `CRECIMIENTO ${d}`;
                    else if (a !== 'ALL') dynamicBase = `CRECIMIENTO ${a}`;
                    else if (e !== 'ALL') dynamicBase = `CRECIMIENTO ${e}`;
                    const monthText = (m !== 'ALL' && monthNames[m]) ? monthNames[m].toUpperCase() : "";
                    const yearText = y !== 'ALL' ? y : "";
                    let fileName = `${dynamicBase} ${monthText} ${yearText}`.trim().replace(/\s+/g, ' ');

                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
                    XLSX.utils.book_append_sheet(wb, wsMov, "Movimientos");
                    XLSX.utils.book_append_sheet(wb, wsPos, "Cambios de Puesto");
                    if (!wb.Workbook) wb.Workbook = {};
                    if (!wb.Workbook.Views) wb.Workbook.Views = [{}];
                    wb.Workbook.Views[0].showGridLines = false;
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                    return;
                }

                let headers = [];
                if (isCountries) {
                    headers = ["Pais", "EMPRESA", "HC ACTIVO"];
                } else {
                    headers = ["AÑO", "MES", "PAIS", "EMPRESA", "CODIGO", "NOMBRE", "FECHA INGRESO", "PUESTO"];
                    if (isActiveHC) headers.unshift("TIPO HC");
                    if (isBajas) headers.push("FECHA BAJA");
                    headers.push("area", "DEPARTAMENTO");
                    if (isBajas) headers.push("MOTIVO BAJA");
                }

                const rows = dataToExport.map(x => {
                    if (isCountries) return [paisMap[x.pa] || x.pa, x.e, x.hc];
                    let mesVal = (monthNames[x._hc_export_m || x.m] || '').toUpperCase();
                    const row = [x._hc_export_y || x.y || '', mesVal, x.pa || '', x.e || '', x.c || '', x.n || '', x.fi || '', x.p || x.position || ''];
                    if (isActiveHC) row.unshift(x._hc_export_tipo || ((window._hcType || 'neto') === 'neto' ? 'HC NETO' : 'HC BRUTO'));
                    if (isBajas) row.push(x.f || x.fb || '');
                    row.push(x.dir || '', x.d || '');
                    if (isBajas) row.push(x.motivo || '');
                    return row;
                });

                const wsData = [headers, ...rows];
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                styleSheet(ws);
                autoColWidths(ws, headers, rows);

                let dynamicBase = "HC ASYS";
                if (d !== 'ALL') dynamicBase = `HC ${d}`;
                else if (a !== 'ALL') dynamicBase = `HC ${a}`;
                else if (e !== 'ALL') dynamicBase = `HC ${e}`;
                else if (p !== 'ALL') dynamicBase = `HC ${paisMap[p] || p}`;
                else if (countries.length === 1) dynamicBase = `HC ${paisMap[countries[0]] || countries[0]}`;

                if (isBajas) dynamicBase = dynamicBase.replace("HC ", "BAJAS ");
                if (isHires) dynamicBase = dynamicBase.replace("HC ", "ALTAS ");
                if (isCountries) dynamicBase = dynamicBase.replace("HC ", "PAISES_ACTIVOS ");
                if (isActiveHC) dynamicBase = dynamicBase.replace("HC ", `HC_${(window._hcType || 'neto').toUpperCase()} `);

                const monthText = (m !== 'ALL' && monthNames[m]) ? monthNames[m].toUpperCase() : "";
                const yearText = y !== 'ALL' ? y : "";
                let fileName = `${dynamicBase} ${monthText} ${yearText}`.trim().replace(/\s+/g, ' ');

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Detalle");
                if (!wb.Workbook) wb.Workbook = {};
                if (!wb.Workbook.Views) wb.Workbook.Views = [{}];
                wb.Workbook.Views[0].showGridLines = false;
                XLSX.writeFile(wb, `${fileName}.xlsx`);
            }

            // --- Point 11/12/13: Download Detailed Ranking Excel ---
            function downloadRankExcel(type, name) {
                const f = getFilters();
                const emps = window.lastActiveHC || []; // Global ref usually available after render
                let filtered = emps;
                let exportName = name || (type === 'area' ? 'Todas_las_areas' : 'Todos_los_Deptos');

                if (name) {
                    if (type === 'area') {
                        filtered = emps.filter(e => (e.dir || e.area || 'Sin area') === name);
                    } else {
                        filtered = emps.filter(e => (e.d || 'Sin Departamento') === name);
                    }
                }

                if (filtered.length === 0) {
                    Swal.fire('Atenci ', 'No hay datos detallados para esta selecci ', 'info');
                    return;
                }

                const rows = filtered.map(e => ({
                    'C ': e.c || '',
                    'NOMBRE': e.n || '',
                    'Pais': e.pa || '',
                    'EMPRESA': e.e || '',
                    'area': e.dir || e.area || '',
                    'DEPARTAMENTO': e.d || '',
                    'PUESTO': e.p || '',
                    'FECHA INGRESO': e.fi || ''
                }));

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Detalle Ranking");
                XLSX.writeFile(wb, `Detalle_${exportName.replace(/\s+/g, '_')}_${f.y}_${f.m}.xlsx`);
            }



            // --- GLOBAL MAPPING HELPERS BY ANTIGRAVITY (ULTRA-ROBUST) ---
            var mapSingleRecord = (e, mappings) => {
                const pRaw = (e.p || e.position || 'PENDIENTE').trim();
                const paRaw = (e.pa || ' ').trim();
                const eRaw = (e.e || ' ').trim();
                
                // Normalizaci  Cr 
                const pNorm = pRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                const paNorm = normalizePa ? normalizePa(paRaw) : paRaw.toUpperCase(); // Convertir GUATEMALA -> GT, etc.
                const eNorm = eRaw.toUpperCase();
                
                const exactKey = `${pNorm}|${paNorm}|${eNorm}`;
                const positionOnlyKey = pNorm;

                let dVal = 'PENDIENTE';
                let dirVal = 'PENDIENTE';

                // 1. User Overrides (Más Prioridad)
                const ovr = mappings[exactKey] || mappings[pRaw + '|' + paRaw.toUpperCase() + '|' + eRaw.toUpperCase()];

                if (ovr) {
                    dirVal = ovr.dir || dirVal;
                    dVal = ovr.depto || ovr.d || dVal;
                } else if (window._POSITION_QUICK_MAP) {
                    // 2. Master List (B  por Llave Normalizada)
                    const lookup = window._POSITION_QUICK_MAP.get(exactKey) || window._POSITION_QUICK_MAP.get(positionOnlyKey);
                    if (lookup) {
                        dirVal = lookup.dir;
                        dVal = lookup.d;
                    }
                }

                // 2.5 FUZZY MATCHING INTELIGENTE (Busca puestos similares ya mapeados)
                if (dirVal === 'PENDIENTE' || dVal === 'PENDIENTE') {
                    const NOISE = /\b(SR|JR|SENIOR|JUNIOR|REGIONAL|DE|LA|EL|LOS|LAS|EN|Y|AND|ASG|ASEGURO|BILINGUE|BILINGUE)\b/gi;
                    const stripped = pNorm.replace(NOISE, '').replace(/\s+/g, ' ').trim(); // Strategy A: Check POSITION_MAP with stripped name
                    if (typeof POSITION_MAP !== 'undefined' && stripped && stripped !== pNorm) {
                        const directHit = POSITION_MAP[stripped];
                        if (directHit) {
                            dirVal = directHit.dir;
                            dVal = directHit.d;
                        }
                    }

                    // Strategy B: Check POSITION_QUICK_MAP with stripped name
                    if ((dirVal === 'PENDIENTE' || dVal === 'PENDIENTE') && window._POSITION_QUICK_MAP && stripped) {
                        const qHit = window._POSITION_QUICK_MAP.get(stripped);
                        if (qHit) {
                            dirVal = qHit.dir;
                            dVal = qHit.d;
                        }
                    }

                    // Strategy C: Word-overlap scoring against POSITION_MAP keys
                    if ((dirVal === 'PENDIENTE' || dVal === 'PENDIENTE') && typeof POSITION_MAP !== 'undefined') {
                        const words = stripped.split(' ').filter(w => w.length > 2);
                        if (words.length >= 1) {
                            let bestScore = 0;
                            let bestMatch = null;
                            const mapKeys = Object.keys(POSITION_MAP);
                            for (const key of mapKeys) {
                                const keyStripped = key.replace(NOISE, '').replace(/\s+/g, ' ').trim();
                                const keyWords = keyStripped.split(' ').filter(w => w.length > 2);
                                // Count matching words
                                let score = 0;
                                for (const w of words) {
                                    if (keyWords.includes(w)) score++;
                                }
                                // Prefer higher overlap ratio
                                const ratio = score / Math.max(words.length, keyWords.length);
                                if (ratio > 0.3 && score > bestScore) {
                                    bestScore = score;
                                    bestMatch = POSITION_MAP[key];
                                }
                            }
                            if (bestMatch) {
                                dirVal = bestMatch.dir;
                                dVal = bestMatch.d;
                            }
                        }
                    }
                }

                // 3. Inteligencia de Palabras Clave (  recurso si falla el Maestro)
                if ((dirVal === 'PENDIENTE' || dVal === 'PENDIENTE') && typeof getAutoMapping === 'function') {
                    const auto = getAutoMapping(pRaw);
                    if (auto) {
                        dirVal = auto.dir;
                        dVal = auto.d || auto.depto;
                    }
                }
                
                // Estandarizaci  de Salida
                if (dirVal === 'OPERACIONES') dirVal = 'BI & OPERACIONES';
                if (dVal === 'OPERACIONES') dVal = 'BI & OPERACIONES';
                
                // Fallbacks finales (asignar a BI & OPERACIONES si a  es PENDIENTE)
                if (!dirVal || /^(0|nan|1|null|undefined|PENDIENTE)$/i.test(String(dirVal))) dirVal = 'BI & OPERACIONES';
                if (!dVal || /^(0|nan|1|null|undefined|PENDIENTE)$/i.test(String(dVal))) dVal = 'BI & OPERACIONES';

                e.dir = dirVal;
                e.d = dVal;
                return e;
            };

            window.performGlobalMapping = () => {
                console.log("  Starting Optimized Global Mapping...");
                const start = performance.now();
                const mappings = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');

                // Build Quick Map once to avoid millions of find() calls
                if (window.POSITION_MASTER && !window._POSITION_QUICK_MAP) {
                    const qMap = new Map();
                    window.POSITION_MASTER.forEach(x => {
                        const p = (x[Object.keys(x).find(k => k.indexOf("POSICI") !== -1) || "POSICIÓN (PLANILLA)"] || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
                        const pa = (x[Object.keys(x).find(k => k.indexOf("PA") !== -1) || "PAÍS"] || '').toUpperCase().trim();
                        const e = (x["EMPRESA"] || '').toUpperCase().trim();
                        const key = `${p}|${pa}|${e}`;
                        qMap.set(key, { dir: x[Object.keys(x).find(k => k.indexOf("DIREC") !== -1) || "DIRECCIÓN"], d: x[Object.keys(x).find(k => k.indexOf("DEPAR") !== -1) || "DEPARTAMENTO"] });
                        if (!qMap.has(p)) qMap.set(p, { dir: x[Object.keys(x).find(k => k.indexOf("DIREC") !== -1) || "DIRECCIÓN"], d: x[Object.keys(x).find(k => k.indexOf("DEPAR") !== -1) || "DEPARTAMENTO"] });
                    });
                    window._POSITION_QUICK_MAP = qMap;
                }

                if (app && app.employees) app.employees.forEach(e => mapSingleRecord(e, mappings));
                if (app && app.bajas_list) app.bajas_list.forEach(b => mapSingleRecord(b, mappings));
                if (app && app.incidencias) app.incidencias.forEach(i => mapSingleRecord(i, mappings));
                console.log(`  Global Mapping Complete: ${((performance.now() - start) / 1000).toFixed(2)}s`);
            };
            var performGlobalMapping = window.performGlobalMapping;

            function normalizePa(p) {
                let code = (p || '').trim().toUpperCase();
                if (code === 'JA' || code === 'JAM' || code === 'JAMAICA' || code === 'JAMACIA') return 'JM';
                if (code === 'NC' || code === 'NCA' || code === 'NIC' || code === 'NICARAGUA' || code === 'NI') return 'NC';
                if (code === 'PN' || code === 'PAN' || code === 'PANAMA') return 'PA';
                if (code === 'DO' || code === 'RD' || code === 'DOM' || code === 'REPUBLICA DOMINICANA' || code === 'DM') return 'RD';
                if (code === 'TT' || code === 'TYT' || code === 'TTO' || code === 'TRINIDAD' || code === 'TYTY') return 'TYT';
                if (code === 'GT' || code === 'GUA' || code === 'GUATEMALA') return 'GT';
                if (code === 'HN' || code === 'HND' || code === 'HONDURAS') return 'HN';
                if (code === 'SV' || code === 'SLV' || code === 'EL SALVALORR') return 'SV';
                if (code === 'CR' || code === 'CRI' || code === 'COSTA RICA') return 'CR';
                if (code === 'PY' || code === 'PRY' || code === 'PARAGUAY') return 'PY';
                return code;
            }

            function normalizeMonth(m) {
                if (!m) return 'ALL';
                if (!isNaN(m)) return parseInt(m);
                const ms = String(m).toUpperCase().trim();
                const months = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                let idx = months.indexOf(ms);
                if (idx > 0) return idx;
                const abbreviations = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                idx = abbreviations.indexOf(ms.substring(0, 3));
                return idx > 0 ? idx : m;
            }

            function compareMonth(m1, m2, isYTD = false) {
                if (m2 === 'ALL') return true;
                const n1 = parseInt(normalizeMonth(m1));
                const n2 = parseInt(normalizeMonth(m2));
                if (isNaN(n1) || isNaN(n2)) return false;
                return isYTD ? (n1 <= n2) : (n1 == n2);
            }




            function updateStatusPhrase(p, e, count) {
                const ptext = p === 'ALL' ? 'todas las regiones' : (paisMap[p] || p);
                const etext = e === 'ALL' ? 'todas las empresas' : e;
                const phrase = `Analizando <span style="color:var(--ac); font-weight:800;"> ${count.toLocaleString()}</span> colaboradores en <span style="font-weight:800; color:var(--tx);"> ${ptext}</span> / <span style="font-weight:800; color:var(--tx);">${etext}</span>.`;
                const statusEl = document.getElementById('statusPhrase');
                if (statusEl) statusEl.innerHTML = phrase;
            }

            function calcTenure(fi) {
                if (!fi || typeof fi !== 'string' || fi === '0' || fi === 'nan') return 0;
                try {
                    const now = new Date();
                    let hire;
                    if (fi.includes('/')) {
                        const parts = fi.split('/');
                        if (parts.length < 3) return 0;
                        const d = parseInt(parts[0]), mo = parseInt(parts[1]), yr = parseInt(parts[2]);
                        if (yr < 100) yr += 2000;
                        hire = new Date(yr, mo - 1, d);
                    } else if (fi.includes('-')) {
                        hire = new Date(fi);
                    } else {
                        return 0;
                    }
                    if (isNaN(hire.getTime())) return 0;
                    const diffMs = now.getTime() - hire.getTime();
                    const yrs = diffMs / (1000 * 60 * 60 * 24 * 365.25);
                    return Math.max(0, yrs);
                } catch (ex) { return 0; }
            }

            function classifyRango(years) {
                if (years >= 5) return 'Senior (5+ años)';
                if (years >= 3) return 'Mid (3-5 años)';
                if (years >= 1) return 'Junior (1-3 años)';
                return 'Nuevo (<1 año)';
            }

            // --- MASTER KPI CARD GENERADORR (PREMIUM) ---
        // ============================================================
        //   HD ZOOM SYSTEM (EXECUTIVE PRESENTATION MODE)
        //   Consolidated & Optimized for Golden Standard
        // ============================================================

        window.isZoomNavigableCard = function(card, root) {
            if (!card || !root || !root.contains(card)) return false;
            if (card.closest('[style*="display:none"], [style*="display: none"]')) return false;

            let node = card;
            while (node && node !== root && node.nodeType === 1) {
                const style = window.getComputedStyle(node);
                if (style.display === 'none' || style.visibility === 'hidden') return false;
                node = node.parentElement;
            }

            const rect = card.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        };

        window.getZoomNavigableCards = function(root) {
            if (!root) return [];
            return Array.from(root.querySelectorAll('.card-box')).filter(card => window.isZoomNavigableCard(card, root));
        };

        window.zoomToNext = function(dir) {
            if(!window.lastZoomedCard) return;
            const activePane = document.querySelector('.pane.on') || document.getElementById('pane0');
            if(!activePane) return;
            const allCards = (window._zoomCardSequence && window._zoomCardSequence.length)
                ? window._zoomCardSequence
                : window.getZoomNavigableCards(activePane);
            const currentIndex = allCards.indexOf(window.lastZoomedCard);
            let newIndex = currentIndex + dir;
            if(newIndex >= 0 && newIndex < allCards.length) {
                exitZoomMode();
                setTimeout(() => enterZoomMode(allCards[newIndex]), 100);
            }
        };

        // Extractor function so we can reuse it to sync live updates
        window.updateZoomHeader = function() {
            const card = window.lastZoomedCard;
            if (!card) return;
            const header = card.querySelector('.zoom-header-stitch');
            if (!header) return;

            let titleH3Text = 'ANALYTICS';
            let titleH2Text = 'DATA VIEW';
            
            const h2Title = card.querySelector('h2:not(.header-titles-stitch h2)');
            const h3Title = card.querySelector('h3:not(.header-titles-stitch h3)');
            const cardTitle = card.querySelector('.card-title');

            if (h2Title) {
                titleH2Text = h2Title.innerText.trim();
                // Clean up any parenthetical text in the subtitle for the presentation view
                titleH2Text = titleH2Text.split('(')[0].trim();
                
                if (h3Title && !h3Title.innerText.includes('TOTAL') && !h3Title.innerText.includes('HC')) {
                    titleH3Text = h3Title.innerText.replace(/\(.*\)/, '').trim();
                } else {
                    titleH3Text = 'DATOS';
                }
            } else if (cardTitle) {
                const small = cardTitle.querySelector('small');
                if(small) {
                    titleH2Text = small.innerText.trim();
                    titleH3Text = cardTitle.childNodes[0].textContent.trim();
                } else {
                    titleH2Text = cardTitle.innerText.trim();
                    titleH3Text = 'DATOS';
                }
            }

            // --- SUPER ROBUST TOTAL EXTRACTION ---
            const regLabel = card.querySelector('#regBadgeLabel');
            const regVal = card.querySelector('#z_flagsTotalEl');
            const distLabel = card.querySelector('#distBadgeLabel');
            const distVal = card.querySelector('#distPropTotalLarge');
            const hcGeneralTotal = document.querySelector('.total-hc-box'); // Global fallback for general metrics
            
            let totalText = "";
            if (regLabel && regVal) {
                totalText = `${regLabel.innerText.replace('TOTAL','').trim()} ${regVal.innerText}`;
            } else if (distLabel && distVal) {
                totalText = `${distLabel.innerText.replace('TOTAL','').trim()} ${distVal.innerText}`;
            } else if (hcGeneralTotal) {
                totalText = hcGeneralTotal.innerText.replace(/\n/g, ' ').replace(/TOTAL/g, '').trim();
            } else {
                // Fallback for other cards
                const totalEl = card.querySelector('.total-hc-box, [class*="total-badge"], .total-badge-aesthetic, .total-value');
                if (totalEl) {
                    totalText = totalEl.innerText.replace(/\n/g, ' ').replace(/TOTAL/g, '').trim();
                }
            }
            
            const titleH2El = header.querySelector('h2');
            const titleH3El = header.querySelector('h3');
            const totalHcEl = header.querySelector('.zoom-total-hc span');

            if (titleH2El) titleH2El.innerText = titleH2Text;
            if (titleH3El) titleH3El.innerText = titleH3Text;
            if (totalHcEl && totalText) totalHcEl.innerText = totalText;
            else if (!totalHcEl && totalText) {
                const actionsDiv = header.querySelector('.header-right-actions');
                const totalHtml = `<div class="zoom-total-hc">TOTAL <span style="color:var(--ac)">${totalText}</span></div>`;
                actionsDiv.insertAdjacentHTML('afterbegin', totalHtml);
            }
        };

        window.refreshZoomedCharts = function(card) {
            if (!card || typeof Chart === 'undefined') return;

            const resizeVisibleCharts = () => {
                card.querySelectorAll('canvas').forEach(canvas => {
                    let chart = null;
                    if (typeof Chart.getChart === 'function') {
                        chart = Chart.getChart(canvas);
                    }
                    if (!chart && typeof window.activeCharts !== 'undefined') {
                        chart = window.activeCharts.find(c => c && c.canvas === canvas);
                    }
                    if (chart) {
                        try {
                            chart.resize();
                            chart.update('none');
                        } catch (e) {
                            console.warn('[ZOOM] Chart resize skipped:', canvas.id, e);
                        }
                    }
                });
                window.dispatchEvent(new Event('resize'));
            };

            requestAnimationFrame(() => {
                resizeVisibleCharts();
                setTimeout(resizeVisibleCharts, 180);
                setTimeout(resizeVisibleCharts, 450);
            });
        };

        window.enterZoomMode = function(card) {
            if (!card) return;
            // Clean up any existing zoomed cards/footers
            document.querySelectorAll('.card-box.zoomed').forEach(c => {
                c.classList.remove('zoomed');
                const f = c.querySelector('.zoom-footer');
                if(f) f.remove();
                if (c.dataset.originalDisplay !== undefined) {
                    c.style.display = c.dataset.originalDisplay;
                }
                c.querySelectorAll('[data-original-zoom-display]').forEach(el => {
                    el.style.display = el.dataset.originalZoomDisplay;
                    delete el.dataset.originalZoomDisplay;
                });
            });
            
            // Hide other cards to prevent scrollbar/layout interference
            const activePane = document.querySelector('.pane.on') || document.getElementById('pane0');
            const allCards = activePane ? window.getZoomNavigableCards(activePane) : [];
            window._zoomCardSequence = allCards;
            const currentIndex = allCards.indexOf(card);
            const prevCard = currentIndex > 0 ? allCards[currentIndex - 1] : null;
            const nextCard = currentIndex < allCards.length - 1 ? allCards[currentIndex + 1] : null;

            if (activePane) {
                activePane.querySelectorAll('.card-box, .kpi-card').forEach(c => {
                    if (c !== card && !card.contains(c)) {
                        c.dataset.originalDisplay = c.style.display || '';
                        c.style.display = 'none';
                    }
                });
            }
            
            card.dataset.originalCssText = card.style.cssText;
            card.style.setProperty('padding', '30px', 'important');
            card.classList.add('zoomed');
            
            // Bulletproof hiding of original titles
            card.querySelectorAll('h2, h3, .card-title, .card-box-header').forEach(el => {
                if (!el.closest('.zoom-header-stitch')) {
                    el.dataset.originalZoomDisplay = el.style.display || '';
                    el.style.display = 'none';
                }
            });
            
            // Stitch Expansion Engine V3 - Executive Header Injection
            if (!card.querySelector('.zoom-header-stitch')) {
                const header = document.createElement('div');
                header.className = 'zoom-header-stitch';
                
                header.innerHTML = `
                    <div class="header-titles-wrapper">
                        <div class="header-titles-stitch">
                            <h3 style="margin:0 !important; display:block !important; visibility:visible !important; color:var(--ac) !important; font-weight:900 !important; font-size: 11px !important; letter-spacing: 2px !important;">ANALYTICS</h3>
                            <h2 style="margin:4px 0 0 0 !important; display:block !important; visibility:visible !important; color:#1e293b !important; font-weight:1000 !important; font-size: 24px !important;">DATA VIEW</h2>
                        </div>
                        <div class="header-right-actions" style="display:flex !important; visibility:visible !important; align-items:center !important; gap:25px !important;">
                            <div style="display:flex; gap:10px; border-left: 2px solid #e2e8f0; padding-left: 25px; margin-left: 15px;">
                                <button class="btn-nav-stitch" onclick="window.zoomToNext(-1)" ${prevCard ? '' : 'disabled'} style="opacity: ${prevCard ? '1' : '0.3'};">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="btn-nav-stitch" onclick="window.zoomToNext(1)" ${nextCard ? '' : 'disabled'} style="opacity: ${nextCard ? '1' : '0.3'};">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <button class="btn-close-stitch" onclick="exitZoomMode()" style="width:44px !important; height:44px !important; font-size:20px !important; cursor: pointer; margin-left: 15px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="lila-line-stitch"></div>
                `;
                card.prepend(header);
                
                const actionsDiv = header.querySelector('.header-right-actions');
                
                // Hoist special switchers (like Distribución Proporcional) into the zoom header
                const specialSwitcher = card.querySelector('#distPropSwitcher');
                if (specialSwitcher) {
                    const placeholder = document.createElement('div');
                    placeholder.id = 'distPropSwitcherPlaceholder';
                    placeholder.style.display = 'none';
                    specialSwitcher.parentNode.insertBefore(placeholder, specialSwitcher);
                    actionsDiv.insertAdjacentElement('afterbegin', specialSwitcher);
                }
                
            }
            
            window.lastZoomedCard = card;
            window.updateZoomHeader(); // Fetch titles dynamically!

            // Remove old backdrop if it exists
            const b = document.querySelector('.zoom-backdrop-stitch');
            if (b) b.remove();
            
            // Inject Dynamic Tech Footer - ONCE ONLY
            if (!card.querySelector('.zoom-footer')) {
                const footer = document.createElement('div');
                footer.className = 'zoom-footer';
                const now = new Date();
                const dateStr = now.toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' });
                footer.innerHTML = `
                    <div><i class="fas fa-microchip" style="margin-right:8px; opacity:0.5;"></i> ASYS COMMAND CENTER | ANALYTICS DATOS</div>
                    <div><i class="far fa-calendar-alt" style="margin-right:8px; opacity:0.5;"></i> ${dateStr}</div>
                    <div><i class="fas fa-shield-alt" style="margin-right:8px; opacity:0.5;"></i> SESIÓN SEGURA | ACCESO NIVEL EJECUTIVO</div>
                `;
                card.appendChild(footer);
            }

            document.body.classList.add('zoomed-active');
            window.refreshZoomedCharts(card);
        };

        window.exitZoomMode = function() {
            // Restore special switchers (like distPropSwitcher) to their original place before removing the zoom container
            const placeholder = document.getElementById('distPropSwitcherPlaceholder');
            const switcher = document.getElementById('distPropSwitcher');
            if (placeholder && switcher) {
                placeholder.parentNode.insertBefore(switcher, placeholder);
                placeholder.remove();
            }

            // Global Cleanup of injected elements
            document.querySelectorAll('.zoom-header-stitch, .zoom-footer').forEach(el => el.remove());
            
            // Remove zoomed class from all cards and restore display
            document.querySelectorAll('.card-box, .kpi-card, .grid-row, .kpi-row').forEach(c => {
                c.classList.remove('zoomed');
                if (c.dataset.originalDisplay !== undefined) {
                    c.style.display = c.dataset.originalDisplay;
                    delete c.dataset.originalDisplay;
                }
                c.querySelectorAll('[data-original-zoom-display]').forEach(el => {
                    el.style.display = el.dataset.originalZoomDisplay;
                    delete el.dataset.originalZoomDisplay;
                });
                if (c.dataset.originalCssText !== undefined) {
                    c.style.cssText = c.dataset.originalCssText;
                    delete c.dataset.originalCssText;
                }
            });
            
            document.body.classList.remove('zoomed-active');
            window.lastZoomedCard = null;
            // Clean up backdrop if any
            const backdrop = document.querySelector('.zoom-backdrop-stitch');
            if(backdrop) backdrop.remove();

            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        };

        window.navigateZoom = function(direction) {
            window.zoomToNext(direction);
        };

        // injectHDZoom removed for Pro double-click presentation mode


        document.addEventListener('keydown', (e) => {
            if (!document.body.classList.contains('zoomed-active')) return;
            if (e.key === 'Escape') exitZoomMode();
            if (e.key === 'ArrowRight') navigateZoom(1);
            if (e.key === 'ArrowLeft') navigateZoom(-1);
        });

        (function initZoomControls() {
            if (document.getElementById('zoomControlsWrap')) return;
            const wrap = document.createElement('div');
            wrap.id = 'zoomControlsWrap';
            wrap.innerHTML = `
                <button id="closeZoomBtn" class="btn-close-zoom" onclick="exitZoomMode()"><i class="fas fa-times"></i></button>
                <button id="prevZoomBtn" class="btn-nav-zoom prev" onclick="navigateZoom(-1)"><i class="fas fa-chevron-left"></i></button>
                <button id="nextZoomBtn" class="btn-nav-zoom next" onclick="navigateZoom(1)"><i class="fas fa-chevron-right"></i></button>
            `;
            if (document.body) document.body.appendChild(wrap);
            else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(wrap), { once: true });
        })();




/* ===== auth.js ===== */
// --- AUTHENTICATION & SESSION MANAGEMENT ---
console.log("Auth Script Initializing...");

window.ASYS_AUTH_CONFIG = window.ASYS_AUTH_CONFIG || { enabled: false, user: '', pass: '' };

const AUTH_KEY = 'asys_auth_session_v1';
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

function getMasterCredentials() {
    const cfg = window.ASYS_AUTH_CONFIG;
    if (!cfg || cfg.enabled === false) return null;
    if (cfg && cfg.user && cfg.pass) return { user: cfg.user, pass: cfg.pass };
    return null;
}

function authIsDisabled() {
    return window.ASYS_AUTH_CONFIG && window.ASYS_AUTH_CONFIG.enabled === false;
}

function checkAuth() {
    try {
        const sessionStr = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const overlay = document.getElementById('loginOverlay');
        const dashboard = document.getElementById('mainDashboard');

        if (authIsDisabled() || (session && session.auth)) {
            if (overlay) overlay.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            return true;
        } else {
            if (overlay) overlay.style.display = 'flex';
            if (dashboard) dashboard.style.display = 'none';
            return false;
        }
    } catch (e) {
        console.error("Auth Check Error:", e);
        return false;
    }
}

function handleLogin() {
    console.log("Login function triggered");
    const userEl = document.getElementById('loginUser');
    const passEl = document.getElementById('loginPaiss');
    const errorEl = document.getElementById('loginError');
    const keepIn = document.getElementById('keepLoggedIn');

    if (!userEl || !passEl || !errorEl) {
        console.error("Login elements missing!");
        return;
    }

    const user = userEl.value.trim();
    const pass = passEl.value;
    const keep = keepIn ? keepIn.checked : false;

    try {
        const managedStr = localStorage.getItem('asys_managed_users') || '[]';
        const managedUsers = JSON.parse(managedStr);
        const managed = managedUsers.find(x => x.u === user && x.p === pass);

        const master = getMasterCredentials();
        const masterOk = master && user === master.user && pass === master.pass;
        if (masterOk || managed) {
            const session = { auth: true, user: user, time: Date.now() };
            const target = keep ? localStorage : sessionStorage;
            target.setItem(AUTH_KEY, JSON.stringify(session));
            localStorage.setItem('asys_saved_login_user', user);
            location.reload();
        } else {
            errorEl.innerText = "Usuario o contraseña incorrectos";
            errorEl.style.display = 'block';
            const btn = document.querySelector('.login-btn');
            if (btn) {
                btn.style.animation = 'none';
                void btn.offsetWidth;
                btn.style.animation = 'shake 0.4s ease';
            }
        }
    } catch (e) {
        console.error("Login Handler Error:", e);
        errorEl.innerText = "Error de sistema en el inicio de sesión";
        errorEl.style.display = 'block';
    }
}

function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
    location.reload();
}

function togglePaissword() {
    const input = document.getElementById('loginPaiss');
    const icon = document.querySelector('.login-toggle-pw');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

let idleTimer;
function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        const sessionStr = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
        if (sessionStr) {
            alert("Tu sesión ha expirado por inactividad");
            handleLogout();
        }
    }, SESSION_TIMEOUT);
}

// Attach to window and setup listeners
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.togglePaissword = togglePaissword;
window.checkAuth = checkAuth;
window.resetIdleTimer = resetIdleTimer;
window.authIsDisabled = authIsDisabled;

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Running Initial Auth Check");
    if (typeof checkAuth === 'function') checkAuth();
    const savedUser = localStorage.getItem('asys_saved_login_user');
    if (savedUser) {
        const userEl = document.getElementById('loginUser');
        if (userEl) userEl.value = savedUser;
    }

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    const passInput = document.getElementById('loginPaiss');
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
});


/* ===== app-bootstrap.js ===== */
// App bootstrap and final global state extracted from the main HTML.

window._currentSubView = 'General';
if (typeof Chart !== 'undefined' && Chart.defaults) {
    Chart.defaults.color = '#9289c3';
}

function normalizePa(p) {
    if (!p) return '';
    const s = p.trim().toUpperCase();
    if (s === 'DM' || s === 'DO') return 'RD';
    if (s === 'NI') return 'NC';
    if (s === 'TT') return 'TYT';
    if (s === 'PN') return 'PA';
    if (s === 'PRY' || s === 'PARAGUAY') return 'PY';
    return s;
}

function normalizeMonth(m) {
    if (!m) return 1;
    if (!isNaN(m)) return parseInt(m, 10);
    const months = {
        ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6,
        JUL: 7, AGO: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12,
        ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
        JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12,
    };
    const s = m.toString().toUpperCase().trim();
    return months[s] || months[s.substring(0, 3)] || 1;
}

function compareMonth(m1, m2) {
    if (m2 === 'ALL') return true;
    const v1 = parseInt(m1, 10);
    const v2 = parseInt(m2, 10);
    return v1 === v2;
}

window.POSITION_OVERRIDES_INIT = window.POSITION_OVERRIDES_INIT || {};
window.app = window.app || { employees: [], summary: [], bajas_list: [], bajas_data: { reasons: {} }, incidencias: [], updated: '' };
var app = window.app;

window.monthNames = window.monthNames || ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
window.paisMap = window.paisMap || {
    GT: 'Guatemala', CR: 'Costa Rica', HN: 'Honduras',
    SV: 'El Salvador', NC: 'Nicaragua', NI: 'Nicaragua',
    PA: 'Panamá', PY: 'Paraguay', JM: 'Jamaica',
    TYT: 'Trinidad & Tobago', TT: 'Trinidad & Tobago',
    DM: 'Rep. Dominicana', DO: 'Rep. Dominicana', RD: 'Rep. Dominicana',
};
window.ASYS_DIRECCIONES = window.ASYS_DIRECCIONES || ['ADMINISTRACIÓN & SERVICIOS GENERALES', 'AUDITORIA', 'BI & OPERACIONES', 'CALL CENTER', 'CAM NORTE', 'CAMASUR', 'COMPLIANCE', 'DESARROLLO', 'DESARROLLO HUMANO', 'FINANZAS', 'GURO', 'LEGAL', 'MUVIT', 'PROYECTOS', 'VALUE PROPOSITION'];
window.ASYS_DEPARTAMENTOS = window.ASYS_DEPARTAMENTOS || ['ACTUARIAL', 'ADMINISTRACIÓN', 'AJUSTADORES', 'ATRACCIÓN DE TALENTO', 'AUDITORIA', 'BI & OPERACIONES', 'CABINA', 'CALL CENTER', 'CAM NORTE', 'CAMASUR', 'CAPACITACIÓN', 'COMPENSACIONES Y NÓMINA', 'COMPLIANCE', 'CONTABILIDAD', 'CONTRALORÍA', 'CONTROL DE CALIDAD', 'CULTURA Y COMUNICACIÓN', 'DESARROLLO', 'DESARROLLO HUMANO', 'DESARROLLO ORGANIZACIONAL', 'FINANZAS', 'IT', 'LEGAL', 'MEJORA CONTINUA', 'MERCADEO', 'MUVIT', 'PROYECTOS', 'SAC', 'SALUD', 'SALUD Y SEGURIDAD OCUPACIONAL', 'SUSCRIPCIÓN', 'TELEMARKETING', 'TESORERIA', 'TI', 'VALUE PROPOSITION', 'WORKFORCE'];
window.currencyMap = window.currencyMap || {
    GT: 'Q', SV: '$', HN: 'L', NC: 'C$', NI: 'C$', CR: ' ', PA: '$',
    PN: '$', PY: ' ', JM: 'J$', TYT: 'TT$', TT: 'TT$', RD: 'RD$', DM: '$', BZ: 'BZ$',
};
window.countryStyles = window.countryStyles || {
    GT: { color: '#3b82f6', flag: ' ', fUrl: 'https://flagcdn.com/w80/gt.png' },
    CR: { color: '#ef4444', flag: ' ', fUrl: 'https://flagcdn.com/w80/cr.png' },
    HN: { color: '#0ea5e9', flag: ' ', fUrl: 'https://flagcdn.com/w80/hn.png' },
    SV: { color: '#3b82f6', flag: ' ', fUrl: 'https://flagcdn.com/w80/sv.png' },
    PA: { color: '#f59e0b', flag: ' ', fUrl: 'https://flagcdn.com/w80/pa.png' },
    PN: { color: '#f59e0b', flag: ' ', fUrl: 'https://flagcdn.com/w80/pa.png' },
    NC: { color: '#8b5cf6', flag: ' ', fUrl: 'https://flagcdn.com/w80/ni.png' },
    NI: { color: '#8b5cf6', flag: ' ', fUrl: 'https://flagcdn.com/w80/ni.png' },
    PY: { color: '#ef4444', flag: ' ', fUrl: 'https://flagcdn.com/w80/py.png' },
    JM: { color: '#facc15', flag: ' ', fUrl: 'https://flagcdn.com/w80/jm.png' },
    TYT: { color: '#000000', flag: ' ', fUrl: 'https://flagcdn.com/w80/tt.png' },
    TT: { color: '#000000', flag: ' ', fUrl: 'https://flagcdn.com/w80/tt.png' },
    RD: { color: '#14b8a6', flag: ' ', fUrl: 'https://flagcdn.com/w80/do.png' },
    OTHER: { color: '#94a3b8', flag: ' ', fUrl: '' },
};

window.activeTab = window.activeTab || 0;
window.activeCharts = window.activeCharts || [];
window.costSearch = window.costSearch || '';
window.getStyle = window.getStyle || function (p) {
    return countryStyles[p] || countryStyles.OTHER;
};
window.countryFlagMap = window.countryFlagMap || { GT: 'gt', CR: 'cr', HN: 'hn', SV: 'sv', NC: 'ni', NI: 'ni', PA: 'pa', PN: 'pa', PY: 'py', JM: 'jm', TYT: 'tt', TT: 'tt', DM: 'do', DO: 'do', RD: 'do' };
window._hcViewLength = window._hcViewLength === undefined ? 6 : window._hcViewLength;
window._hcSeriesVisible = Object.assign({
    total: true, ingresos: false, bajas: false,
    totalPrev: false, ingresosPrev: false, bajasPrev: false,
}, window._hcSeriesVisible || {});
window.selectedCountries = window.selectedCountries || [];

function getMapConfig() {
    try {
        const saved = localStorage.getItem('asys_map_tuner_v3');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { scale: 3.5, originX: 500, originY: 250, jmTop: 18, jmLeft: 64, rdTop: 8, rdLeft: 78, ttTop: 34, ttLeft: 86 };
}

function initApp() {
    console.log('Cantidades revisadas');
    if (window.hcFullData) {
        app = window.hcFullData;
        if (Array.isArray(window.isrFullData)) {
            app.isr_data = window.isrFullData;
        } else if (window.isrFullData && Array.isArray(window.isrFullData.isr_records)) {
            app.isr_data = window.isrFullData.isr_records;
        } else if (!app.isr_data) {
            app.isr_data = [];
        }
    }

    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    if (!localStorage.getItem('asys_pos_reset_v5')) {
        localStorage.removeItem('asys_pos_overrides');
        localStorage.setItem('asys_pos_reset_v5', 'DONE');
        console.log('  Mapping Hard Reset v5: Purged legacy local storage');
    }

    if (window.POSITION_OVERRIDES_INIT) {
        const existing = JSON.parse(localStorage.getItem('asys_pos_overrides') || '{}');
        const merged = Object.assign({}, window.POSITION_OVERRIDES_INIT, existing);
        localStorage.setItem('asys_pos_overrides', JSON.stringify(merged));
        console.log('  Base overrides active:', Object.keys(window.POSITION_OVERRIDES_INIT).length);
    }

    window.app = app;
    window.empsRaw = app.summary || [];
    window.allBajas = app.bajas_list || [];

    if (app.employees) {
        app.employees.forEach(e => {
            if (!e._pa) e._pa = normalizePa(e.pa || e.p || '');
            if (!e._m) e._m = normalizeMonth(e.m);
            if (!e._y) e._y = String(e.y || '');
            if (e.fi && !e._fiY) {
                const p = e.fi.split('/');
                if (p.length >= 3) {
                    e._fiM = parseInt(p[1], 10);
                    e._fiY = parseInt(p[2], 10);
                }
            }
        });
    }

    if (app.bajas_list) {
        app.bajas_list.forEach(b => {
            if (!b._pa) b._pa = normalizePa(b.pa);
            if (!b._m) b._m = normalizeMonth(b.m);
            if (!b._y) b._y = String(b.y || '');
        });
    }

    try {
        initFilters();
    } catch (e) {
        console.error('Critical error in initFilters:', e);
    }

    if (typeof updateDynOptions === 'function') {
        try {
            updateDynOptions();
        } catch (e) {
            console.warn('updateDynOptions suppressed error:', e);
        }
    }

    setTimeout(() => {
        try {
            clearFilters();
            console.log('Dashboard Initialized Successfully with Data and Delay Fix');
        } catch (e) {
            console.error('Critical error in final clearFilters call:', e);
        }
    }, 300);
}

loadData(function () {
    if (typeof window.hcFullData === 'undefined') {
        document.body.innerHTML = `
        <div style="height:100vh; width:100vw; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; font-family:'Montserrat',sans-serif; text-align:center; padding:40px;">
            <div style="font-size:80px; margin-bottom:20px;"> </div>
            <h1 style="color:#1e293b; font-weight:800;">  la Carpeta de Datos!</h1>
            <p style="color:#64748b; max-width:500px; line-height:1.6; margin-bottom:30px;">
                Para que el dashboard funcione en otra computadora, debes copiar la <b>carpeta completa</b> del dashboard.
                <br><small>(Ruta esperada: data/02. Consolidado data/01. Data Generada/)</small>
            </p>
            <button onclick="location.reload()" style="background:var(--ac); color:white; border:none; padding:12px 30px; border-radius:12px; font-weight:800; cursor:pointer; box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">
                Reintentar Cargar
            </button>
        </div>`;
        return;
    }

    initApp();
});

(function startDataWatchdog() {
    let tries = 0;
    const maxTries = 90;
    const timer = setInterval(() => {
        tries++;
        const hasData = !!(window.hcFullData && window.hcFullData.summary && window.hcFullData.summary.length);
        const pane0 = document.getElementById('pane0');
        const stillSearching = !!(pane0 && pane0.innerText && pane0.innerText.indexOf('Buscando Datos') !== -1);

        if (hasData && stillSearching) {
            try {
                window.app = window.hcFullData;
                app = window.app;
                window.activeTab = window.activeTab || 0;
                initApp();
                renderAll();
            } catch (e) {
                console.error('Data watchdog render failed:', e);
            }
        }

        if (!stillSearching || tries >= maxTries) {
            clearInterval(timer);
        }
    }, 1000);
})();


/* ===== presentation.js ===== */
// Presentation helpers extracted from the main HTML.

function updateTopFilterLabels() {
    const map = {
        paisSel: 'btnFilterPais',
        empresaSel: 'btnFilterEmpresa',
        areaSel: 'btnFilterDireccion',
        deptoSel: 'btnFilterDepto',
        yearSel: 'btnFilterYear',
        monthSel: 'btnFilterMonth',
    };

    Object.entries(map).forEach(([selId, btnId]) => {
        const sel = document.getElementById(selId);
        const btn = document.getElementById(btnId);
        if (!sel || !btn) return;

        const span = btn.querySelector('span');
        if (!span) return;

        if (sel.value === 'ALL' || sel.value === '0') {
            const labels = {
                paisSel: 'PAIS',
                empresaSel: 'EMPRESA',
                areaSel: 'DIRECCION',
                deptoSel: 'DEPTO',
                yearSel: 'AGO',
                monthSel: 'MES',
            };
            span.innerText = labels[selId] || 'FILTRO';
            return;
        }

        let val = sel.value;
        if (selId === 'paisSel' && window.paisMap) val = window.paisMap[val] || val;
        if (selId === 'monthSel' && window.monthNamesArr) val = window.monthNamesArr[parseInt(val, 10) - 1] || val;
        span.innerText = val.toUpperCase();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.renderAll) {
            const originalRenderAll = window.renderAll;
            window.renderAll = function () {
                updateTopFilterLabels();
                originalRenderAll.apply(this, arguments);
                if (document.body.classList.contains('zoomed-active') && window.updateZoomHeader) {
                    setTimeout(window.updateZoomHeader, 500);
                }
            };
            renderAll();
        }
    }, 500);
});

document.addEventListener('dblclick', e => {
    const title = e.target.closest('.card-title h2, .card-title h3, .card-box h2, .card-box h3');
    if (!title) return;

    const card = title.closest('.card-box');
    if (!card) return;

    if (card.classList.contains('zoomed')) {
        exitZoomMode();
    } else {
        enterZoomMode(card);
    }
});

console.log('  Presentation Mode (Dbl-Click) Initialized - PowerPoint Style Ready');


/* ===== subview-fix.js ===== */
// Defensive subview repair extracted from the main HTML.

(function () {
    function runSubviewRepair() {
    console.log('[SUBVIEW-FIX] Starting autonomous repair...');

    const pane0 = document.getElementById('pane0');
    let pane0Sub = document.getElementById('pane0Sub');
    let subViewContent = document.getElementById('subViewContent');

    if (!pane0) {
        console.log('[SUBVIEW-FIX] pane0 not ready, waiting for DOM...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runSubviewRepair, { once: true });
        } else {
            setTimeout(runSubviewRepair, 250);
        }
        return;
    }

    if (!pane0Sub) {
        console.log('[SUBVIEW-FIX] Creating pane0Sub from scratch');
        pane0Sub = document.createElement('div');
        pane0Sub.id = 'pane0Sub';
        pane0Sub.className = 'pane-sub';
        pane0Sub.style.cssText = 'display:none; flex-direction:column; gap:20px;';
        pane0Sub.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px; background:#fff; padding:15px 25px; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 10px 30px rgba(0,0,0,0.03);">
                <button onclick="switchView('General')" class="btn-top">
                    <i class="fas fa-arrow-left"></i> VOLVER AL GENERAL
                </button>
                <div style="width:1px; height:30px; background:#e2e8f0;"></div>
                <div>
                    <h2 id="subViewTitle" style="font-size:20px; font-weight:1000; color:#1e293b; letter-spacing:-0.5px; text-transform:uppercase; margin:0;">Detalle</h2>
                    <p id="subViewSubtitle" style="font-size:10px; color:#64748b; font-weight:800; margin:2px 0 0 0; opacity:0.8;">Análisis Profundo y Métricas de Rendimiento</p>
                </div>
            </div>
            <div id="subViewContent" style="flex:1; display:flex; flex-direction:column; gap:20px;"></div>
        `;
    }

    if (pane0Sub.parentElement !== pane0) {
        console.log('[SUBVIEW-FIX] Moving pane0Sub into pane0 (was in: ' + (pane0Sub.parentElement ? pane0Sub.parentElement.id || pane0Sub.parentElement.tagName : 'nowhere') + ')');
        pane0.appendChild(pane0Sub);
    }

    subViewContent = document.getElementById('subViewContent');
    if (!subViewContent) {
        console.log('[SUBVIEW-FIX] Creating subViewContent inside pane0Sub');
        subViewContent = document.createElement('div');
        subViewContent.id = 'subViewContent';
        subViewContent.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:20px;';
        pane0Sub.appendChild(subViewContent);
    } else if (!pane0Sub.contains(subViewContent)) {
        console.log('[SUBVIEW-FIX] Moving subViewContent into pane0Sub');
        pane0Sub.appendChild(subViewContent);
    }

    if (!document.getElementById('subViewTitle')) {
        console.log('[SUBVIEW-FIX] subViewTitle missing, injecting header');
        const header = document.createElement('div');
        header.style.cssText = 'display:flex; align-items:center; gap:20px; background:#fff; padding:15px 25px; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 10px 30px rgba(0,0,0,0.03);';
        header.innerHTML = `
            <button onclick="switchView('General')" class="btn-top"><i class="fas fa-arrow-left"></i> VOLVER AL GENERAL</button>
            <div style="width:1px; height:30px; background:#e2e8f0;"></div>
            <div>
                <h2 id="subViewTitle" style="font-size:20px; font-weight:1000; color:#1e293b; text-transform:uppercase; margin:0;">Detalle</h2>
                <p id="subViewSubtitle" style="font-size:10px; color:#64748b; font-weight:800; margin:2px 0 0 0;">Análisis Profundo</p>
            </div>
        `;
        pane0Sub.insertBefore(header, pane0Sub.firstChild);
    }

    (function setupSwitchView() {
        let originalView = window.switchView;

        window.switchView = function (view) {
            console.log('[SUBVIEW-FIX] switchView called with:', view);

            const main = document.getElementById('pane0Main');
            const sub = document.getElementById('pane0Sub');
            const title = document.getElementById('subViewTitle');

            window._currentSubView = view;

            if (view === 'General') {
                if (main) main.style.setProperty('display', 'flex', 'important');
                if (sub) sub.style.setProperty('display', 'none', 'important');
                if (typeof renderAll === 'function') renderAll();
                return;
            }

            if (typeof exitZoomMode === 'function') exitZoomMode();

            if (main) main.style.setProperty('display', 'none', 'important');
            if (sub) {
                sub.style.setProperty('display', 'flex', 'important');
                sub.style.opacity = '0';
                setTimeout(function () {
                    sub.style.transition = 'opacity 0.4s ease';
                    sub.style.opacity = '1';
                }, 50);
            }
            if (title) title.innerText = view;

            originalView = originalView || window.__originalSwitchView;
            if (originalView && originalView !== window.switchView) {
                try {
                    originalView(view);
                } catch (e) {
                    console.error('[SUBVIEW-FIX] Original switchView error:', e);
                }
            } else {
                console.warn('[SUBVIEW-FIX] Original switchView not yet available, content may not populate.');
            }
        };

        let checkCount = 0;
        const interval = setInterval(function () {
            checkCount++;
            if (window.switchView && window.switchView.name === 'switchView' && window.switchView !== originalView) {
                window.__originalSwitchView = window.switchView;
                originalView = window.switchView;
                clearInterval(interval);
                console.log('[SUBVIEW-FIX] Successfully captured original switchView after ' + (checkCount * 500) + 'ms');
            }
            if (checkCount > 20) clearInterval(interval);
        }, 500);
    })();

    console.log('[SUBVIEW-FIX] Repair complete. DOM state:', {
        pane0Sub_parent: pane0Sub.parentElement.id,
        subViewContent_exists: !!document.getElementById('subViewContent'),
        subViewTitle_exists: !!document.getElementById('subViewTitle'),
        switchView_patched: true,
    });
    }

    runSubviewRepair();
})();

