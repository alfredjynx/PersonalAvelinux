document.addEventListener('DOMContentLoaded', () => {

  // pega os elementos do arquivo HTML (popup.html) por meio dos IDs
  const storageButton = document.getElementById('showStorageButton');
  const storageList = document.getElementById('storageList');
  const storageNumber = document.getElementById('storageNumber');

  const thirdPartyButton = document.getElementById('showThirdPartyButton');
  const thirdPartyList = document.getElementById('thirdPartyList');
  const thirdPartyNumber = document.getElementById('thirdPartyNumber');
  
  const clearCookiesButton = document.getElementById('clearCookiesButton');

  const cookiesButton = document.getElementById('showCookiesButton'); 
  const firstPartyNumber = document.getElementById('firstPartyNumber');
  const thirdPartyCookieNumber = document.getElementById('thirdPartyCookieNumber'); 
  
  const domchangesList = document.getElementById('domChangesList');
  const DOMrefreshButton = document.getElementById('DOMrefreshButton');

  const clearDomButton = document.getElementById('DOMclearButton');


  clearCookiesButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'clearCookies' }).then((response) => {
      if (response.success) {
        firstPartyNumber.textContent = `First-party cookies: ${0}`;
        thirdPartyCookieNumber.textContent = `Third-party cookies: ${0}`;
        alert("All cookies have been cleared.");
      }
    }).catch((error) => {
      console.error("Error clearing cookies:", error);
    });
  });

  // Função que pega o domínio da URL da Tab aberta
  function getDomainFromUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  // Ativa quando clicado
  cookiesButton.addEventListener('click', () => {

    // verifica se o display de cookies já está ativado
    if (firstPartyNumber.style.display === 'none' && thirdPartyCookieNumber.style.display === 'none') {
      firstPartyNumber.style.display = 'block';
      thirdPartyCookieNumber.style.display = 'block';

      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tabUrl = tabs[0].url;
        const activeTabDomain = getDomainFromUrl(tabUrl);
  
        console.log("Active tab domain:", activeTabDomain);
  
        // Pega todos os cookies e filtra na hora
        browser.cookies.getAll({}).then(cookies => {
          let firstPartyCount = 0;
          let thirdPartyCount = 0;
  
          cookies.forEach(cookie => {
            if (cookie.domain.includes(activeTabDomain)) { // Use active tab's domain
              firstPartyCount++;
            } else {
              thirdPartyCount++;
            }
          });
  
          // Coloca os resultados nas caixas de texto HTML
          firstPartyNumber.textContent = `First-party cookies: ${firstPartyCount}`;
          thirdPartyCookieNumber.textContent = `Third-party cookies: ${thirdPartyCount}`;
        }).catch((error) => {
          console.error("Error fetching cookies:", error);
        });
      }).catch((error) => {
        console.error("Error fetching active tab domain:", error);
      });

    } else {
      firstPartyNumber.style.display = 'none';
      thirdPartyCookieNumber.style.display = 'none';
    }
  });


  // Quando há um click no botão de Storage, ativa
  storageButton.addEventListener('click', () => {

    // Verifica se a lista (no HTML) não estiver vizível
    if (storageList.style.display === 'none') {

      // Deixa a lista visível
      storageList.style.display = 'block';

      // Query pra API de browser que retorna as informações da tab atual do navegador
      // Pega apenas informações da tab atual onde a extensão foi ativada
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        
        // Pega a Tab atual do navegador
        let activeTab = tabs[0].id;

        // Query pra content.js que pega o storage local
        browser.tabs.sendMessage(activeTab, { action: "getLocalStorage" }).then((response) => {

          // Itens respondidos são o storage local
          const items = response.data;
          const itemCount = Object.keys(items).length;

          storageNumber.textContent = `Number of Stored Data: ${itemCount}`;

          // Esvazia a lista atual antes de prosseguir listando as possíveis novas informações
          storageList.innerHTML = '';

          // Lista todas as informações
          for (let key in items) {
            let listItem = document.createElement("li");
            listItem.textContent = `${key}: ${items[key]}`;
            storageList.appendChild(listItem);
          }
        }).catch((error) => {
          console.error("Error fetching local storage:", error);
        });
      });

    // Deixa a caixa de lista não visível caso o usuário já tenha ativado ela (clicando no botão anteriormente)
    } else {
      storageList.style.display = 'none'; 
    }
  });

  // Se botão third party for clicado
  thirdPartyButton.addEventListener('click', () => {

    // Caso esteja "desligado", deixar a caixa de informações visível
    if (thirdPartyList.style.display === 'none') {
      thirdPartyList.style.display = 'block';

      // Pega todas as conexões de terceiros via o script background.js
      browser.runtime.sendMessage({ action: "getThirdPartyConnections" }).then((response) => {

        const connections = response.data;

        const itemCount = Object.keys(connections).length;

        thirdPartyNumber.textContent = `Number of Third Party Connections: ${itemCount}`;

        thirdPartyList.innerHTML = ''; 

        // Lista todas as conexões (com função própria "forEach")
        connections.forEach(connection => {
          let listItem = document.createElement("li");
          listItem.textContent = connection;
          thirdPartyList.appendChild(listItem);
        });
      }).catch((error) => {
        console.error("Error fetching third-party connections:", error);
      });
    } else {
    // Deixa a caixa de lista não visível caso o usuário já tenha ativado ela (clicando no botão anteriormente)
      thirdPartyList.style.display = 'none'; 
    }
  });

  clearDomButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'clearDomChanges' }).then((response) => {
      if (response.success) {
        domchangesList.innerHTML = '';
        alert("All Logs have been cleared.");
      }
    }).catch((error) => {
      console.error("Error clearing Logs:", error);
    });
  });

  // Quando clicar o botão de dar update na lista de mudanças, ativar função
  DOMrefreshButton.addEventListener('click', () => {

    if (domchangesList.style.display === 'none') {

      domchangesList.style.display = 'block';

      // Chama função no background.js para pegar as mudanças no DOM
      browser.runtime.sendMessage({ action: 'getDomChanges' }).then((response) => {
        const changes = response.changes;

        // Se não há mudanças, mostrar no HTML que não há mudanças 
        if (changes.length === 0) {
          const emptyItem = document.createElement('li');
          emptyItem.textContent = 'No DOM changes detected.';
          domchangesList.appendChild(emptyItem);
        } else {
          // Se há mudanças, colocar elas na lista
          changes.forEach(change => {
            const listItem = document.createElement('li');
            listItem.textContent = `[${change.time}] ${change.type}: ${change.node} - ${change.content || 'No content'}`;
            domchangesList.appendChild(listItem);
          });
        }
      }).catch((error) => {
        console.error("Error fetching DOM changes:", error);
      });
    } else {
      domchangesList.style.display = 'none';
    }
    
  });

  const logsList = document.getElementById('fingerprintLogs');
  const canvasrefreshButton = document.getElementById('canvasRefreshButton');

  // Quando o botão de fingerprinting for clicado
  canvasrefreshButton.addEventListener('click', () =>  {

    // Verificação de se a lista está visível
    if (logsList.style.display === 'none') {

      // Deixa lista visível
      logsList.style.display = 'block';

      // Chamada para o background.js, recebe a lista de instâncias
      browser.runtime.sendMessage({ action: 'getCanvasFingerprintLogs' }).then((response) => {
      const logs = response.logs;

        logsList.innerHTML = '';

        if (logs.length === 0) {
          const emptyItem = document.createElement('li');
          emptyItem.textContent = 'No canvas fingerprinting detected.';
          logsList.appendChild(emptyItem);
        } else {
          // Coloca as tentativas de fingerprinting na lista
          logs.forEach(log => {
            const listItem = document.createElement('li');
            listItem.textContent = `[${log.timestamp}] ${log.method} detected on ${log.url}`;
            logsList.appendChild(listItem);
          });
        }
      }).catch((error) => {
        console.error('Error fetching canvas fingerprint logs:', error);
      });
    } else {
      logsList.style.display = 'none'
    }
    
  });

});
