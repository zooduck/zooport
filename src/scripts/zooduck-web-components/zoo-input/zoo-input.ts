import * as utils from './zoo-input-utils';
import { style } from './zoo-input.style';

export class HTMLZooInputElement extends HTMLElement {
    _autocomplete: boolean;
    _booleanAttrs = [
        'autocomplete',
        'noicons'
    ];
    _label: string;
    _noicons: boolean;
    _placeholder: string;
    _sharedAttrs = [
        'autocomplete',
        'placeholder',
        'type',
        'value'
    ];
    _type: string;
    _value: string;
    clearInputIconSlot: HTMLElement;
    hidePasswordIconSlot: HTMLElement;
    input: HTMLInputElement;
    inputLabelContainer: HTMLElement;
    labelEl: HTMLElement;
    leftIconSlot: HTMLElement;
    showPassword = false;
    showPasswordIconSlot: HTMLElement;

    public static get observedAttributes(): string[] {
        return [
            'autocomplete',
            'label',
            'noicons',
            'placeholder',
            'type',
            'value',
        ];
    }

    private _addEvents(): void {
        this.addEventListener('click', () => {
            this.input.focus();
        });

        this.input.addEventListener('focus', () => {
            this.classList.add('--active');
        });

        this.input.addEventListener('blur', () => {
            this.classList.remove('--active');
        });

        this.input.addEventListener('input', () => {
            this.value = this.input.value;
            this._updateValue();
        });

        this.leftIconSlot.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
        });

        [
            this.clearInputIconSlot,
            this.showPasswordIconSlot,
            this.hidePasswordIconSlot
        ].forEach((slot) => {
            slot.addEventListener('mousedown', (e: MouseEvent) => e.preventDefault());
        });

        this.clearInputIconSlot.addEventListener('click', () => {
            this.value = '';
            this.input.focus();
        });

        this.showPasswordIconSlot.addEventListener('click', () => {
            this.input.type = 'text';
            this.input.focus();
            this.classList.add('--show-password');
        });

        this.hidePasswordIconSlot.addEventListener('click', () => {
            this.input.type = 'password';
            this.input.focus();
            this.classList.remove('--show-password');
        });
    }

    private _addInputLabelContainer = (): void => {
        this.inputLabelContainer.appendChild(this.input);
        this.inputLabelContainer.appendChild(this.labelEl);
        this.root.appendChild(this.inputLabelContainer);
    }

    private _addSlots = (): void => {
        this.root.insertBefore(this.leftIconSlot, this.inputLabelContainer);
        this.root.appendChild(this.clearInputIconSlot);
        this.root.appendChild(this.showPasswordIconSlot);
        this.root.appendChild(this.hidePasswordIconSlot);
    }

    private _isBooleanAttr(attr: string): boolean {
        return this._booleanAttrs.includes(attr);
    }

    private _setup() {
        this._addInputLabelContainer();
        this._addSlots();
        this._addEvents();
        this._updateStyle();
    }

    private _syncBooleanAttribute(attr: string, val: boolean): void {
        if (val && !this.hasAttribute(attr)) {
            this.setAttribute(attr, '');
        } else if (!val && this.hasAttribute(attr)) {
            this.removeAttribute(attr);
        }

        if (val) {
            this._sharedAttrs.includes(attr) && this.input.setAttribute(attr, '');
        } else {
            this._sharedAttrs.includes(attr) && this.input.removeAttribute(attr);
        }
    }

    private _syncStringAttribute(attr: string, val: any): void {
        if (val === null) {
            /**
             * This is an **intentional deviation** from the default behaviour of attributes / properties.
             * It will **REMOVE** the attribute if you set the property for that attribute to **null**.
             * This is in parallel with the **attributeChangedCallback** lifecycle callback that returns
             * a value of **null** when an attribute is removed.
             *
             * See below for an example of the (ridiculous) default behaviour @17-10-2019.
             *
             * Example
             * ```
             * <input placeholder="placeholder" />
             * <script>
             * const input = document.querySelector('input');
             * input.placeholder = null;
             * </script>
             * ```
             *
             * Result
             * ```
             * <input placeholder="null" />
             * ```
             */
            this.removeAttribute(attr);
            this._sharedAttrs.includes(attr) && this.input.removeAttribute(attr);

            return;
        }

        if (typeof val !== 'string') {
            val = val.toString();
        }

        if (!this.hasAttribute(attr) || (this.getAttribute(attr) !== val)) {
            this.setAttribute(attr, val);
        }

        this._sharedAttrs.includes(attr) && this.input.setAttribute(attr, val);
    }

    private _updateAutoComplete(): void {
        this._syncBooleanAttribute('autocomplete', this.autocomplete);
    }

    private _updateHasValidLabelClass(): void {
        if (this.label && !this.placeholder) {
            this.classList.add('--has-valid-label');
        } else {
            this.classList.remove('--has-valid-label');
        }
    }

    private _updateIconSlots(options: any): void {
        [
            this.leftIconSlot,
            this.clearInputIconSlot,
            this.showPasswordIconSlot,
            this.hidePasswordIconSlot
        ].forEach((slot) => {
            slot.hidden = !options.showSlots;
        });
    }

    private _updateLabel(): void {
        this._syncStringAttribute('label', this.label);

        if (typeof this.label === 'string') {
            this.labelEl.innerHTML = this.label;
        }

        this._updateHasValidLabelClass();
    }

    private _updateNoIcons(): void {
        this._syncBooleanAttribute('noicons', this.noicons);

        if (this.noicons) {
            this._updateIconSlots({ showSlots: false })
        } else {
            this._updateIconSlots({ showSlots: true });
        }
    }

    private _updatePlaceholder(): void {
        this._syncStringAttribute('placeholder', this.placeholder);
        this._updateHasValidLabelClass();
    }

    private _updateStyle(): void {
        const styleEl = this.shadowRoot.querySelector('style');
        styleEl.textContent = style;
    }

    private _updateType(): void {
        this._syncStringAttribute('type', this.type);

        this.showPassword = false;
        this.classList.remove('--show-password');
    }

    private _updateValue(): void {
        this._syncStringAttribute('value', this.value);

        if (this.value) {
            this.classList.add('--has-content');
        } else {
            this.classList.remove('--has-content');
        }
    }

    constructor() {
        super();

        this._value = '';
        this._label = '';
        this._placeholder = '';

        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        shadow.appendChild(style);

        this.inputLabelContainer = utils.buildInputLabelContainer();
        this.input = utils.buildInput();
        this.labelEl = utils.buildLabel();
        this.leftIconSlot = document.createElement('slot');
        this.leftIconSlot.setAttribute('name', 'left-icon');
        this.clearInputIconSlot = utils.buildIconSlot('right-icon-clear-input', 'fa-times');
        this.showPasswordIconSlot = utils.buildIconSlot('right-icon-show-password', 'fa-eye');
        this.hidePasswordIconSlot = utils.buildIconSlot('right-icon-hide-password', 'fa-eye-slash');
    }

    get autocomplete(): boolean {
        return this._autocomplete;
    }

    set autocomplete(val: boolean) {
        this._autocomplete = val;
        this._updateAutoComplete();
    }

    get label(): string {
        return this._label;
    }

    set label(val: string | null) {
        this._label = val;
        this._updateLabel();
    }

    get noicons(): boolean {
        return this._noicons;
    }

    set noicons(val: boolean) {
        this._noicons = val;
        this._updateNoIcons();
    }

    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(val: string | null) {
        this._placeholder = val;
        this._updatePlaceholder();
    }

    get root(): ShadowRoot | HTMLZooInputElement {
        return this.shadowRoot || this;
    }

    get type(): string {
        return this._type;
    }

    set type(val: string) {
        this._type = val;
        this._updateType();
    }

    get value(): string {
        return this._value;
    }

    set value(val: string | null) {
        this._value = val;
        this.input.value = val;
        this._updateValue();
    }

    protected async connectedCallback() {
        if (!this.isConnected) {
            return;
        }

        this._setup();
    }

    protected attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        if (this._isBooleanAttr(name)) {
            this[name] = this.hasAttribute(name);
        } else {
            this[name] = newVal;
        }
    }
}
