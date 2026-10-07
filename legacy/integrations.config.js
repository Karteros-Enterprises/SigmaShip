/*
 * SigmaShip integration catalogue
 *
 * Provider-issued credentials are intentionally blank. Public identifiers may
 * live in configuration later; client secrets and access tokens must only be
 * stored by the SigmaShip backend/secret vault.
 */
window.SIGMASHIP_INTEGRATIONS = {
  amazon: {
    name: 'Amazon',
    domain: 'amazon.com',
    type: 'OAuth 2.0 / SP-API',
    accountLabel: 'Amazon Seller account',
    fields: [
      ['Application / Client ID', 'clientId', ''],
      ['OAuth redirect URI', 'redirectUri', ''],
      ['SP-API application ID', 'applicationId', ''],
      ['AWS role / IAM reference', 'awsRole', '']
    ],
    secretFields: ['Client secret', 'LWA refresh token'],
    permissions: ['Orders', 'Shipping / fulfillment', 'Merchant information'],
    notes: 'Register SigmaShip as an Amazon SP-API application and complete the required Amazon solution-provider approval.'
  },
  bluelink: {
    name: 'BlueLink',
    domain: 'bluelinkerp.com',
    type: 'Web Services / REST',
    accountLabel: 'BlueLink ERP environment',
    fields: [
      ['BlueLink server / API URL', 'baseUrl', ''],
      ['Company / database identifier', 'companyId', ''],
      ['API username', 'username', '']
    ],
    secretFields: ['API password / token'],
    permissions: ['Orders', 'Customers / addresses', 'Inventory', 'Shipment updates'],
    notes: 'BlueLink access is customer-environment specific. Web Services/API access must be enabled for the merchant.'
  },
  shopify: {
    name: 'Shopify',
    domain: 'shopify.com',
    type: 'OAuth / GraphQL Admin API',
    accountLabel: 'Shopify store',
    fields: [
      ['Client ID', 'clientId', ''],
      ['App URL', 'appUrl', ''],
      ['OAuth redirect URI', 'redirectUri', '']
    ],
    secretFields: ['Client secret'],
    permissions: ['read_orders', 'read_fulfillments', 'write_fulfillments', 'read_locations'],
    notes: 'Build GraphQL-first and request protected customer data access when required.'
  },
  woocommerce: {
    name: 'WooCommerce',
    domain: 'woocommerce.com',
    type: 'REST API authorization',
    accountLabel: 'WooCommerce store',
    fields: [
      ['Store URL', 'storeUrl', ''],
      ['Callback URL', 'callbackUrl', ''],
      ['Return URL', 'returnUrl', '']
    ],
    secretFields: ['Consumer key', 'Consumer secret'],
    permissions: ['Orders read/write', 'Webhooks', 'Customers / shipping addresses'],
    notes: 'The merchant authorizes SigmaShip from WooCommerce. Generated API credentials must be stored server-side.'
  },
  wix: {
    name: 'Wix',
    domain: 'wix.com',
    type: 'OAuth 2.0 / Wix App',
    accountLabel: 'Wix site',
    fields: [
      ['App ID', 'appId', ''],
      ['Redirect URL', 'redirectUri', '']
    ],
    secretFields: ['App secret', 'Refresh token'],
    permissions: ['Read Orders', 'Manage Orders', 'Fulfillments', 'Webhooks'],
    notes: 'Create a Wix app with order and fulfillment permissions and subscribe to order events.'
  },
  bigcommerce: {
    name: 'BigCommerce',
    domain: 'bigcommerce.com',
    type: 'OAuth / BigCommerce App',
    accountLabel: 'BigCommerce store',
    fields: [
      ['Client ID', 'clientId', ''],
      ['Auth callback URL', 'authCallback', ''],
      ['Load callback URL', 'loadCallback', ''],
      ['Uninstall callback URL', 'uninstallCallback', '']
    ],
    secretFields: ['Client secret', 'Access token'],
    permissions: ['Orders', 'Customers', 'Products', 'Shipping / shipments', 'Webhooks'],
    notes: 'Use an installable BigCommerce app and subscribe to order lifecycle webhooks.'
  },
  magento2: {
    name: 'Magento 2',
    domain: 'adobe.com',
    type: 'Adobe Commerce / Magento integration',
    accountLabel: 'Magento / Adobe Commerce store',
    fields: [
      ['Store base URL', 'baseUrl', ''],
      ['Integration name', 'integrationName', 'SigmaShip'],
      ['Authentication mode', 'authMode', 'OAuth integration']
    ],
    secretFields: ['Consumer key', 'Consumer secret', 'Access token', 'Access token secret'],
    permissions: ['Sales orders', 'Shipments', 'Customers / addresses'],
    notes: 'Authentication varies by Magento/Adobe Commerce deployment. Keep OAuth credentials in the backend vault.'
  },
  lightspeed: {
    name: 'Lightspeed',
    domain: 'lightspeedhq.com',
    type: 'OAuth 2.0',
    accountLabel: 'Lightspeed Retail account',
    fields: [
      ['Client ID', 'clientId', ''],
      ['Redirect URI', 'redirectUri', '']
    ],
    secretFields: ['Client secret', 'Refresh token'],
    permissions: ['sales:read', 'fulfillments:read', 'fulfillments:write', 'webhooks'],
    notes: 'Register a Lightspeed application and request only the scopes SigmaShip needs.'
  },
  squarespace: {
    name: 'Squarespace',
    domain: 'squarespace.com',
    type: 'OAuth / Commerce APIs',
    accountLabel: 'Squarespace site',
    fields: [
      ['Client ID', 'clientId', ''],
      ['Redirect URI', 'redirectUri', ''],
      ['Webhook endpoint', 'webhookUrl', '']
    ],
    secretFields: ['Client secret', 'Refresh token'],
    permissions: ['website.orders', 'Order webhooks', 'Fulfillment updates'],
    notes: 'Subscribe to order create/update events and send carrier/tracking data through fulfillment APIs.'
  },
  ecwid: {
    name: 'Ecwid',
    domain: 'ecwid.com',
    type: 'Ecwid App / REST API',
    accountLabel: 'Ecwid store',
    fields: [
      ['Application client ID', 'clientId', ''],
      ['Redirect URI', 'redirectUri', ''],
      ['Store ID', 'storeId', '']
    ],
    secretFields: ['Client secret', 'Access token'],
    permissions: ['Orders', 'Customers / addresses', 'Order fulfillment / tracking', 'Webhooks'],
    notes: 'Final production scopes should be confirmed against the Ecwid app approval granted to SigmaShip.'
  },
  temu: {
    name: 'Temu',
    domain: 'temu.com',
    type: 'Temu Open Platform / Partner authorization',
    accountLabel: 'Temu seller account',
    fields: [
      ['App key / application ID', 'appKey', ''],
      ['Authorization callback URL', 'redirectUri', ''],
      ['Seller region', 'region', '']
    ],
    secretFields: ['App secret', 'Seller access token'],
    permissions: ['Orders', 'Seller authorization', 'Shipment / tracking updates'],
    notes: 'SigmaShip must obtain Temu partner/ISV access. Available APIs and authorization can vary by seller region.'
  },
  etsy: {
    name: 'Etsy',
    domain: 'etsy.com',
    type: 'OAuth 2.0 Authorization Code + PKCE',
    accountLabel: 'Etsy shop',
    fields: [
      ['API key / keystring', 'clientId', ''],
      ['OAuth redirect URI', 'redirectUri', '']
    ],
    secretFields: ['Shared secret', 'Refresh token'],
    permissions: ['transactions_r', 'transactions_w', 'shops_r'],
    notes: 'Use PKCE for authorization and write receipt tracking after SigmaShip purchases a label.'
  },
  walmart: {
    name: 'Walmart',
    domain: 'walmart.com',
    type: 'Marketplace API / Solution Provider OAuth',
    accountLabel: 'Walmart Marketplace seller',
    fields: [
      ['Client ID', 'clientId', ''],
      ['Redirect URI', 'redirectUri', ''],
      ['Marketplace / region', 'marketplace', '']
    ],
    secretFields: ['Client secret', 'Access / refresh token'],
    permissions: ['Orders', 'Acknowledge orders', 'Shipping / tracking', 'Seller account'],
    notes: 'For multi-merchant use, SigmaShip should onboard as an approved Walmart solution provider. Canada and U.S. requirements can differ.'
  },
  bestbuy: {
    name: 'Best Buy',
    domain: 'bestbuy.ca',
    type: 'Marketplace / Mirakl API',
    accountLabel: 'Best Buy Marketplace seller',
    fields: [
      ['Marketplace API URL', 'baseUrl', ''],
      ['Shop / seller ID', 'sellerId', '']
    ],
    secretFields: ['Mirakl / marketplace API key'],
    permissions: ['Orders', 'Shipments', 'Tracking', 'Seller operations'],
    notes: 'Best Buy Canada marketplace integrations use marketplace/Mirakl access issued to the seller or approved integration partner.'
  },
  ebay: {
    name: 'eBay',
    domain: 'ebay.com',
    type: 'OAuth 2.0 / Sell Fulfillment API',
    accountLabel: 'eBay seller account',
    fields: [
      ['Client ID (App ID)', 'clientId', ''],
      ['RuName / redirect URI', 'redirectUri', '']
    ],
    secretFields: ['Client secret (Cert ID)', 'Refresh token'],
    permissions: ['sell.fulfillment', 'Order retrieval', 'Shipping fulfillment', 'Notifications'],
    notes: 'Authorize each seller account and create shipping fulfillments with carrier and tracking after label purchase.'
  },
  reverb: {
    name: 'Reverb',
    domain: 'reverb.com',
    type: 'Reverb API',
    accountLabel: 'Reverb shop',
    fields: [
      ['Application / client ID', 'clientId', ''],
      ['Redirect URI', 'redirectUri', '']
    ],
    secretFields: ['Client secret / API token'],
    permissions: ['Orders', 'Shop information', 'Mark order shipped', 'Tracking'],
    notes: 'SigmaShip needs Reverb API application access. Shipment updates include provider and tracking number.'
  },
  reebelo: {
    name: 'Reebelo',
    domain: 'reebelo.com',
    type: 'Vendor API',
    accountLabel: 'Reebelo vendor account',
    fields: [
      ['Vendor / seller identifier', 'sellerId', ''],
      ['API base URL', 'baseUrl', '']
    ],
    secretFields: ['Vendor API key'],
    permissions: ['Orders', 'Order details', 'Carrier / tracking updates'],
    notes: 'Reebelo vendor API access is issued to approved vendors. Keep the API key exclusively in SigmaShip server-side secrets.'
  }
};

// Amazon Marketplace uses the same SP-API connection as the Amazon sales-channel card.
window.SIGMASHIP_INTEGRATIONS['amazon-marketplace'] = window.SIGMASHIP_INTEGRATIONS.amazon;
