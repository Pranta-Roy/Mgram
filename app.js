const express = require('express');
const app = express();
const hbs = require('hbs');
const mysql = require('mysql');
const fileUpload= require('express-fileupload')
const path = require('path');
const session = require('express-session');
const async = require('hbs/lib/async');

var dir=path.join(__dirname)+'/views/partial';
hbs.registerPartials(dir);


const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'mgram'
});


const publicDir = path.join(__dirname);
app.use(express.static(publicDir+'/views/public'));
app.set('view engine','hbs');
app.use(fileUpload());
app.use(express.urlencoded({extended:false}));
app.use(session({secret:'abcxyz'}));    
 


app.get('/editprofile',(req,res)=>{ 
    db.query('SELECT *FROM users WHERE id= ?',req.session.uname,(err,result)=>{
        res.render('editprofile',{ 
            'uname': result[0].uname,
            'pass' : result[0].password,
            'picture' : result[0].picture   
        });
    })
     
})  

app.post('/submitpost',(req,res)=>{
    var uid =req.session.uname;
    const {upost} =req.body  

    db.query('SELECT *FROM users WHERE id =?',uid,(err,result)=>{
    var uname = result[0].uname;
    db.query('INSERT INTO status SET ?',{uid:uid,uname:uname,post:upost},(err,result)=>{
        if(!err){
            res.redirect('/');
            
        }else{
            console.log(err);
        }
    })
})
})

app.post('/editform',(req,res)=>{
    const{uname,pass,picture}=req.body;
    var id= req.session.uname;
    db.query('UPDATE users SET uname =?,password=?,photo=? WHERE id=?',[uname,pass,picture,id],(err,result)=>{
        console.log(err);    
    });
    
})

app.get('/',(req,res)=>{
   
        if(!req.session.uname){
           
            res.redirect("/login");
        }else{
            db.query('SELECT *FROM users',(err,result)=>{
               db.query('SELECT *FROM status ORDER BY id DESC',(err,post)=>{
                   res.render('home',{
                       'users': result,
                       'status':post
                   })  

               })
            });  
        }
    
    
        
    
   
    
})
     


app.get('/register',(req,res)=>{
    res.render('register');  
})

app.get('/profile/:id',(req,res)=>{
    var uid=req.params.id;
    db.query('SELECT *FROM users WHERE id =?',uid,(err,result)=>{
        res.render('profile',{
            'users':result
        });
        })
})   
app.get('/login',(req,res)=>{  
    
    res.render('login'); 
});
app.post('/submitlogin',(req,res)=>{
    const{email,pass}=req.body;
    db.query('SELECT *FROM users WHERE email =?',email,(err,result)=>{
        if(result.length==0){
            res.render('login',{
                'message':'email doesnot exist'
            })
        } else{
            if(result[0].password == pass){
                req.session.uname=result[0].id; 
             res.redirect("/");
             
            }else{
                res.render('login',{
                    'message':'sorry pasword doesnot match'  
                })
            }
        }
    })
})


app.post('/submitpost',(req,res)=>{     
    var uid = req.session.uname;
    const {upost} = req.body;

    db.query('SELECT *FROM users WHERE id = ?',uid,(err,result)=>{
        var uname = result[0].name;

        db.query('INSERT INTO status SET ?',{uid:uid,uname:uname,post:upost},(err,result)=>{})
        if(!err){
            res.redirect('/');

        } else{
            console.log(err);
        }
    })
})







app.listen('5000',(req,res)=>{
    console.log('server running on port 5000');  
})