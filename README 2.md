# Reality Check

A modern web application for life visualization, goal setting, and personal development.

## 🚀 Features

- **Life in Weeks Visualization** - See your life in a powerful grid format
- **Goal Setting & Tracking** - Set and monitor your personal goals
- **Content Feed** - Curated resources for personal growth
- **Events & Workshops** - Join community events
- **Pause Reminder** - Built-in break reminders for healthy usage
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom FYF Design System
- **Deployment:** Vercel (recommended)

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd fyf-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Set project name (e.g., "fyf-app")
   - Configure settings

4. **Your app will be live at:** `https://your-app.vercel.app`

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

### Option 3: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Deploy

## 🔧 Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

## 📁 Project Structure

```
src/
├── app/
│   ├── login/           # Login page
│   ├── life-weeks/      # Life visualization
│   ├── profile/         # Goal setting
│   ├── guide/           # Content feed
│   ├── events/          # Events & workshops
│   ├── people/          # Community
│   ├── credits/         # Credits & monetization
│   ├── transparenz/     # Ethics & FAQ
│   ├── fallback/        # 404 page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
```

## 🎨 Design System

The app uses a custom FYF design system with:

- **Colors:** Coral (#FF6B6B), Mint (#4ECDC4), Noir (#0A0A0A)
- **Fonts:** Space Grotesk (headings), Inter (body)
- **Components:** Responsive, accessible, modern

## 🚀 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 📱 Features

### Life in Weeks
- Interactive grid visualization
- Customizable age and life expectancy
- Statistics and progress tracking
- Pause reminder after 30 minutes

### Goal Setting
- Personal information management
- Goal creation and tracking
- Progress visualization
- Achievement statistics

### Content Feed
- Curated articles and resources
- Category-based browsing
- Newsletter subscription
- Featured content

## 🔒 Privacy & Ethics

- No data selling
- User data ownership
- Transparent monetization
- Evidence-based recommendations

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or feedback, please contact the development team.

---

**FYF - Fuck Your Future** - Transform your life with powerful visualization tools.

## Guide Dashboard

- **Route:** `/guide/dashboard`
- **Purpose:** Control layer for FYF - consolidates Feedboard content with persistent state
- **Data Flow:** Managed by `useGuideState` hook with localStorage persistence, ready for live feed integration
- **Storage:** LocalStorage key `fyf-guide-dashboard`
- **Relationship:** Feedboard = Experience Layer, Guide Dashboard = Control Layer

### Architecture

The Guide Dashboard is a comprehensive control center that consolidates all Feedboard content (Focus, Knowledge, Voices, Actions, Explore) with persistent state management. It serves as the **control layer** where users can manage and interact with their curated content.

### Data Model

All data flows through typed interfaces (`FeedItem`, `ThemeItem`, `GuideState`) defined in `src/hooks/useGuideState.ts`, making future API/real-time feed integration a simple swap. Data is persisted locally via localStorage but structured to easily connect to backend APIs.

### Key Features

- **Desktop Layout:** 260px fixed sidebar + flexible content area
- **Mobile Layout:** Single column with collapsible hamburger menu (breakpoint: 768px)
- **Sections:** Intro, Fokus, Wissen, Stimmen, Aktionen, Guide, Explore
- **Interactions:** Add, remove, activate items; check/uncheck actions; view conversation history
- **Styling:** FYF design language with Mint accent colors, Space Grotesk typography, soft glow effects

### Future Integration

The dashboard is prepared for live feed integration:
- TODO: Connect with Feedboard dispatch event `fyf:addFocus`
- TODO: Replace mock data with API calls to `/api/feedboard/*`
- TODO: Implement real-time sync via WebSocket/SSE