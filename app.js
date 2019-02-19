var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
app.use(express.static('public'));

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port);