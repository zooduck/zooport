class SkyduckRadio extends HTMLElement {
    private _name: string;
    private _value: string;
    private _checked: boolean;

    constructor() {
        super();

        this._name = this.getAttribute('name');
        this._value = this.getAttribute('value');
        this._checked = this.hasAttribute('checked');

        const style = this._getStyle();
        const link = this._getFontAwesomeLink();

        this.appendChild(link);
        this.appendChild(style);
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

    private _getFontAwesomeLink(): HTMLLinkElement {
        const link = new DOMParser().parseFromString(`
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
                crossorigin="anonymous"
                integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=">
        `, 'text/html').head.firstChild;

        return link as HTMLLinkElement;
    }

    private _getStyle(): HTMLStyleElement {
        const style = document.createElement('style');
        style.textContent = `
            .zooduck-radio {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                gap: 5px;
            }
            .zooduck-radio__value {
                color: #222;
            }
            .zooduck-radio__icon {
                font-size: 24px;
                color: #bbb;
            }
            .zooduck-radio__icon.--on {
                display: none;
            }
            input[type=radio] {
                display: none;
            }
            input:checked ~.zooduck-radio__icon.--on,
            input:not(:checked) ~.zooduck-radio__icon.--off {
                display: block;
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
        const html = new DOMParser().parseFromString(`
            <label class="zooduck-radio">
                    ${this._buildRawInput().outerHTML}
                    <i class="zooduck-radio__icon --off far fa-circle"></i>
                    <i class="zooduck-radio__icon --on far fa-dot-circle"></i>
                    <span class="zooduck-radio__value">${this._value}</span>
            </label>
        `, 'text/html').body.firstChild;

        this.appendChild(html);
    }

    protected connectedCallback() {
        this._render();
    }
}


customElements.define('skyduck-radio', SkyduckRadio);
