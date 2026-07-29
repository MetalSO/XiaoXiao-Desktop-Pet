# 笑笑桌宠

首版桌宠采用 `Electron + React + PixiJS`，基于单张人物透明 PNG 做轻动画。

## 功能

- 透明无边框桌面窗口
- 默认始终置顶
- 鼠标拖拽移动
- 待机呼吸、上下浮动、轻微摇摆
- 点击弹跳和气泡台词
- 定时点头、伸懒腰、摇晃、冒泡
- 右键菜单：隐藏、重置位置、放大、缩小、置顶、退出
- 托盘菜单：显示/隐藏、重置位置、退出
- 本地保存位置、缩放和置顶状态

## 运行

```bash
npm.cmd install
npm.cmd run dev
```

## 打包

```bash
npm.cmd run dist
```

打包产物会输出到 `release/`。

## 替换角色素材

默认角色位于 `assets/pets/xiaoxiao/`。

- `idle.png`：透明背景角色主图
- `manifest.json`：角色名称、气泡台词和待机动作配置

后续可以继续往 manifest 里扩展表情图、换装和序列帧动作。
