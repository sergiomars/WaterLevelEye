import {getLastValueOfTimeSeries, TIME_SERIES_NAME} from "./service.js";

// set stored values
chrome.storage.sync.get(['stationId', 'dischargeLimit', 'notificationEnabled'], function (result) {
    document.getElementById('discharge-limit').setAttribute("value", result.dischargeLimit);
    document.getElementById('station-list').value = result.stationId;
    document.getElementById('notification-enabled').checked = result.notificationEnabled;
});


// Saves options to chrome.storage
function save_options() {
    const stationId = document.getElementById('station-list').value;
    const dischargeLimit = document.getElementById('discharge-limit').value;
    const notificationEnabled = document.getElementById('notification-enabled').checked;
    setLastDischarge(stationId, dischargeLimit, notificationEnabled);
    setName(stationId);
    chrome.storage.sync.set({
        stationId: stationId,
        dischargeLimit: dischargeLimit,
        notificationEnabled: notificationEnabled
    }, function () {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
    if (!notificationEnabled) {
        chrome.storage.sync.set({
            notificationDate: null
        }, function () {
        });
    }
}

async function setLastDischarge(stationId, dischargeLimit) {
    const discharge = await getLastValueOfTimeSeries(TIME_SERIES_NAME.DISCHARGE, stationId);
    chrome.action.setBadgeText({text: discharge.toString()});
    const bgColor = (dischargeLimit != "" && discharge > dischargeLimit) ? "green" : "blue";
    chrome.action.setBadgeBackgroundColor({color: bgColor});
}

async function setName(stationId) {
    const response = await fetch("resources/data/stations.csv");
    const csv = await response.text();
    const allTextLines = csv.split(/\r\n|\n/);
    for (let i = 0; i < allTextLines.length - 1; i++) {
        const line = allTextLines[i];
        const splittedLine = line.split(",");
        if (splittedLine[0].toString().valueOf() == stationId.valueOf()) {
            chrome.storage.sync.set({
                stationName: splittedLine[1].toString()
            }, function () {
            });
        }
    }
}

// Save on click
document.getElementById('save').addEventListener('click', save_options);

// Click on 'enter'
setClickEventListener("station-list");
setClickEventListener("discharge-limit");
setClickEventListener("notification-enabled");

function setClickEventListener(elementId) {
    let input = document.getElementById(elementId);
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("save").click();
        }
    });
}