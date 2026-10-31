(function () {
    "use strict";

    const endpoint = "/api/ordens-servico";
    const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    let orders = [];
    let openedOrderId = null;

    const $ = id => document.getElementById(id);
    const money = value => currency.format(Number(value || 0));
    const pad = value => String(value || 0).padStart(4, "0");
    const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
    const normalize = value => String(value || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const carIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 10 6.7 6.6A2.6 2.6 0 0 1 9.1 5h5.8a2.6 2.6 0 0 1 2.4 1.6l1.5 3.4 1.2.6c.6.3 1 .9 1 1.6V17a1 1 0 0 1-1 1h-1v1.2a.8.8 0 0 1-.8.8h-1.4a.8.8 0 0 1-.8-.8V18H8v1.2a.8.8 0 0 1-.8.8H5.8a.8.8 0 0 1-.8-.8V18H4a1 1 0 0 1-1-1v-4.8c0-.7.4-1.3 1-1.6l1.2-.6Zm2.2 0h9.2l-1.1-2.5a.8.8 0 0 0-.7-.5H9.2a.8.8 0 0 0-.7.5L7.4 10ZM6.5 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>`;

    async function request(url, options) {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Falha na operacao.");
        return data;
    }

    const isOpen = order => order.status_os !== "concluida" && !order.data_conclusao;
    const items = order => Array.isArray(order.itens)
        ? order.itens
        : [
            ...(order.servicos || []).map(item => ({ ...item, tipo: item.tipo || "servico" })),
            ...(order.pecas_itens || []).map(item => ({ ...item, tipo: "peca" }))
        ];
    const parts = order => Array.isArray(order.pecas_itens)
        ? order.pecas_itens
        : items(order).filter(item => item.tipo === "peca");
    const pendingParts = order => parts(order).filter(item => item.status_peca !== "recebida");

    function statusLabel(value) {
        if (value === "recebida") return "Recebida";
        if (value === "pedido") return "Aguardando chegada";
        return "Precisa pedir";
    }

    async function save(order, changes, reopen = false) {
        await request(`${endpoint}/${order.id_os}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...order, ...changes, atualizado_em: new Date().toISOString() })
        });
        await load();
        if (reopen) openDetails(Number(order.id_os));
    }

    function renderAvailable(available) {
        $("available-orders").innerHTML = available.length
            ? available.map(order => `
                <article>
                    <div>
                        <strong>${escape(order.marca)} ${escape(order.veiculo)}</strong>
                        <span>${escape(order.placa)} · OS #${pad(order.id_os)}</span>
                        <small>${escape(order.cliente_nome)}</small>
                    </div>
                    <button type="button" data-enter="${order.id_os}">Colocar na oficina</button>
                </article>
            `).join("")
            : '<p class="muted">Nenhuma OS aguardando entrada.</p>';
    }

    function renderCars(active) {
        const term = normalize($("week-search").value);
        const filtered = active.filter(order => !term || normalize(
            `${order.cliente_nome} ${order.marca} ${order.veiculo} ${order.placa}`
        ).includes(term));

        $("week-cards").innerHTML = filtered.length
            ? filtered.map(order => {
                const orderItems = items(order);
                const pending = pendingParts(order);
                const budgetNumber = order.id_orcamento_origem || order.id_orcamento;
                return `
                    <article class="week-car">
                        <div class="week-car-presence">
                            <span class="week-car-icon">${carIcon}</span>
                            <span class="week-car-presence-copy"><small>NA OFICINA</small><strong>Em atendimento</strong></span>
                            <span class="week-car-live"><i></i> Agora</span>
                        </div>
                        <div class="week-car-topline">
                            <span>OS #${pad(order.id_os)}</span>
                            <span>${budgetNumber ? `OR #${pad(budgetNumber)}` : "Orçamento vinculado"}</span>
                        </div>
                        <div class="week-car-main">
                            <div>
                                <h3>${escape(order.marca)} ${escape(order.veiculo)}</h3>
                                <p><b class="week-car-plate">${escape(order.placa)}</b><span>${escape(order.cliente_nome)}</span></p>
                            </div>
                            <strong>${money(order.valor_total)}</strong>
                        </div>
                        <div class="week-car-summary">
                            <span><b>${orderItems.length}</b> itens no orcamento</span>
                            <span class="${pending.length ? "has-pending" : ""}"><b>${pending.length}</b> peças pendentes</span>
                        </div>
                        <div class="week-car-actions">
                            <button type="button" class="week-open-budget" data-week-open="${order.id_os}">Abrir orçamento</button>
                            <button type="button" data-leave="${order.id_os}">Retirar</button>
                        </div>
                    </article>
                `;
            }).join("")
            : `<div class="archive-empty week-garage-empty"><span class="week-car-icon">${carIcon}</span><strong>Nenhum carro na oficina.</strong><span>Selecione uma OS disponível para registrar a entrada.</span></div>`;
    }

    function render() {
        const active = orders.filter(order => isOpen(order) && order.na_oficina);
        const available = orders.filter(order => isOpen(order) && !order.na_oficina);
        const allParts = active.flatMap(parts);

        $("week-cars").textContent = String(active.length).padStart(2, "0");
        $("week-pending").textContent = String(allParts.filter(part => part.status_peca !== "recebida").length).padStart(2, "0");
        $("week-ordered").textContent = String(allParts.filter(part => part.status_peca === "pedido").length).padStart(2, "0");
        renderAvailable(available);
        renderCars(active);
    }

    function itemRows(order) {
        const orderItems = items(order);
        if (!orderItems.length) return '<p class="week-detail-empty">Nenhum servico ou peca informado.</p>';
        return orderItems.map(item => `
            <div class="week-budget-item">
                <span class="week-item-type week-item-type--${item.tipo === "peca" ? "part" : "service"}">${item.tipo === "peca" ? "Peca" : "Servico"}</span>
                <div><strong>${escape(item.descricao)}</strong>${item.observacao ? `<small>${escape(item.observacao)}</small>` : ""}</div>
                <span>${Number(item.quantidade || 1)}x</span>
                <b>${money(Number(item.preco || 0) * Number(item.quantidade || 1))}</b>
            </div>
        `).join("");
    }

    function partControls(order) {
        const orderParts = parts(order);
        if (!orderParts.length) return '<p class="week-detail-empty">Este orcamento nao possui pecas.</p>';
        return orderParts.map((part, index) => `
            <article class="week-detail-part">
                <div class="week-detail-part-head">
                    <strong>${escape(part.descricao)}</strong>
                    <span class="part-status part-status--${part.status_peca || "precisa_pedir"}">${statusLabel(part.status_peca)}</span>
                </div>
                <textarea data-part-note="${order.id_os}:${index}" placeholder="Observacao, previsao ou link para comprar...">${escape(part.observacao || "")}</textarea>
                <div class="week-detail-part-actions">
                    <button type="button" data-save-note="${order.id_os}:${index}">Salvar observacao</button>
                    ${part.status_peca !== "recebida" ? `<button type="button" class="complete-order-button" data-part-next="${order.id_os}:${index}">${part.status_peca === "pedido" ? "Confirmar chegada" : "Marcar como pedida"}</button>` : ""}
                </div>
            </article>
        `).join("");
    }

    function openDetails(id) {
        const order = orders.find(item => Number(item.id_os) === Number(id));
        if (!order) return;
        openedOrderId = Number(id);
        const budgetNumber = order.id_orcamento_origem || order.id_orcamento;
        $("week-detail-title").textContent = `${order.marca || ""} ${order.veiculo || ""}`.trim();
        $("week-detail-content").innerHTML = `
            <section class="week-detail-identity">
                <div><small>Cliente</small><strong>${escape(order.cliente_nome)}</strong><span>${escape(order.cliente_telefone || "")}</span></div>
                <div><small>Veiculo</small><strong>${escape(order.placa)}</strong><span>OS #${pad(order.id_os)}${budgetNumber ? ` · OR #${pad(budgetNumber)}` : ""}</span></div>
            </section>
            <section class="week-detail-section">
                <div class="week-detail-heading"><div><span class="step-label">Proposta aprovada</span><h3>Orcamento do carro</h3></div><strong>${money(order.valor_total)}</strong></div>
                <div class="week-budget-items">${itemRows(order)}</div>
                <div class="week-budget-totals">
                    <span>Servicos <b>${money(order.total_servicos)}</b></span>
                    <span>Pecas <b>${money(order.total_pecas ?? order.pecas)}</b></span>
                    <span>Mao de obra <b>${money(order.mao_obra)}</b></span>
                </div>
            </section>
            <section class="week-detail-section">
                <div class="week-detail-heading"><div><span class="step-label">Acompanhamento</span><h3>Pecas deste carro</h3></div><span>${pendingParts(order).length} pendentes</span></div>
                <div class="week-detail-parts">${partControls(order)}</div>
            </section>
        `;
        const dialog = $("week-detail-dialog");
        if (!dialog.open) dialog.showModal();
    }

    async function updatePart(token, action) {
        const [id, indexText] = token.split(":");
        const order = orders.find(item => Number(item.id_os) === Number(id));
        if (!order) return;
        const index = Number(indexText);
        const orderParts = [...parts(order)];
        const part = { ...orderParts[index] };

        if (action === "note") {
            part.observacao = document.querySelector(`[data-part-note="${token}"]`).value.trim();
        } else {
            part.status_peca = part.status_peca === "pedido" ? "recebida" : "pedido";
        }
        orderParts[index] = part;

        let partIndex = -1;
        const updatedItems = items(order).map(item => {
            if (item.tipo !== "peca") return item;
            partIndex += 1;
            return partIndex === index ? part : item;
        });
        await save(order, { pecas_itens: orderParts, itens: updatedItems }, true);
    }

    async function load() {
        orders = await request(endpoint);
        render();
    }

    $("available-orders").addEventListener("click", event => {
        const id = event.target.closest("[data-enter]")?.dataset.enter;
        if (!id) return;
        const order = orders.find(item => Number(item.id_os) === Number(id));
        save(order, { na_oficina: true, entrada_oficina: new Date().toISOString() })
            .catch(error => alert(error.message));
    });

    $("week-cards").addEventListener("click", event => {
        const openId = event.target.closest("[data-week-open]")?.dataset.weekOpen;
        const leaveId = event.target.closest("[data-leave]")?.dataset.leave;
        if (openId) openDetails(Number(openId));
        if (leaveId) {
            const order = orders.find(item => Number(item.id_os) === Number(leaveId));
            save(order, { na_oficina: false, entrada_oficina: null }).catch(error => alert(error.message));
        }
    });

    $("week-detail-content").addEventListener("click", event => {
        const note = event.target.closest("[data-save-note]")?.dataset.saveNote;
        const next = event.target.closest("[data-part-next]")?.dataset.partNext;
        if (note) updatePart(note, "note").catch(error => alert(error.message));
        if (next) updatePart(next, "status").catch(error => alert(error.message));
    });

    document.querySelector("[data-close-week-detail]").addEventListener("click", () => {
        openedOrderId = null;
        $("week-detail-dialog").close();
    });
    $("week-detail-dialog").addEventListener("click", event => {
        if (event.target === $("week-detail-dialog")) {
            openedOrderId = null;
            $("week-detail-dialog").close();
        }
    });
    $("week-search").addEventListener("input", render);

    window.recvecAuthReady.then(user => {
        if (user) load().catch(error => {
            $("week-cards").innerHTML = `<div class="archive-empty">${escape(error.message)}</div>`;
        });
    });
})();
