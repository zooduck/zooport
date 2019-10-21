import 'regenerator-runtime/runtime'; // required for async/await to work with babel7+
import { siteInfo, ZooHeader, versionScramble, wait } from './utils/index';
import './zooduck-web-components';

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
