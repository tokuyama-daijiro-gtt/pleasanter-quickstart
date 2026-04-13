FROM node:20-bookworm

WORKDIR /workspace/playwright

COPY package.json ./

RUN npm install
RUN npx playwright install --with-deps chromium
