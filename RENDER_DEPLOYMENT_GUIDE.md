# Kesgrave Website Deployment Guide for Render

## Overview

This guide will help you deploy your Kesgrave website to Render with both the frontend (React/Vite) and CMS (Flask) components. The deployment has been prepared to address all hardcoded IP addresses and configuration issues.

## What Was Fixed

### 1. Hardcoded IP Addresses Resolved
- ✅ Frontend `.env` file now uses environment variables
- ✅ CMS configuration updated for production deployment
- ✅ CORS settings configured for production

### 2. Missing Dependencies Added
- ✅ `Flask-CORS` added to requirements.txt
- ✅ `python-dateutil` added for date handling
- ✅ `psycopg2-binary` added for PostgreSQL support
- ✅ `gunicorn` added for production server

### 3. Production Configuration
- ✅ Environment-based database configuration
- ✅ Proper CORS settings for production
- ✅ Gunicorn configuration for deployment
- ✅ Environment variable management

## Deployment Steps

### Step 1: Deploy the CMS (Backend) First

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure the CMS Service**
   - **Name**: `kesgrave-cms`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app`
   - **Root Directory**: `deployment/cms`

3. **Add Environment Variables**
   ```
   FLASK_ENV=production
   SECRET_KEY=[Generate a secure random key]
   FRONTEND_URL=https://your-frontend-domain.onrender.com
   ```

4. **Create PostgreSQL Database**
   - In Render Dashboard, click "New" → "PostgreSQL"
   - **Name**: `kesgrave-cms-db`
   - **Database Name**: `kesgrave_cms`
   - **User**: `kesgrave_user`
   - Copy the **Internal Database URL** and add it as environment variable:
   ```
   DATABASE_URL=[Your PostgreSQL Internal URL]
   ```

5. **Deploy the CMS**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the CMS URL (e.g., `https://kesgrave-cms.onrender.com`)

### Step 2: Deploy the Frontend

1. **Update Frontend Environment**
   - Edit `deployment/frontend/.env.production`
   - Replace `https://your-cms-domain.onrender.com` with your actual CMS URL

2. **Create a new Static Site on Render**
   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Connect your GitHub repository

3. **Configure the Frontend Service**
   - **Name**: `kesgrave-website`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `deployment/frontend`

4. **Add Environment Variables**
   ```
   VITE_CMS_API_URL=https://your-cms-url.onrender.com
   ```

5. **Deploy the Frontend**
   - Click "Create Static Site"
   - Wait for deployment to complete

### Step 3: Update CORS Configuration

1. **Update CMS Environment Variables**
   - Go to your CMS service settings
   - Update the `FRONTEND_URL` environment variable with your actual frontend URL
   - Example: `FRONTEND_URL=https://kesgrave-website.onrender.com`

2. **Redeploy CMS**
   - Trigger a manual deploy to apply the new CORS settings

## File Structure Created

```
deployment/
├── cms/
│   ├── app.py                 # Flask app configuration
│   ├── main.py               # Application entry point
│   ├── cms_routes.py         # All CMS routes (modified)
│   ├── requirements.txt      # Updated dependencies
│   └── render.yaml          # Render configuration
└── frontend/
    ├── .env.production      # Production environment variables
    ├── package.json         # React/Vite configuration
    ├── src/                 # Source files
    └── [other frontend files]
```

## Environment Variables Summary

### CMS Environment Variables
```
FLASK_ENV=production
SECRET_KEY=[secure-random-key]
DATABASE_URL=[postgresql-url]
FRONTEND_URL=[frontend-url]
```

### Frontend Environment Variables
```
VITE_CMS_API_URL=[cms-url]
```

## Testing the Deployment

1. **Test CMS API**
   - Visit `https://your-cms-url.onrender.com/api/footer-links`
   - Should return JSON data

2. **Test Frontend**
   - Visit your frontend URL
   - Check that it loads and can fetch data from the CMS

3. **Test CORS**
   - Open browser developer tools
   - Check for any CORS errors in the console

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in CMS matches your actual frontend URL
   - Check that both services are deployed and running

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correctly set
   - Ensure PostgreSQL database is running

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are in requirements.txt/package.json

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Restart services after changing environment variables

### Logs and Debugging

- Use Render's log viewer to debug issues
- Check both build logs and runtime logs
- Monitor database connection status

## Security Considerations

1. **Secret Key**: Use a strong, randomly generated secret key
2. **CORS**: Only allow your frontend domain, not wildcards
3. **Database**: Use the internal database URL for better security
4. **Environment Variables**: Never commit sensitive data to version control

## Maintenance

1. **Updates**: Use Render's auto-deploy feature with GitHub integration
2. **Monitoring**: Set up Render's monitoring and alerts
3. **Backups**: Configure database backups in Render
4. **SSL**: Render provides SSL certificates automatically

## Cost Optimization

1. **Free Tier**: Both services can run on Render's free tier initially
2. **Scaling**: Upgrade to paid plans as traffic grows
3. **Database**: PostgreSQL has a free tier with limitations

## Next Steps

1. Deploy the CMS first and test the API endpoints
2. Deploy the frontend with the correct CMS URL
3. Test the complete application
4. Set up monitoring and alerts
5. Configure custom domains if needed

Your website should now be fully deployed and accessible on Render!

