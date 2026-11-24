# ApnaWard 🏙️

### Your Neighbourhood. Your Voice.

**ApnaWard** is a community-focused civic issue reporting, transparency, and neighbourhood intelligence platform designed to help residents report everyday local problems and follow their progress transparently.

Our goal is to make neighbourhoods smarter, safer, and more accountable by connecting citizens with organised ward-level issue management.

<p align="center">
  <a href="https://apnaward-gray.vercel.app/">
    <strong>🚀 Live Demo</strong>
  </a>
  &nbsp; | &nbsp;
  <a href="https://github.com/shivpartapsinghania/apnaward">
    <strong>💻 GitHub Repository</strong>
  </a>
</p>

---

## 👥 Team Innovatrix Nexus

**Team Name:** Innovatrix Nexus

| Role | Name |
|---|---|
| Team Leader | Aishwarya Chawan |
| Team Member | Lakshmi Teja Thotla |
| Team Member | Shivam Kumar Gupta |

---

## 🌍 The Problem

Everyday neighbourhood problems affect thousands of residents:

- Potholes and damaged roads.
- Overflowing garbage and poor waste management.
- Water leakage and drainage problems.
- Non-functional streetlights.
- Public safety concerns.
- Lack of transparency in complaint resolution.

Citizens often struggle to report these problems, track their progress, and understand which issues need urgent attention.

## 💡 Our Solution

ApnaWard provides a unified digital platform where residents can report neighbourhood problems, explore issues on an interactive map, understand their priority, and track their reports.

### 🔄 How ApnaWard Works

**Report an Issue → AI-Assisted Understanding → Priority Assessment → Explore Neighbourhood Map → Ward Operations → Track Resolution**

---

## ✨ Key Features

### 1. 📝 Easy Civic Issue Reporting
- Simple, guided issue-reporting workflow.
- Six issue categories:
  - Road Damage
  - Garbage
  - Water Leakage
  - Streetlight
  - Drainage
  - Public Safety
- Interactive location selection.
- Photo upload with client-side image compression.
- English and Hindi voice dictation where supported.
- Unique tracking ID for every submitted report.

### 2. 🤖 AI-Assisted Issue Analysis
- Google Gemini-powered issue analysis.
- Suggested issue category and urgency.
- Community impact assessment.
- Suggested next steps.
- Photo-based advisory observations.
- Manual reporting remains available if AI is not configured.

**Note:** AI suggestions are advisory and require human review.

### 3. 🎯 Smart Priority Assessment
ApnaWard calculates an explainable attention score from 0–100 using:

- Urgency: 0–45 points.
- Community Impact: 0–35 points.
- Waiting Time: 0–20 points.

This helps highlight issues that may need attention first.

### 4. 🗺️ Interactive Neighbourhood Map
- Leaflet and OpenStreetMap integration.
- View reported neighbourhood issues.
- Filter by category, ward, urgency, status, and search.
- Explore areas needing attention.
- View issue details through map markers.

### 5. 🏢 Ward Operations Dashboard
- Ward-level issue management interface.
- Key performance indicators.
- Category breakdown and ward comparisons.
- Nearby issue clustering.
- Update report status.
- Add timestamped public notes.
- Mark issues as resolved.

### 6. 🔎 Complaint Tracking
- Search using a unique tracking ID.
- View report progress.
- Check current status.
- See attention score and advisory insights.
- Review update history.

### 7. 🌐 Multilingual Experience
- English interface.
- Hindi interface.
- Client-side language switching.

### 8. 🎬 Guided Demonstration
- Interactive 60-second product tour.
- Seven-chapter guided presentation.
- Live navigation between product modules.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Type-safe development |
| Vite 8 | Development and build tooling |
| Tailwind CSS v4 | Styling |
| Node.js | Backend runtime |
| Express.js | Server and API routes |
| Google Gemini API | AI-assisted issue analysis |
| Leaflet | Interactive maps |
| OpenStreetMap | Map tiles |
| Lucide React | Icons |
| Motion | UI animations |
| Browser localStorage | Prototype data persistence |
| Supabase SQL | Database and authentication foundation |

---

## 🏗️ Architecture Overview

```text
                 APNAWARD PLATFORM
                        |
           +------------+------------+
           |                         |
       React Frontend           Express Server
           |                         |
    +------+------+           +------+------+
    |      |      |           |             |
  Report  Map  Tracking    API Routes    Vite Build
    |      |      |           |
    +------+------+       Gemini API
           |
      localStorage
           |
    Issue Management
           |
    Priority Assessment
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0 or newer.
- npm.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/shivpartapsinghania/apnaward.git
```

### 2. Navigate to the Project Directory

```bash
cd apnaward
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
APP_URL=http://localhost:3000
```

The Gemini API key is optional for manual reporting but required for AI-powered issue suggestions. Keep it server-side and never expose it in frontend code.

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 6. Build for Production

```bash
npm run lint
npm run build
```

### 7. Run the Production Server

```bash
npm start
```

---

## 🌐 Live Deployment

**Live Demo:** https://apnaward-gray.vercel.app/

**GitHub Repository:** https://github.com/shivpartapsinghania/apnaward

The project is deployed on Vercel. The Express server and API routes require a compatible Node.js hosting configuration; verify the deployed AI endpoint and environment variables separately.

---

## 🧪 Demo Instructions

1. Open the live demo.
2. Explore the home page and neighbourhood overview.
3. Navigate to **Report an Issue**.
4. Submit a sample issue using demo information.
5. Explore the issue on the interactive map.
6. Open Ward Operations to inspect and update reports.
7. Use the tracking ID to follow the report.
8. Explore the guided demo and 60-second tour.

---

## ⚠️ Project Status & Limitations

ApnaWard is a working browser-based prototype, not a live municipal deployment.

- Reports and demo workflows currently use browser `localStorage`.
- Data is not synchronised across different devices or users.
- Supabase SQL migration provides a database and authentication foundation, but frontend sign-in and live database synchronisation are not yet integrated.
- Bundled wards, coordinates, and sample reports are illustrative demo data.
- The platform is not officially connected to any government complaint system.
- Gemini-powered analysis requires a valid server-side API key.
- AI recommendations are advisory and require human review.

Please use demo information only. Do not enter real or sensitive resident information.

---

## 🔮 Future Scope

Potential future development directions include:

- Complete Supabase authentication and database integration.
- Real-time multi-user report synchronisation.
- Verified city, district, municipal body, and ward directories.
- Role-based citizen and ward administration.
- Improved analytics and neighbourhood insights.
- Secure integration with authorised civic systems where available.
- Stronger multilingual and accessibility support.

---

## ❤️ Our Vision

We believe every citizen deserves a simple way to raise their voice and every neighbourhood deserves transparency.

ApnaWard — Your Neighbourhood. Your Voice.

Built with dedication by Team Innovatrix Nexus.
