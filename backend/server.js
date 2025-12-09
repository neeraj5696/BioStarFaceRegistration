const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = 5000;

console.log('ENV loaded:', process.env.HR_USERNAME, process.env.HR_PASSWORD);



//middleware
app.use(cors({

    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
   
}));


app.use(express.urlencoded({extended:true}));
app.use(express.json());

//HR long page

const authRouter = require('./routes/auth');
const { connectDB } = require('./model/db');
app.use('/api', authRouter);


//USER  data
app.use('/controller', (() =>{
res
.send({message: 'User list', status: 200})
}))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log( connectDB())
    console.log('Credentials:', process.env.HR_USERNAME, process.env.HR_PASSWORD);
});
