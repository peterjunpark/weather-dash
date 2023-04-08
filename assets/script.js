var openWeatherApiKey = "aa36a4eada79b71406a62586e875e41b";

var weatherUrl =
  "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=" +
  openWeatherApiKey;

var geocodingUrl =
  "https://api.openweathermap.org/geo/1.0/direct?q=London&appid=" +
  openWeatherApiKey;

var geocodedLoc;

fetch(geocodingUrl)
  .then((response) => {
    return response.json();
  })
  .then((geocodedLocation) => {
    geocodedLoc = [geocodedLocation[0].lat, geocodedLocation[0].lon];
    console.log(geocodedLoc);
    console.log(geocodedLocation);
  });



//   weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${geocodedLoc[0]}&lon=${geocodedLoc[1]}&appid=` +
//   openWeatherApiKey;

// fetch(weatherUrl)
// .then((response) => {
//     return response.json()
// })
// .then((data) => {
//     console.log(data);
// });
