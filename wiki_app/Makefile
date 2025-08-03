CLUSTER_NAME=wiki-cluster
SIDECAR_IMAGE=wiki-sidecar:local

.PHONY: cluster destroy nodes build import apply delete pods logs port

cluster:
	k3d cluster create $(CLUSTER_NAME) --agents 1 --api-port 127.0.0.1:6550 -p "8081:80@loadbalancer" && \
	kubectl config use-context k3d-$(CLUSTER_NAME)

destroy:
	k3d cluster delete $(CLUSTER_NAME)

nodes:
	kubectl get nodes

build:
	docker build -t $(SIDECAR_IMAGE) -f Dockerfile.sidecar . && \
	$(MAKE) import

import:
	k3d image import $(SIDECAR_IMAGE) -c $(CLUSTER_NAME)

apply:
	kubectl apply -f manifests

delete:
	kubectl delete -f manifests

pods:
	kubectl get pods -o wide

logs:
	kubectl logs -f pod/wiki-app -c sidecar

nginx-logs:
	kubectl logs -f pod/wiki-app -c nginx

pf:
	kubectl port-forward pod/wiki-app 8080:80
