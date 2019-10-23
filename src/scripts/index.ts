/* eslint-disable no-console */
import 'regenerator-runtime/runtime'; // required for async/await to work with babel7+
import { siteInfo, ZooHeader, versionScramble, wait } from './utils/index';
import { graphqlConfig } from './config/index';

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

    await wait(delayBetweenTransitions);

    document.querySelector('.zooport__footer').classList.remove('--hidden');
    document.querySelector('.zooport__footer').addEventListener('click', function() {
        this.classList.toggle('--minified');
    });
}

loadIntro();

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
