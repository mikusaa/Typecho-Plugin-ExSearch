# Typecho-Plugin-ExSearch

> 🔍 为 Typecho 带来实时搜索体验 [![Build](https://github.com/mikusaa/Typecho-Plugin-ExSearch/workflows/Build/badge.svg)](https://github.com/mikusaa/Typecho-Plugin-ExSearch/actions)

![](https://wx2.sinaimg.cn/large/0060lm7Tly1g0c0wvk8s4j311b0n7qbr.jpg)

## 版本说明

- 当前分支目标版本：**Typecho 1.3**。
- 前端运行时已移除 jQuery 依赖，插件不会注入 `jquery.min.js`。

## 使用

- 下载本仓库（`master` 分支）：[下载](https://github.com/mikusaa/Typecho-Plugin-ExSearch/archive/master.zip)
- 解压后将文件夹重命名为 `ExSearch`
- 上传至插件目录，在后台启用
- 保存一次插件设置，并点击重建索引

在主题中，在任意可点击元素加上 `class="search-form-input"`，点击即可唤起搜索框。

## API 与权限

- `/ExSearch?action=api&key=...`：公开只读，返回索引 JSON。
- `/ExSearch?action=rebuild`：需要后台登录，用于重建索引。

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

如果站点内容过多导致建立索引失败，可在 `Plugin.php` 中取消以下两行注释：

```php
$sql = 'SET GLOBAL max_allowed_packet=4294967295;';
$db->query($sql);
```

该操作需要数据库高级权限，也可手动执行：

```bash
mysql > SET GLOBAL max_allowed_packet=4294967295;
```

## Credit

本项目灵感来源于 [Wikitten](https://github.com/zthxxx/hexo-theme-Wikitten) 与 [PPOffice](https://github.com/ppoffice)。

## LICENSE

MIT
