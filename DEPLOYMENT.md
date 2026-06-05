# Deployment Guide - Vercel

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "New Project"**

4. **Import your repository**

5. **Configure project settings**:
   - Framework Preset: **Create React App**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `build` (auto-detected)
   - Install Command: `npm install` (auto-detected)

6. **Add Environment Variables** (if needed):
   - Go to Project Settings → Environment Variables
   - Add any required environment variables

7. **Click "Deploy"**

## Vercel Configuration

The `vercel.json` file is already configured with:
- ✅ Proper routing for SPA (all routes redirect to index.html)
- ✅ Cache headers for static assets
- ✅ Build and output directory settings

## Important Notes

1. **Environment Variables**: If you need environment variables:
   - Add them in Vercel Dashboard → Project Settings → Environment Variables
   - Or use `.env` files (make sure `.env.local` is in `.gitignore`)

2. **Public Assets**: 
   - Place images in `public/images/` folder
   - They will be accessible at `/images/filename.png`

3. **Build Optimization**:
   - Vercel automatically optimizes React builds
   - Static assets are cached for better performance

4. **Custom Domain**:
   - After deployment, you can add a custom domain in Vercel Dashboard
   - Go to Project Settings → Domains

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18.x by default)
- Check build logs in Vercel Dashboard

### Routing Issues
- The `vercel.json` already includes SPA routing configuration
- All routes will redirect to `index.html` for client-side routing

### Logo Not Showing
- Ensure logo file is in `public/images/` folder
- Check file path in code matches: `/images/ValueMomentum_logo.png`
- Clear browser cache after deployment

## Post-Deployment

After successful deployment:
1. Test all routes and functionality
2. Verify logo displays correctly
3. Test login/logout flow
4. Check responsive design on mobile devices
5. Verify all features work as expected

## Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to main/master branch
- **Preview**: On every pull request

You can configure this in Project Settings → Git.

