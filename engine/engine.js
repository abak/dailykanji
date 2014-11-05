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
  var min_max_query = 'SELECT min(id), max(id) FROM kanji_table';



  function getRandomID(){
    return Math.floor(Math.random() * (max_id - min_id + 1)) + min_id;
  }

  function queryDatabase(query, callback){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(query, function(err, result) {
        done();
        if (err){
          console.error(err); throw "Error " + err;
        }
        else{
          callback(result.rows);
        }
      });
    });
  }

  function getKanjiFromID(id, callback){
    var query = 'SELECT * FROM kanji_table WHERE id = '+id;
    queryDatabase(query, callback);
  }

  function getRandomKanji(callback){
    var id = getRandomID();
    getKanjiFromID(id, callback);
  };

  function getItemsFromText(text, callback){
    if(text.length > 0){
      var query = "SELECT * FROM kanji_table WHERE ";//kanji='" + text +"'";
      for(var i = 0, len=text.length - 1 ; i < len ; i++){
        query += "kanji='"+text[i]+"' OR ";
      }
      query += "kanji='"+text[text.length - 1]+"'";
    }
    else{
      var query = "SELECT * FROM kanji_table";
    }

    queryDatabase(query, callback);
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
    "getRandomKanji":function(callback){
      wrapDatabaseQuery(function(){getRandomKanji(callback);});
    }
    , "getKanjiFromID":function(id, callback){
      wrapDatabaseQuery(function(){getKanjiFromID(id, callback);});
    }
    , "getItemsFromText":function(text, callback){
      wrapDatabaseQuery(function(){getItemsFromText(text, callback);});
    }
  };
})();

exports.default = function(request, response){
  var rendering_callback = function(query_result){
    response.render('kanji', query_result[0]);
  }
  var query = request.query;
  if(query.hasOwnProperty("id")){
    engine.getKanjiFromID(query.id, rendering_callback);
  } else {
    engine.getRandomKanji(rendering_callback);
  }
};

exports.advanced_search = function(request, response){
  
  var rendering_callback = function(query_result){
    if(query_result.length > 1){
      response.render('table', {'collection' :query_result});
    }
    else if (query_result.length === 1){
      response.render('kanji', query_result[0]);
    }
    else if (query_result.length === 0){
      err = {
        status : 'Sorry about that.',
        stack :''};
      response.render('error', {message : 'No Kanji Found', error:err});
    }
  }

  engine.getItemsFromText(request.body.kanjiTextField, rendering_callback);

};