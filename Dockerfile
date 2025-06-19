# Target amd64
FROM node:20.12 AS builder

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
# COPY prisma ./prisma
RUN pnpm install

COPY . .
RUN pnpm build


FROM node:20.12-alpine

WORKDIR /app
EXPOSE 3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/prisma ./prisma

CMD ["node", "build/index.js"]

