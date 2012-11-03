(function(c,n){var l="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function m(){var b=c(i),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function j(b,a){b.src===l||-1!==c.inArray(b,k)||(k.push(b),a?h.push(b):i.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(i),c(h)]),e.length===k.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),k=[],i=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){j(b.target,"error"===b.type)}).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)j(a,e.isBroken);else if(a.complete&&a.naturalWidth!==n)j(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=l,a.src=d}):m();return d?d.promise(g):
g}})(jQuery);

var colors = [["#FFFFFF"],["#FFFFCC"],["#FFFF99"],["#FFFF66"],["#FFFF33"],["#FFFF00"],["#FFCCFF"],["#FFCCCC"],["#FFCC99"],["#FFCC66"],["#FFCC33"],["#FFCC00"],["#FF99FF"],["#FF99CC"],["#FF9999"],["#FF9966"],["#FF9933"],["#FF9900"],["#FF66FF"],["#FF66CC"],["#FF6699"],["#FF6666"],["#FF6633"],["#FF6600"],["#FF33FF"],["#FF33CC"],["#FF3399"],["#FF3366"],["#FF3333"],["#FF3300"],["#FF00FF"],["#FF00CC"],["#FF0099"],["#FF0066"],["#FF0033"],["#FF0000"],[null],["#CCFFFF"],["#CCFFCC"],["#CCFF99"],["#CCFF66"],["#CCFF33"],["#CCFF00"],["#CCCCFF"],["#CCCCCC"],["#CCCC99"],["#CCCC66"],["#CCCC33"],["#CCCC00"],["#CC99FF"],["#CC99CC"],["#CC9999"],["#CC9966"],["#CC9933"],["#CC9900"],["#CC66FF"],["#CC66CC"],["#CC6699"],["#CC6666"],["#CC6633"],["#CC6600"],["#CC33FF"],["#CC33CC"],["#CC3399"],["#CC3366"],["#CC3333"],["#CC3300"],["#CC00FF"],["#CC00CC"],["#CC0099"],["#CC0066"],["#CC0033"],["#CC0000"],[null],["#99FFFF"],["#99FFCC"],["#99FF99"],["#99FF66"],["#99FF33"],["#99FF00"],["#99CCFF"],["#99CCCC"],["#99CC99"],["#99CC66"],["#99CC33"],["#99CC00"],["#9999FF"],["#9999CC"],["#999999"],["#999966"],["#999933"],["#999900"],["#9966FF"],["#9966CC"],["#996699"],["#996666"],["#996633"],["#996600"],["#9933FF"],["#9933CC"],["#993399"],["#993366"],["#993333"],["#993300"],["#9900FF"],["#9900CC"],["#990099"],["#990066"],["#990033"],["#990000"],[null],["#66FFFF"],["#66FFCC"],["#66FF99"],["#66FF66"],["#66FF33"],["#66FF00"],["#66CCFF"],["#66CCCC"],["#66CC99"],["#66CC66"],["#66CC33"],["#66CC00"],["#6699FF"],["#6699CC"],["#669999"],["#669966"],["#669933"],["#669900"],["#6666FF"],["#6666CC"],["#666699"],["#666666"],["#666633"],["#666600"],["#6633FF"],["#6633CC"],["#663399"],["#663366"],["#663333"],["#663300"],["#6600FF"],["#6600CC"],["#660099"],["#660066"],["#660033"],["#660000"],[null],["#33FFFF"],["#33FFCC"],["#33FF99"],["#33FF66"],["#33FF33"],["#33FF00"],["#33CCFF"],["#33CCCC"],["#33CC99"],["#33CC66"],["#33CC33"],["#33CC00"],["#3399FF"],["#3399CC"],["#339999"],["#339966"],["#339933"],["#339900"],["#3366FF"],["#3366CC"],["#336699"],["#336666"],["#336633"],["#336600"],["#3333FF"],["#3333CC"],["#333399"],["#333366"],["#333333"],["#333300"],["#3300FF"],["#3300CC"],["#330099"],["#330066"],["#330033"],["#330000"],[null],["#00FFFF"],["#00FFCC"],["#00FF99"],["#00FF66"],["#00FF33"],["#00FF00"],["#00CCFF"],["#00CCCC"],["#00CC99"],["#00CC66"],["#00CC33"],["#00CC00"],["#0099FF"],["#0099CC"],["#009999"],["#009966"],["#009933"],["#009900"],["#0066FF"],["#0066CC"],["#006699"],["#006666"],["#006633"],["#006600"],["#0033FF"],["#0033CC"],["#003399"],["#003366"],["#003333"],["#003300"],["#0000FF"],["#0000CC"],["#000099"],["#000066"],["#000033"],["#000000"]];
var accepted = "0123456789abcdefghijklmnopqrstuvwxyz";

function colorhash(str){
	var x = 0, y = 4;
	for (var i = str.length - 1; i >= 0; i--) {
		x += accepted.indexOf(str.charAt(i).toLowerCase());
		if(x >= colors.length){
			x = x/2;
		}
	};
	return colors[ Math.floor( x ) ];
}

function research () {
	term = $(this).val();
	if(term.trim() == ""){
		$(".results").addClass("hide");
		return;
	}
	$(".results").html("").removeClass("hide");
	$(".result").each(function(){
		if($(this).text().toLowerCase().indexOf(term.trim()) != -1){
			$(this).clone().removeClass("result columns masonry-brick four").attr("style", "").appendTo(".results");
		}
	});
	if($(".results").html() == ""){
		$(".results").html("No results");
	}
}

function doCompareMatrix(){
	$(".goingToLoad").hide();
	parts = {};

	parts['courseType'] = $("input[name=courseType]:checked").val();
	if($("#extra_points").val() != ""){
		parts['extra_points'] = $("#extra_points").val();
	}
	parts['alevels'] = '';
	$(".alevelSelector").each(function(){
		if($(this).val() != "-"){
			parts['alevels'] += $(this).val();
		}
	});

	q = '';
	for(key in parts){
		if(parts[key] != undefined && parts[key] != ''){
			q += key + "=" + parts[key] + "&";
		}
	}
	q = q.substr(0, q.length-1);
	djaxNavigate( "?" + q );
}

function prepareContent(){
	$(document).foundationAccordion();
	$(".compareBox").on("change", function(){
		if($(this).attr("checked")){
			$(this).closest(".result").addClass("active");
		} else{
			$(this).closest(".result").removeClass("active");
		}
	});
	$(".underNext").each(function () {
		var self = this;
		$(this).next("img").imagesLoaded(function(){
			$(self).css("margin-bottom", "-" + $(self).height() +"px");
		});
	});
	$(".entry").each(function(){
		$(this).css("border-left", "4px solid " + colorhash($(this).data("key")));
	});
}

$(document).ready(function(){
	$("#results").on("pjax:send", function(){
		$(".loading").show();
		console.log("go");
	}).on("pjax:end", function(){
		$(".loading").hide();
		console.log("emnd");
	});
	var compareTimeout = undefined;
	$(".filtering input, .filtering select").on("change", function () {
		if(compareTimeout != undefined){
			clearTimeout(compareTimeout);
		}
		$(".goingToLoad, #contentLoading").show();
		compareTimeout = setTimeout(doCompareMatrix, 4000);
	});

	$("#search").on("change", research).on("keyup", research).on("click", research);
	$(".opButton").click(function(){
		$(this).toggleClass("opOn");
	});
	$(".peopleSel").click(function(){
		$(".number-of-people").text($(this).data("people"));
		$(".peopleSel").removeClass("on");
		$(this).addClass("on").prevAll(".peopleSel").addClass("on");
	});
	
	$(".masonry").masonry();
	
	prepareContent();
}).on("djax", function(){
	prepareContent();
});
