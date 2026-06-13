'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var cors = require('cors');

var app = express();

var port = process.env.PORT || 3000;

app.use(cors());

app.use('/',bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", newURLPosted);
app.get("/api/shorturl/:urlID", shortURLVisited);



mongoose.connection.on("open", function(ref) {
  console.log("Connected to mongo server.");
});

mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!");
  return console.log(err);
});

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true } );

var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

var urlModel = mongoose.model('short_urls',urlSchema);

var lastShortUrl = 0;

urlModel.findOne().sort('-short_url').exec((err,data)=>{
    if (!err) lastShortUrl = data.short_url;
}
);


var createShortURL = function(orgUrl,done) {
  let url = new urlModel({original_url:orgUrl,short_url:lastShortUrl+1});
  url.save((err,data)=>{
    if (err) done(err) 
    else done(null, data);
  }
  );
};



function newURLPosted(request,response){
  let resObj = {};
  if (!validateUrl(request.body.url)){
    resObj.error = 'invalid URL';
    response.json(resObj);
  } else {
    addNewURL(request.body.url,(result)=>{
        if (result!==-1){
          resObj.original_url = request.body.url;
          resObj.short_url = result;
        } else {
          resObj.error = 'Failed to add URL to Database';
        }
    response.json(resObj);
    });
  }
}

function addNewURL(url,cb){ // return -1 if failed, 0+ if success
  createShortURL(url,(err,data)=>{
    if (err) cb(-1);
    else {
      lastShortUrl = data.short_url;
      cb(lastShortUrl)
    }
  });
}

function shortURLVisited(request,response){
  let sID;
  if (/^\d+$/.test(request.params.urlID)){
        sID = Number(request.params.urlID);
  } 
  if ((sID===undefined)||(sID<1)||(sID>lastShortUrl)){
    response.json({ error:'url not found'});
  } else {
    urlModel.findOne({'short_url':sID}).exec((err,data)=>{
      if (err) response.json({ error:'url not found'});
      else {
        response.redirect(data.original_url);
      }
    })
  }
}


app.listen(port, function () {
  console.log('Node.js listening ...');
});

// https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
// https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback
function validateUrl(value) {
  dns.lookup(value, (error,adress,family)=>{
    //console.log(error);
    //if (error.code==='ENOTFOUND') return false; // check if url is reachable
  })
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}