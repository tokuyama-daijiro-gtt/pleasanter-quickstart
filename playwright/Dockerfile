FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /workspace

COPY package.json ./
RUN npm install --omit=dev

COPY access-pleasanter.js ./

CMD ["node", "access-pleasanter.js"]
