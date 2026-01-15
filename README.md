# AfriLab 🧪

**Africa's Premier Virtual Science Laboratory Platform**

AfriLab is a comprehensive simulated laboratory platform designed for African universities, enabling students to perform hands-on science experiments in a safe, accessible virtual environment. Built entirely on Cloudflare's edge infrastructure with AI-powered tutoring.

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ Features

### 🔬 Virtual Laboratory Simulations
- **Chemistry Labs**: Acid-base titrations, spectroscopy, organic synthesis
- **Biology Labs**: Microscopy, virtual dissections, cell studies
- **Physics Labs**: Mechanics, optics, circuit simulations
- **Pharmacy Labs**: Drug compounding, dosage calculations, interactions
- **Medical Labs**: Patient scenarios, diagnostic reasoning

### 🤖 AI-Powered Learning
- **Intelligent Lab Assistant**: Powered by Cloudflare Workers AI (Llama 3.1)
- **Context-Aware Help**: Understands your current experiment and progress
- **Adaptive Hints**: Progressive guidance without giving away answers
- **Automated Assessment**: AI-generated feedback on lab reports

### 📊 Progress Tracking
- Real-time measurement recording
- Performance analytics dashboard
- Learning progress visualization
- Institution-wide reporting for instructors

### 🏫 Multi-Institution Support
- University registration codes
- Role-based access (Student, Instructor, Admin)
- SSO-ready architecture
- Cross-institution analytics

---

## 🏗️ Architecture

AfriLab is built entirely on **Cloudflare's ecosystem**:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | SvelteKit + Cloudflare Pages | Fast, SEO-friendly UI |
| Database | Cloudflare D1 (SQLite) | Edge-located data storage |
| Sessions | Cloudflare KV | Low-latency session management |
| Assets | Cloudflare R2 | 3D models, videos, documents |
| AI | Cloudflare Workers AI | Intelligent tutoring (Llama 3.1) |
| Compute | Cloudflare Workers | Serverless backend logic |

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │  Pages  │  │   D1    │  │   KV    │  │   Workers AI    ││
│  │ (UI/SSR)│  │(SQLite) │  │(Sessions│  │   (Llama 3.1)   ││
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘│
│       │            │            │                │          │
│       └────────────┴────────────┴────────────────┘          │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │   Workers   │                          │
│                    │  (API/Auth) │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghwmelite-dotcom/AfriLab.git
   cd AfriLab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Cloudflare resources**
   ```bash
   # Create D1 database
   wrangler d1 create afrilab-db

   # Create KV namespace
   wrangler kv:namespace create SESSIONS

   # Create R2 bucket (optional)
   wrangler r2 bucket create afrilab-assets
   ```

4. **Update `wrangler.toml`** with your resource IDs

5. **Run database migrations**
   ```bash
   npm run db:migrate        # Local
   npm run db:migrate:prod   # Production
   ```

6. **Start development server**
   ```bash
   npm run dev      # Vite dev server
   npm run preview  # Wrangler preview with bindings
   ```

### Deployment

```bash
npm run deploy
```

This builds the project and deploys to Cloudflare Pages.

---

## 📁 Project Structure

```
afrilab/
├── migrations/              # D1 database migrations
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── ai/          # AI chat interface
│   │   │   ├── lab/         # Lab equipment components
│   │   │   └── layout/      # Header, Sidebar, Footer
│   │   ├── server/          # Server-side utilities
│   │   │   ├── auth.ts      # Authentication logic
│   │   │   ├── db.ts        # Database helpers
│   │   │   └── ai.ts        # AI prompt builders
│   │   ├── simulations/     # Experiment logic
│   │   │   └── chemistry/   # Chemistry simulations
│   │   ├── stores/          # Svelte stores
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   └── routes/
│       ├── api/             # API endpoints
│       ├── auth/            # Login, Register, Logout
│       ├── dashboard/       # Student dashboard
│       ├── instructor/      # Instructor dashboard
│       └── labs/            # Laboratory pages
├── static/                  # Static assets
├── wrangler.toml           # Cloudflare configuration
└── package.json
```

---

## 🧪 Available Experiments

### Chemistry
- **Acid-Base Titration** - Learn volumetric analysis with phenolphthalein indicator
- **UV-Vis Spectroscopy** - Beer-Lambert law and absorbance measurements
- **Organic Synthesis** *(coming soon)*

### Biology
- **Microscopy Basics** *(coming soon)*
- **Virtual Dissection** *(coming soon)*

### Physics
- **Optics Lab** *(coming soon)*
- **Circuit Simulation** *(coming soon)*

### Pharmacy
- **Drug Compounding** *(coming soon)*
- **Pharmacokinetics** *(coming soon)*

---

## 🔧 Configuration

### Environment Variables

Create a `.dev.vars` file for local development:

```env
# Optional: Override defaults
APP_ENV=development
```

### Cloudflare Bindings

The `wrangler.toml` file configures all Cloudflare services:

```toml
[[d1_databases]]
binding = "DB"
database_name = "afrilab-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "afrilab-assets"

[ai]
binding = "AI"
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write TypeScript for type safety
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cloudflare** - For providing the edge infrastructure
- **Svelte Team** - For the amazing framework
- **African Universities** - For inspiring this project

---

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/ghwmelite-dotcom/AfriLab/issues)
- **Discussions**: [Join the conversation](https://github.com/ghwmelite-dotcom/AfriLab/discussions)

---

<p align="center">
  <strong>Built with ❤️ for African Education</strong><br>
  <em>Powered by Cloudflare</em>
</p>
