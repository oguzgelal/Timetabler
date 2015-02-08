var dataset;
var added = [];

$(document).ready(function(){
	init();
});
$(document).on("keyup", ".selectFilterText", function(){
	var filterStr = $(this).val();
	populateList(filterStr);
});
$(document).on('click', '.selectButton', function(){
	var selecteds = $('.selectorLectures').val();
	addSelected(selecteds);
});
$(document).on('click', '.removeButton', function(){
	var container = $(this).parent();
	var removeData = $(container).data('val');
	added.splice(added.indexOf(removeData), 1);
	container.slideUp('fast');
});
$(document).on('mouseenter', '.sectionTitle', function(){ dashedOn($(this)); });
$(document).on('mouseleave', '.sectionTitle', function(){ dashedOff($(this)); });
$(document).on('click', '.sectionTitle', function(){ toggleVisibility($(this)); });
$(document).on('click', '.generateButton', function(){ generate(); });

function init(){
	$.getJSON("data/ozu.json", function(data){
		dataset = data["Sheet0"];
		populateList("");
	});
	
	// For IE Users ---
	if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun/*, thisArg*/) {
			'use strict';
			if (this === void 0 || this === null) { throw new TypeError(); }
			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== 'function'){ throw new TypeError(); }

			var res = [];
			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i];
					if (fun.call(thisArg, val, i, t)){ res.push(val); }
				}
			}
			return res;
		};
	}
	//---
}

function dashedOn(ths){
	var parent = ths.parent().find('.section');
	if (parent.is(':visible')){
		ths.css('border', '1px dashed gray');
		ths.css("border-bottom", "none");
	}
	else{ ths.css('border', '1px solid gray'); }
}
function dashedOff(ths){
	var parent = ths.parent().find('.section');
	if (parent.is(':visible')){
		ths.css('border', '1px solid gray');
		ths.css("border-bottom", "none");
	}
	else{ ths.css('border', '1px dashed gray'); }
}

function toggleVisibility(ths){
	var parent = ths.parent().find('.section');
	if (parent.is(':visible')){
		parent.slideUp('fast', function(){
			ths.removeClass('active');
			ths.addClass('notactive');
			ths.css("border", "1px dashed gray");
		});
	}
	else{
		ths.css("border", "1px solid gray");
		ths.css("border-bottom", "none");
		ths.removeClass('notactive');
		ths.addClass('active');
		parent.slideDown('fast');
	}
}

function populateList(filter){
	$('.selectorLectures').html("");
	var placed = [];
	for(var i = 0; i < dataset.length; i++){
		var course = dataset[i];
		if (placed.indexOf(course["SUBJECT"]+course["COURSENO"]) == -1){
			var menuOpt = "<option value='"+course["SUBJECT"]+"|"+course["COURSENO"]+"'>"+course["SUBJECT"]+" "+course["COURSENO"]+" - "+course["TITLE"]+"</option>";
			if (filter==""){
				$('.selectorLectures').append(menuOpt);
				placed.push(course["SUBJECT"]+course["COURSENO"]);
			}
			else {
				var matchSubjectStr = course["SUBJECT"]+" "+course["COURSENO"];
				var matchSubject = matchSubjectStr.match(new RegExp(filter, "i"));
				var matchTitleStr = course["TITLE"];
				var matchTitle = matchTitleStr.match(new RegExp(filter, "i"));
				if (matchSubject){
					$('.selectorLectures').append(menuOpt);
					placed.push(course["SUBJECT"]+course["COURSENO"]);
				}
				else if (matchTitle){
					$('.selectorLectures').prepend(menuOpt);
					placed.push(course["SUBJECT"]+course["COURSENO"]);
				}
			}
		}
	}	
}

function addSelected(items){
	if (added.length == 0){
		$('.emptyTag#courselect').hide();
		$('.addedCourses').css("border", "1px solid lightgray");
		$('.generateButtonCont').fadeIn('fast');
	}
	for(var i = 0; i < items.length; i++){
		var item = items[i];
		if (added.indexOf(item) == -1){
			added.push(item);
			var itemParts = item.split("|");
			var courseSubject = itemParts[0];
			var courseCode = itemParts[1];
			var filtered = dataset.filter(function(el) { return el["SUBJECT"]==courseSubject && el["COURSENO"]==courseCode; });
			var courseTitle = filtered[0]["TITLE"];
			var html = "\
			<li class='addedCourse clearfix' data-val='"+item+"'>\
			<div class='addedCourseItem addedCourseCode'>"+itemParts[0]+" "+itemParts[1]+"</div>\
			<div class='addedCourseItem addedCourseTitle'>"+courseTitle+"</div>\
			<div class='removeButton'><i class='fa fa-trash-o'></i></div>\
			</li>\
			";
			$('.addedCourses').prepend(html);
		}
	}
}

function getTimes(time){
	var resultTimes = [];
	var times = time.split("\n");
	for(var i = 0; i < times.length; i++){
		if (times[i]){
			var timeSeperated = times[i].split("|");
			var timeDay = timeSeperated[0];
			var timeInterval = timeSeperated[1];
			var timeIntervalParts = timeSeperated[1].split("-");
			var timeIntervalFrom = timeIntervalParts[0];
			var timeIntervalTo = timeIntervalParts[1];
			timeDay = timeDay.replace(/\s/g, '');
			timeIntervalTo = timeIntervalTo.replace(/\s/g, '');
			timeIntervalFrom = timeIntervalFrom.replace(/\s/g, '');
			resultTimes.push([timeDay, timeIntervalFrom, timeIntervalTo]);
		}
	} return resultTimes;
}

function processTimes(timesReadable){
	var resultMachineTimes = [];
	for(var i = 0; i < timesReadable.length; i++){
		var machineReadable_day = timesReadable[i][0].toLowerCase();
		var trMap = {'ç':'c', 'ğ':'g', 'ş':'s', 'ü':'u', 'ı':'i', 'ö':'o'};
		for (var key in trMap){
			machineReadable_day = machineReadable_day.replace(new RegExp(key,'g'), trMap[key]);
		}
		var machineReadable_from = parseInt(timesReadable[i][1].replace(":", ""));
		var machineReadable_to = parseInt(timesReadable[i][2].replace(":", ""));
		resultMachineTimes.push([machineReadable_day, machineReadable_from, machineReadable_to]);
	} return resultMachineTimes;
}

function generate(){
	var programDetails = "";
	$('.programsCont').html("");
	var allSections = [];
	for(var i = 0; i < added.length; i++){
		var addedParts = added[i].split("|");
		var courseSubject = addedParts[0];
		var courseCode = addedParts[1];
		var sections = dataset.filter(function(el) { return el["SUBJECT"]==courseSubject && el["COURSENO"]==courseCode; });
		if (sections.length > 0){
			for(var j = 0; j < sections.length; j++){
				var timesHumanReadable = getTimes(sections[j]["SCHEDULEFORPRINT"]);
				var timesMachineReadable = processTimes(timesHumanReadable);
				sections[j]["PROCESSEDTIMES"] = {"HUMAN" : timesHumanReadable, "MACHINE" : timesMachineReadable }
			}
		}
		if (timesMachineReadable.length > 0){ allSections.push(sections); }
		else{ programDetails += "<b style='color:red;'>No time data</b> : "+courseSubject+" "+courseCode+" (Most probably this means that attendance to "+courseSubject+" "+courseCode+" is not required)<br>"; }
		
	}
	var bigLoopCount = 1;
	var sectionLens = []
	for(var x = 0; x < allSections.length; x++){
		sectionLens[x] = allSections[x].length;
		bigLoopCount*=allSections[x].length;
	}
	for(var bli = 0; bli < bigLoopCount; bli++){
		var cnt = bli;
		var combinedSections = [];
		for(var sl = 0; sl < sectionLens.length; sl++){
			var sectionIndex = cnt % sectionLens[sl];
			cnt = (cnt-sectionIndex)/sectionLens[sl];
			combinedSections.push(allSections[sl][sectionIndex]);
		}
		printIfNoConflict(combinedSections, programDetails);
	}
}

function printIfNoConflict(combined, programDetails){
	var htmlKeep = {};
	var timesKeep = {};
	var minStart = 840;
	var maxEnd = 0;
	for(var i = 0; i < combined.length; i++){
		var thisTimeHuman = combined[i]["PROCESSEDTIMES"]["HUMAN"];
		var thisTime = combined[i]["PROCESSEDTIMES"]["MACHINE"];
		var thisHtmlRandomColor = 'rgb('+(Math.floor((256-149)*Math.random())+150)+','+(Math.floor((256-149)*Math.random())+150)+','+(Math.floor((256-149)*Math.random())+150)+')';
		for(var j = 0; j < thisTime.length; j++){
			var thisTimeLect = thisTime[j];
			var thisTimeDay = thisTimeLect[0];
			var thisTimeFrom = thisTimeLect[1];
			var thisTimeTo = thisTimeLect[2];
			if (thisTimeTo>maxEnd){ maxEnd = thisTimeTo; }
			if (!htmlKeep[thisTimeDay]){ htmlKeep[thisTimeDay] = ""; }
			if (!timesKeep[thisTimeDay]){ timesKeep[thisTimeDay] = []; }
			else {
				for(var tk = 0; tk < timesKeep[thisTimeDay].length; tk++){
					var checkFrom = timesKeep[thisTimeDay][tk][0];
					var checkTo = timesKeep[thisTimeDay][tk][1];
					if ((thisTimeTo > checkFrom)&&(thisTimeFrom < checkTo)){ return false; }
				}
			}
			timesKeep[thisTimeDay].push([thisTimeFrom, thisTimeTo]);
			var thisHtmlTop = (thisTimeFrom-minStart)/2;
			var thisHtmlHeight = (thisTimeTo-thisTimeFrom)/2;
			var thisHtmlFrom = thisTimeHuman[j][1];
			var thisHtmlTo = thisTimeHuman[j][2];
			var thisHtmlLectureSubj = combined[i]["SUBJECT"];
			var thisHtmlLectureNo = combined[i]["COURSENO"];
			var thisHtmlLectureSection = combined[i]["SECTIONNO"];
			var thisHtmlLectureTitle = combined[i]["TITLE"];

			var rowHtml = "\
			<div class='programLect' style='top:"+thisHtmlTop+"px; background-color:"+thisHtmlRandomColor+"; height:"+thisHtmlHeight+"px; padding-top:"+(thisHtmlHeight/2)+"px;'>\
			<div class='lectData'>\
			<div class='lectName'>"+thisHtmlLectureSubj+" "+thisHtmlLectureNo+" ("+thisHtmlLectureSection+")</div>\
			<div class='lectTitle'>"+thisHtmlLectureTitle+"</div>\
			<div class='lectTime'>"+thisHtmlFrom+" - "+thisHtmlTo+"</div>\
			</div>\
			</div>\
			";
			htmlKeep[thisTimeDay] += rowHtml;
		}
		if (thisTime.length == 0){
			var thisHtmlLectureSubj = combined[i]["SUBJECT"];
			var thisHtmlLectureNo = combined[i]["COURSENO"];
			var thisHtmlLectureSection = combined[i]["SECTIONNO"];
			var thisHtmlLectureTitle = combined[i]["TITLE"];
			programDetails+="<b style='color:red;'>No time data</b> : "+thisHtmlLectureSubj+" "+thisHtmlLectureNo+" ("+thisHtmlLectureSection+") - "+thisHtmlLectureTitle+"<br>";
		}
	}
	if (!htmlKeep["pazartesi"]){ htmlKeep["pazartesi"]=""; }
	if (!htmlKeep["sali"]){ htmlKeep["sali"]=""; }
	if (!htmlKeep["carsamba"]){ htmlKeep["carsamba"]=""; }
	if (!htmlKeep["persembe"]){ htmlKeep["persembe"]=""; }
	if (!htmlKeep["cuma"]){ htmlKeep["cuma"]=""; }
	if (!htmlKeep["cumartesi"]){ htmlKeep["cumartesi"]=""; }

	if (programDetails.length > 0){
		programDetails = "<div class='programDetails'><b><u>Additional Info</u></b><br>"+programDetails+"</div>";
	}

	var tableHeight = maxEnd-minStart;
	if (tableHeight<=0){ tableHeight=100; }
	var tableHtml = "\
	<div class='program' style='height: "+tableHeight+"px;'>\
	<div class='programDay' id='pazartesi'><div class='dayText'>Monday</div>"+htmlKeep["pazartesi"]+"</div>\
	<div class='programDay' id='sali'><div class='dayText'>Tuesday</div>"+htmlKeep["sali"]+"</div>\
	<div class='programDay' id='carsamba'><div class='dayText'>Wednesday</div>"+htmlKeep["carsamba"]+"</div>\
	<div class='programDay' id='persembe'><div class='dayText'>Thursday</div>"+htmlKeep["persembe"]+"</div>\
	<div class='programDay' id='cuma'><div class='dayText'>Friday</div>"+htmlKeep["cuma"]+"</div>\
	<div class='programDay' id='cumartesi'><div class='dayText'>Saturday</div>"+htmlKeep["cumartesi"]+"</div>\
	</div>"+programDetails+"<div class='gap'></div>";

	$('.programsCont').append(tableHtml);
}
