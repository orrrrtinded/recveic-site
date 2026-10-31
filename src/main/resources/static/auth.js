(function () {
    "use strict";

    const html = document.documentElement;
    const isLoginPage = window.location.pathname.endsWith("/login.html");
    const auth = firebase.auth();
    let resolveAuth;
    let authResolved = false;
    let accessUnsubscribe = null;
    let loginPrepared = false;
    let blockingAccess = false;
    let deniedMessage = "";

    window.recvecAuthReady = new Promise(resolve => { resolveAuth = resolve; });

    function resolveAuthOnce(value) {
        if (authResolved) return;
        authResolved = true;
        resolveAuth(value);
    }

    function whenReady(callback) {
        if (document.readyState !== "loading") callback();
        else document.addEventListener("DOMContentLoaded", callback, { once: true });
    }

    function safeNext() {
        const value = new URLSearchParams(window.location.search).get("next");
        return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
    }

    function authMessage(error) {
        const messages = {
            "auth/invalid-email": "Digite um e-mail válido.",
            "auth/user-disabled": "Este acesso foi desativado.",
            "auth/user-not-found": "E-mail ou senha incorretos.",
            "auth/wrong-password": "E-mail ou senha incorretos.",
            "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
            "auth/invalid-credential": "E-mail ou senha incorretos.",
            "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
            "auth/network-request-failed": "Sem conexão com o Firebase. Verifique sua internet.",
            "auth/operation-not-allowed": "Ative o provedor E-mail/Senha no Firebase Authentication."
        };
        return messages[error && error.code] || "Não foi possível entrar. Tente novamente.";
    }

    function setLoginStatus(message, type) {
        const status = document.getElementById("login-status");
        if (!status) return;
        status.textContent = message || "";
        status.className = "login-status" + (type ? " " + type : "");
    }

    function resetLoginSubmit() {
        const submit = document.querySelector("#login-form button[type='submit']");
        if (!submit) return;
        submit.disabled = false;
        submit.textContent = "Entrar no sistema";
    }

    function setupLoginForm() {
        if (loginPrepared) return;
        loginPrepared = true;
        const form = document.getElementById("login-form");
        const resetButton = document.getElementById("reset-password");
        const password = document.getElementById("password");
        const toggle = document.getElementById("toggle-password");

        if (toggle && password) {
            toggle.addEventListener("click", () => {
                const showing = password.type === "text";
                password.type = showing ? "password" : "text";
                toggle.textContent = showing ? "Mostrar" : "Ocultar";
                toggle.setAttribute("aria-pressed", String(!showing));
            });
        }

        if (form) {
            form.addEventListener("submit", async event => {
                event.preventDefault();
                const submit = form.querySelector("button[type='submit']");
                const email = document.getElementById("email").value.trim();
                const passwordValue = password.value;
                submit.disabled = true;
                submit.textContent = "Verificando acesso...";
                setLoginStatus("");
                try {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    await auth.signInWithEmailAndPassword(email, passwordValue);
                    // O redirecionamento só acontece após validar o perfil no Firestore.
                } catch (error) {
                    setLoginStatus(authMessage(error), "error");
                    resetLoginSubmit();
                }
            });
        }

        if (resetButton) {
            resetButton.addEventListener("click", async () => {
                const email = document.getElementById("email").value.trim();
                if (!email) {
                    setLoginStatus("Digite seu e-mail para recuperar a senha.", "error");
                    return;
                }
                try {
                    await auth.sendPasswordResetEmail(email);
                    setLoginStatus("Enviamos um link de recuperação para seu e-mail.", "ok");
                } catch (error) {
                    setLoginStatus(authMessage(error), "error");
                }
            });
        }
    }

    function showLogin(message) {
        whenReady(() => {
            html.classList.remove("auth-pending");
            setupLoginForm();
            resetLoginSubmit();
            if (message) setLoginStatus(message, "error");
        });
    }

    function showAuthenticatedUi(user) {
        document.querySelectorAll("[data-user-email]").forEach(element => {
            element.textContent = user.email || "Usuário autorizado";
        });
        html.classList.remove("auth-pending");
        html.classList.add("auth-ready");
    }

    function stopAccessWatch() {
        if (!accessUnsubscribe) return;
        accessUnsubscribe();
        accessUnsubscribe = null;
    }

    async function blockAccess(message) {
        if (blockingAccess) return;
        blockingAccess = true;
        deniedMessage = message || "Este acesso foi desativado.";
        stopAccessWatch();
        window.recvecCurrentUser = null;
        resolveAuthOnce(null);
        try { await auth.signOut(); } catch (_) {}

        if (isLoginPage) showLogin(deniedMessage);
        else window.location.replace("/login.html?access=disabled");
    }

    function watchAccess(user) {
        if (!firebase.firestore) {
            blockAccess("Não foi possível validar seu acesso. Atualize o site e tente novamente.");
            return;
        }
        const profile = firebase.firestore().collection("usuarios").doc(user.uid);
        accessUnsubscribe = profile.onSnapshot(snapshot => {
            const data = snapshot.exists ? snapshot.data() : null;
            if (!data || data.ativo !== true) {
                blockAccess("Este acesso foi desativado pelo administrador.");
                return;
            }

            if (isLoginPage) {
                window.location.replace(safeNext());
                return;
            }

            window.recvecCurrentUser = user;
            whenReady(() => showAuthenticatedUi(user));
            resolveAuthOnce(user);
        }, () => blockAccess("Não foi possível validar seu acesso. Tente entrar novamente."));
    }

    document.addEventListener("click", async event => {
        const logout = event.target.closest("[data-logout]");
        if (!logout) return;
        logout.disabled = true;
        stopAccessWatch();
        await auth.signOut();
        window.location.replace("/login.html");
    });

    auth.onAuthStateChanged(user => {
        stopAccessWatch();
        if (!user) {
            const wasBlocking = blockingAccess;
            window.recvecCurrentUser = null;
            if (isLoginPage) {
                const requestedMessage = new URLSearchParams(window.location.search).get("access") === "disabled"
                    ? "Este acesso foi desativado pelo administrador."
                    : deniedMessage;
                showLogin(requestedMessage);
                deniedMessage = "";
            } else if (!wasBlocking) {
                const next = window.location.pathname + window.location.search;
                window.location.replace("/login.html?next=" + encodeURIComponent(next));
            }
            blockingAccess = false;
            resolveAuthOnce(null);
            return;
        }

        watchAccess(user);
    });
})();
