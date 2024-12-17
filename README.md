# DontSign

An AI-powered contract analyzer that helps you understand legal documents.

## Features

- Upload PDF or DOCX files
- AI-powered analysis using GPT-3.5
- Get key terms, risks, and recommendations
- Mobile-friendly interface
- Fast and reliable installation with package-lock.json

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- PDF.js for parsing

## Local Development

1. Clone the repository
2. Install dependencies: `npm ci`
3. Create `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Run development server: `npm run dev`

## Deployment

This project is deployed on Vercel with automatic deployments and previews for each PR.