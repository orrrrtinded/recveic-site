# RecVec — correção do suporte por IA (v20)

## O que foi corrigido

- A chamada ao Gemini agora usa o formato estruturado atual da API.
- A IA recebe separadamente a tarefa, a falha, o resultado esperado, a frequência e a continuidade.
- Respostas informais são transformadas em texto técnico, sem copiar gírias ou palavrões.
- A saída da IA é validada antes do envio.
- Campos preenchidos nunca mais são substituídos por “Não informado pelo usuário”.
- Se a API estiver indisponível, um organizador local gera um chamado profissional com todos os dados confirmados.
- Frequência, continuidade e impacto são normalizados antes de montar o e-mail.

## Publicação necessária

Esta correção está no arquivo `cloudflare-worker-recvec-ia.js`.

1. Abra o Worker `recvec-ia` no painel da Cloudflare.
2. Substitua todo o código atual pelo conteúdo do arquivo corrigido.
3. Clique em **Deploy**.

Não é necessário executar `firebase deploy` para corrigir somente este defeito do suporte.
