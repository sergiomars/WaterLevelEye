export const TIME_SERIES_NAME = {
    DISCHARGE: "Abfluss",
    LEVEL: "Wasserstand",
    TEMPERATURE: "Temperatur"
}

export async function getLastValueOfTimeSeries(timeSeriesName, stationId) {
    const response = await fetch(getTimeSeriesUrl(timeSeriesName, stationId));
    if (response.ok) {

        const jsonResponse = await response.json();
        const timeSeries = jsonResponse.plot.data.filter(function (el) {
            return el.name === timeSeriesName
        })[0];
        const lastValue = timeSeries.y[timeSeries.y.length - 1];
        return Math.round(lastValue);
    } else {
        console.log("no " + timeSeriesName.valueOf() + " for station " + stationId);
        return null;
    }
}

function getTimeSeriesUrl(timeSeriesName, stationId) {
    const basePlotUrl = "https://www.hydrodaten.admin.ch/plots";
    let url = basePlotUrl;
    switch (timeSeriesName) {
        case TIME_SERIES_NAME.DISCHARGE:
        case TIME_SERIES_NAME.LEVEL:
            url = url + "/p_q_7days/" + stationId + "_p_q_7days_de.json";
            break;
        case TIME_SERIES_NAME.TEMPERATURE:
            url = url + "/temperature_7days/" + stationId + "_temperature_7days_de.json";
            break;
    }
    return url;
}

export async function getStationProperties(stationId) {
    const response = await fetch("resources/data/stations.csv");
    const csv = await response.text();
    const allTextLines = csv.split(/\r\n|\n/);
    for (let i = 0; i < allTextLines.length - 1; i++) {
        const line = allTextLines[i];
        const splittedLine = line.split("|");
        if (splittedLine[0].toString().valueOf() == stationId.valueOf()) {
            const xCoordinate = splittedLine[2].toString();
            const yCoordinate = splittedLine[3].toString();
            const stationName = splittedLine[1].toString();
            return {
                "stationName": stationName,
                "xCoordinate": xCoordinate,
                "yCoordinate": yCoordinate
            }
        }
    }
}
