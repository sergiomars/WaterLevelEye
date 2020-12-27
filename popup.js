document.getElementById("currentOutflow").innerHTML = "191";

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://www.hydrodaten.admin.ch/graphs/2018/discharge_2018.csv", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    var allTextLines = xhr.responseText.split(/\r\n|\n/);
    var lastLine = allTextLines[allTextLines.length - 2];
    var discharge = lastLine.split(",")[1];
    document.getElementById("currentOutflow").innerHTML = Math.round(discharge);
  }
}
xhr.send();