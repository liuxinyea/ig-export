# IG Exporter 本地扩展架构审计

审计对象：本机已安装的 Chrome 扩展 `Exporter for Followers`。

- Chrome 扩展 ID：`nmnhoiehpdfllknopjkhjgoddkpnmfpa`
- 已安装版本：`2.2.4`
- 已安装目录：Chrome Default Profile 的 Extensions 目录
- 商店最后更新：2025-07-01
- 审计范围：manifest、目录结构、权限、已打包脚本中的架构信号和产品数据流；不复制竞争对手源代码、文案、界面或视觉资产。

## 结论

IG Exporter 是“本地采集 + 云端许可证服务”的混合产品，而不是云端抓取器。

其 Instagram 数据采集在用户的 Chrome 扩展环境中执行：扩展拥有 Instagram 站点权限和 Cookie 权限，可在用户已有登录会话下直接请求 Instagram Web 的内部 GraphQL 分页数据。它没有声明 `content_scripts`，所以并非主要依赖注入页面并滚动 DOM。

自有后端 `api.igexporter.com` 的已识别用途是登录和许可证校验；扩展也包含订阅付款跳转和产品分析代码。现有清单与脚本结构未显示将 Instagram 导出数据上传给该后端后再由云端抓取的架构证据。

## 已确认的组件映射

| 组件 | 竞争对手实现信号 | 功能判断 |
|---|---|---|
| Manifest V3 Service Worker | `background.service_worker` | 生命周期、账户/许可证、任务协调 |
| Popup | 读取当前活动标签的 Instagram URL，打开独立 Export 页面 | 将当前账号预填到导出任务 |
| 独立 Export 页面 | `html/export.html` + 打包 React 前端 | 配置导出、展示进度、导出文件 |
| Instagram 站点权限 | `www.instagram.com`、`i.instagram.com` | 从扩展环境请求 Instagram Web 数据 |
| Cookie 权限 | `cookies` + Instagram host permissions | 使用用户已有会话，而非要求输入密码 |
| GraphQL 分页 | 包内含 Instagram GraphQL 查询相关字符串 | 获取关注者/关注列表的分页结果 |
| 状态与冷却 | `storage`、`alarms` | 保存导出状态，在限流时延后继续 |
| 文件导出 | `downloads` | 生成 CSV/XLSX 下载 |
| 商业后端 | `api.igexporter.com` 登录、许可证端点 | 免费额度、登录、订阅校验 |

## 推定的数据流

```text
用户已登录 Instagram 的 Chrome 会话
      ↓
扩展读取当前标签中的账号 URL
      ↓
Export 页面创建本地导出任务
      ↓
扩展使用当前会话访问 Instagram Web 内部分页数据
      ↓
每页结果 + 下一页 cursor → 本地状态/去重
      ↓
限流时通过 alarms 进入 cooldown；用户可暂停/继续
      ↓
本地生成 CSV/XLSX

同时：邮箱登录 / 许可证校验 / 付费跳转 → IG Exporter 后端
```

## 对 LeadFlow 的实现启发

LeadFlow 可做功能等价、但独立实现的本地插件：

1. 使用 Manifest V3、Service Worker、独立任务页与 IndexedDB。
2. 用户主动启动任务；只处理当前用户会话可访问的公开内容。
3. 采集适配器与界面、存储、导出层解耦，以应对目标页面/协议变化。
4. 检测到限流、账户验证或异常时停止任务并透明说明；不开发规避平台保护的能力。
5. 默认本地存储导出记录；未来云端仅承载账户、许可证、用户授权同步与团队协作。
6. 从第一版提供批次状态、任务恢复、完整度提示、去重与标签，以弥补竞品导出后即结束的体验缺口。

## 不复制的内容

- 竞争对手的源代码、模块命名、界面布局、文案、图标和本地化资源；
- 其固定的内部接口参数、隐藏实现细节或任何用于规避平台限制的逻辑；
- 竞争对手的品牌、名称、价格页与许可证设计。

LeadFlow 将以独立代码和自有 UI 完成功能相同但产品体验更完整的实现。
