var express = require('express');
var app = express();
var clone = require('clone');

// HOGAN {
var fs = require("fs"),
	fastDevelop = true,
	templateCache = [],
	mustache = require("mustache");

// Partials
fs.readFile(__dirname + "/design/shareme.html", function (err, data) {
	mustache.compilePartial("shareme", data.toString());
});
fs.readFile(__dirname + "/design/coursedetail.html", function (err, data) {
	mustache.compilePartial("coursedetail", data.toString());
});

app.engine("html", function(path, options, fn){
	options['asset_path'] = "/assets/";

	if(options['template'] == undefined){ options['template'] = true; }
	function render(template, callback){
		data = {"content":template(options), "asset_path":"/assets/", "page_title" : options['page_title']};
		if(options['template'] == false){
			callback(data['content']);
		} else{
			getTemplate(options.settings.views + "base.html", function(err, master){
				callback(master(data));
			});
		}
	}

	function getTemplate(template, callback){
		if(fastDevelop || templateCache[template] == undefined){
			fs.readFile(template, function(err, data){
				if(err){ callback(err); }
				else{
					templateCache[template] = mustache.compile(data+"");
					callback(null, templateCache[template]);
				}
			});
		} else{
			callback(null, templateCache[path]);
		}
	}
	
	getTemplate(path, function(err, data){
		if(err){fn(err);}
		else{
			render(data, function(html){
				fn(null, html);
			});
		}
	});
});
// END OF HOGAN }
// DB{
var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'comparethatuni');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log("DB OK"); });
// }

function sendError(res){
	res.render("error.html", {"page_title" : "Error"}, function(err, data) {
		res.send(500, data).end();
	});
}

app.configure(function(){
	app.set("views", __dirname + "/design/");
	app.set("view engine", "html");

	app.use(express.methodOverride());
	app.use(app.router);
	app.use(function(err, req, res, next){
		console.error(err.stack);
		sendError(res);
	});
	console.log("Configured");
});

app.get("/", function (req, res) {
	groups = [];
	for(key in courseGroups){
		groups.push(courseGroups[key]);
	}
	res.render("index.html", {"courses" : groups, "page_title" : "Index"}, function(err, data){
		res.end(data);
	});
});

app.get("/course/:course", function(req, res){
	res.render("course.html", {}, function(err, data){
		res.end(data);
	});
});

app.get("/compare/course/:course", function(req, res) {
	group = clone(courseGroups[ req.params.course.charAt(0) ]);
	var ourCourse = undefined;
	group.items.forEach(function(course){
		if(course.code == req.params.course){
			course.active = true;
			ourCourse = course;
		}
	});

	alevels = [];
	for (var i = 0; i <= 3; i++) {
		alevels.push({ "number" : i });
	};

	res.render("comparecourse.html", {
		"page_title" : "Compare " + ourCourse.name + " Courses",
		"group" : group,
		"course" : ourCourse,
		"comparing" : true,
		"alevel" : alevels
	}, function(err, data) {
		res.end(data);
	});
});

app.get( /^\/assets\/(.*)/ , function (req, res) {
	res.sendfile(__dirname + "/design/" + req.params[0]);
})

app.get("*", function(req, res){
	sendError(res);
});

app.listen(3000);

var courseGroups = {};
fs.readFile(__dirname  + "/jacs.txt", function (e, data) {
	data = JSON.parse(data);
	data.forEach(function(course){
		if(courseGroups[course.letter] == undefined){ 
			courseGroups[course.letter] = {
				"items" : [],
				"name" : course.group,
				"letter" : course.letter
			};
		}
		courseGroups[course.letter].items.push({
			"name" : course.name,
			"code" : course.code
		});
	});
});

console.log("Compare That Uni");
console.log("Live: http://localhost:3000");