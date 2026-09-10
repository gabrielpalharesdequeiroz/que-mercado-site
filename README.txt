QUE MERCADO — PROTÓTIPO FRONT-END

Páginas:
- index.html: landing page
- blog.html: listagem de artigos
- artigo-*.html: 3 artigos adaptados do blog atual da Que Mercado
- admin-login.html: acesso demonstrativo ao painel
- admin.html: painel de leads e postagens
- post.html: renderiza posts criados no painel via localStorage

Admin atual:
- Qualquer e-mail e senha não vazios entram no protótipo.
- Não há autenticação real. Conectar Supabase Auth na próxima etapa.
- Leads enviados pelo formulário ficam no localStorage deste navegador.
- Se não houver leads reais, o painel mostra registros DEMO identificados como demonstração.
- Posts criados como “Publicado” aparecem em blog.html somente no mesmo navegador.

Próxima integração recomendada:
1. Supabase Auth
2. tabela leads
3. tabela posts
4. Storage para imagens de posts
5. Row Level Security
6. Analytics / eventos de conversão
