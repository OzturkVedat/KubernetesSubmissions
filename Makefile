.PHONY: redeploy log_output ping_pong the_project todo_backend

CLUSTER_NAME = k3s-default

redeploy:
	k3d cluster delete $(CLUSTER_NAME) && \
	k3d cluster create $(CLUSTER_NAME) --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer"
	kubectl create namespace project || true
	kubectl create namespace exercises || true
	kubectl create namespace logging || true
	
deploy:
	k3d cluster create $(CLUSTER_NAME) --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer"

delete:
	k3d cluster delete k3s-default

pods:
	kubectl get pods -n project
	kubectl get pods -n exercises
	kubectl get pods -n logging

log_output:
	docker build -t log_output:local ./log_output && \
	k3d image import log_output:local -c $(CLUSTER_NAME) && \
	kubectl apply -f log_output/manifests

ping_pong:
	docker build -t ping_pong:local ./ping_pong && \
	k3d image import ping_pong:local -c $(CLUSTER_NAME) && \
	kubectl apply -f ping_pong/manifests

the_project:
	docker build -t the_project:local ./the_project && \
	k3d image import the_project:local -c $(CLUSTER_NAME) && \
	kubectl apply -f the_project/manifests

todo_backend:
	docker build -t todo_backend:local ./todo_backend && \
	k3d image import todo_backend:local -c $(CLUSTER_NAME) && \
	kubectl apply -f todo_backend/manifests

logging:
	helm upgrade --install loki grafana/loki-stack \
		--namespace logging --create-namespace \
		--set grafana.enabled=true \
		--set promtail.enabled=true \
		--set loki.enabled=true

grafana:
	kubectl port-forward svc/loki-grafana -n logging 3000:80		

grafana-pw:
	kubectl get secret -n logging loki-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

prometheus:
	kubectl create namespace prometheus
	helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace prometheus

cc:
	@echo "Creating GKE cluster.."
	gcloud container clusters create course-cluster --zone europe-central2-a --num-nodes 1 && \
	$(MAKE) context	&& \
	$(MAKE) lb

dc:
	gcloud container clusters delete course-cluster --zone europe-central2-a -q

context:
	gcloud config set project k8s-course-466712
	gcloud container clusters get-credentials course-cluster --zone europe-central2-a --project k8s-course-466712

lb:
	gcloud container clusters update course-cluster \
  	--zone europe-central2-a \
  	--update-addons=HttpLoadBalancing=ENABLED

gw:
	gcloud container clusters update course-cluster \
  	--zone=europe-central2-a \
  	--gateway-api=standard

rollouts:
	@echo "Installing Argo Rollouts CRDs and controller..."
	kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply -n argo-rollouts --server-side -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
