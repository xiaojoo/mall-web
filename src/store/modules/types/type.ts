/** 侧边栏菜单项（由后端 /sys/menu/nav 构建，非真实路由，仅用于菜单渲染） */
export interface SidebarMenuItem {
  path: string
  name: string
  meta: {
    title: string
    icon?: string
    perms?: string
  }
  children?: SidebarMenuItem[]
}

export interface UserState {
  token: string | null
  menuRoutes: SidebarMenuItem[]
  username: string
  avatar: string
  perms: string[]
}

export interface CatBrandState {
  catPath: number[]
  brandId: number
}
