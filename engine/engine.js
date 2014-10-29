var pg = require('pg');

var engine = (function(){
  var min_id = undefined;
  var max_id = undefined;
  var min_max_query = 'SELECT min(id), max(id) FROM kanji';

  function getRandomID(){
    return Math.floor(Math.random() * (max_id - min_id + 1)) + min_id;
  }

  function getRandomKanji(request, response){
    var id = getRandomID();
    var query = 'SELECT * FROM kanji WHERE id ='+id;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(query, function(err, result) {
        if (err){
          console.error(err); throw "Error " + err;
        }
        else{
          response.send(result.rows);
        }
      });
    });
  };

  function getMinMax(response, callback){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(min_max_query, function(err, result) {
        done();
        if (err){
          console.error(err); throw "Error " + err;
        }
        else{
          min_id = result.rows[0].min;
          max_id = result.rows[0].max;
          
          if (null !== response){
            response.send({
              "min_id":min_id,
              "max_id":max_id
            })
          }
        }
        if (null !== callback){
          callback();
        }
      });
    });
  };

  function getRandomKanjiWrapper(request, response){
    if (typeof min_id == 'undefined' 
     || typeof max_id == 'undefined'){
      getMinMax(null, function(){getRandomKanji(request, response);});
    }
    else{
      getRandomKanji(request, response);
    }
  };

  return {
    "getMinMax": getMinMax,
    "getRandomKanji":getRandomKanjiWrapper
  };
})();

exports.getMinMax = engine.getMinMax;
exports.getRandomKanji = engine.getRandomKanji;