import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/shared/api'
import { ORDER_STATUS } from '@/shared/utils/constants'

export function usePay() {
  const router = useRouter()
  const paying = ref(false)
  let pollTimer: number | null = null

  /** 停止轮询 */
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  /**
   * 启动轮询查询支付状态
   */
  function startPolling(orderNo: string) {
    let count = 0
    const MAX_RETRIES = 40
    const INTERVAL = 3000

    pollTimer = window.setInterval(async () => {
      count++

      if (count > MAX_RETRIES) {
        stopPolling()
        paying.value = false
        ElMessage.info('支付结果确认中，请稍后到我的订单查看')
        return
      }

      try {
        const status = await orderApi.getPayStatus(orderNo)

        if (status === ORDER_STATUS.BORROWING) {
          stopPolling()
          paying.value = false
          ElMessage.success('支付成功')
          router.push({ path: '/profile', query: { tab: 'bought' } })
          return
        }

        if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REJECTED) {
          stopPolling()
          paying.value = false
          ElMessage.warning(status === ORDER_STATUS.CANCELLED ? '订单已取消' : '订单已被拒绝')
          return
        }
      } catch {
        // 查询失败（网络抖动等），继续轮询，不中断
      }
    }, INTERVAL)
  }

  /**
   * 发起支付
   * @param orderNo 订单编号
   * @param version 订单版本号
   * @param win 已打开的空白窗口（可选，用于避免浏览器弹窗拦截）
   */
  async function startPay(orderNo: string, version: number, win?: Window | null) {
    paying.value = true

    try {
      const html = await orderApi.payBorrowOrder(orderNo, version)

      if (typeof html === 'string' && html.includes('form')) {
        // 启动轮询（在跳转前就开始）
        startPolling(orderNo)

        // 将支付宝表单写入窗口
        if (win) {
          win.document.write(html)
          win.document.close()
        } else {
          openAlipay(html)
        }
      } else if (html === 'SUCCESS') {
        paying.value = false
        ElMessage.success('支付成功')
        router.push({ path: '/profile', query: { tab: 'bought' } })
      } else {
        throw new Error('支付响应格式异常')
      }
    } catch (err: any) {
      paying.value = false
      throw err
    }
  }

  /**
   * 在新窗口打开支付宝收银台
   */
  function openAlipay(html: string) {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    } else {
      ElMessage.warning('请允许浏览器弹窗，否则无法完成支付')
    }
  }

  /**
   * 组件卸载时清理
   */
  function destroy() {
    stopPolling()
  }

  return {
    paying,
    startPay,
    stopPolling,
    destroy
  }
}
