export const openOptionsPage = (pathOrHash: string) => {
  const optionsUrl = chrome.runtime.getURL("options.html")
  chrome.tabs.create({ url: `${optionsUrl}${pathOrHash}` })
}
