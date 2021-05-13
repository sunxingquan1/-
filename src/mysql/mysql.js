const mysql = require('mysql');
connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'personaldb',
    port: 3306   //MySQL 的默认端口号
});
connection.connect(function (err) {
    // in case of error
    if (err) {
      console.log(err.code);
      console.log(err.fatal);
    }
  });

  module.exports = connection ;
