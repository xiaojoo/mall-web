import type { RouteRecordRaw } from 'vue-router'

export const constantRoute: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录',
      hidden: true,
      icon: 'MostlyCloudy',
      open: false,
    },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    name: 'layout',
    meta: {
      title: '首页',
      icon: 'House',
    },
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          icon: 'House',
          // 隐藏子路由：父级作为扁平一级菜单直接跳转
          hidden: true,
        },
      },
    ],
  },
  {
    path: '/acl',
    component: () => import('@/layout/index.vue'),
    name: 'Acl',
    meta: {
      title: '权限管理',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/role',
    children: [
      {
        path: '/role',
        component: () => import('@/views/acl/role/index.vue'),
        name: 'Role',
        meta: {
          title: '角色管理',
          icon: 'User',
          perms: 'sys:role:list',
        },
      },
      {
        path: '/user',
        component: () => import('@/views/acl/user/index.vue'),
        name: 'User',
        meta: {
          title: '用户管理',
          icon: 'View',
          perms: 'sys:user:list',
        },
      },
      {
        path: '/menu',
        component: () => import('@/views/acl/menu/index.vue'),
        name: 'Menu',
        meta: {
          title: '菜单管理',
          icon: 'IconMenu',
          perms: 'sys:menu:list',
        },
      },
      {
        path: '/log',
        component: () => import('@/views/acl/log/index.vue'),
        name: 'Log',
        meta: {
          title: '操作日志',
          icon: 'Document',
          perms: 'sys:log:list',
        },
      },
    ],
  },
  {
    path: '/product',
    component: () => import('@/layout/index.vue'),
    name: 'Product',
    meta: {
      title: '商品管理',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/category',
    children: [
      {
        path: '/category',
        component: () => import('@/views/product/category/index.vue'),
        name: 'Category',
        meta: {
          title: '分类管理',
          icon: 'IconMenu',
          perms: 'product:category:list',
        },
      },
      {
        path: '/trademark',
        component: () => import('@/views/product/trademark/index.vue'),
        name: 'Trademark',
        meta: {
          title: '品牌管理',
          icon: 'IconMenu',
          perms: 'product:brand:list',
        },
      },
      {
        path: '/attrgroup',
        name: '平台属性',
        meta: {
          title: '平台属性',
          icon: 'Setting',
        },
        redirect: '/attrgroup',
        children: [
          {
            path: '/attrgroup',
            component: () => import('@/views/product/attrgroup/index.vue'),
            name: '属性分组',
            meta: {
              title: '属性分组',
              icon: 'Setting',
              perms: 'product:attrgroup:list',
            },
          },
          {
            path: '/baseattr',
            component: () => import('@/views/product/baseattr/index.vue'),
            name: '规则参数',
            meta: {
              title: '规则参数',
              icon: 'Setting',
              perms: 'product:baseattr:list',
            },
          },
          {
            path: '/saleattr',
            component: () => import('@/views/product/saleattr/index.vue'),
            name: '销售属性',
            meta: {
              title: '销售属性',
              icon: 'Setting',
              perms: 'product:saleattr:list',
            },
          },
        ],
      },
      {
        path: '/spu',
        name: '商品维护',
        meta: {
          title: '商品维护',
          icon: 'Setting',
        },
        redirect: '/index',
        children: [
          {
            path: '/index',
            component: () => import('@/views/product/spu/index.vue'),
            name: 'SPU管理',
            meta: {
              title: 'SPU管理',
              icon: 'Setting',
              perms: 'product:spu:list',
            },
          },
          {
            path: '/add',
            component: () => import('@/views/product/spu/add.vue'),
            name: '发布商品',
            meta: {
              title: '发布商品',
              icon: 'Setting',
              perms: 'product:spu:add',
            },
          },
          {
            path: '/manager',
            component: () => import('@/views/product/spu/manager.vue'),
            name: '商品管理',
            meta: {
              title: '商品管理',
              icon: 'Setting',
              perms: 'product:manager:list',
            },
          },
          {
            path: '/batchPublish',
            component: () => import('@/views/product/spu/batchPublish.vue'),
            name: '批量发布商品',
            meta: {
              title: '批量发布商品',
              icon: 'Setting',
              perms: 'product:spu:add',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/order',
    component: () => import('@/layout/index.vue'),
    name: 'Order',
    meta: {
      title: '订单管理',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/orderlist',
    children: [
      {
        path: '/orderlist',
        component: () => import('@/views/order/order/index.vue'),
        name: 'OrderList',
        meta: {
          title: '订单列表',
          icon: 'IconMenu',
          perms: 'order:order:list',
        },
      },
      {
        path: '/orderreturnapply',
        component: () => import('@/views/order/orderreturnapply/index.vue'),
        name: 'OrderReturnApply',
        meta: {
          title: '售后申请',
          icon: 'IconMenu',
          perms: 'order:orderreturnapply:list',
        },
      },
    ],
  },
  {
    path: '/ware',
    component: () => import('@/layout/index.vue'),
    name: 'Ware',
    meta: {
      title: '库存系统',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/wareinfo',
    children: [
      {
        path: '/wareinfo',
        component: () => import('@/views/ware/wareinfo/index.vue'),
        name: 'Wareinfo',
        meta: {
          title: '仓库维护',
          icon: 'User',
          perms: 'ware:wareinfo:list',
        },
      },
      {
        path: '/sku',
        component: () => import('@/views/ware/sku/index.vue'),
        name: 'Sku',
        meta: {
          title: '商品库存',
          icon: 'View',
          perms: 'ware:sku:list',
        },
      },
      {
        path: '/task',
        component: () => import('@/views/ware/task/index.vue'),
        name: 'Task',
        meta: {
          title: '库存工作单',
          icon: 'IconMenu',
          perms: 'ware:task:list',
        },
      },
      {
        path: '/purchaseitem',
        name: '采购单维护',
        meta: {
          title: '采购单维护',
          icon: 'Setting',
        },
        redirect: '/purchaseitem',
        children: [
          {
            path: '/purchaseitem',
            component: () => import('@/views/ware/purchaseitem/index.vue'),
            name: 'Purchaseitem',
            meta: {
              title: '采购需求',
              icon: 'Setting',
              perms: 'ware:purchaseitem:list',
            },
          },
          {
            path: '/purchase',
            component: () => import('@/views/ware/purchase/index.vue'),
            name: 'Purchase',
            meta: {
              title: '采购单',
              icon: 'Setting',
              perms: 'ware:purchase:list',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/member',
    component: () => import('@/layout/index.vue'),
    name: '会员系统',
    meta: {
      title: '会员系统',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/member',
    children: [
      {
        path: '/member',
        component: () => import('@/views/member/member/index.vue'),
        name: 'Member',
        meta: {
          title: '会员列表',
          icon: 'User',
          perms: 'member:member:list',
        },
      },
      {
        path: '/level',
        component: () => import('@/views/member/level/index.vue'),
        name: 'Level',
        meta: {
          title: '会员等级',
          icon: 'View',
          perms: 'member:level:list',
        },
      },
    ],
  },
  {
    path: '/coupon',
    component: () => import('@/layout/index.vue'),
    name: '优惠营销',
    meta: {
      title: '优惠营销',
      hidden: true,
      icon: 'Lock',
    },
    redirect: '/coupon',
    children: [
      {
        path: '/coupon',
        component: () => import('@/views/coupon/coupon/index.vue'),
        name: 'Coupon',
        meta: {
          title: '优惠券管理',
          icon: 'User',
          perms: 'coupon:coupon:list',
        },
      },
      {
        path: '/history',
        component: () => import('@/views/coupon/history/index.vue'),
        name: 'History',
        meta: {
          title: '发放记录',
          icon: 'View',
          perms: 'coupon:history:list',
        },
      },
      {
        path: '/subject',
        component: () => import('@/views/coupon/subject/index.vue'),
        name: 'Subject',
        meta: {
          title: '专题活动',
          icon: 'View',
          perms: 'coupon:subject:list',
        },
      },
      {
        path: '/seckill',
        component: () => import('@/views/coupon/seckill/index.vue'),
        name: 'Seckill',
        meta: {
          title: '秒杀活动',
          icon: 'View',
          perms: 'coupon:seckill:list',
        },
      },
      {
        path: '/bounds',
        component: () => import('@/views/coupon/bounds/index.vue'),
        name: 'Bounds',
        meta: {
          title: '积分维护',
          icon: 'View',
          perms: 'coupon:bounds:list',
        },
      },
      {
        path: '/full',
        component: () => import('@/views/coupon/full/index.vue'),
        name: 'Full',
        meta: {
          title: '满减折扣',
          icon: 'View',
          perms: 'coupon:full:list',
        },
      },
      {
        path: '/memberprice',
        component: () => import('@/views/coupon/memberprice/index.vue'),
        name: 'Memberprice',
        meta: {
          title: '会员价格',
          icon: 'View',
          perms: 'coupon:memberprice:list',
        },
      },
      {
        path: '/seckillsession',
        component: () => import('@/views/coupon/seckillsession/index.vue'),
        name: 'Seckillsession',
        meta: {
          title: '每日秒杀',
          icon: 'View',
          perms: 'coupon:seckillsession:list',
        },
      },
      {
        path: '/seckillskurelation',
        component: () => import('@/views/coupon/seckillsession/relation.vue'),
        name: 'Seckillskurelation',
        meta: {
          title: '关联秒杀商品',
          icon: 'View',
          perms: 'coupon:seckillsession:list',
        },
      },
      {
        path: '/skuladder',
        component: () => import('@/views/coupon/skuladder/index.vue'),
        name: 'Skuladder',
        meta: {
          title: '阶梯折扣',
          icon: 'View',
          perms: 'coupon:skuladder:list',
        },
      },
      {
        path: '/homeadv',
        component: () => import('@/views/coupon/homeadv/index.vue'),
        name: 'Homeadv',
        meta: {
          title: '首页广告',
          icon: 'View',
          perms: 'coupon:homeadv:list',
        },
      },
      {
        path: '/homesubjectspu',
        component: () => import('@/views/coupon/homesubjectspu/index.vue'),
        name: 'Homesubjectspu',
        meta: {
          title: 'SPU专题',
          icon: 'View',
          perms: 'coupon:homesubjectspu:list',
        },
      },
      {
        path: '/seckillskunotice',
        component: () => import('@/views/coupon/seckillskunotice/index.vue'),
        name: 'Seckillskunotice',
        meta: {
          title: '秒杀配置',
          icon: 'View',
          perms: 'coupon:seckillskunotice:list',
        },
      },
      {
        path: '/skuladder',
        component: () => import('@/views/coupon/skuladder/index.vue'),
        name: 'Skuladder',
        meta: {
          title: '打折优惠',
          icon: 'View',
          perms: 'coupon:skuladder:list',
        },
      },
    ],
  },
  {
    path: '/content',
    component: () => import('@/layout/index.vue'),
    name: '内容管理',
    meta: {
      title: '内容管理',
      hidden: true,
      icon: 'content',
    },
    redirect: '/carousel',
    children: [
      {
        path: '/carousel',
        component: () => import('@/views/content/carousel/index.vue'),
        name: 'Carousel',
        meta: {
          title: '轮播图管理',
          icon: 'carousel',
          perms: 'content:carousel:list',
        },
      },
      {
        path: '/ticker',
        component: () => import('@/views/content/ticker/index.vue'),
        name: 'Ticker',
        meta: {
          title: '跑马灯管理',
          icon: 'ticker',
          perms: 'content:ticker:list',
        },
      },
      {
        path: '/promo',
        component: () => import('@/views/content/promo/index.vue'),
        name: 'Promo',
        meta: {
          title: '大促管理',
          icon: 'promo',
          perms: 'content:promo:list',
        },
      },
      {
        path: '/footerlink',
        component: () => import('@/views/content/footerlink/index.vue'),
        name: 'FooterLink',
        meta: {
          title: '页脚链接',
          icon: 'promo',
          perms: 'content:footerlink:list',
        },
      },
      {
        path: '/homenav',
        component: () => import('@/views/content/homenav/index.vue'),
        name: 'HomeNav',
        meta: {
          title: '首页快捷导航',
          icon: 'promo',
          perms: 'content:homenav:list',
        },
      },
    ],
  },
  {
    path: '/schedule',
    component: () => import('@/layout/index.vue'),
    name: '任务调度',
    meta: {
      title: '任务调度',
      hidden: true,
      icon: 'Lock',
      perms: 'sys:schedule:list',
    },
    redirect: '/schedule',
    children: [
      {
        path: '/schedule',
        component: () => import('@/views/schedule/schedule/index.vue'),
        name: 'Schedule',
        meta: {
          title: '任务调度',
          icon: 'User',
          perms: 'sys:schedule:list',
        },
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/404/index.vue'),
    name: '404',
    meta: {
      title: '404',
      hidden: true,
      icon: 'Connection',
    },
  },
  {
    path: '/:pathMatch(.*)*', // 捕获所有未定义的路由
    component: () => import('@/views/404/index.vue'),
    name: 'Any',
    meta: {
      title: '任意路由',
      hidden: true,
      icon: 'Cloudy',
    },
  },
]
