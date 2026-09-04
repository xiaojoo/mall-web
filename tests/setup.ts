// 测试环境垫片：jsdom 未实现 scrollTo/scroll/scrollBy（vue-router 的
// scrollBehavior 会调用），不桩掉会打印一堆 "Not implemented" 噪音
if (typeof window !== 'undefined') {
  for (const name of ['scrollTo', 'scroll', 'scrollBy'] as const) {
    Object.defineProperty(window, name, {
      writable: true,
      value: () => {},
    })
  }
}
