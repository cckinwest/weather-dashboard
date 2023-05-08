const APIKEY = "b6f0ccf06b4649cf66be86ca82eec322";

const forecastAPI = "https://api.openweathermap.org/data/2.5/forecast";
const geocodingAPI = "http://api.openweathermap.org/geo/1.0/direct";

var header = $("header");
header.addClass(
  "bg-primary w-auto d-flex justify-content-center align-items-center fs-1 font-monospace text-white"
);

var searchPanel = $("#searchPanel");
var displayPanel = $("#displayPanel");
var currentPanel = $("#currentWeather");
var forecastPanel = $("#forecastWeather");

var cityField = $(".cityField");
var searchBtn = $(".searchBtn");

function forecast(lat, lon) {
  currentPanel.empty();
  forecastPanel.empty();

  var url = `${forecastAPI}?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var city = cityField.val();

      for (var i = 0; i < data.list.length; i += 8) {
        var temp = data.list[i].main.temp;
        var wind = data.list[i].wind.speed;
        var humidity = data.list[i].main.humidity;
        var weatherIcon = data.list[i].weather[0].icon;
        var date = dayjs(data.list[i].dt * 1000).format("YYYY/MM/DD h A");

        var infoPanel = $("<div></div>");

        infoPanel.addClass("bg-secondary border rounded-3 p-3");

        var cityTitle = $("<p></p>")
          .text(`${city} (${date})`)
          .appendTo(infoPanel);

        var weatherImg = $("<img></img>");
        weatherImg.attr(
          "src",
          `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`
        );
        weatherImg.appendTo(infoPanel);

        var tempText = $("<p></p>")
          .text(`Temp: ${temp} \u00B0C`)
          .appendTo(infoPanel);
        var windText = $("<p></p>")
          .text(`Wind: ${wind} MPH`)
          .appendTo(infoPanel);
        var humidText = $("<p></p>")
          .text(`Humidity: ${humidity}%`)
          .appendTo(infoPanel);

        if (i === 0) {
          infoPanel.appendTo(currentPanel);
        } else {
          infoPanel.addClass("col col-3");
          infoPanel.appendTo(forecastPanel);
        }
      }
    });
}

function createBtn(city) {
  var historyBtn = $("<button></button>");
  historyBtn.text(city);
  historyBtn.addClass("btn btn-success btn-lg w-100 mb-2 historyBtn");
  historyBtn.appendTo(searchPanel);

  historyBtn.on("click", function () {
    cityField.val(city);
    searchWeather(city);
  });
}

function searchWeather(city) {
  var url = `${geocodingAPI}?q=${city}&limit=1&appid=${APIKEY}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      forecast(lat, lon);
    });
}

searchBtn.on("click", () => {
  var city = cityField.val();
  var history = [];

  if (localStorage.getItem("history")) {
    history = JSON.parse(localStorage.getItem("history"));
  }

  searchWeather(city);

  if (!history.includes(city)) {
    createBtn(city);
    history.push(city);
    localStorage.setItem("history", JSON.stringify(history));
  }
});

$(function () {
  var history = [];

  if (localStorage.getItem("history")) {
    history = JSON.parse(localStorage.getItem("history"));
  }

  for (var i = 0; i < history.length; i++) {
    createBtn(history[i]);
  }
});
