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
