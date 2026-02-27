function WeatherApp() {
  this.apiKey = "YOUR_API_KEY";
  this.baseURL = "https://api.openweathermap.org/data/2.5/";
  this.recentSearches = [];

  this.cityInput = document.getElementById("cityInput");
  this.searchBtn = document.getElementById("searchBtn");
  this.weatherContainer = document.getElementById("weatherContainer");
  this.forecastContainer = document.getElementById("forecastContainer");
  this.recentContainer = document.getElementById("recentSearches");
  this.clearBtn = document.getElementById("clearHistory");
}

/* Initialize App */
WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener("click", () => {
    const city = this.cityInput.value.trim();
    if (city) this.getWeather(city);
  });

  this.clearBtn.addEventListener("click", this.clearHistory.bind(this));

  this.loadRecentSearches();
  this.loadLastCity();
};

/* Fetch Weather */
WeatherApp.prototype.getWeather = async function (city) {
  try {
    const currentURL = `${this.baseURL}weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastURL = `${this.baseURL}forecast?q=${city}&appid=${this.apiKey}&units=metric`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentURL),
      fetch(forecastURL),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    this.displayWeather(currentData);
    this.displayForecast(forecastData);

    this.saveRecentSearch(city);

  } catch (error) {
    this.weatherContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  }
};

/* Display Current Weather */
WeatherApp.prototype.displayWeather = function (data) {
  this.weatherContainer.innerHTML = `
    <h2>${data.name}</h2>
    <p>🌡 Temperature: ${data.main.temp}°C</p>
    <p>☁ Condition: ${data.weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/>
  `;
};

/* Display 5 Day Forecast */
WeatherApp.prototype.displayForecast = function (data) {
  this.forecastContainer.innerHTML = "";

  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.slice(0, 5).forEach(day => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");

    card.innerHTML = `
      <h4>${new Date(day.dt_txt).toDateString()}</h4>
      <p>${day.main.temp}°C</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"/>
    `;

    this.forecastContainer.appendChild(card);
  });
};

/* Save Recent Search */
WeatherApp.prototype.saveRecentSearch = function (city) {
  city = this.toTitleCase(city);

  this.recentSearches = this.recentSearches.filter(c => c !== city);
  this.recentSearches.unshift(city);

  if (this.recentSearches.length > 5) {
    this.recentSearches.pop();
  }

  localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
  localStorage.setItem("lastCity", city);

  this.displayRecentSearches();
};

/* Load Recent Searches */
WeatherApp.prototype.loadRecentSearches = function () {
  const saved = localStorage.getItem("recentSearches");
  this.recentSearches = saved ? JSON.parse(saved) : [];
  this.displayRecentSearches();
};

/* Display Recent Buttons */
WeatherApp.prototype.displayRecentSearches = function () {
  this.recentContainer.innerHTML = "";

  this.recentSearches.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.addEventListener("click", () => {
      this.getWeather(city);
    });
    this.recentContainer.appendChild(btn);
  });
};

/* Load Last City */
WeatherApp.prototype.loadLastCity = function () {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    this.getWeather(lastCity);
  }
};

/* Clear History */
WeatherApp.prototype.clearHistory = function () {
  localStorage.removeItem("recentSearches");
  localStorage.removeItem("lastCity");
  this.recentSearches = [];
  this.displayRecentSearches();
};

/* Title Case Helper */
WeatherApp.prototype.toTitleCase = function (str) {
  return str.toLowerCase().split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* Start App */
const app = new WeatherApp();
app.init();