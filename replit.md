# YouTube Downloader - Replit Implementation

## Overview
This is a Next.js-based YouTube downloader application that allows users to download YouTube videos and audio for educational purposes only. The application was implemented based on a GitHub repository that originally only contained a README file describing the planned architecture.

**IMPORTANT LEGAL NOTICE**: This application is for educational use only. Only download content you own or have explicit permission to download. Respect copyright laws and YouTube's Terms of Service.

## Project Architecture

### Technology Stack
- **Frontend**: Next.js 14 with React and TypeScript
- **Backend**: Next.js API Routes (serverless)
- **YouTube Integration**: ytdl-core library
- **Runtime**: Node.js 20

### Project Structure
```
/
├── pages/
│   ├── api/
│   │   ├── info.ts       # Returns video metadata and available formats
│   │   └── download.ts   # Streams video/audio downloads
│   ├── index.tsx         # Main UI for entering URLs and downloading
│   └── _app.tsx          # Next.js app wrapper
├── next.config.js        # Next.js configuration with cache control
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Features

### API Endpoints

#### GET /api/info
- **Purpose**: Fetches YouTube video metadata and available formats
- **Parameters**: 
  - `url` (required): YouTube video URL
- **Returns**: JSON with video title, duration, thumbnail, and available formats
- **Example**: `/api/info?url=https://youtube.com/watch?v=...`

#### GET /api/download
- **Purpose**: Streams the requested video/audio to the client
- **Parameters**:
  - `url` (required): YouTube video URL
  - `itag` (optional): Specific format identifier
  - `format` (optional): 'audio' or 'mp3' for audio-only downloads
- **Example**: `/api/download?url=https://youtube.com/watch?v=...&format=audio`

### Frontend UI
- **Modern Design**: Beautiful purple gradient background with card-based layout
- **Responsive Interface**: Works on desktop and mobile devices
- **Quality Badges**: Color-coded badges for Ultra HD (1440p/4K), Full HD (1080p), and HD (720p)
- **Three Format Sections**:
  - **HD Video-Only**: High-definition formats (1080p, 4K) without audio
  - **Complete Formats**: Video + audio combined (up to 720p typically)
  - **Audio Only**: Highest quality audio extraction
- **Creator Credit**: Footer displaying "Created by Habib Hassan"
- **Educational Warning**: Prominent legal notice at the top

## Configuration

### Development Server
- Port: 5000
- Host: 0.0.0.0 (configured for Replit proxy)
- Cache-Control headers disabled to ensure updates are visible
- Command: `npm run dev`

### Production Deployment
- Target: Autoscale (stateless web application)
- Build: `npm run build`
- Run: `npm start` (production server on port 5000)

## Recent Changes
- **2024-11-15**: Initial implementation and UI enhancements
  - Created Next.js project structure from README-only GitHub import
  - Implemented /api/info endpoint for video metadata
  - Implemented /api/download endpoint with proper format handling (webm, mp4, m4a)
  - Replaced ytdl-core with @distube/ytdl-core for better YouTube compatibility
  - **Major UI Overhaul**:
    - Modern purple gradient design with card-based layout
    - Quality badges for HD/Full HD/Ultra HD formats
    - Separated video-only HD formats from muxed formats
    - Shows ALL available formats (no truncation)
    - Added footer credit "Created by Habib Hassan"
  - Configured for Replit environment (port 5000, host 0.0.0.0)
  - Added deployment configuration for autoscale

## User Preferences
None specified yet.

## Important Notes

### Legal and Ethical Use
This application should ONLY be used to download:
- Content you own
- Content you have explicit permission to download
- Content licensed for free redistribution

DO NOT use this to infringe copyright or violate YouTube's Terms of Service.

### Technical Limitations & HD Download Information

**IMPORTANT - HD Quality Formats:**
- **1080p and higher (4K)** videos are typically available as **video-only** streams
- These HD formats DO NOT include audio - they are marked with a "VIDEO ONLY" badge
- This is due to YouTube's DASH streaming architecture for high-quality content
- **For complete HD videos with audio**, you would need:
  - External tools to merge video-only and audio-only streams, OR
  - Use the "Complete Formats" section which provides video+audio together (typically up to 720p)

**Other Limitations:**
- The application streams content directly to the client to avoid server storage
- Download speed depends on YouTube's servers and network conditions
- The @distube/ytdl-core library may require updates as YouTube changes their systems

### Replit-Specific Configuration
- Configured to run on port 5000 (required for Replit webview)
- Host set to 0.0.0.0 to work with Replit's proxy/iframe setup
- Cache-Control headers disabled to ensure changes are visible
- Deployment configured for autoscale (stateless)

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies
- next: ^14.2.0
- react: ^18.3.0
- react-dom: ^18.3.0
- @distube/ytdl-core: ^4.16.12 (community-maintained fork with better YouTube support)
- typescript: ^5.0.0
- @types/node, @types/react, @types/react-dom

## Future Enhancements
Potential improvements could include:
- Rate limiting per IP to prevent abuse
- CAPTCHA integration for public deployments
- Better error handling and user feedback
- Support for playlists
- Progress indicators during download
- Format selection optimization
- Conversion to MP3 using FFmpeg (resource-intensive)
