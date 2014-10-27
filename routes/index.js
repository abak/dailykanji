var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.renderPartials({index :{title : "Daily Kanji"}});
  // res.render('layout' , res.renderPartials({body :{title : "Daily Kanji"}}));
  res.render('index.ejs', { title : 'Daily Kanji', layout:'layout.ejs'});
});

module.exports = router;
