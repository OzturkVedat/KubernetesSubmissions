# Build

docker build -t log_output:local .

# Cluster

k3d cluster create k3s-default --api-port 127.0.0.1:6445

# Import to cluster

k3d image import log_output:local

# Deployment

kubectl create deployment log-output --image=log_output:local

# Check pods

kubectl get pods

# Check logs

kubectl logs deployment/log-output
