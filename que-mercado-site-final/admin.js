const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const setFeedback = (element, message, type = "") => {
  if (!element) return;
  element.textContent = message;
  element.className = `admin-feedback ${type}`.trim();
};

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function initLogin() {
  const form = $("#adminLogin");
  if (!form) return;

  const feedback = $("#loginFeedback");
  const submit = $("button[type='submit']", form);

  if (!window.QMCMS?.isConfigured()) {
    $("#setupAlert").hidden = false;
    submit.disabled = true;
    return;
  }

  try {
    const session = await window.QMCMS.getSession();
    if (session && (await window.QMCMS.isAdmin())) {
      location.href = "admin.html";
      return;
    }
  } catch (error) {
    console.warn("Não foi possível verificar a sessão atual.", error);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = "Entrando...";
    setFeedback(feedback, "");

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await window.QMCMS.signIn(data.email, data.password);
      if (!(await window.QMCMS.isAdmin())) {
        await window.QMCMS.signOut();
        throw new Error("Este usuário não tem acesso administrativo.");
      }
      location.href = "admin.html";
    } catch (error) {
      setFeedback(feedback, error.message || "Não foi possível entrar.", "error");
      submit.disabled = false;
      submit.textContent = "Entrar no painel";
    }
  });
}

async function initAdmin() {
  if (!$(".admin-shell")) return;

  const configured = Boolean(window.QMCMS?.isConfigured());
  const badge = $("#connectionBadge");
  const setupAlert = $("#adminSetupAlert");
  let publishedContent = new Map();
  let posts = [];
  let activeSection = window.QM_CONTENT_SCHEMA?.[0] || null;

  if (configured) {
    try {
      const session = await window.QMCMS.getSession();
      if (!session || !(await window.QMCMS.isAdmin())) {
        await window.QMCMS.signOut();
        location.href = "admin-login.html";
        return;
      }
      badge.textContent = "SUPABASE CONECTADO";
      badge.classList.add("connected");
    } catch (error) {
      badge.textContent = "ERRO DE CONEXÃO";
      setupAlert.hidden = false;
      setupAlert.textContent = `Não foi possível conectar ao Supabase. ${error.message || "Confira a configuração e tente novamente."}`;
    }
  } else {
    badge.textContent = "AGUARDANDO SUPABASE";
    setupAlert.hidden = false;
    $$("#publishSite, #publishPost").forEach((button) => {
      button.disabled = true;
    });
  }

  const demoLeads = [
    { createdAt: new Date(Date.now() - 86400000).toISOString(), nome: "Marina Costa", whatsapp: "(51) 99999-1248", email: "marina@exemplo.com", cidade: "Porto Alegre/RS", investimento: "R$ 40 mil a R$ 65 mil", prazo: "Nos próximos 3 meses", status: "Demo" },
    { createdAt: new Date(Date.now() - 172800000).toISOString(), nome: "Rafael Lima", whatsapp: "(48) 98888-4312", email: "rafael@exemplo.com", cidade: "Florianópolis/SC", investimento: "Acima de R$ 65 mil", prazo: "Agora", status: "Demo" },
    { createdAt: new Date(Date.now() - 259200000).toISOString(), nome: "Ana Martins", whatsapp: "(41) 97777-3010", email: "ana@exemplo.com", cidade: "Curitiba/PR", investimento: "Até R$ 20 mil", prazo: "Ainda estou pesquisando", status: "Demo" },
  ];

  const getStoredLeads = () => {
    try {
      return JSON.parse(localStorage.getItem("qm_leads") || "[]");
    } catch {
      return [];
    }
  };

  const visibleLeads = () => getStoredLeads().length ? getStoredLeads() : demoLeads;
  const cell = (value) => {
    const td = document.createElement("td");
    td.textContent = value || "";
    return td;
  };

  function renderLeadRow(lead, compact = false) {
    const row = document.createElement("tr");
    const values = compact
      ? [lead.nome, lead.cidade, lead.investimento]
      : [new Date(lead.createdAt).toLocaleDateString("pt-BR"), lead.nome, lead.whatsapp, lead.email, lead.cidade, lead.investimento, lead.prazo];
    values.forEach((value) => row.appendChild(cell(value)));
    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `status-pill ${lead.status === "Demo" ? "demo-pill" : ""}`;
    status.textContent = lead.status || "Novo";
    statusCell.appendChild(status);
    row.appendChild(statusCell);
    return row;
  }

  function renderLeads() {
    const leads = visibleLeads();
    $("#statLeads").textContent = getStoredLeads().length || demoLeads.length;
    $("#leadsTable").replaceChildren(...leads.map((lead) => renderLeadRow(lead)));
    $("#overviewLeads").replaceChildren(...leads.slice(0, 5).map((lead) => renderLeadRow(lead, true)));
  }

  function openPanel(name) {
    $$(".admin-nav").forEach((button) => button.classList.toggle("active", button.dataset.panel === name));
    $$('[data-panel-content]').forEach((panel) => panel.classList.toggle("active", panel.dataset.panelContent === name));
    $("#adminTitle").textContent = name === "overview" ? "Visão geral" : name === "leads" ? "Leads" : "Conteúdo";
  }

  $$(".admin-nav").forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.panel)));
  $$('[data-open-panel]').forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.openPanel)));

  $$(".content-module-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const module = button.dataset.contentModule;
      $$(".content-module-tab").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      $$('[data-content-module-panel]').forEach((panel) => panel.classList.toggle("active", panel.dataset.contentModulePanel === module));
    });
  });

  function renderSectionNavigation() {
    const buttons = window.QM_CONTENT_SCHEMA.map((section) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "content-section-button";
      button.classList.toggle("active", section.id === activeSection.id);
      button.textContent = section.label;
      button.addEventListener("click", () => {
        activeSection = section;
        renderSectionNavigation();
        renderSiteFields();
      });
      return button;
    });
    $("#contentSections").replaceChildren(...buttons);
  }

  function renderSiteFields() {
    $("#siteEditorTitle").textContent = activeSection.label;
    $("#siteEditorDescription").textContent = activeSection.description;
    const fields = activeSection.fields.map((field) => {
      const label = document.createElement("label");
      label.append(document.createTextNode(field.label));
      const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
      input.name = field.key;
      input.value = publishedContent.get(field.key) ?? field.defaultValue;
      if (field.type === "textarea") input.rows = 4;
      input.required = true;
      label.appendChild(input);
      return label;
    });
    $("#siteFields").replaceChildren(...fields);
    setFeedback($("#sitePublishStatus"), "As alterações só ficam públicas ao clicar em Publicar.");
  }

  async function loadSiteContent() {
    if (!configured) return;
    try {
      const rows = await window.QMCMS.loadSiteContent();
      publishedContent = new Map(rows.map((row) => [row.key, row.value]));
      $("#statContent").textContent = rows.length;
      renderSiteFields();
    } catch (error) {
      setFeedback($("#sitePublishStatus"), error.message || "Não foi possível carregar o conteúdo.", "error");
    }
  }

  $("#siteContentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!configured) return;
    const button = $("#publishSite");
    const feedback = $("#sitePublishStatus");
    button.disabled = true;
    button.textContent = "Publicando...";
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const rows = activeSection.fields.map((field) => ({ key: field.key, section: activeSection.id, value: values[field.key] }));
      await window.QMCMS.publishSiteContent(rows);
      rows.forEach((row) => publishedContent.set(row.key, row.value));
      $("#statContent").textContent = publishedContent.size;
      setFeedback(feedback, "Publicado. As alterações já estão disponíveis para todos.", "success");
    } catch (error) {
      setFeedback(feedback, error.message || "Não foi possível publicar.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Publicar alterações";
    }
  });

  function resetPostEditor() {
    $("#postForm").reset();
    $("#postForm [name='id']").value = "";
    delete slugInput.dataset.edited;
    $("#postEditorTitle").textContent = "Novo artigo";
    setFeedback($("#postPublishStatus"), "O artigo ficará disponível para todos ao publicar.");
  }

  function editPost(post) {
    Object.entries(post).forEach(([key, value]) => {
      const input = $(`#postForm [name='${key}']`);
      if (input) input.value = value ?? "";
    });
    $("#postEditorTitle").textContent = "Editar artigo";
    setFeedback($("#postPublishStatus"), "Ao publicar, a versão atual será substituída para todos.");
    $("#postForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPosts() {
    $("#statPosts").textContent = posts.filter((post) => post.status === "published").length;
    if (!posts.length) {
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = configured ? "Nenhum artigo cadastrado." : "Os artigos aparecerão aqui depois da configuração do Supabase.";
      $("#postsList").replaceChildren(empty);
      return;
    }
    const items = posts.map((post) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "post-admin-item";
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      const meta = document.createElement("small");
      title.textContent = post.title;
      meta.textContent = `${post.category || "Blog"} · ${post.status === "published" ? "Publicado" : "Rascunho"}`;
      copy.append(title, meta);
      const action = document.createElement("span");
      action.textContent = "EDITAR";
      item.append(copy, action);
      item.addEventListener("click", () => editPost(post));
      return item;
    });
    $("#postsList").replaceChildren(...items);
  }

  async function loadPosts() {
    if (!configured) {
      renderPosts();
      return;
    }
    try {
      posts = await window.QMCMS.getPosts();
      renderPosts();
    } catch (error) {
      const empty = document.createElement("p");
      empty.className = "admin-empty error";
      empty.textContent = error.message || "Não foi possível carregar os artigos.";
      $("#postsList").replaceChildren(empty);
    }
  }

  $("#newPost").addEventListener("click", resetPostEditor);
  const titleInput = $("#postForm [name='title']");
  const slugInput = $("#postForm [name='slug']");
  titleInput.addEventListener("input", () => {
    if (!$("#postForm [name='id']").value && !slugInput.dataset.edited) slugInput.value = slugify(titleInput.value);
  });
  slugInput.addEventListener("input", () => {
    slugInput.dataset.edited = slugInput.value ? "true" : "";
  });

  $("#postForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!configured) return;
    const button = $("#publishPost");
    const feedback = $("#postPublishStatus");
    button.disabled = true;
    button.textContent = "Publicando...";
    try {
      const post = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (!post.id) delete post.id;
      post.slug = slugify(post.slug);
      const published = await window.QMCMS.publishPost(post);
      const index = posts.findIndex((item) => item.id === published.id);
      if (index >= 0) posts[index] = published;
      else posts.unshift(published);
      renderPosts();
      editPost(published);
      setFeedback(feedback, "Publicado. O artigo já está disponível para todos.", "success");
    } catch (error) {
      setFeedback(feedback, error.message || "Não foi possível publicar o artigo.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Publicar artigo";
    }
  });

  $("#logout").addEventListener("click", async () => {
    await window.QMCMS?.signOut();
    location.href = "admin-login.html";
  });

  $("#exportLeads").addEventListener("click", () => {
    const leads = getStoredLeads();
    if (!leads.length) {
      alert("Ainda não há leads reais neste navegador. Os registros exibidos são demonstrativos.");
      return;
    }
    const columns = ["createdAt", "nome", "whatsapp", "email", "cidade", "investimento", "prazo", "status"];
    const csv = [columns.join(","), ...leads.map((lead) => columns.map((column) => `"${String(lead[column] || "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "leads-que-mercado.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  renderLeads();
  renderSectionNavigation();
  renderSiteFields();
  renderPosts();
  await Promise.all([loadSiteContent(), loadPosts()]);
}

initLogin();
initAdmin();
