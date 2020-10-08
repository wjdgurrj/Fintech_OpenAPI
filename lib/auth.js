const jwt = require("jsonwebtoken");
var tokenKey = "gj24k1l23jk2ngkjlkj4lk2j3l1";

const authMiddleware = (req, res, next) => { // 사용자가 맞는지 확인하는 중간과정
  const token = req.headers["ourtoken"] || req.query.token;
  console.error("사용자가 전송한 토큰 : ", token);
  if (!token) {
    return res.status(403).json({ // 403 error = 권한이 없다
      server: "우리서버",
      success: false,
      message: "not logged in",
    });
  }
  const p = new Promise((resolve, reject) => {
    jwt.verify(token, tokenKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
  const onError = (error) => {
    console.log(error);
    res.status(403).json({
      server: "우리서버",
      success: false,
      message: error.message,
    });
  };
  p.then((decoded) => {
    req.decoded = decoded;
    next(); //다음단계로 넘겨주기 
  }).catch(onError);
};
module.exports = authMiddleware;