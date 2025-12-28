# Fast Deployment Guide

This repo contains a React frontend and a Node/Express backend. Follow these steps to deploy quickly with a persistent MongoDB and working email + CORS.

## 1) Provision MongoDB Atlas
- Create a free cluster on MongoDB Atlas
- Create a database user and copy your connection string (mongodb+srv://...)
- Replace `<your-mongodb-atlas-uri>` below with the actual URI

## 2) Backend on Render
- Render will detect the backend via `render.yaml`
- Service:
  - Type: Web Service
  - Root Dir: `backend`
  - Build: `npm install`
  - Start: `node server.cjs`
- Environment Variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=<your-mongodb-atlas-uri>`
  - `MONGODB_DB_NAME=research_grant_db`
  - `FRONTEND_URL=https://<your-frontend-domain>`
  - `CORS_ORIGINS=https://<your-frontend-domain>`
  - Email (choose one):
    - Dev previews: `EMAIL_USE_ETHEREAL=true`
    - Gmail: `EMAIL_SERVICE=gmail`, `EMAIL_USER`, `EMAIL_PASS` (Google App Password), `EMAIL_FROM`
    - SMTP: `EMAIL_HOST`, `EMAIL_PORT=587`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- Health endpoint: `GET /api/health`

## 3) Frontend on Vercel or Netlify
- `REACT_APP_API_BASE_URL` must point to your backend URL
- Vercel:
  - Import repo, set env `REACT_APP_API_BASE_URL=https://<render-service>.onrender.com/api`
  - Deploy
- Netlify:
  - Build: `npm run build`, Publish: `build` (see `netlify.toml`)
  - Env: `REACT_APP_API_BASE_URL=https://<render-service>.onrender.com/api`

## 4) CORS + Email
- CORS is controlled via `CORS_ORIGINS` and `FRONTEND_URL`
- Email will default to Ethereal in dev; configure Gmail/SMTP in prod

## 5) Data Persistence & Logging
- Users, password resets, and auth events persist in MongoDB Atlas
- See models: `backend/models/User.cjs`, `backend/models/AuthEvent.cjs`

## 6) Local Dev (stable)
- Run both API and web together:
```
npm run dev:full
```
- Or separate terminals; set `REACT_APP_API_BASE_URL=http://localhost:5000/api`

## 7) Optional: Containerize backend
- A `backend/Dockerfile` is provided for portability
- Build and run:
```
docker build -t research-grant-api ./backend
docker run -p 5000:5000 -e MONGODB_URI='<atlas-uri>' -e MONGODB_DB_NAME='research_grant_db' research-grant-api
```

## 8) Sanity Test After Deploy
- Backend: `GET https://<render-service>.onrender.com/api/health`
- Frontend: Forgot Password flow → check email (or Ethereal preview URL)
- MongoDB Atlas: verify `users` and `authevents` collections populate
