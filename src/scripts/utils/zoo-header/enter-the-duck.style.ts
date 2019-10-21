export const style = `
@keyframes blink {
    0% {
        opacity: 1;
    }
    49% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 0;
    }
}
@keyframes introLoadingBlock {
    0% {
        transform: translate(0, -80%);
    }
    50% {
        transform: translate(0, 50%);
    }
    100% {
        transform: translate(0, 0);
    }
}
@keyframes introLoadingBlocks {
    0% {
        transform: translateX(100%);
    }
    10% {
        transform: translateX(0%);
    }
    80% {
        font-size: 55px;
        transform: translateY(0) rotate(0deg);
    }
    85% {
        font-size: 45px;
        transform: translateY(2px) rotate(-2deg);
    }
    100% {
        transform: translateX(0%) translateY(2px) rotate(-2deg);
        font-size: 45px;
    }
}
@keyframes rotate45 {
    0% {
        transform: rotate(45deg);
    }
    100% {
        transform: rotate(0deg);
    }
}
@keyframes rotate45Anti {
    0% {
        transform: rotate(-45deg);
    }
    100% {
        transform: rotate(0deg);
    }
}
.enter-the-duck {
    --animation-duration-base: .25s;
    --color-base-black: #222;
    --color-base-white: #fff;
    --font-weight-base-regular: 300;
    --font-weight-base-bold: 700;
    --font-family-base: 'Roboto', sans-serif;
    --font-size-title: 42px;
    --font-size-subtitle: 16px;
}
@media (min-width: 769px) {
    .enter-the-duck {
        --font-size-title: 63px;
        --font-size-subtitle: 24px;
    }
}
.enter-the-duck__header {
    position: relative;
    display: block;
    height: calc(var(--font-size-title) + 45px);
    padding: 10px;
    background-color: var(--color-base-black);
    overflow: hidden;
    transition: height var(--animation-duration-base);
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-base-regular);
}
.enter-the-duck__header.--animation-complete {
    height: calc(var(--font-size-title) + var(--font-size-subtitle) + 80px);
}
.enter-the-duck__console-block {
    display: flex;
    align-items: flex-start;
    margin-top: 15px;
    letter-spacing: calc((var(--font-size-subtitle) / 16) * 4);
    font-size: var(--font-size-subtitle);
}
.enter-the-duck__console-block-char {
    flex-shrink: 0;
    width: 0;
    overflow: hidden;
    text-align: center;
    color: var(--color-base-white);
}
.enter-the-duck__console-block-char.--rotate-45 {
    animation: rotate45 var(--animation-duration-base) linear both;
}
.enter-the-duck__console-block-char.--rotate-45-anti {
    animation: rotate45Anti var(--animation-duration-base) linear both;
}
.enter-the-duck__console-block-cursor {
    background: var(--color-base-white);
    transition: all  var(--animation-duration-base);
}
.enter-the-duck__console-block-cursor:not(.--dropped) {
    animation: blink .5s infinite;
}
.enter-the-duck__console-block-cursor.--dropped {
    margin-top: calc(var(--font-size-subtitle) * 1.8);
    transform: rotate(45deg) scale(2.5);
}
.enter-the-duck__intro-loading-blocks {
    position: relative;
    display: flex;
    height: calc(var(--font-size-title) + 40px);
    overflow: hidden;
    transform-origin: left top;
    animation: introLoadingBlocks both;
}
.enter-the-duck__intro-loading-block {
    transform: translate(0, -60px);
    margin-right: 5px;
    background: var(--color-base-black);
    animation-name: introLoadingBlock;
    animation-fill-mode: both;
}
.enter-the-duck__intro-loading-block-letter {
    text-align: center;
    font-weight: var(--font-weight-base-bold);
    background: var(--color-base-black);
    color: var(--color-base-white);
    font-size: var(--font-size-title);
}
`;

export const classes = {
    blockContainer: ['enter-the-duck__intro-loading-blocks'],
    block: ['enter-the-duck__intro-loading-block'],
    letter: ['enter-the-duck__intro-loading-block-letter'],
    console: ['enter-the-duck__console-block'],
    consoleCursor: ['enter-the-duck__console-block-cursor'],
    consoleChar: ['enter-the-duck__console-block-char'],
    header: ['enter-the-duck', 'enter-the-duck__header'],
};
