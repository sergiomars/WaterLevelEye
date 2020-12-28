setDefaults();
setLastDischargeFromCSV();

function setDefaults() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "resources/stations.csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var stations = new Array(allTextLines.length);
            for (i = 0; i < allTextLines.length - 1; i++) {
                var line = allTextLines[i];
                var splittedLine = line.split(",");
                stations[splittedLine[0].toString()] = splittedLine[1];
            }
            chrome.storage.local.set({
                stations: stations
            }, function() {
            });
        }
    }
    xhr.send(null);
}

function timer(){
    setTimeout(setLastDischargeFromCSV, 60000);
}

function setLastDischargeFromCSV() {
    chrome.storage.sync.get(['stationId'], function(result) {
        var stationId = result.stationId;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/discharge_" + stationId + ".csv", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var allTextLines = xhr.responseText.split(/\r\n|\n/);
                var lastLine = allTextLines[allTextLines.length - 2];
                var discharge = Math.round(lastLine.split(",")[1]).toString();
                chrome.browserAction.setBadgeText({text: discharge});
                timer();
            }
        }
        xhr.send();
    });
}
