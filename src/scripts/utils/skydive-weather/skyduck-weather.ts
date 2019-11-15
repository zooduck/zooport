import { graphqlConfig } from '../../config/index';
import { skydiveCentres } from './skydive-centres';

interface SkydiveCentre {
    club: string;
    latitude: number;
    location: string;
    longitude: number;
    site: string;
}

export class SkyduckWeather {
    constructor() {}

    public async getDailyForecast(locationOrClub: string) {
        const skydiveCentre: SkydiveCentre = skydiveCentres.find((item) => {
            const searchable = `${item.club} ${item.location}`;

            return searchable.search(new RegExp(locationOrClub, 'i')) !== -1;
        }) || {
            latitude: 0,
            longitude: 0,
            club: 'N/A',
            location: 'N/A',
            site: 'N/A',
        };

        const query = `query DarkskyData($lat: Float!, $lon: Float!) {
            weather(latitude: $lat, longitude: $lon) {
                latitude,
                longitude,
                daily {
                    summary,
                    icon,
                    data {
                        time,
                        summary,
                        icon,
                        precipProbability,
                        precipType,
                        temperatureHigh,
                        temperatureLow,
                        windSpeed,
                        windGust,
                        cloudCover
                    }
                }
            }
        }`;

        try {
            const graphqlResult = await fetch(graphqlConfig.uri, {
                ...graphqlConfig.options,
                body: JSON.stringify({
                    query,
                    variables: {
                        lat: skydiveCentre.latitude,
                        lon: skydiveCentre.longitude,
                    },
                }),
            });

            const json = await graphqlResult.json();

            return {
                data: {
                    weather: {
                        ...json.data.weather,
                        club: skydiveCentre.club,
                        location: skydiveCentre.location,
                        site: skydiveCentre.site,
                    }
                }
            };
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    }
}
