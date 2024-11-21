import {getLastValueOfTimeSeries} from "./service.js";
import {TIME_SERIES_NAME} from "./service.js";

setDefaults();
setLastDischarge();

function setDefaults() {
    chrome.storage.sync.get(['stationId'], function (result) {
        const stationId = result.stationId;
        if (stationId == undefined) {
            chrome.storage.sync.set({
                stationId: '2018'
            }, function () {
                setName('2018');
                setLastDischarge();
            });
        }
    });
}

async function setName(stationId) {
    const response = await fetch("resources/data/stations.csv");
    const csv = await response.text();
    const allTextLines = csv.split(/\r\n|\n/);
    for (let i = 0; i < allTextLines.length - 1; i++) {
        const line = allTextLines[i];
        const splittedLine = line.split("|");
        if (splittedLine[0].toString().valueOf() == stationId.valueOf()) {
            chrome.storage.sync.set({
                stationName: splittedLine[1].toString(),
                xCoordinate: splittedLine[2].toString(),
                yCoordinate: splittedLine[3].toString()
            }, function () {
            });
        }
    }
}

function timer() {
    setTimeout(setLastDischarge, 60000);
}

async function setLastDischarge() {
    chrome.storage.sync.get(['stationId', 'dischargeLimit', 'notificationEnabled', 'notificationDate'], async function (result) {
        const stationId = result.stationId;
        const dischargeLimit = result.dischargeLimit;
        const notificationEnabled = result.notificationEnabled;
        const notificationDate = result.notificationDate;

        const discharge = await getLastValueOfTimeSeries(TIME_SERIES_NAME.DISCHARGE, stationId);
        chrome.action.setBadgeText({text: discharge.toString()});

        const isAboveLimit = dischargeLimit != "" && discharge > dischargeLimit;
        const bgColor = isAboveLimit ? "green" : "blue";
        chrome.action.setBadgeBackgroundColor({color: bgColor});

        if (notificationEnabled && isAboveLimit && (notificationDate == undefined || notificationDate < getTodayDate())) {
            alertWithNotification(discharge);
        } else if (!isAboveLimit && notificationDate != undefined) {
            chrome.storage.sync.set({
                notificationDate: null
            }, function () {
            });
        }
        timer();
    });
}

function alertWithNotification(discharge) {
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
    }, function () {
    });
}

function getTodayDate() {
    return new Date().setHours(0, 0, 0, 0);
}