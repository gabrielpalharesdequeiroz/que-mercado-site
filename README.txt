QUE MERCADO — SITE E EDITOR DE CONTEÚDO

Páginas principais:
- index.html: landing page, com conteúdo padrão enquanto o Supabase não estiver configurado
- blog.html: listagem pública dos artigos publicados
- post.html: página dinâmica de artigo
- admin-login.html: autenticação administrativa com Supabase Auth
- admin.html: visão geral, leads e editor de conteúdo da página inicial e do blog

IDENTIDADE VISUAL

- Verde oficial: #199852
- Laranja oficial: #eb611f
- Logo horizontal oficial: assets/que-mercado-logo-horizontal.png
- A seção “Indicadores do negócio” faz parte da narrativa da home e seus números podem ser atualizados pelo editor de conteúdo.

CONFIGURAÇÃO DO SUPABASE

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute todo o arquivo supabase-schema.sql.
3. Em Authentication > Users, crie o usuário que poderá acessar o painel.
4. Copie o UUID desse usuário e execute no SQL Editor:

   insert into public.admin_users (user_id)
   values ('UUID_DO_USUARIO');

5. Em supabase-config.js, informe:
   - url: Project URL
   - publishableKey: Publishable key (ou anon key de projeto legado)

6. Nunca coloque a service_role key no código do site.

COMO A PUBLICAÇÃO FUNCIONA

- O menu “Conteúdo” possui os módulos “Página inicial” e “Blog”.
- O botão “Publicar alterações” atualiza os textos daquela seção para todos os visitantes.
- O botão “Publicar artigo” cria ou atualiza um artigo e o disponibiliza para todos.
- A landing mantém os textos que estão no HTML quando o Supabase ainda não estiver configurado ou estiver temporariamente indisponível.
- O arquivo supabase-schema.sql já inclui as tabelas, políticas de segurança e os três artigos atuais como conteúdo inicial editável.

OBSERVAÇÃO SOBRE LEADS

Os leads ainda seguem o funcionamento anterior no navegador. A migração deles para o Supabase pode ser feita na próxima etapa, sem interferir no editor de conteúdo já implementado.
