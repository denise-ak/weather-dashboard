const input = document.querySelector("#cityInput");
const button = document.querySelector("#searchButton");
const status = document.querySelector("#status");
const retryButton = document.querySelector("#retryButton");
const weather = document.querySelector("#weather");

function describeWeather(code) {
    if (code === 0) return { text: "Clear sky", icon: "☀️" };
    if (code <= 3) return { text: "Partly cloudy", icon: "⛅" };
    if (code <= 48) return { text: "Fog", icon: "🌫️" };
    if (code <= 57) return { text: "Drizzle", icon: "🌦️" };
    if (code <= 67) return { text: "Rain", icon: "🌧️" };
    if (code <= 77) return { text: "Snow", icon: "❄️" };
    if (code <= 82) return { text: "Rain showers", icon: "🌧️" };
    if (code <= 86) return { text: "Snow showers", icon: "🌨️" };
    return { text: "Thunderstorm", icon: "⛈️" };
}

//define the different states of the page
function setStatus(type, message = "") {
    status.dataset.state = type;         
    status.textContent = message;
    button.disabled = type === "loading";
    retryButton.hidden = type !== "error";
}

function friendly(err) { 
    if (err.message === "not-found") {
        return "City not found. Check the spelling.";
    }
    if (err.message.startsWith("HTTP")) {
        return "The weather service had a problem. Please try again.";
    }
    if (err instanceof TypeError) {
        return "Couldn't reach the server. Check your internet connection.";
    }
    return "Something went wrong. Please try again.";
}

//update DOM with the values we got
function renderWeather(data) {
    const { current, daily } = data;
    const now = describeWeather(current.weather_code);

    document.querySelector("#cityName").textContent = data.name;
    document.querySelector("#icon").textContent = now.icon;
    document.querySelector("#temp").textContent = `${Math.round(current.temperature_2m)}°C`;
    document.querySelector("#conditions").textContent = now.text;
    document.querySelector("#feelsLike").textContent = `Feels like: ${Math.round(current.apparent_temperature)}°C`;
    document.querySelector("#humidity").textContent = `Humidity: ${current.relative_humidity_2m}%`;
    document.querySelector("#wind").textContent = `Wind: ${current.wind_speed_10m} km/h`;

    document.querySelector("#forecast").replaceChildren(
        ...daily.time.map((date, i) => {
            const day = document.createElement("div");
            day.className = "day";
            const readableDate = new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric"
            }).format(new Date(`${date}T00:00:00`));
            day.innerHTML = `<h3>${readableDate}</h3>
                <p><span>High</span><strong>${daily.temperature_2m_max[i]}°C</strong></p>
                <p><span>Low</span><strong>${daily.temperature_2m_min[i]}°C</strong></p>`;
            return day;
        })
    );

    weather.hidden = false;
}

async function onSearch() {
    const city = input.value.trim();

    if (city === "") {
        setStatus("idle", "Please type a city name.");
        return;
    }

    weather.hidden = true;
    setStatus("loading", `Loading…`);

    try {
        const data = await loadWeather(city); //get data from the api
        renderWeather(data);
        setStatus("success");
    } catch (err) {
        setStatus("error", friendly(err));
    }
}

button.addEventListener("click", onSearch);
retryButton.addEventListener("click", onSearch);

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        input.blur();
        onSearch();
    }
});
