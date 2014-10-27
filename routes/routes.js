
exports.index = function(req, res) {
  res.render('index.ejs', { title : 'Daily Kanji', layout:'layout.ejs'});
};

exports.about = function(req, res) {
  res.render('about.ejs');
};

exports.contact = function(req, res) {
  res.render('contact.ejs');
};
