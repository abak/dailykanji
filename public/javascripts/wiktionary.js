var wiki = (function(){
  var kanji = "";
  var base_url = "http://en.wiktionary.org/w/api.php?";
  var user_agent = "Daily Kanji wiktionary integration (adrien.bak@gmail.com)";
  var commonQueryParams = {
    "format"    : "json",
    "action"    : "parse",
    "callback"  : "?"
  };

  function buildQuery(queryParams){
    var query = base_url;
    $.extend(queryParams, commonQueryParams);

    for(var key in queryParams){
      if (queryParams.hasOwnProperty(key)){
        query+=key +"="+queryParams[key]+"&";
      }
    }
    query+="page="+kanji;
    return query;
  }

  function filter(data){
    console.log(data);
    var element = $(data);
    //removes the edit
    element.find('.mw-editsection').remove();
    // element.find('.toc').remove();
    return element;
  }

  function retrieveRelevantSection(section){
    var queryParams = {
      "prop"    : "text",
      "section" : section.index
    };

    var query = buildQuery(queryParams);
    var result = $.getJSON(query, function(data){
      var content = filter(data.parse.text["*"])
      $("#main").append(content);
      });
  }

  function queryRelevantSection(){
    queryParams = {
      "prop" : "sections"
    };

    var query = buildQuery(queryParams);
    var result = $.getJSON(query, function(data){
      var sections = data.parse.sections.filter(
        function(i){
          return i.anchor === "Japanese";
      });
      if(sections.length === 1){
        retrieveRelevantSection(sections[0]);
      }
    });
  }

  function getKanji(item){
    kanji = item;
    queryRelevantSection(kanji);
  }

  return {
    "getKanji":getKanji
  };
})();