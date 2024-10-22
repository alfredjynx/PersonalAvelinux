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



let domChangesLog = [];

// Fica esperando por mudanças no DOM
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'domChange') {
    // Guarda as mudanças do DOM numa lista interna (domChangesLog)
    domChangesLog = message.changes;

    // Optional: For debugging, log the changes in the background console
    console.log("DOM Changes logged:", domChangesLog);
  }
  
  // Espera o popup.js chamar e retorna a lista inteira de mudanças do DOM
  if (message.action === 'getDomChanges') {
    sendResponse({ changes: domChangesLog });
  }

  if (message.action === 'clearDomChanges') {
    domChangesLog = [];
    sendResponse({ success: true });
  }
});



let canvasFingerprintLogs = [];

// Espera informações do content.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'canvasFingerprint') {
    // Guarda tentativa
    canvasFingerprintLogs.push({
      method: message.method,
      url: message.url,
      timestamp: new Date().toLocaleTimeString()
    });

    console.log(`Canvas fingerprinting detected: ${message.method} on ${message.url}`);
  }

  // Envia resultados ao popup.js quando ele chama por getCanvasFingerprintLogs
  if (message.action === 'getCanvasFingerprintLogs') {
    sendResponse({ logs: canvasFingerprintLogs });
  }
});


function clearAllCookies() {
  browser.cookies.getAll({}).then((cookies) => {
    for (let cookie of cookies) {
      let removing = browser.cookies.remove({
        url: `https://${cookie.domain}${cookie.path}`,
        name: cookie.name
      });
      removing.then(() => {
        console.log(`Removed cookie: ${cookie.name}`);
      }).catch((error) => {
        console.error(`Error removing cookie: ${cookie.name}`, error);
      });
    }
  }).catch((error) => {
    console.error("Error fetching cookies:", error);
  });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clearCookies") {
    clearAllCookies();
    sendResponse({ success: true });
  }
});

