var pg = require('pg');

var engine = (function(){
  var min_id = undefined;
  var max_id = undefined;
  var min_max_query = 'SELECT min(id), max(id) FROM kanji';

  function getRandomID(){
    return Math.floor(Math.random() * (max_id - min_id + 1)) + min_id;
  }

  function getRandomKanji(callback){
    var id = getRandomID();
    var query = 'SELECT * FROM kanji WHERE id = '+id;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(query, function(err, result) {
        done();
        if (err){
          console.error(err); throw "Error " + err;
        }
        else{
          callback(result.rows[0]);
        }
      });
    });
  };

  function getMinMax(callback){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(min_max_query, function(err, result) {
        done();
        if (err){
          console.error(err); throw "Error " + err;
        }
        else{
          min_id = result.rows[0].min;
          max_id = result.rows[0].max;
        }
        if (null !== callback){
          callback();
        }
      });
    });
  };

  function getRandomKanjiWrapper(callback){
    if (typeof min_id == 'undefined' 
     || typeof max_id == 'undefined'){
      getMinMax(function(){getRandomKanji(callback);});
    }
    else{
      getRandomKanji(callback);
    }
  };


  return {
    "getRandomKanji":getRandomKanjiWrapper
  };
})();

exports.getRandomKanji = engine.getRandomKanji;

exports.route = function(request, response){
  engine.getRandomKanji(function(query_result){
    response.render('kanji', query_result);
  });
};