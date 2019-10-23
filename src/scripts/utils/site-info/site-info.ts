export const siteInfo = (() => {
    return {
        get version() {
            return (async () => {
                const response = await fetch('/version');
                const version = await response.text();

                return version;
            })();
        }
    };
})();
