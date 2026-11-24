variable "app_name" {
  description = "Name of the static web app. Must be globally unique."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group to create and deploy into."
  type        = string
  default     = "rg-portfolio"
}

variable "location" {
  description = "Azure region. Static Web Apps supports a limited set."
  type        = string
  default     = "centralus"

  validation {
    condition     = contains(["centralus", "eastus2", "westus2", "westeurope", "eastasia"], var.location)
    error_message = "location must be one of: centralus, eastus2, westus2, westeurope, eastasia."
  }
}

variable "sku_tier" {
  description = "Free or Standard. Free is enough for a portfolio or brochure site."
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "sku_tier must be Free or Standard."
  }
}

variable "environment" {
  description = "Environment label applied as a tag, so costs can be split per environment."
  type        = string
  default     = "production"
}
