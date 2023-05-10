const APIKEY = "b6f0ccf06b4649cf66be86ca82eec322";

const forecastAPI = "https://api.openweathermap.org/data/2.5/forecast";
const geocodingAPI = "https://api.openweathermap.org/geo/1.0/direct";
const currentAPI = "https://api.openweathermap.org/data/2.5/weather";

var header = $("header");
header.addClass(
  "bg-primary w-auto d-flex justify-content-center align-items-center fs-1 font-monospace text-white"
);

var searchPanel = $("#searchPanel");
var historyArea = $("#historyArea");
var displayPanel = $("#displayPanel");
var currentPanel = $("#currentWeather");
var forecastPanel = $("#forecastWeather");

var cityField = $(".cityField");
var searchBtn = $(".searchBtn");

function current(lat, lon) {
  var url = `${currentAPI}?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`;

  fetch(url)
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        errorHandling();
      }
    })
    .then(function (data) {
      if (data.length !== 0) {
        $("<h2></h2>").text("Current weather:").appendTo(currentPanel);

        var city = cityField.val();

        var temp = data.main.temp;
        var wind = data.wind.speed;
        var humidity = data.main.humidity;
        var weatherIcon = data.weather[0].icon;
        var date = dayjs(data.dt * 1000).format("YYYY/MM/DD h A");

        var infoPanel = $("<div></div>");

        infoPanel.addClass("bg-info border rounded-3 p-3");

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

        infoPanel.addClass("col m-auto");
        infoPanel.appendTo(currentPanel);
      } else {
        errorHandling();
      }
    });
}

function forecast(lat, lon) {
  var url = `${forecastAPI}?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`;

  fetch(url)
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        errorHandling();
      }
    })
    .then(function (data) {
      if (data.length !== 0) {
        $("<h2></h2>").text("Forecast:").appendTo(forecastPanel);

        var city = cityField.val();

        for (var i = 7; i < data.list.length; i += 8) {
          var temp = data.list[i].main.temp;
          var wind = data.list[i].wind.speed;
          var humidity = data.list[i].main.humidity;
          var weatherIcon = data.list[i].weather[0].icon;
          var date = dayjs(data.list[i].dt * 1000).format("YYYY/MM/DD h A");

          var infoPanel = $("<div></div>");

          infoPanel.addClass("col bg-info border rounded-3 p-3 m-auto");

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

          infoPanel.appendTo(forecastPanel);
        }
      } else {
        errorHandling();
      }
    });
}

function errorHandling() {
  currentPanel.empty();
  forecastPanel.empty();

  $("<h1></h1>")
    .text("Something goes wrong. Check if you enter correctly.")
    .addClass("display-1")
    .appendTo(currentPanel);
}

function createBtn(city) {
  var historyBtn = $("<button></button>");
  historyBtn.text(city);
  historyBtn.addClass("btn btn-success btn-lg w-75 mb-2 historyBtn");
  historyBtn.attr("id", city);
  historyBtn.appendTo(historyArea);

  historyBtn.on("click", function () {
    cityField.val(city);
    searchWeather(city);
  });

  var clearBtn = $("<button></button>");
  clearBtn.addClass("btn btn-danger btn-lg w-25 mb-2 text-wrap");
  clearBtn.attr("id", city);
  clearBtn.appendTo(historyArea);

  clearBtn.on("click", clear);

  var clearText = $("<i></i>", {
    class: "fas fa-trash-alt",
    ariaHidden: "true",
  }).appendTo(clearBtn);
}

function clear() {
  var city = $(this).attr("id");
  var history = JSON.parse(localStorage.getItem("history"));

  var ind = 0;
  for (var i = 0; i < history.length; i++) {
    if (history[i] === city) {
      ind = i;
    }
  }

  var before = history.slice(0, ind);
  var after = history.slice(ind + 1);
  history = before.concat(after);

  localStorage.setItem("history", JSON.stringify(history));

  historyArea.empty();

  for (var i = 0; i < history.length; i++) {
    createBtn(history[i]);
  }
}

function searchWeather(city) {
  var url = `${geocodingAPI}?q=${city}&limit=1&appid=${APIKEY}`;

  fetch(url)
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        errorHandling();
      }
    })
    .then(function (data) {
      if (data.length !== 0) {
        var lat = data[0].lat;
        var lon = data[0].lon;

        currentPanel.empty();
        forecastPanel.empty();

        current(lat, lon);
        forecast(lat, lon);
      } else {
        errorHandling();
      }
    });
}

searchBtn.on("click", () => {
  currentPanel.empty();
  forecastPanel.empty();

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

  $("<h1></h1>")
    .text("Enter a city and search. The weather will be shown here.")
    .addClass("display-1")
    .appendTo(currentPanel);
});
