# OAV Bibina Knowledge Hub

A complete SvelteKit web application for organizing and sharing educational resources, built for the Cloudflare
ecosystem with D1 database and R2 storage.

## 🎯 Features

### ✅ **Fully Implemented**

- 📚 **Class & Subject Management**: Complete CRUD operations with collapsible interface
- 📁 **File Upload & Storage**: Enhanced upload UI with drag-and-drop and visual feedback
- 🔄 **File Replacement**: Replace existing files with new uploads while preserving metadata
- 🗂️ **File Management**: Organized file browsing with file type icons and collapsible structure
- 🔐 **Admin Portal**: Modern sidebar navigation with responsive desktop/mobile layouts
- 📊 **Enhanced Dashboard**: Statistics cards and quick action links
- 🌓 **Dark Mode**: System-wide theme toggle with localStorage persistence
- 🏠 **Public Interface**: Clean public browsing with breadcrumb navigation
- ⬇️ **File Downloads**: Secure download system with pre-signed URLs
- 🎨 **Modern Design**: Custom brand colors and responsive layouts
- 🔒 **Authentication**: JWT-based sessions with bcrypt password hashing
- ⚡ **Performance**: Optimized for Cloudflare Edge with reactive UI
- 🌐 **CORS Configured**: R2 bucket configured for direct browser uploads

### 🎨 **Modern Architecture**

- **Frontend**: SvelteKit 5 with TypeScript runes and reactive state
- **Database**: Cloudflare D1 (SQLite) with comprehensive schema
- **Storage**: Cloudflare R2 with pre-signed URLs for secure uploads/downloads
- **Deployment**: Cloudflare Pages with automatic builds
- **Security**: Secure session management and input validation

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Cloudflare account with Pages, D1, and R2 access

### Installation

**1. Clone and install dependencies:**

```sh
git clone <repository-url>
cd oav-bibina-knowledge-hub
pnpm install
```

**2. Set up environment variables:**

```sh
# Generate secure secrets
node generate-secrets.js

# Copy example files
cp .env.example .env
cp .dev.vars.example .dev.vars

# Edit the files with your actual Cloudflare credentials
# See SECRETS-GUIDE.md for detailed instructions
```

**3. Set up Cloudflare resources:**

```sh
# Create D1 database
wrangler d1 create oav-knowledge-hub-db

# Create R2 bucket
wrangler r2 bucket create oav-knowledge-hub-files

# Update wrangler.jsonc with your database ID
```

**4. Initialize database:**

```sh
# Run database migrations
wrangler d1 execute oav-knowledge-hub-db --file=./schema.sql
```

## Development

Start the development server:

```sh
pnpm run dev
```

For Wrangler development (with Cloudflare bindings):

```sh
wrangler dev
```

## Building & Deployment

Build for production:

```sh
pnpm run build
```

Deploy to Cloudflare Pages:

```sh
wrangler pages deploy .svelte-kit/cloudflare
```

## Configuration

### Environment Variables

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

Required variables:

- `SESSION_SECRET`: JWT signing secret
- `R2_ACCOUNT_ID`: Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: R2 API access key
- `R2_SECRET_ACCESS_KEY`: R2 API secret key

### Security Notes

- Never commit `.env` or `.dev.vars` files
- Use strong, unique secrets in production
- Set environment variables via Cloudflare Pages dashboard for production

## 🏗️ Project Structure

```text
src/
├── lib/
│   ├── server/              # Server-side utilities
│   │   ├── auth.ts         # JWT authentication & session management
│   │   ├── db.ts           # D1 database operations (CRUD)
│   │   ├── r2.ts           # R2 storage & pre-signed URLs
│   │   └── schemas.ts      # Zod validation schemas
│   └── assets/             # Static assets (favicon, etc.)
├── routes/
│   ├── +layout.svelte      # Global layout
│   ├── +page.svelte        # Homepage (classes listing)
│   ├── [class_slug]/       # Public class routes
│   │   ├── +page.svelte    # Subjects listing
│   │   └── [subject_slug]/ # Subject-specific routes
│   │       └── +page.svelte # Files by type (collapsible)
│   ├── admin/              # Protected admin portal
│   │   ├── +layout.server.ts # Auth middleware
│   │   ├── +layout.svelte   # Admin layout with navigation
│   │   ├── +page.svelte     # Login page (with auto-redirect)
│   │   ├── dashboard/       # Admin dashboard with overview
│   │   ├── files/          # File management (collapsible interface)
│   │   ├── settings/       # CRUD for classes/subjects/types
│   │   └── upload/         # File upload with reactive forms
│   ├── api/               # API endpoints
│   │   ├── subjects/      # Dynamic subject loading
│   │   └── upload/        # File upload proxy
│   └── download/          # Secure file downloads
│       └── [note_id]/
└── app.html               # App template
```

## 📋 Complete Feature List

### 🔓 **Public Interface**

- **Homepage**: Grid display of all classes with file counts
- **Class Pages**: List of subjects within each class
- **Subject Pages**: Files organized by type in collapsible sections
- **File Downloads**: Secure downloads via pre-signed URLs
- **Responsive Design**: Works on all devices

### 🔐 **Admin Portal**

- **Secure Login**: JWT-based authentication with auto-redirect
- **Sidebar Navigation**: Modern desktop sidebar with mobile-responsive menu
- **Enhanced Dashboard**: Statistics cards showing totals for classes, subjects, and files
- **Quick Actions**: Visual action cards for common tasks (Add Class, Add Subject, Upload, Manage)
- **File Management**:
  - Collapsible class/subject organization with file type icons
  - Upload, edit, delete operations with visual feedback
  - **Enhanced Upload UI**: Drag-and-drop with file type radio buttons
  - **File Replacement**: Upload new files to replace existing ones automatically
  - Progress tracking and error handling
  - Automatic old file cleanup on replacement
- **Settings Management**:
  - Tabbed interface for Classes, Subjects, File Types, and Admin settings
  - Classes: Full CRUD with visual organization
  - Subjects: Grouped by class with inline editing
  - File Types: Complete management system with icons
  - Admin Credentials: Secure password updates
- **Dark Mode**: Theme toggle integrated in sidebar

### 🛡️ **Security Features**

- **Authentication**: Bcrypt password hashing
- **Session Management**: JWT tokens with secure cookies
- **Route Protection**: Automatic redirects for auth state
- **Input Validation**: Zod schemas for all forms
- **File Security**: Pre-signed URLs prevent direct access

### ⚡ **Performance & UX**

- **Reactive UI**: Svelte 5 runes for optimal reactivity
- **Dark Mode**: Reactive theme store with system preference detection
- **Custom Design System**: Brand-specific color palette with Tailwind CSS
- **Progressive Enhancement**: Works without JavaScript
- **Loading States**: Visual feedback for all operations
- **Error Handling**: Comprehensive error messages with toast notifications
- **Keyboard Navigation**: Full accessibility support
- **File Type Icons**: Visual indicators for different file types (PDF, DOC, PPT, XLS, Images)
- **Responsive Layouts**: Adaptive sidebar and mobile-optimized interfaces

## License

GPL 3.0 License - see LICENSE file for details
