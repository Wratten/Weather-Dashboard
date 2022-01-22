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

  let searchedCities = [];

  //   function storeCities() {
  //     localStorage.setItem("serchedCities", JSON.stringify(searchedCities));
  //   }

  //   function loadCities() {
  //     const storedCities = JSON.parse(localStorage.getItem("searchedCities"));
  //     if (storedCities !== "") {
  //       searchedCities = storedCities;
  //     }
  //   }

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
        currentWindSpan.textContent = data.wind.speed + " m/h";
        // UV INDEX
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

        const next5Days = oneCallData.daily.slice(0, 6);
        // reset the data so we dont make more than 5 days
        weatherCards.textContent = "";
        // start the loop at 1 to ignore the current day already being displayed
        for (let i = 0; i < next5Days.length; i++) {
          const forecast = next5Days[i];
          // use moment to convert unix into human time

          const col = createWeatherCol(
            forecast.dt,
            "",
            forecast.temp.day,
            forecast.humidity,
            forecast.wind_speed,
            forecast.weather[0].icon
          );
          weatherCards.appendChild(col);
        }
      });
  });

  function createWeatherCol(date, icon, temp, humidity, wind) {
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

    //moment.unix(date).format("dddd");

    // input icon
    const iconEl = document.createElement("img");
    iconEl.setAttribute(
      "src",
      `http://openweathermap.org/img/wn/` + icon + `.png`
    );
    cardBody.appendChild(iconEl);

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
});
