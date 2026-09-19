<div align="center">

# ♻️ EcoSort AI

**AI-Powered Municipal Waste Segregation & Disposal Advisor**

Aligning with **UN SDG 11** (Sustainable Cities) & **SDG 12** (Responsible Consumption & Production)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

</div>

---

## 📋 Overview

EcoSort is a full-stack web application that uses **Google Gemini AI** and **Retrieval-Augmented Generation (RAG)** to classify waste items — via camera image or text description — into municipal bin categories, provide locality-aware disposal instructions, and promote circular upcycling.

### Key Features

- 📸 **AI Waste Scanner** — Upload a photo or type a description; Gemini classifies the item into recyclable, organic, e-waste, hazardous, or general waste with a confidence score and reasoning.
- 🗂️ **RAG Knowledge Base** — Municipal bylaw rules are stored and retrieved at scan-time to tailor disposal instructions to the user's locality.
- 🏛️ **Admin Rules Manager** — Full CRUD panel for managing municipal waste rules, with one-click seed of 28+ pre-built rules.
- 📊 **Impact Dashboard** — Track segregation streaks, eco-points, CO₂ offsets, badges, and community statistics.
- 🔄 **Circular Upcycle Studio** — AI-generated creative upcycling ideas for scanned items with difficulty levels and tool lists.
- 📍 **Municipal Drop-Off Locator** — Directory of SAFE centers and municipal depots filtered by waste category.
- 🏆 **Eco-Citizen Certificate** — Downloadable verified impact certificate tied to user stats.
- 📜 **Decomposition Timeline** — Visual breakdown of how long items take to decompose, landfill methane impact, and ocean pollution risk.
- 🔐 **Auth System** — User registration & login with role-based access (user / admin).
- 🗃️ **Dual-Mode Storage** — Seamless fallback between MongoDB Atlas and embedded local JSON persistence — zero-downtime guarantee.
- 🌐 **SEO & Deep Linking** — Hash-based client routing with dynamic `<title>`, Open Graph, and canonical URL updates.
- ⚖️ **Legal Pages** — Built-in Terms & Conditions and Privacy Policy views.
- 🚫 **Custom 404 Page** — Themed error page with quick-search redirect.

---

## 🛠️ Tech Stack

| Layer       | Technology                                                  |
| :---------- | :---------------------------------------------------------- |
| Frontend    | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons |
| Backend     | Express.js (Node.js), TypeScript                            |
| AI Engine   | Google Gemini API (`@google/genai`)                         |
| Database    | MongoDB Atlas (cloud) / Embedded JSON (local fallback)      |
| Build       | Vite 6, esbuild, tsx                                        |
| Dev Tools   | TypeScript 5.8, Autoprefixer                                |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- *(Optional)* A **MongoDB Atlas** cluster — see [MONGODB_SETUP.md](MONGODB_SETUP.md)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Maxop100/ecosort.git
cd ecosort

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

### Configuration

Edit `.env` and set the required values:

```env
# Required — your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — MongoDB Atlas connection string (falls back to local JSON if omitted)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecosort?retryWrites=true&w=majority"

# Optional — secret for session signing
NEXTAUTH_SECRET=your_random_secret_here
```

> See [`.env.example`](.env.example) for all available variables.

### Run the App

```bash
# Development (with hot-reload)
npm run dev
```

The app starts at **http://localhost:3000**.

### Production Build

```bash
# Build frontend + server bundle
npm run build

# Start the production server
npm start
```

---

## 📁 Project Structure

```
ecosort/
├── server.ts                 # Express server entry point
├── server/
│   ├── ai.ts                 # Gemini AI classification & upcycle generation
│   ├── db.ts                 # Embedded JSON database layer
│   ├── mongodb.ts            # MongoDB Atlas integration
│   ├── rag.ts                # Retrieval-Augmented Generation engine
│   ├── dropoff_data.ts       # Municipal drop-off depot directory
│   └── waste_rules_seed.ts   # Seed data for municipal rules
├── src/
│   ├── App.tsx               # Main React application
│   ├── main.tsx              # React entry point
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── index.css             # Tailwind CSS styles
│   └── components/
│       ├── ScanUploader.tsx       # Camera/text waste input
│       ├── ResultCard.tsx         # AI classification results display
│       ├── HistoryTable.tsx       # Scan audit log
│       ├── AdminRulesPanel.tsx    # Municipal rules CRUD manager
│       ├── StreakStatsBanner.tsx   # Impact dashboard & badges
│       ├── UpcycleStudio.tsx      # Circular upcycle idea generator
│       ├── DropOffLocatorModal.tsx # Municipal depot finder
│       ├── CertificateModal.tsx   # Eco-citizen impact certificate
│       ├── DecompositionTimeline.tsx # Decomposition stats visual
│       ├── DeliverableModal.tsx    # Project brief & architecture
│       ├── AuthModal.tsx          # Login/register modal
│       ├── Navbar.tsx             # Navigation bar
│       ├── LegalPoliciesView.tsx  # Terms & Privacy pages
│       ├── MongoDbSetupCard.tsx   # In-app MongoDB setup assistant
│       └── NotFoundPage.tsx       # Custom 404 page
├── models/                   # Mongoose schema definitions
│   ├── User.ts
│   ├── ScanRecord.ts
│   └── WasteRule.ts
├── data/                     # Embedded JSON persistence files
│   ├── users.json
│   ├── scans.json
│   └── waste_rules.json
├── public/                   # Static assets (favicon, robots.txt, sitemap)
├── metadata.json             # App metadata & permissions
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── package.json
└── MONGODB_SETUP.md          # MongoDB Atlas setup guide
```

---

## 🗄️ Database Setup (Optional)

EcoSort works **out of the box** with embedded local JSON storage. For persistent cloud storage, set up a free MongoDB Atlas cluster:

👉 **[Full MongoDB Setup Guide →](MONGODB_SETUP.md)**

To seed the database with 28+ municipal waste rules:

```bash
npm run seed:mongodb
```

Or use the one-click seed button in the **Admin Rules** tab within the app.

---

## 📜 Available Scripts

| Command              | Description                                        |
| :------------------- | :------------------------------------------------- |
| `npm run dev`        | Start development server with hot-reload           |
| `npm run build`      | Build frontend (Vite) + server (esbuild) for production |
| `npm start`          | Run the production server from `dist/`             |
| `npm run preview`    | Preview the Vite production build                  |
| `npm run seed:mongodb` | Seed MongoDB with default municipal waste rules  |
| `npm run lint`       | Type-check the project with `tsc --noEmit`         |
| `npm run clean`      | Remove build artifacts                             |

---

## 🌍 UN Sustainable Development Goals

EcoSort directly contributes to:

- **SDG 11 — Sustainable Cities & Communities**: Empowering municipal waste infrastructure with AI-driven classification to reduce landfill overflow and improve urban sanitation.
- **SDG 12 — Responsible Consumption & Production**: Promoting waste segregation at source, circular economy upcycling, and informed disposal practices to minimize environmental impact.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with 🌱 for a cleaner planet</sub>
</div>
