// background.js
browser.action.onClicked.addListener((tab) => {
    browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });

let thirdPartyConnections = [];

function isThirdPartyRequest(requestUrl, tabUrl) {
  try {
    const requestDomain = new URL(requestUrl).hostname;
    const tabDomain = new URL(tabUrl).hostname;
    return requestDomain !== tabDomain;  // Return true if domains don't match (i.e., third-party)
  } catch (error) {
    console.error("Error parsing URL:", error);
    return false;
  }
}

browser.webRequest.onCompleted.addListener(
  (details) => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0) {
        const tabUrl = tabs[0].url;
        if (isThirdPartyRequest(details.url, tabUrl)) {
          // Add third-party connection to the list
          if (!thirdPartyConnections.includes(details.url)) {
            thirdPartyConnections.push(details.url);
          }
        }
      }
    });
  },
  { urls: ["<all_urls>"] }
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getThirdPartyConnections") {
    sendResponse({ data: thirdPartyConnections });
  }
});
