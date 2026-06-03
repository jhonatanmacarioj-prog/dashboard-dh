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
    if (monthSel) monthSel.style.display = (n === 0 || n === 1 || n === 4 || n === 5) ? 'block' : 'none';

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
