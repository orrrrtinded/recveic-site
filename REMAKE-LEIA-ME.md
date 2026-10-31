# RecVec — revisão visual da v21, 29/10/2026

Base: `C:\Users\zumzu\Desktop\Projeto-Integrador-Suporte-IA-v20`.

A pasta `site recuperadora` na Área de Trabalho é uma cópia anterior, datada de 28/08/2026. A v20 da Área de Trabalho é de 31/08/2026 e contém os módulos e integrações mais recentes.

## Mudanças

- Login com a identidade automotiva do RecVec, ilustração vetorial e formulário responsivo.
- Painel com atalhos de rotina e atendimento, ícones próprios e ação direta para criar orçamento.
- Botão “Ver orçamentos” abre uma janela sobre o formulário. Pesquisa, filtros, seleção, PDF, edição, exclusão e conversão em OS continuam disponíveis.
- Cores e tamanhos de texto consistentes em orçamento, ordens, semana, peças, pagamentos e suporte; temas claro e escuro.
- Menu com todas as páginas visíveis em telas pequenas; correções nos seletores, checkboxes e botão de remover item.
- Navegação por teclado, identificação dos campos, Escape nos seletores, foco de retorno e respeito à preferência de movimento reduzido.
- Estilos da revisão carregados diretamente pelo HTML, sem esperar a execução do JavaScript. Sem novas bibliotecas ou fontes externas.
- Cadastros continuam fora da navegação. Os atalhos de novo cliente e veículo dentro do orçamento foram preservados.

Os arquivos de autenticação, comunicação com Firebase, ordens, pagamentos, peças, semana e suporte foram comparados com o backup e permanecem iguais. Em orçamentos foram ajustados textos, nomes acessíveis e a orientação quando falta escolher cliente/veículo. Cálculos, esquema dos registros e endpoints continuam iguais. Nenhuma alteração no Worker ou nas regras do Firestore nesta revisão.

## Validação

Prévia local isolada, com dados fictícios: login, painel, orçamentos, ordens, semana, peças, pagamentos e páginas legadas de clientes/veículos. Conferência em 390 px e tamanho desktop, incluindo os dois temas. Testados pesquisa/filtro, abrir/fechar janela, editar orçamento, cálculo, salvamento simulado, confirmação de exclusão (cancelada), abertura da conversão, detalhe do veículo, observação de peça, formulário de pagamento e abertura do suporte.

Todos os JavaScripts passaram na verificação de sintaxe; IDs existentes e referências a arquivos foram conferidos. Autenticação real, envio de e-mail/IA e persistência no Firebase não foram exercitados nesta prévia. Os dados de demonstração e o servidor de teste ficam fora da pasta publicada.

## Publicar somente o site

No CMD:

```bat
cd /d "C:\Users\zumzu\Desktop\Projeto-Integrador-Remake-v21"
npx firebase-tools@latest deploy --only hosting --project projetointegrador-4f2dd
```

Depois, atualize o site com Ctrl+F5. Esta revisão foi salva localmente; não foi publicada pelo assistente.

Backup dos arquivos anteriores: `C:\Users\zumzu\Documents\Codex\2026-08-28\como-x20\backup-site-antes-revisao-20261029\static`.
