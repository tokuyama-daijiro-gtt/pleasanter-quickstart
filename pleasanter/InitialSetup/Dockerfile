FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /workspace

COPY InitialSetup/package.json ./
RUN npm install --omit=dev

COPY InitialSetup/initialize-pleasanter.js ./

CMD ["node", "initialize-pleasanter.js"]
