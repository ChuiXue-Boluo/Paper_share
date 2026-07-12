# PaperShare

[English](#english) | [中文](#中文)

Repository: https://github.com/ChuiXue-Boluo/Paper_share

Maintainer: [ChuiXue-Boluo](https://github.com/ChuiXue-Boluo)

## English

PaperShare is a lightweight web app for research groups to share papers, browse them by research area, and maintain a shared Markdown note for each paper.

It is designed for small labs and reading groups: simple local deployment, SQLite persistence, PDF storage on disk, and a React UI for paper upload, browsing, note editing, and download.

### Features

- Browse research areas from the home page
- Search research areas with fuzzy matching
- Upload PDF papers from the home page or a research-area page
- Assign one paper to multiple research areas
- Create new research areas while uploading or editing a paper
- Edit paper metadata after upload
- Store venue, topic, uploader, title, and PDF file
- Prevent duplicate paper titles inside the same research area
- Preview the `# 论文概述` section from the shared note in paper lists
- Edit shared Markdown notes with live preview
- Download original PDFs
- Local-first storage with SQLite and filesystem uploads

### Tech Stack

- Frontend: Vite, React, TypeScript, MUI, Tailwind CSS, `@uiw/react-md-editor`
- Backend: Node.js, Express, SQLite via `better-sqlite3`, Multer
- Storage: SQLite database plus local uploaded files

### Quick Start

Requirements:

- Node.js 20 or newer
- npm

Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

The backend listens on:

```text
http://localhost:3001
```

### Optional Demo Data

The project starts empty by default. To generate demo research areas and example papers:

```bash
cd server
npm run seed
```

This writes local-only data to `server/data/` and `server/uploads/`, which are intentionally ignored by Git.

### Environment Variables

Copy the examples if you need custom ports or paths:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Backend variables:

- `PORT`: API port, default `3001`
- `DB_PATH`: SQLite file path, default `./data/paper_share.sqlite`
- `UPLOAD_DIR`: uploaded file directory, default `./uploads`
- `CLIENT_ORIGIN`: frontend origin for CORS, default `http://localhost:5173`

Frontend variables:

- `VITE_API_BASE_URL`: API base path, default `/api`

### Data and Privacy

This repository is safe to publish as source code only. Runtime data is intentionally not tracked:

- `server/data/`: SQLite databases
- `server/uploads/`: uploaded PDFs and note images
- `client/dist/`: build artifacts
- `node_modules/`: installed dependencies
- `.env`: local environment overrides

Do not commit real lab papers, private notes, local databases, credentials, or generated uploads.

### Systemd Examples

Example user-level systemd service templates are available in `ops/systemd/`. They use placeholders and must be adapted to your machine before installation.

### Nginx LAN Deployment

For shared LAN access, build the frontend and let Nginx serve the static app while proxying API and uploaded files to the backend:

```bash
cd client
npm run build

sudo mkdir -p /var/www/paper-share
sudo cp -r dist/. /var/www/paper-share/
sudo chown -R www-data:www-data /var/www/paper-share

sudo cp ../ops/nginx/paper-share.conf /etc/nginx/sites-available/paper-share
sudo ln -sfn /etc/nginx/sites-available/paper-share /etc/nginx/sites-enabled/paper-share
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow 8080/tcp
```

Then open:

```text
http://SERVER_IP:8080
```

### License

MIT License. See [LICENSE](./LICENSE).

## 中文

PaperShare 是一个面向实验室和论文阅读小组的轻量级论文共享 Web 应用。它支持按研究领域浏览论文、上传 PDF、维护每篇论文的共享 Markdown 笔记，并在列表页预览论文概述。

仓库地址：https://github.com/ChuiXue-Boluo/Paper_share

维护者：[ChuiXue-Boluo](https://github.com/ChuiXue-Boluo)

项目偏向小团队本地部署：SQLite 持久化、本地文件系统保存 PDF、React 前端提供上传、浏览、编辑笔记和下载能力。

### 功能

- 首页浏览研究领域
- 首页研究领域模糊搜索
- 在首页或具体领域页上传 PDF 论文
- 一篇论文可归属多个研究领域
- 上传或编辑论文时可创建新的研究领域
- 上传后可编辑论文信息
- 支持论文题目、发表会议、具体方向、上传者和 PDF 文件
- 同一研究领域内禁止重复论文题目
- 论文列表自动预览共享笔记中的 `# 论文概述`
- Markdown 共享笔记编辑与实时预览
- 下载原始 PDF
- 使用 SQLite 和本地文件系统，部署简单

### 技术栈

- 前端：Vite、React、TypeScript、MUI、Tailwind CSS、`@uiw/react-md-editor`
- 后端：Node.js、Express、SQLite `better-sqlite3`、Multer
- 存储：SQLite 数据库 + 本地上传文件

### 快速开始

环境要求：

- Node.js 20 或更高版本
- npm

安装依赖：

```bash
cd client
npm install

cd ../server
npm install
```

启动后端：

```bash
cd server
npm run dev
```

另开一个终端启动前端：

```bash
cd client
npm run dev
```

打开：

```text
http://localhost:5173
```

后端默认地址：

```text
http://localhost:3001
```

### 可选演示数据

项目默认是空数据状态。需要演示数据时可以运行：

```bash
cd server
npm run seed
```

该命令会写入本地目录 `server/data/` 和 `server/uploads/`，这些目录不会进入 Git。

### 环境变量

需要自定义端口或路径时，可以复制示例文件：

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

后端变量：

- `PORT`：API 端口，默认 `3001`
- `DB_PATH`：SQLite 文件路径，默认 `./data/paper_share.sqlite`
- `UPLOAD_DIR`：上传文件目录，默认 `./uploads`
- `CLIENT_ORIGIN`：CORS 允许的前端地址，默认 `http://localhost:5173`

前端变量：

- `VITE_API_BASE_URL`：API 基础路径，默认 `/api`

### 数据与隐私

本仓库只适合发布源码。运行时数据不会被 Git 跟踪：

- `server/data/`：SQLite 数据库
- `server/uploads/`：上传的 PDF 和笔记图片
- `client/dist/`：构建产物
- `node_modules/`：依赖目录
- `.env`：本地环境变量

不要提交真实论文、私有笔记、本地数据库、凭据或上传文件。

### Systemd 示例

`ops/systemd/` 中提供用户级 systemd 服务模板。模板包含占位符，安装前需要按自己的机器路径修改。

### Nginx 局域网部署

多人局域网访问时，推荐用 Nginx 统一入口：前端使用生产构建产物，`/api` 和 `/uploads` 代理到后端。

```bash
cd client
npm run build

sudo mkdir -p /var/www/paper-share
sudo cp -r dist/. /var/www/paper-share/
sudo chown -R www-data:www-data /var/www/paper-share

sudo cp ../ops/nginx/paper-share.conf /etc/nginx/sites-available/paper-share
sudo ln -sfn /etc/nginx/sites-available/paper-share /etc/nginx/sites-enabled/paper-share
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow 8080/tcp
```

访问：

```text
http://服务器IP:8080
```

### 许可证

MIT License，见 [LICENSE](./LICENSE)。
