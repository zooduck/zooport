interface DailyAverages {
    clouds: number;
    windSpeed: number;
}

interface Data {
    city: any;
    days: any[];
}

interface Limits {
    clouds: {
        green: number;
        amber: number;
    };
    wind: {
        green: number;
        amber: number;
    }
}

export class SkydiveWeather {
    private _url: string;
    private _data: any;
    private _limits: any;

    constructor() {
        this._url = 'https://community-open-weather-map.p.rapidapi.com/forecast?units=metric';
        this._limits = {
            solo: {
                clouds: {
                    green: 25,
                    amber: 45,
                },
                wind: {
                    green: 15,
                    amber: 25,
                }
            },
            student: {
                clouds: {
                    green: 15,
                    amber: 25,
                },
                wind: {
                    green: 10,
                    amber: 15,
                }
            },
        };
    }

    private _getCloudsStatus(dailyAverages: DailyAverages, limits: Limits) {
        return limits.clouds.green >= dailyAverages.clouds ? 'green' : limits.clouds.amber >= dailyAverages.clouds ? 'amber' : 'red';
    }

    private _getWindspeedStatus(dailyAverages: DailyAverages, limits: Limits) {
        return limits.wind.green >= dailyAverages.windSpeed ? 'green' : limits.wind.amber >= dailyAverages.windSpeed ? 'amber' : 'red';
    }

    private _getWeatherStatus(dailyAverages: DailyAverages) {
        const soloCloudsStatus = this._getCloudsStatus(dailyAverages, this._limits.solo);
        const soloWindspeedStatus = this._getWindspeedStatus(dailyAverages, this._limits.solo);
        const studentCloudsStatus = this._getCloudsStatus(dailyAverages, this._limits.student);
        const studentWindspeedStatus = this._getWindspeedStatus(dailyAverages, this._limits.student);

        const soloStatus = (soloCloudsStatus === 'red' || soloWindspeedStatus === 'red')
            ? 'red'
            : (soloCloudsStatus === 'amber' || soloWindspeedStatus === 'amber')
                ? 'amber'
                : 'green';

        const studentStatus = (studentCloudsStatus === 'red' || studentWindspeedStatus === 'red')
            ? 'red'
            : (studentCloudsStatus === 'amber' || studentWindspeedStatus === 'amber')
                ? 'amber'
                : 'green';

        return {
            solo: soloStatus,
            student: studentStatus,
        };
    }

    private _getDailyAverages(parts: any[]) {
        let clouds = 0;
        let windSpeed = 0;


        parts.forEach(part => {
            clouds += part.clouds.all;
            windSpeed += part.wind.speedMph;
        });

        return {
            clouds: parseInt(Number(clouds / parts.length).toFixed(0), 10),
            windSpeed: parseInt(Number(windSpeed / parts.length).toFixed(0), 10),
        };
    }

    private _getThreeHourWeatherStatus(clouds: number, windSpeed: number, limits: Limits) {
        return (limits.clouds.amber <= clouds || limits.wind.amber <= windSpeed)
            ? 'red'
            : (limits.clouds.green <= clouds || limits.wind.green <= windSpeed)
                ? 'amber'
                : 'green';
    }

    private _getStatus(clouds: number, windSpeed: number) {
        const soloStatus = this._getThreeHourWeatherStatus(clouds, windSpeed, this._limits.solo);
        const studentStatus = this._getThreeHourWeatherStatus(clouds, windSpeed, this._limits.student);

        return {
            solo: soloStatus,
            student: studentStatus,
        };
    }

    private _buildDaysData(data: any): Data {
        const days = [];
        const metresPerSecondToKnots = 1.94384;
        const metresPerSecondToMph =  2.23694;

        for (let i = 0; i < 5; i++) {
            const dateTxt = data.list[0].dt_txt.split(' ')[0];
            const parts = data.list.splice(0, 8).map((item: any) => {
                item.wind.speedKnots = parseFloat(new Number(item.wind.speed * metresPerSecondToKnots).toFixed(2));
                item.wind.speedMph = parseFloat(new Number(item.wind.speed * metresPerSecondToMph).toFixed(2));
                item.status = this._getStatus(item.clouds.all, item.wind.speedKnots);
                item.hour = new Date(item.dt * 1000).getHours();

                return item;
            }).filter((item: any) => {
                return item.hour >=9 && item.hour <= 18;
            }).sort((a: any, b: any) => a.hour - b.hour);

            const dailyAverages = this._getDailyAverages(parts);
            const status = this._getWeatherStatus(dailyAverages);

            days[dateTxt] = {
                parts,
                status,
            };
        }

        return {
            city: data.city,
            days,
        };
    }

    private _buildQuery(q: string): string {
        return `${this._url}${encodeURI(q)}`;
    }

    private async _fetchForecast(q: string) {
        const response = await fetch(q, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
                'x-rapidapi-key': '13e59c897amshc025873b1bf10fap1cc31ajsn90a84ec597e6',
            },
        });

        const json = await response.json();
        this._data = this._buildDaysData(json);

        return this._data;
    }

    public async getForeCastLatLong(lat: number, lon: number) {
        const q = this._buildQuery(`&lat=${lat}&lon=${lon}`);
        const data = await this._fetchForecast(q);

        return data;
    }

    public async getForecastLocation(location: string) {
        const q = this._buildQuery(`&q=${location}`);
        const data = await this._fetchForecast(q);

        return data;
    }

}
