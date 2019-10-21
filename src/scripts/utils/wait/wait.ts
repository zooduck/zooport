export const wait = (delay = 0) => {
    return new Promise(res => setTimeout(res, delay));
};
