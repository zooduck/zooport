import { graphqlConfig } from '../../config/index';
import { skydiveCentres, SkydiveCentre } from './skydive-centres'; // eslint-disable-line no-unused-vars
import { darkSkyQuery } from './dark-sky-query';

export interface DailyForecast {
    weather: {
        club: string;
        daily: {
            summary: string;
            icon: string;
            data: any[];
        }
        hourly?: {
            summary: string;
            icon: string;
            data: any[];
        }
        latitude: number;
        longitude: number;
        place: string;
        countryRegion?: any;
        site: string;
        requestTime?: number;
    }
}

export interface GeocodeData {
    name: string;
    address: any;
    latitude: number;
    longitude: number;
}

export class SkyduckWeather {
    private _hourlyData: any;
    private _dailyData: any;

    constructor() {}

    private _escapeSpecialChars(query: string) {
        let queryEscaped = query;
        const specialChars = ['[', ']', '/', '^', '$', '?', '*', '(', ')'];
        specialChars.forEach((specialChar) => {
            queryEscaped = queryEscaped.replace(new RegExp('\\' + specialChar, 'g'), `\\${specialChar}`);
        });

        return queryEscaped;
    }

    private _floatToInt(float: number): number {
        return parseInt(float.toString(), 10);
    }

    private _fractionToPercent(fraction: number): number {
        return parseInt((fraction * 100).toString(), 10);
    }

    private _formatDailyData(dailyData: any) {
        return dailyData.map((dailyItem: any) => {
            return {
                ...dailyItem,
                cloudCover: this._fractionToPercent(dailyItem.cloudCover),
                precipProbability: this._fractionToPercent(dailyItem.precipProbability),
                temperatureLow: this._floatToInt(dailyItem.temperatureLow),
                temperatureHigh: this._floatToInt(dailyItem.temperatureHigh),
                temperatureAverage: this._floatToInt((dailyItem.temperatureHigh + dailyItem.temperatureLow) / 2),
                apparentTemperatureLow: this._floatToInt(dailyItem.apparentTemperatureLow),
                apparentTemperatureHigh: this._floatToInt(dailyItem.apparentTemperatureHigh),
                apparentTemperatureAverage: this._floatToInt((dailyItem.apparentTemperatureHigh + dailyItem.apparentTemperatureLow) / 2),
                humidity: this._fractionToPercent(dailyItem.humidity),
                windGust: this._floatToInt(dailyItem.windGust),
                windSpeed: this._floatToInt(dailyItem.windSpeed),
                visibility: this._floatToInt(dailyItem.visibility),
                hourly: this._hourlyData.filter((hourlyItem: any) => {
                    const dailyItemDate = new Date(dailyItem.time * 1000).getDate();
                    const hourlyItemDate = new Date(hourlyItem.time * 1000).getDate();

                    return hourlyItemDate === dailyItemDate;
                }),
            };
        });
    }

    private _formatHourlyData(hourlyData: any) {
        return hourlyData.filter((item: any) => {
            const hours = new Date(item.time * 1000).getHours();

            return hours === 9 || hours === 12 || hours === 15 || hours === 18;
        }).map((hourlyItem: any) => {
            return {
                ...hourlyItem,
                cloudCover: this._fractionToPercent(hourlyItem.cloudCover),
                precipProbability: this._fractionToPercent(hourlyItem.precipProbability),
                temperature: this._floatToInt(hourlyItem.temperature),
                apparentTemperature: this._floatToInt(hourlyItem.apparentTemperature),
                humidity: this._fractionToPercent(hourlyItem.humidity),
                windGust: this._floatToInt(hourlyItem.windGust),
                windSpeed: this._floatToInt(hourlyItem.windSpeed),
                visibility:  this._floatToInt(hourlyItem.visibility),
            };
        });
    }

    private async _queryDarkSky(skydiveCentre: SkydiveCentre): Promise<DailyForecast> {
        try {
            const graphqlResult = await fetch(graphqlConfig.uri, {
                ...graphqlConfig.options,
                body: JSON.stringify({
                    query: darkSkyQuery,
                    variables: {
                        lat: skydiveCentre.latitude,
                        lon: skydiveCentre.longitude,
                    },
                }),
            });

            const json = await graphqlResult.json();

            this._hourlyData = this._formatHourlyData(json.data.weather.hourly.data);
            this._dailyData = this._formatDailyData(json.data.weather.daily.data);

            return {
                weather: {
                    ...skydiveCentre,
                    latitude: json.data.weather.latitude,
                    longitude: json.data.weather.longitude,
                    daily: {
                        summary: json.data.weather.daily.summary,
                        icon: json.data.weather.daily.icon,
                        data: this._dailyData,
                    },
                    requestTime: new Date().getTime(),
                }
            };
        } catch (err) {
            throw new Error(err);
        }
    }

    private async _queryDatabase(clubId: string): Promise<any> {
        const dbWeatherQuery = await fetch(`/weather?id=${clubId}`);
        const dbWeatherResult = await dbWeatherQuery.json();

        return dbWeatherResult;
    }

    private async _updateWeatherDatabase(darkSkyData: DailyForecast, method: 'POST' | 'PUT'): Promise<any> {
        const result = await fetch('/weather', {
            method,
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                ...darkSkyData.weather,
                requestTime: new Date().getTime(),
            }),
        });

        if (!result.ok) {
            throw new Error(`${result.status} (${result.statusText})`);
        }

        return result;
    }

    public async getDailyForecastByQuery(geocodeData: GeocodeData): Promise<DailyForecast> {
        const { name: place, latitude, longitude } = geocodeData;
        const darkSkyData = await this._queryDarkSky({
            id: '',
            club: '',
            place,
            site: '',
            latitude,
            longitude,
        });

        return {
            weather: {
                ...darkSkyData.weather,
                countryRegion: geocodeData.address.countryRegion,
            }
        };
    }

    public async getDailyForecastByClub(club: string): Promise<DailyForecast> {
        const skydiveCentre = skydiveCentres.find((item) => `${item.club} ${item.place}`.search(new RegExp(this._escapeSpecialChars(club), 'i')) !== -1);

        if (!skydiveCentre) {
            throw new Error(`Could not find club "${club}". Try searching by location instead.`);
        }

        const dbWeatherResult = await this._queryDatabase(skydiveCentre.id);
        const oneHour = 1000 * 60 * 60;
        const oneHourAgo = new Date().getTime() - oneHour;

        if (dbWeatherResult.error || dbWeatherResult.requestTime < oneHourAgo) {
            const darkSkyData = await this._queryDarkSky(skydiveCentre);
            const method = dbWeatherResult.error ? 'POST' : 'PUT';
            const dbWeatherUpdate = await this._updateWeatherDatabase(darkSkyData, method);
            const dbWeatherUpdateResult = await dbWeatherUpdate.json();

            return {
                weather: {
                    ...dbWeatherUpdateResult,
                }
            };
        }

        return {
            weather: {
                ...dbWeatherResult,
            }
        };

    }
}
