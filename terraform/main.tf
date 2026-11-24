locals {
  tags = {
    project     = "azure-cicd-portfolio"
    environment = var.environment
    managedBy   = "terraform"
  }
}

resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

resource "azurerm_static_web_app" "this" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_tier
  tags                = local.tags
}
