var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ig = require('instagram-node').instagram()
    bodyParser = require('body-parser'),
    LOCATIONS = [],
    TAGS = [];

ig.use({
    client_id: process.env.INSTAGRAM_CLIENT_ID,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET
});

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function (req,res) {
    res.render('index');
});

app.post('/incoming', function (req,res) {
    req.body.forEach(function (data) {
        var method = ig[data.object+"_media_recent"];
        method(data.object_id, function (err, medias) {
            io.emit('new_images', medias);
        });
    });
    res.send('Thanks!');
});
app.get('/incoming', function (req,res) {
    if (req.query['hub.challenge']) res.send(req.query['hub.challenge']);
});


app.get('/subscriptions', function (req,res) {
    ig.subscriptions(function (err, subs, remaining, limit) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(subs);
        }
    });
});

app.get('/subscriptions/add/location/:id', function (req,res) {
    ig.add_location_subscription(req.params.id, baseUrl(req)+'/incoming', function (err, result, remaining, limit) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/subscriptions/add/tag/:tag', function (req,res) {
    ig.add_tag_subscription(req.params.tag, baseUrl(req)+'/incoming', function (err, result, remaining, limit) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/subscriptions/add/user/:id', function (req,res) {
    ig.add_user_subscription(req.params.id, baseUrl(req)+'/incoming', function (err, result, remaining, limit) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/subscriptions/remove/:id', function (req,res) {
    ig.del_subscription({ id: req.params.id }, function (err, subs, limit) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(subs);
        }
    });
});

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('a user disconnected');
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function baseUrl (req) {
    return req.protocol + '://' + req.get('host');
}
