// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const storageButton = document.getElementById('showStorageButton');
  const storageList = document.getElementById('storageList');
  const thirdPartyButton = document.getElementById('showThirdPartyButton');
  const thirdPartyList = document.getElementById('thirdPartyList');

  storageButton.addEventListener('click', () => {
    if (storageList.style.display === 'none') {
      storageList.style.display = 'block';
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        let activeTab = tabs[0].id;
        browser.tabs.sendMessage(activeTab, { action: "getLocalStorage" }).then((response) => {
          const items = response.data;
          storageList.innerHTML = ''; // Clear the list
          for (let key in items) {
            let listItem = document.createElement("li");
            listItem.textContent = `${key}: ${items[key]}`;
            storageList.appendChild(listItem);
          }
        }).catch((error) => {
          console.error("Error fetching local storage:", error);
        });
      });
    } else {
      storageList.style.display = 'none'; // Hide list if already shown
    }
  });

  thirdPartyButton.addEventListener('click', () => {
    if (thirdPartyList.style.display === 'none') {
      thirdPartyList.style.display = 'block';
      // Request the third-party connections from the background script
      browser.runtime.sendMessage({ action: "getThirdPartyConnections" }).then((response) => {
        const connections = response.data;
        thirdPartyList.innerHTML = ''; // Clear the list
        connections.forEach(connection => {
          let listItem = document.createElement("li");
          listItem.textContent = connection;
          thirdPartyList.appendChild(listItem);
        });
      }).catch((error) => {
        console.error("Error fetching third-party connections:", error);
      });
    } else {
      thirdPartyList.style.display = 'none'; // Hide list if already shown
    }
  });
});
