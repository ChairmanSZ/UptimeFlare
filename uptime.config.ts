// UptimeFlare 配置 —— 已清理模板占位符（示例监控、假 webhook、错误 maintenance）
// 字段全量说明见同目录 uptime.config.full.ts，或 Wiki:
// https://github.com/lyc8503/UptimeFlare/wiki/Configuration

// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  // 状态页标题（浏览器标签页、页头都取这里）
  title: 'Tenyunw 拨测状态页',
  // 页头右上角链接，highlight: true 会显示成高亮按钮
  links: [{ link: 'https://dev.abyssai.sg/', label: 'Blog', highlight: true }],
  // [可选] 监控分组。只有 2 个监控时没必要；多了以后可以按业务分组
  // 注意：一旦配置了 group，没列进去的 monitor 会在页面上隐藏（但仍在后台探测）
  // group: {
  //   '🌐 站点': ['abyssai_site'],
  //   '🔌 网关': ['tenyunw_llm_api'],
  // },
}

const workerConfig: WorkerConfig = {
  // [可选] 状态未变化时最多每 N 分钟写一次 D1，默认 3，用于压低写入量
  // kvWriteCooldownMinutes: 3,

  monitors: [
    // 站点可达性：HTTP GET，返回 200 视为正常
    {
      id: 'abyssai_site',
      name: 'dev.abyssai.sg',
      method: 'GET',
      target: 'https://dev.abyssai.sg/',
      statusPageLink: 'https://dev.abyssai.sg/',
      tooltip: 'HTTP GET，期望 200',
      expectedCodes: [200],
      timeout: 10000,
      headers: {
        'User-Agent': 'Uptimeflare',
      },
      // 从东北亚机房发起探测（DurableObject locationHint，可选项只有区域：
      // wnam / enam / sam / weur / eeur / apac / apac-ne / apac-se / oc / afr / me）
      // 只对小写区域参数生效，不能填 hkg / pek 这类机场三字码；
      // 实际落在哪个 colo，以状态页显示的 location 为准
      checkProxy: 'worker://apac-ne',
      // 指定区域不可用时，回落到 cron 所在机房再测一次
      checkProxyFallback: true,
    },
    // 大模型网关端口连通性：TCP 探测，只证明端口开着（不校验 HTTP 状态）
    {
      id: 'tenyunw_llm_api',
      name: 'Tenyunw LLM API (112.90.156.82:61180)',
      method: 'TCP_PING',
      target: '112.90.156.82:61180',
      tooltip: 'TCP 端口探测，5 秒超时',
      timeout: 5000,
      // 同样从东北亚机房发起（TCP_PING 也支持 checkProxy）
      checkProxy: 'worker://apac-ne',
      checkProxyFallback: true,
    },

    // ---- 需要校验接口真实响应时，把下面这段打开并按需改写 ----
    // ⚠️ 本文件会随仓库公开（ChairmanSZ/UptimeFlare 目前是 public），
    //    不要把真实 API Key 写进来；确实要带鉴权头，先把仓库改成 private。
    // {
    //   id: 'tenyunw_llm_api_http',
    //   name: 'Tenyunw LLM API (HTTP)',
    //   method: 'POST',
    //   target: 'http://112.90.156.82:61180/v1/chat/completions',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer <填你的 key>',
    //   },
    //   body: '{"model":"<模型名>","messages":[{"role":"user","content":"ping"}],"max_tokens":1}',
    //   // 无鉴权时接口通常返回 401，所以把 401 也算作“服务活着”
    //   expectedCodes: [200, 401],
    //   timeout: 15000,
    //   // [可选] 指定探测地区（需额外配置 check proxy），见 Wiki: Check-proxy-setup
    //   // checkProxy: 'worker://weur',
    //   // checkProxyFallback: true,
    // },
  ],

  // [可选] 通知设置。暂时留空（不接 webhook），状态页照常工作
  notification: {
    timeZone: 'Asia/Shanghai',
    // 连续 N 分钟异常后才发通知，避免抖动误报
    gracePeriod: 5,
    // 要接告警时取消注释并填入真实地址（Telegram / 钉钉 / Bark / 企业微信 均可，见 Wiki）
    // webhook: {
    //   url: 'https://api.telegram.org/bot<BOT_TOKEN>/sendMessage',
    //   method: 'POST',
    //   payloadType: 'x-www-form-urlencoded',
    //   payload: {
    //     chat_id: <CHAT_ID>,
    //     text: '$MSG',
    //   },
    //   timeout: 10000,
    // },
    // [可选] 只想让部分监控发通知时，列出它们的 id
    // skipNotificationIds: [],
    // [可选] 同一次故障中错误信息变化时不重复发通知
    // skipErrorChangeNotification: true,
  },
}

// 计划维护：平时保持空数组（页面不会出现维护横幅）
const maintenances: MaintenanceConfig[] = []
// 需要时按下面格式补一条（时间段内不告警，页头显示维护提示）
// const maintenances: MaintenanceConfig[] = [
//   {
//     monitors: ['abyssai_site'],
//     title: '计划维护：站点升级',
//     body: '预计 30 分钟，期间状态页可能出现抖动',
//     start: '2026-11-01T02:00:00+08:00',
//     end: '2026-11-01T02:30:00+08:00',
//     color: 'blue',
//   },
// ]

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
