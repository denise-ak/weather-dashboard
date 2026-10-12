const GEO = "https://geocoding-api.open-meteo.com/v1/search";

const WX = "https://api.open-meteo.com/v1/forecast";

async function getJSON(url) { //wait for a response from api

    const response = await fetch(url); 

    if (!response.ok) { // fetch may reject so catch error
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}


//get coordinates (as variables) from city name thn use them to get weather
async function loadWeather(city) { 
    const q = new URLSearchParams({
        name: city,
        count: 1
    });

    const geo = await getJSON(`${GEO}?${q}`); 

    if (!geo.results?.length) {
        throw new Error("not-found");
    }

    const { latitude, longitude, name } = geo.results[0]; 
    const p = new URLSearchParams({
        latitude,
        longitude,
        forecast_days: 3,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m", daily: "temperature_2m_max,temperature_2m_min"
    });

    return {
        name,
        ...(await getJSON(`${WX}?${p}`))
    };
}
