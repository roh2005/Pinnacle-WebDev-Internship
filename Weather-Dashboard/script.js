// Constants
const API_KEY = '24b82f4753e04c96be9170306260203';
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const locationBtn = document.getElementById('location-btn');
const historyList = document.getElementById('history-list');
const dashboardMain = document.getElementById('dashboard-main');
const loaderContainer = document.getElementById('loading-indicator');
const errorContainer = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Unit Toggle State
let isCelsius = true;
const btnC = document.getElementById('btn-c');
const btnF = document.getElementById('btn-f');

// Global State
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
let currentWeatherData = null;

// Initialize App
function init() {
    renderHistory();
    // Default location (e.g., attempt to get geolocation, else fallback)
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            position => {
                const query = `${position.coords.latitude},${position.coords.longitude}`;
                fetchWeather(query, false);
            },
            err => {
                console.warn("Geolocation blocked/failed. Using fallback.");
                fetchWeather('London', false);
            }
        );
    } else {
        fetchWeather('London', false);
    }
}

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        fetchWeather(query, true);
        searchInput.value = '';
        searchInput.blur();
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            position => {
                const query = `${position.coords.latitude},${position.coords.longitude}`;
                fetchWeather(query, false);
            },
            err => {
                hideLoader();
                showError("Unable to retrieve your location. Please check browser permissions.");
            }
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
});

btnC.addEventListener('click', () => {
    if (!isCelsius) {
        isCelsius = true;
        btnC.classList.add('active');
        btnF.classList.remove('active');
        if (currentWeatherData) updateUI(currentWeatherData);
    }
});

btnF.addEventListener('click', () => {
    if (isCelsius) {
        isCelsius = false;
        btnF.classList.add('active');
        btnC.classList.remove('active');
        if (currentWeatherData) updateUI(currentWeatherData);
    }
});

// Fetch API core logic
async function fetchWeather(query, addToHistoryFlag = true) {
    showLoader();
    try {
        // days=3 requests today + 2 future days
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${query}&days=3&aqi=yes&alerts=no`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        currentWeatherData = data;
        updateUI(data);
        hideLoader();

        if (addToHistoryFlag && data.location.name) {
            addToHistory(`${data.location.name}, ${data.location.country}`);
        }
    } catch (err) {
        hideLoader();
        showError(err.message || 'Error fetching weather data.');
    }
}

// UI Updating functions
function updateUI(data) {
    dashboardMain.style.display = 'flex';

    // Header Info
    const locationName = data.location.name;
    document.getElementById('city-name').textContent = locationName;

    // Parse Local Time
    const date = new Date(data.location.localtime);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('date-time').textContent = date.toLocaleDateString('en-US', options);

    // Current Weather Hero
    const current = data.current;

    // Fix icon URL protocol
    let iconUrl = current.condition.icon;
    if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;

    // Switch to larger API icons by replacing 64x64 with 128x128 in URL if possible, otherwise use standard
    document.getElementById('current-icon').src = iconUrl.replace('64x64', '128x128');

    document.getElementById('current-temp').textContent = isCelsius ? `${Math.round(current.temp_c)}°` : `${Math.round(current.temp_f)}°`;
    document.getElementById('current-condition').textContent = current.condition.text;

    // Today's High/Low (from forecast day 0)
    const todayForecast = data.forecast.forecastday[0].day;
    document.getElementById('temp-high').textContent = isCelsius ? `${Math.round(todayForecast.maxtemp_c)}°` : `${Math.round(todayForecast.maxtemp_f)}°`;
    document.getElementById('temp-low').textContent = isCelsius ? `${Math.round(todayForecast.mintemp_c)}°` : `${Math.round(todayForecast.mintemp_f)}°`;

    // Highlights Section
    // Wind
    document.getElementById('wind-speed').textContent = Math.round(isCelsius ? current.wind_kph : current.wind_mph);
    document.querySelector('#wind-speed + .unit').textContent = isCelsius ? 'km/h' : 'mph';
    document.getElementById('wind-dir').textContent = current.wind_dir;

    // Humidity
    document.getElementById('humidity').textContent = current.humidity;
    document.getElementById('humidity-bar').style.width = `${current.humidity}%`;

    // Visibility
    document.getElementById('visibility').textContent = isCelsius ? current.vis_km : current.vis_miles;
    document.querySelector('#visibility + .unit').textContent = isCelsius ? 'km' : 'miles';

    // Air Quality / UV Index
    document.getElementById('uv-index').textContent = current.uv;

    // Render Forecast
    renderForecast(data.forecast.forecastday);

    // Update dynamic background
    updateBackground(current.condition.code, current.is_day);
}

function renderForecast(forecastDays) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    forecastDays.forEach((day, index) => {
        const dateObj = new Date(day.date);
        const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        let icon = day.day.condition.icon;
        if (icon.startsWith('//')) icon = 'https:' + icon;

        const maxT = isCelsius ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f);
        const minT = isCelsius ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f);

        const html = `
            <div class="forecast-item">
                <span class="day-name">${dayName}</span>
                <img src="${icon}" alt="${day.day.condition.text}" class="forecast-icon">
                <div class="forecast-temps">
                    <span class="max-temp">${maxT}°</span>
                    <span class="min-temp">${minT}°</span>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

function updateBackground(code, isDay) {
    // Basic mapping of WeatherAPI condition codes to custom CSS themes
    document.body.className = '';

    if (code === 1000) {
        // Clear / Sunny
        document.body.classList.add(isDay ? 'bg-sunny' : 'bg-default');
    } else if ([1003, 1006, 1009, 1030, 1135, 1147].includes(code)) {
        // Partly cloudy, Cloudy, Overcast, Mist, Fog
        document.body.classList.add('bg-cloudy');
    } else if (code >= 1150 && code <= 1201) {
        // Rain / Drizzle
        document.body.classList.add('bg-rainy');
    } else if (code >= 1210 && code <= 1264) {
        // Snow / Ice
        document.body.classList.add('bg-snow');
    } else if (code >= 1273 && code <= 1282) {
        // Thunderstorm
        document.body.classList.add('bg-rainy');
    } else {
        // Fallback
        document.body.classList.add(isDay ? 'bg-cloudy' : 'bg-default');
    }
}

// Search History Management
function addToHistory(cityStr) {
    // Only keep city name to avoid long strings
    let city = cityStr.split(',')[0];

    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    searchHistory.unshift(city);

    if (searchHistory.length > 6) {
        searchHistory.pop();
    }

    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.className = 'history-item glass-panel';
        li.innerHTML = `
            <span><i class="fa-solid fa-clock-rotate-left" style="margin-right:12px; opacity:0.7"></i> ${city}</span>
            <i class="fa-solid fa-chevron-right" style="opacity:0.5; font-size:0.8rem"></i>
        `;
        li.addEventListener('click', () => {
            searchInput.value = city;
            fetchWeather(city, true);
        });
        historyList.appendChild(li);
    });
}

// Visibility Helpers
function showLoader() {
    loaderContainer.classList.remove('hidden');
    errorContainer.classList.add('hidden');
    dashboardMain.style.display = 'none';
}

function hideLoader() {
    loaderContainer.classList.add('hidden');
}

function showError(msg) {
    errorText.textContent = msg;
    errorContainer.classList.remove('hidden');
    dashboardMain.style.display = 'none';
}

// Fire app
init();
