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


knowledgeInfo.addInfo = function(data,callback){
  console.log(data)
 
 // var sql = "INSERT INTO knowledge_info(`Kname`,`Kneighbor`,`Klabel`) VALUES ('"+data[0]+"', '"+data[1]+"', '"+data[1]+"')";
 var sql = "DELETE FROM knowledge_info WHERE Kname  = '"+data[0]+"'";
  connection.query(sql, function (err, rows, fields) {
    if(err){
                console.log('DELETE ERROR - ', err.message);
                return;
            }
            console.log("DELETE SUCCESS");
    });

  var sql = "INSERT INTO knowledge_info(`Kname`,`Kneighbor`,`Klabel`) VALUES ('"+data[0]+"', '"+data[1]+"', '"+data[1]+"')";
 connection.query(sql, function (err, rows, fields) {
   if(err){
               console.log('INSERT ERROR - ', err.message);
               return;
           }
           console.log("INSERT SUCCESS");
   });
}
module.exports = knowledgeInfo ;