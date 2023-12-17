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
    chrome.storage.sync.get(['stationId', 'dischargeLimit', 'notificationEnabled', 'notificationDate'], function(result) {
        var stationId = result.stationId;
        var dischargeLimit = result.dischargeLimit;
        var notificationEnabled = result.notificationEnabled;
        var notificationDate = result.notificationDate;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.hydrodaten.admin.ch/plots/p_q_7days/" + stationId + "_p_q_7days_de.json", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                const jsonResponse = JSON.parse(xhr.responseText);
                var lastValue = jsonResponse.plot.data[1].y[2002];
                var discharge = Math.round(lastValue);
                chrome.browserAction.setBadgeText({text: discharge.toString()});
                var isAboveLimit = dischargeLimit != "" && discharge > dischargeLimit;
                var bgColor = isAboveLimit ? "green": "blue";
                chrome.browserAction.setBadgeBackgroundColor({color: bgColor});
                if (notificationEnabled && isAboveLimit && (notificationDate == undefined || notificationDate < getTodayDate())) {
                    alertWithNotification(discharge);
                } else if (!isAboveLimit && notificationDate != undefined){
                    chrome.storage.sync.set({
                        notificationDate: null
                    }, function() {
                    });
                }
                timer();
            }
        }
        xhr.send();
    });
}

function alertWithNotification(discharge){
    chrome.notifications.create(
        '',
        {
          title: 'Durchflusslimit',
          message: 'Der Durchfluss ist oberhalb des Limits: ' + discharge,
          iconUrl: '/resources/images/icon.png',
          type: 'basic'
        }
    );
    chrome.storage.sync.set({
        notificationDate: getTodayDate()
    }, function() {
    });
}

function getTodayDate() {
   return new Date().setHours(0,0,0,0);
}