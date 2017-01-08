var restify = require('./restify'),
    handler = require('./handler'),
    log = require('./log');

//log.init();

restify.startWebServer(1337);
restify.registerRoute("/", "GET", handler.main);
restify.registerRoute("/card", "GET", handler.card);
/*restify.registerRoute("/assignnumber", "GET", handler.assignNumber);
restify.registerRoute("/assignnumber", "POST", handler.assignNumberPost);
restify.registerRoute("/assignset", "GET", handler.assignSet);
restify.registerRoute("/assignset", "POST", handler.assignSetPost);
restify.registerRoute("/assigncmc", "GET", handler.assignCmc);
restify.registerRoute("/assigncmc", "POST", handler.assignCmcPost);
restify.registerRoute("/assignrarity", "GET", handler.assignRarity);
restify.registerRoute("/assignrarity", "POST", handler.assignRarityPost);*/

restify.registerStatic("/static.*");
restify.registerStatic("/css.*", "/static/css");
restify.registerStatic("/scripts.*", "/static/scripts");
restify.registerStatic("/images.*", "/static/images");
restify.registerStatic("/favicon.ico", "/static/images/favicon.ico");