import { DailyForecast } from './skyduck-weather'; // eslint-disable-line no-unused-vars
import { iconMap } from './icon-map';
import '../skyduck-radio/skyduck-radio.component';

interface DailyData {
    cloudCover: number;
    windSpeed: number;
    windGust: number;
    temperatureHigh: number;
    temperatureLow: number;
    temperatureAverage: number;
    apparentTemperatureHigh: number;
    apparentTemperatureLow: number;
    apparentTemperatureAverage: number;
    time: number;
    icon: string;
    summary: string;
    hourly: HourlyData[];
}

interface HourlyData {
    cloudCover: number;
    windSpeed: number;
    windGust: number;
    temperature: number;
    apparentTemperature: number;
    time: number;
    icon: string;
    precipProbability: number;
}

interface ColorModifiers {
    cloudCover: string;
    windSpeed: string;
    windGust: string;
    temperature: string;
    precipProbability: string;
}

interface ColorModifiersData {
    cloudCover: number;
    windSpeed: number;
    windGust: number;
    temperature: number;
    precipProbability: number;
}

interface IconData {
    icon: string;
    modifier: string;
}

export interface WeatherElements {
    footer: HTMLElement;
    map: HTMLIFrameElement;
    days: HTMLCollection;
    place: HTMLElement;
    search: HTMLElement;
    title: HTMLElement;
}

export class SkyduckWeatherElements {
    private _dailyForecast: DailyForecast;
    private _date: Date;
    private _domParser: DOMParser;
    private _googleMapsKey: string;

    constructor(dailyForecast: DailyForecast, googleMapsKey: string) {
        this._dailyForecast = dailyForecast;
        this._date = new Date(dailyForecast.weather.requestTime);
        this._domParser = new DOMParser();
        this._googleMapsKey = googleMapsKey;
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

    private _buildDayHeader(dailyData: DailyData): string {
        const { icon: dailyDataIcon, cloudCover, time, summary } = dailyData;
        const iconData = this._getIconData(dailyDataIcon, cloudCover);
        const date = new Date(time * 1000).toLocaleDateString().substr(0, 5);
        const day = new Date(time * 1000).toDateString().substr(0, 3);

        const dayHeaderTitle = `
            <div class="skyduck-weather__daily-data-title ${iconData.modifier}">
                <h3 class="skyduck-weather__daily-data-title-date">${day} ${date}</h3>
                <span class="skyduck-weather__daily-data-title-summary">${summary}</span>
            </div>
        `;

        return dayHeaderTitle;
    }

    private _buildDays(): HTMLCollection {
        const days: string[] = this._dailyForecast.weather.daily.data.map((dailyDataItem: DailyData): string => {
            const day = this._buildDayHeader(dailyDataItem);
            const hours = dailyDataItem.hourly.map((hourlyDataItem: HourlyData) => {
                return this._buildHour(hourlyDataItem);
            });

            return `${day}${hours.join('')}`;
        });

        return this._domParser.parseFromString(days.join(''), 'text/html').body.children;
    }

    private _buildFooter(): HTMLElement {
        const footer = this._domParser.parseFromString(`
            <div class="skyduck-weather__footer">
                <span>${this._date.toLocaleDateString()} ${this._date.toLocaleTimeString()}</span>
                <a href="https://darksky.net/poweredby/" target="_blank">Powered by Dark Sky</a>
            </div>
        `, 'text/html').body.firstChild;

        return footer as HTMLElement;
    }

    private _buildForecastItems(
        type: 'daily' | 'hourly',
        colorModifiers: ColorModifiers,
        cloudCover: number,
        windSpeed: number,
        windGust: number,
        precipProbability: number): string {
        return `
            <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.cloudCover}">
                <i class="fas fa-cloud"></i>
                <span>${cloudCover}%</span>
            </div>

            <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.windSpeed}">
                <i class="fas fa-wind"></i>
                <span>${windSpeed}</span>
            </div>

            <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.windGust}">
                <i class="fas fa-wind"></i>
                <span>${windGust}</span>
            </div>

            <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.precipProbability}">
                <i class="fas fa-cloud-showers-heavy"></i>
                <span>${precipProbability}%</span>
            </div>
        `;
    }

    private _buildGoogleMap(): HTMLIFrameElement {
        const params = {
            key: this._googleMapsKey,
            q: this._dailyForecast.weather.place,
            zoom: '8',
            center: `${this._dailyForecast.weather.latitude},${this._dailyForecast.weather.longitude}`,
            maptype: 'roadmap',
        };
        const queryString = new URLSearchParams(params).toString();
        const url = `https://google.com/maps/embed/v1/place?${queryString}`;

        const iframe = this._domParser.parseFromString(
            `<iframe src="${url}" frameborder="0" class="skyduck-weather__map"></iframe>
        `, 'text/html').body.firstChild;

        return iframe as HTMLIFrameElement;
    }

    private _buildHour(hourlyData: HourlyData) {
        const { icon: hourlyDataIcon, cloudCover, windSpeed, windGust, time, precipProbability } = hourlyData;
        const colorModifiersData: ColorModifiersData = {
            cloudCover,
            windSpeed,
            windGust,
            temperature: hourlyData.apparentTemperature,
            precipProbability,
        };
        const colorModifiers = this._getColorModifiers(colorModifiersData);
        const iconData = this._getIconData(hourlyDataIcon, cloudCover);
        const icon = iconData.icon;
        const date = new Date(time * 1000).toLocaleTimeString().substr(0, 5);

        const html = `
            <div class="skyduck-weather__hourly-data-date">
                <span>${date}</span>
            </div>

            <div class="skyduck-weather__hourly-data-weather-icon ${iconData.modifier}">
                <i class="fas fa-${icon}"></i>
            </div>

            ${this._buildForecastItems('hourly', colorModifiers, cloudCover, windSpeed, windGust, precipProbability)}
        `;

        return html;
    }

    private _buildPlace(): HTMLElement {
        const weather = this._dailyForecast.weather;
        const place = weather.countryRegion ? weather.place.concat(',').concat(weather.countryRegion) : weather.place;

        const placeEl = this._domParser.parseFromString(`
            <div class="skyduck-weather__place">
                ${this._formatPlace(place)}
                <br>
                <a href="${weather.site}" target="_blank">${weather.site.replace(/https?:\/+/, '')}</a>
            </div>
        `, 'text/html').body.firstChild;

        return placeEl as HTMLElement;
    }

    private _buildSearch(): HTMLElement {
        const search = this._domParser.parseFromString(`
            <div class="skyduck-weather__search">
                <zooduck-input class="skyduck-weather__search-input" label="Search">
                    <i slot="left-icon" class="fas fa-map-marked-alt"></i>
                </zooduck-input>
                <form class="skyduck-weather__search-radios">
                    <skyduck-radio name="searchType" value="club" checked></skyduck-radio>
                    <skyduck-radio name="searchType" value="location"></skyduck-radio>
                </form>
            </div>
        `, 'text/html').body.firstChild;

        return search as HTMLElement;
    }

    private _buildTitle(): HTMLElement {
        const title = this._domParser.parseFromString(`
            <div class="skyduck-weather__title">
                <h1 style="margin: 0">Skyduck Weather</h1>
                <span>Weekly Skydiving forecast by Zooduck</span>
            </div>
        `, 'text/html').body.firstChild;

        return title as HTMLElement;
    }

    private _getColorModifiers(colorModifiersData: ColorModifiersData): ColorModifiers {
        return {
            cloudCover: `--${this._rateCloudCover(colorModifiersData.cloudCover)}`,
            windSpeed: `--${this._rateWindSpeed(colorModifiersData.windSpeed)}`,
            windGust: `--${this._rateWindGust(colorModifiersData.windGust)}`,
            temperature: `--${this._rateTemperature(colorModifiersData.temperature)}`,
            precipProbability: `--${this._ratePrecipProbability(colorModifiersData.precipProbability)}`,
        };
    }

    private _getIconData(icon: string, cloudCover: number): IconData {
        if (icon === 'rain' && cloudCover <= 30) {
            return iconMap['cloud-sun-rain'] || iconMap.default;
        }

        return iconMap[icon] || iconMap.default;
    }

    private _rateCloudCover(cloudCover: number): 'green'|'amber'|'red' {
        return cloudCover <= 25
            ? 'green'
            : cloudCover <= 50
                ? 'amber'
                : 'red';
    }

    private _rateWindSpeed(windSpeed: number): 'green'|'amber'|'red' {
        return windSpeed <= 10
            ? 'green'
            : windSpeed <= 20
                ? 'amber'
                : 'red';
    }

    private _rateWindGust(windGust: number): 'green'|'amber'|'red' {
        return this._rateWindSpeed(windGust);
    }

    private _rateTemperature(temperature: number): 'green'|'amber'|'red' {
        return temperature >= 15
            ? 'green'
            : temperature >= 10
                ? 'amber'
                : 'red';
    }

    private _ratePrecipProbability(precipProbability: number): 'green'|'amber'|'red' {
        return precipProbability <= 20
            ? 'green'
            : precipProbability <= 50
                ? 'amber'
                : 'red';
    }

    public get footer(): HTMLElement {
        return this._buildFooter();
    }

    public get map(): HTMLIFrameElement {
        return this._buildGoogleMap();
    }

    public get days(): HTMLCollection {
        return this._buildDays();
    }

    public get place(): HTMLElement {
        return this._buildPlace();
    }

    public get search(): HTMLElement {
        return this._buildSearch();
    }

    public get title(): HTMLElement {
        return this._buildTitle();
    }
}
