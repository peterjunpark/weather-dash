function getWeather(locationQuery) {
  var openWeatherApiKey = "aa36a4eada79b71406a62586e875e41b";
  var coordinates = [];

  // Convert location input to coordinates to make API call for weather data.
  function geocodeLoc() {
    fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${locationQuery}&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((geocodedLocation) => {
        coordinates = [geocodedLocation[0].lat, geocodedLocation[0].lon];
        fetchWeather("weather");
        fetchWeather("forecast");
      });
  };

  function fetchWeather(apiType) {
    fetch(
      `https://api.openweathermap.org/data/2.5/${apiType}?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${openWeatherApiKey}`
    )
      .then((response) => {
        return response.json();
      })
      .then((weatherData) => {
        // Get current weather.
        if (apiType === "weather") {
          alert(weatherData.name);
          console.log("temp " + weatherData.main.temp);
          console.log("feels like " + weatherData.main.feels_like);
          console.log("humidity " + weatherData.main.humidity);
          // Get forecast.
        } else if (apiType === "forecast") {
          for (var i = 1; i < weatherData.list.length; i += 2) {
            if (weatherData.list[i].dt_txt.endsWith("09:00:00")) {
              console.log("Morning: " + weatherData.list[i].dt_txt);
            } else if (weatherData.list[i].dt_txt.endsWith("15:00:00")) {
              console.log("Afternoon: " + weatherData.list[i].dt_txt);
            } else if (weatherData.list[i].dt_txt.endsWith("21:00:00")) {
              console.log("Evening: " + weatherData.list[i].dt_txt);
            }
          }
        }
      });
  };

  geocodeLoc();
}

$("#today").text(dayjs().format("ddd, MMMM D"));

// Get location input.
$("#location-form").on("submit", function (e) {
  e.preventDefault();
  getWeather($("#location-input").val().trim());
});

$(".saved-city").on("click", function (e) {
  getWeather(e.target.textContent);
})
