export const buildIconSlot = (slot: string, icon: string): HTMLSlotElement => {
    const iconEl = document.createElement('i');
    iconEl.classList.add('fas', icon);

    const iconSlotEl = document.createElement('slot');
    iconSlotEl.name = slot;

    iconSlotEl.appendChild(iconEl);

    return iconSlotEl;
};

export const buildInput = (): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'text';

    return input;
};

export const buildInputLabelContainer = (): HTMLElement => {
    const containerEl = document.createElement('div');
    containerEl.classList.add('input-label-container');

    return containerEl;
};

export const buildLabel = (): HTMLElement => {
    const labelEl = document.createElement('div');
    labelEl.classList.add('label');

    return labelEl;
};
