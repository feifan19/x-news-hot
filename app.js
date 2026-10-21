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
      footer:
        "内容来自 X 帖子汇总，可能随后变化。重要事实建议点开原文核对。全文可在本页直接阅读，无需跳转 X。",
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
      footer:
        "Summaries from X posts; details may change. Verify important facts on the original. Full text is readable here without opening X.",
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

  function applyChrome() {
    const u = t();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = u.title;
    elTitle.textContent = u.title;
    elTagline.textContent = u.tagline;
    elFooterNote.textContent = u.footer;
    elFooterSource.textContent = u.source;
    elFilters.setAttribute("aria-label", u.filtersAria);
    elLangZh.classList.toggle("active", lang === "zh");
    elLangEn.classList.toggle("active", lang === "en");
    const stamp = metaUpdatedAt || formatTime(metaUpdatedIso);
    elUpdated.textContent = stamp ? u.updated(stamp) : u.loading;
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
    return `
      <article class="card">
        <div class="card-top">
          <span class="domain-pill domain-${escapeHtml(item.domain)}">${escapeHtml(
            domainLabel(item.domain)
          )}</span>
          <time class="card-time">${escapeHtml(formatTime(item.updated_at))}</time>
        </div>
        <h2>${escapeHtml(pick(item, "title"))}</h2>
        <p class="hook">${escapeHtml(pick(item, "hook"))}</p>
        <p class="summary">${escapeHtml(pick(item, "summary"))}</p>
        <div class="card-footer">
          <div class="topics">${topics}</div>
          <a class="card-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            t().xLink
          )}</a>
        </div>
      </article>
    `;
  }

  function render() {
    const items = filteredItems();
    elCount.textContent = t().count(items.length);
    if (!items.length) {
      elGrid.innerHTML = `<div class="empty">${escapeHtml(t().empty)}</div>`;
      return;
    }
    elGrid.innerHTML = items.map(renderCard).join("");
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

  load();
})();
