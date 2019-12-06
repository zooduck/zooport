export const style = `
:host {
    display: block;
    overflow: hidden;
    touch-action: pan-y;
    cursor: pointer;
}
::slotted([slot=slides]) {
    display: none;
}
::slotted([slot=slides]:not(.--touch-active)) {
    transition: all .25s;
}
`;
