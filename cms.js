(function () {
  const config = window.QM_SUPABASE_CONFIG || {};
  const configured = Boolean(config.url && config.publishableKey && window.supabase);
  const client = configured
    ? window.supabase.createClient(config.url, config.publishableKey)
    : null;

  const unwrap = (result) => {
    if (result.error) throw result.error;
    return result.data;
  };

  const api = {
    isConfigured: () => configured,
    getClient: () => client,
    async getSession() {
      if (!client) return null;
      const data = unwrap(await client.auth.getSession());
      return data.session;
    },
    async signIn(email, password) {
      if (!client) throw new Error("Supabase ainda não configurado.");
      const data = unwrap(await client.auth.signInWithPassword({ email, password }));
      return data.session;
    },
    async signOut() {
      if (client) unwrap(await client.auth.signOut());
    },
    async isAdmin() {
      if (!client) return false;
      return Boolean(unwrap(await client.rpc("is_qm_admin")));
    },
    async loadSiteContent() {
      if (!client) return [];
      return unwrap(await client.from("site_content").select("key,section,value,updated_at"));
    },
    async publishSiteContent(rows) {
      if (!client) throw new Error("Supabase ainda não configurado.");
      return unwrap(
        await client.from("site_content").upsert(rows, { onConflict: "key" }).select(),
      );
    },
    async getPosts({ publishedOnly = false } = {}) {
      if (!client) return [];
      let query = client.from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: false });
      if (publishedOnly) query = query.eq("status", "published");
      return unwrap(await query);
    },
    async getPost(identifier) {
      if (!client || !identifier) return null;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
      let query = client.from("blog_posts").select("*").eq("status", "published");
      query = isUuid ? query.eq("id", identifier) : query.eq("slug", identifier);
      query = query.maybeSingle();
      return unwrap(await query);
    },
    async publishPost(post) {
      if (!client) throw new Error("Supabase ainda não configurado.");
      const payload = {
        ...post,
        status: "published",
        published_at: new Date().toISOString(),
      };
      return unwrap(
        await client.from("blog_posts").upsert(payload).select().single(),
      );
    },
    async deletePost(id) {
      if (!client) throw new Error("Supabase ainda não configurado.");
      return unwrap(await client.from("blog_posts").delete().eq("id", id));
    },
  };

  window.QMCMS = api;

  document.addEventListener("DOMContentLoaded", async () => {
    if (!configured || !document.querySelector("[data-content-key]")) return;
    try {
      const rows = await api.loadSiteContent();
      rows.forEach(({ key, value }) => {
        document.querySelectorAll("[data-content-key]").forEach((element) => {
          if (element.dataset.contentKey === key) element.textContent = value;
        });
      });
    } catch (error) {
      console.warn("Conteúdo publicado indisponível; mantendo conteúdo padrão.", error);
    }
  });
})();
