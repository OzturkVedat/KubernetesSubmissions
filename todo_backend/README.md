# The Project

## Deploy the app

kubectl apply -f manifests

## Check pods

kubectl get pods

## Check logs

kubectl logs deployment/todo-backend -n project

# Helm

helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# GCS key for GKE

kubectl create secret generic gcs-key --from-file=key.json=./k8s-course.key.json --namespace=project

# Install Loki stack

helm upgrade --install loki grafana/loki-stack \
 --namespace logging --create-namespace \
 --set grafana.enabled=true \
 --set promtail.enabled=true \
 --set loki.enabled=true

## Loki UI

![loki ss](docs/loki.png)
