const root = {
    path: '/',
    callback: (_request, response) => {
        response.status(200).send({ message: 'Connection Success' });
    }
};

const versionGet = {
    path: '/version',
    callback: (_request, response) => {
        response.status(200).send(process.env.VERSION);
    }
};

const routes = [
    root,
    versionGet,
];

const router = (server) => {
    routes.forEach((config) => {
        server.get(config.path, config.callback);
    });
};

module.exports = router;
