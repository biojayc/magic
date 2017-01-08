var restify = require('./restify'),
    handler = require('./handler'),
    oldhandler = require('./oldhandlers'),
    log = require('./log');

//log.init();

restify.startWebServer(1338);
restify.registerRoute("/", "GET", handler.main);
restify.registerRoute("/card", "GET", handler.card);
/*restify.registerRoute("/assignnumber", "GET", oldhandler.assignNumber);
restify.registerRoute("/assignnumber", "POST", oldhandler.assignNumberPost);
restify.registerRoute("/assignset", "GET", oldhandler.assignSet);
restify.registerRoute("/assignset", "POST", oldhandler.assignSetPost);
restify.registerRoute("/assigncmc", "GET", oldhandler.assignCmc);
restify.registerRoute("/assigncmc", "POST", oldhandler.assignCmcPost);
restify.registerRoute("/assignrarity", "GET", oldhandler.assignRarity);
restify.registerRoute("/assignrarity", "POST", oldhandler.assignRarityPost);*/

restify.registerStatic("/static.*");
restify.registerStatic("/css.*", "/static/css");
restify.registerStatic("/scripts.*", "/static/scripts");
restify.registerStatic("/images.*", "/static/images");
restify.registerStatic("/favicon.ico", "/static/images/favicon.ico");