const express = require("express");
const app = express();
const cors = require("cors")
require("dotenv").config()

const { setup, deriveKeyFromPassword } = require("./encryption.js")

app.use(cors())
app.use(express.json())

const port = 3000;

const sql = require('mssql/msnodesqlv8');
console.log(typeof(process.env.DB_SERVER))
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustedConnection: true, // Set to true if using Windows Authentication
        trustServerCertificate: true, // Set to true if using self-signed certificates
    },
};

app.post("/login", async (req, res) => {
    const {password, email} = req.body;
    // userID = req.query.id;
    
    const results = await sql.query`select * from dbo.UserTable where Email=${email}`;
    if(!results) return res.status(404).send("not found")
    
    hash = await deriveKeyFromPassword(password, new Uint8Array(Buffer.from(results.recordset[0].Salt, 'hex')))

    if(hash == results.recordset[0].PasswordHash) {
        userData = {
            ID: results.recordset[0].ID,
            Username: results.recordsets[0][0].Username,
            email: email,
        }
        res.send(JSON.stringify(userData))
    }else res.status(404).json({message: "Wrong Password"})

})

app.post("/newPost", async (req, res) => {
    const {PostTitle, PostContent, PostAttachment, ID} = req.body;
    const attachmentBuffer = Buffer.from(PostAttachment, 'base64');
    try{
        pool = await new sql.ConnectionPool(config).connect()
        let request = pool.request();
        await request
        .input("PostTitle", PostTitle)
        .input("PostContent",PostContent)
        .input("PostAttachment", attachmentBuffer)
        .input("UserId", ID)
        .query`insert into dbo.PostTable (UserId,PostTitle,PostContent,PostAttachments) Values (@UserId,@PostTitle,@PostContent, @PostAttachment)`;

        res.status(201).json({message: 'Post added successfully'})
    }catch(err){
        res.status(404).json({message: err})
    }
}) 

app.get("/getPosts", async (req,res) => {
    const pageNumber = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try{
        const offset = (pageNumber - 1) * pageSize;

        const results = await sql
        .query`
            SELECT 
                p.UserId, 
                p.PostTitle, 
                p.PostContent, 
                p.PostAttachments,
                p.CreatedAt,
                p.ViewCount,
                u.Username
            FROM dbo.PostTable p
            INNER JOIN dbo.UserTable u ON p.UserId = u.ID
            ORDER BY UserId DESC  -- Or use a PostId/Date column if you have one
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY;
        `;
        res.status(201).json({message: results})
    }catch(err){
        console.log("err")
        res.status(201).json({message: err})
    }
})

app.post("/newAccount", async (req, res) => {
    const {email, password, username} = req.body;
    
    if (!email || !password || !username){
        return res.status(400).send("Missing required parameters")
    }
    hashedPassword = await setup(password)
    console.log(hashedPassword)
    try{
        pool = await new sql.ConnectionPool(config).connect()
        let request = pool.request();
        await request
        .input("email", email)
        .input("Salt",hashedPassword.salt)
        .input("Password_hash", hashedPassword.hash)
        .input("username", username)
        .query`insert into dbo.UserTable (email,username,salt,passwordhash) Values (@email,@username, @Salt, @Password_hash)`;

        res.status(201).json({message: 'User added successfully'})
    }catch(err){
        if(err.number == 2627) {
            res.status(404).json({message: "email already exists"})
        }
    }
    
    // console.log("pool connected")
})

app.listen(port,async () => {
    console.log(`App listening at localhost:${port}`)
    await sql.connect(config)
    console.log("db connected")
})