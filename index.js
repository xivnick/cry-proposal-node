
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

// body parser 세팅
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// api router 세팅
const API_URL = '/api'

const proposalRouter = require('./routes/proposal');
const voteRouter = require('./routes/vote');

app.use(API_URL + '/proposal', proposalRouter);
app.use(API_URL + '/vote', voteRouter);


// static 세팅
app.use(express.static(__dirname + '/static'));

// // test

// app.get('/test', async (req, res) => {

// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// server 켜기
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const cron = require('node-cron');
const adminService = require('./services/adminService');

// adminService.updateTokenOwners();

cron.schedule('50 * * * *', function () {
  adminService.updateTokenOwners();
});