var pg = require('pg');
  
function isEmpty(object){
  for(var key in object){
    if(object.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}

var engine = (function(){
  var min_id = undefined;
  var max_id = undefined;
  var min_max_query = 'SELECT min(id), max(id) FROM kanji';



  function getRandomID(){
    return Math.floor(Math.random() * (max_id - min_id + 1)) + min_id;
  }

  function getKanjiFromID(id, callback){
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
  }

  function getRandomKanji(callback){
    var id = getRandomID();
    getKanjiFromID(id, callback);
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

  function wrapDatabaseQuery(callback){
    if (typeof min_id == 'undefined' 
     || typeof max_id == 'undefined'){
      getMinMax(callback);
    }
    else{
      callback();
    }
  };

  return {
    "getRandomKanji":function(callback){wrapDatabaseQuery(function(){getRandomKanji(callback);});},
    "getKanjiFromID":function(id, callback){wrapDatabaseQuery(function(){getKanjiFromID(id, callback);});},
    "isEmpty":isEmpty
  };
})();

exports.route = function(request, response){
  var rendering_callback = function(query_result){
    response.render('kanji', query_result);
  }
  var query = request.query;
  if(query.hasOwnProperty("id")){
    console.log(query.id)
    engine.getKanjiFromID(query.id, rendering_callback);
  } else {
    engine.getRandomKanji(rendering_callback);
  }
};