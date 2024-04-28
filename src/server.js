import express from "express";
import { db, connectToDB } from "./db.js";
import fs from 'fs';
import { admin } from "firebase-admin";

const credentials =JSON.parse(
    fs.readFileSync('./credentials.json')
);

admin.initializeApp({
    credential: admin.credential.cert(credentials),
});



//we are creating our app instant in server
const app=express();
// let articlesInfo=[
//     {
//         name:'learn-react',
//         upvotes:0,
//         comments:[],
//     },{
//         name:'learn-node',
//         upvotes:0,
//         comments:[],
//     },{
//         name:'learn-mongo',
//         upvotes:0,
//         comments:[],
//     }
// ]
//setup different endpoints to different requests
//here just start from simple helloworld
//the 'app' get (request type) 'get' request, in () define the args: re and res
// app.get is a function. /hello is the path. req and res are the two args
//step A: resolve undefined issue for access the body of post reqs
app.use(express.json());
// what is abopve code line app.use(express.json())?
//it enable middleware functions in our app instance. they helps to
//keep continue the process chain in between different functionalities.
//express.json() is inbuild middleware function to parse income request as Json formats
// this code line enable global middleware 


//----------
// app.post('/helloworld',(req, res)=>{
//     //we se the access to content of request if method is post
//     //but this gives undefined in server end reason, we need extra middle wheres
//     // step A: so we have to setup other middle wheres above.
//     console.log(req.body);
//     res.send(`Hello ${req.body.name}!`);
// });


// app.get(`/hello/:name`, (req,res)=>
// {
//     const {name}=req.params;
//     res.send(`Hello ${name}!!!`);
// })
//----------

app.get('/api/articles/:name',async (req,res)=>{
    const {name}=req.params;


    const article = await db.collection('articles').findOne({name});
    if(article){
        res.json(article);
    }else{
        res.sendStatus(404);
    }
});

app.put(`/api/articles/:name/upvote`,async  (req,res)=>{
    const {name}=req.params;

    await db.collection('articles').updateOne({name},{
        $inc:{upvotes: 1},
    });

    const article =await db.collection('articles').findOne({name});
    
    if(article){
        console.log(article.upvotes);
        // article.upvotes+=1;
        res.json(article);
        console.log(article.upvotes);
    }
    else{
        req.send(`ther is no ${name} article`);
    }
    
});

app.post('/api/articles/:name/comments', async (req,res)=>{
    const {name}=req.params;
    const {postBy, text} = req.body;

    await db.collection('articles').updateOne({name},{
        $push:{comments: {postBy, text}},
    });

    const article= await db.collection('articles').findOne({name});

    if (article){
        res.json(article);
    } else{
        res.send(`article ${name} doesn't exist!!`);
    }
    
});


//ok now setted the endpoint response. lets define listening
connectToDB(()=>{
    app.listen(8000,()=>{
        console.log('server is listning at port 8000');
    });    
})
