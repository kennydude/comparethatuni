function colorhash(str){
	green = str.length / 3;
	blue = green + green;
	iR = 0; iG = 0; iB = 0;
	for(i = 0; i < str.length; i++){
		if(i < green){ // red
			iR += str.charCodeAt(i);
		} else if(i < blue){ // green
			iG += str.charCodeAt(i);
		} else if(i > blue){ // blue
			iB += str.charCodeAt(i);
		}
	}
	return 'rgb(' + iR + ', ' + iG + ', ' + iB + ')';
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

$(document).ready(function(){
	$("#search").on("change", research).on("keyup", research).on("click", research);
	$(".opButton").click(function(){
		$(this).toggleClass("opOn");
	});
	$(".peopleSel").click(function(){
		$(".number-of-people").text($(this).data("people"));
		$(".peopleSel").removeClass("on");
		$(this).addClass("on").prevAll(".peopleSel").addClass("on");
	});
	$(".entry").each(function(){
		$(this).css("border-left", "4px solid " + colorhash($(this).data("key")));
	});
	$(".masonry").masonry();
	$(document).foundationAccordion();
	$(".compareBox").on("change", function(){
		if($(this).attr("checked")){
			$(this).closest(".result").addClass("active");
		} else{
			$(this).closest(".result").removeClass("active");
		}
	});
});
