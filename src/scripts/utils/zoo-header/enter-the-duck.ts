import { style, classes } from './enter-the-duck.style';

export class EnterTheDuck {
    private _ANIMATION_DELAY_INITIAL = 0;
    private _blocks: any[];
    private _classes: any = classes;
    private _currentAnimationDelay = this._ANIMATION_DELAY_INITIAL;
    private _longestAnimationDuration = 0;
    private _headerEl: HTMLElement;
    private _uiStringRotateDelay = 500;
    private _uiStringRotateDuration = 250;
    private _parentNode: HTMLElement;

    constructor(parentNode: HTMLElement) {
        this._parentNode = parentNode || document.body;
        this._headerEl = document.createElement('div');
        this._headerEl.classList.add(...this._classes.header);

        const stylesheet = document.createElement('style');
        stylesheet.textContent = style;
        document.head.appendChild(stylesheet);
    }

    private _addBlocksToDOM(): void {
        const blocksContainerEl = document.createElement('div');
        blocksContainerEl.classList.add(...this._classes.blockContainer);

        this._blocks.forEach(el => blocksContainerEl.appendChild(el));
        this._headerEl.appendChild(blocksContainerEl);
        this._parentNode.insertBefore(this._headerEl, this._parentNode.childNodes[0]);
    }

    private _buildBlock(char: string): HTMLDivElement {
        const blockEl = document.createElement('div');
        const letterEl = document.createElement('div');
        const config = {
            animationDuration: this._calcAnimationDuration(),
            animationDelay: this._currentAnimationDelay,
            backgroundColor: this._randomBackgroundColor,
        };

        if (config.animationDuration > this._longestAnimationDuration) {
            this._longestAnimationDuration = config.animationDuration;
        }

        blockEl.classList.add(...this._classes.block);
        blockEl.style.animationDuration = `${config.animationDuration}ms`;
        blockEl.style.animationDelay = `${config.animationDelay}ms`;
        blockEl.style.backgroundColor = config.backgroundColor;

        letterEl.classList.add(...this._classes.letter);
        letterEl.innerHTML = char || '&nbsp;';
        blockEl.appendChild(letterEl);

        return blockEl;
    }

    private _buildBlocks(chars: string): Promise<any> {
        this._reset();
        chars.split('').forEach((char, i) => {
            if (i > 0) {
                this._currentAnimationDelay += 250;
            }
            this._blocks.push(this._buildBlock(char));
        });
        this._addBlocksToDOM();

        return new Promise((res) => {
            setTimeout(() => res(), this._currentAnimationDelay + this._longestAnimationDuration);
        });
    }

    private _buildBlinkingCursor(): HTMLDivElement {
        const el = document.createElement('div');
        el.classList.add(...this._classes.consoleCursor);
        el.innerHTML = '&numsp;';

        return el;
    }

    private _buildConsoleLogChars(txt: string, delay: number, delayIncrement: number): HTMLElement[] {
        const totalDelay = delay + (delayIncrement * txt.split('').length);
        const chars = txt.split('').map((char: string, i: number, arr: string[]) => {
            const el = document.createElement('div');

            el.classList.add(...this._classes.consoleChar);
            el.innerHTML = char === ' ' ? '&nbsp;' : char;

            const pairs = [char + arr[i + 1], arr[i -1] + char];

            if (pairs.includes('UI')) {
                el.style.animationDelay = `${totalDelay + this._uiStringRotateDelay}ms`;
                el.style.animationDuration = `${this._uiStringRotateDuration}ms`;
                char === 'U' && el.classList.add('--rotate-45');
                char === 'I' &&  el.classList.add('--rotate-45-anti');
            }

            this._showConsoleBlockChar(el, delay);

            delay += delayIncrement;

            return el;
        });

        return chars;
    }

    private _calcAnimationDuration(): number {
        const minDuration = 1000;
        const maxDuration = 2000;
        const duration = Math.ceil(Math.random() * maxDuration);

        return duration > minDuration ? duration : minDuration;
    }

    private _clearHeader(): void {
        this._headerEl.innerHTML = '';
        this._headerEl.classList.remove('--animation-complete');
    }

    private async _consoleLogToScreen(txt: string): Promise<any> {
        let delay = 2000;
        const delayIncrement = 50;

        const chars = this._buildConsoleLogChars(txt, delay, delayIncrement);
        const totalDelay = delay + ((chars.length - 1) * delayIncrement);

        const consoleBlockEl = document.createElement('div');
        consoleBlockEl.classList.add(...this._classes.console);

        chars.forEach(char => consoleBlockEl.appendChild(char));
        consoleBlockEl.appendChild(this._buildBlinkingCursor());

        this._headerEl.classList.add('--animation-complete');
        this._headerEl.appendChild(consoleBlockEl);

        setTimeout(this._dropBlinkingCursor.bind(this), totalDelay);

        return new Promise(res => setTimeout(res, totalDelay + this._uiStringRotateDelay + this._uiStringRotateDuration));
    }

    private _dropBlinkingCursor(): void {
        const blinkingCursorEl = document.querySelector(`.${this._classes.consoleCursor.join('.')}`);
        if (blinkingCursorEl) {
            blinkingCursorEl.classList.add('--dropped');
        }
    }

    private _getColor(min: number): number {
        const color = Math.floor(Math.random() * 255);
        if (color < min) {
            return this._getColor(min);
        }

        return color;
    }

    private get _randomBackgroundColor(): string {
        const minColor = 100;
        const colors = {
            r: this._getColor(minColor),
            g: this._getColor(minColor),
            b: this._getColor(minColor),
            a: .4,
        };

        return `rgba(${colors.r}, ${colors.b}, ${colors.g}, ${colors.a})`;
    }

    private _reset(): void {
        this._blocks = [];
        this._currentAnimationDelay = this._ANIMATION_DELAY_INITIAL;
        this._longestAnimationDuration = 0;
        this._clearHeader();
    }

    private _showConsoleBlockChar(el: HTMLElement, delay: number) {
        setTimeout(() => el.style.width = 'auto', delay);
    }

    public async run(title = 'ZOODUCK', subtitle = 'JavaScript UI Developer'): Promise<void> {
        this._buildBlocks(title);
        await this._consoleLogToScreen(subtitle);

        return;
    }
}
