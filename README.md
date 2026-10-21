# X 新闻热点

中文优先的 X（Twitter）多领域热点聚合站。整点由 Grok Bot 例程调用 X `search_news` 采集并更新 `data/news.json`，经 GitHub Pages 自动发布。

站点默认中文，页内提供 **中文 / EN** 切换（`localStorage` 键 `x-news-lang`）。每条卡片展示完整标题、导语与摘要，无需跳转 X 即可阅读；「在 X 查看原文」为可选外链。

## 在线地址

- 站点：https://feifan19.github.io/x-news-hot/
- 仓库：https://github.com/feifan19/x-news-hot

## 本地预览

```bash
python3 -m http.server 8080 --directory .
# 打开 http://localhost:8080
```

## 结构

```
index.html          # 页面（默认 zh-CN，语言切换）
styles.css          # 深色主题；摘要全文展示（无 line-clamp）
app.js              # 双语渲染、领域筛选、时间本地化
data/news.json      # 双语热点数据（例程重写）
scripts/build_site.py
scripts/refresh_instructions.md
scripts/bilingualize.py   # 一次性迁移工具（可选）
```

## 数据刷新

见 `scripts/refresh_instructions.md`。例程每次应保证 **≥30 条**、覆盖尽量多的领域，每条含 `title_en/zh`、`hook_en/zh`、`summary_en/zh`，然后 commit/push `main` 到 **feifan19/x-news-hot**。

内容来自 X 帖子汇总，可能随后变化。
