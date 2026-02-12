# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Philly Daily is a Philadelphia news aggregator that fetches RSS feeds from local sources and displays them in a clean, editorial-style layout. Built with Next.js and Tailwind CSS.

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Architecture

```
src/
├── app/
│   ├── globals.css    # Tailwind + custom typography/colors
│   ├── layout.tsx     # Root layout with metadata
│   └── page.tsx       # Main page with static generation
├── components/
│   ├── ArticleCard.tsx   # Article display (regular + featured)
│   ├── Header.tsx        # Site header with date
│   ├── Footer.tsx        # Source attribution
│   └── Section.tsx       # News section wrapper
└── lib/
    └── feeds.ts          # RSS fetching and parsing
```

## Key Details

- **Static Generation**: Page revalidates every hour (`revalidate = 3600`)
- **RSS Sources**: Philadelphia Inquirer, WHYY, Billy Penn, 6ABC, PhillyVoice
- **Categories**: Top Stories, Local News, Sports, Culture
- **Design**: Orange accent (#e65c00), Inter for headlines, Merriweather for body text

## Adding New Sources

Edit `src/lib/feeds.ts` and add to the `FEEDS` array:

```typescript
{
  url: "https://example.com/feed/",
  name: "Source Name",
  category: "local", // "top" | "local" | "sports" | "culture"
},
```
