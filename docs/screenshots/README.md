# Screenshots

放置项目截图的目录。根 `README.md` 的「截图」一节会引用这里的文件 —— 用**下面这些确切文件名**，放好即自动显示。

按 [`../DEMO_SCRIPT.md`](../DEMO_SCRIPT.md) 跑一遍 demo 后截图：

| 文件名 | 内容 | 怎么截 |
|---|---|---|
| `web-workbench.png` | Web 三栏工作台 | 选中张女士、触发 AI 分析后，含两张动作卡（send_coupon→RN / create_followup_task→Web）与右栏 Timeline |
| `web-approval-editing.png` | Web schema 驱动参数编辑 + diff | 在某动作卡点「修改参数」，展示由 Zod schema 渲染的表单与「与 AI 原始参数对比」 |
| `web-rollback.png` | Web 失败 → 回滚 | 打开 Header「强制执行失败」开关，确认执行 → `failed` → 回滚 → `rollback`，含 Timeline 的失败/回滚事件 |
| `rn-inbox.png` | RN 待审批列表 | RN 收件箱，仅「张女士 · 发送优惠券」（中风险走 RN） |
| `rn-detail.png` | RN 审批详情 | 「修改后同意」展开的原生 RN 表单（discount/validDays） |
| `rn-receipt.png` | RN 状态回执 | 审批结果「修改后同意」、最终参数、同步状态 |

> 建议尺寸：Web 截图约 1200–1600px 宽，RN 截图用真机/Expo 截屏（竖屏）。PNG 优先。
>
> RN 截图来源二选一：① iPhone Expo Go 截屏；② `expo start --web` 浏览器预览截图。
