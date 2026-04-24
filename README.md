# Q-Ops Agent

A modern, dark-themed frontend prototype for a QA operations and test intelligence platform with improved visual hierarchy and branding separation.

## Features

- **Enterprise-Grade Landing**: Professional SaaS-style login page with detailed product information and interactive feature cards
- **Enhanced Dark Theme**: Improved color contrast with layered backgrounds (surface, surface2, surface3)
- **Separated Branding**: Clean separation between Q-Ops Agent branding and functional content
- **Modern UI**: Clean, card-based design with proper visual hierarchy and Lucide React icons
- **Drag-and-Drop Uploads**: Intuitive file upload with visual feedback and icons
- **Form Validation**: Real-time validation with clear error messages and icons
- **Toast Notifications**: Success/error feedback for user actions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Static Authentication**: Login with `admin` / `admin`
- **API Integration**: Multipart/form-data upload to ingestion endpoint

## Color Scheme

- **Surface**: `#0f1419` - Base dark background
- **Surface2**: `#1e2530` - Card backgrounds
- **Surface3**: `#2a3441` - Accent elements and inner cards
- **Border**: `#3a4451` - Subtle borders
- **Brand**: `#58a6ff` - Primary brand color

## Screenshots

- **Login Page**: Enterprise-grade SaaS landing with prominent branding, detailed product description, and interactive feature cards with Lucide icons
- **Dashboard**: Separated branding header with user controls, upload form with icons, and informational sidebar

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the app in your browser at the address shown by Vite.

## Hero Background Image

The Login page uses a hero background image at `/assets/hero-bg.jpg`. To use your attached background image, place the file at `public/assets/hero-bg.jpg` before running the dev server. If the image is absent the page falls back to a subtle dark gradient.

## API Integration

The app sends POST requests to:

```
http://localhost:5678/webhook-test/upload-test-docs
```

With `multipart/form-data` containing:
- `projectName`
- `brd_image` (BRD file)
- `frd`, `hld`, `lld` (documents)
- `transcript` (.txt file)
- `image` (multiple UI design files)

## Notes

- No backend is included in this repo
- Use static credentials `admin` / `admin` to log in
- Ensure the API server is running on localhost:5678 for uploads
- UI optimized for dark mode with improved contrast ratios
