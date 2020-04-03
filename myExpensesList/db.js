var connection;
exports.setupDBAndTable = function (conn) {

   //save connection
    connection = conn;

    
    if (!process.env.VCAP_SERVICES) {
        connection.query('CREATE DATABASE IF NOT EXISTS projectsDB;', function (err) {
            if (err)  return console.log(err);
        });

        //Switch to 'projectsDB' database
        connection.query('USE  projectsDB;', function (err) {
            if (err)  return console.log(err);
        });
    }

    
    connection.query('SHOW TABLES LIKE "projects";', function (err, rows) {
        if (err) return console.log(err);

        
        if (rows.length == 0) {
            var sql = "" +
                "CREATE TABLE projects(" +
                " id INT UNSIGNED NOT NULL auto_increment," +
                " name VARCHAR(50) NOT NULL default ''," +
                " site VARCHAR(50) NOT NULL default ''," +
                " description VARCHAR(200) NOT NULL default ''," +
                " PRIMARY KEY (id)" +
                ");";

            connection.query(sql, function (err) {
                if (err) return console.log(err);
            });
        }

    });

};

exports.addProject = function (task, callback) {
    connection.query("INSERT INTO projects (name, site, description) VALUES (?, ?, ?)", [task.name, task.site, task.description], callback);
};

exports.updateProject = function (id, task, callback) {
    var sql = "UPDATE projects SET name='" + task.name
        + "', site='" + task.site
        + "', description='" + task.description
        + "' WHERE id=" + id;

    connection.query(sql, callback);
};

exports.getProjects = function (callback) {
    connection.query("SELECT * FROM projects", callback);
};

exports.getProject = function (id, callback) {
    connection.query("SELECT * FROM projects WHERE id=" + id, callback);
};

exports.deleteProject = function (id, callback) {
    connection.query("DELETE FROM projects WHERE id=" + id, callback);
};