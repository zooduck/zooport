/* eslint-disable no-console */
const mongodb = require('mongodb').MongoClient;
const mongodbURI = process.env.MONGODB_URI.replace(/<dbuser>/, process.env.MONGODB_USER).replace(/<dbpassword>/, process.env.MONGODB_PASSWORD);

const collections = [
    'user',
    'logbook',
    'weather',
];

const createCollections = async (db) => {
    Promise.all(collections.map((collection) => db.createCollection(collection)));
};

const mongo = () => {
    return {
        async connect() {
            return new Promise((resolve, reject) => {
                mongodb.connect(mongodbURI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }, async (err, client) =>  {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    const db = client.db('zooport-2019');
                    await createCollections(db);

                    await db.collection('user').createIndex({ username: 1}, { unique: true });
                    await db.collection('logbook').createIndex({ jump: 1}, { unique: true });
                    await db.collection('weather').createIndex({ id: 1}, { unique: true });

                    resolve(db);
                });
            });
        }
    };
};

module.exports = mongo;
