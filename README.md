# Resenha Awards 2026

Projeto pessoal de premiação do grupo, com experiência visual em React, Vite, Tailwind CSS, PixiJS e GSAP. O servidor Node usa SQLite local para receber as fichas. Requer Node.js 22.13 ou superior; Node 24 é recomendado.

## Rodar localmente

```powershell
npm install
npm run setup:local
npm run dev
```

`setup:local` cria `.env.local` com 20 códigos individuais aleatórios e uma chave da organização. Se o arquivo já existir, ele não é substituído. Abra esse arquivo localmente para consultar os códigos e entregue um código diferente a cada participante por um meio privado. A chave da organização é exclusiva dos organizadores. Não envie esse arquivo ao Git.

O comando `dev` inicia o servidor de desenvolvimento e a API. Abra o endereço informado pelo Vite. As indicações ficam em `/indicacoes/`, a ficha de votação em `/votacao/` e a consulta restrita em `/organizacao/`. Caso já exista um Vite aberto de uma versão anterior, encerre-o e inicie novamente para carregar a API e a configuração.

O envio aceita um código por ficha e bloqueia duplicatas. Para permitir que um participante altere a própria ficha, defina `RESENHA_ALLOW_EDITS=true` em `.env.local` e reinicie o servidor. A área da organização mostra as fichas recebidas; a página pública não divulga os resultados. Apenas Jack do Ano tem concorrentes definidos: nas demais categorias a pessoa pode digitar uma indicação livre. Os campos não preenchidos são opcionais e aparecem como tal no cartão final.

Os dados ficam em `data/votacao.sqlite`, ignorados pelo Git. Faça backup da pasta `data` enquanto o servidor estiver parado ou por um método compatível com SQLite. Não remova o banco ao atualizar a aplicação. Para definir outra localização, configure `RESENHA_DATA_DIR` antes de iniciar o servidor.

## Build e execução

```powershell
npm run build
npm start
```

`npm start` serve o build e a API em `127.0.0.1:4175`; `HOST` e `PORT` podem ser definidos no ambiente. A configuração padrão é apenas local. Para acesso de outras pessoas pela rede ou internet, é necessário hospedar o servidor Node com armazenamento persistente, HTTPS e acesso restrito. Um site estático sozinho não recebe votos. `npm run preview` serve somente o frontend e não substitui a API.

## Cena animada

PixiJS compõe o cenário e os personagens de `assets/cenario1`; GSAP controla animações e entradas. A arte estática é usada quando WebGL está indisponível ou a preferência de movimento reduzido está ativa. O vídeo do cenário 2 é silencioso e tem fallback de imagem.

## Teste no Render

O Blueprint `render.yaml` propõe um web service gratuito e um PostgreSQL gratuito na mesma região. No Render, `DATABASE_URL` é obrigatória; a aplicação não usa o arquivo SQLite local. O banco local permanece separado, sem migração automática.

O Render gera `RESENHA_ACCESS_SEED` e `RESENHA_ADMIN_TOKEN` como segredos do serviço. A organização pode consultar a chave no painel do Render e entrar em `/organizacao/`; os 20 códigos individuais aparecem após selecionar “Mostrar códigos individuais”. Não compartilhe a chave da organização ou a semente. Mantenha os mesmos segredos entre deploys para preservar os códigos existentes.

O plano PostgreSQL gratuito expira após 30 dias e não inclui backup automático. Ele serve apenas para homologação: antes de usá-lo para fichas reais é preciso definir uma alternativa de armazenamento e backup. Consulte a documentação atual do Render para limites e custos.

## Conteúdo da página inicial

Os componentes da página inicial ficam em `src/components/home/`. Os títulos, apresentações e descrições das categorias dos cinco guias ficam em `src/data/homeContent.ts`; o conteúdo das demais seções está nos respectivos componentes. `app.js` mantém as interações de rolagem, galeria e vídeo. Use `npm run typecheck` para verificar os componentes TypeScript.
