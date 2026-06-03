// --- AUTHENTICATION & SESSION MANAGEMENT ---
console.log("Auth Script Initializing...");

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
