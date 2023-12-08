const port = 3000;
const express = require("express");
//mySQL과 연결하기 위한 모듈 설치 및 설정
const mysql = require("mysql");

//svr.js에서 public/adduser.html로 접근을 위한 경로
const path = require('path');
//첫 실행파일이 svr.js가 되도록 설정
const static = require('serve-static');

//DB연결정보를 등록
const dbconfig = require('./config/dbconfig.json');

//DB연결설정
const pool = mysql.createPool({
    connectionLimit:10, //최대 연결 수
    host:dbconfig.host,
    user:dbconfig.user,
    password:dbconfig.password,
    database:dbconfig.database,
    debug:false
});

const app = express();
app.listen(port,()=>{
    console.log("3000번 포트 연결완료");

})
//url의 전송방식을 좀 더 빠르고 web브라우저에서 유리하게 동작하는 형태로 설정
app.use(express.urlencoded({extended:true}));

//json구조의 데이터를 분석하겠다.
app.use(express.json());

//public 폴더로 접근을 허가
app.use('/public',static(path.join(__dirname,"public")));

//url경로를 받았을 때, req와 res에 대응하기
app.post('/process/adduser',(req,res)=>{
    console.log('process/adduser 호출됨' + req);
    const paramId = req.body.id;
    const paramName =  req.body.name;
    const paramAge = req.body.age;
    const paramPassword = req.body.password;

    //위의 정보들을 DB에 넣기
    pool.getConnection((err,conn)=>{
        if(err){
            conn.release();
            console.log("연결오류");
            return;
        }
        console.log("DB연결 성공");
        //DB연결이 완료되었으므로, 유저정보를 insert하자
        conn.query(
            'insert into users(id,name,age,password)values(?,?,?,?);',[paramId,paramName,paramAge,paramPassword],
        (err,result)=>{
            /* 위의 insert쿼리를 실행하면 err, result로 최종 결과를 받아볼 수 있다. */
            conn.release();/* db연결 해제 */
            if(err){
                console.log("등록실패");
                return;
            }
            if(result){
                console.log("가입성공");
                res.writeHead('200', {'Content-Type':'text/html; charset=utf8'});
                res.write("<h2>" + paramName + "님 가입을 축하합니다.</h2>");
                res.end();
            }else{
                console.log("가입실패");
                res.writeHead('404', {'Contest-Type':'text/html; charset=utf8'});
                res.write("<h2>정보추가에 실패했습니다. 관리자에게 문의하세요</h2>");
                res.end();
            }
        }
        );
    });
});





