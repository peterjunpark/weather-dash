var locationInput;
var openWeatherApiKey = "aa36a4eada79b71406a62586e875e41b";
var geocodingApi;
var weatherApi;

function getWeather(loc) {
  // Convert location input to coordinates to make API call for weather data.
  var geocodeLoc = () => {
    geocodingApi = `https://api.openweathermap.org/geo/1.0/direct?q=${loc}&appid=${openWeatherApiKey}`;

    fetch(geocodingApi)
      .then((response) => {
        return response.json();
      })
      .then((geocodedLoc) => {
        var locationCoordinates = [geocodedLoc[0].lat, geocodedLoc[0].lon]
        // Get current weather data.
        fetchWeather("weather", locationCoordinates);
        // Get 5-day weather forecast.
        fetchWeather("forecast", locationCoordinates);
      });
  };

  var fetchWeather = function (type, coordinates) {
    weatherApi = `https://api.openweathermap.org/data/2.5/${type}?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${openWeatherApiKey}`;

    $("#geolocation").text(coordinates);

    fetch(weatherApi)
      .then((response) => {
        return response.json();
      })
      .then((weatherData) => {
        if (type === "weather") {
          alert(weatherData.name);
          console.log("temp " + weatherData.main.temp);
          console.log("feels like " + weatherData.main.feels_like);
          console.log("humidity " + weatherData.main.humidity);
        } else if (type === "forecast") {
          alert(weatherData.city.name);
        }
      });
  };

  geocodeLoc();
}

$("#today").text(dayjs());

// Get location input.
$("#location-form").on("submit", function (e) {
  e.preventDefault();
  locationInput = $("#location-input").val().trim();
  getWeather(locationInput);
});
