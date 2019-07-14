FROM node:10.13-alpine

ENV NODE_ENV production
WORKDIR /app
EXPOSE 8080
HEALTHCHECK --interval=1s --timeout=3s --retries=3 CMD curl --fail http://localhost:8080/healthz || exit 1
CMD ["node", "/app/node_modules/.bin/spa-prod", "--port", "8080", "/app/dist"]

RUN apk add --no-cache curl

USER node

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install --pure-lockfile --production=true

COPY ./dist /app/dist

