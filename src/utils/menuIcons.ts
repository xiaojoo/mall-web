/**
 * 菜单图标注册表
 *
 * 侧边栏/菜单管理共用：把「菜单管理」里配置的 icon 字符串（sys_menu.icon）
 * 映射为可渲染的 element-plus 图标组件。
 *
 * - 前半部分是当前菜单数据（db/sys_permission*.sql）使用的**规范图标名**，
 *   每个图标对应一个唯一组件（2026-08-19 已全量去重，父子不共用）；
 * - 后半部分是历史别名（旧菜单数据 / routes.ts 遗留值），仅用于兼容渲染，
 *   选择器列表按组件去重后不会重复展示。
 *
 * 在「菜单管理 → 菜单图标」里能选到的名字 = MENU_ICON_NAMES（本注册表去重后的 key），
 * 保证配置什么名字、侧边栏就能渲染什么图标。
 */
import type { Component } from 'vue'
import {
  AlarmClock,
  Avatar,
  Bell,
  Box,
  CirclePlus,
  Clock,
  Coin,
  Collection,
  CollectionTag,
  Connection,
  Cloudy,
  Discount,
  Document,
  EditPen,
  Files,
  Flag,
  Folder,
  Goods,
  GoodsFilled,
  Grid,
  House,
  Lightning,
  List,
  Location,
  Lock,
  Medal,
  Memo,
  Menu,
  Money,
  Monitor,
  MostlyCloudy,
  Notification,
  OfficeBuilding,
  Operation,
  PriceTag,
  Picture,
  Present,
  Reading,
  RefreshLeft,
  Search,
  Sell,
  Setting,
  ShoppingBag,
  ShoppingCart,
  ShoppingCartFull,
  Stopwatch,
  SwitchButton,
  Ticket,
  Tickets,
  Timer,
  Tools,
  TrendCharts,
  Trophy,
  Unlock,
  User,
  UserFilled,
  View,
  Wallet,
} from '@element-plus/icons-vue'

/** 图标名 → 图标组件（key 即「菜单管理」可配置的图标名） */
export const menuIconMap: Record<string, Component> = {
  // —— 当前菜单规范图标（db/sys_permission*.sql，全局唯一） ——
  setting: Setting, // 系统管理
  goods: Goods, // 商品管理
  order: List, // 订单管理
  warehouse: OfficeBuilding, // 库存系统
  member: Avatar, // 会员系统
  coupon: Ticket, // 优惠营销
  schedule: Timer, // 任务调度
  user: User, // 用户管理
  role: UserFilled, // 角色管理
  menu: Menu, // 菜单管理
  log: Document, // 操作日志
  'shopping-bag': ShoppingBag, // 商品列表
  category: Grid, // 分类管理
  wallet: Wallet, // 订单列表
  refund: RefreshLeft, // 退款管理
  folder: Folder, // 分类管理
  brand: Medal, // 品牌管理
  attr: Operation, // 平台属性
  spu: GoodsFilled, // 商品维护
  group: Collection, // 属性分组
  tools: Tools, // 规则参数
  sell: Sell, // 销售属性
  edit: EditPen, // SPU管理
  add: CirclePlus, // 发布商品
  view: View, // 商品管理
  home: House, // 仓库维护
  box: Box, // 商品库存
  task: Memo, // 库存工作单
  purchase: ShoppingCart, // 采购单维护
  files: Files, // 采购需求
  price: PriceTag, // 采购单
  trend: TrendCharts, // 会员列表
  trophy: Trophy, // 会员等级
  discount: Discount, // 优惠券管理
  history: Clock, // 发放记录
  flag: Flag, // 专题活动
  seckill: Lightning, // 秒杀活动
  bounds: Coin, // 积分维护
  tickets: Tickets, // 满减折扣
  money: Money, // 会员价格
  'alarm-clock': AlarmClock, // 每日秒杀
  monitor: Monitor, // 首页广告
  'collection-tag': CollectionTag, // SPU专题
  'switch-button': SwitchButton, // 秒杀配置
  'shopping-cart-full': ShoppingCartFull, // 打折优惠
  stopwatch: Stopwatch, // 任务调度
  content: Reading, // 内容管理
  carousel: Picture, // 轮播图管理
  ticker: Bell, // 跑马灯管理

  // —— 历史别名（兼容旧菜单数据 / routes.ts 遗留值，仅渲染用） ——
  sku: Box,
  subject: Collection,
  full: Discount,
  config: Tools,
  level: Lock,
  'goods-list': Goods,
  'order-list': List,
  House,
  Lock,
  User,
  View,
  IconMenu: Menu,
  Setting,
  Document,
  Monitor,
  Notification,
  Connection,
  Cloudy,
  Unlock,
  MostlyCloudy,
  Location,
  Search,
}

/** 菜单管理里可选的图标名列表（按渲染组件去重，保证每个图标只出现一次） */
export const MENU_ICON_NAMES: string[] = (() => {
  const seen = new Set<Component>()
  const names: string[] = []
  for (const [name, comp] of Object.entries(menuIconMap)) {
    if (seen.has(comp)) {
      continue
    }
    seen.add(comp)
    names.push(name)
  }
  return names
})()

/** 未知/未配置图标时的兜底图标 */
const DEFAULT_ICON: Component = Menu

/** 按图标名解析为组件；未知名字返回兜底图标，保证侧边栏不空白 */
export function resolveMenuIcon(name?: string | null): Component {
  if (name && menuIconMap[name]) {
    return menuIconMap[name]
  }
  return DEFAULT_ICON
}
