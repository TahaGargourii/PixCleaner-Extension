
  
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadImage" && request.url) {
        chrome.downloads.download({
            url: request.url,
            filename: 'processed_image.png' 
        });
    }
});
