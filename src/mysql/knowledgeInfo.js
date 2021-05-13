const connection = require("./mysql");
var knowledgeInfo = {}
knowledgeInfo.getAllInfo = function(callback){
    connection.query("select * from knowledge_info;", function (err, rows, fields) {
        if (err) {
          console.log("An error ocurred performing the query.");
          console.log(err);
          return;
        }
        console.log(rows);
        callback(rows);
      });
};
module.exports = knowledgeInfo ;