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
            var curY, curM, targetY, targetM;


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
            const mapSingleRecord = (e, mappings) => {
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
            const performGlobalMapping = window.performGlobalMapping;

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


