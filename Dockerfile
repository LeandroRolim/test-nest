FROM node:22-alpine AS base
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false # Instalar todas as deps, incluindo devDeps para build

# --- Dependencies Stage ---
FROM node:22-alpine AS dependencies
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false # Instalar todas as deps, incluindo devDeps para build
# --- Build Stage ---
FROM dependencies AS build
COPY . .
RUN yarn prisma generate # Gerar Prisma Client
RUN yarn build # Compilar o projeto TypeScript

# --- Production Stage ---
FROM node:22-alpine AS production
ENV NODE_ENV production
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true # Instalar apenas dependências de produção

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma 

EXPOSE 3000

# Comando para rodar a aplicação
# O ideal é rodar migrações separadamente antes de iniciar a aplicação em um ambiente de produção real.
# CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:prod"]
CMD ["node", "dist/main.js"]