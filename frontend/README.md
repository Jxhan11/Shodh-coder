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
```

## Current Status

**The frontend is essentially complete and ready for testing!** 🎉

Here's what we have:

✅ **Full Contest Flow**: Join → Contest → Submit → Results  
✅ **Real-time Updates**: Submissions and leaderboard polling  
✅ **Professional UI**: Clean, responsive design  
✅ **Code Editor**: Monaco with multi-language support  
✅ **Error Handling**: Global error boundary  
✅ **State Management**: Zustand store  

## Ready to Test!

You can now run both backend and frontend together:

**Terminal 1 (Backend):**
```bash
cd backend
./gradlew bootRun
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:3000` to test the complete application!

The only optional additions would be:
- **Contest management** (create/edit contests) - but that wasn't in the requirements
- **User authentication** - but the requirements use simple username entry
- **More advanced code editor features** - but Monaco covers the basics well

**What would you like to test first? The complete flow or any specific features?** 🚀