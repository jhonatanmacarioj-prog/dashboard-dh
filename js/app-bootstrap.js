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
