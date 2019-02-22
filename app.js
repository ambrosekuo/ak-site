var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const db = require('./queries');

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

app.get('/users', db.getUsers2);

app.listen(port,  () => {
  console.log(`App running on port ${port}.`)
});