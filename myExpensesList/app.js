var express = require('express'),
    http = require('http'),
    path = require('path'),
    mysql = require('mysql'),
    lib = require('./db.js');

//This configuration will be auto-swapped by Cloud Foundry automatically if run on CF (PS: auto-reconfiguration)

var connection = mysql.createConnection({
    host:'localhost',
    user:'raja', //oratile
    password:'test' //expenses
});

connection.connect(function (err) {
    if (err) return console.log(err);

    lib.setupDBAndTable(connection);
});

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

//Create new expense
app.post('/project', function (req, res) {
    var b = req.body;
    var project = {name:b.name, site:b.site, description:b.description};

    lib.addProject(project, function (err, info) {
        if (err) {
            return res.json({"error":"something went wrong" + err});
        }
        project.id = info.insertId;
        res.json(project);
    });
});

//View expenses
app.get('/project', function (req, res) {
    //if id is passed, return that project
    if (req.query.id) {
        lib.getProject(req.query.id, function (err, rows) {
            return err ? res.json(err) : res.json(rows && rows[0]);
        });
    } else { //views a list of all expenses
        lib.getProjects(function (err, rows) {
            return err ? res.json(err) : res.json(rows);
        });
    }
});

//Update or modify expense
app.put('/project', function (req, res) {
    var b = req.body;
    var project = {name:b.name, site:b.site, description:b.description};

    lib.updateProject(req.query.id, project, function (err, info) {
        if (err) {
            return res.json({"error":"something went wrong" + err});
        }
        res.json(project);
    });
});


//Delete an expense
app.delete('/project', function (req, res) {
    lib.deleteProject(req.query.id, function (err, info) {
        res.json({"Error":err});
    });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});