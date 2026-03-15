# 更新日志

本文件记录 ExSearch 插件的重要变更。

## [1.0.0] - 2026-03-15

### 新增
- 新增 `CHANGELOG.md`，用于版本化记录发布内容。
- 新增 `eslint.config.cjs`（Flat Config），完成 ESLint 10 配置迁移。
- 新增 `ExSearchCall(item, ctx)` 的上下文参数：
  - `ctx.url`：目标链接
  - `ctx.element`：当前结果项 DOM 元素
  - `ctx.eventType`：触发方式（`click` / `enter`）
- 新增重复初始化保护（`window.__ExSearchInitialized`），避免 PJAX/重复加载时重复插入搜索弹层。

### 变更
- 插件版本号由 `0.1` 升级为 `1.0`。
- 对齐 Typecho 1.3 运行方式：
  - `Plugin.php` 中 widget 实例化改为 `Typecho\Widget::widget(...)`。
- 调整 Action 鉴权策略（按 action 分流）：
  - `/ExSearch?action=api`：公开只读。
  - `/ExSearch?action=rebuild`：仍需登录。
- 强化 API 返回行为：
  - `key` 为空返回 `[]`
  - 查无索引或数据为空返回 `[]`
  - 未知 `action` 返回 `[]`
- `assets/ExSearch.js` 从 jQuery 实现重写为原生实现：
  - DOM 创建
  - 事件委托
  - 键盘导航
  - `fetch` 拉取索引
  - 搜索结果渲染与跳转
- 在保持原搜索权重/排序逻辑不变的前提下完成实现替换。
- 优化样式，并适配夜间模式：
  - 内置 `.ins-search-container-wrapper` 结构支持
  - 补齐 `body.theme-dark` 下输入框、结果列表、关闭按钮等样式
  - 优化分组列表、预览文案与间距，提升可读性与一致性
  - 修复 placeholder 颜色写法（`#ccc`）
- 升级构建链与 CI：
  - `gulp-sass@6` + `sass`
  - `del@8`
  - `gulp-autoprefixer@10`
  - `gulp-rev@12`
  - GitHub Actions 升级到 Node 20（`actions/setup-node@v4`）

### 移除
- 移除插件运行时 jQuery 注入逻辑。
- 移除 jQuery 配置项 `jq` 的实际行为依赖。
- 删除 `assets/jquery.min.js`。
- 删除旧版 `.eslintrc.json`（迁移到 Flat Config）。

### 修复
- 修复 Typecho 1.3 下 Action 权限策略与访客搜索可用性问题。
- 修复索引为空时 API 地址生成的兜底逻辑。
- 修复 Sass `/` 除法弃用告警（迁移为 `math.div(...)`）。
- 修复 ESLint 旧配置体系带来的升级阻塞，完成 ESLint 10 迁移。

### 兼容性说明
- 本版本不再依赖 jQuery 运行时。
- 本版本不保证 Typecho 1.2 兼容。
- 旧主题自定义回调可继续通过 `item.attr('data-url')` 读取链接；推荐改用 `ctx.url`。
