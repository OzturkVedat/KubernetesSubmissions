PROJECT_ID=k8s-course-466712
IMAGE_NAME=log_output
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
	kubectl logs deployment/log-output -n exercises

svc:
	kubectl get svc -n exercises	

ingress:
	kubectl get ingress -n exercises	

log-ingress:
	kubectl describe ingress log-output-ingress -n exercises