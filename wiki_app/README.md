# Wiki-app

This project deploys a multi-container Pod that serves Wikipedia pages using NGINX inside a local k3d cluster.

## Architecture

- Main container: `nginx` — serves static HTML pages
- Init container: `curlimages/curl` — fetches the Kubernetes wiki page at startup
- Sidecar container: `wiki-sidecar:local` — waits 5–15 mins, then fetches a random Wikipedia page and saves it

All containers share a common volume mounted at `/usr/share/nginx/html`.

## Usage

You can use Make commands to start up the app easily.

```bash
make cluster      # create k3d cluster
make build        # build sidecar image and import it into the cluster
make apply        # apply the pod manifest
make pf         # forward port 80 to localhost:8080
```
