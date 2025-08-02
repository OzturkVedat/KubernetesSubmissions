cluster:
	k3d cluster create dummy-cluster --agents 1 --api-port 127.0.0.1:6550 -p "8081:80@loadbalancer" && \
	kubectl config use-context k3d-dummy-cluster

destroy:
	k3d cluster delete dummy-cluster

nodes:
	kubectl get nodes

build:
	docker build -t dummy-controller:local . && \
	$(MAKE) import

import:
	k3d image import dummy-controller:local -c dummy-cluster

apply:
	kubectl apply -f manifests/crd.yaml && \
	sleep 3	&& \
	kubectl apply -f manifests
	
delete:
	kubectl delete -f manifests

crd:
	kubectl get crd

pods:
	kubectl get pods -l app=dummy-site-controller

logs:
	kubectl logs -f deployment/dummy-site-controller