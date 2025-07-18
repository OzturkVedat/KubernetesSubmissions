# Log output app

## Build

docker build -t log_output:local .

## Create cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445

## Delete cluster

k3d cluster delete k3s-default

## Import to cluster

k3d image import log_output:local -c k3s-default

# Apply deployment

kubectl apply -f manifests/deployment.yaml

# Delete deployment

kubectl delete -f manifests/deployment.yaml

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/log-output

## Terminal

![Terminal ss](docs/logs.png)
