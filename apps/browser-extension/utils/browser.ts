import type { BrowserType } from "api-types";

export function detectBrowser(): BrowserType {
  const userAgent = navigator.userAgent.toLocaleLowerCase();

  // 检查是否为 Chrome
  if (userAgent.includes("chrome")) {
    return "1"
  }

  // 检查是否为 Edge
  if (userAgent.includes("edge")) {
    return "2"
  }

  // 其他浏览器
  return "0"
}
