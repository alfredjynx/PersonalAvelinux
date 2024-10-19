document.addEventListener('DOMContentLoaded', () => {

  // pega os elementos do arquivo HTML (popup.html) por meio dos IDs
  const storageButton = document.getElementById('showStorageButton');
  const storageList = document.getElementById('storageList');
  const storageNumber = document.getElementById('storageNumber');

  const thirdPartyButton = document.getElementById('showThirdPartyButton');
  const thirdPartyList = document.getElementById('thirdPartyList');
  const thirdPartyNumber = document.getElementById('thirdPartyNumber');

  const cookiesButton = document.getElementById('showCookiesButton'); 
  const firstPartyNumber = document.getElementById('firstPartyNumber');
  const thirdPartyCookieNumber = document.getElementById('thirdPartyCookieNumber'); 

  // Ativa quando clicado
  cookiesButton.addEventListener('click', () => {

    // verifica se o display de cookies já está ativado
    if (firstPartyNumber.style.display === 'none' && thirdPartyCookieNumber.style.display === 'none') {

      firstPartyNumber.style.display = 'block';
      thirdPartyCookieNumber.style.display = 'block';

      // Pega todos os cookies e filtra na hora
      browser.cookies.getAll({}).then(cookies => {
        let firstPartyCount = 0;
        let thirdPartyCount = 0;

        cookies.forEach(cookie => {
          if (cookie.domain.includes('example.com')) { // Replace with your domain
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
});
