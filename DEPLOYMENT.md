# Complete Deployment Guide

## 🚀 Overview

This guide covers deploying the fully-implemented OAV Bibina Knowledge Hub to Cloudflare Pages with all features
enabled.

## 📋 Pre-Deployment Checklist

### ✅ Required Cloudflare Resources

1. **D1 Database**: `oav-knowledge-hub-db` (with complete schema)
2. **R2 Bucket**: `oav-knowledge-hub-files` (for file storage)
3. **R2 API Token**: With read/write permissions
4. **Cloudflare Pages**: Project connected to your repository

### ✅ Environment Configuration

Ensure you have all required environment variables ready:

- `SESSION_SECRET`: Secure 64-character hex string
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: R2 API Access Key ID
- `R2_SECRET_ACCESS_KEY`: R2 API Secret Access Key

## 🛠️ Step-by-Step Deployment

### 1. Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create oav-knowledge-hub-db

# Create R2 bucket
wrangler r2 bucket create oav-knowledge-hub-files

# Update wrangler.jsonc with the database ID returned from creation
```

### 2. Initialize Database

```bash
# Create all required tables
wrangler d1 execute oav-knowledge-hub-db --file=schema.sql

# Create initial admin user (replace with your credentials)
wrangler d1 execute oav-knowledge-hub-db --command="
INSERT INTO Admin (id, username, password_hash)
VALUES (1, 'admin', '\$2b\$10\$your-bcrypt-hash-here')
"

# Optional: Add sample data for testing
wrangler d1 execute oav-knowledge-hub-db --command="
INSERT INTO Classes (name) VALUES ('Class 10'), ('Class 12');
INSERT INTO Subjects (name, class_id) VALUES ('Mathematics', 1), ('Physics', 1);
INSERT INTO FileTypes (name) VALUES ('Notes'), ('Question Papers'), ('Solutions');
"
```

### 3. Set Up Cloudflare Pages

#### Option A: GitHub Integration (Recommended)

1. **Connect Repository**:
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
   - Click "Create a project" → "Connect to Git"
   - Select your repository and authorize access

2. **Configure Build Settings**:
   - **Build command**: `pnpm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
   - **Root directory**: `/` (leave default)

#### Option B: Direct Upload

```bash
# Build the project locally
pnpm run build

# Deploy to Pages
wrangler pages deploy .svelte-kit/cloudflare --project-name=oav-knowledge-hub
```

### 4. Configure Environment Variables

#### Using Cloudflare Dashboard

1. Go to your Pages project → **Settings** → **Environment Variables**
2. Add these variables for **Production**:

```text
SESSION_SECRET=your-64-character-hex-string-here
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
```

#### Using Wrangler CLI

```bash
# Navigate to your project directory
cd oav-knowledge-hub

# Set each environment variable
wrangler pages secret put SESSION_SECRET --project-name=oav-knowledge-hub
wrangler pages secret put R2_ACCOUNT_ID --project-name=oav-knowledge-hub
wrangler pages secret put R2_ACCESS_KEY_ID --project-name=oav-knowledge-hub
wrangler pages secret put R2_SECRET_ACCESS_KEY --project-name=oav-knowledge-hub
```

### 5. Configure R2 CORS for File Uploads

**IMPORTANT:** The file replacement feature requires R2 CORS configuration for direct browser uploads.

```bash
# Apply CORS configuration to R2 bucket
wrangler r2 bucket cors put oav-knowledge-hub-files --file=r2-cors.json
```

The `r2-cors.json` file contains:

```json
[
	{
		"AllowedOrigins": ["*"],
		"AllowedMethods": ["PUT", "POST", "GET"],
		"AllowedHeaders": ["*"],
		"ExposeHeaders": ["ETag"],
		"MaxAgeSeconds": 3600
	}
]
```

**For Production:** Replace `"AllowedOrigins": ["*"]` with your specific domain(s):

```json
"AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"]
```

### 6. Bind Cloudflare Resources

In your **Pages project settings**:

1. **Functions** → **Compatibility flags**: Add `nodejs_compat` (if needed)

2. **Functions** → **Bindings**:
   - **D1 Database**:
     - Variable name: `DB`
     - D1 database: `oav-knowledge-hub-db`
   - **R2 Bucket**:
     - Variable name: `BUCKET`
     - R2 bucket: `oav-knowledge-hub-files`

### 7. Deploy and Verify

```bash
# Trigger a new deployment (if using Git integration)
git push origin main

# Or deploy directly
wrangler pages deploy .svelte-kit/cloudflare --project-name=oav-knowledge-hub
```

## ✅ Post-Deployment Verification

### 1. Test Public Interface

- ✅ Homepage loads and shows classes
- ✅ Class pages show subjects
- ✅ Subject pages show files by type
- ✅ File downloads work correctly

### 2. Test Admin Interface

- ✅ Login page loads at `/admin`
- ✅ Login with admin credentials works
- ✅ Dashboard shows statistics correctly
- ✅ File upload works end-to-end
- ✅ **File replacement works** (upload new file, old file automatically deleted)
- ✅ Settings CRUD operations function
- ✅ File management interface is responsive

### 3. Security Verification

- ✅ Admin routes redirect when not logged in
- ✅ Sessions expire correctly
- ✅ File downloads are secured with pre-signed URLs
- ✅ All forms validate input properly

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add Custom Domain** in Pages settings
2. **Configure DNS** to point to your Pages project
3. **SSL Certificate** is automatically provisioned

### Performance Optimization

```jsonc
// wrangler.jsonc - Add compatibility date for latest features
{
	"compatibility_date": "2024-03-08",
	"compatibility_flags": ["nodejs_compat"],
}
```

### Security Headers

Add to your Pages project:

```javascript
// functions/_middleware.js
export async function onRequest(context) {
	const response = await context.next();

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
}
```

## 🚨 Troubleshooting

### Common Issues

**Build Fails**:

- Ensure `pnpm` is installed: `npm install -g pnpm`
- Check Node.js version is 18+
- Verify all dependencies are installed: `pnpm install`

**Database Connection Issues**:

- Verify database ID in `wrangler.jsonc` matches created database
- Check D1 binding name is exactly `DB`
- Confirm database schema is applied

**R2 Upload Failures**:

- Verify R2 API credentials are correct
- Check bucket name matches binding configuration
- Ensure API token has sufficient permissions
- **Verify CORS is configured** on R2 bucket using `wrangler r2 bucket cors get oav-knowledge-hub-files`
- Check browser console for CORS-related errors during file upload
- Ensure `AllowedOrigins` includes your deployment domain

**Session/Auth Issues**:

- Verify `SESSION_SECRET` is set and 64 characters long
- Check admin user exists in database
- Confirm bcrypt hash is generated correctly

### Debug Mode

Enable verbose logging:

```bash
# Local development with debug info
DEBUG=* pnpm run dev

# Wrangler with verbose output
wrangler pages dev .svelte-kit/cloudflare --local --verbose
```

## 🔐 Security Best Practices

### Production Security

- ✅ Use strong, unique `SESSION_SECRET` (64+ chars)
- ✅ Rotate API credentials every 6 months
- ✅ Enable 2FA on Cloudflare account
- ✅ Monitor access logs regularly
- ✅ Keep dependencies updated

### Backup Strategy

```bash
# Regular database backups
wrangler d1 export oav-knowledge-hub-db --output=backup-$(date +%Y%m%d).sql

# R2 bucket backup using rclone or similar tools
# Set up automated backups via GitHub Actions or cron jobs
```

This deployment guide ensures your OAV Bibina Knowledge Hub is properly configured, secure, and ready for production use
with all features functioning correctly.
