var dateFormat = "ddd, MMMM D";
var timeFormat = "h:mm A";
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
var savedCities = [];

function printLocation(city, state) {
  $("#main-weather-section").remove();
  // Display selected city and today's date.
  $("#weather-content").append(`
    <!-- Current location + today's date -->
    <div id="main-weather-section" class="col-lg-8">
      <div class="row">
        <div class="card card-body bg-secondary text-light border-dark m-1">
          <h2 class="d-flex justify-content-between">
            <span id="current-city">
              <i class="fa-solid fa-tree-city me-3"></i>${city}, <small>${state}</small>
            </span>
            <span>
              <i class="fa-solid fa-calendar-day me-3"></i>${dayjs().format(
                dateFormat
              )}
            </span>
          </h2>
        </div>
      </div>

      <!-- Today's weather -->
      <section id="today-section" class="row"></section>
  </div>


  `);
}

function printToday(today) {
  $("#today-section").empty();
  $("#today-section").append(`
    <div class="card card-body bg-secondary text-light border-dark m-1">
      <h3 class="card-title text-end">Today</h3>
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
    </div>
  `);
}

function printForecast(forecast) {
  $("#forecast-section").empty();
  for (var date in forecast) {
    $("#forecast-section").append(`
     <div class="col p-0">
        <div class="forecast card card-body bg-secondary text-light border-dark m-1">
            <h4 class="card-title text-end">${date}</h4>
            <ul>
                <li>Morning: ${forecast[date].morningTemp}℃</li>
                <li>Afternoon: ${forecast[date].afternoonTemp}℃</li>
                <li>Evening: ${forecast[date].eveningTemp}℃</li>
                <hr>
                <li>Wind speed: ${forecast[date].windSpeed}km/h</li>
                <li>Humidity: ${forecast[date].humidity}%</li>
            </ul>
        </div>
      </div>
  `);
  }

  console.log(forecast);
}

function getWeather(locationQuery) {
  var openWeatherApiKey = "aa36a4eada79b71406a62586e875e41b";
  var city;
  var coordinates = [];

  // Convert location input to coordinates to make API call for weather data.
  (function fetchGeocode() {
    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${locationQuery}&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        city = data[0].name;
        coordinates = [data[0].lat, data[0].lon];

        printLocation(city, data[0].state);
        fetchWeather("weather"); // Today.
        fetchWeather("forecast"); // Forecast.
      });
  })();

  function fetchWeather(apiType) {
    var apiDateFormat = "YYYY-MM-DD hh:mm:ss";
    var forecast = {};
    var date;

    fetch(
      `https://api.openweathermap.org/data/2.5/${apiType}?lat=${coordinates[0]}&lon=${coordinates[1]}&units=metric&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Print today's weather.
        if (apiType === "weather") {
          printToday({
            currentTemp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            lowTemp: Math.round(data.main.temp_min),
            highTemp: Math.round(data.main.temp_max),
            windSpeed: Math.round(data.wind.speed),
            humidity: Math.round(data.main.humidity),
            condition: weatherConditions[data.weather[0].main],
            sunset: dayjs.unix(data.sys.sunset).format(timeFormat),
          });
        }

        // Print 5-day forecast.
        if (apiType === "forecast") {
          for (var interval of data.list) {
            date = dayjs(interval.dt_txt, apiDateFormat).format(dateFormat);

            if (interval.dt_txt.endsWith("09:00:00")) {
              forecast[date] = {};
              forecast[date].morningTemp = interval.main.temp;
              forecast[date].morningCondition = interval.weather[0].main;
            }

            if (interval.dt_txt.endsWith("15:00:00")) {
              forecast[date].afternoonTemp = interval.main.temp;
              forecast[date].afternoonCondition = interval.weather[0].main;
              forecast[date].windSpeed = interval.wind.speed;
              forecast[date].humidity = interval.main.humidity;
            }

            if (interval.dt_txt.endsWith("18:00:00")) {
              forecast[date].eveningTemp = interval.main.temp;
              forecast[date].eveningCondition = interval.weather[0].main;
            }
          }
          printForecast(forecast);
        }
      });
  }
}

function addSaveBtn() {
  $("#city-controls").append(`
      <button id="save-city-btn" class="btn btn-outline-light" type="button">
        <i class="fa-solid fa-floppy-disk"></i>
      </button>
    `);

  // Save current city to saved cities dropdown.
  $("#save-city-btn").on("click", function () {
    if (!savedCities.includes($("#current-city").text().trim())) {
      savedCities.unshift($("#current-city").text().trim());
      localStorage.setItem("savedCities", JSON.stringify(savedCities));
      getSavedCities();
    }
  });
}

function getSavedCities() {
  if (localStorage.getItem("savedCities")) {
    savedCities = JSON.parse(localStorage.getItem("savedCities"));
    $("#saved-cities").empty();
    // Add saved cities to dropdown.
  for (city of savedCities) {
    $("#saved-cities").append(
      `<li><button class="dropdown-item">${city}</button></li>`
    );
  }
  }
}

// Run when document is ready.
$(function () {
  getSavedCities();
  // Get location input.
  $("#location-form").on("submit", function (e) {
    e.preventDefault();

    // Show weather data.
    getWeather($("#location-input").val().trim());
    // Show save button.
    if (!$("#save-city-btn").length) addSaveBtn();
  });

  // Event delegation to handle newly saved cities.
  $("#saved-cities").on("click", "button", function (e) {
    getWeather(e.target.textContent);
  });
});

var pexelsApiKey = "yrsB9C7fdv4f4SKZW0x33yLQTI5K0aQRyMFY6UUZPvHFdOGKiltYHvC6";
