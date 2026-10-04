# 🛕 Brihadisvara Temple (Thanjavur) — 3D Cinematic & Gesture Experience

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r173-black?logo=three.js)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-v9.0-black)](https://docs.pmnd.rs/react-three-fiber)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision%20v0.10-0078D4?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An interactive, multi-modal 3D virtual pilgrimage and architectural exploration of the **Brihadisvara Temple** (*Peruvudaiyar Kovil*) in Thanjavur, Tamil Nadu — a UNESCO World Heritage site built in 1010 CE by Emperor **Rajaraja Chola I**.
>
> Navigate through 1000+ years of Chola history using **AI-powered hand gestures**, **continuous natural voice commands**, **spatial sacred audio**, and **dual Sunshine & Moonshine atmospheric lighting**.

---

## 🌟 Key Features

### ✋ 1. AI Hand Tracking & Real-Time Skeleton Visualizer
* **Local Offline MediaPipe Vision**: Powered by `@mediapipe/tasks-vision` with local WebAssembly (`/public/wasm/`) and model assets (`/public/models/hand_landmarker.task`), ensuring zero external cloud latency and maximum user privacy.
* **Live Skeletal Landmark HUD**: A neon-accented picture-in-picture viewport renders the 21 hand joints, knuckles, and bone connectors in real time so users immediately see their gesture feedback.
* **Precision Jitter-Free Tracking**: Custom Exponential Moving Average (EMA) low-pass filtering (`GestureSmoothing.ts`) smooths micro-tremors for fluid camera orbits and cinematic timeline gliding.
* **Supported Gestures**:
  * 🖐️ **Open Palm**: Scroll / fly-through through the temple chapters.
  * ✊ **Closed Fist**: Freeze / hold the camera in place.
  * ☝️ **Point / Index Finger**: Orbit and rotate the 3D perspective.
  * 🤏 **Pinch (Thumb + Index)**: Precision Zoom In / Zoom Out.
  * ✌️ **Peace / Victory Sign**: Trigger focal detail inspection.
  * 🙏 **Namaste (Dual Palms)**: Center camera directly facing the sanctum.

---

### 🎙️ 2. Natural Voice Control Engine
Continuous, hands-free navigation using the Web Speech API (`VoiceController.tsx` & `VoiceHelpModal.tsx`) with fuzzy command recognition and on-screen audio feedback:

| Category | Voice Commands | Action |
| :--- | :--- | :--- |
| **Waypoints** | `"go to lingam"`, `"sanctum"`, `"entrance"`, `"vimana"`, `"nandi"` | Jump directly to historical landmarks |
| **Motion** | `"forward"`, `"backward"`, `"next"`, `"previous"` | Glide sequentially across chapters |
| **Rotation** | `"rotate left"`, `"rotate right"`, `"turn"`, `"spin"` | Orbit the camera 360° |
| **Zoom** | `"zoom in"`, `"zoom out"`, `"closer"`, `"farther"` | Adjust camera field of view |
| **Lighting** | `"day"`, `"night"`, `"sunshine"`, `"moonshine"` | Seamlessly transition the sky and sun position |
| **Audio** | `"play mantra"`, `"stop mantra"`, `"mute"`, `"unmute"` | Control background audio and chant |
| **HUD & Info** | `"help"`, `"timeline"`, `"close"` | Toggle modals and archaeological guides |

---

### ☀️ 3. Dual Sunshine & Moonshine Atmospheric Engines
* **Temple Lighting (`TempleLighting.tsx`)**:
  * **Sunshine Mode**: Warm golden 3200K solar irradiance, realistic granite bounce light, dynamic shadows, and high-altitude sky scatter.
  * **Moonshine Mode**: Deep celestial 6500K indigo illumination, soft silver directional moonbeams grazing the Vimana crown, and ambient twilight glow.
* **Sky Effects Layer (`SkyEffectsOverlay.tsx`)**:
  * CSS-accelerated god rays, optical bloom, rotating sun flares, silver lunar halo rings, and twinkling procedural stars.
  * Instant toggle via the HUD sun/moon button, keyboard shortcut (`L`), or voice command.

---

### 🕉️ 4. Proximity-Based Spatial Sacred Audio
* **Maha Mrityunjaya Mantra**:
  * Authentic sacred recording (*Om Tryambakam Yajamahe Sugandhim Pushtivardhanam*) that smoothly fades in as the camera glides into Chapter 5 (**Garbhagriha / Maha Lingam**).
  * Auto-ducks and fades out when traveling outward to the courtyard or Rajagopuram.
* **Procedural Web Audio Engine (`TempleAudio.ts`)**:
  * Synthesized temple bells (*Ghanta*) with harmonic overtones.
  * Resonant acoustic bronze gongs and courtyard breeze ambience.

---

### 🏛️ 5. Heritage Storyboard & 3D Interactive Hotspots
* **7 Curated Chapters & Architectural Milestones**:
  1. **Rajagopuram**: The monumental 30-meter Chola gateway.
  2. **Kodimaram & Bali Peetham**: 16-meter copper-sheathed flagmast with 33 sacred rings, 3-tiered bell brackets, fluttering ceremonial pennant, and granite offering altar.
  3. **Nandi Mandapam**: Monolithic sacred bull sculpted from a single 25-tonne granite boulder.
  4. **Vimana (Dakshina Meru)**: The colossal 66-meter (216 ft) 13-tiered pyramidal sanctum tower.
  5. **Kumbam (Vimana Summit)**: The 80-tonne octagonal granite capstone hoisted without modern cranes.
  6. **Garbhagriha (Sanctum Sanctorum)**: The sacred sanctum housing the colossal 4-meter monolithic Shiva Lingam.
  7. **Prakaram & Cloistered Halls**: Perimeter colonnades lined with 252 lingams and classic Chola murals.
  8. **Aerial Overview**: Bird’s-eye perspective of the 240m × 120m fortified complex.
* **Archaeological Archives & Timeline**:
  * High-resolution photographic modals of the real-world monuments, including authentic photography of the sacred **Kodimaram** (`kodimaram.jpg`), **Peruvudaiyar Lingam**, **Nandi Mandapam**, and **Entrance Gopuram**.
  * Historical timeline modal covering Rajaraja Chola I's ascension (985 CE), consecration (1010 CE), British ASI documentation, and 1987 UNESCO declaration.

---

## 🛠️ Tech Stack & Architecture

```
d:/Brahadeshwarar-temple/
├── public/
│   ├── models/                  # 3D GLB assets & MediaPipe Landmarker task
│   ├── wasm/                    # Local MediaPipe vision WebAssembly runtime
│   ├── images/                  # Real archaeological photographs & textures
│   └── Om Tryambakam...mp3      # Sacred Vedic temple audio chant
├── src/
│   ├── audio/
│   │   └── TempleAudio.ts       # Web Audio API + Mantra proximity player
│   ├── components/
│   │   ├── gesture/             # MediaPipe HandTracker & GestureRecognizer
│   │   ├── input/               # Mouse, Touch & Keyboard controllers
│   │   ├── temple/              # 3D Scene, Lighting, Camera, Particles & Model
│   │   ├── ui/                  # HUD, CinematicProgress, Timeline & Modals
│   │   └── voice/               # SpeechRecognition & Voice command handlers
│   ├── data/
│   │   └── templeData.ts        # Archaeological data, hotspots & chapters
│   ├── state/
│   │   └── experienceStore.ts   # Zustand unified state management
│   ├── App.tsx                  # Root application composition
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS v4 design system
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* Modern web browser with WebGL 2.0 and WebRTC (Webcam) support (Chrome, Edge, Firefox, Brave)

### Installation
1. Clone or navigate to the repository directory:
   ```bash
   cd Brahadeshwarar-temple
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/  (or the port shown in terminal, e.g., 5174)
   ```

### Building for Production
To generate an optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🎮 Controls Reference

| Control Type | Action | Description |
| :--- | :--- | :--- |
| **Mouse Drag** | Orbit View | Left-click and drag anywhere on the 3D canvas |
| **Mouse Wheel** | Cinematic Progress | Scroll up/down to glide through the 7 chapters |
| **Keyboard `W` / `↑`** | Forward | Move to the next chapter |
| **Keyboard `S` / `↓`** | Backward | Return to the previous chapter |
| **Keyboard `A` / `D`** | Orbit | Rotate the view horizontally |
| **Keyboard `L`** | Day / Night | Toggle between Sunshine and Moonshine |
| **Keyboard `M`** | Mute Audio | Toggle temple acoustic ambience and mantra |
| **Keyboard `V`** | Voice Control | Turn speech recognition on/off |
| **Keyboard `G`** | Gesture Control | Toggle camera hand-tracking |
| **Keyboard `H`** | Timeline | Open Chola dynasty historical timeline |
| **Keyboard `?`** | Help | Display voice and gesture command guide |

---

## 🔒 Privacy & Permissions
* **Webcam Feed**: Processed strictly locally inside your browser via MediaPipe WebAssembly. No video frames, biometrics, or camera data are ever saved or transmitted over the internet.
* **Microphone Feed**: Used exclusively for in-browser speech recognition to match navigation keywords.

---

## 📜 Historical Acknowledgments & Credits
* Dedicated to the genius of the ancient **Chola Architects, Sculptors, and Engineers** who erected the Great Living Chola Temples.
* Archaeological and epigraphical records referenced from the **Archaeological Survey of India (ASI)** and **UNESCO World Heritage Centre**.
* Audio: *Om Tryambakam Yajamahe Sugandhim Pushtivardhanam* (Mahamrityunjaya Mantra).

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).
