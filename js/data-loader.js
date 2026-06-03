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
