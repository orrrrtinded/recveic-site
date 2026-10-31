(function () {
    "use strict";

    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = "/favicon.png?v=1";
    document.head.appendChild(favicon);

    const touchIcon = document.createElement("link");
    touchIcon.rel = "apple-touch-icon";
    touchIcon.href = "/favicon.png?v=1";
    document.head.appendChild(touchIcon);

    const pages = {
        home: { label: "Painel", href: "/" },
        clientes: { label: "Clientes", href: "/clientes.html", index: "01", description: "Pessoas, contatos e histórico de relacionamento." },
        veiculos: { label: "Veículos", href: "/veiculos.html", index: "02", description: "Identificação e vínculo da frota atendida." },
        orcamentos: { label: "Orçamentos", href: "/orcamentos.html", index: "01", description: "Propostas, itens e aprovação do cliente." },
        ordens: { label: "Ordens", href: "/ordens-servico.html", index: "02", description: "Execução, presença na oficina e conclusão." },
        semana: { label: "Semana", href: "/semana.html", index: "03", description: "Carros que estão fisicamente na oficina." },
        pecas: { label: "Peças", href: "/pecas-pedir.html", index: "04", description: "Pedidos, chegada e observações de peças." },
        pagamentos: { label: "Pagamentos", href: "/pagamentos.html", index: "05", description: "Recebimentos vinculados às ordens concluídas." }
    };
    const navigationGroups = [
        { label: "Rotina", keys: ["semana", "ordens", "pecas"] },
        { label: "Atendimento", keys: ["orcamentos", "pagamentos"] }
    ];

    function ready(callback) {
        if (document.readyState !== "loading") callback();
        else document.addEventListener("DOMContentLoaded", callback, { once: true });
    }

    function currentTheme() {
        try { return localStorage.getItem("theme") || "light"; }
        catch (_) { return "light"; }
    }

    function applyTheme(theme) {
        document.documentElement.classList.remove("theme-light", "theme-dark");
        document.documentElement.classList.add("theme-" + theme);
        try { localStorage.setItem("theme", theme); } catch (_) {}
        document.querySelectorAll("[data-theme-toggle]").forEach(button => {
            const dark = theme === "dark";
            button.setAttribute("aria-pressed", String(dark));
            button.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
            button.innerHTML = `<span aria-hidden="true">${dark ? "☀" : "◐"}</span><span>${dark ? "Claro" : "Escuro"}</span>`;
        });
    }

    function createAppBar(currentPage) {
        const nav = document.createElement("nav");
        nav.className = "appbar";
        nav.setAttribute("aria-label", "Navegacao principal");

        const links = navigationGroups.map(group => `<div class="app-nav-group"><span class="app-nav-label">${group.label}</span>${group.keys.map(key => `<a href="${pages[key].href}"${key === currentPage ? ' aria-current="page"' : ""}>${pages[key].label}</a>`).join("")}</div>`).join("");

        nav.innerHTML = `
            <a class="app-brand" href="/" aria-label="RecVec - painel">
                <img class="brand-logo" src="/favicon.png?v=1" alt="" width="38" height="38">
                <span><strong>RecVec</strong><small>gestão de oficina</small></span>
            </a>
            <div class="app-links"><a class="app-home-link" href="/"${currentPage === "home" ? ' aria-current="page"' : ""}>Início</a>${links}</div>
            <div class="app-actions">
                <button class="theme-control" type="button" data-theme-toggle></button>
                <div class="user-chip"><span class="user-avatar" aria-hidden="true"></span><span data-user-email>Usuario</span></div>
                <button class="logout-control" type="button" data-logout>Sair</button>
            </div>`;
        document.body.prepend(nav);
        if (window.recvecCurrentUser) {
            nav.querySelector("[data-user-email]").textContent = window.recvecCurrentUser.email || "Usuário autorizado";
        }
    }

    function refineModulePage(pageKey) {
        const meta = pages[pageKey];
        const header = document.querySelector(".header");
        if (!meta || !header) return;

        const eyebrow = header.querySelector(".eyebrow");
        const group = navigationGroups.find(item => item.keys.includes(pageKey));
        if (eyebrow) eyebrow.textContent = `${group?.label || "Oficina"} / ${meta.label}`;
        header.dataset.index = meta.index;

        if (!header.querySelector(".header-description")) {
            const description = document.createElement("p");
            description.className = "header-description";
            description.textContent = meta.description;
            header.appendChild(description);
        }

        const panels = document.querySelectorAll(".panel");
        if (panels[0]) panels[0].classList.add("panel-form");
        if (panels[1]) panels[1].classList.add("panel-list");
    }

    function startRotatingPhrase() {
        const phrase = document.getElementById("rotating-phrase");
        if (!phrase) return;
        const messages = ["Oficina", "Orçamentos", "Ordens", "Semana", "Peças"];
        let index = 0;
        window.setInterval(() => {
            phrase.classList.add("is-changing");
            window.setTimeout(() => {
                index = (index + 1) % messages.length;
                phrase.textContent = messages[index];
                phrase.classList.remove("is-changing");
            }, 220);
        }, 3400);
    }

    function confirmDelete(options) {
        const config = options || {};
        const count = Number(config.count || 1);
        const label = config.label || "registro";
        let dialog = document.getElementById("recvec-delete-dialog");

        if (!dialog) {
            dialog = document.createElement("dialog");
            dialog.id = "recvec-delete-dialog";
            dialog.className = "delete-confirm-dialog";
            dialog.innerHTML = `
                <form method="dialog">
                    <span class="delete-confirm-mark" aria-hidden="true">×</span>
                    <span class="step-label">Ação irreversível</span>
                    <h2 data-delete-title>Excluir registros?</h2>
                    <p data-delete-copy>Digite <strong>confirmar</strong> para continuar.</p>
                    <label class="field"><span>Confirmação</span><input data-delete-input autocomplete="off" placeholder="Digite confirmar"></label>
                    <div class="completion-actions">
                        <button type="button" data-delete-cancel>Cancelar</button>
                        <button type="submit" class="danger-action" data-delete-approve disabled>Excluir</button>
                    </div>
                </form>`;
            document.body.appendChild(dialog);
        }

        const title = dialog.querySelector("[data-delete-title]");
        const copy = dialog.querySelector("[data-delete-copy]");
        const input = dialog.querySelector("[data-delete-input]");
        const approve = dialog.querySelector("[data-delete-approve]");
        const cancel = dialog.querySelector("[data-delete-cancel]");
        const noun = count === 1 ? label : (config.pluralLabel || `${label}s`);
        title.textContent = count === 1 ? `Excluir este ${label}?` : `Excluir ${count} ${noun}?`;
        copy.innerHTML = `Esta ação não pode ser desfeita. Digite <strong>confirmar</strong> para continuar.`;
        input.value = "";
        approve.disabled = true;

        return new Promise(resolve => {
            let finished = false;
            const finish = approved => {
                if (finished) return;
                finished = true;
                dialog.removeEventListener("cancel", onCancel);
                cancel.removeEventListener("click", onCancel);
                input.removeEventListener("input", validate);
                dialog.querySelector("form").removeEventListener("submit", onSubmit);
                if (dialog.open) dialog.close();
                resolve(approved);
            };
            const validate = () => { approve.disabled = input.value.trim().toLocaleLowerCase("pt-BR") !== "confirmar"; };
            const onCancel = event => { if (event) event.preventDefault(); finish(false); };
            const onSubmit = event => { event.preventDefault(); if (!approve.disabled) finish(true); };
            dialog.addEventListener("cancel", onCancel);
            cancel.addEventListener("click", onCancel);
            input.addEventListener("input", validate);
            dialog.querySelector("form").addEventListener("submit", onSubmit);
            dialog.showModal();
            window.setTimeout(() => input.focus(), 60);
        });
    }

    window.recvecConfirmDelete = confirmDelete;

    function setupBudgetBulkDelete() {
        const list = document.getElementById("budgets-list");
        const toolbar = document.getElementById("budgets-bulk-actions");
        if (!list || !toolbar) return;
        const selected = new Set();
        const selectAll = document.getElementById("budgets-select-all");
        const count = document.getElementById("budgets-selected-count");
        const remove = document.getElementById("budgets-delete-selected");

        function cards() {
            return [...list.querySelectorAll("[data-budget-delete]")].map(button => ({ id: String(button.dataset.budgetDelete), card: button.closest(".order-card") })).filter(item => item.card);
        }

        function sync() {
            const visible = cards();
            const ids = new Set(visible.map(item => item.id));
            [...selected].forEach(id => { if (!ids.has(id)) selected.delete(id); });
            visible.forEach(item => {
                let checkbox = item.card.querySelector("[data-budget-select]");
                if (!checkbox) {
                    const label = document.createElement("label");
                    label.className = "record-select";
                    label.innerHTML = `<input type="checkbox" data-budget-select="${item.id}"><span>Selecionar</span>`;
                    item.card.prepend(label);
                    checkbox = label.querySelector("input");
                }
                checkbox.checked = selected.has(item.id);
                item.card.classList.toggle("is-bulk-selected", checkbox.checked);
            });
            toolbar.hidden = !visible.length;
            count.textContent = `${selected.size} ${selected.size === 1 ? "selecionado" : "selecionados"}`;
            remove.disabled = !selected.size;
            selectAll.checked = visible.length > 0 && visible.every(item => selected.has(item.id));
            selectAll.indeterminate = !selectAll.checked && visible.some(item => selected.has(item.id));
        }

        async function deleteBudgets(ids) {
            const unique = [...new Set(ids)].filter(Boolean);
            if (!unique.length || !(await confirmDelete({ count: unique.length, label: "orçamento", pluralLabel: "orçamentos" }))) return;
            await Promise.all(unique.map(async id => {
                const response = await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.message || "Não foi possível excluir o orçamento.");
                }
            }));
            selected.clear();
            window.location.reload();
        }

        list.addEventListener("click", event => {
            const checkbox = event.target.closest("[data-budget-select]");
            const singleDelete = event.target.closest("[data-budget-delete]");
            if (checkbox) {
                event.stopImmediatePropagation();
                checkbox.checked ? selected.add(String(checkbox.dataset.budgetSelect)) : selected.delete(String(checkbox.dataset.budgetSelect));
                sync();
                return;
            }
            if (singleDelete) {
                event.stopImmediatePropagation();
                deleteBudgets([singleDelete.dataset.budgetDelete]).catch(error => alert(error.message));
            }
        }, true);
        selectAll.addEventListener("change", event => { cards().forEach(item => event.target.checked ? selected.add(item.id) : selected.delete(item.id)); sync(); });
        remove.addEventListener("click", () => deleteBudgets([...selected]).catch(error => alert(error.message)));
        new MutationObserver(sync).observe(list, { childList: true, subtree: true });
        sync();
    }

    ready(function () {
        const page = document.body.dataset.page || "home";
        applyTheme(currentTheme());

        if (page !== "login") {
            document.querySelectorAll("main > .btn-home, main > #theme-toggle").forEach(element => element.remove());
            createAppBar(page);
            refineModulePage(page);
            applyTheme(currentTheme());
            const supportScript = document.createElement("script");
            supportScript.src = "/support.js?v=6";
            supportScript.defer = true;
            document.head.appendChild(supportScript);
        }
        if (page === "ordens") {
            const printScript = document.createElement("script");
            printScript.src = "/print-order.js?v=2";
            document.head.appendChild(printScript);
        }
        if (page === "orcamentos") {
            const budgetPrintScript = document.createElement("script");
            budgetPrintScript.src = "/print-budget.js?v=2";
            document.head.appendChild(budgetPrintScript);
        }
        if (page === "orcamentos") setupBudgetBulkDelete();
        startRotatingPhrase();

        document.addEventListener("click", event => {
            if (!event.target.closest("[data-theme-toggle]")) return;
            applyTheme(currentTheme() === "dark" ? "light" : "dark");
        });
    });
})();
