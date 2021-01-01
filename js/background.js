setDefaults();
setLastDischargeFromCSV();

function setDefaults() {
    chrome.storage.sync.get(['stationId'], function(result) {
        var stationId = result.stationId;
        if (stationId == undefined) {
            chrome.storage.sync.set({
                stationId: '2018'
            }, function() {
                setName('2018');
                setLastDischargeFromCSV();
            });
        }
    });
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
