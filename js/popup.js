debugger;
import {getLastValueOfTimeSeries, TIME_SERIES_NAME} from "./service.js";

setOptionsLink();

chrome.storage.sync.get(['stationId'], function (result) {
    const stationId = result.stationId;
    setDetailLink(stationId);
    setLastLevel(stationId);
    setLastTemperature(stationId);
    setLastDischarge(stationId);
});

chrome.storage.sync.get(['stationName', 'xCoordinate', 'yCoordinate'], function (result) {
    const stationName = result.stationName;
    setTitle(stationName);
    const xCoordinate = result.xCoordinate;
    const yCoordinate = result.yCoordinate;
    setMapSrc(xCoordinate, yCoordinate);
});

function setTitle(stationName) {
    document.getElementById("title").innerHTML = stationName;
}


function setMapSrc(xCoordinate, yCoordinate) {
    let map = document.getElementById("map");
    const mapIframe = "<iframe src=\"https://map.geo.admin.ch/#/embed?lang=de&center=" + xCoordinate + "," + yCoordinate + "&z=7&bgLayer=ch.swisstopo.pixelkarte-farbe&topic=ech&crosshair=bowl&layers=\" style=\"border: 0;width: 600px;height: 400px;max-width: 100%;max-height: 100%;\" allow=\"geolocation\"></iframe>";
    map.innerHTML = mapIframe;
}

function setDetailLink(stationId) {
    let a = document.getElementById('detailUrl');
    a.href = "https://www.hydrodaten.admin.ch/de/" + stationId + ".html";
}

function setOptionsLink(stationId) {
    let a = document.getElementById('optionsUrl');
    a.href = chrome.runtime.getURL('options.html');
}

async function setLastLevel(stationId) {
    const waterLevel = await getLastValueOfTimeSeries(TIME_SERIES_NAME.LEVEL, stationId);
    document.getElementById("currentLevel").innerHTML = parseFloat(waterLevel).toFixed(2);
}

async function setLastTemperature(stationId) {
    const temperature = await getLastValueOfTimeSeries(TIME_SERIES_NAME.TEMPERATURE, stationId);
    document.getElementById("currentTemperature").innerHTML = parseFloat(temperature).toFixed(1);
}

async function setLastDischarge(stationId) {
    const discharge = await getLastValueOfTimeSeries(TIME_SERIES_NAME.DISCHARGE, stationId);
    document.getElementById("currentOutflow").innerHTML = Math.round(discharge);
}