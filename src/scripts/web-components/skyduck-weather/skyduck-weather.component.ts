import { style } from './skyduck-weather.style';
import { SkyduckWeatherElements } from './skyduck-weather.elements';
import { SkyduckWeather } from './skyduck-weather';
/* eslint-disable */
import {
    ModifierClasses,
    SearchType,
    SetContentOptions,
    WeatherElements,
    DailyForecast,
    GeocodeData
} from './interfaces/index';
import { LatLonSpin } from './utils/lat-lon-spin';
import { weatherImageMap } from './utils/weather-image-map';
import { DateTime } from 'luxon';

interface WeatherImages {
        'clear-day': string,
        cloudy: string;
        default: string;
        fog: string;
        'partly-cloudy-day': string;
        snow: string;
        wind: string;
}

interface PointerEvents {
    pointerdown: number[];
    pointerup: number;
}

/* eslint-enable */
class HTMLSkyduckWeatherElement extends HTMLElement {
    private _club: string;
    private _domParser: DOMParser;
    private _error: string;
    private _forecast: DailyForecast;
    private _geocodeData: GeocodeData;
    private _googleMapsKey: string;
    private _hasLoaded = false;
    private _images: WeatherImages = {
        'clear-day': '',
        cloudy: '',
        default: '',
        fog: '',
        'partly-cloudy-day': '',
        snow: '',
        wind: '',
    };
    private _imagesReady = false;
    private _isSearchInProgress = false;
    private _modifierClasses: ModifierClasses = {
        ready: '--ready',
        error: '--error',
    };
    private _onSearchSubmit: EventListener;
    private _pointerEvents: PointerEvents = {
        pointerdown: [],
        pointerup: 0,
    };
    private _location: string;
    private _latLonSpin: LatLonSpin;
    private _searchType: SearchType = 'club';
    private _weather: SkyduckWeather;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this._domParser = new DOMParser();
        this._latLonSpin = new LatLonSpin();
        this._weather = new SkyduckWeather();
    }

    static get observedAttributes() {
        return [
            'club',
            'location',
        ];
    }

    public get club(): string {
        return this._club;
    }

    public set club(val: string|null) {
        this._club = val;
        if (val !== null) {
            this.removeAttribute('location');
            this._updateContent();
        }
        this._syncStringAttr('club', this.club);
    }

    public get location() {
        return this._location;
    }

    public set location(val: string|null) {
        this._location = val;
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
        this._syncStringAttr('location', this._location);
    }

    private _addEventListeners(): void {
        this._onSearchSubmit = (e: CustomEvent) => {
            const { value } = e.detail;

            if (!value || this._isSearchInProgress) {
                return;
            }

            this._isSearchInProgress = true;

            this.scrollIntoView();

            const searchTypeFormData = new FormData(this.shadowRoot.querySelector('.search__radios'));
            this._searchType = searchTypeFormData.get('searchType') as SearchType;

            switch (this._searchType) {
            case 'club':
                this.club = value;
                break;
            case 'location':
                this.location = value;
                break;
            default: // do nothing
            }
        };

        this.shadowRoot.querySelector('zooduck-input')
            .addEventListener('keypress:enter', this._onSearchSubmit);

        const skyduckCarousel = this.shadowRoot.querySelector('skyduck-carousel');
        skyduckCarousel
            .addEventListener('pointerdown', () => {
                this._pointerEvents.pointerdown.push(new Date().getTime());
            });
        skyduckCarousel
            .addEventListener('pointerup', () => {
                this._pointerEvents.pointerup = new Date().getTime();
                if (this._isDoubleTap()) {
                    skyduckCarousel.scrollIntoView({ behavior: 'smooth' });
                }
            });
    }

    private _clearContent(): void {
        this.shadowRoot.innerHTML = '';
        this.classList.remove(this._modifierClasses.ready);
        this.classList.remove(this._modifierClasses.error);
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

    private _geocodeLookup(): Promise<void> {
        return fetch(`/geocode?place=${this._location}`).then(async (result) => {
            const json = await result.json();
            const resource = json.resourceSets[0].resources[0];

            if (!resource) {
                this._geocodeData = null;
                throw Error(`Unable to resolve coordinates for location of "${this._location}."`);
            }

            const coords = resource.geocodePoints[0].coordinates;
            const { name, address } = resource;

            this._geocodeData = {
                locationQuery: this._location,
                address,
                name,
                latitude: coords[0],
                longitude: coords[1],
            };
        }, (err) => {
            throw Error(err);
        });
    }

    private async _getGoogleMapsKey(): Promise<string> {
        if (!this._googleMapsKey) {
            const response =  await fetch('/googlemapskey');
            this._googleMapsKey = response.status === 200 ? await response.text() : '';
        }

        return this._googleMapsKey;
    }

    private async _getImages(): Promise<void> {
        const imagesLoaded = [];

        return new Promise((resolve) => {
            const imageLinks = Object.keys(weatherImageMap).map((key) => {
                return {
                    key,
                    url: weatherImageMap[key],
                };
            });
            imageLinks.forEach(async (link) => {
                fetch(link.url).then(async (response) => {
                    const imageData = await response.blob();
                    this._images[link.key] = URL.createObjectURL(imageData);
                    imagesLoaded.push(link);

                    if (imagesLoaded.length === imageLinks.length) {
                        this._imagesReady = true;
                        resolve();
                    }
                }).catch((err) => {
                    console.error(err); // eslint-disable-line no-console
                    resolve();
                });
            });
        });
    }

    private _getLoader(): HTMLElement {
        const loader = this._domParser.parseFromString(`
            <div class="loader" id="skyduck-loader">
                <div class="loader-info">
                    <div id="loaderInfoLat"></div>
                    <div id="loaderInfoLon"></div>
                    <div id="loaderInfoIANA"></div>
                    <div id="loaderInfoLocalTime"></div>
                </div>
                <div id="loaderError" class="loader__error"></div>
                <div class="spinner">
                    <span class="spinner__part --top-left"></span>
                    <span class="spinner__part --top-right"></span>
                    <span class="spinner__part --bottom-left"></span>
                    <span class="spinner__part --bottom-right"></span>
                </div>
            </div>
        `, 'text/html').body.firstChild as HTMLElement;

        loader.addEventListener('click', () => {
            if (this._forecast) {
                this._error = '';
                this.classList.remove(this._modifierClasses.error);
                this._setContent({
                    useLoader: false,
                });
            }
        });

        return loader as HTMLElement;
    }

    private _getStyle(): HTMLStyleElement {
        const styleEl = document.createElement('style');
        styleEl.textContent = style;

        return styleEl;
    }

    private _isDoubleTap(): boolean {
        if (this._pointerEvents.pointerdown.length < 2) {
            return false;
        }

        const secondToLastPointerDownTime = this._pointerEvents.pointerdown.slice(-2, -1)[0];
        const lastPointerDownTime = this._pointerEvents.pointerdown.slice(-1)[0];
        const maxTimeBetweenPointerDown = 250;

        return (lastPointerDownTime - secondToLastPointerDownTime) < maxTimeBetweenPointerDown;
    }

    private async _loaderInfoDisplay(): Promise<void> {
        const delay = 1000;
        const loaderInfoLat = this.shadowRoot.querySelector('#loaderInfoLat') as HTMLElement;
        const loaderInfoLon = this.shadowRoot.querySelector('#loaderInfoLon') as HTMLElement;
        const loaderInfoIANA = this.shadowRoot.querySelector('#loaderInfoIANA');
        const loaderInfoLocalTime = this.shadowRoot.querySelector('#loaderInfoLocalTime');

        this._latLonSpin.apply(loaderInfoLat, 'Lat:&nbsp;');
        await this._wait(delay);
        this._latLonSpin.setContent(loaderInfoLat, `Lat: ${this._forecast.weather.latitude.toString().substr(0, 9)}`);
        loaderInfoLat.classList.add('--ready');

        this._latLonSpin.apply(loaderInfoLon, 'Lon:&nbsp;');
        await this._wait(delay);
        this._latLonSpin.setContent(loaderInfoLon, `Lon: ${this._forecast.weather.longitude.toString().substr(0, 9)}`);
        loaderInfoLon.classList.add('--ready');

        loaderInfoIANA.innerHTML = `IANA: ${this._forecast.weather.timezone}`;
        loaderInfoIANA.classList.add('--ready');
        await this._wait(delay);

        const locationTime = DateTime.local()
            .setZone(this._forecast.weather.timezone)
            .toLocaleString(DateTime.TIME_24_SIMPLE);

        loaderInfoLocalTime.innerHTML = `Local Time: ${locationTime}`;
        await this._wait(delay);
    }

    private async _setContent(options: SetContentOptions = { useLoader: true }): Promise<void> {
        this._isSearchInProgress = false;

        if (!this._imagesReady) {
            await this._getImages();
        }

        if (this._error) {
            this.classList.add(this._modifierClasses.error);

            const loaderError =  this.shadowRoot.querySelector('#loaderError');
            loaderError.innerHTML = this._error;

            return;
        }

        if (options.useLoader) {
            await this._loaderInfoDisplay();
        }

        const googleMapsKey = await this._getGoogleMapsKey();
        const weatherElements: WeatherElements = new SkyduckWeatherElements(this._forecast, this._images, googleMapsKey, this._searchType);
        const { title, locationInfo, search, forecast, footer } = weatherElements;

        const skyduckRadios = Array.from(search.querySelectorAll('skyduck-radio')) as Element[];

        this._customElementsLoaded(skyduckRadios).then(() => {
            this._addEventListeners();
        });

        this.shadowRoot.appendChild(title);
        this.shadowRoot.appendChild(locationInfo);
        this.shadowRoot.appendChild(search);
        this.shadowRoot.appendChild(forecast);
        this.shadowRoot.appendChild(footer);

        this.classList.add(this._modifierClasses.ready);
        this.classList.remove(this._modifierClasses.error);

        if (this._hasLoaded) {
            this.scrollIntoView();
        }

        this._hasLoaded = true;
    }

    private _syncStringAttr(name: string, val: string) {
        if (this.getAttribute(name) === val) {
            return;
        }

        this.setAttribute(name, val);
    }

    private async _updateContent(): Promise<void> {
        this._clearContent();

        this.shadowRoot.appendChild(this._getStyle());
        this.shadowRoot.appendChild(this._getLoader());

        if (!this.club && !this._geocodeData) {
            this._setContent();

            return;
        }

        try {
            if (this._club) {
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
