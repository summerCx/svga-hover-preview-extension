# SVGA 预览 Chrome 插件

## 功能

鼠标悬浮在SVGA链接上时，自动预览SVGA动画。

## 安装方法

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本插件的文件夹路径，例如：`/Users/summerCx/store/svga-hover-preview-extension`

## 使用方法

安装后，将鼠标悬浮在任何 `.svga` 链接上，即可自动显示动画预览。

支持的元素：
- `<a>` 标签（链接）
- `<img>` 标签（图片src）

## 文件结构

```
chrome/
├── manifest.json          # 插件配置文件
├── content.js            # 主逻辑代码
├── preview.css           # 预览样式
├── svgaparser.min.js     # SVGA解析库
└── README.md             # 说明文档
```

## 技术特性

- 使用 SVGA Player Web 库进行动画解析和播放
- 自动检测 .svga 链接
- 智能定位预览框，避免超出视口
- 循环播放动画
- 支持所有网页
