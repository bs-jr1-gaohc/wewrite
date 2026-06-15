# WeWrite Web — 云端网页工具

把 WeWrite（一个 Claude Code / Codex 风格的"公众号文章全流程 Skill"）变成**外部用户无需任何本地部署**就能使用的网页工具。所有部署都在云端完成，用户只需打开网页输入一句话。

```
┌────────────┐     HTTPS/SSE      ┌───────────────────────────┐
│  浏览器     │ ◀───────────────▶ │  FastAPI 后端 (web/backend) │
│ Next.js    │   /api/jobs ...    │                            │
│(web/frontend)                   │  ┌──────────────────────┐  │
└────────────┘                    │  │ Claude Agent SDK      │  │
                                  │  │  └─ 运行 SKILL.md 管道 │  │
                                  │  │     (Step 1–8)        │  │
                                  │  └──────────┬───────────┘  │
                                  │   每个任务一个独立工作区     │
                                  │   toolkit/ scripts/ refs/   │
                                  └──────────────┬─────────────┘
                                                 │
                              平台密钥池 (LLM + 图片)  +  用户绑定的微信 appid/secret
```

## 为什么是这个架构

WeWrite 本质是一个 **LLM 编排的 Skill**：文章的*写作*由 Agent（读 `SKILL.md` + `references/`）完成，Python 的 `toolkit/`/`scripts/` 只做机械活（抓热点、SEO 评分、AI 配图、Markdown→微信 HTML、推送草稿箱）。

要让用户"零部署"，我们在云端托管三样东西：

1. **LLM 大脑** —— 用 [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk) 在每个任务的独立工作区里运行现成的 `SKILL.md` 管道（`claude-opus-4-8`）。不重写管道逻辑，直接复用仓库根目录的 skill。
2. **Python 工具链** —— 后端镜像里装好 `requirements.txt`，Agent 通过 Bash 工具调用 `toolkit/cli.py`、`scripts/*.py`。
3. **Web UI** —— Next.js 前端：一句话下单 → 实时进度（SSE）→ 预览 / 复制 / 下载 / 推送草稿箱。

### 密钥模型（已确认）

- **平台统一出**：LLM（`ANTHROPIC_API_KEY`）和 AI 图片（doubao/dashscope/… 任选）的密钥由平台配置，用户零配置即可用。
- **微信发布是唯一例外**：推送到*用户自己的*公众号草稿箱必须用*用户自己的* `appid`/`secret`，平台无法代出。因此"全流程含微信推送"要求用户在设置里绑定自己的公众号凭证；其余环节全部零配置。

## 目录

```
web/
├── backend/         FastAPI + Claude Agent SDK
│   ├── app/
│   │   ├── main.py        FastAPI 应用 + CORS + 路由挂载
│   │   ├── config.py      环境变量配置（平台密钥池等）
│   │   ├── models.py      Pydantic 请求/响应模型
│   │   ├── security.py    微信凭证加密存储
│   │   ├── store.py       账户 + 任务的存储（默认内存版，可换 DB）
│   │   ├── workspace.py   为每个任务构建独立工作区（复制 skill + 注入配置）
│   │   ├── agent_runner.py 用 Agent SDK 运行 SKILL.md 管道并流式产出进度
│   │   └── routes/        jobs / catalog / account 路由
│   ├── requirements.txt
│   └── .env.example
└── frontend/        Next.js (App Router, TypeScript)
    ├── app/         首页(下单+进度+结果) / settings(微信绑定+风格)
    ├── lib/api.ts   后端 API 客户端 (含 SSE)
    └── package.json
```

## 本地起步

后端：

```bash
cd web/backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
# 还需安装 WeWrite 工具链依赖（Agent 通过 Bash 调用）：
.venv/bin/pip install -r ../../requirements.txt
cp .env.example .env   # 填入 ANTHROPIC_API_KEY、平台图片 key、APP_SECRET_KEY
.venv/bin/uvicorn app.main:app --reload --port 8000
```

前端：

```bash
cd web/frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE=http://localhost:8000
npm run dev   # http://localhost:3000
```

> 当前后端的账户/任务存储是**进程内存版**，便于本地起步与演示；生产需替换为数据库（账户、任务、加密凭证）并把每个任务跑在隔离沙箱容器里（Agent 以 `bypassPermissions` 执行 Bash，必须沙箱化）。详见 `backend/app/store.py` 与 `backend/app/agent_runner.py` 顶部的 NOTE。
```
