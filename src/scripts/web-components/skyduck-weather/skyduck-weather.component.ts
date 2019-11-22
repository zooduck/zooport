import { style } from './skyduck-weather.style';
import { SkyduckWeatherElements, WeatherElements } from './skyduck-weather.elements'; // eslint-disable-line no-unused-vars
import { DailyForecast, GeocodeData, SkyduckWeather } from './skyduck-weather'; // eslint-disable-line no-unused-vars

class Skyduck extends HTMLElement {
    private _club: string;
    private _place: string;
    private _geocodeData: GeocodeData;
    private _forecast: DailyForecast;
    private _container: HTMLDivElement;
    private _googleMapsKey: string;
    private _weather: SkyduckWeather;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this._weather = new SkyduckWeather();

        this._container = document.createElement('div');
        this._container.className = 'skyduck-weather';
        this._container.innerHTML = '<i class="skyduck-weather__loader far fa-compass fa-spin"></i>';

        const style = this._getStyle();
        const link = this._getFontAwesomeLink();

        this.shadowRoot.appendChild(link);
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this._container);
    }

    static get observedAttributes() {
        return [
            'club',
            'place',
        ];
    }

    private get club() {
        return this._club;
    }

    private set club(val: string|null) {
        this._club = val;
        if (val !== null) {
            this.removeAttribute('place');
        }
        this._syncStringAttr('club', this.club);
        this._updateContent();
    }

    private get place() {
        return this._place;
    }

    private set place(val: string|null) {
        this._place = val;
        if (val !== null) {
            this.removeAttribute('club');
        }
        this._syncStringAttr('place', this.place);
        this._geocodeLookup().then(() => {
            this._updateContent();
        });
    }

    private _geocodeLookup(): Promise<void> {
        return fetch(`/geocode?place=${this.place}`).then(async (result) => {
            const json = await result.json();
            const resource = json.resourceSets[0].resources[0];
            const coords = resource.geocodePoints[0].coordinates;
            const { name, address } = resource;
            this._geocodeData = {
                address,
                name,
                latitude: coords[0],
                longitude: coords[1],
            };
        }).catch((err) => {
            console.error(err); // eslint-disable-line no-console
        });
    }

    private _getFontAwesomeLink(): HTMLLinkElement {
        const link = new DOMParser().parseFromString(`
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
                crossorigin="anonymous"
                integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=">
        `, 'text/html').head.firstChild;

        return link as HTMLLinkElement;
    }

    private _getStyle(): HTMLStyleElement {
        const styleEl = document.createElement('style');
        styleEl.textContent = style;

        return styleEl;
    }

    private async _getGoogleMapsKey(): Promise<string> {
        if (!this._googleMapsKey) {
            const response =  await fetch('/googlemapskey');
            this._googleMapsKey = response.status === 200 ? await response.text() : '';
        }

        return this._googleMapsKey;
    }

    private async _setContent() {
        const googleMapsKey = await this._getGoogleMapsKey();
        const weatherElements: WeatherElements = new SkyduckWeatherElements(this._forecast, googleMapsKey);
        const { title, map, place, days, footer, search } = weatherElements;

        this._container.innerHTML = '';

        this._container.appendChild(title);
        this._container.appendChild(map);
        this._container.appendChild(place);
        this._container.appendChild(search);
        Array.from(days).forEach(el => this._container.appendChild(el));
        this._container.appendChild(footer);
    }

    private _syncStringAttr(name: string, val: string) {
        if (this.getAttribute(name) === val) {
            return;
        }

        this.setAttribute(name, val);
    }

    private async _updateContent() {
        if (!this.club && !this._geocodeData) {
            return;
        }

        try {
            if (this.club) {
                this._forecast = await this._weather.getDailyForecastByClub(this.club);
            } else if (this._geocodeData) {
                this._forecast = await this._weather.getDailyForecastByQuery(this._geocodeData);
            }
        } catch (err) {
            throw new Error(err);
        }

        await this._wait(1000); // show loading spinner for at least 1 second

        this._setContent();
    }

    private _wait(delay: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }

    protected attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
        if (this[name] !== newVal) {
            this[name] = newVal;
        }
    }
}

customElements.define('skyduck-weather', Skyduck);
