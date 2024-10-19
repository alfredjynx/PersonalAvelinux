browser.action.onClicked.addListener((tab) => {
    browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });

let thirdPartyConnections = [];

// Verifica se a conexão é de terceiro
function isThirdPartyRequest(requestUrl, tabUrl) {
  try {
    const requestDomain = new URL(requestUrl).hostname;
    const tabDomain = new URL(tabUrl).hostname;
    // Retorna como verdadeiro se as URLs não são iguais
    return requestDomain !== tabDomain; 
  } catch (error) {
    console.error("Error parsing URL:", error);
    return false;
  }
}

browser.tabs.onActivated.addListener((activeInfo) => {
  // Clear previous third-party connections when the tab changes
  thirdPartyConnections = [];
    // Verifica todas as chamadas dentro de uma tab do navegador (a atual)
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
});

// Quando o popup.js quer a lista de domains de terceiros, a função retorna todos os que estão presentes na página
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getThirdPartyConnections") {
    sendResponse({ data: thirdPartyConnections });
  }
});
