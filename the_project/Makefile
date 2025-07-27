PROJECT_ID=k8s-course-466712
IMAGE_NAME=the_project
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
	kubectl apply -k manifests

delete:
	kubectl delete -k manifests

deploy: all	

logs:
	kubectl logs deployment/the-project -n project

svc:
	kubectl get svc -n project	

ingress:
	kubectl get ingress -n project	

log-ingress:
	kubectl describe ingress the-project-ingress -n project
	