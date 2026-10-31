# RecVeic — site

Interface web de gestão para uma recuperadora de veículos. O sistema reúne orçamentos, ordens de serviço, acompanhamento da oficina, peças, pagamentos e suporte. O site faz parte de um conjunto com aplicativo mobile e software administrativo.

## Tecnologias

- HTML, CSS e JavaScript na interface (`src/main/resources/static/`).
- Firebase Authentication e Cloud Firestore para autenticação e dados.
- Firebase Hosting para a publicação do site.
- Worker Cloudflare para funções de suporte e integrações; suas chaves são configuradas como variáveis ou segredos no ambiente do Worker.

O diretório `src/main/java` contém código Java que acompanha o projeto. A cópia entregue não contém o arquivo de configuração de build Maven/Gradle; portanto não há instruções validadas neste repositório para compilar esse backend Java.

## Executar e publicar o site

O diretório publicado está definido em `firebase.json`. Com o Firebase CLI instalado e acesso ao projeto configurado, é possível testar o Hosting com `firebase emulators:start --only hosting` e publicar com `firebase deploy --only hosting`. A publicação requer autorização e configuração da conta Firebase adequada.

O arquivo `firestore.rules` contém regras do banco, cuja publicação é uma operação separada; o deploy apenas do Hosting não as modifica.

## Configuração e segurança

Não inclua arquivos de credenciais de conta de serviço, chaves de API privadas, senhas ou arquivos `.env` no repositório. A pasta `.firebase` e arquivos comuns de segredos estão no `.gitignore`. O Worker lê seus segredos da configuração do ambiente, não deste repositório.

O histórico de revisão de interface está em `REMAKE-LEIA-ME.md`.
