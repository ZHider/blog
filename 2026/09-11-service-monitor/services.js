/**
 * 服务注册表 —— 纯数据，无逻辑、无 DOM。
 *
 * 新增一个被监控的服务，只需在 SERVICES 里加一条记录，
 * 页面切换按钮、探测逻辑、明细展示都会自动跟上，不需要改其它文件。
 *
 * 字段说明：
 *   id          唯一标识，事件与 DOM 都用它（小写英文）
 *   name        切换按钮上显示的名字
 *   url         探测地址（浏览器会真实请求它）
 *   desc        一句话说明（可选，显示在大色块右侧）
 *   expectText  响应体应包含的文本，不匹配则判定「响应异常」（可选，仅在 CORS 可用时可校验）
 *   slowMs      超过该耗时判定「延迟偏高」，默认 800
 *   timeout     超时毫秒数，默认 8000
 *   cacheBust   是否追加 _ts 参数绕过缓存，默认 true
 *               （缓存命中的请求 Resource Timing 耗时为 0，测不出真实延迟）
 *
 * 探测方式说明：
 *   优先用 CORS 请求（可读状态码与响应体）；若目标未开放 CORS，
 *   自动退化为 no-cors 不透明请求，此时只能确认「可达」，状态码与内容无法校验。
 */
export const SERVICES = [
  {
    id: "subconverter",
    name: "subconverter",
    url: "https://sub.ivandspc.top/version",
    desc: "订阅转换后端 · 版本接口",
    expectText: "subconverter",
    slowMs: 800,
    timeout: 8000,
    cacheBust: true
  }
];

/** 首次打开页面时默认选中的服务 */
export const DEFAULT_SERVICE_ID = "subconverter";
