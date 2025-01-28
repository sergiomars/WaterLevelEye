import {getLastValueOfTimeSeries, TIME_SERIES_NAME} from "./service.js";

setDefaults();

async function setDefaults() {
    chrome.storage.sync.get(['stationId'], async function (result) {
        if (result.stationId === undefined) {
            chrome.storage.sync.set({
                stationId: "2018",
                stationName: "Reuss - Mellingen",
                xCoordinate: "2662835",
                yCoordinate: "1252577",
                dischargeLimit: null,
                notificationEnabled: false
            }, async function () {
                await setLastDischarge();
            });
        } else {
            await setLastDischarge();
        }
    });
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
    chrome.storage.local.set({
        notificationDate: getTodayDate()
    }, function () {
    });
}

function getTodayDate() {
    return new Date().setHours(0, 0, 0, 0);
}

chrome.runtime.onStartup.addListener( () => {
    setDefaults();
});