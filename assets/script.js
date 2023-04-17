var dateFormat = "dddd, MMMM D";
var weatherConditions = {
  Ash: `<i class="fa-solid fa-volcano display-2 me-3"></i>`,
  Clear: '<i class="fa-solid fa-sun display-2 me-3"></i>',
  Clouds: '<i class="fa-solid fa-cloud display-2 me-3"></i>',
  Drizzle: '<i class="fa-solid fa-cloud-rain display-2 me-3"></i>',
  Dust: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Fog: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Haze: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Mist: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Rain: `<i class="fa-solid fa-cloud-showers-heavy display-2 me-3"></i>`,
  Sand: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Smoke: `<i class="fa-solid fa-smog display-2 me-3"></i>`,
  Snow: `<i class="fa-solid fa-snowflake display-2 me-3"></i>`,
  Squall: `<i class="fa-solid fa-hurricane display-2 me-3"></i>`,
  Thunderstorm: `<i class="fa-solid fa-cloud-bolt display-2 me-3"></i>`,
  Tornado: `<i class="fa-solid fa-tornado display-2 me-3"></i>`,
};


function printLocation(city, state) { // Populate selected city and today's date.
  $("#current-city").append(`<i class="fa-solid fa-tree-city me-3"></i>${city}, <small>${state}</small>`);
  $("#today").append(`<i class="fa-solid fa-calendar-day me-3"></i>${dayjs().format(dateFormat)}`);
}

function printToday(today) {
  $("#today-card").append(`
            <div class="row">
              <div class="col d-flex justify-content-around align-items-center">
                <span id="current-temp" class="display-2">${today.currentTemp}℃</span>
                <ul>
                  <li><i class="fa-solid fa-child me-1"></i>Feels like: ${today.feelsLike}℃</li>
                  <li><i class="fa-solid fa-temperature-empty me-1"></i>Low: ${today.lowTemp}℃</li>
                  <li><i class="fa-solid fa-temperature-full me-1"></i>High: ${today.highTemp}℃</li>
                </ul>
                ${today.condition}
              </div>
            </div>
            <div class="row">
              <div class="col">
                <hr>
                <ul class="d-flex justify-content-around">
                  <li><i class="fa-solid fa-wind me-1"></i>Wind speed: ${today.windSpeed}km/h</li>
                  <li><i class="fa-solid fa-water me-1"></i>Humidity: ${today.humidity}%</li>
                  <li><i class="fa-solid fa-cloud-sun me-1"></i>Sunset: ${today.sunset}</li>
                </ul>
              </div>
            </div>
          `)
}

function printForecast(forecast) {
  $("section .forecast").append(`
    <div class="col p-0">
        <div class="forecast card card-body bg-secondary text-light border-dark m-1">
            <h3 class="card-title text-end">${forecast.date}</h3>
            <ul>
                <li>Morning: ${forecast.morning}</li>
                <li>Afternoon: ${forecast.afternoon}</li>
                <li>Evening: ${forecast.evening}</li>
                <hr>
                <li>Wind speed:${forecast.wind}</li>
                <li>Humidity: ${forecast.humidity}</li>
            </ul>
        </div>
    </div>
  `);
}

function getWeather(locationQuery) {
  var openWeatherApiKey = "aa36a4eada79b71406a62586e875e41b";
  var coordinates = [];

  // Convert location input to coordinates to make API call for weather data.
  function fetchGeocode() {
    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${locationQuery}&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        coordinates = [data[0].lat, data[0].lon];

        printLocation(data[0].name, data[0].state);
        fetchWeather("weather");
        fetchWeather("forecast");
      });
  }

  function fetchWeather(apiType) {
    fetch(
      `https://api.openweathermap.org/data/2.5/${apiType}?lat=${coordinates[0]}&lon=${coordinates[1]}&units=metric&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Get current weather.
        if (apiType === "weather") {
          printToday({
            currentTemp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            lowTemp: Math.round(data.main.temp_min),
            highTemp: Math.round(data.main.temp_max),
            windSpeed: Math.round(data.wind.speed),
            humidity: Math.round(data.main.humidity),
            condition: weatherConditions[data.weather[0].main],
            sunset: dayjs.unix(data.sys.sunset).format("h:mm A"),
          });
        }

        // Get 5-day forecast.
        if (apiType === "forecast") {
          for (var i = 1; i < data.list.length; i += 2) {
            // Morning forecasts
            if (data.list[i].dt_txt.endsWith("09:00:00")) {
              console.log("Morning: " + data.list[i].dt_txt);
              //format("YYYY-MM-DD HH:mm:ss")
            }
            // Afternoon forecasts
            if (data.list[i].dt_txt.endsWith("15:00:00")) {
              console.log("Afternoon: " + data.list[i].dt_txt);
            }
            // Evening forecasts
            if (data.list[i].dt_txt.endsWith("21:00:00")) {
              console.log("Evening: " + data.list[i].dt_txt);
            }
          }
        }
      });
  }
  fetchGeocode();
}

// Run when document is ready.
$(function () {
  // Get location input.
  $("#location-form").on("submit", function (e) {
    e.preventDefault();
    //TODO: ADD VALIDATION.
    getWeather($("#location-input").val().trim());
  });

  // Event delegation to handle newly saved cities.
  $("#saved-cities").on("click", "button", function (e) {
    getWeather(e.target.textContent);
  });
});

var pexelsApiKey = "yrsB9C7fdv4f4SKZW0x33yLQTI5K0aQRyMFY6UUZPvHFdOGKiltYHvC6";

  // Save current city to saved cities dropdown.
  $("#save-city").on("click", function () {
    $("#saved-cities").append(
      `<li class="saved-city d-flex justify-content-between">
        <button class="dropdown-item">
          ${$("#location-input").val()}
        </button>
        <button class="delete-city btn btn-outline-danger border-0">
          <i class="fa-solid fa-delete-left"></i>
        </button>
      </li>`
    );
  })
