
let safetyData = {
    numCookies: 0,
    numThirdPartyCookies: 0,
    numLocalStorageItems: 0,
    numThirdPartyRequests: 0,
    fingerprintingAttempts: 0,
  };
  
  // Helper function to extract domain from URL
  function getDomainFromUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }
  
  // Track cookies (first-party and third-party)
  function trackCookies(activeTabDomain) {
    return browser.cookies.getAll({}).then(cookies => {
      let firstPartyCount = 0;
      let thirdPartyCount = 0;
  
      cookies.forEach(cookie => {
        if (cookie.domain.includes(activeTabDomain)) {
          firstPartyCount++;
        } else {
          thirdPartyCount++;
        }
      });
  
      safetyData.numCookies = firstPartyCount + thirdPartyCount;
      safetyData.numThirdPartyCookies = thirdPartyCount;
    });
  }
  
  // Track Local Storage usage
  function trackLocalStorage() {
    return browser.tabs.executeScript({
      code: 'Object.keys(localStorage).length'
    }).then(result => {
      safetyData.numLocalStorageItems = result[0];
    });
  }
  
  // Track Third-Party Requests
  function trackThirdPartyRequests(activeTabDomain) {
    safetyData.numThirdPartyRequests = 0;
  
    browser.webRequest.onCompleted.addListener(
      details => {
        const requestDomain = getDomainFromUrl(details.url);
        if (requestDomain && requestDomain !== activeTabDomain) {
          safetyData.numThirdPartyRequests++;
        }
      },
      { urls: ["<all_urls>"] }
    );
  }
  
  // Track Fingerprinting Attempts
  function trackFingerprinting() {
    // Using message sent from content.js to detect canvas fingerprinting
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'canvasFingerprint') {
        safetyData.fingerprintingAttempts++;
      }
    });
  }
  
  // Function to calculate the safety score
  function calculateSafetyScore() {
    const weight1 = 1.5; // cookies
    const weight2 = 2.0; // local storage
    const weight3 = 3.0; // third-party requests
    const weight4 = 10.0; // fingerprinting attempts
  
    let score = 100;
    score -= (weight1 * safetyData.numCookies);
    score -= (weight2 * safetyData.numLocalStorageItems);
    score -= (weight3 * safetyData.numThirdPartyRequests);
    score -= (weight4 * safetyData.fingerprintingAttempts);
  
    // Ensure the score is not negative
    return Math.max(score, 0);
  }
  
  // Listen for popup.js requesting the safety score
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSafetyScore') {
      const safetyScore = calculateSafetyScore();
      sendResponse({ score: safetyScore, data: safetyData });
    }
  });
  