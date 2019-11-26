export const darkSkyQuery = `query DarkskyData($lat: Float!, $lon: Float!) {
    weather(latitude: $lat, longitude: $lon) {
        latitude,
        longitude,
        timezone,
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
                apparentTemperatureHigh,
                apparentTemperatureLow,
                humidity,
                windSpeed,
                windGust,
                windBearing,
                cloudCover,
                visibility
            }
        },
        hourly {
            data {
                time,
                summary,
                icon,
                precipProbability,
                temperature,
                apparentTemperature,
                humidity,
                windSpeed,
                windGust,
                windBearing,
                cloudCover,
                visibility
            }
        }
    }
}`;
