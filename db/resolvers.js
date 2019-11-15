const axios = require('axios');

const resolvers = (db) => {
    return {
        async animal(args) {
            const result = await db.collection('__test').findOne({id: args.id});

            return result;
        },
        async animals(args) {
            const options = args.size ? { size: args.size } : {};
            const result = await db.collection('__test').find(options).toArray();

            return result;
        },
        async weather(args) {
            const result = await axios.get(`https://api.darksky.net/forecast/${process.env.DARKSKY_SECRET}/${args.latitude || '0'},${args.longitude || '0'}`, {
                params: {
                    exclude: 'currently,minutely,hourly,alerts,flags',
                    lang: 'en',
                    units: 'uk2',
                }
            });

            return result.data;
        }
    };
};

module.exports = resolvers;
