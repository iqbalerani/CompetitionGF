# GameForge - AI-Powered Game Pre-Production Studio

<div align="center">
<img width="1200" height="475" alt="GameForge Banner" src="assets/Screenshot 2025-12-15 at 3.42.08 PM-2.png" />
</div>

## 🎮 Overview

**GameForge** is a professional game pre-production tool that leverages **Bria's FIBO** (JSON-native image generation) and Google Gemini to transform game concepts into commercially-licensed, production-ready assets and playable prototypes.

### Key Features

- **🎨 Bria FIBO Integration** - Commercially-licensed image generation trained on 1+ billion fully licensed images
- **🧬 Style DNA System** - JSON-native style control ensuring consistency across all game assets
- **🌳 Node-Based Workflow** - Visual graph interface for hierarchical game asset organization
- **🤖 Agentic AI Pipeline** - Multi-step workflow: Blueprint → Style → Assets → Playable Game
- **🎯 Type-Specific Generation** - 40+ specialized asset types (2D/3D)
- **⚡ Blueprint Wizard** - Generate entire game structures with one prompt
- **🎮 Playable Prototypes** - Build interactive HTML5 games from your assets

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20.19.0 or later recommended)
- **Bria FIBO API Key** (via [Fal.ai](https://fal.ai/))
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iqbalerani/CompetitionGF.git
   cd GameForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   # Bria FIBO API Key (for image generation)
   VITE_BRIA_API_KEY=your_fal_ai_api_key_here

   # OpenRouter API Key (for text generation)
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Model selection (default: Google Gemini)
   MODEL="google/gemini-2.5-flash-lite"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 🏗️ Architecture

### AI Service Layers

#### 🎨 **Bria FIBO** (Image Generation)
- **Purpose:** Generate all visual game assets
- **Why FIBO:** Trained exclusively on licensed images (commercial-safe)
- **JSON-Native:** Precise control through structured parameters
- **Location:** `services/briaService.ts`

#### 🧠 **Google Gemini via OpenRouter** (Text Generation)
- **Purpose:** Generate descriptions, blueprints, and game code
- **Why OpenRouter:** Unified API access to multiple LLMs with flexible model selection
- **Default Model:** `google/gemini-2.5-flash-lite`
- **Tasks:**
  - Blueprint generation (game structure)
  - Asset descriptions
  - Style DNA generation
  - Playable game code
- **Location:** `services/geminiService.ts` + `services/openrouterClient.ts`

### Key Components

```
GameForge/
├── services/
│   ├── briaService.ts          # Bria FIBO image generation
│   ├── openrouterClient.ts     # OpenRouter API client
│   └── geminiService.ts         # Text generation (uses OpenRouter)
├── components/
│   ├── StyleDNAEditor.tsx       # Style control with FIBO parameters
│   ├── GenerationPanel.tsx      # Asset generation UI + JSON inspector
│   ├── LicenseCompliance.tsx    # Licensing information display
│   ├── BlueprintWizard.tsx      # Full game blueprint generator
│   └── NodeLibrary.tsx          # Asset type library
├── types.ts                     # TypeScript definitions (includes FIBOParameters)
└── constants.ts                 # Default styles and configurations
```

---

## 📖 How It Works

### 1. Blueprint Generation
```
User Prompt → Gemini → Game Structure (Nodes + Edges)
```

### 2. Style DNA Creation
```
Game Concept → Gemini → Style DNA (JSON Configuration)
                      ↓
                  FIBO Parameters (composition, detail, style_strength)
```

### 3. Asset Generation (Bria FIBO)
```
Description + Style DNA + Context → FIBO API → Commercial-Safe Images
```

### 4. Playable Prototype
```
Assets + Game Structure → Gemini → HTML5 Game Code (Three.js/Canvas)
```

---

## 🎨 Style DNA System

GameForge uses a **Style DNA** configuration that maps to Bria FIBO's JSON parameters:

### Core Style DNA Properties
```typescript
{
  colorPalette: { primary, accent, mood },
  lighting: { style, intensity },
  camera: { fov, angle },
  artStyle: { rendering, era, texture, influences }
}
```

### FIBO-Specific Controls
```typescript
{
  composition: 'centered' | 'rule_of_thirds' | 'dynamic',
  detail_level: 'low' | 'medium' | 'high' | 'ultra',
  style_strength: 0.0 - 1.0,
  negative_prompt: string,
  seed: number (optional, for reproducibility)
}
```

These parameters ensure **consistent visual style** across all generated assets.

---

## 🎯 Supported Asset Types

### 2D Game Assets
- **Levels:** Tilemaps, Level Layouts, Parallax Backgrounds
- **Characters:** Sprite Sheets, Portraits, NPCs
- **UI:** HUDs, Menus, Inventory Grids
- **Props:** Icons, Pickups, Items

### 3D Game Assets
- **Environments:** Terrain, Skyboxes, 3D Scenes
- **Characters:** Meshes, Rigs, Models
- **Props:** 3D Props, Vehicles, Materials

### Game Systems
- **Mechanics:** Physics, Platforming, AI NavMesh
- **UI:** Diegetic HUDs, 3D Menu Scenes

---

## 🔧 Advanced Features

### JSON Parameter Inspector
View the exact FIBO parameters used for each asset generation:
- Open any asset in the Generation Panel
- Click "FIBO JSON Parameters"
- See structured JSON configuration

### Batch Generation
1. Use Blueprint Wizard to generate full game structure
2. Assets are generated sequentially with shared Style DNA
3. Ensures visual consistency across 50+ assets

### Reproducible Generation
- Set a `seed` value in FIBO parameters
- Regenerate identical assets for iteration

---

## 🏆 Bria AI Competition

This project is designed for the **Bria AI FIBO Hackathon** and demonstrates:

### ✅ Best JSON-Native or Agentic Workflow
- Multi-step AI pipeline (Blueprint → Style → Assets → Game)
- Style DNA maps directly to FIBO JSON parameters
- Systematic asset generation with context awareness

### ✅ Best New User Experience
- Visual node-based interface (no coding required)
- Professional game development workflow
- End-to-end: concept to playable game

### ✅ Best Controllability
- Granular FIBO parameter control
- Style DNA ensures consistency
- Per-asset customization with global coherence

### 💎 Unique Value Proposition
**Commercial-Safe Game Development:**
All generated assets use Bria's fully-licensed training data, making them safe for indie and AAA game releases.

---

## 📝 API Key Setup Details

### Getting a Bria FIBO API Key

1. Visit [Fal.ai](https://fal.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env.local` as `VITE_BRIA_API_KEY`

**Note:** The VITE_ prefix is required for Vite to expose the variable to the client.

### Getting an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for an account (free tier available)
3. Create a new API key
4. Add to `.env.local` as `OPENROUTER_API_KEY`
5. (Optional) Change `MODEL` variable to use different LLMs

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Environment Variables (Production)
Make sure to set all required variables in your deployment platform:
- `VITE_BRIA_API_KEY`
- `OPENROUTER_API_KEY`
- `MODEL` (optional, defaults to google/gemini-2.5-flash-lite)

---

## 📚 Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **AI Models:**
  - Bria FIBO (via Fal.ai) - Image generation
  - Google Gemini 2.5 Flash Lite (via OpenRouter) - Text generation
- **API Layer:** OpenRouter (flexible LLM access)
- **UI Library:** Tailwind CSS 4
- **Graph Visualization:** ReactFlow
- **3D Rendering:** Three.js
- **Charts:** Recharts

---

## 🎬 Demo

### Example Workflow

1. **Click "Blueprint"** → Enter game concept (e.g., "Cyberpunk platformer")
2. **AI generates** → Full game structure with 20+ nodes
3. **Style DNA** → Automatically adapted to your concept
4. **Assets generate** → One by one, with consistent style
5. **Click "Build Game"** → Playable HTML5 prototype

### Assets Generated
- Character sprites/meshes
- Environment art
- UI elements
- Props and items
- Game mechanics diagrams

---

## 🤝 Contributing

This project was created for the Bria AI FIBO Hackathon. For questions or collaboration:

- Open an issue on GitHub
- Review `BRIA_COMPETITION_ANALYSIS.md` for detailed competition strategy
- Check `IMPLEMENTATION_SUMMARY.md` for technical implementation details

---

## 📜 License

MIT License - See LICENSE file for details

**Important:** This project uses Bria's FIBO model, which ensures all generated images are trained on licensed data. Generated assets are safe for commercial use in your games.

---

## 🙏 Acknowledgments

- **Bria AI** for providing FIBO's commercially-safe image generation
- **Fal.ai** for API access to Bria FIBO
- **OpenRouter** for unified LLM API access
- **Google Gemini** for powerful text generation capabilities
- **NVIDIA** for GPU infrastructure support

---

## 📞 Support

For technical issues:
1. Check `.env.local` has all required variables set correctly
2. Verify OpenRouter API key is valid: https://openrouter.ai/keys
3. Ensure Node.js version is compatible
4. Review browser console for errors
5. Check API key validity and quotas

---

## 🔮 Future Enhancements

- [ ] Unity/Unreal Engine plugins for asset import
- [ ] Multiplayer game template generation
- [ ] Animation frame generation
- [ ] Sound effect generation integration
- [ ] Version control for assets
- [ ] Team collaboration features
- [ ] Asset marketplace integration

---

**Made with ❤️ for game developers who want to move fast without sacrificing quality.**

**Powered by Bria FIBO 🎨 | OpenRouter 🌐 | Google Gemini 🧠 | React ⚛️**
