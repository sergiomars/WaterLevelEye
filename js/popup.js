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
    const response = await fetch("https://www.hydrodaten.admin.ch/plots/p_q_7days/" + stationId + "_p_q_7days_de.json");
    const jsonResponse = await response.json();
    var lastValue = jsonResponse.plot.data[0].y[jsonResponse.plot.data[1].y.length - 1];
    const waterLevel = Math.round(lastValue);
    document.getElementById("currentLevel").innerHTML = parseFloat(waterLevel).toFixed(2);
}

async function setLastTemperature(stationId) {
    const response = await fetch("https://www.hydrodaten.admin.ch/plots/temperature_7days/" + stationId + "_temperature_7days_de.json");
    const jsonResponse = await response.json();
    var lastValue = jsonResponse.plot.data[0].y[jsonResponse.plot.data[0].y.length - 1];
    const temperature = Math.round(lastValue);
    document.getElementById("currentTemperature").innerHTML = parseFloat(temperature).toFixed(1);
}

async function setLastDischarge(stationId) {
    const response = await fetch("https://www.hydrodaten.admin.ch/plots/p_q_7days/" + stationId + "_p_q_7days_de.json");
    const jsonResponse = await response.json();
    const lastValue = jsonResponse.plot.data[1].y[jsonResponse.plot.data[1].y.length - 1];
    const discharge = Math.round(lastValue);
    document.getElementById("currentOutflow").innerHTML = Math.round(discharge);
}