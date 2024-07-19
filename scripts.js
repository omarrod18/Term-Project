document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '2a7c13d4c3e808edfee52512ef14bff4';
    const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';
    const searchInput = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');
    const recentLocations = document.getElementById('recent-locations');
    let recentlyViewed = [];
    const getWeatherData = async (lat, lon) => {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`);
        return response.json();
    };
    const displayCurrentWeather = (data) => {
        const current = document.getElementById('current');
        current.innerHTML = `
            <p>Temperature: ${data.current.temp}°F</p>
            <p>Condition: ${data.current.weather[0].description}</p>
        `;
    };
    const createSlides = (data, containerId, type) => {
        const container = document.getElementById(containerId);
        container.innerHTML = data.map((day, index) => `
            <div class="mySlides ${type}" style="display: ${index === 0 ? 'block' : 'none'};">
                <p>Date: ${new Date(day.dt * 1000).toDateString()}</p>
                <p>Temperature: ${day.temp ? day.temp.day : day.temp}°F</p>
                <p>Condition: ${day.weather[0].description}</p>
                ${type === 'detailed' ? `
                    <p>Humidity: ${day.humidity}%</p>
                    <p>Wind Speed: ${day.wind_speed} mph</p>
                ` : ''}
            </div>
        `).join('');
    };
    const display7DayOutlook = (data) => {
        createSlides(data.daily.slice(0, 7), 'outlook', 'outlook');
    };
    const display3DayDetailedForecast = (data) => {
        createSlides(data.daily.slice(0, 3), 'detailed', 'detailed');
    };
    const display24HourForecast = (data) => {
        createSlides(data.hourly.slice(0, 24), 'hourly', 'hourly');
    };
    const displayHistoricalData = async (lat, lon) => {
        const historical = document.getElementById('historical');
        let historyHTML = '';
        for (let i = 1; i <= 5; i++) {
            const timestamp = Math.floor(Date.now() / 1000) - (i * 24 * 60 * 60);
            const response = await fetch(`${BASE_URL}/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&units=imperial&appid=${API_KEY}`);
            const data = await response.json();
            historyHTML += `
                <div>
                    <p>Date: ${new Date(data.current.dt * 1000).toDateString()}</p>
                    <p>Temperature: ${data.current.temp}°F</p>
                    <p>Condition: ${data.current.weather[0].description}</p>
                </div>
            `;
        }
        historical.innerHTML = historyHTML;
    };
    const displayWeatherAlerts = (data) => {
        const alerts = document.getElementById('alerts');
        if (data.alerts && data.alerts.length > 0) {
            alerts.innerHTML = data.alerts.map(alert => `
                <div>
                    <p><strong>${alert.event}</strong></p>
                    <p>${alert.description}</p>
                    <p>Start: ${new Date(alert.start * 1000).toLocaleString()}</p>
                    <p>End: ${new Date(alert.end * 1000).toLocaleString()}</p>
                </div>
            `).join('');
        } else {
            alerts.innerHTML = '<p>No weather alerts at this time.</p>';
        }
    };
    const displaySuggestions = (locations) => {
        suggestions.innerHTML = '';
        locations.forEach(location => {
            const div = document.createElement('div');
            div.textContent = `${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}${location.zip ? ', ' + location.zip : ''}`;
            div.addEventListener('click', () => {
                searchInput.value = '';
                suggestions.innerHTML = '';
                fetchWeather(location.lat, location.lon);
                addToRecentlyViewed(location);
            });
            suggestions.appendChild(div);
        });
    };
    const addToRecentlyViewed = (location) => {
        const locationStr = `${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}${location.zip ? ', ' + location.zip : ''}`;
        if (!recentlyViewed.includes(locationStr)) {
            recentlyViewed.push(locationStr);
            const li = document.createElement('li');
            li.textContent = locationStr;
            li.addEventListener('click', () => {
                fetchWeatherByLocation(location.name);
            });
            recentLocations.appendChild(li);
        }
    };
    const fetchWeatherByLocation = async (location) => {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`);
        const [locationData] = await response.json();
        fetchWeather(locationData.lat, locationData.lon);
    };
    const fetchWeather = async (lat, lon) => {
        try {
            const data = await getWeatherData(lat, lon);
            displayCurrentWeather(data);
            display7DayOutlook(data);
            display3DayDetailedForecast(data);
            display24HourForecast(data);
            displayWeatherAlerts(data);
            await displayHistoricalData(lat, lon);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };
    const toggleDropdown = (event) => {
        const content = event.target.nextElementSibling;
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    };
    const plusSlides = (n, type) => {
        const slides = document.getElementsByClassName(`mySlides ${type}`);
        let currentIndex = Array.from(slides).findIndex(slide => slide.style.display === 'block');
        slides[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + n + slides.length) % slides.length;
        slides[currentIndex].style.display = 'block';
    };
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
            const locations = await response.json();
            displaySuggestions(locations);
        } else {
            suggestions.innerHTML = '';
        }
    });
    window.plusSlides = plusSlides;
});








