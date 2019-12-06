export type ColorModifier = '--red'|'--amber'|'--green';
export type SearchType = 'club'|'location';
export type Rating = 'red'|'amber'|'green';
export type Ratings = Rating[];

export interface ColorModifiers {
    cloudCover: ColorModifier;
    windSpeed: ColorModifier;
    windGust: ColorModifier;
    precipProbability: ColorModifier;
    visibility: ColorModifier;
}
export interface ColorModifiersData {
    cloudCover: number;
    windSpeed: number;
    windGust: number;
    temperature: number;
    precipProbability: number;
    visibility: number;
}
export interface DailyForecast {
    query: string;
    club: SkydiveClub;
    weather: {
        daily: {
            summary: string;
            icon: string;
            data: any[];
        }
        latitude: number;
        longitude: number;
        timezone: string;
        requestTime?: number;
    }
    countryRegion?: any;
}
export interface ForecastData {
    apparentTemperature: number;
    cloudCover: number;
    dateString: string;
    day: string;
    hourly: HourlyData[];
    humidity: number;
    icon: string;
    precipType: string;
    precipProbability: number;
    summary: string;
    temperature: number;
    timezone: string;
    timeString: string;
    visibility: number;
    windBearing: number;
    windGust: number;
    windSpeed: number;
    sunriseTimeString: string;
    sunsetTimeString: string;
}
export interface GeocodeData {
    locationQuery: string;
    name: string;
    address: any;
    latitude: number;
    longitude: number;
}
export interface HourlyData {
    cloudCover: number;
    dateString: string;
    timeString: string;
    day: string;
    humidity: number;
    visibility: number;
    windSpeed: number;
    windGust: number;
    temperature: number;
    apparentTemperature: number;
    time: number;
    icon: string;
    precipType: string;
    precipProbability: number;
    summary: string;
}
export interface ModifierClasses {
    ready: string;
    error: string;
}
export interface SetContentOptions {
    useLoader: boolean;
}
export interface SkydiveClub {
    id: string;
    name: string;
    place: string;
    latitude: number;
    longitude: number;
    site: string;
}
export interface WeatherElements {
    footer: HTMLElement;
    forecast: HTMLElement;
    locationInfo: HTMLElement;
    search: HTMLElement;
    title: HTMLElement;
}
export interface WeatherImageMap {
    'clear-day': string,
    cloudy: string;
    default: string;
    fog: string;
    'partly-cloudy-day': string;
    snow: string;
    wind: string;
}
