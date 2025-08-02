const k8s = require("@kubernetes/client-node");
const fs = require("fs");
const https = require("https");
const path = require("path");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const namespace = "default";
const k8sWatch = new k8s.Watch(kc);
const k8sCustom = kc.makeApiClient(k8s.CustomObjectsApi);
const k8sCore = kc.makeApiClient(k8s.CoreV1Api);
const k8sApps = kc.makeApiClient(k8s.AppsV1Api);

async function downloadHtml(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
  });
}

async function handleDummySite(obj) {
  const name = obj.metadata.name;
  const url = obj.spec.website_url;
  const folder = `/tmp/${name}`;
  const filePath = path.join(folder, "index.html");

  try {
    console.log(`[+] New DummySite: ${name} - ${url}`);
    fs.mkdirSync(folder, { recursive: true });

    console.log(`[~] Downloading HTML...`);
    await downloadHtml(url, filePath);

    const indexHtml = fs.readFileSync(filePath, "utf-8");

    console.log(`[~] Creating ConfigMap...`);
    await k8sCore.createNamespacedConfigMap(namespace, {
      metadata: { name: `html-${name}` },
      data: { "index.html": indexHtml },
    });

    console.log(`[~] Creating Deployment...`);
    await k8sApps.createNamespacedDeployment(namespace, {
      metadata: { name: `dummy-${name}` },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: `dummy-${name}` } },
        template: {
          metadata: { labels: { app: `dummy-${name}` } },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx",
                volumeMounts: [
                  {
                    name: "html",
                    mountPath: "/usr/share/nginx/html",
                  },
                ],
              },
            ],
            volumes: [
              {
                name: "html",
                configMap: {
                  name: `html-${name}`,
                  items: [{ key: "index.html", path: "index.html" }],
                },
              },
            ],
          },
        },
      },
    });

    console.log(`[~] Creating Service...`);
    await k8sCore.createNamespacedService(namespace, {
      metadata: { name: `dummy-${name}` },
      spec: {
        selector: { app: `dummy-${name}` },
        ports: [{ protocol: "TCP", port: 80, targetPort: 80 }],
      },
    });

    console.log(`[+] DummySite '${name}' deployed!`);
  } catch (err) {
    console.error(`[-] Failed to handle DummySite '${name}':`, err.message);
  }
}

async function main() {
  console.log(`[~] Watching for DummySite resources...`);
  k8sWatch.watch(
    `/apis/example.com/v1/namespaces/${namespace}/dummysites`,
    {},
    async (type, obj) => {
      if (type === "ADDED") {
        await handleDummySite(obj);
      }
    },
    (err) => {
      console.error("Watch connection failed:", err);
    }
  );
}

main();
