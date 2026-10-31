(function () {
    "use strict";

    const nativeFetch = window.fetch.bind(window);
    const resources = {
        "clientes": { collection: "clientes", idField: "id_cliente" },
        "veiculos": { collection: "veiculos", idField: "id_veiculo" },
        "orcamentos": { collection: "orcamentos", idField: "id_orcamento" },
        "ordens-servico": { collection: "ordens_servico", idField: "id_os" },
        "pagamentos": { collection: "pagamentos", idField: "id_pagamento" }
    };

    const firestoreReady = (window.recvecAuthReady || Promise.reject(new Error("Autenticação não carregada"))).then(user => {
        if (!user) throw new Error("Entre no sistema para acessar os dados.");
        if (!window.firebase || !firebase.apps.length) {
            throw new Error("O Firebase não foi inicializado. Publique o site com Firebase Hosting.");
        }
        return firebase.firestore();
    });

    function jsonResponse(data, status) {
        return new Response(JSON.stringify(data), {
            status: status || 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    }

    function errorResponse(error) {
        console.error("Falha no Firestore:", error);
        const message = error && error.message ? error.message : "Não foi possível acessar o banco de dados";
        return jsonResponse({ message }, 400);
    }

    function parseApiUrl(input) {
        const raw = typeof input === "string" ? input : input.url;
        const url = new URL(raw, window.location.origin);
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) return null;
        const parts = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);
        const config = resources[parts[0]];
        if (!config || parts.length > 2) return null;
        return { config, id: parts[1] || null };
    }

    async function listDocuments(db, config) {
        const snapshot = await db.collection(config.collection).get();
        return snapshot.docs
            .map(doc => ({ ...doc.data(), [config.idField]: Number(doc.id) }))
            .sort((a, b) => a[config.idField] - b[config.idField]);
    }

    async function requireDocument(db, collection, id, message) {
        if (id == null) return;
        const snapshot = await db.collection(collection).doc(String(id)).get();
        if (!snapshot.exists) throw new Error(message);
    }

    async function hasReference(db, collection, field, id) {
        const snapshot = await db.collection(collection).where(field, "==", Number(id)).limit(1).get();
        return !snapshot.empty;
    }

    async function validateRelations(db, resource, data, currentId) {
        if (resource.collection === "veiculos" && data.id_cliente != null) {
            await requireDocument(db, "clientes", data.id_cliente, "Cliente informado não existe");
        }
        if (["orcamentos", "ordens_servico"].includes(resource.collection) && data.id_veiculo != null) {
            await requireDocument(db, "veiculos", data.id_veiculo, "Veículo informado não existe");
        }
        if (resource.collection === "pagamentos") {
            await requireDocument(db, "ordens_servico", data.id_os, "OS informada não existe");
            const matches = await db.collection("pagamentos").where("id_os", "==", Number(data.id_os)).get();
            const duplicate = matches.docs.some(doc => doc.id !== String(currentId || ""));
            if (duplicate) throw new Error("Ja existe pagamento vinculado a esta OS");
        }
    }

    async function validateDelete(db, resource, id) {
        const numericId = Number(id);
        if (resource.collection === "clientes" && await hasReference(db, "veiculos", "id_cliente", numericId)) {
            throw new Error("Cliente possui veículos vinculados e não pode ser excluído");
        }
        if (resource.collection === "veiculos" && await hasReference(db, "ordens_servico", "id_veiculo", numericId)) {
            throw new Error("Veículo possui ordens de serviço vinculadas e não pode ser excluído");
        }
        if (resource.collection === "ordens_servico") {
            const hasPayment = await hasReference(db, "pagamentos", "id_os", numericId);
            if (hasPayment) throw new Error("OS possui pagamento vinculado e não pode ser excluída");
        }
    }

    async function nextId(db, resource) {
        const counterRef = db.collection("_counters").doc(resource.collection);
        return db.runTransaction(async transaction => {
            const counter = await transaction.get(counterRef);
            let value = counter.exists && Number.isFinite(counter.data().value)
                ? Number(counter.data().value) + 1
                : 1;

            while ((await transaction.get(db.collection(resource.collection).doc(String(value)))).exists) {
                value += 1;
            }
            transaction.set(counterRef, { value });
            return value;
        });
    }

    async function handleApiRequest(parsed, options) {
        const db = await firestoreReady;
        const method = String((options && options.method) || "GET").toUpperCase();
        const resource = parsed.config;
        const collection = db.collection(resource.collection);

        if (method === "GET" && !parsed.id) return jsonResponse(await listDocuments(db, resource));

        if (method === "GET" && parsed.id) {
            const snapshot = await collection.doc(parsed.id).get();
            if (!snapshot.exists) return jsonResponse({ message: "Registro não encontrado" }, 404);
            return jsonResponse({ ...snapshot.data(), [resource.idField]: Number(snapshot.id) });
        }

        if (method === "POST" || method === "PUT") {
            const data = JSON.parse((options && options.body) || "{}");
            const id = method === "POST" ? await nextId(db, resource) : Number(parsed.id);
            if (!Number.isFinite(id)) return jsonResponse({ message: "Identificador invalido" }, 400);
            if (method === "PUT" && !(await collection.doc(String(id)).get()).exists) {
                return jsonResponse({ message: "Registro não encontrado" }, 404);
            }
            await validateRelations(db, resource, data, id);
            const saved = { ...data, [resource.idField]: id };
            await collection.doc(String(id)).set(saved);
            return jsonResponse(saved, method === "POST" ? 201 : 200);
        }

        if (method === "DELETE" && parsed.id) {
            const reference = collection.doc(parsed.id);
            if (!(await reference.get()).exists) return jsonResponse({ message: "Registro não encontrado" }, 404);
            await validateDelete(db, resource, parsed.id);
            await reference.delete();
            return new Response(null, { status: 204 });
        }

        return jsonResponse({ message: "Operação não suportada" }, 405);
    }

    window.fetch = async function (input, options) {
        const parsed = parseApiUrl(input);
        if (!parsed) return nativeFetch(input, options);
        try {
            return await handleApiRequest(parsed, options || {});
        } catch (error) {
            return errorResponse(error);
        }
    };
})();
