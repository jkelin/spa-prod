FROM fireantik/spa-prod

# If you wish to use a different port
# EXPOSE 8080
# HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD curl --fail http://localhost:8080/healthz || exit 1

# Copy configuration
COPY ./config.js /app/spa-prod.config.js
ENV SPA_PROD_CONFIG /app/spa-prod.config.js

# Copy built files from dist directory
COPY ./dist /app/dist
