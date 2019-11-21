/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');

let db;

const root = {
    path: '/',
    callback: (_request, response) => {
        response.status(200).send({ message: 'Connection Success' });
    }
};

const geocode = {
    path: '/geocode',
    callback: async (request, response) => {
        axios.get('http://dev.virtualearth.net/REST/v1/Locations/', {
            params: {
                key: process.env.BING_MAPS_KEY,
                q: request.query.place,
                maxRes: 1,
            }
        }).then((result) => {
            response.status(200).send(JSON.stringify(result.data));
        }).catch((err) => {
            response.status(400).send(err);
        });
    }
};

const googleMapsKey = {
    path: '/googlemapskey',
    callback: (_request, response) => {
        response.status(200).send(process.env.GOOGLE_MAPS_KEY);
    }
};

const version = {
    path: '/version',
    callback: (_request, response) => {
        response.status(200).send(process.env.VERSION);
    }
};

const weather = {
    path: '/weather',
    callback: async (request, response) => {
        const query = {
            id: request.query.id,
        };
        const options = {
            projection: {
                _id: 0,
            }
        };
        const result = await db.collection('weather').findOne(query, options)
            .catch(err => console.log(err));
        if (result) {
            response.status(200).send(JSON.stringify(result));
        } else {
            response.status(200).send(JSON.stringify({ error: 'Document not found' }));
        }
    }
};

const weatherPost = {
    path: '/weather',
    callback: async (request, response) => {
        const doc = request.body;
        await db.collection('weather').insertOne(doc)
            .catch(err => console.log(err));

        response.status(200).send(request.body);
    }
};

const weatherPut = {
    path: '/weather',
    callback: async (request, response) =>  {
        const doc = request.body;
        await db.collection('weather').replaceOne({ club: request.body.club }, doc)
            .catch(err => console.log(err));

        response.status(200).send(request.body);
    }
};

const routes = {
    get: [
        root,
        geocode,
        googleMapsKey,
        version,
        weather,
    ],
    post: [
        weatherPost,
    ],
    put: [
        weatherPut,
    ]
};

const router = (server, database) => {
    db = database;
    routes.get.forEach((config) => {
        server.get(config.path, config.callback);
    });
    routes.post.forEach((config) => {
        server.post(config.path, config.callback);
    });
    routes.put.forEach((config) => {
        server.put(config.path, config.callback);
    });
};

module.exports = router;
