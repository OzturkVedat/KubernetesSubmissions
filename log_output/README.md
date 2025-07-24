# Log output app (splitted)

## Build

docker build -t log_output:local .

## Create cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer"

## Delete cluster

k3d cluster delete k3s-default

## Import to cluster

k3d image import log_output:local -c k3s-default

## Deploy manifests

kubectl apply -f manifests

## Delete manifests

kubectl delete -f manifests

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/log-output -n exercises

## Deployed status page

![Deployed ss](docs/gke_browser.png)
