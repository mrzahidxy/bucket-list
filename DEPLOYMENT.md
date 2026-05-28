# Deployment

Codebase files committed in this repo:

- `Dockerfile`
- `.dockerignore`
- `.env.example`
- `.github/workflows/deploy.yml`
- `.gitignore`

Required GitHub secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

Optional GitHub secrets:

- `VPS_PORT`
- `VPS_APP_DIR`
- `LOCAL_HEALTHCHECK_URL`
- `PUBLIC_HEALTHCHECK_URL`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

VPS app path:

- `/opt/apps/bucket-list`

These VPS files are not committed:

- `/opt/apps/bucket-list/.env`
- `/opt/apps/bucket-list/docker-compose.yml`
- `/etc/nginx/sites-available/<domain>`

VPS notes:

- Put real production env values in `/opt/apps/bucket-list/.env`.
- Keep `docker-compose.yml` on the VPS pointing at `ghcr.io/mrzahidxy/bucket-list/app:latest` or a SHA tag.
- Make sure the compose service maps traffic to container port `8080` and the app health check uses `GET /health`.

Manual deploy:

```bash
cd /opt/apps/bucket-list
docker compose pull
docker compose up -d
docker image prune -f
```

Logs:

```bash
cd /opt/apps/bucket-list
docker compose logs -f
```

Health checks:

```bash
curl -fsS http://127.0.0.1:8080/health
curl -fsS https://your-domain.example/health
```

Rollback:

```bash
cd /opt/apps/bucket-list
nano docker-compose.yml
# change image to:
# ghcr.io/mrzahidxy/bucket-list/app:<previous-good-sha>

docker compose pull
docker compose up -d
```
