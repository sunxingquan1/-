const mysql = require('mysql');
conn = mysql.createConnection({
    host: localhost,
    user: "root",
    password: "",
    database: blogdb,
    port: 3306   //MySQL 的默认端口号
});
conn.connect(function(err){
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
})
$query = "SELECT * from user_info";

      connection.query($query, function (err, rows, fields) {
        if (err) {
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
        }

        callback(rows);

        console.log("Query succesfully executed");
      });

      // Close the connection
      connection.end(function () {
        // The connection has been closed
      });
