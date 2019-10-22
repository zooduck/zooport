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
        }
    }
};

module.exports = resolvers;
