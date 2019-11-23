export const style = `
* {
    box-sizing: border-box;
}
.skyduck-weather {
    display: grid;
    grid-template-columns: auto 60px repeat(5, 1fr);
    gap: 5px;
    place-items: center;
    margin-bottom: 20px;
    background-color: #fff;
    padding: 10px;
    user-select: none;
    min-height: 400px;
}
.skyduck-weather a {
    color: cornflowerblue;
    text-decoration: none;
}
.skyduck-weather a:hover {
    text-decoration: underline;
}
.skyduck-weather__loader,
.skyduck-weather__error {
    grid-column: 1 / span 7;
    font-size: 62px;
    color: gainsboro;
}
.skyduck-weather__error {
    display: flex;
    height: 100%;
    align-items: center;
    font-size: 22px;
    color: rgb(255, 0, 0, .55);
}
.skyduck-weather:not(.--error) .skyduck-weather__error {
    display: none;
}
.skyduck-weather.--ready .skyduck-weather__loader,
.skyduck-weather.--error .skyduck-weather__loader {
    display: none;
}
.skyduck-weather__title {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    grid-column: 1 / span 7;
    margin-bottom: 10px;
}
.skyduck-weather__title h1 {
    margin: 0;
}
.skyduck-weather__map {
    width: 100%;
    height: 150px;
    border: 0;
    background-color: rgba(0, 0, 0, .10);
    grid-column: 1 / span 7;
}
.skyduck-weather__place {
    display: flex;
    flex-direction: column;
    justify-self: left;
    grid-column-start: 1;
    grid-column-end: span 7;
    font-size: 14px;
}
.skyduck-weather__place h3 {
    margin: 0;
}
.skyduck-weather__search {
    grid-column: 1 / span 7;
    width: 100%;
    display: flex;
    margin: 5px 0;
}
.skyduck-weather__search-input {
    flex-grow: 1;
    --zooduck-input-icon-padding: 10px;
}
.skyduck-weather__search-radios {
    display: grid;
    align-items: center;
    margin-left: 10px;
}
.skyduck-weather__footer {
    display: flex;
    justify-content: space-between;
    grid-column: 1 / span 7;
    width: 100%;
    margin-top: 20px;
    font-size: 14px;
}
.skyduck-weather__daily-data-title {
    display: flex;
    grid-column: 1 / span 7;
    width: 100%;
    align-items: center;
}
.skyduck-weather__daily-data-title.--clear-day {
    color: #fff;
}
.skyduck-weather__daily-data-title-date {
    margin-left: 10px;
    flex-shrink: 0;
}
.skyduck-weather__daily-data-title-summary {
    margin-left: 10px;
    padding: 5px;
    margin: 0 5px;
    flex-grow: 1;
}
.skyduck-weather__daily-data-title-icon {
    display: flex;
    margin-left: 10px;
}
.skyduck-weather__daily-data-title-temperature {
    display: flex;
    margin: 0 10px;
    font-size: 22px;
    justify-content: center;
    flex-shrink: 0;
}
.skyduck-weather__hourly-data-date {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.skyduck-weather__hourly-data-weather-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-size: 32px;
}
.skyduck-weather__hourly-data-forecast,
.skyduck-weather__hourly-data-forecast-wind {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    padding: 10px 5px;
    color: #fff;
}
.skyduck-weather__hourly-data-forecast i,
.skyduck-weather__hourly-data-forecast-wind i {
    font-size: 28px;
    padding-bottom: 10px;
}
.skyduck-weather__hourly-data-forecast-wind {
    display: grid;
    grid-column: span 2;
    grid-template-columns: 1fr 1fr;
}
.skyduck-weather__hourly-data-forecast-wind-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 100%;
}
.--clear-day {
    color: yellow;
    background-color: lightskyblue;
}
.--clear-night,
.--partly-cloudy-night {
    color: white;
    background-color: gray;
}
.--rain,
.--sleet {
    color: gray;
    background-color: lightgray;
}
.--cloud-sun-rain,
.--snow,
.--wind,
.--partly-cloudy-day,
.--cloudy {
    color: white;
    background-color: lightskyblue;
}
.--fog {
    color: lightgray;
    background-color: #f5f5f5;
}
.--green {
    background-color: rgba(50, 205, 50, .55);
}
.--amber {
    background-color: rgba(255, 165, 0, .55);
}
.--red {
    background-color: rgba(255, 0, 0, .45);
}
`;
