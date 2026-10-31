(function () {
    "use strict";

    const endpoint = "/api/ordens-servico";
    let orders = [];
    let filter = "pendentes";
    const selected = new Set();
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
    const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    async function request(url, options) {
        const response = await fetch(url, options);
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data?.message || "Falha na operação.");
        return data;
    }

    const pieces = order => Array.isArray(order.pecas_itens) ? order.pecas_itens : [];
    const records = () => orders.flatMap(order => pieces(order).map((piece, index) => ({ order, piece, index, token: `${order.id_os}:${index}` })));

    function filteredRecords() {
        const term = normalize($("parts-search").value);
        return records().filter(item => {
            const inFilter = filter === "todos" || (filter === "recebida" ? item.piece.status_peca === "recebida" : item.piece.status_peca !== "recebida");
            const searchable = `${item.piece.descricao} ${item.order.marca} ${item.order.veiculo} ${item.order.placa} ${item.order.id_os}`;
            return inFilter && (!term || normalize(searchable).includes(term));
        });
    }

    function syncSelection(visible) {
        const available = new Set(records().map(item => item.token));
        [...selected].forEach(token => { if (!available.has(token)) selected.delete(token); });
        const toolbar = $("parts-bulk-actions");
        toolbar.hidden = !visible.length;
        $("parts-selected-count").textContent = `${selected.size} ${selected.size === 1 ? "selecionada" : "selecionadas"}`;
        $("parts-delete-selected").disabled = !selected.size;
        const selectAll = $("parts-select-all");
        selectAll.checked = visible.length > 0 && visible.every(item => selected.has(item.token));
        selectAll.indeterminate = !selectAll.checked && visible.some(item => selected.has(item.token));
    }

    function render() {
        const all = records();
        const need = all.filter(item => (item.piece.status_peca || "precisa_pedir") === "precisa_pedir");
        const waiting = all.filter(item => item.piece.status_peca === "pedido");
        const received = all.filter(item => item.piece.status_peca === "recebida");
        $("parts-need").textContent = String(need.length).padStart(2, "0");
        $("parts-waiting").textContent = String(waiting.length).padStart(2, "0");
        $("parts-received").textContent = String(received.length).padStart(2, "0");
        const visible = filteredRecords();
        syncSelection(visible);

        $("parts-list").innerHTML = visible.length ? visible.map(({ order, piece, token }) => `
            <article class="part-card ${selected.has(token) ? "is-selected" : ""}">
                <label class="record-select"><input type="checkbox" data-part-select="${token}" ${selected.has(token) ? "checked" : ""}><span>Selecionar</span></label>
                <div class="part-card-main">
                    <div>
                        <span class="part-status part-status--${piece.status_peca || "precisa_pedir"}">${piece.status_peca === "recebida" ? "Recebida" : piece.status_peca === "pedido" ? "Aguardando chegada" : "Precisa pedir"}</span>
                        <h3>${escape(piece.descricao)}</h3>
                        <p>${escape(order.marca)} ${escape(order.veiculo)} · ${escape(order.placa)} · OS #${String(order.id_os).padStart(4, "0")}</p>
                    </div>
                    <strong>${Number(piece.quantidade || 1)} un.</strong>
                </div>
                <div class="part-card-actions">
                    <button type="button" class="part-note-toggle" data-part-note-toggle="${token}" aria-expanded="false"><span aria-hidden="true">✎</span>${piece.observacao ? "Ver/editar observação" : "Adicionar observação"}</button>
                    ${piece.status_peca !== "recebida" ? `<button type="button" class="complete-order-button" data-part-next="${token}">${piece.status_peca === "pedido" ? "Confirmar que chegou" : "Marcar como pedida"}</button>` : ""}
                    <button type="button" class="danger-link" data-part-delete="${token}">Excluir</button>
                </div>
                <div class="part-note-editor" data-part-note-editor="${token}" hidden>
                    <div class="part-note-editor-head"><div><span>Observação da peça</span><small>Informações internas, prazo ou link de compra</small></div><button type="button" data-close-part-note="${token}" aria-label="Fechar observação">×</button></div>
                    <textarea data-part-note="${token}" placeholder="Ex.: prazo de chegada, fornecedor ou link de compra...">${escape(piece.observacao || "")}</textarea>
                    <div class="part-note-editor-actions"><button type="button" data-close-part-note="${token}">Cancelar</button><button type="button" class="complete-order-button" data-save-note="${token}">Salvar observação</button></div>
                </div>
            </article>`).join("") : `<div class="archive-empty"><strong>Nenhuma peça neste filtro.</strong><span>As peças entram aqui quando um orçamento vira OS.</span></div>`;
    }

    async function update(token, kind) {
        const [id, indexText] = token.split(":");
        const order = orders.find(item => Number(item.id_os) === Number(id));
        const index = Number(indexText);
        const items = [...pieces(order)];
        const piece = { ...items[index] };
        if (kind === "note") piece.observacao = document.querySelector(`[data-part-note="${token}"]`).value.trim();
        else piece.status_peca = piece.status_peca === "pedido" ? "recebida" : "pedido";
        items[index] = piece;
        await request(`${endpoint}/${order.id_os}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...order, pecas_itens: items, atualizado_em: new Date().toISOString() }) });
        await load();
    }

    async function deletePieces(tokens) {
        const unique = [...new Set(tokens)].filter(Boolean);
        if (!unique.length || !(await window.recvecConfirmDelete({ count: unique.length, label: "peça", pluralLabel: "peças" }))) return;
        const byOrder = new Map();
        unique.forEach(token => {
            const current = records().find(item => item.token === token);
            if (!current) return;
            if (!byOrder.has(current.order.id_os)) byOrder.set(current.order.id_os, []);
            byOrder.get(current.order.id_os).push(current.index);
        });
        await Promise.all([...byOrder.entries()].map(async ([id, indexes]) => {
            const order = orders.find(item => Number(item.id_os) === Number(id));
            const removed = new Set(indexes);
            const nextParts = pieces(order).filter((_, index) => !removed.has(index));
            let partIndex = 0;
            const nextItems = Array.isArray(order.itens) ? order.itens.filter(item => item.tipo !== "peca" || !removed.has(partIndex++)) : order.itens;
            await request(`${endpoint}/${order.id_os}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...order, itens: nextItems, pecas_itens: nextParts, atualizado_em: new Date().toISOString() }) });
        }));
        selected.clear();
        await load();
    }

    function toggleNote(token, open) {
        const editor = document.querySelector(`[data-part-note-editor="${token}"]`);
        const button = document.querySelector(`[data-part-note-toggle="${token}"]`);
        if (!editor || !button) return;
        editor.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        button.classList.toggle("is-open", open);
        if (open) editor.querySelector("textarea")?.focus();
    }

    function cancelNote(token) {
        const current = records().find(item => item.token === token);
        const textarea = document.querySelector(`[data-part-note="${token}"]`);
        if (textarea) textarea.value = current?.piece.observacao || "";
        toggleNote(token, false);
    }

    async function load() { orders = await request(endpoint); render(); }

    $("parts-list").onclick = event => {
        const select = event.target.closest("[data-part-select]");
        const toggle = event.target.closest("[data-part-note-toggle]");
        const close = event.target.closest("[data-close-part-note]");
        const save = event.target.closest("[data-save-note]");
        const next = event.target.closest("[data-part-next]");
        const remove = event.target.closest("[data-part-delete]");
        if (select) { select.checked ? selected.add(select.dataset.partSelect) : selected.delete(select.dataset.partSelect); render(); return; }
        if (toggle) { toggleNote(toggle.dataset.partNoteToggle, toggle.getAttribute("aria-expanded") !== "true"); return; }
        if (close) { cancelNote(close.dataset.closePartNote); return; }
        if (save) { save.disabled = true; update(save.dataset.saveNote, "note").catch(error => { save.disabled = false; alert(error.message); }); return; }
        if (next) { update(next.dataset.partNext, "status").catch(error => alert(error.message)); return; }
        if (remove) deletePieces([remove.dataset.partDelete]).catch(error => alert(error.message));
    };

    $("parts-select-all").onchange = event => { const visible = filteredRecords(); visible.forEach(item => event.target.checked ? selected.add(item.token) : selected.delete(item.token)); render(); };
    $("parts-delete-selected").onclick = () => deletePieces([...selected]).catch(error => alert(error.message));
    $("parts-search").oninput = render;
    document.querySelector(".status-filters").onclick = event => { const button = event.target.closest("[data-parts-filter]"); if (!button) return; filter = button.dataset.partsFilter; document.querySelectorAll("[data-parts-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button))); render(); };
    window.recvecAuthReady.then(user => { if (user) load().catch(error => { $("parts-list").innerHTML = `<div class="archive-empty">${escape(error.message)}</div>`; }); });
})();
