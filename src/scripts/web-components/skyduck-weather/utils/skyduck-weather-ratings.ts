import { Ratings, Rating } from '../interfaces/index'; // eslint-disable-line no-unused-vars

export const weatherRatings = (() => {
    const _getMostCommonRating = (ratings: Ratings): Rating => {
        const reds = ratings.filter((rating: string) => rating === 'red');
        const ambers = ratings.filter((rating: string) => rating === 'amber');
        const greens = ratings.filter((rating: string) => rating === 'green');

        const mostlyReds = reds.length > ambers.length && reds.length > greens.length;
        const mostlyAmbers = ambers.length > reds.length && ambers.length > greens.length;
        const mostlyGreens = greens.length > reds.length && greens.length > ambers.length;

        return mostlyReds
            ? 'red'
            : mostlyAmbers
                ? 'amber'
                : mostlyGreens
                    ? 'green'
                    : reds.length
                        ? 'red'
                        : ambers.length
                            ? 'amber'
                            : 'green';
    };

    return {
        cloudCover(cloudCover: number): Rating {
            return cloudCover <= 25
                ? 'green'
                : cloudCover <= 50
                    ? 'amber'
                    : 'red';
        },
        windSpeed(windSpeed: number): Rating {
            return windSpeed <= 10
                ? 'green'
                : windSpeed <= 20
                    ? 'amber'
                    : 'red';
        },
        windGust(windGust: number): Rating {
            return this.windSpeed(windGust);
        },
        precipProbability(precipProbability: number): Rating {
            return precipProbability <= 20
                ? 'green'
                : precipProbability <= 50
                    ? 'amber'
                    : 'red';
        },
        visibility(visibility: number): Rating {
            return visibility >= 5
                ? 'green'
                : visibility >= 3
                    ? 'amber'
                    : 'red';
        },
        average(ratings: Ratings) {
            return _getMostCommonRating(ratings);
        }
    };
})();
