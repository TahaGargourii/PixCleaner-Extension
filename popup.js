document.addEventListener('DOMContentLoaded', function() {
    var processButton = document.getElementById('processButton');
    var imageUrlInput = document.getElementById('imageUrl');
    var apiKeyInput = document.getElementById('apiKey');

    chrome.storage.local.get(['imageUrl', 'apiKey'], function(result) {
        if (result.imageUrl) {
            imageUrlInput.value = result.imageUrl;
        }
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    imageUrlInput.addEventListener('input', function() {
        chrome.storage.local.set({ 'imageUrl': imageUrlInput.value });
    });

    apiKeyInput.addEventListener('input', function() {
        chrome.storage.local.set({ 'apiKey': apiKeyInput.value });
    });

    processButton.addEventListener('click', function() {
        var imageUrl = imageUrlInput.value;
        var apiKey = apiKeyInput.value;

        if (imageUrl && apiKey) {
            removeBackground(imageUrl, apiKey);
        } else {
            alert("Please enter both image URL and API key.");
        }
    });
});

function removeBackground(imageUrl, apiKey) {
    fetch('https://api.pixcleaner.com/v2/autoremove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ imageUrl: imageUrl })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 400) {
                alert("There was an error with your request. Please check your inputs and ensure you have sufficient credits.");
            } else {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
        }
        return response.json();
    })
    .then(data => {
        if (data.state === "success" && data.resultImage && data.resultImage.url) {
            console.log('Processed Image URL:', data.resultImage.url);
            chrome.runtime.sendMessage({action: "downloadImage", url: data.resultImage.url});
        } else {
            throw new Error('API response does not contain the expected data.');
        
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadImage" && request.url) {
        chrome.downloads.download({
            url: request.url,
            filename: 'processed_image.png' 
        });
    }
});
