# Dummy Controller

A simple Kubernetes controller for a custom resource called DummySite. When a DummySite is created with a website_url, the controller downloads the site's HTML and serves it using an Nginx Deployment in the cluster.
