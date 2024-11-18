const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const useragent = require('express-useragent');
const sendgridClient = require('@sendgrid/client');
const handlebars = require('handlebars');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');
const OS = require('opensubtitles.com');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(expressLayouts);

const os = new OS({apikey: 'TY51Na9C9Q61Kmd2hLtPker9Q4M2qztx'});

const PORT = 4000;
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "400mb",
    parameterLimit: 500000
}));
app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json(
    {
        limit: "1000mb"
    }
));

app.use(useragent.express());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

module.exports.handler = serverless(app);