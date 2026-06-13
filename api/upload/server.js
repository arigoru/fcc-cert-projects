'use strict';

var express = require('express');
var cors = require('cors');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


// require and use "multer"...

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });

app.get('/hello', function(req, res){
  res.json({greetings: "Hello, API"});
});

app.post('/api/fileanalyse', upload.single('upfile'), function (request, response, next) {
  let answer = {};
  answer.size = request.file.size;
  answer.name = request.file.originalname;
  answer.type = request.file.mimetype;
  response.json(answer)
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
