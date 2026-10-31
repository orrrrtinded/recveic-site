(function () {
    "use strict";

    const money = value => new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value || 0));

    const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));

    function getItems(order) {
        if (Array.isArray(order.itens)) return order.itens;
        const services = Array.isArray(order.servicos)
            ? order.servicos.map(item => ({ ...item, tipo: item.tipo || "servico" }))
            : [];
        const parts = Array.isArray(order.pecas_itens)
            ? order.pecas_itens.map(item => ({ ...item, tipo: "peca" }))
            : [];
        return [...services, ...parts];
    }

    function addButtons() {
        document.querySelectorAll(".work-order-card").forEach(card => {
            const actions = card.querySelector(".order-card-actions");
            if (!actions || actions.querySelector("[data-order-pdf]")) return;
            const id = card.querySelector(".work-order-code span")?.textContent.match(/\d+/)?.[0];
            if (!id) return;

            const button = document.createElement("button");
            button.type = "button";
            button.dataset.orderPdf = id;
            button.textContent = "Gerar PDF";
            actions.prepend(button);
        });
    }

    function styles() {
        return `
            *{box-sizing:border-box}
            body{margin:26px;color:#171917;font:12px Arial,sans-serif}
            header{display:grid;grid-template-columns:1fr 1.55fr auto;gap:18px;align-items:end}
            .brand{display:flex;gap:10px;align-items:center}.brand-mark{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:#557239;color:#fff;font-weight:900}
            .brand b{display:block;font-size:15px}.brand small,.title small,.number small{display:block;margin-top:3px;color:#6f756b;font-size:8px;text-transform:uppercase;letter-spacing:.13em}
            .title h1{margin:4px 0 0;font-size:31px;letter-spacing:-.04em}.number{text-align:right}.number strong{display:block;font-size:21px}.number span{display:block;margin-top:5px;color:#6f756b;font-size:9px}
            .accent{height:5px;margin:17px 0 22px;background:#557239}
            .block{margin-top:17px}.block-title{display:flex;gap:8px;align-items:center;margin-bottom:8px}.block-title span{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:#e4ecd9;color:#3d5526;font-size:8px;font-weight:900}.block-title strong{font-size:10px;text-transform:uppercase;letter-spacing:.09em}
            dl{display:grid;grid-template-columns:repeat(3,1fr);margin:0;border:1px solid #cdd2c8}dl div{padding:9px;border-right:1px solid #cdd2c8}dl div:last-child{border:0}dt{color:#747a70;font-size:7px;text-transform:uppercase;letter-spacing:.06em}dd{margin:4px 0 0;font-weight:800}
            table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #cdd2c8;text-align:left}th{background:#eef1ea;font-size:8px;text-transform:uppercase;letter-spacing:.06em}td:last-child,th:last-child{text-align:right}
            .notes{min-height:58px;padding:10px;border:1px solid #cdd2c8;white-space:pre-wrap}
            .summary{display:grid;grid-template-columns:repeat(4,1fr);margin-top:17px;border:1px solid #cdd2c8}.summary div{padding:10px;border-right:1px solid #cdd2c8}.summary div:last-child{border:0;background:#557239;color:#fff}.summary span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.06em}.summary strong{display:block;margin-top:4px;font-size:14px}
            .signatures{display:grid;grid-template-columns:1fr 1fr;gap:72px;margin:58px 28px 0}.signature{padding-top:6px;border-top:1px solid #171917;text-align:center;font-size:9px}.signature small{display:block;margin-top:3px;color:#777}
            footer{display:flex;justify-content:space-between;margin-top:25px;padding-top:9px;border-top:1px solid #cdd2c8;color:#777;font-size:8px;text-transform:uppercase;letter-spacing:.07em}
            @page{size:A4;margin:11mm}
            @media print{body{margin:0}.no-print{display:none}}
        `;
    }

    function documentBody(order) {
        const items = getItems(order);
        const date = order.data_abertura || order.data_emissao || "";
        const notes = order.observacoes_execucao || order.observacoes || "Nenhuma observacao informada.";
        const rows = items.length
            ? items.map(item => `<tr><td>${item.tipo === "peca" ? "Peça" : "Serviço"}</td><td>${escape(item.descricao)}</td><td>${Number(item.quantidade || 1)}</td><td>${money(Number(item.preco || 0) * Number(item.quantidade || 1))}</td></tr>`).join("")
            : `<tr><td colspan="4">Nenhum item informado.</td></tr>`;

        return `
            <header>
                <div class="brand"><span class="brand-mark">RV</span><div><b>RecVec</b><small>Gestão de oficina</small></div></div>
                <div class="title"><small>Documento de execução</small><h1>Ordem de serviço</h1></div>
                <div class="number"><small>Número da OS</small><strong>#${String(order.id_os).padStart(4, "0")}</strong><span>${escape(date)}</span></div>
            </header>
            <div class="accent"></div>
            <section class="block"><div class="block-title"><span>01</span><strong>Cliente</strong></div><dl>
                <div><dt>Nome</dt><dd>${escape(order.cliente_nome)}</dd></div>
                <div><dt>Telefone</dt><dd>${escape(order.cliente_telefone)}</dd></div>
                <div><dt>Documento</dt><dd>${escape(order.cliente_documento || "-")}</dd></div>
            </dl></section>
            <section class="block"><div class="block-title"><span>02</span><strong>Veículo</strong></div><dl>
                <div><dt>Modelo</dt><dd>${escape(order.marca)} ${escape(order.veiculo)}</dd></div>
                <div><dt>Placa</dt><dd>${escape(order.placa)}</dd></div>
                <div><dt>Ano / cor</dt><dd>${escape(order.ano || "-")} · ${escape(order.cor || "-")}</dd></div>
            </dl></section>
            <section class="block"><div class="block-title"><span>03</span><strong>Serviços e peças</strong></div><table>
                <thead><tr><th>Tipo</th><th>Descrição</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${rows}</tbody>
            </table></section>
            <section class="block"><div class="block-title"><span>04</span><strong>Observações da execução</strong></div><div class="notes">${escape(notes)}</div></section>
            <section class="summary">
                <div><span>Serviços</span><strong>${money(order.total_servicos)}</strong></div>
                <div><span>Peças</span><strong>${money(order.total_pecas ?? order.pecas)}</strong></div>
                <div><span>Mão de obra</span><strong>${money(order.mao_obra)}</strong></div>
                <div><span>Total</span><strong>${money(order.valor_total)}</strong></div>
            </section>
            <div class="signatures">
                <div class="signature">Assinatura do cliente<small>${escape(order.cliente_nome || "Cliente")}</small></div>
                <div class="signature">Assinatura do tecnico responsavel<small>Tecnico</small></div>
            </div>
            <footer><span>RecVec / Ordem de serviço</span><span>Documento emitido pelo sistema</span></footer>
        `;
    }

    function printOrder(order) {
        const popup = window.open("", "_blank", "width=920,height=1050");
        if (!popup) {
            alert("O navegador bloqueou a janela do PDF. Permita pop-ups para este site.");
            return;
        }
        popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OS-${order.id_os}</title><style>${styles()}</style></head><body>${documentBody(order)}<script>window.onload=()=>window.print()<\/script></body></html>`);
        popup.document.close();
    }

    const target = document.getElementById("orders-list");
    if (target) new MutationObserver(addButtons).observe(target, { childList: true, subtree: true });
    addButtons();

    document.addEventListener("click", async event => {
        const button = event.target.closest("[data-order-pdf]");
        if (!button) return;
        try {
            const response = await fetch("/api/ordens-servico");
            const orders = await response.json();
            const order = orders.find(item => Number(item.id_os) === Number(button.dataset.orderPdf));
            if (order) printOrder(order);
        } catch (error) {
            alert("Não foi possível gerar o PDF desta ordem.");
        }
    });
})();
