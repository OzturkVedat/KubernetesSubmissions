# Log output app

## Build

docker build -t log_output:local .

## Create cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445

## Start cluster

k3d cluster start k3s-default

## Import to cluster

k3d image import log_output:local

## Deployment

kubectl create deployment log-output --image=log_output:local

## Re-deployment

kubectl rollout restart deployment log-output

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/log-output

## Terminal

![Terminal ss](docs/logs.png)
