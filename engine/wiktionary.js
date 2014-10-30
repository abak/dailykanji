var superagent = require('superagent');

var query_wiki = "http://en.wiktionary.org/w/api.php?action=parse&page=%E5%AE%9F&format=jsonfm&prop=text"

var wiki = (function(){
  var base_url = "http://en.wiktionary.org/w/api.php";
  var user_agent = "Daily Kanji wiktionary integration (adrien.bak@gmail.com)";
  var queryParams = {
    "format"    : "json",
    "action"    : "parse",
    "prop"      : "text",
    "page"      : ""
  };

  function parseJson(jsonData){
    console.log(jsonData);
    // var keys = Object.keys(data.query.pages);
    // if (keys.length === 0){
    //   //no page found
    //   return;
    // }

  }

  function getArticle(kanji){
    queryParams.page = kanji;
    superagent.get(base_url)
      .query(queryParams)
      .set("User-Agent", user_agent)
      .end(function(res){
        var data = JSON.parse(res.text);
        parseJson(data);
      })
  };

  return {
    "getArticle":getArticle
  };
})();

exports.getArticle = wiki.getArticle;