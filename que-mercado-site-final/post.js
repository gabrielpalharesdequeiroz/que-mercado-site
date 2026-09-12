(function () {
  const root = document.getElementById("dynamicPost");
  const identifier = new URLSearchParams(location.search).get("id");

  const showNotFound = (message = "Este conteúdo não está disponível.") => {
    root.querySelector("h1").textContent = "Artigo não encontrado";
    const content = root.querySelector(".article-content");
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    content.replaceChildren(paragraph);
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (!window.QMCMS?.isConfigured()) {
      showNotFound("O blog dinâmico será liberado após a configuração do Supabase.");
      return;
    }

    try {
      const post = await window.QMCMS.getPost(identifier);
      if (!post) {
        showNotFound();
        return;
      }

      document.title = `${post.title} | Que Mercado`;
      root.querySelector(".article-cat").textContent = (post.category || "Blog").toUpperCase();
      root.querySelector("h1").textContent = post.title;

      if (post.cover_url) {
        const image = document.createElement("img");
        image.className = "article-cover";
        image.src = post.cover_url;
        image.alt = post.title;
        root.querySelector("h1").after(image);
      }

      const paragraphs = post.content
        .split(/\n\s*\n/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => {
          const paragraph = document.createElement("p");
          paragraph.textContent = text;
          return paragraph;
        });
      root.querySelector(".article-content").replaceChildren(...paragraphs);
    } catch (error) {
      showNotFound("Não foi possível carregar este artigo agora.");
      console.warn("Falha ao carregar o artigo.", error);
    }
  });
})();
