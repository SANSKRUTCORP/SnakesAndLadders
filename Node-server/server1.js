const express     =  require('express');
const logger      =  require('morgan');
const path        =  require('path');
const admin       =  require("firebase-admin");
const bodyParser  =  require("body-parser");

var serviceAccount = require("./sanskrut-interns-firebase-adminsdk-jm6gx-28d2298760.json");

var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sanskrut-interns.firebaseio.com"
});

var firedb = firebaseAdmin.database();


const app = express();
app.use(express.static(path.join(__dirname, 'views')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

app.use(express.json());

function randomgen(){
    var minimum = 1000000;
    var maximum = 9999999;
    var x = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    return x;
};

var count = 1;
// var currentuser = firebaseAdmin.auth.Userinfo.displayName;
var currentuser = 'Creator';


app.get('/createroom', function(req, res){
    
    var roomtoken = randomgen();  
    var roomref = firedb.ref('/rooms');
    
    roomref.child('room_'+roomtoken).set({'roomid':roomtoken})
            .then(function(){
                console.log(roomtoken)
                res.redirect('/createroom');
            })
            .catch(function(err){
                console.log(err);
            });
    
    var roomref1 = firedb.ref('/rooms/room_'+roomtoken+'/players');        
    roomref1.child('player_'+count).set({name : currentuser})
    .then(function(){
            count++;
            res.redirect('/joinroom');
    })
    .catch(function(err){
        console.log(err);
    });

    res.json({roomid : roomtoken, room_creator : currentuser});

});




app.get('/joinroom', function(req, res){
    res.render('joinroomtemp.ejs');
});



app.post('/joinroom', function(req, res){

    var roomtoken = req.body.enterid;
    var roomref = firedb.ref('/rooms/room_'+roomtoken+'/players');


    roomref.once('value', function(data){
                  
        var lenref = Object.keys(data.val()).length;

        if(lenref<4){
            roomref.child('player_'+count).set({name : 'Harsh'})
                .then(function(){
                        count++;
                        res.redirect('/joinroom');
                })
                .catch(function(err){
                    console.log(err);
                });
        } else{
            res.send('Max players');
        };
    });
   
});

app.post('/board', function(req, res){
    // console.log(req);
    res.send(req.body);
})


app.listen(3000, function(){
    console.log('This server is running over port 3000.');
})