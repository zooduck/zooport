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
}

interface ColorModifiersData {
    cloudCover: number;
    windSpeed: number;
    windGust: number;
    temperature: number;
}

interface IconData {
    icon: string;
    modifier: string;
}

interface ColorModifiers {
    cloudCover: string;
    windSpeed: string;
    windGust: string;
    temperature: string;
}

export interface WeatherElements {
    footer: HTMLElement;
    header: HTMLCollection;
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

    private _buildDay(dailyData: DailyData) {
        const { icon: dailyDataIcon, cloudCover, windSpeed, windGust, time, apparentTemperatureAverage } = dailyData;
        const colorModifiersData: ColorModifiersData = {
            cloudCover,
            windSpeed,
            windGust,
            temperature: dailyData.apparentTemperatureAverage
        };
        const colorModifiers = this._getColorModifiers(colorModifiersData);
        const iconData = this._getIconData(dailyDataIcon, cloudCover);
        const icon = iconData.icon;
        const date = new Date(time * 1000).toLocaleDateString().substr(0, 5);
        const day = new Date(time * 1000).toDateString().substr(0, 3);

        const html = `
            <div class="skyduck-weather__daily-data-title ${iconData.modifier}">
                <div class="skyduck-weather__daily-data-date ${iconData.modifier}">
                    <span>${day}</span>
                    <span>${date}</span>
                </div>

                <div class="skyduck-weather__daily-data-weather-icon ${iconData.modifier}">
                    <i class="fas fa-${icon}"></i>
                </div>
            </div>

            ${this._buildForecastItems('daily', colorModifiers, cloudCover, windSpeed, windGust, apparentTemperatureAverage)}
        `;

        return html;
    }

    private _buildDays(): HTMLCollection {
        const days: string[] = this._dailyForecast.weather.daily.data.map((dailyDataItem: DailyData): string => {
            const day = this._buildDay(dailyDataItem);
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
        temperature: number): string {
        return `
        <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.cloudCover}">
            <span>${cloudCover}%</span>
        </div>

        <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.windSpeed}">
            <span>${windSpeed}</span>
            <small>mph</small>
        </div>

        <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.windGust}">
            <span>${windGust}</span>
            <small>mph</small>
        </div>

        <div class="skyduck-weather__${type}-data-forecast ${colorModifiers.temperature}">
            <span>${temperature}&deg;C<span>
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

    private _buildHeader(): HTMLCollection {
        const weather = this._dailyForecast.weather;
        const header = this._domParser.parseFromString(`
            <div class="skyduck-weather__header-summary">
                <span>${weather.daily.summary}</span>
            </div>
            <i class="skyduck-weather__header-icon --cloud-cover fas fa-cloud"></i>
            <i class="skyduck-weather__header-icon --wind fas fa-wind"></i>
            <i class="skyduck-weather__header-icon --temperature fas fa-temperature-low"></i>
        `, 'text/html').body.children;

        return header as HTMLCollection;
    }

    private _buildHour(hourlyData: HourlyData) {
        const { icon: hourlyDataIcon, cloudCover, windSpeed, windGust, time, apparentTemperature } = hourlyData;
        const colorModifiersData: ColorModifiersData = {
            cloudCover,
            windSpeed,
            windGust,
            temperature: hourlyData.apparentTemperature,
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

            ${this._buildForecastItems('hourly', colorModifiers, cloudCover, windSpeed, windGust, apparentTemperature)}
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
            cloudCover: colorModifiersData.cloudCover <= 20 ? '--green' : colorModifiersData.cloudCover <= 50 ? '--amber' : '--red',
            windSpeed: colorModifiersData.windSpeed <= 18 ? '--green' : colorModifiersData.windSpeed <= 25 ? '--amber' : '--red',
            windGust : colorModifiersData.windGust <= 18 ? '--green' : colorModifiersData.windGust <= 25 ? '--amber' : '--red',
            temperature: colorModifiersData.temperature >= 15 ? '--green' : colorModifiersData.temperature >= 10 ? '--amber' : '--red',
        };
    }

    private _getIconData(icon: string, cloudCover: number): IconData {
        if (icon === 'rain' && cloudCover <= 30) {
            return iconMap['cloud-sun-rain'] || iconMap.default;
        }

        return iconMap[icon] || iconMap.default;
    }

    public get footer(): HTMLElement {
        return this._buildFooter();
    }

    public get header(): HTMLCollection {
        return this._buildHeader();
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
