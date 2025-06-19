#!/bin/bash
source .env

# Timestamp versioning
export VERSION=$(date +'%d-%m-%Y_%H-%M')

# Build the app
docker compose build --push

# Deploy the app
# POST request to 

curl "http://31.97.69.106:8000/api/v1/deploy?uuid=bkgcssssckss44844440wg48&force=false" \
  --header "Authorization: Bearer $COOLIFY_DEPLOY_API_KEY" \
  --header 'Content-Type: application/json'