cluster:
	k3d cluster delete istio-demo || true 
	k3d cluster create istio-demo \
	--api-port 127.0.0.1:6550 -p "9080:80@loadbalancer" -p "9443:443@loadbalancer" \
	--agents 2 --k3s-arg "--disable=traefik@server:*"

helm:
	helm install istio-base istio/base -n istio-system --wait
	helm install istiod istio/istiod -n istio-system \
  	--set profile=ambient \
  	--set global.platform=k3d \
  	--wait
	helm install istio-cni istio/cni -n istio-system \
  	--set profile=ambient \
  	--set global.platform=k3d \
  	--wait 
	helm install ztunnel istio/ztunnel -n istio-system --wait

ns:	
	kubectl create namespace istio-system	

gw-api:
	kubectl get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 \
  	|| kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml

apply:
	kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.26/samples/bookinfo/platform/kube/bookinfo.yaml && \
	kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.26/samples/bookinfo/platform/kube/bookinfo-versions.yaml && \
	kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.26/samples/bookinfo/gateway-api/bookinfo-gateway.yaml


pods:
	kubectl get pods | grep -E "(details|productpage|reviews|ratings)"

pf:
	@kubectl annotate gateway bookinfo-gateway networking.istio.io/service-type=ClusterIP -n default --overwrite
	@kubectl wait -n default gateway/bookinfo-gateway --for=condition=programmed --timeout=60s
	@echo "Port-forwarding http://localhost:8080/productpage …"
	@bash -c "while true; do \
		kubectl port-forward svc/bookinfo-gateway-istio 8080:80 -n default > /dev/null 2>&1 || true; \
		echo '[pf] Port-forward exited. Retrying in 3s…'; \
		sleep 3; \
	done"

deploy: cluster ns gw-api helm apply pf
