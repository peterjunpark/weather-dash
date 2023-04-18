var dateFormat = "ddd, MMMM D";
var timeFormat = "h:mm A";
var weatherConditions = {
  Ash: `<i class="fa-solid fa-volcano mx-1"></i>`,
  Clear: '<i class="fa-solid fa-sun mx-1"></i>',
  Clouds: '<i class="fa-solid fa-cloud mx-1"></i>',
  Drizzle: '<i class="fa-solid fa-cloud-rain mx-1"></i>',
  Dust: `<i class="fa-solid fa-smog mx-1"></i>`,
  Fog: `<i class="fa-solid fa-smog mx-1"></i>`,
  Haze: `<i class="fa-solid fa-smog mx-1"></i>`,
  Mist: `<i class="fa-solid fa-smog mx-1"></i>`,
  Rain: `<i class="fa-solid fa-cloud-showers-heavy mx-1"></i>`,
  Sand: `<i class="fa-solid fa-smog mx-1"></i>`,
  Smoke: `<i class="fa-solid fa-smog mx-1"></i>`,
  Snow: `<i class="fa-solid fa-snowflake mx-1"></i>`,
  Squall: `<i class="fa-solid fa-hurricane mx-1"></i>`,
  Thunderstorm: `<i class="fa-solid fa-cloud-bolt mx-1"></i>`,
  Tornado: `<i class="fa-solid fa-tornado mx-1"></i>`,
};
var removeSection = {
  main: function () {
    $("#main-weather-section").remove();
  },
  today: function () {
    $("#today-section").empty();
  },
  forecast: function () {
    $("#forecast-section").empty();
  },
  status: function () {
    $("#status-msg").text("");
  }
};
var savedCities = [];

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

function addSaveBtn() {
  if (!$("#save-city-btn").length) {
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
        $("#status-msg").text("> City saved to list")
      } else {
        $("#status-msg").text("> City already exists in list")
      }
    });
  }
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
        addSaveBtn(); // Show save button.
      })
      .catch((error) => {
        Object.values(removeSection).forEach((remove) => remove());
        $("#status-msg").text("> City not found")
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
              forecast[date].morningCondition =
                weatherConditions[interval.weather[0].main];
            }

            if (interval.dt_txt.endsWith("15:00:00")) {
              forecast[date].afternoonTemp = interval.main.temp;
              forecast[date].afternoonCondition =
                weatherConditions[interval.weather[0].main];
              forecast[date].windSpeed = interval.wind.speed;
              forecast[date].humidity = interval.main.humidity;
            }

            if (interval.dt_txt.endsWith("18:00:00")) {
              forecast[date].eveningTemp = interval.main.temp;
              forecast[date].eveningCondition =
                weatherConditions[interval.weather[0].main];
            }
          }
          printForecast(forecast);
        }
      });
  }
}

function printLocation(city, state) {
  removeSection.main();
  // Display selected city and today's date.
  $("#weather-content").append(`
    <!-- Current location + today's date -->
    <div id="main-weather-section" class="col-lg-8">
      <div class="row">
        <div class="card card-body bg-secondary text-light border-dark m-1">
          <h2 class="d-flex justify-content-between">
            <span id="current-city">
              <i class="fa-solid fa-tree-city me-3"></i>${city}</span>
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

  if (state) {
    $("#current-city").append(`, <small>${state}</small>`);
  }
}

function printToday(today) {
  removeSection.today();
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
          <div id="today-condition">
            ${today.condition}
          </div>
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

  $("#today-condition i").addClass("display-2");
}

function printForecast(forecast) {
  removeSection.forecast();
  for (var date in forecast) {
    $("#forecast-section").append(`
     <div class="col-lg col-sm-6 p-0">
        <div class="forecast card card-body bg-secondary text-light border-dark m-1">
            <h4 class="card-title text-end">${date}</h4>
            <ul>
                <li>
                  Morning: ${Math.round(forecast[date].morningTemp)}℃
                  ${forecast[date].morningCondition}
                </li>
                <li>
                  Afternoon: ${Math.round(forecast[date].afternoonTemp)}
                  ${forecast[date].afternoonCondition}
                </li>
                <li>
                  Evening: ${Math.round(forecast[date].eveningTemp)}℃
                  ${forecast[date].eveningCondition}
                </li>
                <hr>
                <li><i class="fa-solid fa-wind me-1"></i>Wind speed: ${Math.round(forecast[date].windSpeed)}km/h</li>
                <li><li><i class="fa-solid fa-water me-1"></i>Humidity: ${forecast[date].humidity}%</li>
            </ul>
        </div>
      </div>
  `);
  }
}

// Run when document is ready.
$(function () {
  getSavedCities();

  // Weather query: search bar.
  $("#location-form").on("submit", function (e) {
    e.preventDefault();
    removeSection.status();
    if (!$("#location-input").val().trim()) {
      $("#status-msg").text("> City to search cannot be blank")
      return;
    }
    getWeather($("#location-input").val().trim());
  });

  // Weather query: saved city
  // Event delegation to handle newly saved cities.
  $("#saved-cities").on("click", "button", function (e) {
    removeSection.status();
    getWeather(e.target.textContent);
  });
});
