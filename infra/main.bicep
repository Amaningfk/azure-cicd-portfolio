@description('Name of the static web app. Must be globally unique.')
param appName string

@description('Azure region. Static Web Apps supports a limited set of regions.')
@allowed([
  'centralus'
  'eastus2'
  'westus2'
  'westeurope'
  'eastasia'
])
param location string = 'centralus'

@description('Free or Standard. Free is enough for a portfolio or a small brochure site.')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('Environment label applied as a tag, so costs can be split per environment.')
param environment string = 'production'

var tags = {
  project: 'azure-cicd-portfolio'
  environment: environment
  managedBy: 'bicep'
}

resource staticSite 'Microsoft.Web/staticSites@2023-12-01' = {
  name: appName
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
}

output staticSiteId string = staticSite.id
output defaultHostname string = staticSite.properties.defaultHostname
