/* eslint-disable no-console */
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

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

const weather = {
    path: '/weather',
    callback: (request, response) => {
        axios.get(`https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${request.query.latitude || '0'},${request.query.longitude || '0'}`, {
            params: {
                exclude: 'currently,minutely,hourly,alerts,flags',
                lang: 'en',
                units: 'uk2',
            }
        }).then((result) => {
            response.status(200).send(JSON.stringify(result.data));
        }).catch((err) => {
            console.log(err);
        });
    }
};

const routes = [
    root,
    versionGet,
    weather,
];

const router = (server) => {
    routes.forEach((config) => {
        server.get(config.path, config.callback);
    });
};

module.exports = router;
