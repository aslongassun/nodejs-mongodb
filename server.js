// server.js
var app = require('./app');
var socketIO = require('socket.io');
var port = process.env.PORT || 3000;
var User = require('./user/User');

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

var io = socketIO(server);
io.on('connection', (socket) => {

    // update list user realtime
    function intervalFunc() {
        User.find({role:"user"}, function (err, users) {
            var myObject = {
                items: JSON.stringify(users)
            }
            socket.emit('receiveusers', myObject);
        }).sort({score: 'desc'});
    }

    setInterval(intervalFunc, 1000);

    // Listen emit get users event
    // socket.on('getusers', function() {
    //     User.find({role:"user"}, function (err, users) {
    //         var myObject = {
    //             items: JSON.stringify(users)
    //         }
    //         socket.emit('receiveusers', myObject);
    //     }).sort({score: 'desc'});
    // });

    // // Listen emit get users event from admin
    // socket.on('getusers-from-admin', function(data) {

    //     var date = new Date();
    //     var minutes = parseInt(data);

    //     if (minutes > 0){

    //         date.setMinutes(date.getMinutes() - minutes);
    //         User.find({role:"user",updatedAt: {$gte: date}}, function (err, users) {
    //             var myObject = {
    //                 items: JSON.stringify(users)
    //             }
    //             socket.emit('receiveusers', myObject);
    //         }).sort({updatedAt: 'desc'});

    //     } else {
    //         User.find({role:"user"}, function (err, users) {
    //             var myObject = {
    //                 items: JSON.stringify(users)
    //             }
    //             socket.emit('receiveusers', myObject);
    //         }).sort({updatedAt: 'desc'});
    //     }
    // });
});