FROM node:10.13-alpine as build

ENV NODE_ENV production
WORKDIR /spa-prod

COPY ./package.json /spa-prod/package.json
COPY ./yarn.lock /spa-prod/yarn.lock
COPY ./tsconfig.build.json /spa-prod/tsconfig.build.json

RUN yarn install --pure-lockfile --production=false

COPY ./src /spa-prod/src

RUN yarn build

RUN yarn install --pure-lockfile --production=true

FROM node:10.13-alpine as runtime
WORKDIR /app
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD curl --fail http://localhost:8080/healthz || exit 1
CMD /usr/local/bin/node /spa-prod/dist/cli.js

RUN apk add --no-cache curl

COPY --from=build --chown=node:node /spa-prod/package.json /spa-prod/package.json
COPY --from=build --chown=node:node /spa-prod/yarn.lock /spa-prod/yarn.lock
COPY --from=build --chown=node:node /spa-prod/dist /spa-prod/dist
COPY --from=build --chown=node:node /spa-prod/node_modules /spa-prod/node_modules

USER node
