# 每日刷新例程说明（Grok Bot）

面向每天早上 7:30（Asia/Shanghai）自动采集**前一天**新闻并更新 `x-news-hot` 站点的例程。

## 目标

- **节奏**：每天 07:30 Asia/Shanghai 跑一次，汇总前一天热点（不再每小时刷新）
- 使用 `x` MCP：`search_news`（必要时辅以 `get_trends_by_woeid`）
- 覆盖领域：科技 / 商业 / 中国 / 国际 / 体育 / 娱乐 / 科学
- 合并去重（按 story `id`），**最终 `count >= 70`（目标约 80–100）**，各领域尽量 10–15 条，至少覆盖 5 个领域
- 跳过 NSFW、低质 meme / 纯段子
- **按日历日归档**（见下），**永不删除**历史 `data/days/*.json`
- 每条必须含中英字段（见下）；中文为新闻体自然表述，勿机翻堆砌
- `commit` + `push` 到 **feifan19/x-news-hot** 的 `main`，触发 GitHub Pages 更新

## 按日归档（必做）

采集日 = **昨天**（Asia/Shanghai 日历日），记为 `YYYY-MM-DD`。

1. 写/覆盖 **仅该日** 文件：`data/days/YYYY-MM-DD.json`  
   形状：
   ```json
   {
     "date": "YYYY-MM-DD",
     "updated_at": "YYYY-MM-DD HH:MM Asia/Shanghai",
     "updated_at_iso": "...Z",
     "count": N,
     "domains": ["科技","商业","中国","国际","体育","娱乐","科学"],
     "items": [ /* 双语条目，同下 */ ]
   }
   ```
2. **不要删除**任何更早的 `data/days/*.json`。只更新当天这一份。
3. 重建 `data/days.json` 清单（`days` 最新在前，`latest` 为最新日）：
   ```json
   { "latest": "YYYY-MM-DD", "days": ["YYYY-MM-DD", "...更早..."] }
   ```
4. 将最新日文件**整份同步**到 `data/news.json`（内容相同，含 `date`），以便旧书签/工具仍可用。
5. （可选）跑 `python3 scripts/build_site.py` 以校验并写出 `data/news.js`。

站点首页默认展示 `latest`；用户可在日期条切换历史日；详情路由为 `#/day/YYYY-MM-DD/item/<id>`。

## 采集建议

每个领域优先 1–2 次不同角度的 `search_news`，`max_results` 15–25（贴近单次上限），`max_age_hours` 约 24–36（覆盖昨天 Asia/Shanghai 日历日）。示例 query：

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

## 条目字段（双语 + 正文必填）

```json
{
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
}
```

### 字段硬性要求

- **`summary_en` / `summary_zh`**：必须保留 X API 返回的**完整** summary（全文翻译），**禁止截断、禁止压缩成一两句**。X 的 summary 已是该接口能给到的最长正文来源。
- **`hook_en` / `hook_zh`**：完整保留 X hook，勿缩短。
- **`body_en` / `body_zh`（必填）**：在 title + hook + summary 已有事实基础上，扩写成可供页内直接阅读的新闻体正文。
  - 中文约 180–350 字；英文约 120–250 词；2–4 个短段落，段落之间用 `\n\n` 分隔。
  - **只重述与组织已有事实**，不得编造新数字、人名、机构或情节。
  - 若源文偏短，可把同一事实写得更顺、略长，仍不得添加未出现的信息。
- 站点 UI：列表卡片只展示 teaser（summary 截断）；完整 **body**（多段 `<p>`）在详情页 `#/day/YYYY-MM-DD/item/<id>`；X 链接保留为「在 X 查看原文」。

- `domain` 在数据中保持中文标签；站点 UI 在 `lang=en` 时映射：科技→Tech，商业→Business，中国→China，国际→World，体育→Sports，娱乐→Entertainment，科学→Science。
- 默认语言中文（`x-news-lang` 缺省 `zh`）。

领域映射：`Technology/AI`→科技，`Business/Finance/Stocks`→商业，中国/亚太相关→中国，`Politics` 国际向→国际，`Sports`→体育，`Entertainment`→娱乐，`Science/Health/Space/Biotech`→科学。

## 发布步骤

1. 写好含 `body_en`/`body_zh` 与完整 summary 的双语 `data/days/YYYY-MM-DD.json`（昨天）
2. 重建 `data/days.json`；同步最新日 → `data/news.json`
3. （可选）`python3 scripts/build_site.py`
4. 在仓库根目录：
   ```bash
   git add data/days/ data/days.json data/news.json data/news.js app.js styles.css index.html scripts/refresh_instructions.md
   git commit -m "chore: archive prior-day X news $(date +%Y-%m-%d)"
   git push origin main
   ```
5. Pages 通常 1–2 分钟内生效：https://feifan19.github.io/x-news-hot/

## 注意

- 仅相对路径；静态站无服务端。
- 推送到 **feifan19/x-news-hot**（非旧账号仓库）。
- 不可发送对外邮件/帖子，除非用户明确授权。
- **不可在此例程内自行修改 Grok Bot routines**；若需改例程提示词，由主代理更新「X新闻每日更新」。
- **禁止**整份覆盖历史：每次只写/覆盖「昨天」那一天的文件，并保留所有更早的 `data/days/*.json`。
