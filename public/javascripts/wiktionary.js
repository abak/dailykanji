var wiki = (function(){
  var base_url = "http://en.wiktionary.org/w/api.php?";
  var user_agent = "Daily Kanji wiktionary integration (adrien.bak@gmail.com)";
  var queryParams = {
    "format"    : "json",
    "action"    : "parse",
    "prop"      : "text",
    "callback"  : "?"
  };

  function buildQuery(kanji){
    var query = base_url;
    for(var key in queryParams){
      if (queryParams.hasOwnProperty(key)){
        query+=key +"="+queryParams[key]+"&";
      }
    }
    query+="page="+kanji;
    return query;
  }

  function getKanji(kanji){
    var query = buildQuery(kanji);

    var result = $.getJSON(query, function(data){
      $("#main").append(data.parse.text["*"]);
    });
  }

  return {
    "getKanji":getKanji
  };
})();