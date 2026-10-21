# X 新闻热点

中文优先的 X（Twitter）多领域热点聚合站。整点由 Grok Bot 例程调用 X `search_news` 采集并更新 `data/news.json`，经 GitHub Pages 自动发布。

## 在线地址

- 站点：https://feifan19.github.io/x-news-hot/
- 仓库：https://github.com/feifan19/x-news-hot

## 本地预览

```bash
# 任意静态服务器，例如：
python3 -m http.server 8080 --directory .
# 打开 http://localhost:8080
```

## 结构

```
index.html          # 页面
styles.css          # 深色主题样式
app.js              # 加载 data/news.json、领域筛选
data/news.json      # 热点数据（例程重写）
scripts/build_site.py
scripts/refresh_instructions.md
```

## 数据刷新

见 `scripts/refresh_instructions.md`。例程每次应保证 **≥30 条**、覆盖尽量多的领域，然后 commit/push `main`。

内容来自 X 帖子汇总，可能随后变化。
