-- Execute este arquivo uma vez no SQL Editor do Supabase.
-- Depois, crie o usuário administrador em Authentication > Users e rode:
-- insert into public.admin_users (user_id) values ('UUID_DO_USUARIO');

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_qm_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_qm_admin() from public;
grant execute on function public.is_qm_admin() to authenticated;

create table if not exists public.site_content (
  key text primary key,
  section text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Blog',
  excerpt text not null,
  content text not null,
  cover_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.touch_qm_content()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
before insert or update on public.site_content
for each row execute function public.touch_qm_content();

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
before insert or update on public.blog_posts
for each row execute function public.touch_qm_content();

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "site content is public" on public.site_content;
create policy "site content is public"
on public.site_content for select
to anon, authenticated
using (true);

drop policy if exists "admins publish site content" on public.site_content;
create policy "admins publish site content"
on public.site_content for all
to authenticated
using (public.is_qm_admin())
with check (public.is_qm_admin());

drop policy if exists "published posts are public" on public.blog_posts;
create policy "published posts are public"
on public.blog_posts for select
to anon
using (status = 'published');

drop policy if exists "admins read every post" on public.blog_posts;
create policy "admins read every post"
on public.blog_posts for select
to authenticated
using (public.is_qm_admin() or status = 'published');

drop policy if exists "admins publish posts" on public.blog_posts;
create policy "admins publish posts"
on public.blog_posts for all
to authenticated
using (public.is_qm_admin())
with check (public.is_qm_admin());

revoke all on public.admin_users from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

-- Conteúdos atuais do blog. O ON CONFLICT permite executar novamente sem duplicar.
insert into public.blog_posts
  (slug, title, category, excerpt, content, cover_url, status, published_at)
values
  (
    'vantagens-minimercado-condominio',
    '5 vantagens de empreender com um minimercado em condomínio',
    'Franquia',
    'O formato autônomo ganha espaço por unir conveniência, consumo recorrente e uma operação sem atendentes permanentes.',
    $post$Os minimercados autônomos se encaixam em um comportamento simples: moradores querem resolver compras rápidas sem sair do prédio. Em cidades com alta verticalização, isso cria uma demanda recorrente para conveniência 24 horas.

A presença de condomínios residenciais e a baixa penetração de mercados internos deixam espaço para novos pontos, especialmente em centros urbanos e cidades de médio porte.

Bebidas, snacks, itens de higiene e pequenas reposições entram naturalmente na rotina. A proximidade favorece compras emergenciais e de conveniência.

Sem atendente permanente e com self-checkout, o franqueado concentra a rotina em abastecimento, organização, acompanhamento de estoque e desempenho.

Vendas, giro de produtos e necessidades de reposição podem ser acompanhados remotamente, reduzindo a dependência de presença constante no ponto.

Quando bem implantado, o mercado interno agrega comodidade aos moradores sem exigir uma operação tradicional do condomínio.

Perfil dos moradores, fluxo, espaço disponível, mix e logística de abastecimento continuam sendo decisivos. A tecnologia simplifica a operação, mas não substitui uma boa análise de ponto.$post$,
    'assets/blog-condominio.webp',
    'published',
    now() - interval '2 days'
  ),
  (
    'mercado-autonomo-empresa',
    'Como o mercado autônomo dentro da empresa melhora o bem-estar e a produtividade da equipe',
    'Empresas',
    'Ter produtos disponíveis no próprio ambiente corporativo reduz deslocamentos e cria uma experiência mais conveniente para colaboradores.',
    $post$Em uma rotina cheia de reuniões e prazos, sair do escritório para comprar um lanche ou bebida pode consumir tempo desnecessário. Um mercado autônomo aproxima essa solução do colaborador.

O funcionário encontra snacks, bebidas, refeições rápidas e itens de conveniência dentro do próprio ambiente de trabalho, faz o pagamento no self-checkout e volta à rotina em poucos minutos.

A proximidade reduz saídas curtas, filas e tempo gasto em trajetos apenas para uma compra rápida.

Café, água ou um lanche deixam de depender de uma cantina tradicional. Isso cria momentos de pausa sem exigir uma estrutura pesada de atendimento.

A solução pode reforçar a percepção de cuidado com a experiência do colaborador, sem transferir para a empresa uma operação de varejo convencional.

Acesso, self-checkout e gestão remota permitem que o serviço funcione com autonomia e seja acompanhado pelo operador responsável.$post$,
    'assets/blog-empresa.webp',
    'published',
    now() - interval '1 day'
  ),
  (
    'novos-habitos-varejo',
    'Comodidade, tecnologia e tempo: como os novos hábitos estão transformando o varejo',
    'Varejo',
    'O consumidor conectado espera resolver mais coisas com menos atrito, e o autosserviço aparece como resposta a essa mudança.',
    $post$O consumidor atual compara preço, mas também compara esforço. Quanto mais simples for resolver uma compra, maior tende a ser a percepção de conveniência.

Smartphone, Pix, carteiras digitais e serviços sob demanda acostumaram as pessoas a jornadas rápidas e com pouca intermediação.

Totens, aplicativos e pagamentos por aproximação fizeram o consumidor ganhar familiaridade com experiências em que ele próprio conclui a compra.

Em vez de exigir um deslocamento específico, mercados autônomos podem aparecer em condomínios, empresas e pontos de circulação recorrente.

Conhecer horários, produtos de maior giro e comportamento de compra ajuda a montar um mix mais coerente para cada local.

Tecnologia reduz atrito, mas localização, estoque, preço, disponibilidade e experiência continuam determinando se a conveniência realmente funciona.$post$,
    'assets/blog-habitos.webp',
    'published',
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_url = excluded.cover_url,
  status = excluded.status;
