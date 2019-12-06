export const style = `
@keyframes flash {
    0% {
        visibility: visible;
    }
    49% {
        visibility: visible;
    }
    50% {
        visibility: hidden;
    }
    99% {
        visibility: hidden;
    }
    100% {
        visibility: visible;
    }
}
.--flash {
    animation: flash 1s linear infinite;
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
@keyframes slideOnFromRight {
    0% {
        transform: translateX(100vw);
    }
    100% {
        transform: translateX(0);
    }
}

* {
    box-sizing: border-box;
}

h1,
h2,
h3,
h4,
h5 {
    margin: 0;
}

a {
    color: cornflowerblue;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}

:host {
    position: relative;
    display: block;
    width: 100%;
    min-height: 100vh;
    background-color: #fff;
    user-select: none;
    overflow: hidden;

    --red: rgb(255, 99, 71, .8);
    --amber: rgba(255, 165, 0, .8);
    --green: rgba(34, 139, 34, .8);
}

.loader {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 450px;
    background: #fff;
    padding: 10px;
    font-size: 19px;
}
:host(.--ready) .loader {
    display: none;
}
.loader-info {
    position: absolute;
    top: 10px;
    left: 10px;
}
.loader__error {
    color: var(--red);
}

.spinner {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(2, auto);
    grid-column: 1 / span 2;
    justify-self: center;
    height: 80px;
    animation: spin .5s linear infinite;
}
:host(.--error) .spinner {
    display: none;
}
.spinner__part {
    width: 32px;
    height: 40px;
    border: solid 10px red;
    border-radius: 50%;
    border-top-width: 0;
}
.spinner__part.--top-left {
    transform: rotate(135deg);
}
.spinner__part.--top-right {
    transform: rotate(-135deg);
}
.spinner__part.--bottom-left {
    transform: rotate(45deg);
}
.spinner__part.--bottom-right {
    transform: rotate(-45deg);
}

.title {
    display: grid;
    padding: 10px;
}

.club-info-grid {
    display: grid;
    grid-row-gap: 10px;
    padding: 10px;
}
.club-info-grid__map {
    width: 100%;
    background-color: #eee;
}
.club-info-grid__location-info {
    display: grid;
}
.club-info-grid__site-link {
    justify-self: start;
    margin-top: 10px;
}
.search {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    grid-column-gap: 5px;
    padding: 10px;
}

.search__radios {
    display: grid;
    grid-row-gap: 5px;
}

.forecast-grid {
    display: grid;
    grid-template-rows: minmax(auto, 130px) repeat(3, minmax(auto, 260px));
    grid-template-columns: 100%;
    grid-row-gap: 10px;
    width: 100%;
    height: 100vh;
    flex-shrink: 0;
    padding: 10px;
}
@media screen and (min-aspect-ratio: 375/666) {
    .forecast-grid {
        height: auto;
    }
}
:host(:not(.--ready)) .forecast-grid {
    display: none;
}
.forecast-grid-header {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: repeat(2, auto);
    grid-column-gap: 10px;
    align-items: center;
    border-left: solid 10px lightgray;
    padding-left: 10px;
}
.forecast-grid-header.--red {
    border-color: var(--red);
}
.forecast-grid-header.--amber {
    border-color: orange;
}
.forecast-grid-header.--green {
    border-color: var(--green);
}
.forecast-grid-header-date {
    display: flex;
    align-items: center;
    justify-content: left;
}
.forecast-grid-header-date__date-string {
    margin-left: 10px;
}
.forecast-grid-header__summary {
    grid-row: 2;
    grid-column: 1 / span 2;
}
.forecast-grid-header-sun-info__item {
    text-align: right;
    padding: 5px;
    font-weight: normal;
}
.forecast-grid-header-sun-info__item.--sunset {
    background-color: #eee;
    color: gray;
}
.forecast-grid-forecast {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto minmax(80px, 1fr) auto;
    grid-column-gap: 10px;
}
.forecast-grid-forecast__weather-photo {
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
}
.forecast-grid-forecast__time {
    position: absolute;
    left: 10px;
    top: 10px;
    border-radius: 50%;
    color: #fff;
    background-color: rgba(0, 0, 0, .1);
    border: solid 3px rgba(255, 255, 255, .8);
    padding: 10px;
}
.forecast-grid-forecast-weather {
    grid-column: 1;
    grid-row: 3;
    display: flex;
    align-items: center;
    padding: 5px 0;
    overflow: hidden;
}
.forecast-grid-forecast-weather__type {
    flex-grow: 1;
    margin-right: 10px;
    word-break: break-word;
    height: 100%;
}
@media screen and (max-width: 359px) {
    .forecast-grid-forecast-weather {
        justify-content: flex-end;
    }
    .forecast-grid-forecast-weather__type {
        display: none;
    }
}
.forecast-grid-forecast-weather__temperature {
    align-self: start;
}
.forecast-data-grid {
    grid-column: 2;
    grid-row: 2 / span 2;
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-template-rows: 80px auto;
    grid-column-gap: 5px;
    align-self: end;
}
.forecast-data-grid__type {
    display: grid;
    justify-items: center;
    align-items: center;
    background: rgba(255, 255, 255, .8);
}
.forecast-data-grid__type.--red {
    color: var(--red);
}
.forecast-data-grid__type.--green {
    color: var(--green);
}
.forecast-data-grid__data {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.forecast-data-grid__data.--red {
    background-color: var(--red);
    color: #fff;
}
.forecast-data-grid__data.--amber {
   background-color: var(--amber);
}
.forecast-data-grid__data.--green {
    background-color: var(--green);
    color: #fff;
}

.icon-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: solid 4px;
}
.icon-circle.--red {
    color: var(--red);
}
.icon-circle.--amber {
    color: var(--amber);
}
.icon-circle.--green {
    color: var(--green);
}

.footer {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 10px;
}
:host(:not(.--ready)) .footer {
    display: none;
}
`;
