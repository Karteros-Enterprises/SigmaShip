export interface NavigationItem {
  label: string
  icon: string
  to: string
  badge?: string
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}
