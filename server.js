const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const router = require('./routes/routes.js');
const config = {
    port: 8080,
};

server.use(express.static('dist'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

router(server);

server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port: ${config.port}...`);
    // Object.keys(process.env).forEach((environmentVar) => console.log(`process.env.${environmentVar} = ${process.env[environmentVar]}`));
});
