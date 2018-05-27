chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("here", tab);
  chrome.tabs.executeScript(null, { file: "jquery-3.3.1.min.js" }, function() {
    chrome.tabs.executeScript({
      file: "contentScript.js"
    });
  });
  // alert("icon clicked");
});
var fileName;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  fileName = request.fileName.trim();
  fileName = fileName.replace(/[|&;$%@"<>()+,]/g, "");
  console.log("filename received", fileName);
  sendResponse({ received: true, fileName: fileName });
});

chrome.downloads.onDeterminingFilename.addListener(function(
  downloadItem,
  suggest
) {
  console.log("change item name", fileName);
  suggest({
    filename: fileName
  });
});

chrome.downloads.onChanged.addListener(function(downloadDelta) {
  console.log("item status", downloadDelta);
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "download",
      status: downloadDelta.state,
      id: downloadDelta.id,
      filename: downloadDelta.filename
    });
  });
});
