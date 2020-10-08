const express = require('express')
const app = express()
const path = require("path");
const request = require('request');
var jwt = require('jsonwebtoken');
var tokenKey = "gj24k1l23jk2ngkjlkj4lk2j3l1";
var mysql = require('mysql');//
var auth = require("./lib/auth");

var connection = mysql.createConnection({ // db 연결하기
  host: 'localhost',
  user: 'root',
  password: 'ljh9915!',
  database: 'fintech'
});
connection.connect();

app.set('views', __dirname + '/views'); // ejs를 사용하기 위한 디렉토리 설정
app.set('view engine', 'ejs'); // ejs를 사용하기위한 뷰엔진 설정

app.use(express.json()); // json 타입의 데이터를 받기위한 설정
app.use(express.urlencoded({ extended: false })); // urlencoded 타입의 데이터를 받기 위한 설정

app.use(express.static(path.join(__dirname, "public")));

app.get('/', function (req, res) {
  // 다양한 로직들 채워나갑니다.
  // 
  res.send('Hello World')
});

app.get('/signup', function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/main", function (req, res) {
  res.render("main");
});
app.get("/balance", function (req, res) {
  res.render('balance');
});
app.get("/qrcode", function (req, res) {
  res.render('qrcode');
});

app.get("/qrreader", function (req, res) {
  res.render("qrreader");
});
//app.get('/authText', auth, function (req, res) {
// res.json("당신은 콘텐츠 접근에 성공하였습니다.");
//});

app.get("/authResult", function (req, res) {
  var authCode = req.query.code;
  console.log(authCode);

  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    form: {
      code: authCode,
      client_id: "1TcgSX4fNCcML8ULhSFm1XopJ0oUf6DMS3Q1joH5",
      client_secret: "hROUpxu2Et1WxuZQSjroUZLNehN0ZZhq8f3Vw8qk",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code",
      //#자기 키로 시크릿 변경
    },
  };
  request(option, function (error, response, body) {
    console.log(body);
    var accessRequestResult = JSON.parse(body); //json 오브젝트를 JS 오브젝트로 변경
    console.log(accessRequestResult);
    res.render("resultChild", { data: accessRequestResult }); // resultChild를 그릴건데 
  });
});
app.post('/signup', function (req, res) {
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;
  console.log(userName, userEmail, userPassword);
  connection.query("INSERT INTO `user`(`name`,`email`,`password`, `accesstoken`,`refreshtoken`,`userseqno`) VALUES(?,?,?,?,?,?);",
    [
      userName,
      userEmail,
      userPassword,
      userAccessToken,
      userRefreshToken,
      userSeqNo,
    ],
    function (error, results, fields) {
      if (error) throw error;
      else {
        res.json(1);
      }
    });
});

app.post("/login", function (req, res) {
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  console.log(userEmail, userPassword);
  connection.query("SELECT * FROM user WHERE email = ?", [userEmail], function (
    error,
    results,
    fields
  ) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json(2); // 아이디 존재하지 않음
      } else {
        var storedPassword = results[0].password;
        if (storedPassword == userPassword) {
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "1d",
              issuer: "fintech.Hyeok",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("로그인 실패");
        }
      }
    }
  });
});

app.post('/list', auth, function (req, res) {// auth란 미들웨어 선언해줄 필요가 있다.
  var userId = req.decoded.userId;
  // 토큰에 담겨있는 사용자 정보
  connection.query("SELECT * FROM user WHERE id = ?", [userId], function (
    error,
    results
  ) {
    if (error) throw error;
    else {
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          "Authorization": "Bearer " + results[0].accesstoken,
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          user_seq_no: results[0].userseqno
        },
      };
      request(option, function (err, response, body) {
        var resResult = JSON.parse(body);
        res.json(resResult);
      })
    }
  });
});
app.post("/balance", auth, function (req, res) {
  var userId = req.decoded.userId;
  var finusenum = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991659620U" + countnum; //이용기과번호 본인것 입력
  connection.query("SELECT * FROM user WHERE id = ?", [userId], function (
    error,
    results
  ) {
    if (error) throw error;
    else {
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
        },
        //accesstoken 입력
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: finusenum,
          tran_dtime: "20200923153339",
        },
      };
      request(option, function (err, response, body) {
        var resResult = JSON.parse(body);
        res.json(resResult);
      })
    }
  });
  //사용자 정보를 바탕으로 request 요청을 만들기 url https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num
});
app.post("/transactionlist", auth, function (req, res) {
  var userId = req.decoded.userId;
  var finusenum = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991659620U" + countnum; //이용기과번호 본인것 입력
  connection.query("SELECT * FROM user WHERE id = ?", [userId], function (
    error,
    results
  ) {
    if (error) throw error;
    else {
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
        },
        //accesstoken 입력
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: finusenum,
          inquiry_type: "A",
          inquiry_base: "D",
          from_date: "20190101",
          to_date: "20190101",
          sort_order: "D",
          tran_dtime: "20200923153339",
        },
      };
      request(option, function (err, response, body) {
        var resResult = JSON.parse(body);
        console.log(resResult);
        res.json(resResult);
      });
    }
  });
  //사용자 정보를 바탕으로 request 요청을 만들기 url https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num
});
app.post('/withdraw', auth, function (req, res) {
  var userId = req.decoded.userId;
  var finusenum = req.body.fin_use_num;
  var amount = req.body.amount;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var to_fin_use_num = req.body.to_fin_use_num;
  var transId = "T991659620U" + countnum; //이용기과번호 본인것 입력
  connection.query("SELECT * FROM user WHERE id = ?", [userId], function (
    error,
    results
  ) {
    if (error) throw error;
    else {
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/json"
        },
        //accesstoken 입력
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        json: {
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "6723203417",
          dps_print_content: "쇼핑몰환불",
          fintech_use_num: finusenum,
          wd_print_content: "오픈뱅킹출금",
          tran_amt: amount,
          tran_dtime: "20200923153339",
          req_client_name: "홍길동",
          req_client_fintech_use_num: finusenum,
          req_client_num: "HONGGILDONG1234",
          transfer_purpose: "ST",
          recv_client_name: "진상언",
          recv_client_bank_code: "097",
          recv_client_account_num: "6723203417",
        },
      };
      var countnum1 = Math.floor(Math.random() * 1000000000) + 1;
      var transId1 = "T991659620U" + countnum1; //이용기과번호 본인것 입력
      request(option, function (err, response, body) {
        if ((body.rsp_code = "A0000")) {
          console.log(body);
            var option = {
              method: "POST",
              url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
              headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjU5NjIwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNjA4Nzg3MjEwLCJqdGkiOiIyYzE5NjhlNi1kNjI1LTQzNzEtODJmYS1lZjczMDYyNmNlODkifQ.XYua8-TZ-FYdRg4PQ-e_RX64NbuqJ_maVXhUPgk_Sjw",
                "Content-Type": "application/json"
              },
              //accesstoken 입력
              //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
              json: {
                cntr_account_type: "N",
                cntr_account_num: "1754296462",
                wd_pass_phrase: "NONE",
                wd_print_content: "환불금액",
                name_check_option: "on",
                tran_dtime: "20200925150000",
                req_cnt: "1",
                req_list: [
                  {
                    tran_no: "1",
                    bank_tran_id: transId1,
                    fintech_use_num: to_fin_use_num,
                    print_content: "쇼핑몰환불",
                    tran_amt: amount,
                    req_client_name: "홍길동",
                    req_client_fintech_use_num: finusenum,
                    req_client_num: "1100763462",
                    transfer_purpose: "ST",
                  }
                ]
              },
            };
            request(option, function (err, response, body) {
              console.log(body);
              res.json(1);
              //입금이체 기능 만들기 여기안에 출금이 성공한 후 실행
            });
          } else {
            res.json(0);
          }
      });
    }
  });
});
app.listen(3001)
//front end 에서 받은 데이터를 node js로 받아오고 db에서 데이터를 받아와서 webserver에서 frontend를 그려준다.

//알고 있는 지식으로 frontend에서 db로 데이터를 넘겨보자