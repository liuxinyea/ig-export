# LeadFlow 独立站点规划

> 来源：`/Users/lxy/Desktop/WorkProjects/createrBox/LEADFLOW-WEBSITE-PLAN.md`（2026-09 合并）
> 已实现的页面和构建步骤见 [`./COMPLETION-SUMMARY.md`](./COMPLETION-SUMMARY.md)。

## 技术选型

**Next.js + Tailwind CSS + Vercel**

- 有 Next.js 项目经验（YiRanWebSite）
- SSR/SSG 支持好，有利于 SEO
- Vercel 部署免费且简单
- 生态成熟，组件库丰富

实际技术栈：Next.js 16（App Router）+ TypeScript + Tailwind CSS + framer-motion + @heroicons/react。

## 站点结构

```
igexport.auraflame.tech
├── / (首页)
│   ├── Hero Section - 产品核心价值主张
│   ├── Features Section - 3-4 个核心功能展示
│   ├── How It Works - 使用流程演示
│   └── CTA - 下载插件按钮
│
├── /pricing (定价页)
│   ├── Free Plan
│   ├── Pro Plan - 月度/年度
│   ├── Lifetime Plan
│   └── FAQ
│
├── /privacy (隐私政策)
│
└── /terms (服务条款)
```

已实现：`/`、`/pricing`、`/privacy`、`/terms`。

规划中尚未做（如未来需要）：`/features`（功能详情）、`/about`、`Social Proof / Testimonials`、`Feature comparison table`。

## 核心文案（已采用）

**首页 Hero**
- 主标题：Export Instagram Followers & Following to CSV in Seconds
- 副标题：The fastest way to export Instagram data for research, marketing, and lead generation
- CTA：Install Free on Chrome Web Store

**Features**
1. ⚡ Lightning Fast Export — Export thousands of followers in seconds
2. 📊 Smart Data Fields — Username, bio, website, follower count, verified status
3. 🏷️ Project Management — Organize leads with tags and projects
4. 📁 Multiple Formats — CSV, JSON, XLSX export support

**How It Works**
1. Install the Chrome extension
2. Visit any public Instagram profile
3. Click "Export" and select data type
4. Download your structured data

## 定价方案（已采用）

| 套餐 | 价格 | 额度 |
|------|------|------|
| Free | $0 | 100 records / 次，5 次 / 月，仅 CSV |
| Pro Monthly | $9.9 / 月 | 无限次，CSV/JSON/XLSX，项目管理 |
| Pro Annual | $79 / 年（省 33%） | 同 Pro |
| Lifetime | $199（限时限购） | 一次买断，永久 Pro |

## 域名

**已确定**：`igexport.auraflame.tech`

- 复用现有 `auraflame.tech` 主域名，添加 CNAME 指向 Vercel
- 品牌风格与 `tarot.auraflame.tech` 保持一致

## 成本预估

| 项目 | 费用 |
|------|------|
| 域名 | $10–15 / 年 |
| Vercel 部署 | 免费 |
| SSL 证书 | 免费（Vercel 提供） |
| **总计** | **$10–15 / 年** |

## 已废弃条目（保留以追溯决策过程）

以下条目来自原始规划文档，**已不再适用**，列出仅为记录历史决策：

- ~~Phase 1 / 2 / 3 实现步骤~~ — 项目已完成初始化和四个页面开发
- ~~"项目位置：/Users/lxy/Desktop/WorkProjects/createrBox/igexport-website"~~ — 现位于 `LeadFlow/website/`
- ~~"下一步行动：今天/明天/后天"~~ — 实际时间线和里程碑见 `COMPLETION-SUMMARY.md`
- ~~"预计时间投入 5–8 小时"~~ — 实际已发生，记录在 `COMPLETION-SUMMARY.md`
