# X 新闻热点

中文优先的 X（Twitter）多领域热点聚合站。每天早上由 Grok Bot 例程采集**前一天**新闻，按日历日归档到 `data/days/YYYY-MM-DD.json`，并经 GitHub Pages 自动发布。

站点默认中文，页内提供 **中文 / EN** 切换（`localStorage` 键 `x-news-lang`）。首页展示最新一日；可用日期条切换历史日。列表卡片只显示摘要，点标题进入详情；「在 X 查看原文」为可选外链。

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
index.html                 # 页面（默认 zh-CN，语言切换 + 日期条）
styles.css                 # 深色主题
app.js                     # 按日路由、双语渲染、领域筛选
data/days.json             # 日期清单（latest + days 最新在前）
data/days/YYYY-MM-DD.json  # 按日归档
data/news.json             # 最新日的副本（兼容旧书签）
scripts/build_site.py
scripts/refresh_instructions.md
scripts/bilingualize.py    # 一次性迁移工具（可选）
```

## 数据刷新

见 `scripts/refresh_instructions.md`。例程每天约 07:30 Asia/Shanghai 采集前一天热点，**只写/覆盖该日** `data/days/YYYY-MM-DD.json`，重建 `days.json`，同步最新日到 `news.json`，**永不删除**历史日文件；然后 commit/push `main` 到 **feifan19/x-news-hot**。

内容来自 X 帖子汇总，可能随后变化。
