# 功能映射

| 需求 | 实现文件 | 验证 |
| --- | --- | --- |
| 美元 / US$ / 欧元 / 英镑 / 人民币、千分位、小数逗号、区间低值 | `src/lib/price.js` | `tests/logic.test.js` |
| 价格除以时薪、中文小时与工作日格式 | `src/lib/price.js` | `tests/logic.test.js` |
| 集中管理 Amazon / eBay / Target / Walmart / Best Buy 价格候选、通用 meta 兜底 | `src/content/selectors.js` | `tests/manifest.test.js`；DOM 易变、未真站验收 |
| 点击 popup 或浮动按钮才扫描、主价格旁中文标注 | `src/content/content.js`、`src/popup/popup.js` | `tests/flow.test.js` 本地消息流；未做真实 Chrome / 真站验收 |
| 时薪、币种、每日工时、冷静期开关及分钟数 | `src/lib/settings.js`、`src/popup/` | `tests/logic.test.js`；Chrome 手工 UI 验收待进行 |
| URL 持久化计时、剩余时间、我已冷静 | `src/lib/cooldown.js`、`src/background/service-worker.js`、`src/content/content.js` | `tests/logic.test.js`、`tests/flow.test.js` |
| 免费每日 3 次，本地日期重置，扫描一次扣一次 | `src/lib/quota.js`、`src/background/service-worker.js` | `tests/logic.test.js`、`tests/flow.test.js` |
| WHP1. 离线 SHA-256 许可、超限文案、设置页 | `src/lib/license.js`、`src/options/`、`scripts/gen-license.mjs` | `tests/logic.test.js`、`tests/flow.test.js` |
| 最小权限及文件引用 | `manifest.json` | `tests/manifest.test.js` |
| 中文纸色 / 印章红风格 | `src/ui/`、popup、options、content Shadow DOM | 静态实现；样式参照只读参考仓 |

所有数据保存在本机 chrome.storage.local。没有汇率 API、远程授权服务、联网脚本、外部依赖、自动扫描或支付系统。安装方法、币种歧义及其他已知限制见 README。
