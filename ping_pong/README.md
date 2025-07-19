# Log output app

## Build

docker build -t ping_pong:local .

## Create cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer"

## Delete cluster

k3d cluster delete k3s-default

## Import to cluster

k3d image import ping_pong:local -c k3s-default

## Deploy manifests

kubectl apply -f manifests

## Delete manifests

kubectl delete -f manifests

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/ping-pong

## Browser

![Browser ss](docs/browser_ss.png)
