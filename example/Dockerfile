FROM fireantik/spa-prod:latest

# When you wish to configure using environment variables
ENV SPA_PROD_ROOT /app
ENV SPA_PROD_INDEX /app/index.html
ENV SPA_PROD_PRESET cra

# When you wish to configure using JSON file
# COPY ./config.json /app/config.json
# CMD /usr/local/bin/node /spa-prod/dist/cli.js --config /app/config.json

# If you wish to use a different port
# EXPOSE 8080
# ENV SPA_PROD_PORT 8080
# HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD curl --fail http://localhost:8080/healthz || exit 1

# Copy built SPA files
COPY ./cra/build /app
