import { style } from './skyduck-weather.style';
import { SkyduckWeatherElements, WeatherElements } from './skyduck-weather.elements'; // eslint-disable-line no-unused-vars
import { DailyForecast, GeocodeData, SkyduckWeather } from './skyduck-weather'; // eslint-disable-line no-unused-vars

interface ModifierClasses {
    ready: string;
    error: string;
}

interface SetContentOptions {
    useLoader: boolean;
}

class HTMLSkyduckWeatherElement extends HTMLElement {
    private _club: string;
    private _container: HTMLElement;
    private _domParser: DOMParser;
    private _error: string;
    private _forecast: DailyForecast;
    private _geocodeData: GeocodeData;
    private _googleMapsKey: string;
    private _modifierClasses: ModifierClasses = {
        ready: '--ready',
        error: '--error',
    };
    private _onSearchSubmit: EventListener;
    private _place: string;
    private _searchType = 'club';
    private _weather: SkyduckWeather;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this._weather = new SkyduckWeather();
        this._domParser = new DOMParser();

        this._container = document.createElement('div');
        this._container.className = 'skyduck-weather';

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
            this._updateContent();
        }
        this._syncStringAttr('club', this.club);
    }

    private get place() {
        return this._place;
    }

    private set place(val: string|null) {
        this._place = val;
        if (val !== null) {
            this.removeAttribute('club');
            this._geocodeLookup().then(() => {
            }).catch((err) => {
                console.error(err); // eslint-disable-line no-console
                this._error = err;
            }).then(() => {
                this._updateContent();
            });
        }
        this._syncStringAttr('place', this.place);
    }

    private _addEventListeners() {
        this._onSearchSubmit = (e: CustomEvent) => {
            const { value } = e.detail;

            if (!value) {
                return;
            }

            const searchTypeFormData = new FormData(this.shadowRoot.querySelector('.skyduck-weather__search-radios'));
            this._searchType = searchTypeFormData.get('searchType') as string;

            switch (this._searchType) {
            case 'club':
                this.club = value;
                break;
            case 'location':
                this.place = value;
                break;
            default: // do nothing
            }
        };

        this.shadowRoot.querySelector('zooduck-input')
            .addEventListener('keypress:enter', this._onSearchSubmit);
    }

    private _clearContainer() {
        this._container.innerHTML = '';
        this._container.classList.remove(this._modifierClasses.ready);
        this._container.classList.remove(this._modifierClasses.error);
    }

    private async _customElementsLoaded(customElements: Element[]): Promise<void> {
        const customElementsLoaded = [];
        const customElementsToLoad = 2;

        return new Promise((resolve) => {
            customElements.forEach((el) => {
                el.addEventListener('ready', (e: CustomEvent) => {
                    customElementsLoaded.push(e);
                    if (customElementsLoaded.length === customElementsToLoad) {
                        resolve();
                    }
                });
            });
        });
    }

    private _geocodeLookup(): Promise<any> {
        return fetch(`/geocode?place=${this.place}`).then(async (result) => {
            const json = await result.json();
            const resource = json.resourceSets[0].resources[0];

            if (!resource) {
                this._geocodeData = null;
                throw Error(`Geocode unable to resolve location "${this.place}"`);
            }

            const coords = resource.geocodePoints[0].coordinates;
            const { name, address } = resource;

            this._geocodeData = {
                address,
                name,
                latitude: coords[0],
                longitude: coords[1],
            };
        }, (err) => {
            throw Error(err);
        });
    }

    private _getFontAwesomeLink(): HTMLLinkElement {
        const link = this._domParser.parseFromString(`
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
                crossorigin="anonymous"
                integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=">
        `, 'text/html').head.firstChild;

        return link as HTMLLinkElement;
    }

    private async _getGoogleMapsKey(): Promise<string> {
        if (!this._googleMapsKey) {
            const response =  await fetch('/googlemapskey');
            this._googleMapsKey = response.status === 200 ? await response.text() : '';
        }

        return this._googleMapsKey;
    }

    private _getLoader(): HTMLElement {
        const loader = this._domParser.parseFromString(`
            <i class="skyduck-weather__loader far fa-compass fa-spin"></i>
        `, 'text/html').body.firstChild;

        return loader as HTMLElement;
    }

    private _getErrorNotification(): HTMLElement {
        const errorNotification = this._domParser.parseFromString(`
            <div class="skyduck-weather__error">
                <span>${this._error}</span>
            </div>
        `, 'text/html').body.firstChild;

        errorNotification.addEventListener('click', () => {
            this._error = '';
            this._container.classList.remove(this._modifierClasses.error);
            this._setContent({
                useLoader: false,
            });
        });

        return errorNotification as HTMLElement;
    }

    private _getStyle(): HTMLStyleElement {
        const styleEl = document.createElement('style');
        styleEl.textContent = style;

        return styleEl;
    }

    private async _setContent(options: SetContentOptions = { useLoader: true }) {
        if (this._error) {
            this._container.classList.add(this._modifierClasses.error);
            this._container.appendChild(this._getErrorNotification());

            return;
        }

        if (options.useLoader) {
            const minLoaderTime = 1000;
            await this._wait(minLoaderTime);
        }

        const googleMapsKey = await this._getGoogleMapsKey();
        const weatherElements: WeatherElements = new SkyduckWeatherElements(this._forecast, googleMapsKey, this._searchType);
        const { title, map, place, days, footer, search } = weatherElements;

        const customElements = Array.from(search.querySelectorAll('skyduck-radio'));
        this._customElementsLoaded(customElements).then(() => {
            this._addEventListeners();
        });

        this._container.appendChild(title);
        this._container.appendChild(map);
        this._container.appendChild(place);
        this._container.appendChild(search);
        days.forEach(el => this._container.appendChild(el));
        this._container.appendChild(footer);

        this._container.classList.add(this._modifierClasses.ready);
        this._container.classList.remove(this._modifierClasses.error);
    }

    private _syncStringAttr(name: string, val: string) {
        if (this.getAttribute(name) === val) {
            return;
        }

        this.setAttribute(name, val);
    }

    private async _updateContent() {
        this._clearContainer();
        this._container.appendChild(this._getLoader());

        if (!this.club && !this._geocodeData) {
            this._setContent();

            return;
        }

        try {
            if (this.club) {
                this._forecast = await this._weather.getDailyForecastByClub(this.club);
            } else if (this._geocodeData) {
                this._forecast = await this._weather.getDailyForecastByQuery(this._geocodeData);
            }
            this._error = '';
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
            this._error = err;
        } finally {
            this._setContent();
        }
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

customElements.define('skyduck-weather', HTMLSkyduckWeatherElement);
