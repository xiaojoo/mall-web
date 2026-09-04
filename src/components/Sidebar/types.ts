export interface TreeItem {
  id: string | number
  label: string
  children?: TreeItem[]
  expanded?: boolean
  icon?: string
}
