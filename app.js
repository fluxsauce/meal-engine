var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('meal-engine', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

//Global Vars
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// Express Validator Middleware
app.use(expressValidator());

app.get('/', function(req, res){
    // @todo Refactor so variable reflects actual contents (recipes).
  db.users.aggregate({ $sample: { size: 1 } }, function(err, random) {
      // @todo Handle error gracefully
      db.users.find(function(err, users){
          res.render('index', {
              title: 'Recipes',
              users: users,
              random: random[0]
          });
      })
  });
});

// @todo refactor so path is /recipes/add
app.post('/users/add', function(req, res){
  req.checkBody('recipe_name', 'Recipe Name is Required').notEmpty();
  req.checkBody('link_name', 'Link is Required').notEmpty();

  var errors = req.validationErrors();

    if(errors){
      db.users.find(function(err, users){
        // @todo return res.render to end
        res.render('index', {
          title: 'Recipes',
          errors: errors,
          users: users
        });
      })
        // @todo remove else
    } else {
      // @todo use logical variable name
        var newUser = {
          recipe_name: req.body.recipe_name,
          link_name: req.body.link_name,
        };

          db.users.insert(newUser, function(err, result){
            if(err){
              // @todo send an error to the user
              console.log(err);
            }
            res.redirect("/");
          });
      }
});

// @todo use /recipes
app.delete('/users/delete/:id', function(req, res){
  // @todo validate the id
  db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
    if(err){
      // @todo send an error to the user
      console.log(err);
    }
    res.redirect('/');
  });
});

app.listen(3000, function(){
  console.log('Server Started on Port 3000...');
});
