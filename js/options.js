import {getLastValueOfTimeSeries, getStationProperties, TIME_SERIES_NAME} from "./service.js";

// set stored values
chrome.storage.sync.get(['stationId', 'dischargeLimit', 'notificationEnabled', 'xCoordinate', 'yCoordinate'], function (result) {
    document.getElementById('discharge-limit').setAttribute("value", result.dischargeLimit === null || result.dischargeLimit === undefined ? "" : result.dischargeLimit);
    document.getElementById('station-list').value = result.stationId;
    document.getElementById('notification-enabled').checked = result.notificationEnabled;
    setMapSrc(result.xCoordinate, result.yCoordinate);
});

async function save_options() {
    const stationId = document.getElementById('station-list').value;
    const dischargeLimit = document.getElementById('discharge-limit').value;
    const notificationEnabled = document.getElementById('notification-enabled').checked;
    const stationProperties = await getStationProperties(stationId);

    // set new values in storage
    chrome.storage.sync.set({
        stationId: stationId,
        stationName: stationProperties.stationName,
        xCoordinate: stationProperties.xCoordinate,
        yCoordinate: stationProperties.yCoordinate,
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

    // update UI
    setLastDischarge(stationId, dischargeLimit, notificationEnabled);

    // notification
    if (!notificationEnabled) {
        chrome.storage.sync.set({
            notificationDate: null
        }, function () {
        });
    }
}

export async function updateMap() {
    const selectedStationId = document.getElementById("station-list").value;
    const stationProperties = await getStationProperties(selectedStationId);
    setMapSrc(stationProperties.xCoordinate, stationProperties.yCoordinate);
    setImgSrc(selectedStationId);
}

function setMapSrc(xCoordinate, yCoordinate) {
    let map = document.getElementById("map");
    const mapIframe = "<iframe src=\"https://map.geo.admin.ch/#/embed?lang=de&center=" + xCoordinate + "," + yCoordinate + "&z=7&bgLayer=ch.swisstopo.pixelkarte-farbe&topic=ech&crosshair=bowl&layers=\" style=\"border: 0;width: 800px;height: 400px;max-width: 100%;max-height: 100%;\" allow=\"geolocation\"></iframe>";
    map.innerHTML = mapIframe;
}

function setImgSrc(stationId) {
    let img = document.getElementById("station-image");
    img.src = "https://www.hydrodaten.admin.ch/documents/Stationsbilder/P" + stationId + ".png";
}

async function setLastDischarge(stationId, dischargeLimit) {
    const discharge = await getLastValueOfTimeSeries(TIME_SERIES_NAME.DISCHARGE, stationId);
    chrome.action.setBadgeText({text: discharge.toString()});
    const bgColor = (dischargeLimit != "" && discharge > dischargeLimit) ? "green" : "blue";
    chrome.action.setBadgeBackgroundColor({color: bgColor});
}

// Save on click
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('station-list').addEventListener('change', updateMap);

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