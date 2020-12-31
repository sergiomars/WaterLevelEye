setOptionsLink();

chrome.storage.sync.get(['stationId'], function(result) {
    var stationId = result.stationId;
    setDetailLink(stationId);
    setLastLevelFromCSV(stationId);
    setLastTemperatureFromCSV(stationId);
    setLastDischargeFromCSV(stationId);
});

chrome.storage.sync.get(['stationName'], function(result) {
    var stationName = result.stationName;
    setTitle(stationName);
});


function setTitle(stationName){
    document.getElementById("title").innerHTML = stationName;
}

function setDetailLink(stationId) {
    var a = document.getElementById('detailUrl');
    a.href = "https://www.hydrodaten.admin.ch/de/" + stationId + ".html";
}

function setOptionsLink(stationId) {
    var a = document.getElementById('optionsUrl');
    a.href = chrome.extension.getURL('options.html');
}

function setLastLevelFromCSV(stationId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/level_" + stationId + ".csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var lastLine = allTextLines[allTextLines.length - 2];
            var waterLevel = lastLine.split(",")[1];
            document.getElementById("currentLevel").innerHTML = waterLevel.toFixed(2);
        }
    }
    xhr.send();
}

function setLastTemperatureFromCSV(stationId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/temperature_" + stationId + ".csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var lastLine = allTextLines[allTextLines.length - 2];
            var temperature = lastLine.split(",")[1];
            document.getElementById("currentTemperature").innerHTML = temperature.toFixed(1);
        }
    }
    xhr.send();
}

function setLastDischargeFromCSV(stationId) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/discharge_" + stationId + ".csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var lastLine = allTextLines[allTextLines.length - 2];
            var discharge = lastLine.split(",")[1];
            document.getElementById("currentOutflow").innerHTML = Math.round(discharge);
        }
    }
    xhr.send();
}

/////////////////////////////////
// TODO: this does not work :-(
function checkState(xhr2) {
    if (xhr2.readyState == 4) {
        var discharge = xhr2.responseText.querySelector("#content > div.horizontal-scroll-wrapper > table > tbody > tr:nth-child(1) > th");
        document.getElementById("currentOutflow").innerHTML = xhr2.responseText;
    } else {
        document.getElementById("currentOutflow").innerHTML = "loading... " + xhr2.readyState;
        var x = xhr2;
        setTimeout(checkState(x), 1000);
    }
}

function setCurrentDischarge() {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "https://www.hydrodaten.admin.ch/de/2018.html", true);

    xhr2.onreadystatechange = checkState(xhr2);
    xhr2.send();
}
