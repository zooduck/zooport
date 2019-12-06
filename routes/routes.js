/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

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
        const packageJson = fs.readFileSync('./package.json', 'utf-8');
        const { version } = JSON.parse(packageJson);
        response.status(200).send(version.replace(/-.*/, ''));
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
        const result = await db.collection('Weather').findOne(query, options)
            .catch(err => console.log(err));
        if (result) {
            response.status(200).send(JSON.stringify(result));
        } else {
            response.status(404).send(JSON.stringify({ error: 'Document not found' }));
        }
    }
};

const weatherPost = {
    path: '/weather',
    callback: async (request, response) => {
        const doc = request.body;
        await db.collection('Weather').insertOne(doc)
            .catch(err => console.log(err));

        response.status(200).send(doc);
    }
};

const weatherPut = {
    path: '/weather',
    callback: async (request, response) =>  {
        const doc = request.body;
        const { id, daily, hourly, requestTime } = doc;
        await db.collection('Weather').updateOne({ id: id }, {
            $set: {
                daily,
                hourly,
                requestTime,
            }
        }).catch(err => console.log(err));

        response.status(200).send(doc);
    }
};

const skydiveClubPost = {
    path: '/skydive_club',
    callback: async (request, response) => {
        const doc = request.body;
        await db.collection('SkydiveClub').insertOne(doc)
            .catch(err => console.log(err));

        response.status(200).send(doc);
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
        skydiveClubPost,
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
