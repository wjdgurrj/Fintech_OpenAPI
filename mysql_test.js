var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'ljh9915!',
  database : 'fintech'
});
 
connection.connect();

connection.query('SELECT * FROM user', function (error, results, fields) {
  if (error) throw error;
  console.log(results[0]);
});

connection.end();
// Vuejs React 는 html css js(통신 이벤트 달기) 를 잘 표현하도록 하기위한 프레임워크!
