# The Project

## Build

docker build -t the_project:local .

## Create cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445

## Start cluster

k3d cluster start k3s-default

## Import to cluster

k3d image import the_project:local

## Deployment

kubectl create deployment the-project --image=the_project:local

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/the-project
