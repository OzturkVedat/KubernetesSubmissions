install:
	kubectl get ns argocd >/dev/null 2>&1 || kubectl create namespace argocd && \
	kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

apply-all:
	kubectl apply -f manifests

apply-lo:
	kubectl apply -f manifests/log-output-app.yaml

info-lo:
	kubectl get applications -n argocd log-output -o wide	

events-lo:
	kubectl describe application log-output -n argocd	


apply-tp:
	kubectl apply -f manifests/the-project-app.yaml

info-tp:
	kubectl get applications -n argocd the-project -o wide	

events-tp:
	kubectl describe application the-project -n argocd		