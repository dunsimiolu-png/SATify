# SATify 🚀

A modern, fast, and feature-rich **Digital SAT Bluebook Practice & Preparation Platform** built with **React**, **TypeScript**, and **Tailwind CSS**.

![SATify Preview](public/logo.jpg)

## ✨ Features

- 📝 **Authentic Digital SAT Experience**: Emulates the College Board Bluebook interface for Reading & Writing and Math sections.
- 🧮 **Integrated Desmos Calculator**: Full-screen and modal graphing and scientific calculator powered by the Desmos API.
- ⚡ **Question Rush & Practice Modes**: Calibrated timed drills (e.g., 95s per question) with immediate feedback and review.
- 📚 **Comprehensive Question Bank**: Hundreds of categorised official-style SAT questions covering *Craft and Structure*, *Information and Ideas*, *Standard English Conventions*, and *Expression of Ideas*.
- 📖 **Built-in Vocabulary & Flashcards**: Curated SAT vocabulary list with definitions, contexts, and practice.
- 🌓 **Dark & Light Mode**: Seamless theme switching with zero flash on reload.
- 📱 **Responsive & Accessible**: Optimized for desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Calculator**: [Desmos API](https://www.desmos.com/api/)
- **PDF Extraction Scripts**: Node.js + `pdfjs-dist` + `@napi-rs/canvas`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/SATify.git
   cd SATify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your Desmos API Key to `.env`:
   ```env
   VITE_DESMOS_API_KEY=dff6ea11e7df4482bab9a540c52a64a0
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Hosting & Deployment

SATify can be deployed directly to any static web host:

- **[Vercel](https://vercel.com/)**: Connect your GitHub repository to Vercel for zero-config automatic deployments.
- **[Netlify](https://www.netlify.com/)**: Import the GitHub repository with build command `npm run build` and publish directory `dist`.
- **[GitHub Pages](https://pages.github.com/)**: Deploy using GitHub Actions on every push to the `main` branch.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
