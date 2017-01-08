var fs = require('fs'),
    parse_card = require('./parse_card');

var run = function() {
  var files = fs.readdirSync('data');
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    if (filename.indexOf("html") > -1) {
      var cachefile = 'data/' + filename;
      var datafile = 'final/' + filename.replace("html", "txt");
      console.log("processing " + datafile);
      var html = fs.readFileSync(cachefile, 'utf8');
      // console.log(html);
      var card = parse_card.parse(html);
      card.img = filename.replace('.html', '.jpg');
      card.id = i;
      var result = JSON.stringify(card);
      // console.log(result);
      fs.writeFileSync(datafile, result);
    }
  }
}
run();