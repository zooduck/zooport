class SkyduckRadio extends HTMLElement {
    private _name: string;
    private _value: string;
    private _checked: boolean;

    constructor() {
        super();

        this._name = this.getAttribute('name');
        this._value = this.getAttribute('value');
        this._checked = this.hasAttribute('checked');
    }

    static get observedAttributes() {
        return [
            'checked',
        ];
    }

    public get checked(): boolean {
        return this.querySelector('input').checked;
    }

    public get name(): string {
        return  this._name;
    }

    public get value(): string {
        return this._value;
    }

    private _getStyle(): HTMLStyleElement {
        const style = document.createElement('style');
        style.textContent = `
            .zooduck-radio {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            .zooduck-radio__value {
                color: #222;
            }
            .zooduck-radio__icon {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: var(--size, 24px);
                height: var(--size, 24px);
                border: solid var(--color, #bbb);
                border-width: calc(var(--size, 24px) / 8);
                border-radius: 50%;
            }
            .zooduck-radio__icon.--on {
                display: none;
            }
            .zooduck-radio__icon.--on:before {
                display: block;
                content: '';
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 50%;
                height: 50%;
                border-radius: 50%;
                background-color: var(--color, #bbb);
            }
            input[type=radio] {
                display: none;
            }
            input:checked ~.zooduck-radio__icon.--on,
            input:not(:checked) ~.zooduck-radio__icon.--off {
                display: flex;
            }
            input:not(:checked) ~.zooduck-radio__icon.--on,
            input:checked ~.zooduck-radio__icon.--off {
                display: none;
            }
        `;

        return style;
    }

    private _buildRawInput(): HTMLInputElement {
        const input = new DOMParser().parseFromString(`
            <input type="radio" name="${this._name}" value="${this._value}" />
        `, 'text/html').body.firstChild as HTMLInputElement;

        input.checked = this._checked;

        if (this._checked) {
            input.setAttribute('checked', '');
        }

        return input;
    }

    private _render() {
        this.innerHTML = '';

        const style = this._getStyle();
        this.appendChild(style);

        const html = new DOMParser().parseFromString(`
            <label class="zooduck-radio">
                    ${this._buildRawInput().outerHTML}
                    <i class="zooduck-radio__icon --off"></i>
                    <i class="zooduck-radio__icon --on"></i>
                    <span class="zooduck-radio__value">${this._value}</span>
            </label>
        `, 'text/html').body.firstChild;

        this.appendChild(html);
    }

    protected connectedCallback() {
        this._render();

        this.dispatchEvent(new CustomEvent('ready', {
            detail: {
                nam: this._name,
                value: this._value,
                checked: this._checked,
            }
        }));
    }
}

customElements.define('skyduck-radio', SkyduckRadio);
