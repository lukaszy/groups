var fs = require('fs');
var http = require('http');
var path = require('path');
var mime = require('mime');
var Cookies = require('cookies');
var uuid = require('uuid');
var WebSocket = require('ws');
var mongodb = require("mongodb");

var dba = require('./db.js');

var debugLog = true;

const listeningPort = 8888;
const dbUrl = "mongodb://localhost:27017";
const dbName = "pai";

var mongo = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var debugLog = true;
var initDB = true; // set to false to suppress DB initialization

var sessions = {};

var server = null;
var db = null;
var newPerson = null;
var groups = null;

//var httpServer = http.createServer();
//var wsServer = new WebSocket.Server({noServer: true});
if(initDB) {
	require('./initialize.js');
}
mongo.connect(dbUrl, { useNewUrlParser: true }, function(err, conn) {
	
	if(err) {
			console.log("Connection to database failed");
			process.exit();
	}

	console.log("Connection to database established");
	
	db = conn.db(dbName);
	//db.dropDatabase(); // uncomment to clear database
	
	
	newPerson = db.collection("persons");
	groups = db.collection("groups");
	newPerson.find().count(function(err, n) {
		if(n == 0) {
			console.log("No persons, initializing by sample data");
			try {
                var examplePersons = JSON.parse(fs.readFileSync("persons.json", 'utf8'));
                newPerson.insertMany(examplePersons);
            } catch(ex) {
				console.log("Error during initialization");
				process.exit();
			}
		}else(console.log(n))
	});
	
	try {
		server.listen(listeningPort);
		//server = http.createServer().on('upgrade', wsServer.handleUpgrade);
	} catch(ex) {
		console.log("Port " + listeningPort + " cannot be used");
		process.exit();
	}
	console.log("HTTP server is listening on the port " + listeningPort);

	
	

	
});


//httpServer.listen(listeningPort);


function serveFile(rep, fileName, errorCode, message) {
	
	if(debugLog) console.log('Serving file ' + fileName + (message ? ' with message \'' + message + '\'': ''));
	
    fs.readFile(fileName, function(err, data) {
		if(err) {
            serveError(rep, 404, 'Document ' + fileName + ' not found');
        } else {
			rep.writeHead(errorCode, message, { 'Content-Type': mime.getType(path.basename(fileName)) });
			if(message) {
				data = data.toString().replace('{errMsg}', rep.statusMessage).replace('{errCode}', rep.statusCode);
			}
			rep.end(data);
        }
      });
}

if(!debugLog) process.on('uncaughtException', function (err) {
	console.log('\nRUNTIME ERROR\n\n' + err + '\n\nexiting...');
	process.exit(1);
});

function serveError(rep, error, message) {
	serveFile(rep, 'html/error.html', error, message);
}

//var db = require('./db.js');


function checkCredentials(cred, callback) {
			var collection = db.collection('persons');
			
			try{
			collection.find({ login: cred.login, password: cred.password }).toArray(function(err, docs) {
				console.log('DOCS'+docs.length);
				callback(err || docs.length < 1 ? null : docs[0]);
				
			});
		}catch (err){
			
			callback(null);

		}
			//console.log(docs[0]);
		}
function checkCredentialsReg(cred, callback) {
			var collection = db.collection('persons');
			collection.find({ login: cred.login }).toArray(function(err, docs) {
				console.log('DOCS'+docs.length);
				callback(err || docs.length < 1 ? null : docs[0]);
				console.log('DOCS'+docs.length);
				
			});
			//console.log(docs[0]);
		}

function logIn(req, rep, session) {
	var item = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk) {
		item += chunk;
	}).on('end', function() {
		var cred = JSON.parse(item);
		if(debugLog) console.log('Trying to log in ' + JSON.stringify(cred));
		checkCredentials(cred, function(user) {
			if(user) {
				if(session) {
					delete user.password;
					sessions[session].user = user;
				}
				rep.writeHead(200, 'Zalogowano', { 'Content-Type': 'application/json' });
				rep.end(JSON.stringify(user));
				if(debugLog) console.log('User ' + JSON.stringify(user) + ' logged in');
				console.log('USER'+JSON.stringify(user));
				//broadcast(session, 'User ' + user.firstName + ' ' + user.lastName + ' logged in');
			} else {
				console.log(JSON.stringify(cred) + ' are not valid credentials');
				rep.writeHead(401, 'Blad logowania!', { 'Content-Type': 'application/json' });
				rep.end(JSON.stringify( { login: cred.login } ));
				
				if(debugLog) console.log(JSON.stringify(cred) + ' are not valid credentials');
			}	
		});
	});
}

function logOut(req, rep, session) {
	if(debugLog) console.log('Destroying session ' + session + ': ' + JSON.stringify(sessions[session]));
	rep.writeHead(200, 'Session destroyed', { 'Content-Type': 'application/json' });
	rep.write(JSON.stringify(sessions[session]));
	if(session) {
	    if(sessions[session].user) {
			var user = sessions[session].user;
			//broadcast(session, 'User ' + user.firstName + ' ' + user.lastName + ' logged out');
	    }
		delete sessions[session].user;
	}
	rep.end();
}

function whoAmI(req, rep, session) {
	rep.writeHead(200, 'Session info', { 'Content-Type': 'application/json' });
	if(session) {
		var sess = sessions[session];
		sess.id = session;
		rep.end(JSON.stringify(sess));
		console.log('SESJA:'+session);
	} else {
		rep.end(JSON.stringify({}));		
	}
}

//listeningPort = 8887;


function serveError(rep, error, message) {
	serveFile(rep, 'html/error.html', error, message);
}

function serveErrorJson(rep, error, message) {
	rep.writeHead(error, { "contentType": "application/json" });
	rep.write(JSON.stringify({ "error": message }));
	rep.end();
	
}

server = http.createServer().on('request', function (req, rep) {

	if(debugLog) console.log('HTTP request URL: ' + req.method + ' ' + req.url);
	
	var cookies = new Cookies(req, rep);
	var session = cookies.get('session');
	var now = Date.now();
	if(!session || !sessions[session]) {
		session = uuid();
		sessions[session] = { created: now, touched: now, user: null };
		cookies.set('session', session, { httpOnly: false });
		console.log('Creating new session ' + session);
	} else {
		sessions[session].touched = now;
		cookies.set('session', session, { httpOnly: false });
	}

	switch(req.url) {
		case '/':
			serveFile(rep, 'html/index.html', 200, '');
			break;
		case '/favicon.ico':
			serveFile(rep, 'img/favicon.ico', 200, '');
			break;
		case '/persons':
			newPerson.find().collation({ locale: "pl" }).sort({ login: +1, password: +1 }).project({firstName: true, lastName: true, login: true, password: true, roles: true}).toArray(function (err, docs) {
                if (err) {
                    serveErrorJson(rep, 404, "Persons not found");
                    return;
                }
                rep.writeHead(200, {"Content-type": "application/json"});
                rep.write(JSON.stringify(docs));
                rep.end();
            })
			break;
		case '/groups/':
			groups.find().collation({ locale: "pl" }).sort({ name: +1 }).project({name: true, workersIds: true}).toArray(function (err, docs) {
                if (err) {
                    serveErrorJson(rep, 404, "Persons not found");
                    return;
                }
                rep.writeHead(200, {"Content-type": "application/json"});
                rep.write(JSON.stringify(docs));
                rep.end();
            })
            break;
		case '/addPerson':
            switch (req.method) {
				case "POST":
					console.log("OK");
                    var content = "";
                    req.setEncoding("utf8");
                    req.on("data", function (data) {
                        content += data;
                    }).on("end", function () {
						
						if(debugLog) console.log('Trying to log in ' + JSON.stringify(cred));
						
						var cred = JSON.parse(content);
							checkCredentialsReg(cred, function(user) {
							
								if(user) 
								{
									serveErrorJson(rep, 406, "Insert failed");
									console.log("ERROR REG"+JSON.stringify(user));
									content = "";
									//return;
								}else{
									try {
							
										obj = JSON.parse(content);
										console.log("OBJ REG"+JSON.stringify(obj));
										newPerson.insertOne(obj, function (err, insResult) {
											if (err) {
												serveErrorJson(rep, 406, "Insert failed");
												return;
											}
											console.log(insResult.ops[0]);
											rep.writeHead(200, {"Content-type": "application/json"});
											rep.end(JSON.stringify(insResult.ops[0]));
											
										});
									} catch (ex) {
										serveErrorJson(rep, 406, "Invalid JSON");
										return;
									}
								}
							}
							)
					
                    });
                    break;
                default:
                    serveErrorJson(rep, 405, "Method " + req.method + " not allowed");
                    
            }
            break;
		case '/auth':
			switch(req.method) {
				case 'GET':
					whoAmI(req, rep, session);
					break;
				case 'POST':
					logIn(req, rep, session);
					break;
				case 'DELETE':
					logOut(req, rep, session);
					break;
				default:
					serveError(rep, 405, 'Method not allowed');
			}
			break;
		default:
			if(/^\/(html|css|js|fonts|img)\//.test(req.url)) {
				var fileName = path.normalize('./' + req.url);
				if(fileName.endsWith('.map')) {
					serveError(rep, 403, 'No map files used');
				} else {
					serveFile(rep, fileName, 200, '');
				}
			} else if(/^\/db\//.test(req.url)) {
					var args = req.url.split("/").slice(2).filter(function (element) { return element.length > 0 });
					if(args.length < 1)
						serveError(rep, 403, 'Access denied');
					else {
						console.log('ARGS: '+args+'   REP: '+rep);
						switch(req.method) {
							 case 'GET':	dba.select(req, rep, args); break;
							 case 'POST':	dba.insert(req, rep, args); break;
							 case 'PUT':	dba.update(req, rep, args); break;
							 case 'DELETE':	dba.remove(req, rep, args); break;
							default:		dba.error(rep, 405, 'Method not allowed');
						}
					}
			} else {	
				serveError(rep, 403, 'Access denied');
			}
		}
	}
);


if(debugLog) console.log('Listening on port ' + listeningPort);

