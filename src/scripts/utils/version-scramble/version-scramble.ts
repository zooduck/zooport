const rand = (limit: number = 9) => Math.ceil(Math.random() * limit);

export const versionScramble = (() => {
    let _version = '';
    let firstCall = true;
    let duration = 500;
    let delay = 20;
    let totalDelay: number;
    let currentDelay = delay;
    let element: HTMLElement;
    let staticVersion = '';
    const staggeredDelay = 500;

    return {
        set element(el: HTMLElement) {
            element = el;
        },
        _staggerFinalVersion() {
            const pieces: string[] = _version.split('.');
            if (_version) {
                const [firstPiece, ...remainingPieces] = pieces;
                staticVersion += firstPiece;
                if (_version.length > 1) {
                    staticVersion += '.';
                }
                const scrambledVersion = remainingPieces.join('.');
                currentDelay = delay;
                this.run(scrambledVersion, {duration: staggeredDelay});
            }
        },
        run(version: string, options?: VersionScrambleOptions) {
            if (!element) {
                return;
            }

            if (options) {
                duration = options.duration || duration;
                delay = options.delay || delay;
            }

            _version = version;

            const scrambledVersion = _version ? _version.split('.').map(() => rand()).join('.') : '';
            element.innerHTML = `<span>${staticVersion}</span>${scrambledVersion}`;

            if (currentDelay < duration) {
                setTimeout(() => this.run(version), delay);
                currentDelay += delay;
                if (firstCall) {
                    firstCall = false;
                    totalDelay = duration + (_version.split('.').length * staggeredDelay);
                    return new Promise(res => setTimeout(res, totalDelay));
                }
            } else {
                this._staggerFinalVersion();
            }
        }
    }
})();
