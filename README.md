# Video to GIF Converter

A modern web application that converts video files to optimized GIF format, built with cutting-edge web technologies.

## Features

- Video to GIF conversion with client-side processing
- Customizable output settings
- Batch processing support
- Real-time preview
- Responsive design
- Optimized file size reduction
- Download and share capabilities

## Tech Stack

This project leverages modern web technologies:

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Video Processing**: FFMPEG WASM
- **State Management**: TanStack Query
- **Package Manager**: Bun
- **Deployment**: Cloudflare Pages

## Getting Started

The only requirement is having Bun installed - [install Bun](https://bun.sh/docs/installation)

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
bun install

# Step 4: Start the development server
bun dev
```

## Development

There are several ways to work with this codebase:

**Local Development**
- Use your preferred IDE
- Run `bun dev` for hot-reload development
- Access the dev server at `http://localhost:8080`

**GitHub Integration**
- Edit files directly in GitHub's web interface
- Use GitHub Codespaces for cloud development
- Create branches for new features
- Submit pull requests for review

## Deployment

The application is configured for deployment on Cloudflare Pages with optimized build settings:

- Automatic deployments on push to main
- Asset optimization and minification
- Efficient chunk splitting
- Modern ES modules support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Custom Domain Setup

For custom domain deployment, we recommend using Cloudflare Pages or Netlify. Configure your DNS settings according to your provider's documentation.

---
*Originally created at lovable.dev*
