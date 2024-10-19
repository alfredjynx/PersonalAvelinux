// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('showStorageButton');
  const storageList = document.getElementById('storageList');
  
  button.addEventListener('click', () => {
    // Toggle display of the storage list
    if (storageList.style.display === 'none') {
      storageList.style.display = 'block';
      
      // Fetch local storage data
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        let activeTab = tabs[0].id;
        browser.tabs.sendMessage(activeTab, { action: "getLocalStorage" }).then((response) => {
          const items = response.data;
          
          // Clear any previous entries
          storageList.innerHTML = '';

          // Display all items
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
      storageList.style.display = 'none';  // Hide the list if it's already visible
    }
  });
});
