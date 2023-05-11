// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'saveData') {
      // Save data to storage
      chrome.storage.local.set({ [request.key]: request.value }, function () {
        sendResponse(request.value);
      });
    } else if (request.action === 'getData') {
      // Retrieve data from storage
      chrome.storage.local.get([request.key], function (result) {
        sendResponse(result[request.key]);
      });
    }
    return true;
  });
  