// Load everything when it's ready
$(document).ready(function () {
  // OpenWeather API Key
  const apiKey = "ece65a809c550038c7bb3d98710f156b";

  const searchForm = document.getElementById("form-search");
  const cityInput = document.getElementById("city-input");

  const dateTodayElement = document.getElementById("date-today");
  const chosenCitySpan = document.getElementById("chosen-city-span");
  const currentTempSpan = document.getElementById("current-temp-span");
  const currentHumiditySpan = document.getElementById("current-humidity-span");
  const currentWindSpan = document.getElementById("current-wind-span");
  const currentUvSpan = document.getElementById("current-uv-span");
  const weatherCards = document.getElementById("weather-cards");
  const mainWeatherIcon = document.getElementById("weather-icon");
  const cityList = document.getElementById("city-list");
  const results = document.querySelector(".results");

  var pastSearches = [];

  function getCityWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    return fetch(url).then(function (response) {
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

  var retrievedSearches = localStorage.getItem("pastSearches");
  var pastCityParsed = JSON.parse(retrievedSearches);
  const pastCity = document.createElement("p");
  pastCity.textContent = pastSearches;
  cityList.appendChild(pastCity);

  console.log(pastCityParsed);
  console.log(localStorage);

  function displaySearchHistory() {
    for (i = 0; i < pastCityParsed.length; i++) {
      const historyItem = document.createElement("input");
      historyItem.setAttribute("type", "text");
      historyItem.setAttribute("readonly", true);
      historyItem.setAttribute("class", "form-control d-block bg-white");
      historyItem.setAttribute("value", pastCityParsed[i]);
      historyItem.addEventListener("click", function (event) {
        getCityWeather(historyItem.value);
      });
      cityList.append(historyItem);
    }
  }
  // When a user searches for a city
  searchForm.addEventListener("submit", function (event) {
    // stop form from reloading page
    event.preventDefault();

    // create city as the value the user searches for
    const city = cityInput.value;

    // store items in local storage array
    if (localStorage["pastSearches"]) {
      pastSearches = JSON.parse(localStorage["pastSearches"]);
    }
    if (pastSearches.indexOf(city) == -1) {
      //insert new element at the start of array
      pastSearches.unshift(city);
      // if the array is longer than 5 itmes
      if (pastSearches.length > 5) {
        // take one off the end
        pastSearches.pop();
      }
      localStorage["pastSearches"] = JSON.stringify(pastSearches);
    }

    // get the data from the url using the searched city and create a promise to
    getCityWeather(city)
      .then(function (data) {
        // update the weather details on page using the data
        chosenCitySpan.textContent = "Current Weather in " + data.name;
        // TODAYS DATE
        dateTodayElement.textContent = moment
          .unix(data.dt)
          .format("MMMM Do, YYYY");
        // TEMPERATURE
        currentTempSpan.textContent =
          kelvinToCelcius(data.main.temp).toFixed(2) + "°C";
        // HUMIDITY
        currentHumiditySpan.textContent = data.main.humidity + "%";
        // WIND
        currentWindSpan.textContent = data.wind.speed + " m/s";
        // UV INDEX
        currentUvSpan.textContent = data;

        // return the data
        return oneCall(data.coord.lon, data.coord.lat);
      })
      .then(function (oneCallData) {
        const uv = oneCallData.current.uvi;

        currentUvSpan.textContent = uv;

        //http://www.bom.gov.au/uv/index.shtml UV Index
        if (uv == 0 || uv < 3) {
          currentUvSpan.setAttribute("class", "low");
        }
        if (uv < 5) {
          currentUvSpan.setAttribute("class", "moderate");
        }
        if (uv >= 5 && uv <= 8) {
          currentUvSpan.setAttribute("class", "high");
        }
        if (uv >= 8 && uv <= 11) {
          currentUvSpan.setAttribute("class", "very-high");
        }
        if (uv > 11) {
          currentUvSpan.setAttribute("class", "extreme");
        }

        const next5Days = oneCallData.daily.slice(0, 5);
        // reset the data so we dont make more than 5 days
        weatherCards.textContent = "";
        for (let i = 0; i < next5Days.length; i++) {
          const forecast = next5Days[i];

          const col = createWeatherCol(
            forecast.dt,
            forecast.temp.day,
            forecast.humidity,
            forecast.wind_speed,
            forecast.weather[0].icon
          );
          weatherCards.appendChild(col);
        }
      });
  });

  // make a function to create weather cards for 5 day forecast
  function createWeatherCol(date, temp, humidity, wind, icon) {
    const col = document.createElement("div");
    col.setAttribute("class", "col-2 text-center col-5");

    const card = document.createElement("div");
    card.setAttribute("class", "card ");
    col.appendChild(card);

    const cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body p-1 ");
    card.appendChild(cardBody);

    const dateHeading = document.createElement("p");
    dateHeading.setAttribute("class", "card-title");
    cardBody.appendChild(dateHeading);

    //format unix date to days
    dateHeading.textContent = moment.unix(date).add(1, "d").format("dddd");

    // input icons
    const iconEl = document.createElement("img");
    iconEl.setAttribute(
      "src",
      `http://openweathermap.org/img/wn/` + icon + `.png`
    );
    cardBody.appendChild(iconEl);

    mainWeatherIcon.setAttribute(
      "src",
      `http://openweathermap.org/img/wn/` + icon + `.png`
    );

    const p = document.createElement("p");
    cardBody.appendChild(p);
    const ul = document.createElement("ul");
    cardBody.appendChild(ul);

    //TEMPERATURE ELEMENT
    const tempElement = document.createElement("p");
    tempElement.setAttribute("class", "card-title text-muted");
    tempElement.textContent = kelvinToCelcius(temp).toFixed(2) + "°C";
    ul.appendChild(tempElement);

    //WIND ELEMENT
    const windElement = document.createElement("p");
    windElement.setAttribute("class", "card-title text-muted");
    windElement.textContent = "wind: " + wind + " m/s"; //wind_speed;
    ul.appendChild(windElement);

    ///HUMIDITY ELEMENT
    const humidityElement = document.createElement("p");
    humidityElement.setAttribute("class", "card-title text-muted");
    humidityElement.textContent = humidity + "% humidity";
    ul.appendChild(humidityElement);
    p.appendChild(ul);

    return col;
  }
  displaySearchHistory();
});
