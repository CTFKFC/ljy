# 烬与月｜越集

一个可直接部署的静态单页网站，完整收录《越集》全文，并做了暗色东方叙事气质的视觉与文案精修。

## 文件结构

- `index.html` — 主页面
- `styles.css` — 样式文件
- `script.js` — 交互与动画
- `content.js` — 《越集》全文内容数据

## 直接部署到 GitHub Pages

### 方式一：直接上传仓库根目录
1. 新建一个 GitHub 仓库
2. 把这四个文件上传到仓库根目录
3. 进入 **Settings → Pages**
4. Source 选择 **Deploy from a branch**
5. Branch 选择 `main`，目录选 `/ (root)`
6. 保存后等待 GitHub Pages 发布

### 方式二：本地 git 推送
```bash
git init
git add .
git commit -m "Deploy Yueji site"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```
然后去 GitHub 仓库的 **Settings → Pages** 开启 Pages。

## 特点

- 无构建步骤
- 无框架依赖
- 使用 CDN 加载 GSAP / ScrollTrigger / Lenis
- 支持 GitHub Pages / Netlify / Vercel 直接静态部署

## 注意

如果你后面要自定义域名，可以在仓库里再加一个 `CNAME` 文件。
