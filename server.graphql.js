const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const expressGraphql = require('express-graphql');
const { buildSchema } = require('graphql');

const testData = [
    { id: 1, name: 'Begemotik', size: 'bolshoye' },
    { id: 2, name: 'Homyachok', size: 'malenky' },
    { id: 3, name: 'Slonyonok', size: 'bolshoye' },
    { id: 4, name: 'Obezyanka', size: 'malenky' }
];

const schema = buildSchema(`
    type Query {
        animal(id: Int!): Animal,
        animalsBySize(size: String): [Animal]
    },
    type Animal {
        id: Int,
        name: String,
        size: String
    }
`);

const getAnimal = (args) => {
    const result = testData.find(item => item.id === args.id);

    return result;
};

const getAnimalsBySize = (args) => {
    if (!args.size) {
        return testData;
    }
    const result = testData.filter(item => item.size === args.size);

    return result;
};

const rootValue = {
    animal: getAnimal,
    animalsBySize: getAnimalsBySize,
};

const server = express();
server.use('/graphql', expressGraphql({
    schema,
    rootValue,
    graphiql: true,
}));
// eslint-disable-next-line no-console
server.listen(8080, () => console.log('Node GraphQL Server running on localhost:8080/graphql'));
