const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
const objectid = require('mongodb').ObjectId
require('dotenv').config();

const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload())
const uname = process.env.USER_NAME;
const pass = process.env.PASSWORD;
const dbname = process.env.DATABASE_NAME;
const collection = process.env.COLLECTION;
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${uname}:${pass}@cluster0.5av9x.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.get('/',(req,res)=>{
    res.send("hello")
})
client.connect(err=>{
    const books = client.db(dbname).collection(collection);

    app.post('/addBook',(req,res)=>{
        const bookName = req.body.bookName;
        const author = req.body.author;
        const genre =  req.body.genre;
        const releaseDate = req.body.releaseDate;
        const status = req.body.status;
        const bookImage = imgProcess(req.files.file)
        books.insertOne({bookName, author, genre,status, releaseDate, bookImage})
        .then(result=>{
          
          res.status(200).send("Successfull")
            })
        
        .catch(error=>{})
    
    })

    app.get("/books",(req,res)=>{

        books.find()
        .toArray((error,document)=>{
            res.send(document)
        })
    })
    app.get('/getBook/:name',(req,res)=>{
        const name= req.params.name;
        
        books.find({bookName:{$regex:name}})
        .toArray((error,document)=>{
            
            res.send(document)
        })
    })

    app.patch('/updateBook/:id',(req,res)=>{
        const bookName = req.body.bookName;
        const author = req.body.author;
        const genre =  req.body.genre;
        const releaseDate = req.body.releaseDate;
        const status = req.body.status;
        let bookImage = req.body.bookImage
        if (req.files) {
            bookImage = imgProcess(req.files.file)
        }
        
        
        
        books.updateOne({_id:ObjectId(req.params.id)},
        {
            $set:{bookName, author, genre,status, releaseDate, bookImage}
        }
        ).then(mgs=>{
            res.redirect('/') 
        })
    })
    app.delete('/deleteBook/:id',(req,res)=>{
        books.deleteOne({_id:ObjectId(req.params.id)},
        )
        .then(resp=>res.send("Delete SuccessFully"))
       
    })
    
   
})







app.listen(port,(req,res)=>{
     console.log("listening");
})

const imgProcess=(file)=>{
    
    const newImg = file.data
    const encImg = newImg.toString('base64')

    const   img={
        contentType: file.mimetype,
        size: file.size,
        
        img: Buffer.from(encImg, 'base64')
    } 
    return img
    


} 