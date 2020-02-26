/**
 * 路由鉴权
 * @param store
 * @param redirect
 * @param route
 * @returns {*}
 */
export default function ({ store, redirect, route }) {
  if (!store.getters.user && !route.fullPath.includes('/member/my-order/assemble')) {
    return redirect(`/login?forward=${route.fullPath}`)
  }
}
