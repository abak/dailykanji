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

  function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function getRandomID(){
    return getRandomInt(min_id, max_id + 1);//inclusive
  }

  function queryDatabase(query, queryArgs, callback){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(query, queryArgs, function(err, result) {
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
    var query = 'SELECT * FROM kanji_table WHERE id = $1';
    queryDatabase(query, [id], callback);
  }

  function getRandomKanji(callback){
    var id = getRandomID();
    getKanjiFromID(id, callback);
  };


  function getAllKanjiFromLevel(level, callback){
    var query = 'SELECT * FROM kanji_table WHERE jltp >= $1';
    queryDatabase(query, [level], callback);
  };

  function getRandomKanjiFromLevel(level, callback){
    if (level === "0"){
      getRandomKanji(callback);
    }
    else{

      var selection_callback = function(query_result){
        if(query_result.length === 0){
          callback(query_result);
        }
        else{
          var idx = getRandomInt(0, query_result.length);
          var selected = [query_result[idx]];
          callback(selected);
        }
      };

      getAllKanjiFromLevel(level, selection_callback);
    }
  };

  function getItemsFromText(text, callback){
    if(text.length > 0){
      var query = "SELECT * FROM kanji_table WHERE ";
      var queryArgs = [];
      for(var i = 0, len=text.length - 1 ; i < len ; i++){
        query += "kanji=$"+(i+1)+" OR ";
        queryArgs.push(text[i]);
      }
      query += "kanji=$"+(text.length);
      queryArgs.push(text[text.length - 1]);
    }
    else{
      var query = "SELECT * FROM kanji_table";
      var queryArgs = [];
    }

    queryDatabase(query, queryArgs, callback);
  };


  function getMinMax(callback){
    var min_max_query = 'SELECT min(id), max(id) FROM kanji_table';
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
    , "getAllKanjiFromLevel":function(level, callback){
      wrapDatabaseQuery(function(){getAllKanjiFromLevel(level, callback);});
    }
    , "getRandomKanjiFromLevel":function(level, callback){
      wrapDatabaseQuery(function(){getRandomKanjiFromLevel(level, callback);});
    }
  };
})();

function renderQueryResultsGenerator(response){
  return function(query_result){
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
  };
};

exports.default = function(request, response){
  var query = request.query;
  var query_renderer = renderQueryResultsGenerator(response);
  if(query.hasOwnProperty("id")){
    engine.getKanjiFromID(query.id, query_renderer);
  } else {
    engine.getRandomKanji(query_renderer);
  }
};

exports.advanced_search = function(request, response){
  var query_renderer = renderQueryResultsGenerator(response);
  if(request.query.kanjiTextField){
    engine.getItemsFromText(request.query.kanjiTextField, query_renderer);
  }
  else if (request.query.hasOwnProperty("random")){
    engine.getRandomKanjiFromLevel(request.query.jlptInputField, query_renderer);
  }
  else{//whether "all" is there or not we render everything as a fallback
    engine.getAllKanjiFromLevel(request.query.jlptInputField, query_renderer);
  }

};