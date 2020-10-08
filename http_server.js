var http = require("http");
const request = require('request');
var parseString = require('xml2js').parseString;

http.createServer(function (req, res) {
    var body = "<html><h1>백혜민내꺼♥</h1></html>";
    console.log("요청이 들어왔습니다....."); // 새로고침 이 문구가 출력이 됨..
    res.setHeader('Content-Type', 'text/html; charset=utf-8'); // text/(변경) 하여서 html로 입력받게 함
    res.end(body)
}).listen(3000);


// 127.0.0.1 : 3000 -> nodejs http server.

// 127.0.0.1 : 3306 -> my sql
