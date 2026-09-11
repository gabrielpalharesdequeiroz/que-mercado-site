(function () {
  const createPostCard = (post, { compact = false, featured = false } = {}) => {
    const article = document.createElement("article");
    article.className = `post-card${featured ? " featured-post" : ""}`;

    if (post.cover_url) {
      const image = document.createElement("img");
      image.src = post.cover_url;
      image.alt = post.title;
      image.loading = "lazy";
      article.appendChild(image);
    }

    const copy = document.createElement("div");
    const category = document.createElement("span");
    const title = document.createElement(compact ? "h3" : "h2");
    const excerpt = document.createElement("p");
    const link = document.createElement("a");

    category.textContent = (post.category || "Blog").toUpperCase();
    title.textContent = post.title;
    excerpt.textContent = post.excerpt;
    link.href = `post.html?id=${encodeURIComponent(post.slug || post.id)}`;
    link.textContent = "Ler artigo ↗";
    copy.append(category, title, excerpt, link);
    article.appendChild(copy);
    return article;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (!window.QMCMS?.isConfigured()) return;
    try {
      const posts = await window.QMCMS.getPosts({ publishedOnly: true });
      if (!posts.length) return;

      const homeGrid = document.getElementById("homeBlogGrid");
      if (homeGrid) {
        homeGrid.replaceChildren(...posts.slice(0, 3).map((post) => createPostCard(post, { compact: true })));
      }

      const blogGrid = document.getElementById("blogGrid");
      if (blogGrid) {
        blogGrid.replaceChildren(...posts.map((post, index) => createPostCard(post, { featured: index === 0 })));
      }
    } catch (error) {
      console.warn("Blog remoto indisponível; mantendo artigos padrão.", error);
    }
  });
})();
