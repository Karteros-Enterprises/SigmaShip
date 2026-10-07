import type { NavigationGroup } from '~/types/navigation'

export const portalNavigation: NavigationGroup[] = [
  {
    label: 'Shipping',
    items: [
      { label: 'Ship', icon: 'i-lucide-package-plus', to: '/ship' },
      { label: 'Quote Shipment', icon: 'i-lucide-calculator', to: '/quotes/new' },
      { label: 'Saved Quotes', icon: 'i-lucide-bookmark', to: '/quotes' }
    ]
  },
  {
    label: 'Tracking',
    items: [
      { label: 'Tracking', icon: 'i-lucide-map-pin', to: '/tracking' }
    ]
  },
  {
    label: 'Pick Ups',
    items: [
      { label: 'Pick Ups', icon: 'i-lucide-truck', to: '/pickups' }
    ]
  },
  {
    label: 'Integrations',
    items: [
      { label: 'Integrations', icon: 'i-lucide-blocks', to: '/integrations' }
    ]
  },
  {
    label: 'Settings',
    items: [
      { label: 'Package Manager', icon: 'i-lucide-box', to: '/packages' },
      { label: 'Address Book', icon: 'i-lucide-contact', to: '/addresses' },
      { label: 'Carrier Accounts', icon: 'i-lucide-key-round', to: '/carrier-accounts' },
      { label: 'Default Settings', icon: 'i-lucide-settings-2', to: '/settings/defaults' }
    ]
  },
  {
    label: 'Support',
    items: [
      { label: 'Claims', icon: 'i-lucide-shield-alert', to: '/claims' },
      { label: 'Tickets', icon: 'i-lucide-life-buoy', to: '/tickets' }
    ]
  }
]
