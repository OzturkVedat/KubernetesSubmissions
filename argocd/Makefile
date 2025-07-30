install:
	kubectl get ns argocd >/dev/null 2>&1 || kubectl create namespace argocd && \
	kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

apply:
	kubectl apply -f manifests