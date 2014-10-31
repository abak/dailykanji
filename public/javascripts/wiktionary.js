var wiki = (function(){
  var kanji = "";
  var base_url = "https://en.wiktionary.org/w/api.php?";
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
    var elements = $(data);
    elements.find('.mw-editsection').remove();
    elements.find('a').each(function(index){
      if(this.className !== 'extiw'){
        $(this).attr('href', 'http://en.wiktionary.org' + $(this).attr('href'));
      }
    });
    elements.each(function(index){
      if(this.id === "toc"){
        $(this).empty();
      }
      if( this.nodeName === "H2"){
        $(this).empty();
      }
    });
    return elements;
  }

  function retrieveRelevantSection(section){
    var queryParams = {
      "prop"    : "text",
      "section" : section.index
    };

    var query = buildQuery(queryParams);
    var result = $.getJSON(query, function(data){
      var content = filter(data.parse.text["*"])
      $("#wiki").append(content);
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