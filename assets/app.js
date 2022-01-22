$(document).ready(function () {
  // OpenWeather API Key
  const apiKey = "ece65a809c550038c7bb3d98710f156b";

  const searchForm = document.getElementById("form-search");
  const cityInput = document.getElementById("city-input");

  const currentTempSpan = document.getElementById("current-temp-span");
  const currentHumiditySpan = document.getElementById("current-humidity-span");
  const currentWindSpan = document.getElementById("current-wind-span");
  const currentUvSpan = document.getElementById("current-uv-span");
  const dateTodayElement = document.getElementById("date-today");
  const chosenCitySpan = document.getElementById("chosen-city-span");

  const weatherCards = document.getElementById("weather-cards");
  const fiveDayTemperature = document.querySelector(".five-day-temperature");
  const fiveDayWind = document.querySelector(".five-day-wind");
  const fiveDayHumidity = document.querySelector(".five-day-wind");

  $.getJSON(
    "https://api.openweathermap.org/data/2.5/weather?q=Perth&appid=ece65a809c550038c7bb3d98710f156b",
    function (data) {}
  );

  function getCityWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    return fetch(url).then(function (response) {
      console.log(response);
      return response.json();
    });
  }

  function oneCall(lon, lat) {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    return fetch(url).then(function (response) {
      return response.json();
    });
  }

  function kelvinToCelcius(kelvin) {
    return kelvin - 273.15;
  }

  // When a user searches for a city
  searchForm.addEventListener("submit", function (event) {
    // stop form from reloading page
    event.preventDefault();
    // create city as the value the user searches for
    const city = cityInput.value;
    // get the data from the url using the searched city and create a promise to
    getCityWeather(city)
      .then(function (data) {
        // update the weather details on page using the data
        chosenCitySpan.textContent = "Current Weather in " + data.name;
        // NEED TO PUT IN TODAYS DATE
        currentTempSpan.textContent =
          kelvinToCelcius(data.main.temp).toFixed(2) + "°C";
        currentHumiditySpan.textContent = data.main.humidity + "%";
        currentWindSpan.textContent = data.wind.speed + " Km/ph";
        // PUT IN UV INDEX USING OTHER API
        currentUvSpan.textContent = data;

        // call the one api to get coordinates for the uv index
        console.log(oneCall);
        return oneCall(data.coord.lon, data.coord.lat);
      })
      .then(function (oneCallData) {
        const uv = oneCallData.current.uvi;

        currentUvSpan.textContent = uv;

        //http://www.bom.gov.au/uv/index.shtml UV Index
        if (uv < 3) {
          currentUvSpan.setAttribute("class", "low");
        }
        if (uv < 5) {
          currentUvSpan.setAttribute("class", "moderate");
        }
        if (uv >= 5 && uv <= 8) {
          currentUvSpan.setAttribute("class", "high");
        }
        if (uv >= 8 && uv <= 11) {
          currentUvSpan.setAttribute("class", "very high");
        }
        if (uv > 11) {
          currentUvSpan.setAttribute("class", "extreme");
        }

        const getForecast = function (data) {
          if (index > 0 && index < 6) {
            data.daily.forEach(function (value, index) {
              fiveDayTemperature.textContent =
                kelvinToCelcius(data.main.temp).toFixed(2) + "°C";
              fiveDayHumidity.textContent = data.main.humidity + "%";
              fiveDayWind.textContent = data.wind.speed + " Km/ph";
            });
          }
        };
        getForecast();
      });
  });
});
