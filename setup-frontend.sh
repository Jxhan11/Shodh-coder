#!/bin/bash

echo "Setting up Shodh-a-Code Frontend..."

# Navigate to frontend directory
cd frontend

# Create Next.js app with TypeScript and Tailwind CSS
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

echo "Frontend setup complete!"
echo "Next steps:"
echo "1. cd frontend"
echo "2. npm run dev"
