// set stored values
chrome.storage.sync.get(['stationId', 'dischargeLimit', 'notificationEnabled'], function(result) {
    document.getElementById('discharge-limit').setAttribute("value", result.dischargeLimit);
    document.getElementById('station-list').value = result.stationId;
    document.getElementById('notification-enabled').checked = result.notificationEnabled;
});


// Saves options to chrome.storage
function save_options() {
  var stationId = document.getElementById('station-list').value;
  var dischargeLimit = document.getElementById('discharge-limit').value;
  var notificationEnabled = document.getElementById('notification-enabled').checked;
  setLastDischargeFromCSV(stationId, dischargeLimit, notificationEnabled);
  setName(stationId);
  chrome.storage.sync.set({
    stationId: stationId,
    dischargeLimit: dischargeLimit,
    notificationEnabled: notificationEnabled
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
  if (!notificationEnabled) {
    chrome.storage.sync.set({
       notificationDate: null
     }, function() { });
  }
}

function setLastDischargeFromCSV(stationId, dischargeLimit) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/" + stationId + "/discharge_" + stationId + ".csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var allTextLines = xhr.responseText.split(/\r\n|\n/);
            var lastLine = allTextLines[allTextLines.length - 2];
            var discharge = Math.round(lastLine.split(",")[1]);
            chrome.browserAction.setBadgeText({text: discharge.toString()});
            var bgColor = (dischargeLimit != "" && discharge > dischargeLimit) ? "green": "blue";
            chrome.browserAction.setBadgeBackgroundColor({color: bgColor});
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

// Save on click
document.getElementById('save').addEventListener('click', save_options);

// Click on 'enter'
setClickEventListener("station-list");
setClickEventListener("discharge-limit");
setClickEventListener("notification-enabled");
function setClickEventListener(elementId){
    var input = document.getElementById(elementId);
    input.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        document.getElementById("save").click();
      }
    });
}