import * as images from '../../../../assets/img/*.jpg';

const {
    'clear-day': clearDay,
    cloudy,
    'partly-cloudy-day': partlyCloudyDay,
    fog,
    snow,
    wind,
} = images;

export const weatherImageMap = {
    'clear-day': clearDay,
    cloudy,
    default: partlyCloudyDay,
    fog,
    'partly-cloudy-day': partlyCloudyDay,
    snow,
    wind,
};
