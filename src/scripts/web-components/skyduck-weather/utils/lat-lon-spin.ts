interface ElementAndInterval {
    el: HTMLElement;
    interval: number;
}

export class LatLonSpin {
    private _els: ElementAndInterval[] = [];

    private get _randomCoords(): string {
        const randomCoords = [];
        for (let c = 0; c < 7; c++) {
            randomCoords.push(Math.floor(Math.random() * 10));
        }

        return `${randomCoords[0]}.${randomCoords.slice(1).join('')}`;
    }

    private _applySpin(el: HTMLElement, precedingText?: string): void {
        const originalHTML = el.innerHTML;
        const switchCoordsSpeed = 50;

        const interval = setInterval(() => {
            el.innerHTML = `${precedingText || originalHTML}${this._randomCoords}`;
        }, switchCoordsSpeed);

        this._els.push({
            el,
            interval
        });
    }

    private _removeSpin(el: HTMLElement): void {
        const data = this._els.find((item) => item.el === el);

        if (!data) {
            return;
        }

        clearInterval(data.interval);
    }

    private _setContent(el: HTMLElement, content: string): void {
        el.innerHTML = content;
    }

    public apply(el: HTMLElement, preText?: string): void {
        this._applySpin(el, preText);
    }

    public setContent(el: HTMLElement, content: string): void {
        this._removeSpin(el);
        this._setContent(el, content);
    }
}
