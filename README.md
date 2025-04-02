<p align="center">
  <img src="https://raw.githubusercontent.com/reworkd/AgentGPT/main/next/public/banner.png" height="300" alt="GrantCraft Logo"/>
</p>
<p align="center">
  <em>🤖 Assemble, configure, and deploy autonomous AI Agent(s) for grant discovery and writing. 🤖   </em>
</p>
<p align="center">
    <img alt="Node version" src="https://img.shields.io/static/v1?label=node&message=%20%3E=18&logo=node.js&color=2334D058" />
    <a href="#"><img src="https://img.shields.io/badge/platform-FastAPI-blue.svg" alt="Platform"></a>
    <a href="#"><img src="https://img.shields.io/badge/frontend-Next.js-black.svg" alt="Frontend"></a>
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

## 🔍 Project Overview

GrantCraft consists of two main components:

- **Frontend**: A Next.js application with authentication, UI, and client logic
- **Backend**: A FastAPI service handling AI agents and business logic

For detailed documentation on each component, see:
- [Frontend Documentation](FRONTEND-README.md)
- [Backend Documentation](BACKEND-README.md)

## 👨‍🚀 Getting Started

### Prerequisites

Before you get started, please make sure you have the following installed:

- An editor of your choice, like [Visual Studio Code](https://code.visualstudio.com/download)
- [Node.js](https://nodejs.org/en/download) (>=18.0.0 <19.0.0)
- [Python 3.9+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop) (create an account, open the Docker application, and sign in)
- An [OpenAI API key](https://platform.openai.com/signup)
- A MySQL database

### Installation

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

### Manual Setup

If you prefer to set up the components manually:

#### Frontend (Next.js)

```bash
cd next
npm install
npx prisma db push  # Apply database schema
npm run dev
```

#### Backend (FastAPI)

```bash
cd platform
poetry install
poetry run uvicorn reworkd_platform.__main__:app --reload
```

## 🔧 Configuration

### Database Setup

For OAuth login to work, you need to ensure the database has all required tables:

```bash
cd next
./apply-schema.sh
```

This script will apply the complete schema including the Account and Session tables needed for NextAuth.js.

### Authentication Options

1. **Development Bypass**: Use username "ratonxi" to bypass login
2. **OAuth Providers**: Configure Google, GitHub, or Discord auth in your .env file

## 🚀 Tech Stack

- ✅ **Framework**: [Next.js 13 + TypeScript](https://nextjs.org/) + [FastAPI](https://fastapi.tiangolo.com/)
- ✅ **Auth**: [Next-Auth.js](https://next-auth.js.org)
- ✅ **Database**: [Prisma](https://prisma.io) + [MySQL](https://mysql.com)
- ✅ **Styling**: [TailwindCSS](https://tailwindcss.com) + [HeadlessUI](https://headlessui.com)
- ✅ **LLM Tooling**: [Langchain](https://github.com/hwchase17/langchain)

## 🐳 Docker Deployment

Build and deploy both services:

```bash
docker-compose up -d
```

Or deploy to Cloud Run:

```bash
# Frontend
cd next
./cloudrun-build.sh

# Backend
cd platform
gcloud builds submit --config=cloudbuild.yaml
```

## 🧪 Testing

```bash
# Frontend tests
cd next
npm run test

# Backend tests
cd platform
poetry run pytest
```

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