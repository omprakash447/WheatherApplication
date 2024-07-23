document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '16663b36314fe4a06ccb4f47f053edc7'; // Replace with your OpenWeatherMap API key
    const searchBtn = document.querySelector('.search-btn');
    const locationBtn = document.querySelector('.location-btn');
    const cityInput = document.querySelector('.city-input');
    const currentWeatherDetails = document.querySelector('.current-weather .details');
    const forecastCards = document.querySelectorAll('.days-forecast .card');

    const weatherIcons = {
        Clouds: 'imgs/cloud.png',
        Clear: 'imgs/clear.png',
        Rain: 'imgs/rain.png',
        Mist: 'imgs/mist.png',
        Haze: 'imgs/haze.png'
    };

    const fetchWeatherData = async(city) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                error: error.message
            };
        }
    };

    const fetchForecastData = async(lat, lon) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('Forecast data not found');
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                error: error.message
            };
        }
    };

    const updateCurrentWeather = (data) => {
        if (data.error) {
            currentWeatherDetails.innerHTML = `<h2>${data.error}</h2>`;
            return;
        }

        const {
            name,
            main: {
                temp,
                humidity
            },
            wind: {
                speed
            },
            weather: [details]
        } = data;
        const weatherIcon = weatherIcons[details.main] || 'default.png'; // Fallback to a default image if not found
        currentWeatherDetails.innerHTML = `
        <h2>${name} (${details.description})</h2>
        <img src="images/${weatherIcon}" alt="${details.main}" style="width: 30%; height: 50%;">
        <h6>Temperature: ${temp}°C</h6>
        <h6>Wind: ${speed} M/S</h6>
        <h6>Humidity: ${humidity}%</h6>
      `;
    };

    const updateForecast = (data) => {
        if (data.error) {
            forecastCards.forEach((card) => {
                card.innerHTML = `<h3>${data.error}</h3>`;
            });
            return;
        }

        forecastCards.forEach((card, index) => {
            const forecastData = data.list[index * 8]; // Assuming 3-hour intervals, take every 8th data point for daily forecast
            const {
                dt_txt,
                main: {
                    temp
                },
                wind: {
                    speed
                },
                weather: [details]
            } = forecastData;
            const date = new Date(dt_txt).toDateString();
            const weatherIcon = weatherIcons[details.main] || 'default.png'; // Fallback to a default image if not found
            card.innerHTML = `
          <h3>${date}</h3>
          <img src="images/${weatherIcon}" alt="${details.main}" style="width: 50px; height: 50px;">
          <h6>Temp: ${temp}°C</h6>
          <h6>Wind: ${speed} M/S</h6>
          <h6>Humidity: ${details.humidity}%</h6>
        `;
        });
    };

    searchBtn.addEventListener('click', async() => {
        const city = cityInput.value;
        if (city) {
            const weatherData = await fetchWeatherData(city);
            updateCurrentWeather(weatherData);
            if (!weatherData.error) {
                const forecastData = await fetchForecastData(weatherData.coord.lat, weatherData.coord.lon);
                updateForecast(forecastData);
            }
        }
    });

    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async(position) => {
                const {
                    latitude,
                    longitude
                } = position.coords;
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
                const weatherData = await response.json();
                updateCurrentWeather(weatherData);
                const forecastData = await fetchForecastData(latitude, longitude);
                updateForecast(forecastData);
            });
        }
    });
});