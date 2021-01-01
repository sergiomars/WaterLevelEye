// Saves options to chrome.storage
function save_options() {
  var stationId = document.getElementById('station-list').value;
  setLastDischargeFromCSV(stationId);
  setName(stationId);
  chrome.storage.sync.set({
    stationId: stationId
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function setLastDischargeFromCSV(stationId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/discharge_" + stationId + ".csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var lastLine = allTextLines[allTextLines.length - 2];
            var discharge = Math.round(lastLine.split(",")[1]).toString();
            chrome.browserAction.setBadgeText({text: discharge});
        }
    }
    xhr.send();
}

function setName(stationId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "resources/data/stations.csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            for (i = 0; i < allTextLines.length - 1; i++) {
                var line = allTextLines[i];
                var splittedLine = line.split(",");
                if (splittedLine[0].toString().valueOf() == stationId.valueOf()) {
                    chrome.storage.sync.set({
                        stationName: splittedLine[1].toString()
                    }, function() {
                    });
                }
            }
        }
    }
    xhr.send(null);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
//function restore_options() {
//  // Use default value color = 'red' and likesColor = true.
//  chrome.storage.sync.get({
//    stationId: '2018',
//  }, function(items) {
//    document.getElementById('stationId').value = items.stationId;
//  });
//}
//document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);