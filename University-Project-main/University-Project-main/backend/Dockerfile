# Backend Dockerfile for containerized deployment
FROM node:18-alpine

WORKDIR /app

# Copy only backend
COPY backend/package.json ./
RUN npm install --production

COPY backend ./

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.cjs"]
