output "resource_group_name" {
  description = "Resource group holding the static web app."
  value       = azurerm_resource_group.this.name
}

output "static_web_app_id" {
  description = "Resource id of the static web app."
  value       = azurerm_static_web_app.this.id
}

output "default_hostname" {
  description = "Hostname the site is served from."
  value       = azurerm_static_web_app.this.default_host_name
}

output "deployment_token" {
  description = "Token for the deploy workflow. Store it as the AZURE_STATIC_WEB_APPS_API_TOKEN secret; never commit it."
  value       = azurerm_static_web_app.this.api_key
  sensitive   = true
}
