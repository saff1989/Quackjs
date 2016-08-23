'use strict';

const app = require('express')(),
    cors = require('cors'),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    walk = require('walk'),
    walker = walk.walk('./responses', {
        followLinks: false
    });

app.use(cors());

server.listen(2337, function() {
    console.log(`
                #############################################
                ############__---~~~~~|~~~~~--__#############
                ########.-~~          |          ~~-.########
                #####.-~     .-~~~~-. |              ~-.#####
                ####/       {  o     }|                 \\####
                ###/        /       / |  SK              \\###
                ##|        \`--r'   {  | ,___.-',         |###
                ##|          /      ~-|         ',        |##
                ##|---------{---------|----------'--------|##
                ##|          \\        |         /         |##
                ##|           \\       |        /          |##
                ###\\         ~ ~~~~~~~|~~~~~~~~~ ~       /###
                ####\\       ~ ~ ~ ~ ~ | ~ ~ ~ ~ ~ ~     /####
                #####\\\`-_     ~ ~ ~ ~ ~|~ ~ ~ ~ ~ ~    _-'###
                ########\\\`-__    ~ ~ ~ | ~ ~ ~ ~   __-'######
                ############~~---_____|_____---~~############
                #############################################

                    SKTestApi listening on port 2337`);
});

app.get('/system/initialise', function(req, res) {
    res.send('Initialise!');
});

app.get('/__getcookie', function(req, res) {
    res.send('_sailsIoJSConnect();');
});

app.get('/session/refesh', function(req, res) {
    var date = new Date(),

        //get date of 30 days ahead
        expiry = new Date(date().setDate(date().getDate() + 30));

    res.send({
        auth: 1,
        token: 'Fake',
        token_expiry: expiry,
        uuid: 'd4c63613-d626-4a3f-89de-791f3a03d0f6',
        created_at: date,
        updated_at: date,
        created_by: 1,
        updated_by: 1,
        id: 1
    });
});

//Create route by walking the responses directory
walker.on('file', function(path, file, next) {
    //slices path and file name to be something like /auth/find
    let route = `${path.slice(11)}/${file.name.slice(0, -5)}`,
        //gets method, if not in folder then all methods
        method = path.match(/GET|POST|PUT|DELETE/) || ['ALL'];

    //remove method from route
    route = route.replace(/GET\/|POST\/|PUT\/|DELETE\//, '');

    //ignore files beginning with `.`
    if (file.name.startsWith('.')) {
        return next();
    }

    //create route for correct method and return file contents
    app[method[0].toLowerCase()](route, function(req, res) {
        fs.readFile(`${path}/${file.name}`, function(err, data) {
            if (err) {
                res.status(500);
                res.send(err);
            }

            res.send(JSON.parse(data));
        });
    });

    next();
});