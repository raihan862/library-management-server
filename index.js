const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
const objectid = require('mongodb').ObjectId
require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')



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


const swaggerOption = {
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
            title: "Libary Management",
            description: "This is veru simple library managemant system ",
            contact: {
                email: "raihankabir562@gmial.com"
            },
            servers: ["https://frozen-sierra-38115.herokuapp.com"],
            
        }
    },
    apis: ["index.js"]

};
const swaggerDoc = swaggerJsDoc(swaggerOption)
app.use('/apis-doc',swaggerUI.serve,swaggerUI.setup(swaggerDoc))

/**
 * @swagger
 * definitions:
 *  Books:
 *   type: object
 *   properties:
 *    bookName:
 *     type: string
 *     description: name of the Book
 *     example: 'JavaScript'
 *    author:
 *     type: string
 *     description: Name of the Author
 *     example: 'Raihan'
 *    genre:
 *     type: string
 *     description: The Type of the book
 *     example: 'Horror'
 *    status:
 *     type: string
 *     description: Active Status of the Books
 *     example: 'Active/ Deactive'
 *    releaseDate:
 *     type: string
 *     description: Release Date of the book
 *     example: '2020-08-30'
 *    file:
 *     type: file
 *     description: A image of the book 
 *     example: 'book.png'
 *  UpdateBook:
 *   type: object
 *   properties:
 *    bookName:
 *     type: string
 *     description: name of the Book
 *     example: 'UPdated JavaScript'
 *    author:
 *     type: string
 *     description: Name of the Author
 *     example: 'Raihan'
 *    genre:
 *     type: string
 *     description: The Type of the book
 *     example: 'Horror'
 *    status:
 *     type: string
 *     description: Active Status of the Books
 *     example: 'Active/ Deactive'
 *    contentType:
 *     type: string
 *     description: File Type
 *     example: 'jpg/png'
 *    size:
 *     type: integer
 *     description: File Size
 *     example: 1000
 *    img:
 *     type: string
 *     description: File img
 *     example: "binarydata"
 *    releaseDate:
 *     type: string
 *     description: Release Date of the book
 *     example: '2020-08-30'
 *    file:
 *     type: file
 *     description: A image of the book 
 *     example: 'book.png'
 
 
 */
app.get('/',(req,res)=>{
    res.send("hello")
})
client.connect(err=>{
    const books = client.db(dbname).collection(collection);

/**
 * @swagger
 * /addBook:
 *  post:
 *   summary: Adding a Book
 *   description: Add a Book
 *   consume:
 *    - multipart/form-data
 *    - application/json
 *   parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      description: body of the Book
 *      schema:
 *       $ref: '#/definitions/Books'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/Books'
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */
    app.post('/addBook',(req,res)=>{
        const bookName = req.body.bookName;
        const author = req.body.author;
        const genre =  req.body.genre;
        const releaseDate = req.body.releaseDate;
        const status = req.body.status; 
        let bookImage;
        if (req.files) {
             bookImage = imgProcess(req.files.file)
        }
        else{
             bookImage = {}
        }
         
        
        books.insertOne({bookName, author, genre,status, releaseDate, bookImage})
        .then(result=>{
          
          res.status(200).send("Successfull")
            })
        
        .catch(error=>{})
    
    })


/**      
 * @swagger
 * /books:
 *  get:
 *   summary: get all Books
 *   description: get all Books
 *   responses:
 *    200:
 *     description: success
 */
    app.get("/books",(req,res)=>{

        books.find()
        .toArray((error,document)=>{
            res.send(document)
        })
    })
/**
 * @swagger
 * /getBook/{name}:
 *  get:
 *   summary: Get Specific Book
 *   description: Get search Book
 *   parameters:
 *    - in: path
 *      name: name
 *      schema:
 *       type: string
 *      required: true
 *      description: name of the book
 *      example: Lord Of Ring
 *   responses:
 *    200:
 *     description: success
 */
    app.get('/getBook/:name',(req,res)=>{
        const name= req.params.name;
        
        books.find({bookName:{$regex:name}})
        .toArray((error,document)=>{
            
            res.send(document)
        })
    })
/**
 * @swagger
 * /updateBook/{id}:
 *  put:
 *   summary: update A Book
 *   description: update Book
 *   consumes:
 *    - application/json
 *   produces:
 *    - application/json
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *       type: string
 *      required: true
 *      description: id of the book
 *      example: 5fcd82dec6f02c0017950148
 *    - in: body
 *      name: body
 *      required: true
 *      description: body object
 *      schema:
 *       $ref: '#/definitions/UpdateBook'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/UpdateBook'
 *   responses:
 *    200:
 *     description: success
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/definitions/Books'
 */

    app.put('/updateBook/:id',(req,res)=>{
        const bookName = req.body.bookName;
        const author = req.body.author;
        const genre =  req.body.genre;
        const releaseDate = req.body.releaseDate;
        const status = req.body.status;
        const contentType = req.body.contentType
        const size = req.body.size;
        const img = req.body.img;
        let bookImage = {contentType,size,img}
        if (req.files) {  
            bookImage = imgProcess(req.files.file)
        } 
        if (bookImage == null) {
            bookImage = {}
        }
        books.updateOne({_id:ObjectId(req.params.id)},
        {
            $set:{bookName, author, genre,status, releaseDate, bookImage}
        }
        ).then(mgs=>{
            res.redirect('/')
        })
    })
/**
 * @swagger
 * /deleteBook/{id}:
 *  delete:
 *   summary: delete Book
 *   description: delete Book
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *       type: string
 *      required: true
 *      description: id of the of
 *      example: 5fcda2d43030a713000f4a5e
 *   responses:
 *    200:
 *     description: success
 */
    app.delete('/deleteBook/:id',(req,res)=>{
        books.deleteOne({_id:ObjectId(req.params.id)},
        )
        .then(resp=>res.send("Delete SuccessFully"))
       
    })
    
   
})







app.listen(port,(req,res)=>{
     
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