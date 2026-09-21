# 共享品牌背景

`webui/public/junkyard-scene/` 是个人工作台 `tools/jthewl-brand/` 生成的静态资源，不直接编辑。使用 `node tools/jthewl-brand/sync.mjs` 同步三站，`--check` 核对版本及文件内容。

本站通过 `webui/index.html` 加载 stars 模式。保留原搜索和分类组件，共享样式给列表加深色面板。部署只需要此仓库，不依赖个人主页在线。

同步到通用 StarsBoard 模板时，排除个人场景资源，保留模板自己的 index.html；不将个人品牌嵌入通用模板。
