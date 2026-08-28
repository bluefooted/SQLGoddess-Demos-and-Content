targetScope = 'subscription'

@minLength(1)
param environmentName string

param location string = 'eastus'
param resourceGroupName string = 'PamDemos'
param allowedOrigins array = [
  'http://localhost:5173'
]

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' existing = {
  name: resourceGroupName
}

module api './resources.bicep' = {
  name: 'pawfect-match-${environmentName}'
  scope: resourceGroup
  params: {
    environmentName: environmentName
    location: location
    allowedOrigins: allowedOrigins
  }
}

output AZURE_LOCATION string = location
output AZURE_RESOURCE_GROUP_NAME string = resourceGroup.name
output SERVICE_API_NAME string = api.outputs.functionAppName
output SERVICE_API_URI string = api.outputs.functionAppUri
output FUNCTION_APP_PRINCIPAL_ID string = api.outputs.functionAppPrincipalId
