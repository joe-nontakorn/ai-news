FROM node:20-alpine
ARG IMAGE_VERSION=1.0.0
LABEL version="${IMAGE_VERSION}"


WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production \
    TZ=Asia/Bangkok

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "index.js"]
