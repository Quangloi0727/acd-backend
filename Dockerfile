FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 600000
RUN npm config set fetch-retry-maxtimeout 1200000
RUN npm config set fetch-timeout 1800000
RUN npm i --force
RUN npm run build
USER node

FROM node:18-alpine AS production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

ENV TZ=Asia/Ho_Chi_Minh

EXPOSE 5580
CMD [ "node", "dist/src/main.js" ]
