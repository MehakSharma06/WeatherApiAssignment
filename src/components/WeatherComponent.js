import React, { useEffect, useState } from 'react';
import './WeatherComponent.css'; // This assumes WeatherComponent.css is in the same folder as WeatherComponent.js

const WeatherComponent = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState([]);
    const apiKey = '06d173d3bfb0ddff71c33f95dbd60755'; // Replace with your actual API key

    // Fetch weather data based on city name
    const fetchWeather = async (city) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
            );
            const data = await response.json();

            if (response.ok) {
                setWeatherData(data);
                setError('');
            } else {
                setError(data.message || 'City not found.');
                setWeatherData(null);
            }
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.');
            setWeatherData(null);
        }
    };

    // Fetch weather based on current location
    const fetchWeatherByLocation = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );
            const data = await response.json();

            if (response.ok) {
                setWeatherData(data);
                setError('');
            } else {
                setError(data.message || 'Location not found.');
                setWeatherData(null);
            }
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.');
            setWeatherData(null);
        }
    };

    // Get current location and fetch weather data on component mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            return;
        }

        const timeoutId = setTimeout(() => {
            setError('Getting location took too long. Please try again.');
        }, 10000); // Set a timeout of 10 seconds

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId); // Clear the timeout on successful response
                const { latitude, longitude } = position.coords;
                fetchWeatherByLocation(latitude, longitude);
            },
            (error) => {
                clearTimeout(timeoutId); // Clear the timeout on error
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('User denied the request for Geolocation.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        setError('The request to get user location timed out.');
                        break;
                    case error.UNKNOWN_ERROR:
                        setError('An unknown error occurred.');
                        break;
                    default:
                        setError('Unable to retrieve your location.');
                        break;
                }
            }
        );
    }, []);

    // Load favorites from localStorage
    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(storedFavorites);
    }, []);

    // Save favorites to localStorage whenever favorites change
    const updateFavorites = (newFavorites) => {
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city) {
            fetchWeather(city);
        }
    };

    const toggleFavorite = (cityName) => {
        setFavorites((prevFavorites) => {
            const newFavorites = prevFavorites.includes(cityName)
                ? prevFavorites.filter((favorite) => favorite !== cityName)
                : [...prevFavorites, cityName];
            updateFavorites(newFavorites);
            return newFavorites;
        });
    };

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h1 className="weather-title">Weather App</h1>
                <form onSubmit={handleSubmit} className="weather-form">
                    <input
                        type="text"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-city"
                    />
                    <button type="submit" className="submit-btn">Get Weather</button>
                </form>

                {error && <p className="error">{error}</p>}

                {weatherData && (
                    <div className="weather-info">
                        <div className="weather-details">
                            <h2 className="weather-city">{weatherData.name}</h2>
                            <p className="description">
                                {weatherData.weather[0].description}
                            </p>
                            <p className="temperature">Temperature: {weatherData.main.temp} °C</p>
                            <p className="humidity">Humidity: {weatherData.main.humidity} %</p>
                            <p className="wind-speed">Wind Speed: {weatherData.wind.speed} m/s</p>
                            <button onClick={() => toggleFavorite(weatherData.name)} className="favorite-btn">
                                {favorites.includes(weatherData.name) ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                        </div>
                        <div className="weather-icon-container">
                            <img 
                                className="weather-icon" 
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} 
                                alt={weatherData.weather[0].description}
                            />
                        </div>
                    </div>
                )}

                {favorites.length > 0 && (
                    <div className="favorites">
                        <h3>Favorite Cities</h3>
                        <ul>
                            {favorites.map((favCity) => (
                                <li key={favCity}>{favCity}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherComponent;
