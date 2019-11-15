/* eslint-disable no-console */
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');
const database = require('./db/database')();
const server = express();
const bodyParser = require('body-parser');
const router = require('./routes/routes.js');

server.use(express.static('dist'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

router(server);

let db, resolvers;
const typeDefs = fs.readFileSync(path.join(__dirname, 'db/schema.graphql'), 'utf-8');
const schema = buildSchema(typeDefs);

database.connect().then((result) => {
    db = result;
    resolvers = require('./db/resolvers')(db);
    console.log(`MongoDB connection to the ${db.databaseName} database was successful`);

    server.use('/graphql', expressGraphql({
        schema,
        rootValue: resolvers,
        graphiql: true,
    }));

}).catch((err) => {
    console.error(err);
});

const serverConfig = {
    port: 8080,
};

server.listen(serverConfig.port, () => {
    console.log(`Server running on http://localhost:${serverConfig.port}`);
    console.log(`GraphQL can be accessed on http://localhost:${serverConfig.port}/graphql`);
});
