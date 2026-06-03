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
