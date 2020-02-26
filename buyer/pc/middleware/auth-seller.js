/**
 * 商家店铺鉴权
 * @param store
 * @param redirect
 * @param route
 * @returns {*}
 */
import { domain } from '@/ui-domain'
export default function ({ store, redirect, route }) {
  const { user } = store.getters;
  // 如果没有登录
  if (!user) {
    return redirect(`/login?forward=${route.fullPath}`)
  }
  // 如果登录了有店铺，跳转到商家中心
  if (user.have_shop) {
    return redirect(domain.seller)
  }
}
