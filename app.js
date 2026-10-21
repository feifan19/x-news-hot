(() => {
  const DOMAINS = ["科技", "商业", "中国", "国际", "体育", "娱乐", "科学"];
  let allItems = [];
  let activeDomain = "全部";

  const elGrid = document.getElementById("newsGrid");
  const elFilters = document.getElementById("filters");
  const elCount = document.getElementById("totalCount");
  const elUpdated = document.getElementById("updatedAt");
  const elStats = document.getElementById("statsBar");

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " Asia/Shanghai";
    } catch {
      return iso;
    }
  }

  function buildFilters() {
    const buttons = ['全部', ...DOMAINS]
      .map(
        (d) =>
          `<button class="filter-btn${d === activeDomain ? " active" : ""}" data-domain="${d}">${d}</button>`
      )
      .join("");
    elFilters.innerHTML = buttons;
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

  function domainCounts(items) {
    const map = Object.fromEntries(DOMAINS.map((d) => [d, 0]));
    items.forEach((i) => {
      if (map[i.domain] !== undefined) map[i.domain] += 1;
    });
    return map;
  }

  function renderStats(items) {
    const counts = domainCounts(allItems);
    elStats.innerHTML = DOMAINS.map(
      (d) => `<span class="stat-chip">${d} ${counts[d]}</span>`
    ).join("");
  }

  function filteredItems() {
    if (activeDomain === "全部") return allItems;
    return allItems.filter((i) => i.domain === activeDomain);
  }

  function renderCard(item) {
    const topics = (item.topics || [])
      .slice(0, 3)
      .map((t) => `<span class="topic">${escapeHtml(t)}</span>`)
      .join("");
    return `
      <article class="card">
        <div class="card-top">
          <span class="domain-pill domain-${escapeHtml(item.domain)}">${escapeHtml(item.domain)}</span>
          <time class="card-time">${escapeHtml(formatTime(item.updated_at))}</time>
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="hook">${escapeHtml(item.hook)}</p>
        <p class="summary">${escapeHtml(item.summary)}</p>
        <div class="card-footer">
          <div class="topics">${topics}</div>
          <a class="card-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">在 X 查看 →</a>
        </div>
      </article>
    `;
  }

  function render() {
    const items = filteredItems();
    elCount.textContent = `${items.length} 条`;
    if (!items.length) {
      elGrid.innerHTML = `<div class="empty">该领域暂无热点</div>`;
      return;
    }
    elGrid.innerHTML = items.map(renderCard).join("");
  }

  async function load() {
    try {
      const res = await fetch("data/news.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allItems = Array.isArray(data.items) ? data.items : [];
      elUpdated.textContent = `更新于 ${data.updated_at || formatTime(data.updated_at_iso)}`;
      buildFilters();
      renderStats();
      render();
    } catch (err) {
      elGrid.innerHTML = `<div class="empty">加载失败：${escapeHtml(err.message)}</div>`;
      elUpdated.textContent = "无法加载数据";
    }
  }

  load();
})();
