var fs = require('fs'),
    layout = require('./layout'),
    requestUtils = require('./requestUtils'),
    handler = require('./handler'),
    log = require('./log');

var cards = handler.cards;
var cardsHash = handler.cardsHash;

var redirectToHome = function(res) {
  res.writeHead(302, {'Location': '/'});
  res.end("");
}

var redirectTo = function(res, path) {
  res.writeHead(302, {'Location': path});
  res.end("");
}

var saveCard = function(card, cb) {
	var path = "./final/kld/" + card.filename;
	var text = JSON.stringify(card);
	fs.writeFile(path, text, 'utf8', function(err) {
		cb();
	});
}

var assignNumber = function(req,res) {
	var obj;
	var count = 0;
	for (var index in cards) {
		var card = cards[index];
		if (card.number == null || card.number === undefined) {
			obj = card;
			break;
		}
	}
	layout.create('layouts/assignnumber.html', 'layouts/layout.html', obj).renderResponse(res);
}
exports.assignNumber = assignNumber;

var assignNumberPost = function(req, res) {
	var c;
  var queryObj = requestUtils.getQueryObj(req);
  if (queryObj && queryObj['c']) {
    var c = queryObj['c'];
  }
  var card = cardsHash[c];

  requestUtils.getPostObj(req, function(obj) {
  	var number = obj.number;
  	card.number = number;
  	saveCard(card, function() {
  		redirectTo(res, "assignnumber");
  	});
  });
}
exports.assignNumberPost = assignNumberPost;

var assignSet = function(req,res) {
	var obj;
	var count = 0;
	for (var index in cards) {
		var card = cards[index];
		if (card.set == null || card.set === undefined) {
			obj = card;
			break;
		}
	}
	layout.create('layouts/assignset.html', 'layouts/layout.html', obj).renderResponse(res);
}
exports.assignSet = assignSet;

var assignSetPost = function(req, res) {
	var c;
  var queryObj = requestUtils.getQueryObj(req);
  if (queryObj && queryObj['c']) {
    var c = queryObj['c'];
  }
  var card = cardsHash[c];

  requestUtils.getPostObj(req, function(obj) {
  	var set = obj.set;
  	card.set = set;
  	saveCard(card, function() {
  		redirectTo(res, "assignset");
  	});
  });
}
exports.assignSetPost = assignSetPost;

var assignCmc = function(req,res) {
	var obj;
	var count = 0;
	for (var index in cards) {
		var card = cards[index];
		if (card.cmc == null || card.cmc === undefined) {
			obj = card;
			break;
		}
	}
	layout.create('layouts/assigncmc.html', 'layouts/layout.html', obj).renderResponse(res);
}
exports.assignCmc = assignCmc;

var assignCmcPost = function(req, res) {
	var c;
  var queryObj = requestUtils.getQueryObj(req);
  if (queryObj && queryObj['c']) {
    var c = queryObj['c'];
  }
  var card = cardsHash[c];

  requestUtils.getPostObj(req, function(obj) {
  	var cmc = obj.cmc;
  	card.cmc = cmc;
  	saveCard(card, function() {
  		redirectTo(res, "assigncmc");
  	});
  });
}
exports.assignCmcPost = assignCmcPost;

var assignRarity = function(req,res) {
	var obj;
	var count = 0;
	for (var index in cards) {
		var card = cards[index];
		if (card.rarity == null || card.rarity === undefined) {
			obj = card;
			break;
		}
	}
	layout.create('layouts/assignrarity.html', 'layouts/layout.html', obj).renderResponse(res);
}
exports.assignRarity = assignRarity;

var assignRarityPost = function(req, res) {
	var c;
  var queryObj = requestUtils.getQueryObj(req);
  if (queryObj && queryObj['c']) {
    var c = queryObj['c'];
  }
  var card = cardsHash[c];

  requestUtils.getPostObj(req, function(obj) {
  	var rarity = obj.rarity;
  	card.rarity = rarity;
  	saveCard(card, function() {
  		redirectTo(res, "assignrarity");
  	});
  });
}
exports.assignRarityPost = assignRarityPost;
