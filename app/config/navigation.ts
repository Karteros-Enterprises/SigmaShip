import type { NavigationGroup } from '~/types/navigation'

// Keep navigation limited to implemented routes; add links as features ship.
export const portalNavigation: NavigationGroup[] = [
  {
    label: 'Shipping',
    items: [
      { label: 'Ship', icon: 'i-lucide-package-plus', to: '/ship' }
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
  }
]
