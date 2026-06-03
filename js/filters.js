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

