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
// Vuejs React �� html css js(��� �̺�Ʈ �ޱ�) �� �� ǥ���ϵ��� �ϱ����� �����ӿ�ũ