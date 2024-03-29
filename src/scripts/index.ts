/* eslint-disable no-console */
import 'regenerator-runtime/runtime'; // required for async/await to work with babel7+
import { siteInfo, ZooHeader, versionScramble, wait } from './utils/index';
import { graphqlConfig } from './config/index';
import { SkydiveWeather } from './utils/skydive-weather/index';
import { SkyduckWeather } from './web-components/skyduck-weather/skyduck-weather';
import './web-components/skyduck-weather/skyduck-weather.component';

const loadIntro = async () => {
    const delayBetweenTransitions = 500;
    const introAnimation = new ZooHeader(document.querySelector('.zooport__header'));
    await introAnimation.run();

    await wait(delayBetweenTransitions);

    const version = await siteInfo.version;
    const versionInfoEl = document.querySelector('.zooport__version-info') as HTMLElement;
    versionInfoEl.classList.remove('--hidden');
    versionScramble.element = versionInfoEl;
    await versionScramble.run(version);

    document.querySelector('.zooport__filter').classList.remove('--hidden');

    // await wait(delayBetweenTransitions);

    // document.querySelector('.zooport__footer').classList.remove('--hidden');
    // document.querySelector('.zooport__footer').addEventListener('click', function() {
    //     this.classList.toggle('--minified');
    // });
};

loadIntro().then(() => {
    window.addEventListener('scroll', () => {
        const zooport = document.querySelector('#zooport');
        if (window.scrollY > 99) {
            zooport.classList.add('--no-header');
        } else {
            zooport.classList.remove('--no-header');
        }
    });
});

// const initSkydiveClub = async (data) => {
//         const method = 'POST';

//         const result = await fetch('/skydive_club', {
//             method,
//             headers: {
//                 'Content-type': 'application/json'
//             },
//             body: JSON.stringify(data),
//         });

//         if (!result.ok) {
//             throw new Error(`${result.status} (${result.statusText})`);
//         }

//         return result;
// };

// skydiveClubs.forEach((item, index) => {
//     initSkydiveClub(item);
// });



// Test GraphQL + MongoDB
const getAnimals = (size?: string) => {
    const query = `query Animals($size: String) {
        animals(size: $size) {
            name,
        }
    }`;
    fetch(graphqlConfig.uri, {
        ...graphqlConfig.options,
        body: JSON.stringify({
            query,
            variables: size ? { size } : {},
        }),
    }).then(async (result) => {
        const data = await result.json();
        console.log(`GraphQL query for animals with a size of "${size}" returned:`);
        console.table(data.data.animals);
    });
};

const getAnimalById = (id: number) => {
    if (!id) {
        return;
    }
    const query = `query Animal($id: Int!) {
        animal(id: $id) {
            name,
            size,
        }
    }`;
    fetch(graphqlConfig.uri, {
        ...graphqlConfig.options,
        body: JSON.stringify({
            query,
            variables: { id },
        }),
    }).then(async (result) => {
        const data = await result.json();
        console.log(`GraphQL query for animal with an id of "${id}" returned:`);
        console.table(data.data.animal);
    });
};

getAnimals('malenky');
getAnimals();
getAnimalById(2);
getAnimalById(3);
// \\ Test GraphQL + MongoDB

// ============================================================
// Open Weather Map API (100 free requests per day)
// Accepts <latitude,longitude> or <location> as the query
// Returns latitude and longitude in the response
// Contrary to the docs, it does NOT return Wind Gust data
// (This is the main reason I switched to Dark Sky)
// ============================================================
const skydiveWeather = new SkydiveWeather();
console.log(skydiveWeather);
// (async () => {
//     const skydiveWeatherExampleA = await skydiveWeather.getForecastLocation('Chatteris,UK');
//     const skydiveWeatherExampleB = await skydiveWeather.getForeCastLatLong(52.487702, 0.088072);
//     console.log(skydiveWeatherExampleA, skydiveWeatherExampleB);
// })();

// ======================================================
// Dark Sky Weather API (1000 free requests per day)
// Accepts ONLY <latitude,longitude> for the query
// so you have to use a Geocode service (like Bing Maps)
// if you want to make searches by location query
// ======================================================
const skyduckWeather = new SkyduckWeather();
console.log(skyduckWeather);
