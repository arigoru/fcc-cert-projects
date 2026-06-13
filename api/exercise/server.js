const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')

mongoose.connection.on("open", function(ref) {
  console.log("Connected to mongo server.");
});

mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!");
  return console.log(err);
});

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true } );


var usersSchema = new mongoose.Schema({
  username: {
    type:String
  }
  
});

var exercisesSchema = new mongoose.Schema({
  description: String,
  date: {type: Date,default: Date.now},
  duration: Number,
  userId: String
});

var users = mongoose.model('users',usersSchema);
var exercises = mongoose.model('exercises',exercisesSchema);


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user',newUserHandler);
app.post('/api/exercise/add',addExerciseHandler);
app.get('/api/exercise/users',showUsersHandler);
app.get('/api/exercise/log',showLogHandler);


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


function newUserHandler(request,response){
  let user = new users({username:request.body.username});
  user.save((error,data)=>{
      let {username,_id}= data;
      response.json({username,_id,error});
  });
}


function showUsersHandler(request,response){
  users.find({},'username _id').exec((err,data)=>{
    if (err) response.json({err})
    else response.json(data);
  });
}

function showLogHandler(request,response){
  let from = new Date(request.query.from)
  let to = new Date(request.query.to)
  
  if (from == 'Invalid Date') from = 0;
    else from = from.getTime();
  if (to == 'Invalid Date') to = Date.now();
    else to = to.getTime();
  
  let user = {};
  users.findById(request.query.userId,(err,data)=>{
    if (err) response.json(err)
    else {
      user._id = data._id;
      user.username = data.username;
      user.log = [];
      user.count = 0;
      
      exercises.find({
        userId: user._id,
        date: {$gt:from,$lt:to}
      },'-_id -__v -userId')
      .limit(parseInt(request.query.limit))
      .exec((err,data)=>{
        if (err) response.json(err);
          else {
            data.map((e)=>{
              let date = e.date.toDateString();
              user.log.push({
                date:date,
                description:e.description,
                duration:e.duration
              });
              return e;
            });
            user.count = data.length;
            response.json(user);
          }
      });
      
    }
  });
  
}


function addExerciseHandler(request,response){
  let date;
  if(!request.body.date) {
      date = Date.now()
    } else {
      date = request.body.date;
    } 
  
  let {description,duration,userId} = request.body;
  let exercise = new exercises({description:description,duration:duration,userId:userId,date:date});
  exercise.save((error,data)=>{
      if (error) response.json(error);
      else response.json(data);
  });
}




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
