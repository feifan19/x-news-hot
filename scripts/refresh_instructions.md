# 整点刷新例程说明（Grok Bot）

面向每小时自动更新 `x-news-hot` 站点数据的例程。

## 目标

- 使用 `x` MCP：`search_news`（必要时辅以 `get_trends_by_woeid`）
- 覆盖领域：科技 / 商业 / 中国 / 国际 / 体育 / 娱乐 / 科学
- 合并去重（按 story `id`），**最终 `count >= 70`（目标约 80–100）**，各领域尽量 10–15 条，至少覆盖 5 个领域
- 跳过 NSFW、低质 meme / 纯段子
- 重写 `/workspace/x-news-site/data/news.json`（或仓库内同路径）
- **每条必须含中英字段**（见下）；中文为新闻体自然表述，勿机翻堆砌
- `commit` + `push` 到 **feifan19/x-news-hot** 的 `main`，触发 GitHub Pages 更新

## 采集建议

每个领域优先 1–2 次不同角度的 `search_news`，`max_results` 15–25（贴近单次上限），`max_age_hours` 24–48。示例 query：

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

## news.json 结构（双语 + 正文必填）

```json
{
  "updated_at": "YYYY-MM-DD HH:MM Asia/Shanghai",
  "updated_at_iso": "...Z",
  "count": N,
  "domains": ["科技","商业","中国","国际","体育","娱乐","科学"],
  "items": [{
    "id": "...",
    "domain": "科技",
    "title_en": "...",
    "title_zh": "...",
    "hook_en": "...",
    "hook_zh": "...",
    "summary_en": "...",
    "summary_zh": "...",
    "body_en": "...",
    "body_zh": "...",
    "url": "https://x.com/i/trending/...",
    "category": "News",
    "topics": [],
    "updated_at": "..."
  }]
}
```

### 字段硬性要求

- **`summary_en` / `summary_zh`**：必须保留 X API 返回的**完整** summary（全文翻译），**禁止截断、禁止压缩成一两句**。X 的 summary 已是该接口能给到的最长正文来源。
- **`hook_en` / `hook_zh`**：完整保留 X hook，勿缩短。
- **`body_en` / `body_zh`（必填）**：在 title + hook + summary 已有事实基础上，扩写成可供页内直接阅读的新闻体正文。
  - 中文约 180–350 字；英文约 120–250 词；2–4 个短段落，段落之间用 `\n\n` 分隔。
  - **只重述与组织已有事实**，不得编造新数字、人名、机构或情节。
  - 若源文偏短，可把同一事实写得更顺、略长，仍不得添加未出现的信息。
- 站点 UI：列表卡片只展示 teaser（summary 截断）；完整 **body**（多段 `<p>`）在详情页 `#/item/<id>`；X 链接保留为「在 X 查看原文」。

- `domain` 在数据中保持中文标签；站点 UI 在 `lang=en` 时映射：科技→Tech，商业→Business，中国→China，国际→World，体育→Sports，娱乐→Entertainment，科学→Science。
- 默认语言中文（`x-news-lang` 缺省 `zh`）。

领域映射：`Technology/AI`→科技，`Business/Finance/Stocks`→商业，中国/亚太相关→中国，`Politics` 国际向→国际，`Sports`→体育，`Entertainment`→娱乐，`Science/Health/Space/Biotech`→科学。

## 发布步骤

1. 写好含 `body_en`/`body_zh` 与完整 summary 的双语 `data/news.json`
2. （可选）`python3 scripts/build_site.py`
3. 在仓库根目录：
   ```bash
   git add data/news.json app.js styles.css scripts/refresh_instructions.md
   git commit -m "chore: refresh X hot news with full on-page bodies $(date +%Y-%m-%d-%H)"
   git push origin main
   ```
4. Pages 通常 1–2 分钟内生效：https://feifan19.github.io/x-news-hot/

## 注意

- 仅相对路径；静态站无服务端。
- 推送到 **feifan19/x-news-hot**（非旧账号仓库）。
- 不可发送对外邮件/帖子，除非用户明确授权。
- **不可在此例程内自行修改 Grok Bot routines**；若需改例程提示词，由主代理更新「X新闻整点更新」。
