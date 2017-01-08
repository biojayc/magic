var fs = require('fs'),
    layout = require('./layout'),
    requestUtils = require('./requestUtils'),
    log = require('./log');

var cards = [];
var cardsHash = {};
var files = fs.readdirSync('final');
for (var i = 0; i < files.length; i++) {
  var filename = files[i];
  var datafile = 'final/' + filename;
  // console.log("processing " + datafile);
  try {
	  var text = fs.readFileSync(datafile, 'utf8');
	  var card = JSON.parse(text);
	  card.filename = filename;
	  // drop planeswalker deck cards
	  if (card.number == null || card.number < 185) {
		  cards.push(card);
		  cardsHash[card.id] = card;
		}
	} catch (e) {
		log.error("couldn't process: " + datafile);
	}
}

var redirectToHome = function(res) {
  res.writeHead(302, {'Location': '/'});
  res.end("");
}

var redirectTo = function(res, path) {
  res.writeHead(302, {'Location': path});
  res.end("");
}

var numberSort = function(a, b) {
	var av = 0, bv = 0;
	if (a.set == 'MPS') av+= 1000;
	if (b.set == 'MPS') bv+= 1000;
	av += a.number;
	bv += b.number;
  return av - bv;
};

var cmcSort = function(a, b) {
	return a.cmc - b.cmc;
};

var raritySort = function(a, b) {
	var av = 0, bv = 0;
	if (a.rarity == "Special") av = 5;
	if (b.rarity == "Special") bv = 5;
	if (a.rarity == "Mythic") av = 4;
	if (b.rarity == "Mythic") bv = 4;
	if (a.rarity == "Rare") av = 3;
	if (b.rarity == "Rare") bv = 3;
	if (a.rarity == "Uncommon") av = 2;
	if (b.rarity == "Uncommon") bv = 2;
	if (a.rarity == "Common") av = 1;
	if (b.rarity == "Common") bv = 1;
	return av - bv;
};

var main = function(req, res) {
	var queryObj = requestUtils.getQueryObj(req);
  var sortedcards = cards;
  sortedcards.sort(numberSort);
  if (queryObj && queryObj['sort']) {
  	if (queryObj['sort'] == 'cmc') {
      sortedcards.sort(cmcSort);
    } else if (queryObj['sort'] == "rarity") {
    	sortedcards.sort(raritySort);
    }
  }
	var filteredcards = [];
  for (var index in sortedcards) {
	  var card = sortedcards[index];
	  if (queryObj['showmps'] != "on" && card.set == "MPS") continue;
	  if (queryObj['color'] && queryObj['color'] != "all" && queryObj['color'].indexOf(card.color) < 0) continue;
	  if (queryObj['rarity'] && queryObj['rarity'] != "all" && queryObj['rarity'].indexOf(card.rarity) < 0) continue;
	  if (queryObj['cmc'] && queryObj['cmc'] != "all" && card.cmc != queryObj['cmc']) continue;
	  if (queryObj['cardtype'] && queryObj['cardtype'] != "all" && card.type.indexOf(queryObj['cardtype']) < 0) continue;
	  if (queryObj['filtercard'] && queryObj['filtercard'].indexOf(card.cardName) >= 0) continue;
	  if (queryObj['filtertext']) {
	  	var filterarray = queryObj['filtertext'].toLowerCase().split(' ');
	  	var cardtext = card.cardName + card.color + card.type + card.text;
	  	cardtext = cardtext.toLowerCase();
	  	var tofilter = false;
	  	for (var index in filterarray) {
	  		var filter = filterarray[index];
	  		if (cardtext.indexOf(filter) < 0) {
	  			tofilter = true;
	  			break;
	  		}
	  	}
	  	if (tofilter) continue;
	  }
	  filteredcards.push(card);
	}

	
	var obj = {
		cards: filteredcards,
		count: filteredcards.length,
		filtered: queryObj['filtercard'],
	};
	layout.create('layouts/home.html', 'layouts/layout.html', obj).renderResponse(res);
}
exports.main = main;

var card = function(req, res) {
	var c;
  var queryObj = requestUtils.getQueryObj(req);
  if (queryObj && queryObj['c']) {
    var c = queryObj['c'];
  }
  var card = cardsHash[c];

  layout.create('layouts/card.html', 'layouts/layout.html', card).renderResponse(res);
}
exports.card = card;