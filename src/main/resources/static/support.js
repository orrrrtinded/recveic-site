(function () {
    "use strict";

    const WORKER_URL = "https://recvec-ia.cl204073.workers.dev";
    const QUESTIONS = [
        {
            key: "tentativa",
            text: "Para começar: o que você estava tentando fazer quando o problema apareceu?",
            placeholder: "Conte qual tarefa estava realizando...",
            minimum: 3
        },
        {
            key: "problema",
            text: "E o que aconteceu na tela? Se apareceu alguma mensagem de erro, escreva também.",
            placeholder: "Descreva o erro ou o comportamento da tela...",
            minimum: 3
        },
        {
            key: "resultadoEsperado",
            text: "Entendi. O que deveria ter acontecido no lugar desse erro?",
            placeholder: "Diga qual resultado você esperava...",
            minimum: 3
        },
        {
            key: "frequencia",
            text: "Isso acontece sempre, acontece às vezes ou foi a primeira vez?",
            placeholder: "Exemplo: acontece sempre...",
            minimum: 2
        },
        {
            key: "continuidade",
            text: "Você ainda consegue continuar usando o sistema ou o problema bloqueou seu trabalho?",
            placeholder: "Exemplo: não consigo continuar...",
            minimum: 2
        },
        {
            key: "telefone",
            text: "Por último, quer deixar um telefone para contato? Se preferir não informar, escreva “pular”.",
            placeholder: "Telefone ou escreva pular...",
            minimum: 2
        }
    ];

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "/support.css?v=5";
    document.head.appendChild(style);

    function pageContext() {
        return {
            page: document.title.replace(/\s*\|\s*RecVec\s*$/i, "") || "RecVec",
            path: window.location.pathname + window.location.search,
            userAgent: navigator.userAgent
        };
    }

    async function sendConversation(answers) {
        const user = await (window.recvecAuthReady || Promise.resolve(window.recvecCurrentUser));
        if (!user) throw new Error("Sua sessão expirou. Entre novamente no sistema.");
        const token = await user.getIdToken();
        const response = await fetch(WORKER_URL + "/suporte/chat/enviar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ respostas: answers, contexto: pageContext() })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Não foi possível enviar o chamado agora.");
        return result;
    }

    function wait(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, milliseconds));
    }

    function buildSupportChat() {
        if (document.getElementById("support-dialog")) return;
        let questionIndex = 0;
        let answers = {};
        let busy = false;

        const launcher = document.createElement("button");
        launcher.type = "button";
        launcher.className = "support-launcher";
        launcher.setAttribute("aria-label", "Abrir ajuda e suporte");
        launcher.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8 8 0 0 0-8 8v2.5A2.5 2.5 0 0 0 6.5 16H8v-6H6.1a6 6 0 0 1 11.8 0H16v6h1.2A4.2 4.2 0 0 1 13 19.4h-1V21h1a6 6 0 0 0 5.9-5A2.5 2.5 0 0 0 20 13.9V11a8 8 0 0 0-8-8Z"/></svg><span>Ajuda</span>`;
        document.body.appendChild(launcher);

        const dialog = document.createElement("dialog");
        dialog.id = "support-dialog";
        dialog.className = "support-dialog support-chat-dialog";
        dialog.setAttribute("aria-labelledby", "support-title");
        dialog.innerHTML = `
            <div class="support-chat-shell">
                <header class="support-head">
                    <div class="support-head-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3a8 8 0 0 0-8 8v2.5A2.5 2.5 0 0 0 6.5 16H8v-6H6.1a6 6 0 0 1 11.8 0H16v6h1.2A4.2 4.2 0 0 1 13 19.4h-1V21h1a6 6 0 0 0 5.9-5A2.5 2.5 0 0 0 20 13.9V11a8 8 0 0 0-8-8Z"/></svg></div>
                    <div><small>SUPORTE RECVEC</small><h2 id="support-title">Converse com o suporte</h2><p><i></i> Assistente disponível</p></div>
                    <button type="button" class="support-close" data-support-close aria-label="Fechar suporte">×</button>
                </header>
                <div class="support-chat-context"><span id="support-chat-page"></span><b id="support-chat-counter"></b></div>
                <div class="support-chat-messages" id="support-chat-messages" role="log" aria-live="polite"></div>
                <div class="support-chat-result" id="support-chat-result" hidden>
                    <button type="button" class="support-secondary" data-support-retry hidden>Tentar enviar novamente</button>
                    <button type="button" class="support-primary" data-support-new>Nova conversa</button>
                </div>
                <form class="support-chat-compose" id="support-chat-compose">
                    <textarea id="support-chat-input" rows="1" maxlength="1600" aria-label="Digite sua resposta" placeholder="Digite sua resposta..."></textarea>
                    <button type="submit" aria-label="Enviar resposta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-7 8-1-8-1-3-7Z"/></svg></button>
                    <small>Enter para enviar · Shift + Enter para pular linha</small>
                </form>
            </div>`;
        document.body.appendChild(dialog);

        const messages = dialog.querySelector("#support-chat-messages");
        const compose = dialog.querySelector("#support-chat-compose");
        const input = dialog.querySelector("#support-chat-input");
        const counter = dialog.querySelector("#support-chat-counter");
        const resultActions = dialog.querySelector("#support-chat-result");
        const retryButton = dialog.querySelector("[data-support-retry]");
        dialog.querySelector("#support-chat-page").textContent = `Tela: ${pageContext().page}`;

        function scrollToLatest() {
            window.requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
        }

        function addMessage(role, text, kind) {
            const article = document.createElement("article");
            article.className = `support-chat-message support-chat-message--${role}` + (kind ? ` is-${kind}` : "");
            if (role === "assistant") {
                const avatar = document.createElement("span");
                avatar.className = "support-avatar";
                avatar.textContent = "RV";
                article.appendChild(avatar);
            }
            const bubble = document.createElement("p");
            bubble.textContent = text;
            article.appendChild(bubble);
            messages.appendChild(article);
            scrollToLatest();
            return article;
        }

        function showTyping() {
            const article = document.createElement("article");
            article.className = "support-chat-message support-chat-message--assistant support-chat-typing";
            article.innerHTML = `<span class="support-avatar">RV</span><p><i></i><i></i><i></i></p>`;
            messages.appendChild(article);
            scrollToLatest();
            return article;
        }

        function updateQuestion() {
            const question = QUESTIONS[questionIndex];
            counter.textContent = `Pergunta ${questionIndex + 1} de ${QUESTIONS.length}`;
            input.placeholder = question.placeholder;
            input.maxLength = question.key === "problema" ? 1600 : question.key === "telefone" ? 40 : 1200;
            input.disabled = false;
            compose.querySelector("button").disabled = false;
            input.focus();
        }

        async function askNextQuestion() {
            const typing = showTyping();
            await wait(520);
            typing.remove();
            addMessage("assistant", QUESTIONS[questionIndex].text);
            updateQuestion();
        }

        async function submitTicket() {
            busy = true;
            input.disabled = true;
            compose.querySelector("button").disabled = true;
            counter.textContent = "Enviando chamado";
            const typing = showTyping();
            await wait(420);
            typing.remove();
            addMessage("assistant", "Perfeito. Estou organizando a conversa e enviando o chamado agora.");
            const sending = showTyping();
            try {
                const result = await sendConversation(answers);
                sending.remove();
                const protocolText = result.protocol
                    ? `O chamado ${result.protocol} foi enviado.`
                    : "O chamado foi enviado.";
                addMessage("assistant", `Tudo certo! ${protocolText} Em breve entraremos em contato pelo e-mail da sua conta.`, "success");
                compose.hidden = true;
                retryButton.hidden = true;
                resultActions.hidden = false;
                counter.textContent = "Chamado enviado";
            } catch (error) {
                sending.remove();
                addMessage("assistant", `Não consegui enviar: ${error.message}`, "error");
                compose.hidden = true;
                retryButton.hidden = false;
                resultActions.hidden = false;
                counter.textContent = "Envio pendente";
            } finally {
                busy = false;
            }
        }

        async function receiveAnswer() {
            if (busy) return;
            const answer = input.value.trim();
            const question = QUESTIONS[questionIndex];
            if (answer.length < question.minimum) {
                input.classList.add("is-invalid");
                input.focus();
                window.setTimeout(() => input.classList.remove("is-invalid"), 500);
                return;
            }
            addMessage("user", answer);
            answers[question.key] = answer;
            input.value = "";
            input.style.height = "auto";
            input.disabled = true;
            compose.querySelector("button").disabled = true;
            questionIndex += 1;
            if (questionIndex < QUESTIONS.length) await askNextQuestion();
            else await submitTicket();
        }

        function resetConversation() {
            questionIndex = 0;
            answers = {};
            busy = false;
            messages.innerHTML = "";
            compose.hidden = false;
            resultActions.hidden = true;
            retryButton.hidden = true;
            input.value = "";
            input.style.height = "auto";
            addMessage("assistant", "Olá! Vou fazer algumas perguntas rápidas para entender o problema e encaminhar tudo ao suporte.");
            addMessage("assistant", QUESTIONS[0].text);
            updateQuestion();
        }

        compose.addEventListener("submit", event => { event.preventDefault(); receiveAnswer(); });
        input.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                receiveAnswer();
            }
        });
        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 120) + "px";
        });
        launcher.addEventListener("click", () => {
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
            window.setTimeout(() => input.focus(), 80);
        });
        dialog.querySelector("[data-support-close]").addEventListener("click", () => dialog.close());
        dialog.querySelector("[data-support-new]").addEventListener("click", resetConversation);
        retryButton.addEventListener("click", submitTicket);
        dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
        resetConversation();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildSupportChat, { once: true });
    else buildSupportChat();
})();
