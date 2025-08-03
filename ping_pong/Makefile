PROJECT_ID=k8s-course-466712
IMAGE_NAME=ping_pong
IMAGE_TAG=gcr
FULL_IMAGE=gcr.io/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG)
CLUSTER_NAME=course-cluster
ZONE=europe-central2-a

.PHONY: all build tag push gke apply deploy

all: build tag push apply

build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

tag:
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(FULL_IMAGE)

push:
	docker push $(FULL_IMAGE)

apply:
	kubectl apply -f manifests

delete:
	kubectl delete -f manifests

deploy: all	

logs:
	kubectl logs deployment/ping-pong -n exercises

# SERVERLESS

cluster:
	k3d cluster create knative \
  	--port 8082:30080@agent:0 \
 	 -p 8081:80@loadbalancer \
  	--agents 2 \
  	--k3s-arg "--disable=traefik@server:0" 

crd-apply:
	kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml
	kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml
	kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.13.0/kourier.yaml

patch-i:
	kubectl patch configmap/config-network \
	--namespace knative-serving \
  	--type merge \
  	--patch '{"data":{"ingress.class":"kourier.ingress.networking.knative.dev"}}'

patch-dns:
	kubectl patch configmap/config-domain \
  	--namespace knative-serving \
  	--type merge \
  	--patch '{"data": {"192.168.240.3.sslip.io": ""}}'

pods:	
	kubectl get pods -n knative-serving

app:
	bash deploy-hello.sh

knat:
	kubectl get ns exercises || kubectl create ns exercises 
	kubectl apply -f knative/service.yaml
