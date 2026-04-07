# 🏛️ Soukify — AI Agent Marketplace

> **Hire autonomous AI agents that don't just chat — they execute.**

Soukify is a premium AI agent marketplace where users can hire specialized, autonomous agents to perform real-world tasks — book flights, file taxes, manage social media, analyze live crypto markets, and more. Every action is secured through the **Auth0 Token Vault**, which grants agents scoped, revocable permissions without ever exposing raw credentials.

![Soukify](https://img.shields.io/badge/Status-Live-brightgreen) ![AI](https://img.shields.io/badge/AI-Powered-gold) ![Auth0](https://img.shields.io/badge/Security-Auth0%20Vault-blue)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **7 Specialized AI Agents** | Travel, Tax, HR, Social Media, Smart Home, Health, Market Intelligence |
| **Auth0 Token Vault** | Secure SSO with granular, revocable scope delegation per agent |
| **Live Market Data** | Atlas Analyst fetches real-time crypto prices via CoinGecko API |
| **Native High-Fidelity Audio** | AI responses delivered via native TTS with PCM audio decoding |
| **Voice Commands** | Speak directives via microphone — agents process voice input natively |
| **Visual Receipts** | Every execution produces rich visual confirmations (payments, bookings, messages) |
| **Cinematic UI** | Custom cursor, orbital animations, glassmorphism, scroll reveals, marquee ticker |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React + Vite)        │
│  Landing Page → Auth0 Login → Agent Marketplace  │
│  Voice Input → PCM Audio Playback → Receipts     │
└──────────────────────┬──────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────┐
│               Backend (Express.js)               │
│                                                  │
│  /api/hire     → Mint scoped Auth0 token         │
│  /api/revoke   → Revoke agent permissions        │
│  /api/agent/chat  → Text → AI JSON → TTS Audio  │
│  /api/agent/voice → Speech → AI JSON → TTS Audio│
│                                                  │
│  ┌─────────────┐  ┌──────────────┐               │
│  │ AI Engine   │  │ CoinGecko API│               │
│  │ (Step 1:    │  │ Live BTC/ETH │               │
│  │  JSON)      │  │ Price Feed   │               │
│  │ (Step 2:    │  └──────────────┘               │
│  │  TTS Audio) │                                 │
│  └─────────────┘                                 │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone
git clone https://github.com/i-ayush-7/Soukify.git
cd Soukify

# 2. Backend
cd backend
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
node server.js

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** → Click **Get Started** → Login → Hire an agent → Execute!

---

## 🔐 How Auth0 Token Vault Works

1. **Login** — User authenticates via Auth0 Universal Login SSO
2. **Vault** — Payment methods & calendar access are securely vaulted
3. **Hire** — User selects an agent and explicitly grants scoped permissions
4. **Execute** — Agent uses the scoped token to perform tasks autonomously
5. **Revoke** — User can instantly revoke all permissions with one click

Agents **never** see raw credentials. They only receive scoped, time-limited tokens.

---

## 🤖 Available Agents

| Agent | Specialty | Key Scopes |
|---|---|---|
| ✈️ **Athena Travel** | Flight & hotel booking | Calendar, Payments |
| 🧾 **Ledger TaxBot** | Tax filing & invoices | Email (invoices only), QuickBooks |
| 🎯 **Nova Recruiter** | Talent sourcing | LinkedIn, Calendar |
| 📱 **Echo Social** | Brand management | Twitter/X, Instagram |
| 🏠 **Orion SmartHome** | IoT control | Nest, Ring Security |
| ❤️ **Aura Health** | Medical concierge | Vitals (read-only), Clinic booking |
| 📊 **Atlas Analyst** | Live market data | CoinGecko API (public) |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, Axios, Lucide Icons, Web Audio API
- **Backend:** Node.js, Express 5, Multer
- **AI Engine:** Dual-model pipeline (JSON reasoning + native TTS audio)
- **Live Data:** CoinGecko Public API
- **Security:** Auth0 Token Vault (scoped delegation)
- **Design:** Custom CSS with Syne + Instrument Sans + Cormorant Garamond fonts

---

## 📁 Project Structure

```
soukify/
├── backend/
│   ├── server.js          # Express API + AI pipeline + static serving
│   ├── package.json
│   └── .env               # GEMINI_API_KEY (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Full app: Landing + Login + Marketplace
│   │   ├── index.css      # Cinematic design system
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   └── package.json
├── package.json            # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

Deployed as a monorepo on **Render** (Web Service):
- **Build:** `cd backend && npm install && cd ../frontend && npm install && npm run build`
- **Start:** `node backend/server.js`
- Express serves the built React app as static files

---

## 👥 Team

Built during a hackathon sprint with ❤️ and a whole lot of caffeine.

---

## 📄 License

MIT © 2025 Soukify
