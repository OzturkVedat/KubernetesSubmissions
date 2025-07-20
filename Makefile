.PHONY: redeploy log_output ping_pong the_project todo_backend

CLUSTER_NAME = k3s-default

redeploy:
	k3d cluster delete $(CLUSTER_NAME) && \
	k3d cluster create $(CLUSTER_NAME) --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer" && namespaces

deploy:
	k3d cluster create $(CLUSTER_NAME) --api-port 127.0.0.1:6445 -p "8081:80@loadbalancer"

delete:
	k3d cluster delete k3s-default

namespaces:
	kubectl create namespace project || true
	kubectl create namespace exercises || true

pods:
	kubectl get pods -n project
	kubectl get pods -n exercises

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
