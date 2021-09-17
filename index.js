const express =require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const port = 3000;

const session = require('express-session');
const MongoStore = new require('connect-mongo')(session);



mongoose.connect('mongodb+srv://admin:admin123@cluster0.kmefw.mongodb.net/test',{
    useUnifiedTopology: true,
    useNewUrlParser: true
  })

const db = mongoose.connection;

app.use(session({
    secret: 'ASesrty8ioklmjn bcfdxesr456789kolmn bvcdxzse45trfvbnjkiu897yu',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  }));


app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));


const routing = require('./routes/routing');
app.use('/', routing);


db.on('open', () =>{
    console.log('databse connected')
    app.listen(port, () => {
        console.log('server started')
    })
})

