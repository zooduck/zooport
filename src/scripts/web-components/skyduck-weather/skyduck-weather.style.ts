export const style = `
* {
    box-sizing: border-box;
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
.skyduck-weather {
    display: grid;
    grid-template-columns: repeat(2, 55px) repeat(3, 1fr) minmax(65px, 1fr);
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
.skyduck-weather__loader {
    grid-column: 1 / span 6;
    font-size: 42px;
    color: gainsboro;
}
.skyduck-weather__title {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    grid-column-start: 1;
    grid-column-end: span 6;
    margin-bottom: 10px;
}
.skyduck-weather__map {
    width: 100%;
    height: 150px;
    border: 0;
    background-color: rgba(0, 0, 0, .10);
    grid-column-start: 1;
    grid-column-end: span 6;
}
.skyduck-weather__place {
    display: flex;
    flex-direction: column;
    justify-self: left;
    grid-column-start: 1;
    grid-column-end: span 6;
    font-size: 14px;
}
.skyduck-weather__place h3 {
    margin: 0;
}
.skyduck-weather__search {
    grid-column: 1 / span 6;
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
    grid-column-start: 1;
    grid-column-end: span 6;
    width: 100%;
    margin-top: 20px;
    font-size: 14px;
}
.skyduck-weather__daily-data-title {
    display: flex;
    grid-column: 1 / span 6;
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
    width: 55px;
    height: 55px;
    border-radius: 50%;
    font-size: 32px;
}
.skyduck-weather__hourly-data-weather-icon {
    font-size: 26px;
}
.skyduck-weather__hourly-data-forecast {
    display: flex;
    width: 100%;
    height: 65px;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    padding: 0 5px;
    color: #fff;
}
.skyduck-weather__hourly-data-forecast i {
    font-size: 28px;
}
.skyduck-weather__hourly-data-forecast.--green {
    background-color: rgba(50, 205, 50, .55);
}
.skyduck-weather__hourly-data-forecast.--amber {
    background-color: rgba(255, 165, 0, .55);
}
.skyduck-weather__hourly-data-forecast.--red {
    background-color: rgb(255, 0, 0, .55);
}
`;
