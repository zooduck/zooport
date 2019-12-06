import { graphqlConfig } from '../../config/index';
import { darkSkyQuery } from './graphql-queries/dark-sky-query';
import { DateTime } from 'luxon';
import { DailyForecast, GeocodeData, HourlyData, SkydiveClub } from './interfaces/index'; // eslint-disable-line no-unused-vars
import { skydiveClubQuery } from './graphql-queries/skydive-club-query';

export class SkyduckWeather {
    private _hourlyData: any;
    private _dailyData: any;
    private _skydiveClub: SkydiveClub;

    private _floatToInt(float: number): number {
        return parseInt(float.toString(), 10);
    }

    private _fractionToPercent(fraction: number): number {
        return parseInt((fraction * 100).toString(), 10);
    }

    private _formatDailyData(dailyData: any, timezone: string): any {
        return dailyData.map((dailyItem: any) => {
            return {
                ...dailyItem,
                dateString: this._getTZDateString(dailyItem.time, timezone).substr(0, 5),
                timeString: this._getTZTimeString(dailyItem.time, timezone).substr(0, 2),
                sunriseTimeString: this._getTZTimeString(dailyItem.sunriseTime, timezone),
                sunsetTimeString: this._getTZTimeString(dailyItem.sunsetTime, timezone),
                day: this._getTZTime(dailyItem.time, timezone).weekdayShort,
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
                hourly: this._hourlyData.filter((hourlyItem: HourlyData) => {
                    const hourlyItemDate = this._getTZDateString(hourlyItem.time, timezone);
                    const dailyItemDate = this._getTZDateString(dailyItem.time, timezone);

                    return hourlyItemDate === dailyItemDate;
                }),
            };
        });
    }

    private _formatHourlyData(hourlyData: HourlyData[], timezone: string): any {
        return hourlyData.filter((item: any) => {
            const local = DateTime.fromSeconds(item.time);
            const tz = local.setZone(timezone);

            return tz.hour === 9 || tz.hour === 12 || tz.hour === 15;
        }).map((hourlyItem: HourlyData) => {
            return {
                ...hourlyItem,
                dateString: this._getTZDateString(hourlyItem.time, timezone).substr(0, 5),
                timeString: this._getTZTimeString(hourlyItem.time, timezone).substr(0, 2),
                day: this._getTZTime(hourlyItem.time, timezone).weekdayShort,
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

    public async getDailyForecastByClub(name: string): Promise<DailyForecast> {
        const skydiveClub: SkydiveClub = await this._querySkydiveClub(name);

        if (!skydiveClub) {
            throw new Error(`Could not find club "${name}". Try searching by location instead.`);
        }

        this._skydiveClub = skydiveClub;

        const dbWeatherResult = await this._queryDatabase(skydiveClub.id);
        const oneHourAgo = DateTime.local().minus({ hours: 1 }).toMillis();

        if (dbWeatherResult.error || dbWeatherResult.requestTime < oneHourAgo) {
            const darkSkyData = await this._queryDarkSky(skydiveClub.latitude, skydiveClub.longitude, name);
            const method = dbWeatherResult.error ? 'POST' : 'PUT';
            const dbWeatherUpdate = await this._updateWeatherDatabase(darkSkyData, method);
            const dbWeatherUpdateResult = await dbWeatherUpdate.json();

            return {
                query: darkSkyData.query,
                club: darkSkyData.club,
                weather: {
                    ...dbWeatherUpdateResult,
                }
            };
        }

        return {
            query: name,
            club: this._skydiveClub,
            weather: {
                ...dbWeatherResult,
            }
        };

    }

    public async getDailyForecastByQuery(geocodeData: GeocodeData): Promise<DailyForecast> {
        const { name: place, latitude, longitude, locationQuery } = geocodeData;

        this._skydiveClub = {
            id: '',
            name: '',
            place,
            latitude,
            longitude,
            site: '',
        };

        const darkSkyData = await this._queryDarkSky(latitude, longitude, locationQuery);

        return {
            query: darkSkyData.query,
            club: darkSkyData.club,
            weather: darkSkyData.weather,
            countryRegion: geocodeData.address.countryRegion,
        };
    }

    private _getTZDateString(timeInSeconds: number, timezone: string): string {
        const tzTime = this._getTZTime(timeInSeconds, timezone);

        return tzTime.toLocaleString(DateTime.DATE_SHORT);
    }

    private _getTZTime(timeInSeconds: number, timezone: string): DateTime {
        const localTime = DateTime.fromSeconds(timeInSeconds);
        const tzTime = localTime.setZone(timezone);

        return tzTime;
    }

    private _getTZTimeString(timeInSeconds: number, timezone: string): string {
        const tzTime = this._getTZTime(timeInSeconds, timezone);

        return tzTime.toLocaleString(DateTime.TIME_24_SIMPLE);
    }

    private async _queryDarkSky(lat: number, lon: number, query: string): Promise<DailyForecast> {
        try {
            const graphqlResult = await fetch(graphqlConfig.uri, {
                ...graphqlConfig.options,
                body: JSON.stringify({
                    query: darkSkyQuery,
                    variables: {
                        lat,
                        lon,
                    },
                }),
            });

            const json = await graphqlResult.json();

            const timezone = json.data.weather.timezone;
            this._hourlyData = this._formatHourlyData(json.data.weather.hourly.data, timezone);
            this._dailyData = this._formatDailyData(json.data.weather.daily.data, timezone);

            return {
                query,
                club: this._skydiveClub,
                weather: {
                    latitude: json.data.weather.latitude,
                    longitude: json.data.weather.longitude,
                    timezone: json.data.weather.timezone,
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

    private async _queryDatabase(clubId: string): Promise<DailyForecast|any> {
        const dbWeatherQuery = await fetch(`/weather?id=${clubId}`);
        const dbWeatherResult = await dbWeatherQuery.json();

        return dbWeatherResult;
    }

    private async _querySkydiveClub(name: string): Promise<SkydiveClub> {
        try {
            const graphqlResult = await fetch(graphqlConfig.uri, {
                ...graphqlConfig.options,
                body: JSON.stringify({
                    query: skydiveClubQuery,
                    variables: {
                        name,
                    },
                }),
            });

            const json = await graphqlResult.json();

            return json.data.club;
        } catch (err) {
            throw new Error(err);
        }
    }

    private async _updateWeatherDatabase(darkSkyData: DailyForecast, method: 'POST'|'PUT'): Promise<any> {
        const result = await fetch('/weather', {
            method,
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                ...darkSkyData.club,
                ...darkSkyData.weather,
                requestTime: new Date().getTime(),
            }),
        });

        if (!result.ok) {
            throw new Error(`${result.status} (${result.statusText})`);
        }

        return result;
    }
}
