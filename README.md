<p align="center">
  <img src="https://raw.githubusercontent.com/reworkd/AgentGPT/main/next/public/banner.png" height="300" alt="GrantCraft Logo"/>
</p>
<p align="center">
  <em>🤖 Assemble, configure, and deploy autonomous AI Agent(s) for grant discovery and writing. 🤖   </em>
</p>
<p align="center">
    <img alt="Node version" src="https://img.shields.io/static/v1?label=node&message=%20%3E=18&logo=node.js&color=2334D058" />
      <a href="https://github.com/reworkd/AgentGPT/blob/master/README.md"><img src="https://img.shields.io/badge/lang-English-blue.svg" alt="English"></a>
  <a href="https://github.com/reworkd/AgentGPT/blob/master/docs/README.zh-HANS.md"><img src="https://img.shields.io/badge/lang-简体中文-red.svg" alt="简体中文"></a>
  <a href="https://github.com/reworkd/AgentGPT/blob/master/docs/README.hu-Cs4K1Sr4C.md"><img src="https://img.shields.io/badge/lang-Hungarian-red.svg" alt="Hungarian"></a>
</p>

<p align="center">
<a href="https://grantcraft.ai">🔗 Official Site</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="https://grantcraft.ai/docs">📚 Docs</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="https://twitter.com/grantcraftai">🐦 Twitter</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="https://discord.gg/grantcraft">📢 Discord</a>
</p>

GrantCraft allows you to configure and deploy Autonomous AI agents for grant discovery and writing.
Name your own custom AI and have it embark on any grant-related goal imaginable.
It will attempt to reach the goal by thinking of tasks to do, executing them, and learning from the results 🚀.

---

## ✨ Demo
For the best experience, try [our site](https://grantcraft.ai) directly!

## 👨‍🚀 Getting Started

The easiest way to get started with GrantCraft is automatic setup CLI bundled with the project.
The CLI sets up the following:
- 🔐 [Environment variables](https://github.com/GrantCraft/GrantCraft/blob/main/.env.example) (and API Keys)
- 🗂️ [Database](https://github.com/GrantCraft/GrantCraft/tree/main/db) (MySQL)
- 🤖 [Backend](https://github.com/GrantCraft/GrantCraft/tree/main/platform) (FastAPI)
- 🎨 [Frontend](https://github.com/GrantCraft/GrantCraft/tree/main/next) (Next.js)

## Prerequisites

Before you get started, please make sure you have the following installed:

- An editor of your choice, like [Visual Studio Code](https://code.visualstudio.com/download)
- [Node.js](https://nodejs.org/en/download) (>=18.0.0 <19.0.0)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop) (create an account, open the Docker application, and sign in)
- An [OpenAI API key](https://platform.openai.com/signup)

## Getting Started
1. **Clone the Repository and Navigate into the Directory**

   **For Mac/Linux users**
   ```bash
   git clone https://github.com/GrantCraft/GrantCraft.git
   cd GrantCraft
   ./setup.sh
   ```
   **For Windows users**
   ```bash
   git clone https://github.com/GrantCraft/GrantCraft.git
   cd GrantCraft
   ./setup.bat
   ```
2. **Follow the setup instructions from the script** - add the appropriate API keys, and once all of the services are running, visit [http://localhost:3000](http://localhost:3000) in your web browser.

## 🚀 Tech Stack

- ✅ **Framework**: [Next.js 13 + TypeScript](https://nextjs.org/) + [FastAPI](https://fastapi.tiangolo.com/)
- ✅ **Auth**: [Next-Auth.js](https://next-auth.js.org)
- ✅ **Database**: [Prisma](https://prisma.io) + [MySQL](https://mysql.com)
- ✅ **Styling**: [TailwindCSS](https://tailwindcss.com) + [HeadlessUI](https://headlessui.com)
- ✅ **LLM Tooling**: [Langchain](https://github.com/hwchase17/langchain)

## 💪 Contributors 

<p align="center">
Our contributors have made this project possible. Thank you! 🙏
</p>

<a href="https://github.com/GrantCraft/GrantCraft/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=GrantCraft/GrantCraft" />
</a>

<div align="center">
<sub>Made with <a href="https://contrib.rocks">contrib.rocks</a>.</sub>
</div>