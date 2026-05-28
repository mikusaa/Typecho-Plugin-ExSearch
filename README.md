# Typecho-Plugin-ExSearch

> 🔍 为 Typecho 带来实时搜索体验 

![](https://wx2.sinaimg.cn/large/0060lm7Tly1g0c0wvk8s4j311b0n7qbr.jpg)

[![Build](https://github.com/mikusaa/Typecho-Plugin-ExSearch/workflows/Build/badge.svg)](https://github.com/mikusaa/Typecho-Plugin-ExSearch/actions) [![downloads](https://img.shields.io/github/downloads/mikusaa/Typecho-Plugin-VOID/total.svg?style=flat-square)](https://github.com/mikusaa/Typecho-Plugin-VOID/releases) [![](https://img.shields.io/github/release/mikusaa/Typecho-Plugin-VOID.svg?style=flat-square)](https://github.com/mikusaa/Typecho-Plugin-VOID/releases)

## 版本说明

- 当前分支目标版本：**Typecho 1.3**。
- 前端运行时已移除 jQuery 依赖，插件不会注入 `jquery.min.js`。

## 使用

- 下载本仓库（`master` 分支）：[下载](https://github.com/mikusaa/Typecho-Plugin-ExSearch/archive/master.zip)
- 或从 Release 下载打包好的插件文件：[Releases](https://github.com/mikusaa/Typecho-Plugin-ExSearch/releases)
- 解压后将文件夹重命名为 `ExSearch`
- 上传至插件目录，在后台启用
- 保存一次插件设置，并点击重建索引

在主题中，在任意可点击元素加上 `class="search-form-input"`，点击即可唤起搜索框。

## API 与权限

- `/ExSearch?action=api&key=...`：公开只读，返回轻量索引 JSON。索引包含标题、链接、日期、短摘要、分类、标签等数据，不包含完整正文。
- `/ExSearch?action=query&key=...&q=...`：公开只读，按关键词查询文章与页面完整正文，最多返回 20 条结果与命中摘要片段。
- `/ExSearch?action=rebuild`：需要后台登录，用于重建索引。

开启静态化后，插件目录下的 `cache/cache-*.json` 只保存轻量索引。前端会先使用轻量索引即时搜索标题和短摘要，完整正文搜索再通过 `query` 接口按需补充。

## 自定义 Hook

默认点击结果会直接跳转。若主题使用 AJAX/PJAX，可实现自定义函数：

```html
<script>
function ExSearchCall(item, ctx) {
    // your code
}
</script>
```

参数说明：

- `item`：兼容对象。
- 若页面存在 jQuery，则为 jQuery 对象（兼容旧主题逻辑）。
- 若页面无 jQuery，则为插件提供的轻量兼容对象，支持 `item.length`、`item.attr('data-url')`。
- `ctx`：稳定上下文对象，包含：
- `ctx.url`：目标地址
- `ctx.element`：结果 DOM 元素
- `ctx.eventType`：触发类型（如 `click`、`enter`）

示例（兼容有无 jQuery）：

```javascript
function ExSearchCall(item, ctx) {
    if (!item || !item.length) {
        return;
    }

    var url = (ctx && ctx.url) || item.attr('data-url');
    var closeBtn = document.querySelector('.ins-close');
    if (closeBtn) {
        closeBtn.click();
    }

    if (window.VoidPjax && typeof window.VoidPjax.visit === 'function') {
        window.VoidPjax.visit({
            url: url,
            container: '#pjax-container',
            fragment: '#pjax-container',
            timeout: 8000
        });
        return;
    }

    window.location.href = url;
}
```

## 可能的问题

如果站点内容很多，建议开启静态化。当前版本的静态缓存只保存轻量索引与短摘要，不再保存完整正文，因此通常不需要调大数据库 `max_allowed_packet`。

## Credit

本项目灵感来源于 [Wikitten](https://github.com/zthxxx/hexo-theme-Wikitten) 与 [PPOffice](https://github.com/ppoffice)。

## LICENSE

MIT
