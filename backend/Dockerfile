FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev   # omit dev dependencies for production

COPY . .

RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
