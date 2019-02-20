const result = require('dotenv').config();
var express = require('express');
var app = express();
const { Client } = require('pg');
var bodyParser = require('body-parser');


//var connectionString = "postgres://*USERNAME*:*PASSWORD*@*HOST*" //delete if
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: !process.env.STAGE_SSL && true,
});

client.connect();

var port = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.get('/', (req,res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port);