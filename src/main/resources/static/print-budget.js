(function () {
    "use strict";

    const money = value => new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value || 0));

    const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));

    function addButtons() {
        document.querySelectorAll(".order-card").forEach(card => {
            const actions = card.querySelector(".order-card-actions");
            if (!actions || actions.querySelector("[data-budget-pdf]")) return;
            const id = card.querySelector(".order-card-top span")?.textContent.match(/\d+/)?.[0];
            if (!id) return;

            const button = document.createElement("button");
            button.type = "button";
            button.dataset.budgetPdf = id;
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
            .approval{display:grid;grid-template-columns:1fr 1fr;gap:72px;margin:58px 28px 0}.approval div{padding-top:6px;border-top:1px solid #171917;text-align:center;font-size:9px}.approval small{display:block;margin-top:3px;color:#777}
            footer{display:flex;justify-content:space-between;margin-top:25px;padding-top:9px;border-top:1px solid #cdd2c8;color:#777;font-size:8px;text-transform:uppercase;letter-spacing:.07em}
            @page{size:A4;margin:11mm}
            @media print{body{margin:0}}
        `;
    }

    function documentBody(budget) {
        const items = Array.isArray(budget.itens) ? budget.itens : [];
        const rows = items.length
            ? items.map(item => `<tr><td>${item.tipo === "peca" ? "Peça" : "Serviço"}</td><td>${escape(item.descricao)}</td><td>${Number(item.quantidade || 1)}</td><td>${money(Number(item.preco || 0) * Number(item.quantidade || 1))}</td></tr>`).join("")
            : '<tr><td colspan="4">Nenhum item informado.</td></tr>';

        return `
            <header>
                <div class="brand"><span class="brand-mark">RV</span><div><b>RecVec</b><small>Gestão de oficina</small></div></div>
                <div class="title"><small>Proposta de atendimento</small><h1>Orçamento</h1></div>
                <div class="number"><small>Número da OR</small><strong>#${String(budget.id_orcamento).padStart(4, "0")}</strong><span>${escape(budget.data_emissao || "")}</span></div>
            </header>
            <div class="accent"></div>
            <section class="block"><div class="block-title"><span>01</span><strong>Cliente</strong></div><dl>
                <div><dt>Nome</dt><dd>${escape(budget.cliente_nome)}</dd></div>
                <div><dt>Telefone</dt><dd>${escape(budget.cliente_telefone)}</dd></div>
                <div><dt>Documento</dt><dd>${escape(budget.cliente_documento || "-")}</dd></div>
            </dl></section>
            <section class="block"><div class="block-title"><span>02</span><strong>Veículo</strong></div><dl>
                <div><dt>Modelo</dt><dd>${escape(budget.marca)} ${escape(budget.veiculo)}</dd></div>
                <div><dt>Placa</dt><dd>${escape(budget.placa)}</dd></div>
                <div><dt>Ano / cor</dt><dd>${escape(budget.ano || "-")} · ${escape(budget.cor || "-")}</dd></div>
            </dl></section>
            <section class="block"><div class="block-title"><span>03</span><strong>Serviços e peças</strong></div><table>
                <thead><tr><th>Tipo</th><th>Descrição</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${rows}</tbody>
            </table></section>
            <section class="block"><div class="block-title"><span>04</span><strong>Observações</strong></div><div class="notes">${escape(budget.observacoes || "Nenhuma observação informada.")}</div></section>
            <section class="summary">
                <div><span>Serviços</span><strong>${money(budget.total_servicos)}</strong></div>
                <div><span>Peças</span><strong>${money(budget.total_pecas)}</strong></div>
                <div><span>Mão de obra</span><strong>${money(budget.mao_obra)}</strong></div>
                <div><span>Total</span><strong>${money(budget.valor_total)}</strong></div>
            </section>
            <div class="approval">
                <div>Aprovação do cliente<small>${escape(budget.cliente_nome || "Cliente")}</small></div>
                <div>Responsável pelo orçamento<small>RecVec</small></div>
            </div>
            <footer><span>RecVec / Orçamento</span><span>Documento emitido pelo sistema</span></footer>
        `;
    }

    function printBudget(budget) {
        const popup = window.open("", "_blank", "width=920,height=1050");
        if (!popup) {
            alert("O navegador bloqueou a janela do PDF. Permita pop-ups para este site.");
            return;
        }
        popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OR-${budget.id_orcamento}</title><style>${styles()}</style></head><body>${documentBody(budget)}<script>window.onload=()=>window.print()<\/script></body></html>`);
        popup.document.close();
    }

    const target = document.getElementById("budgets-list");
    if (target) new MutationObserver(addButtons).observe(target, { childList: true, subtree: true });
    addButtons();

    document.addEventListener("click", async event => {
        const button = event.target.closest("[data-budget-pdf]");
        if (!button) return;
        try {
            const response = await fetch("/api/orcamentos");
            const budgets = await response.json();
            const budget = budgets.find(item => Number(item.id_orcamento) === Number(button.dataset.budgetPdf));
            if (budget) printBudget(budget);
        } catch (error) {
            alert("Não foi possível gerar o PDF deste orçamento.");
        }
    });
})();
