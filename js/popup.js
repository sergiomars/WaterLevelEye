import {getLastValueOfTimeSeries, TIME_SERIES_NAME} from "./service.js";

setOptionsLink();

chrome.storage.sync.get(['stationId'], function (result) {
    const stationId = result.stationId;
    setDetailLink(stationId);
    setLastLevel(stationId);
    setLastTemperature(stationId);
    setLastDischarge(stationId);
});

chrome.storage.sync.get(['stationName'], function (result) {
    const stationName = result.stationName;
    setTitle(stationName);
});


function setTitle(stationName) {
    document.getElementById("title").innerHTML = stationName;
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