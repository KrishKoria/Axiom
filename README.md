<div align="center">

# Axiom

### The AI-Native Code Editor That Lives in Your Browser

_Think Cursor meets Replit – a fully browser-based IDE with Claude as your pair programmer_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is Axiom?

Axiom reimagines how developers write code. It's a **web-based IDE** that doesn't just help you code – it _codes with you_.

**No terminal. No local setup. Just open your browser and build.**

```
┌─────────────────────────────────────────────────────────────┐
│  AI Chat             │   Files    │     Code Editor         │
│                      │            │                         │
│  "Add a REST API     │  ├ src/    │  export async function  │
│   for user auth"     │  │ └ app/  │    getUsers() {         │
│                      │  └ lib/    │      // AI writes this  │
│   On it! I'll...     │            │    }                    │
│                      ├────────────┤                         │
│                      │   Preview  │                         │
│                      │  localhost │                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### AI-First Development

- **Conversational Coding** – Chat with Claude about your project. It reads your files, understands context, and writes code for you.
- **Inline Suggestions** – Get real-time AI completions as you type, powered by Claude 3.5 Haiku.
- **Quick Edits** – Select code, describe what you want, and watch it transform. Include URLs and the AI will scrape documentation for context.
- **Smart File Operations** – The AI creates, edits, renames, and deletes files. No copy-paste needed.

### Full-Featured Code Editor

- **CodeMirror 6** – Industry-grade editing with syntax highlighting for JS/TS, Python, Go, HTML, CSS, JSON, and Markdown.
- **Minimap Navigation** – See your entire file at a glance.
- **Multi-Tab Editing** – Work on multiple files simultaneously.
- **One Dark Theme** – Beautiful dark mode by default.

### In-Browser Development Environment

- **WebContainers** – Run Node.js projects directly in your browser. No backend server needed.
- **Integrated Terminal** – Full terminal access with streaming output.
- **Live Preview** – See changes instantly as you code.
- **Device Switcher** – Test responsive designs across desktop, tablet, and mobile viewports.

### GitHub Integration

- **Import Repositories** – Clone any GitHub repo into Axiom with one click.
- **Export Projects** – Push your work to GitHub when you're ready.
- **Background Processing** – Large repos import/export in the background while you work.

### Smart Project Management

- **Create from Prompt** – Describe what you want, and AI generates the starter code.
- **Real-Time Sync** – All changes sync instantly via Convex.
- **File Explorer** – Navigate your project with a familiar tree view.

---

## ️ Tech Stack

| Layer                   | Technology                    |
| ----------------------- | ----------------------------- |
| **Framework**           | Next.js 16 (App Router)       |
| **Language**            | TypeScript 5 (strict mode)    |
| **Database**            | Convex (real-time serverless) |
| **Authentication**      | Clerk                         |
| **AI**                  | Claude Sonnet 4.5 + Haiku 3.5 |
| **Code Editor**         | CodeMirror 6                  |
| **Runtime**             | WebContainer API              |
| **Background Jobs**     | Inngest                       |
| **UI Components**       | Radix UI + Tailwind CSS 4     |
| **Animations**          | Framer Motion 12              |
| **Syntax Highlighting** | Shiki                         |
| **GitHub**              | Octokit                       |

---

## Quick Start

### Prerequisites

- **Node.js** 20+ (recommend v22)
- **Bun** 1.3+ (or npm/pnpm)
- **mprocs** (optional, for multi-process running)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/axiom.git
cd axiom
bun install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
#  Clerk Authentication
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ️ Convex Database
# Get these from https://dashboard.convex.dev
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_INTERNAL_KEY=your-internal-key

#  Anthropic AI
# Get this from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-...

#  Firecrawl (for URL scraping in prompts)
# Get this from https://firecrawl.dev
FIRECRAWL_API_KEY=fc-...
```

### 3. Initialize Convex

```bash
bunx convex dev
```

This pushes the database schema and starts the Convex sync.

### 4. Run the Development Server

**Option A: All services at once (recommended)**

```bash
bun run mprocs
```

**Option B: Separate terminals**

```bash
# Terminal 1 - Database
bunx convex dev

# Terminal 2 - Next.js
bun dev

# Terminal 3 - Background Jobs
bun run inngest:dev
```

### 5. Open in Browser

Navigate to **[http://localhost:3000](http://localhost:3000)** and start building!

---

## Project Structure

```
axiom/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── github/         # Import/export endpoints
│   │   │   ├── messages/       # AI chat endpoint
│   │   │   ├── quick-edit/     # Inline AI editing
│   │   │   └── suggestion/     # Code completions
│   │   ├── projects/[id]/      # Project workspace
│   │   └── sign-in/, sign-up/  # Auth pages
│   │
│   ├── components/
│   │   ├── ai-elements/        # Chat UI components
│   │   ├── conversation-panel/ # AI sidebar
│   │   ├── editor/             # CodeMirror setup
│   │   │   └── extensions/     # Editor plugins
│   │   ├── explorer/           # File tree
│   │   ├── preview/            # WebContainer preview
│   │   ├── projects/           # Project management
│   │   └── ui/                 # Shadcn components
│   │
│   ├── inngest/                # Background jobs
│   │   ├── tools/              # AI agent tools
│   │   ├── process-messages.ts # Chat processing
│   │   ├── import-github.ts    # Repo import
│   │   └── export-github.ts    # Repo export
│   │
│   ├── hooks/                  # React hooks
│   ├── lib/                    # Utilities
│   └── store/                  # Zustand state
│
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema
│   ├── projects.ts             # Project operations
│   ├── files.ts                # File operations
│   ├── conversations.ts        # Chat operations
│   └── messages.ts             # Message operations
│
└── public/                     # Static assets
```

---

## How the AI Works

```
User sends message
        ↓
    ┌───────────────────────────────────┐
    │  Inngest Event: message/sent      │
    └───────────────────────────────────┘
        ↓
    ┌───────────────────────────────────┐
    │  Claude Agent with Tools          │
    │                                   │
    │   read-files                      │
    │  ️  update-file                    │
    │   create-files                    │
    │  ️  delete-file                    │
    │   create-folder                   │
    │   scrape-url                      │
    └───────────────────────────────────┘
        ↓
    Response streams back to UI
```

The AI has full access to your project. When you ask it to "add user authentication," it:

1. Reads your existing code structure
2. Creates necessary files
3. Updates imports and configurations
4. Explains what it did

---

## ️ Keyboard Shortcuts

| Shortcut     | Action             |
| ------------ | ------------------ |
| `⌘/Ctrl + J` | Create new project |
| `⌘/Ctrl + I` | Import from GitHub |
| `⌘/Ctrl + Y` | Create from prompt |
| `⌘/Ctrl + K` | View all projects  |

---

## Database Schema

```typescript
// Projects contain files and conversations
projects: {
  name: string
  ownerId: string           // Clerk user ID
  importStatus?: "pending" | "completed" | "failed"
  exportStatus?: "pending" | "completed" | "failed"
  settings?: { installCommand, devCommand }
}

// Hierarchical file system
files: {
  projectId: Id<"projects">
  parentId?: Id<"files">    // For nested folders
  name: string
  type: "file" | "folder"
  content?: string          // Text content
  storageId?: Id<"_storage"> // Binary files
}

// Chat history
conversations: { projectId, title, updatedAt }
messages: { conversationId, role, content, status }
```

---

## Contributing

Contributions are welcome! Whether it's:

- Bug fixes
- New features
- Documentation improvements
- Ideas and suggestions

Please open an issue first to discuss what you'd like to change.

---

<div align="center">

**Built with love and AI**

_Stop fighting your tools. Start building with them._

</div>
