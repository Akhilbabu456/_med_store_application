var createError = require('http-errors');
var express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./config/db")
var path = require('path');
var fs = require("fs")
const hbs = require('hbs');	
const session = require("express-session")
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require("connect-flash")
var expressMessages = require("express-messages")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authorized = require("./middleware/authMiddleware")

var app = express();
dotenv.config()
connectDB()


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // session cookie lasts for 24 hours
}));
hbs.registerHelper('add', function(a, b) {
  return a + b;
});
hbs.registerPartial(
  "alertMessage",
  fs.readFileSync(
    path.join(__dirname, "views", "partials", "message.hbs"),
    "utf8"
  )
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
});

app.use('/', indexRouter);
app.use("/login", indexRouter)
app.use("/signup", indexRouter)
app.use('/user',authorized, usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
