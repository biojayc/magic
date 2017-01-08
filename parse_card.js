

var helper = function(h,section) {
  try {
    var loc = h.indexOf(section);
    var tempHTML = h.substr(loc + section.length, h.length);
    var value = tempHTML.substr(0, tempHTML.indexOf('<')).trim();
  } catch(e) {
    console.log("didn't work: " + section)
  }
  return value;
}

var stripHTML = function(str) {
  str=str.replace(/<br[^>]+>/gi, "\n");
  str = str.replace(/(<([^>]+)>)/ig,"");
  //str=str.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 (Link->$1) ");
  //str=str.replace(/<(?:.|\s)*?>/g, "");
  return str;
}

var textHelper = function(h,pre,section, post) {
  try {
    var preloc = h.indexOf(pre);
    var tempHTML = h.substr(preloc + pre.length, h.length);
    var start = tempHTML.indexOf(section) + section.length;
    var length = tempHTML.indexOf(post) - start;
    tempHTML = tempHTML.substr(start, length);
    tempHTML = stripHTML(tempHTML);
    tempHTML = tempHTML.trim().replace(/\n\n/gi, "<br />");
    tempHTML = tempHTML.replace(/\n/gi, "<br />");
  } catch(e) {
    console.log("didn't work: " + section)
  }
  return tempHTML;
}

var colorHelper = function(manaCost) {
  var color = "Colorless";
  var count = 0;
  if (manaCost.indexOf("W") > -1) {
    color = "White";
    count++;
  }
  if (manaCost.indexOf("U") > -1) {
    color = "Blue";
    count++;
  }
  if (manaCost.indexOf("B") > -1) {
    color = "Black";
    count++;
  }
  if (manaCost.indexOf("R") > -1) {
    color = "Red";
    count++;
  }
  if (manaCost.indexOf("G") > -1) {
    color = "Green";
    count++;
  }
  if (count > 1) {
    color = "Gold";
  }
  return color;
}

var parse = function(h) {
  try {
    var card = {};
    card.cardName = helper(h, '<!--CARD NAME-->');
    card.manaCost = helper(h, '<!--MANA COST-->');
    card.type = helper(h, '<!--TYPE-->');
    card.text = textHelper(h, '<!--TYPE-->', '<!--CARD TEXT-->', '<!--FLAVOR TEXT-->');
    console.log(card.text);
    card.flavor = helper(h, '<!--FLAVOR TEXT-->');
    card.illus = helper(h, '<!--ILLUS-->');
    card.pt = helper(h, '<!--P/T-->');
    card.color = colorHelper(card.manaCost);

  } catch(e) {
    console.log("Wasn't able to parse file.");
  }
  
  return card;
}

exports.parse = parse;