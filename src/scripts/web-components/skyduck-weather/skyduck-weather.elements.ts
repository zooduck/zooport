import { DateTime } from 'luxon';
import { weatherRatings } from './utils/skyduck-weather-ratings';
import '../skyduck-radio/skyduck-radio.component';
import '../skyduck-carousel/skyduck-carousel.component';
/* eslint-disable */
import {
    HourlyData,
    ColorModifier,
    ForecastData,
    ColorModifiersData,
    ColorModifiers,
    SearchType,
    DailyForecast,
    Rating,
    Ratings,
    WeatherImageMap
} from './interfaces/index';
import { HTMLSkyduckCarouselElement } from '../skyduck-carousel/skyduck-carousel.component';
/* eslint-enable */

export class SkyduckWeatherElements {
    private _dailyForecast: DailyForecast;
    private _defaultSearchType: string;
    private _domParser: DOMParser;
    private _googleMapsKey: string;
    private _imageMap: WeatherImageMap;
    private _requestTime: string;

    constructor(
        dailyForecast: DailyForecast,
        imageMap: WeatherImageMap,
        googleMapsKey: string,
        defaultSearchType: SearchType) {
        this._dailyForecast = dailyForecast;
        this._requestTime = DateTime
            .fromMillis(dailyForecast.weather.requestTime)
            .toLocaleString(DateTime.DATETIME_SHORT)
            .replace(',', '');
        this._defaultSearchType = defaultSearchType;
        this._domParser = new DOMParser();
        this._googleMapsKey = googleMapsKey;
        this._imageMap = imageMap;
    }

    private _buildFooter(): HTMLElement {
        const footer = this._domParser.parseFromString(`
            <div class="footer">
                <span>${this._requestTime}</span>
                <a href="https://darksky.net/poweredby/" target="_blank">Powered by Dark Sky</a>
            </div>
        `, 'text/html').body.firstChild;

        return footer as HTMLElement;
    }

    private _buildForecastCarousel(): HTMLSkyduckCarouselElement {
        const carousel = document.createElement('skyduck-carousel');

        const forecastSlides = this._dailyForecast.weather.daily.data.filter((dailyData) => {
            return dailyData.hourly.length;
        }).map((dailyData) => {
            return this._buildForecast(dailyData);
        });

        const slot = document.createElement('div');
        slot.setAttribute('slot', 'slides');

        forecastSlides.forEach((slide) => {
            slot.appendChild(slide);
        });

        carousel.appendChild(slot);

        return carousel as HTMLSkyduckCarouselElement;
    }

    private _buildForecastHour(hourlyData: HourlyData): string {
        const {
            timeString,
            icon,
            summary,
            temperature,
            precipType,
            precipProbability,
            cloudCover,
            windGust,
        } = hourlyData;

        const weatherImagePath = this._imageMap[icon] || this._imageMap.default;
        const colorModifiers = this._getColorModifiers(hourlyData);

        const forecastHour = `
            <div class="forecast-grid-forecast">
                <div class="forecast-grid-forecast__weather-photo" style="background-image: url('${weatherImagePath}')"></div>

                <h2 class="forecast-grid-forecast__time">${timeString}</h2>

                <div class="forecast-grid-forecast-weather">
                    <h4 class="forecast-grid-forecast-weather__type">${summary}</h4>
                    <h2 class="forecast-grid-forecast-weather__temperature">${temperature}&deg;</h2>
                </div>

                <div class="forecast-data-grid">
                    <div class="forecast-data-grid__type ${colorModifiers.cloudCover}">
                        <i class="icon-circle ${colorModifiers.cloudCover}"></i>
                        <span>cloud</span>
                    </div>
                    <div class="forecast-data-grid__type ${colorModifiers.windGust}">
                        <i class="icon-circle ${colorModifiers.windGust}"></i>
                        <span>wind</span>
                    </div>
                    <div class="forecast-data-grid__type ${colorModifiers.precipProbability}">
                        <i class="icon-circle ${colorModifiers.precipProbability}"></i>
                        <span>${precipType || 'rain'}</span>
                    </div>

                    <div class="forecast-data-grid__data ${colorModifiers.cloudCover}">${cloudCover}%</div>
                    <div class="forecast-data-grid__data ${colorModifiers.windGust}">
                        <span>${windGust}</span>
                        <small>mph</small>
                    </div>
                    <div class="forecast-data-grid__data ${colorModifiers.precipProbability}">${precipProbability}%</div>
                </div>
            </div>
        `;

        return forecastHour;
    }

    private _buildForecast(dayForecast: ForecastData): HTMLElement {
        const {
            day,
            dateString,
            summary,
            sunriseTimeString,
            sunsetTimeString,
            hourly,
        } = dayForecast;

        const hours = hourly.map((hour: HourlyData) => {
            return this._buildForecastHour(hour);
        });

        const averageRatingModifier = this._getAverageRatingModifier(hourly);

        const forecast = this._domParser.parseFromString(`
            <div class="forecast-grid">
                <div class="forecast-grid-header ${averageRatingModifier}">
                    <div class="forecast-grid-header-date">
                        <h2>${day}</h2>
                        <h1 class="forecast-grid-header-date__date-string">${dateString}</h1>
                    </div>
                    <span class="forecast-grid-header__summary">${summary}</span>
                    <div class="forecast-grid-header-sun-info">
                        <h3 class="forecast-grid-header-sun-info__item">Rise: ${sunriseTimeString}</h3>
                        <h3 class="forecast-grid-header-sun-info__item --sunset">Set: ${sunsetTimeString}</h3>
                    </div>
                </div>
                ${hours.join('')}
            </div>
        `, 'text/html').body.firstChild;

        return forecast as HTMLElement;
    }

    private _buildGoogleMap(): HTMLIFrameElement {
        const params = {
            key: this._googleMapsKey,
            q: this._dailyForecast.club.place,
            zoom: '8',
            center: `${this._dailyForecast.weather.latitude},${this._dailyForecast.weather.longitude}`,
            maptype: 'roadmap',
        };
        const queryString = new URLSearchParams(params).toString();
        const url = `https://google.com/maps/embed/v1/place?${queryString}`;
        const iframe = this._domParser.parseFromString(
            `<iframe src="${url}" frameborder="0" class="club-info-grid__map"></iframe>
        `, 'text/html').body.firstChild;

        return iframe as HTMLIFrameElement;
    }

    private _buildLocationInfo(): HTMLElement {
        const locationInfo = document.createElement('div');
        locationInfo.className = 'club-info-grid';
        locationInfo.appendChild(this._buildGoogleMap());
        locationInfo.appendChild(this._buildPlace());

        return locationInfo;
    }

    private _buildPlace(): HTMLElement {
        const { countryRegion, club } = this._dailyForecast;
        const place = countryRegion ? club.place.concat(',').concat(countryRegion) : club.place;
        const site = club.site
            ? `<a class="club-info-grid__site-link" href="${club.site}" target="_blank">${club.site.replace(/https?:\/+/, '')}</a>`
            : '';
        const placeEl = this._domParser.parseFromString(`
            <div class="club-info-grid__location-info">
                ${this._formatPlace(place)}
                ${site}
            </div>
        `, 'text/html').body.firstChild;

        return placeEl as HTMLElement;
    }

    private _buildSearch(): HTMLElement {
        const search = this._domParser.parseFromString(`
            <div class="search">
                <zooduck-input label="Search" placeholder="e.g. skydive spain, netheravon..."></zooduck-input>
                <form class="search__radios">
                    <skyduck-radio name="searchType" value="club" ${this._defaultSearchType === 'club' ? 'checked' : ''}></skyduck-radio>
                    <skyduck-radio name="searchType" value="location" ${this._defaultSearchType === 'location' ? 'checked' : ''}></skyduck-radio>
                </form>
            </div>
        `, 'text/html').body.firstChild;

        return search as HTMLElement;
    }

    private _buildTitle(): HTMLElement {
        const title = this._domParser.parseFromString(`
            <div class="title">
                <h1>Skyduck Weather</h1>
                <span>7 day skydiving forecast by Zooduck</span>
            </div>
        `, 'text/html').body.firstChild;

        return title as HTMLElement;
    }

    private _formatPlace(place: string): string {
        const parts = place.split(',');
        const uniqueParts = [];
        parts.forEach((part) => {
            const _part = part.trim();
            if (!uniqueParts.includes(_part)) {
                uniqueParts.push(_part);
            }
        });
        const html = uniqueParts.map((part, i) => {
            if (i === 0) {
                return `<h3>${part}</h3>`;
            } else {
                return `<span>${part}</span>`;
            }
        });

        return html.join('');
    }

    private _getAverageRatingModifier(hourlyForecasts: HourlyData[]): ColorModifier {
        const hourlyRatings = hourlyForecasts.map((hour: HourlyData): Rating[] => {
            const { cloudCover, windGust } = hour;

            return [
                weatherRatings.cloudCover(cloudCover),
                weatherRatings.windGust(windGust),
            ];
        });
        const hourlyRatingsFlattened = hourlyRatings.toString().split(',') as Ratings;
        const averageRatingModifier = `--${weatherRatings.average(hourlyRatingsFlattened)}` as ColorModifier;

        return averageRatingModifier;
    }

    private _getColorModifiers(colorModifiersData: ColorModifiersData): ColorModifiers {
        return {
            cloudCover: `--${weatherRatings.cloudCover(colorModifiersData.cloudCover)}` as ColorModifier,
            windSpeed: `--${weatherRatings.windSpeed(colorModifiersData.windSpeed)}` as ColorModifier,
            windGust: `--${weatherRatings.windGust(colorModifiersData.windGust)}` as ColorModifier,
            precipProbability: `--${weatherRatings.precipProbability(colorModifiersData.precipProbability)}` as ColorModifier,
            visibility: `--${weatherRatings.visibility(colorModifiersData.visibility)}` as ColorModifier,
        };
    }

    public get locationInfo(): HTMLElement {
        return this._buildLocationInfo();
    }

    public get forecast(): HTMLElement {
        return this._buildForecastCarousel();
    }

    public get footer(): HTMLElement {
        return this._buildFooter();
    }

    public get search(): HTMLElement {
        return this._buildSearch();
    }

    public get title(): HTMLElement {
        return this._buildTitle();
    }
}
