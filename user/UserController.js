// UserController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var socketIO = require('socket.io');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');

// create user
router.post('/', function (req, res) {
    User.create({
            name : req.body.name,
            password : req.body.password,
            score : 0,
            updatecounter: 0,
            lastmodified: new Date(),
            role: 'user'
        }, 
        function (err, user) {
            if (err) return res.status(500).send("Problem when adding user to the database." + err);
            res.status(200).send(user);
            console.log("Create Called");
        });
});

// delete user
router.delete('/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send("Problem when deleting the user.");
        res.status(200).send("User "+ user.name +" was deleted.");
        console.log("Delete Called");
    });
});

// update user
router.put('/:id', function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send("Problem when updating the user.");
        res.status(200).send(user);
        console.log("Update Called");
    });
});

// return all the user in database
router.post('/login', function (req, res) {
    User.find({name:req.body.name, password:req.body.password}, function (err, users) {
        if (err) return res.status(500).send("Problem when get all users.");
        if (users.length == 0) return res.status(404).send("Not found any user.");
        res.status(200).send(users);
        console.log("Login Called");
    });
});


// Socket io opening
var PORTSOCKET = process.env.PORT || 4567;
var server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORTSOCKET, () => console.log('Socket listening on port ' + PORTSOCKET));

var io = socketIO(server);
io.on('connection', (socket) => {

    // Listen emit get users event
    socket.on('getusers', function() {
        User.find({role:"user"}, function (err, users) {
            var myObject = {
                items: JSON.stringify(users)
            }
            socket.emit('receiveusers', myObject);
        }).sort({score: 'desc'});
    });

    // Listen emit get users event from admin
    socket.on('getusers-from-admin', function(data) {

        var date = new Date();
        var minutes = parseInt(data);

        if (minutes > 0){

            date.setMinutes(date.getMinutes() - minutes);
            User.find({role:"user",updatedAt: {$gte: date}}, function (err, users) {
                var myObject = {
                    items: JSON.stringify(users)
                }
                socket.emit('receiveusers', myObject);
            }).sort({updatedAt: 'desc'});

        } else {
            User.find({role:"user"}, function (err, users) {
                var myObject = {
                    items: JSON.stringify(users)
                }
                socket.emit('receiveusers', myObject);
            }).sort({updatedAt: 'desc'});
        }

    });
});

module.exports = router;


//return all the user in database
// router.get('/', function (req, res) {
//     User.find({role:"user"}, function (err, users) {
//         if (err) return res.status(500).send("Problem when get all users.");
//         res.status(200).send(users);
//         console.log("Gets Called");
//     }).sort({score: 'desc'});
// });

//return all the user in database
// router.get('/admin', function (req, res) {
//     User.find({role:"user"}, function (err, users) {
//         if (err) return res.status(500).send("Problem when get all users.");
//         res.status(200).send(users);
//         console.log("Gets Called");
//     }).sort({updatedAt: 'desc'});
// });

// router.get('/admin/:time', function (req, res) {
    
//  var date = new Date();
//  var minutes = parseInt(req.params.time);

//  date.setMinutes(date.getMinutes() - minutes);

//     User.find({role:"user",updatedAt: {$gte: date}}, function (err, users) {
//         if (err) return res.status(500).send("Problem when get all users.");
//         res.status(200).send(users);
//         console.log("Gets Called");
//     }).sort({updatedAt: 'desc'});
    
// });

// get user from id
// router.get('/:id', function (req, res) {
//     User.findById(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("Problem when finding user by id.");
//         if (!user) return res.status(404).send("No user found.");
//         res.status(200).send(user);
//     });
// });