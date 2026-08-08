# TheLira.tech — site institucional

Primeira versão do site institucional da TheLira.tech, construída em HTML, CSS e JavaScript puros. O projeto não exige etapa de build e está pronto para hospedagem estática no Cloudflare Pages.

## Desenvolvimento local

Você pode abrir `index.html` diretamente ou iniciar um servidor local:

```powershell
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

- `index.html`: conteúdo, SEO e estrutura da página
- `css/style.css`: identidade visual e responsividade
- `js/script.js`: menu móvel, navegação ativa e animações
- `images/favicon.svg`: favicon vetorial

## Contatos configurados

- E-mail: `theliratech@gmail.com`
- Telefone e WhatsApp: `+55 11 97853-3143`
- LinkedIn: perfil ainda não informado

## Deploy no Cloudflare Pages

1. Envie o repositório para o GitHub.
2. No Cloudflare Pages, conecte o repositório.
3. Selecione a branch `main`.
4. Use `None`/sem framework como preset.
5. Deixe o comando de build vazio.
6. Use `/` como diretório de saída (raiz do projeto).

Cada novo push na branch configurada publicará uma nova versão automaticamente.
