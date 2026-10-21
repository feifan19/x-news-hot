# 整点刷新例程说明（Grok Bot）

面向每小时自动更新 `x-news-hot` 站点数据的例程。

## 目标

- 使用 `x` MCP：`search_news`（必要时辅以 `get_trends_by_woeid`）
- 覆盖领域：科技 / 商业 / 中国 / 国际 / 体育 / 娱乐 / 科学
- 合并去重（按 story `id`），**最终 `count >= 30`**，至少覆盖 5 个领域
- 跳过 NSFW、低质 meme / 纯段子
- 重写 `/workspace/x-news-site/data/news.json`（或仓库内同路径）
- `commit` + `push` 到 `feifan19/x-news-hot` 的 `main`，触发 GitHub Pages 更新

## 采集建议

每个领域 1 次 `search_news`，`max_results` 10–15，`max_age_hours` 24–48。示例 query：

| 领域 | query 示例 |
|------|-----------|
| 科技 | `technology AI chip OpenAI Google Apple` |
| 商业 | `business markets stocks economy finance` |
| 中国 | `China Asia rare earth Beijing 中国` |
| 国际 | `politics election war diplomacy NATO` |
| 体育 | `sports NBA football soccer Olympics` |
| 娱乐 | `entertainment movie music celebrity Hollywood` |
| 科学 | `science health medicine climate research NASA` |

可选：`get_trends_by_woeid`（中国 `23424781`，全球 `1`）作补充线索，勿把纯热搜词条当完整新闻条目。

速率：约 30 次/分钟、1000 次/天；单次最多约 25 条。

## news.json 结构

```json
{
  "updated_at": "YYYY-MM-DD HH:MM Asia/Shanghai",
  "updated_at_iso": "...Z",
  "count": N,
  "domains": ["科技","商业","中国","国际","体育","娱乐","科学"],
  "items": [{
    "id": "...",
    "domain": "科技",
    "title": "...",
    "hook": "...",
    "summary": "...",
    "url": "https://x.com/i/trending/...",
    "category": "News",
    "topics": [],
    "updated_at": "..."
  }]
}
```

领域映射：`Technology/AI`→科技，`Business/Finance/Stocks`→商业，中国/亚太相关→中国，`Politics` 国际向→国际，`Sports`→体育，`Entertainment`→娱乐，`Science/Health/Space/Biotech`→科学。

## 发布步骤

1. 写好 `data/news.json`
2. （可选）`python3 scripts/build_site.py`
3. 在仓库根目录：
   ```bash
   git add data/news.json
   git commit -m "chore: refresh X hot news $(date +%Y-%m-%d-%H)"
   git push origin main
   ```
4. Pages 通常 1–2 分钟内生效：https://feifan19.github.io/x-news-hot/

## 注意

- 仅相对路径；静态站无服务端。
- 标题/摘要可保留 X 返回语言；UI 中文。
- 不可发送对外邮件/帖子，除非用户明确授权。
