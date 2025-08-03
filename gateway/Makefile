apply:
	kubectl get ns exercises >/dev/null 2>&1 || kubectl create ns exercises
	kubectl apply -f manifests -n exercises