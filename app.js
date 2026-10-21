(() => {
  const DOMAINS = ["科技", "商业", "中国", "国际", "体育", "娱乐", "科学"];
  const DOMAIN_EN = {
    科技: "Tech",
    商业: "Business",
    中国: "China",
    国际: "World",
    体育: "Sports",
    娱乐: "Entertainment",
    科学: "Science",
  };
  const LANG_KEY = "x-news-lang";
  const TEASER_MAX = 150;

  const UI = {
    zh: {
      title: "X 新闻热点",
      tagline: "多领域热点 · 整点自动更新",
      all: "全部",
      count: (n) => `${n} 条`,
      updated: (s) => `更新于 ${s}`,
      loading: "正在加载热点…",
      empty: "该领域暂无热点",
      loadFail: (m) => `加载失败：${m}`,
      loadFailMeta: "无法加载数据",
      xLink: "在 X 查看原文 →",
      readMore: "阅读全文 →",
      back: "← 返回列表",
      notFound: "未找到该文章",
      footer:
        "内容来自 X 帖子汇总，可能随后变化。点击标题或「阅读全文」查看完整正文；重要事实建议核对原文。",
      source: "源码",
      filtersAria: "领域筛选",
      locale: "zh-CN",
    },
    en: {
      title: "X Hot News",
      tagline: "Multi-domain headlines · hourly updates",
      all: "All",
      count: (n) => `${n} stories`,
      updated: (s) => `Updated ${s}`,
      loading: "Loading headlines…",
      empty: "No stories in this domain",
      loadFail: (m) => `Failed to load: ${m}`,
      loadFailMeta: "Could not load data",
      xLink: "View on X →",
      readMore: "Read article →",
      back: "← Back to list",
      notFound: "Article not found",
      footer:
        "From X post summaries; details may change. Open a title or “Read article” for the full body; verify key facts on the original.",
      source: "Source",
      filtersAria: "Domain filters",
      locale: "en-US",
    },
  };

  let allItems = [];
  let activeDomain = "全部";
  let lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
  let metaUpdatedAt = "";
  let metaUpdatedIso = "";
  let route = { view: "list", id: null };

  const elGrid = document.getElementById("newsGrid");
  const elFilters = document.getElementById("filters");
  const elCount = document.getElementById("totalCount");
  const elUpdated = document.getElementById("updatedAt");
  const elStats = document.getElementById("statsBar");
  const elTitle = document.getElementById("siteTitle");
  const elTagline = document.getElementById("siteTagline");
  const elFooterNote = document.getElementById("footerNote");
  const elFooterSource = document.getElementById("footerSource");
  const elLangZh = document.getElementById("langZh");
  const elLangEn = document.getElementById("langEn");
  const elBrand = document.getElementById("brandLink");

  function t() {
    return UI[lang];
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function domainLabel(d) {
    if (d === "全部" || d === "All") return t().all;
    return lang === "en" ? DOMAIN_EN[d] || d : d;
  }

  function pick(item, field) {
    const key = `${field}_${lang === "en" ? "en" : "zh"}`;
    return item[key] || item[`${field}_en`] || item[field] || "";
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return (
        d.toLocaleString(t().locale, {
          timeZone: "Asia/Shanghai",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }) + " Asia/Shanghai"
      );
    } catch {
      return iso;
    }
  }

  function parseRoute() {
    const raw = (location.hash || "").replace(/^#/, "");
    const path = raw.replace(/^\/+/, "");
    const m = path.match(/^item\/([^/?#]+)/);
    if (m) return { view: "detail", id: decodeURIComponent(m[1]) };
    return { view: "list", id: null };
  }

  function goList() {
    location.hash = "/";
  }

  function teaserText(item) {
    const raw =
      pick(item, "summary") ||
      pick(item, "hook") ||
      (pick(item, "body") || "").split(/\n+/)[0] ||
      "";
    const oneLine = String(raw).replace(/\s+/g, " ").trim();
    if (oneLine.length <= TEASER_MAX) return oneLine;
    return oneLine.slice(0, TEASER_MAX).replace(/\s+\S*$/, "") + "…";
  }

  function renderBodyHtml(item) {
    const raw = pick(item, "body") || pick(item, "summary");
    const paras = String(raw)
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!paras.length) return "";
    return paras
      .map((p) => `<p class="body-p">${escapeHtml(p)}</p>`)
      .join("");
  }

  function setListChromeVisible(show) {
    elFilters.style.display = show ? "" : "none";
    elStats.style.display = show ? "" : "none";
    elCount.hidden = !show;
  }

  function applyChrome() {
    const u = t();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    elTitle.textContent = u.title;
    elTagline.textContent = u.tagline;
    elFooterNote.textContent = u.footer;
    elFooterSource.textContent = u.source;
    elFilters.setAttribute("aria-label", u.filtersAria);
    elLangZh.classList.toggle("active", lang === "zh");
    elLangEn.classList.toggle("active", lang === "en");
    const stamp = metaUpdatedAt || formatTime(metaUpdatedIso);
    elUpdated.textContent = stamp ? u.updated(stamp) : u.loading;

    if (route.view === "detail" && route.id) {
      const item = allItems.find((i) => String(i.id) === String(route.id));
      document.title = item
        ? `${pick(item, "title")} · ${u.title}`
        : `${u.notFound} · ${u.title}`;
    } else {
      document.title = u.title;
    }
  }

  function setLang(next) {
    lang = next === "en" ? "en" : "zh";
    localStorage.setItem(LANG_KEY, lang);
    if (activeDomain === "All") activeDomain = "全部";
    applyChrome();
    buildFilters();
    renderStats();
    render();
  }

  function buildFilters() {
    const keys = ["全部", ...DOMAINS];
    elFilters.innerHTML = keys
      .map(
        (d) =>
          `<button type="button" class="filter-btn${
            d === activeDomain ? " active" : ""
          }" data-domain="${d}">${escapeHtml(domainLabel(d))}</button>`
      )
      .join("");
    elFilters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDomain = btn.dataset.domain;
        elFilters.querySelectorAll(".filter-btn").forEach((b) =>
          b.classList.toggle("active", b.dataset.domain === activeDomain)
        );
        render();
      });
    });
  }

  function domainCounts() {
    const map = Object.fromEntries(DOMAINS.map((d) => [d, 0]));
    allItems.forEach((i) => {
      if (map[i.domain] !== undefined) map[i.domain] += 1;
    });
    return map;
  }

  function renderStats() {
    const counts = domainCounts();
    elStats.innerHTML = DOMAINS.map(
      (d) =>
        `<span class="stat-chip">${escapeHtml(domainLabel(d))} ${counts[d]}</span>`
    ).join("");
  }

  function filteredItems() {
    if (activeDomain === "全部") return allItems;
    return allItems.filter((i) => i.domain === activeDomain);
  }

  function renderCard(item) {
    const topics = (item.topics || [])
      .slice(0, 3)
      .map((topic) => `<span class="topic">${escapeHtml(topic)}</span>`)
      .join("");
    const detailHref = `#/item/${encodeURIComponent(item.id)}`;
    const title = escapeHtml(pick(item, "title"));
    return `
      <article class="card">
        <div class="card-top">
          <span class="domain-pill domain-${escapeHtml(item.domain)}">${escapeHtml(
            domainLabel(item.domain)
          )}</span>
          <time class="card-time">${escapeHtml(formatTime(item.updated_at))}</time>
        </div>
        <h2><a class="card-title-link" href="${detailHref}">${title}</a></h2>
        <p class="hook">${escapeHtml(pick(item, "hook"))}</p>
        <p class="teaser">${escapeHtml(teaserText(item))}</p>
        <div class="card-footer">
          <div class="topics">${topics}</div>
          <div class="card-actions">
            <a class="card-link card-link-primary" href="${detailHref}">${escapeHtml(
              t().readMore
            )}</a>
            <a class="card-link card-link-x" href="${escapeHtml(
              item.url
            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(t().xLink)}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderDetail(item) {
    if (!item) {
      elGrid.innerHTML = `
        <div class="detail empty-detail">
          <a class="back-link" href="#/">${escapeHtml(t().back)}</a>
          <p class="empty">${escapeHtml(t().notFound)}</p>
        </div>`;
      return;
    }
    const topics = (item.topics || [])
      .map((topic) => `<span class="topic">${escapeHtml(topic)}</span>`)
      .join("");
    elGrid.innerHTML = `
      <article class="detail">
        <a class="back-link" href="#/">${escapeHtml(t().back)}</a>
        <div class="card-top">
          <span class="domain-pill domain-${escapeHtml(item.domain)}">${escapeHtml(
            domainLabel(item.domain)
          )}</span>
          <time class="card-time">${escapeHtml(formatTime(item.updated_at))}</time>
        </div>
        <h1 class="detail-title">${escapeHtml(pick(item, "title"))}</h1>
        <p class="hook">${escapeHtml(pick(item, "hook"))}</p>
        <div class="article-body">${renderBodyHtml(item)}</div>
        <div class="detail-footer">
          <div class="topics">${topics}</div>
          <a class="card-link" href="${escapeHtml(
            item.url
          )}" target="_blank" rel="noopener noreferrer">${escapeHtml(t().xLink)}</a>
        </div>
      </article>`;
  }

  function renderList() {
    const items = filteredItems();
    elCount.textContent = t().count(items.length);
    if (!items.length) {
      elGrid.innerHTML = `<div class="empty">${escapeHtml(t().empty)}</div>`;
      return;
    }
    elGrid.innerHTML = items.map(renderCard).join("");
  }

  function render() {
    route = parseRoute();
    applyChrome();
    if (route.view === "detail") {
      setListChromeVisible(false);
      elGrid.classList.add("is-detail");
      const item = allItems.find((i) => String(i.id) === String(route.id));
      renderDetail(item || null);
      window.scrollTo(0, 0);
      return;
    }
    setListChromeVisible(true);
    elGrid.classList.remove("is-detail");
    renderList();
  }

  async function load() {
    applyChrome();
    try {
      const res = await fetch("data/news.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allItems = Array.isArray(data.items) ? data.items : [];
      metaUpdatedAt = data.updated_at || "";
      metaUpdatedIso = data.updated_at_iso || "";
      applyChrome();
      buildFilters();
      renderStats();
      render();
    } catch (err) {
      elGrid.innerHTML = `<div class="empty">${escapeHtml(
        t().loadFail(err.message)
      )}</div>`;
      elUpdated.textContent = t().loadFailMeta;
    }
  }

  elLangZh.addEventListener("click", () => setLang("zh"));
  elLangEn.addEventListener("click", () => setLang("en"));
  window.addEventListener("hashchange", () => render());

  if (elBrand) {
    elBrand.addEventListener("click", (e) => {
      e.preventDefault();
      goList();
      if (parseRoute().view === "list") render();
    });
  }

  if (!location.hash || location.hash === "#") {
    history.replaceState(null, "", "#/");
  }

  load();
})();
