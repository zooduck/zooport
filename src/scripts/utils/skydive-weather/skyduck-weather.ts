import { graphqlConfig } from '../../config/index';

interface Coords {
    club: string;
    latitude: number;
    location: string;
    longitude: number;
    site: string;
}

export class SkyduckWeather {
    private _coords: Coords[];
    private _template: string;
    constructor() {
        this._coords = [
            {
                club: 'Skydive Langar',
                latitude: 52.889805,
                location: 'Langar, Nottinghamshire, UK',
                longitude: -0.906808,
                site: 'https://skydivelangar.co.uk',
            },
            {
                club: 'North London Skydiving Centre',
                latitude: 52.487691,
                location: 'Chatteris, UK',
                longitude: 0.088212,
                site: 'https://ukskydiving.com',
            },
            {
                club: 'Skydive Headcorn',
                latitude: 51.154044,
                location: 'Headcorn, Ashford, UK',
                longitude: 0.645511,
                site: 'https://headcorn.com',
            },
            {
                club: 'Army Parachute Association',
                latitude: 51.245641,
                location: 'Netheravon, Salisbury, UK',
                longitude: -1.760713,
                site: 'https://netheravon.com',
            },
            {
                club: 'London Parachute School (LPS)',
                latitude: 51.552760,
                location: 'Chiltern Park Aerodrome, Ipsden, UK',
                longitude: -1.100669,
                site: 'https://skydivinglondon.com',
            },
            {
                club: 'Skydive Hibaldstow',
                latitude: 53.500222,
                location: 'Hibaldstow Airfield, UK',
                longitude: -0.523414,
                site: 'https://skydiving.co.uk',
            },
            {
                club: 'UK Parachuting',
                latitude: 52.555305,
                location: 'Sibson Airfield, Peterborough, UK',
                longitude: -0.390292,
                site: 'https://skydivesibson.co.uk',
            },
        ];
    }

    public async getDailyForecast(locationOrClub: string) {
        try {
            const coords: Coords = this._coords.find((item) => {
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

            const graphqlResult = await fetch(graphqlConfig.uri, {
                ...graphqlConfig.options,
                body: JSON.stringify({
                    query,
                    variables: {
                        lat: coords.latitude,
                        lon: coords.longitude,
                    },
                }),
            });

            const json = await graphqlResult.json();

            return {
                data: {
                    weather: {
                        ...json.data.weather,
                        club: coords.club,
                        location: coords.location,
                        site: coords.site,
                    }
                }
            };
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    }
}
