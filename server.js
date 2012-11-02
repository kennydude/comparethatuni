var express = require('express');
var app = express();
var clone = require('clone');

var appURL = "http://comparethatuni.com/"; // false

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
		if(options['pjax'] != undefined){
			options['template'] = false;
		}
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
var mongo = require('mongoskin');
var db = mongo.db("localhost:27017?auto_reconnect=true",{
	safe : true,
	database : "comparethatuni"
});
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
	app.use(function(err, req, res, next){
		try{
			next();
		} catch(err){
			console.error(err.stack);
			sendError(res);
		}
	});
	app.use(app.router);
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

function regexEscape(text) {
  if (!arguments.callee.sRE) {
    var specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}

var aLevelsLetters = {
	"6" : "A*",
	"5" : "A",
	"4" : "B",
	"3" : "C",
	"2" : "D",
	"1" : "E"
};
var aLevelsNumbers = {};
for(key in aLevelsLetters){
	aLevelsNumbers[ aLevelsLetters[key] ] = key;
}
var aLevelsClasses = {
	"6" : "alert",
	"5" : "alert",
	"4" : "",
	"3" : "",
	"2" : "secondary",
	"1" : "secondary"
};
var aLevelTarrif = {
	"A*" : 140,
	"A" : 120,
	"B" : 100,
	"C" : 80,
	"D" : 60,
	"E" : 40
};

function sortCourse(data){
	data['type']['top'] = data['type']['name'].split(" ")[0];
	data['type']['bottom'] = data['type']['name'].split(" ");
	data['type']['bottom'] = data['type']['bottom'][ data['type']['bottom'].length-1 ];
	data['type']['name'] = data['type']['name'].replace("Bachelor", '<abbr title="Roughly means \'advanced student\'">Bachelor</abbr>');
	

	data['type']['options'][data['type']['options'].length-1]['last'] = true;
	var x = 0;
	if(data['entry']['alevels'] != undefined){
		data['entry']['alevels'].forEach(function(item) {
			data['entry']['alevels_accepted'] = true;

			levels = [];
			item = item + '';
			for (var i = item.length - 1; i >= 0; i--) {
				levels.push({
					"name" : aLevelsLetters[item.charAt(i)],
					"class" : aLevelsClasses[item.charAt(i)],
				});
			}

			item = {
				"levels" : levels
			};
			
			data['entry']['alevels'][x] = item;
			x+=1;
		});
		if(data['entry']['alevels'][0] != undefined)
			data['entry']['alevels'][ data['entry']['alevels'].length - 1 ]['last'] = true;
	}
	data['url'] = appURL + "course/" + data['code'] + "@" + data['institution'];

	console.log(data);
	return data;
}

app.get("/course/:course", function(req, res){
	cparts = req.params.course.split("@");
	db.collection("courses").findOne({ "code" : cparts[0], "institution" : cparts[1] }, function(err, data){
		if(data == undefined){
			sendError(res); return;
		}
		db.collection("university").findOne({"code" : data.institution}, function(err, uni){
			data['university'] = uni;
			res.render("course.html", sortCourse(data), function(err, data){
				res.end(data);
			});
		});
	});
});

app.get("/compare/course/:course", function(req, res) {
	group = clone(courseGroups[ req.params.course.charAt(0) ]);
	var ourCourse = undefined;
	var got = false;
	group.items.forEach(function(course){
		if(course.code == req.params.course){
			course.active = true;
			ourCourse = course;
		} else if(ourCourse != undefined && got == false){
			ourCourse['maxCode'] = course.code;
			got = true;
		}
	});

	alevels = [];
	for (var i = 0; i <= 3; i++) {
		alevels.push({ "number" : i });
	};

	ids = [ req.params.course ];
	counter = req.params.course.substr(1) * 1;
	if(ourCourse['maxCode'] != undefined){
		max = ourCourse.maxCode.substr(1) * 1;
	} else{
		max = counter + 100;
	}
	for (var i = counter; i < max; i++) {
		ids.push(req.params.course.charAt(0) + i);
	};

	filters = { "code" : { "$in" : ids } };
	if(req.query['courseType'] == undefined){
		req.query['courseType'] = "any";
	}
	if( req.query['courseType'] != "any"){
		filters['type.name'] = { "$regex" : "^" + regexEscape(req.query['courseType']), "$options" : "i" };
	}
	if(req.query['alevels'] != undefined){
		tarrif = 0;
		score = [];

		for (var i = req.query['alevels'].length - 1; i >= 0; i--) {
			c = req.query['alevels'][i].toUpperCase();
			if(c == "*"){ // Will be A*
				i--; c = "A*";
			}
			score.push( aLevelsNumbers[ c ] );
			if(aLevelTarrif[c] != undefined)
				tarrif += aLevelTarrif[ c ];
		};
		if(req.query['extra_points'] != undefined){
			tarrif += req.query['extra_points'] * 1;
		}
		console.log(tarrif);

		score.sort();
		score = score.join("")*1;

		filters['$or'] = [
			{"entry.tarrif" : { "$lte" : tarrif }},
			{"entry.alevels" : { "$lte" : score }}
		];
	}

	db.collection("courses").find(filters, { "limit": 20, "skip" : 10 * ( req.query['page']-1 ) }).toArray(function(err, fdata){
			data = [];
			fdata.forEach(function(item) { data.push( sortCourse(item) ); });

			query = {};
			for(key in req.query){
				query[key] = {};
				query[key][req.query[key]] = true;
				query[key + "_value"] = req.query[key];
			}

			console.log(query);

			res.render("comparecourse.html", {
				"page_title" : "Compare " + ourCourse.name + " Courses",
				"group" : group,
				"course" : ourCourse,
				"comparing" : true,
				"courses" : data,
				"alevel" : alevels,
				"pjax" : req.get("X-PJAX"),
				"query" : query
			}, function(err, data) {
				res.end(data);
			});

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