# Kraud production image — Next.js standalone + Prisma (Postgres)
FROM node:22-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
ENV NODE_ENV=development
RUN npm ci --include=dev

FROM node:22-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
RUN apk add --no-cache openssl libc6-compat tini
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 KRAUD_DATA_DIR=/data PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/assets ./assets
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/pdfkit ./node_modules/pdfkit
RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["/sbin/tini","--"]
CMD ["sh","-c","node node_modules/prisma/build/index.js migrate deploy && node server.js"]
