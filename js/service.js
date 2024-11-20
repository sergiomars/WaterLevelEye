export const TIME_SERIES_NAME = {
    DISCHARGE: "Abfluss",
    LEVEL: "Wasserstand",
    TEMPERATURE: "Temperatur"
}

export async function getLastValueOfTimeSeries(timeSeriesName, stationId) {
    const response = await fetch(getUrl(timeSeriesName, stationId));
    const jsonResponse = await response.json();
    const timeSeries = jsonResponse.plot.data.filter(function (el) {
        return el.name == timeSeriesName
    })[0];
    const lastValue = timeSeries.y[timeSeries.y.length - 1];
    return Math.round(lastValue);
}

function getUrl(timeSeriesName, stationId) {
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