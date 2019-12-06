import { style } from './skyduck-carousel.style';

interface Slide {
    id: number;
    index: number;
    el: HTMLElement;
}

interface TouchData {
    time: number;
    clientX: number;
    clientY: number;
}

export class HTMLSkyduckCarouselElement extends HTMLElement {
    private _container: HTMLElement;
    private _currentOffsetX = 0;
    private _currentSlide: Slide;
    private _maxOffsetX = 0;
    private _minSwipeSpeed = 80;
    private _slides: Slide[] = [];
    private _slidesSlot: HTMLSlotElement;
    private _touchActive = false;
    private _touchStartData: TouchData = {
        time: 0,
        clientX: 0,
        clientY: 0,
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const styleEl = document.createElement('style');
        styleEl.textContent = style;

        this._slidesSlot = new DOMParser().parseFromString(`
            <slot name="slides"></slot>
        `, 'text/html').body.firstChild as HTMLSlotElement;

        this.shadowRoot.appendChild(styleEl);
        this.shadowRoot.appendChild(this._slidesSlot);

        this._registerEvents();
    }

    private _getMaxNegativeOffsetX(): number {
        const slides = this._slides.slice(0, -1);

        let maxNegativeOffsetX = 0;
        slides.forEach(slide => maxNegativeOffsetX -= slide.el.offsetWidth);

        return maxNegativeOffsetX;
    }

    private _getPrecedingSlideWidths(nextSlide: Slide) {
        const precedingSlides = this._slides.filter((slide: Slide) => {
            return slide.index < nextSlide.index;
        });

        if (!precedingSlides.length) {
            return 0;
        }

        const precedingSlideWidths = precedingSlides.map((slide: Slide) => {
            return slide.el.offsetWidth;
        }).reduce((total: number, offsetWidth: number) => {
            return total + offsetWidth;
        });

        return precedingSlideWidths;
    }

    private _getTouchType(speed: number): 'flick'|'swipe' {
        return speed < this._minSwipeSpeed
            ? 'flick'
            : 'swipe';
    }

    private _isVerticalSwipe(verticalSwipePixels: number) {
        const maxVerticalSwipePixels = 50;

        return verticalSwipePixels > maxVerticalSwipePixels
            || verticalSwipePixels < (maxVerticalSwipePixels * -1);
    }

    private _onResize() {
        this._setTouchActive(true);
        this._setContainerStyle();
        this._slideIntoView(this._currentSlide);
    }

    private _onSwipeLeft(touchType: 'flick'|'swipe') {
        const nextSlide = touchType === 'flick'
            ? this._slides[this._slides.length - 1]
            : this._slides[this._currentSlide.index + 1];

        if (!nextSlide) {
            return;
        }

        this._slideIntoView(nextSlide);
    }

    private _isSwipeValid(distance: number) {
        const minTravel = 50;

        return distance > minTravel || distance < (minTravel * -1);
    }

    private _onSwipeRight(touchType: 'flick'|'swipe') {
        const nextSlide = touchType === 'flick'
            ? this._slides[0]
            : this._slides[this._currentSlide.index - 1];

        if (!nextSlide) {
            return;
        }

        this._slideIntoView(nextSlide);
    }

    private _onTouchStart(e: PointerEvent) {
        e.preventDefault();

        this.focus();

        const clientX = e.clientX;
        const clientY = e.clientY;

        this._setTouchActive(true);

        this._touchStartData = {
            time: new Date().getTime(),
            clientX,
            clientY,
        };
    }

    private _onTouchMove(e: PointerEvent) {
        e.preventDefault();

        if (!this._touchActive) {
            return;
        }

        const clientX = e.clientX;
        const clientY = e.clientY;

        const verticalSwipePixels = this._touchStartData.clientY - clientY;

        if (this._isVerticalSwipe(verticalSwipePixels)) {
            this._setTouchActive(false);
            this._slideIntoView(this._currentSlide);

            return;
        }

        const swipeDistance = clientX - this._touchStartData.clientX;
        const currentX = parseInt((swipeDistance + this._currentOffsetX).toString(), 10);

        this._slideTo(currentX);
    }

    private _onTouchEnd(e: PointerEvent) {
        e.preventDefault();

        if (!this._touchActive) {
            return;
        }

        this._setTouchActive(false);

        const clientX = e.clientX;
        const distance = this._touchStartData.clientX - clientX;

        if (!this._isSwipeValid(distance)) {
            this._slideIntoView(this._currentSlide);

            return;
        }

        const direction = distance > 0 ? 'left' : 'right';
        const speed = new Date().getTime() - this._touchStartData.time;
        const touchType = this._getTouchType(speed);

        if (direction === 'left') {
            this._onSwipeLeft(touchType);
        }

        if (direction === 'right') {
            this._onSwipeRight(touchType);
        }

        this.scrollIntoView({ behavior: 'smooth' });
    }

    private _registerEvents() {
        window.onresize = () => {
            this._onResize();
        };

        this.onpointerdown = this._onTouchStart.bind(this);
        this.onpointermove = this._onTouchMove.bind(this);
        this.onpointerup = this._onTouchEnd.bind(this);
    }

    private _setContainerStyle() {
        this._container.style.display = 'none';
        this._container.style.width = `${this.offsetWidth}px`;
        this._container.style.display = 'flex';
    }

    private _setTouchActive(bool: boolean) {
        switch (bool) {
        case true:
            this._touchActive = true;
            this._container.classList.add('--touch-active');
            break;
        case false:
            this._touchActive = false;
            this._container.classList.remove('--touch-active');
            break;
        default: // do nothing
        }
    }

    private _slideIntoView(slide: Slide) {
        const offsetX = this._getPrecedingSlideWidths(slide) * -1;

        this._slideTo(offsetX);
        this._currentOffsetX = offsetX;

        this._currentSlide = slide;
    }

    private _slideTo(offsetX: number) {
        const maxNegativeOffsetX = this._getMaxNegativeOffsetX();
        const translateX = offsetX > this._maxOffsetX
            ? 0
            : offsetX < maxNegativeOffsetX
                ? maxNegativeOffsetX
                : offsetX;

        this._container.style.transform = `translateX(${translateX}px)`;
    }

    protected connectedCallback() {
        this._slides = Array.from(this.querySelector('[slot=slides]').children)
            .map((item: HTMLElement, i: number) => {
                return {
                    id: i + 1,
                    index: i,
                    el: item,
                };
            });

        this._currentSlide = this._slides[0];
        this._container = this._slidesSlot.assignedNodes()[0] as HTMLElement;

        this._setContainerStyle();
    }
}

customElements.define('skyduck-carousel', HTMLSkyduckCarouselElement);
