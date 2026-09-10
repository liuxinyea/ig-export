# LeadFlow Website

LeadFlow 产品的独立官网，基于 [Next.js](https://nextjs.org)（App Router + TypeScript + Tailwind CSS）。

部署目标：`igexport.auraflame.tech`（Vercel）。

## 页面

- `/` — 首页：Hero、Features、How It Works、CTA、Footer
- `/pricing` — 定价页：Free / Pro / Lifetime，FAQ
- `/privacy` — 隐私政策
- `/terms` — 服务条款

## 开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## 部署

支付使用 Dodo Payments：月付、季付、年付和 Lifetime，付款后由邮件交付 License Key。环境变量见 `.env.example`，产品、Webhook、扩展激活及测试流程见 [PAYMENTS.md](./PAYMENTS.md)。

Vercel 导入本仓库后自动识别 Next.js 项目；根目录指 `website/`，或把仓库结构调整为仅 `website/` 作为 Vercel 项目根。

`deploy.sh` 是可选的辅助脚本（构建 + 推送到 Git remote）。Vercel 更推荐直接连 GitHub 触发部署。

## 注意事项

- `AGENTS.md` 由 `next dev` 自动维护（含 Next.js agent rules），不要手动改。
- `app/page.tsx` 中的 Chrome Web Store 扩展 ID 是占位 `YOUR_EXTENSION_ID`，提交 Chrome Web Store 拿到 ID 后替换。
