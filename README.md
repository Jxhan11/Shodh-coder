# Shodh-a-Code Frontend

A React/Next.js frontend for the live programming contest platform.

## Features

- **Contest Join Page**: Enter contest ID and username
- **Real-time Contest Interface**: 3-panel layout with problem, code editor, and leaderboard
- **Monaco Code Editor**: Syntax highlighting for Java, Python, C++
- **Live Submissions**: Real-time status updates and polling
- **Live Leaderboard**: Auto-updating rankings
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit NEXT_PUBLIC_API_URL if needed
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## Usage

1. **Join Contest**: Enter contest ID (default: 1) and your username
2. **Select Problem**: Choose from available problems in the contest
3. **Write Code**: Use the Monaco editor with syntax highlighting
4. **Submit**: Click submit and watch real-time status updates
5. **Track Progress**: Monitor your rank on the live leaderboard

## API Integration

The frontend connects to the Spring Boot backend API:
- Contest details and problems
- User management
- Code submission and judging
- Real-time leaderboard updates

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend API URL
```



**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
