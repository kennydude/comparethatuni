var express = require('express');
var app = express();
var clone = require('clone');

var appURL = "http://comparethatuni.com"; // false

String.prototype.replaceAll = function(pcFrom, pcTo){
	var i = this.indexOf(pcFrom);
	var c = this;
 
	while (i > -1){
		c = c.replace(pcFrom, pcTo); 
		i = c.indexOf(pcFrom);
	}
	return c;
}

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
fs.readFile(__dirname + "/design/accomdetail.html", function (err, data) {
	mustache.compilePartial("accomdetail", data.toString());
});
fs.readFile(__dirname + "/design/compareheader.html", function (err, data) {
	mustache.compilePartial("compareheader", data.toString());
});
fs.readFile(__dirname + "/design/uni_detail.html", function (err, data) {
	mustache.compilePartial("uni_detail", data.toString());
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
	app.use(express.bodyParser());
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

var bathroomData = {
	"E" : "En-Suite",
	"N" : "shared bathroom",
	"W" : "washbasin and shared bathroom"
};

function sortAccom(data){
	data['share_url'] = appURL + "/accom/" + data['name'].replaceAll(" ", "+") + "@" + data['institution'];

	data['Titems'] = data['items'];
	data['items'] = [];
	data['Titems'].forEach(function(item){
		contract = item['contract'];
		item['contract'] = [];
		contract.forEach(function(c){
			item['contract'].push({
				"length" : c,
				"total" : Math.ceil(item['cost_per_week'] * c)
			});
		});
		item['bathroom'] = bathroomData[item['bathroom']];
		item['contract'][item['contract'].length-1]['last'] = true;
		data['items'].push(item);
	});

	for(key in data['nearby']){
		n = data['nearby'][key];
		n[n.length-1]['last'] = true;
		n[n.length-2]['second_last'] = true;
	}

	return data;
}

function sortUni(data){
	data['share_url'] = appURL + "/uni/" + data['code'];
	return data;
}

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
	data['share_url'] = appURL + "course/" + data['code'] + "@" + data['institution'];
	
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

app.get("/uni/:uni", function(req, res){
	db.collection("university").findOne({"code": req.params.uni}, function(err, data){
		res.render("uni.html", sortUni(data), function(err, data){
			res.end(data);
		});
	});
});

app.get("/accom/:accom", function(req, res){
	cparts = req.params.accom.split("@");
	db.collection("accom").findOne({"name" : cparts[0].replaceAll("+", " "), "institution" : cparts[1]}, function(err, data){
		if(data == undefined){ sendError(res); return; }
		db.collection("accom_items").find({"name" : cparts[0].replaceAll("+", " "), "institution" : cparts[1]}).toArray(function(err, items){
			data['items'] = items;
			res.render("indiv-accom.html", sortAccom(data), function(err, data){
				res.end(data);
			});
		});
	});
});

// Used in /compare/accom and /compare/universities
function parseCompareArgs(req, res){
	if(req.query.courses){
		courses = req.query.courses.split(",");
		unis = [];
		c = [];
		cbu = {};
		courses.forEach(function (item) {
			t = item.split("@");
			if(unis.indexOf(t[1]) == -1){
				unis.push(t[1]);
			} if(c.indexOf(t[0]) == -1){
				c.push(t[0]);
			}
			if(cbu[t[1]] == undefined){ cbu[t[1]] = []; }
			cbu[t[1]].push(item);
		});
		req.extra_data = { "courses" : c, "unis" : unis, "cbu" : cbu };
		req.query['select'] = req.query.courses;
		req.query['used'] = "courses";
		return unis;
	} else if(req.query.universities){
		req.query['select'] = req.query.universities;
		req.query['used'] = "universities";
		return req.query.universities.split(",");
	} else{
		sendError(res);
		return;
	}
}

function finishCompare(file, data, req, res){
	if(req['extra_data'] != undefined){
		data['courses_exist'] = true;
		db.collection("courses").find({
			"institution" : { "$in" : req.extra_data.unis },
			"code" : { "$in" : req.extra_data.courses }
		}).toArray(function (errr, cdata) {
			db.collection("university").find({ "code" : { "$in" : req.extra_data.unis } }, { "name":1, "code":1 }).toArray(function(err, uniData){
				uniD = {};
				uniData.forEach(function(item){ uniD[ item.code ] = item.name });
				
				rcdata = [];
				cdata.forEach(function(item) {
					item['university'] = { "name" : uniD[item['institution']] };
					rcdata.push( sortCourse(item) );
				});

				data['courses'] = rcdata;
				res.render(file, data, function(err, data){
					res.end(data);
				});

			});
			
		});
		return;
	}
	res.render(file, data, function(err, data){
		res.end(data);
	});
}

var bathroomLookup = {
	"en-suite" : "E",
	"washbasin" : { "$in" : [ "E", "W" ] }
};
var accFlags = [
	"tv",
	"catered",
	"bar",
	"internet",
	"bike_store",
	"laundry"
];

// This will look like /compare/accom?universities=N21,N33 or /compare/accom?courses=G601@N21,G600@N21
app.get("/compare/accom", function(req, res){
	unis = parseCompareArgs(req, res);
	filters = {"institution" : { "$in" : unis } };

	// Filters!
	if(req.query['for'] == "2-people"){
		filters['for'] = '2';
	}
	if(req.query['bathroom'] != "dont-care" && req.query['bathroom'] != undefined){
		filters['bathroom'] = bathroomLookup[req.query['bathroom']];
	}
	accFlags.forEach(function(item){
		if(req.query[item] != undefined){
			filters["flags." + item] = true;
		}
	});

	db.collection("accom_items").find(filters).toArray(function(err, data){
		if(data == undefined){ sendError(res); return; }

		acc = {};
		names = [];
		data.forEach(function(item){
			names.push(item['name']);
			if(acc[ item['name'] + "@" + item['institution'] ] == undefined){
				acc[ item['name'] + "@" + item['institution'] ] = [];
			}
			acc[ item['name'] + "@" + item['institution'] ].push(item);
		});

		db.collection("accom").find({"name" : { "$in" : names }, "institution" : { "$in" : unis } }).toArray(function(err, items){
			data = [];
			items.forEach(function(item){
				item['items'] = acc[ item['name'] + "@" + item['institution'] ];
				data.push( sortAccom( item ) );
			});

			query = {};
			for(key in req.query){
				query[key] = {};
				query[key][req.query[key]] = true;
				query[key + "_value"] = req.query[key];
			}

			finishCompare("accom.html", {
				"query" : query,
				"accoms" : data,
				"page_title" : "Compare Accomodation",
				"pjax" : req.get("X-PJAX"),
				"djax_key" : req.query.used,
				"djax_value" : req.query.select,
				"comparing" : req.query['courses'] != undefined
			}, req, res);
		});
	});
});

// This will look like /compare/universities?courses=G601@N21,G600@N21
app.get("/compare/universities", function(req, res){
	unis = parseCompareArgs(req, res);
	db.collection("university").find({"code": { "$in" : unis } }).toArray(function(err, data){
		udata = [];
		data.forEach(function(item){
			if(req['extra_data'] != undefined){
				item['compare_code'] = req.extra_data.cbu[item['code']].join(",");
			} else{
				item['compare_code'] = item['code'];
			}
			udata.push( sortUni(item) );
		});
		// compare_code

		finishCompare("compareunis.html", {"key" : req.query.used, "unis" : udata, "page_title" :"Compare universities", "comparing" : true }, req, res);
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
	if(req.query['alevels'] != undefined && req.query['alevels'] != ""){
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

		score.sort();
		score = score.join("")*1;

		filters['$or'] = [
			{"entry.tarrif" : { "$lte" : tarrif }},
			{"entry.alevels" : { "$lte" : score }}
		];
	}

	db.collection("courses").find(filters, { "limit": 20, "skip" : 10 * ( req.query['page']-1 ) }).toArray(function(err, fdata){
			unisNeeded = [];
			fdata.forEach(function(item) {
				if(unisNeeded.indexOf(item['institution']) == -1){
					unisNeeded.push(item['institution']);
				}
			});

			query = {};
			for(key in req.query){
				query[key] = {};
				query[key][req.query[key]] = true;
				query[key + "_value"] = req.query[key];
			}
			
			db.collection("university").find({ "code" : { "$in" : unisNeeded } }, { "name":1, "code":1 }).toArray(function(err, uniData){
				uniD = {};
				uniData.forEach(function(item){ uniD[ item.code ] = item.name });
				
				data = [];
				fdata.forEach(function(item) {
					item['university'] = { "name" : uniD[item['institution']] };
					data.push( sortCourse(item) );
				});

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
});

app.post("/compare/finish", function(req, res){
	if(req.body['items'] == undefined){ sendError(res); return; }
	items = [];
	itemd = req.body['items'].split(",");
	itemd.forEach(function(id){
		if(id != ''){
			items.push(mongo.ObjectID.createFromHexString(id));
		}
	});

	codes = req.body['courses'].split(",");
	unis = [];
	courses = [];
	codes.forEach(function(item){
		t = item.split("@");
		courses.push(t[0]);
		unis.push(t[1])
	});
	
	db.collection("university").find({"code" : {"$in" : unis}}).toArray(function(err, uni_d){
		data = {};
		uni_d.forEach(function(item){
			item['acc'] = [];
			item['courses'] = [];
			data[item['code']] = sortUni( item );
		});

		// Courses
		db.collection("courses").find({"institution": { "$in": unis }, "code" : { "$in": courses} }).toArray(function(err, courses){
			courses.forEach(function(item){
				item['university'] = { "name" : data[ item['institution'] ]['name'] };
				data[ item['institution'] ]['courses'].push( sortCourse( item ) );
			});
			// Accomodation
			db.collection("accom_items").find({ "_id" : { "$in" : items } }).toArray(function(err, ac_items){
				acc = {};
				names = [];
				ac_items.forEach(function(item){
					names.push(item['name']);
					if(acc[ item['name'] + "@" + item['institution'] ] == undefined){
						acc[ item['name'] + "@" + item['institution'] ] = [];
					}
					acc[ item['name'] + "@" + item['institution'] ].push(item);
				});

				db.collection("accom").find({"name" : { "$in" : names }, "institution" : { "$in" : unis } }).toArray(function(err, items){
					items.forEach(function(item){
						item['items'] = acc[ item['name'] + "@" + item['institution'] ];
						data[item['institution']]['acc'].push( sortAccom( item ) );
					});

					finaldata = [];
					for(key in data){
						finaldata.push(data[key]);
					}

					// All of the data is here, now render it!
					res.render("finish.html", {
						"page_title" : "Comparison Results",
						"data" : finaldata
					}, function(err, data) {
						res.end(data);
					});

				});
			});
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
