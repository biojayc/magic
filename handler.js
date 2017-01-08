var fs = require('fs'),
    layout = require('./layout'),
    requestUtils = require('./requestUtils'),
    log = require('./log');

var cards = [];
var cardsHash = {};
exports.cards = cards;
exports.cardsHash = cardsHash;
(function (set, max) {
  var files = fs.readdirSync('final/' + set);
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    var datafile = 'final/' + set + '/' + filename;
    // console.log("processing " + datafile);
    try {
  	  var text = fs.readFileSync(datafile, 'utf8');
  	  var card = JSON.parse(text);
  	  card.filename = filename;
  	  // drop planeswalker deck cards
  	  if (card.number == null || card.number < max) {
  		  cards.push(card);
  		  cardsHash[card.set + card.number] = card;
  		}
  	} catch (e) {
  		log.error("couldn't process: " + datafile);
  	}
  }
})('kld', 265); //185
(function (set, max) {
  var files = fs.readdirSync('final/' + set);
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    var datafile = 'final/' + set + '/' + filename;
    // console.log("processing " + datafile);
    try {
      var text = fs.readFileSync(datafile, 'utf8');
      var card = JSON.parse(text);
      card.filename = filename;
      // drop planeswalker deck cards
      if (card.number == null || card.number < max) {
        cards.push(card);
        cardsHash[card.set + card.number] = card;
      }
    } catch (e) {
      log.error("couldn't process: " + datafile);
    }
  }
})('aer', 185);

var numberSort = function(a, b) {
	var av = 0, bv = 0;
	if (a.set == 'MPS') av+= 3000;
	if (b.set == 'MPS') bv+= 3000;
  if (a.set == 'AER') av+= 2000;
  if (b.set == 'AER') bv+= 2000;
  if (a.set == 'KLD') av+= 1000;
  if (b.set == 'KLD') bv+= 1000;
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
    if (queryObj['sets'] && (queryObj['sets'].indexOf(card.set) < 0 && card.set != "MPS")) continue;
    if (!queryObj['sets'] && card.set == 'KLD') continue;
	  if (queryObj['showmps'] != "on" && card.set == "MPS") continue;
	  if (queryObj['color'] && queryObj['color'] != "all" && queryObj['color'].indexOf(card.color) < 0) continue;
	  if (queryObj['rarity'] && queryObj['rarity'] != "all" && queryObj['rarity'].indexOf(card.rarity) < 0) continue;
	  if (queryObj['cmc'] && queryObj['cmc'] != "all" && queryObj['cmc'] != "7+" && card.cmc != queryObj['cmc']) continue;
    if (queryObj['cmc'] && queryObj['cmc'] == "7+" && card.cmc < 7) continue;
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