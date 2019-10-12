/// <reference path="../../Source/Concert.js" />
/// <reference path="jquery-1.7.2.min.js" />

"use strict";

var sequence, sequence2, syncSource;


function init()
{
	var i, j, x, y, $testArea, $curdiv, curTimesArry, curValuesArray, transformationSet = [];
	var lastKeyframeTime;
	var numSegments, thisKeyframeTime;

	var numDots = 100;
	var numSegmentsMin = 100, numSegmentsMax = 100;
	var segmentTimeMin = 100, segmentTimeMax = 5000;
	var easingFunction = Concert.EasingFunctions.Smoothstep;

	$testArea = $("#TestArea");
	for (i = 0; i < numDots; i++)
	{
		$curdiv = $("<div>").addClass("dot").appendTo($testArea);

		numSegments = numSegmentsMin + Math.floor(Math.random() * (numSegmentsMax - numSegmentsMin))

		lastKeyframeTime = 0;
		curTimesArry = [lastKeyframeTime];
		x = Math.floor(Math.random() * 800);
		y = Math.floor(Math.random() * 800);
		curValuesArray = [[x, y]];
		for (j = 0; j < numSegments; j++)
		{
			lastKeyframeTime = lastKeyframeTime + segmentTimeMin + Math.floor(Math.random() * (segmentTimeMax - segmentTimeMin));

			x = Math.floor(Math.random() * 800);
			y = Math.floor(Math.random() * 800);

			curTimesArry.push(lastKeyframeTime);
			curValuesArray.push([x, y]);
		}

		transformationSet.push(
			{
				target: $curdiv.get(0),
				feature: ["left", "top"],
				easing: easingFunction,
				calculator: Concert.Calculators.Linear,
				applicator: Concert.Applicators.Style,
				unit: "px",
				keyframes:
					{
						times: curTimesArry,
						values: curValuesArray
					}
			});
	}

	var m0, m1, m2, m3, m4;
	//var inum = 0, i1 = window.setInterval(function () { console.log(inum); inum++; }, 50);

	m0 = (new Date()).getTime();
	sequence = new Concert.Sequence();
	m1 = (new Date()).getTime();
	sequence.addTransformations(transformationSet);
	m2 = (new Date()).getTime();
	sequence.index(
		function ()
		{
			m3 = (new Date()).getTime();
			showText("Time to finish indexing:" + (m3 - m2));
			sequence.seek(0);
			//window.clearInterval(i1);
		},
		true);
	m4 = (new Date()).getTime();

	showText("Time to index() return:" + (m4 - m2));
	showText("Creating Sequence:" + (m1 - m0));
	showText("Adding Transformations:" + (m2 - m1));
}


function init2()
{
	var $d1 = $("<div id=\"UpperElement1\">Upper</div>").css({ position: "absolute", left: "100px", top: "100px", width: "100px", height: "100px", backgroundColor: "#ff0000" });
	var $d2 = $("<div id=\"LowerElement1\">Lower</div>").css({ position: "absolute", left: "100px", top: "200px", width: "100px", height: "100px", backgroundColor: "#00ff00" });
	var $d3 = $("<div id=\"UpperElement2\">Upper</div>").css({ position: "absolute", left: "100px", top: "400px", width: "100px", height: "100px", backgroundColor: "#ff0000" });
	var $d4 = $("<div id=\"LowerElement2\">Lower</div>").css({ position: "absolute", left: "100px", top: "500px", width: "100px", height: "100px", backgroundColor: "#00ff00" });
	var $testArea = $("#TestArea");
	$testArea.append($d1).append($d2).append($d3).append($d4);


	var originalSequence = new Concert.Sequence();
	originalSequence.setDefaults({ applicator: Concert.Applicators.Style, calculator: Concert.Calculators.Linear, easing: Concert.EasingFunctions.ConstantRate });
	originalSequence.addTransformations(
		[
			{ target: "UpperElement", feature: "left", unit: "px", keyframes: { times: [0, 1000], values: [100, 200] } },
			{ target: "LowerElement", feature: "left", unit: "px", keyframes: { times: [0, 1000], values: [100, 200] } }
		]);

	var newSequence1 = originalSequence.clone(function (originalTarget) { return document.getElementById(originalTarget + "1"); });
	//newSequence2 = originalSequence.clone(function (originalTarget) { return document.getElementById(originalTarget + "2"); });

	newSequence1.begin();
	window.setTimeout(
		function ()
		{
			newSequence2 = newSequence1.clone(function (originalTarget) { return document.getElementById(originalTarget.id.substr(0, 12) + "2"); }, true);
			//newSequence2.begin();
		}, 500)
}


function init3()
{
	var $d1 = $("<div id=\"OuterBox\">1</div>").css({ position: "absolute", left: "100px", top: "100px", width: "200px", height: "200px", backgroundColor: "#ff0000" });
	var $d2 = $("<div id=\"LeftInnerBox\">2</div>").css({ position: "absolute", left: "100px", top: "100px", width: "100px", height: "200px", backgroundColor: "#00ff00" }).addClass("InnerBox");
	var $d3 = $("<div id=\"RightInnerBox\">3</div>").css({ position: "absolute", left: "200px", top: "100px", width: "100px", height: "200px", backgroundColor: "#0000ff" }).addClass("InnerBox");
	var $testArea = $("#TestArea");
	$testArea.append($d1).append($d2).append($d3);

	sequence = new Concert.Sequence();

	function customApplicator(target, feature, value, unit)
	{
		target.each(function () { $(this).css(feature, value + unit); });
	}

	function customCalculator(distanceFraction, startValue, endValue, additionalProperties)
	{
		return (distanceFraction * (endValue - startValue) * $("#OuterBox").innerWidth());
	}

	function customEasing(startTime, endTime, currentTime)
	{
		var fractionComplete = (currentTime - startTime) / (endTime - startTime);
		if (fractionComplete < 2 / 3)
			return (fractionComplete / 2);
		else
			return (1 / 3 + 2 * (fractionComplete - 2 / 3));
	}

	sequence.addTransformations(
		{
			target: $(".InnerBox"),
			feature: "width",
			applicator: customApplicator,
			calculator: customCalculator,
			easing: customEasing,
			unit: "px",
			keyframes:
				{
					times: [0, 1000],
					values: [0, 0.5]
				}
		});
	
	sequence.index(function () { showText("finished indexing."); }, true);
}

function showText(text)
{
	$("#TextArea").text($("#TextArea").text() + text + "\n");
}

function onMouseMove(event)
{
	var mouseOffset, sequencePosition, sequenceTime;

	if (sequence)
	{
		if (event.offsetX)
			mouseOffset = event.offsetX;
		else
			mouseOffset = event.clientX - event.target.offsetLeft;
		sequenceTime = 2 * ((mouseOffset - 400) * 2 + 400);
		sequencePosition = sequence.seek(sequenceTime);
		if (sequencePosition < 0)
			jQuery("#StatusLabel").text("(before beginning)");
		else if(sequencePosition == 0)
			jQuery("#StatusLabel").text("in middle");
		else
			jQuery("#StatusLabel").text("at or after end");
	}
}


function runClick()
{
	jQuery("#StatusLabel").text("Running.");

	var runParams =
		{
			synchronizeTo:
				function ()
				{
					var p = new Number($("#PositionUpdate").val());
					if (isNaN(p))
						p = 0;
					else
						p = p.valueOf();
					return p;
				},
			//speed: new Number(jQuery("#TimeScaleFactorText").get(0).value),
			//initialSeek: 25000,
			//timeOffset: null,
			//pollingInterval: new Number(jQuery("#IntervalText").get(0).value),
			after: Concert.Repeating.Bounce(),
			before: Concert.Repeating.Bounce(5),
			//autoStopAtEnd: true,
			onAutoStop: function () { jQuery("#StatusLabel").text("Auto-stopped."); }
		};

	sequence.run(runParams);
	//sequence.follow(something);
	//sequence.syncTo(something);
	//sequence.stop();
}

function beginClick()
{
	var startTime;

	jQuery("#StatusLabel").text("Begun.");

	sequence.begin(
		{
			onAutoStop: function () { jQuery("#StatusLabel").text("Auto-stopped."); },
			useSoleControlOptimization: true
		});
	/*
	setTimeout(
		function ()
		{ sequence2 = sequence.clone(function (oldTarget) { return $("#d2").get(0); }, false, true); },
		500);
	*/
}

function followClick()
{
	jQuery("#StatusLabel").text("Following.");
	sequence.follow(jQuery("#TestAudioElement").get(0));
}

function syncClick()
{
	jQuery("#StatusLabel").text("Synchronizing.");
	sequence.syncTo(jQuery("#TestAudioElement").get(0));
}

function stopClick()
{
	jQuery("#StatusLabel").text("Stopped.");
	sequence.stop();
}


function customPositionQuery()
{
	var newPosition;

	try
	{
		newPosition = new Number(jQuery("#PositionUpdate").get(0).value);
		if(isNaN(newPosition))
			newPosition = 0;
	}
	catch (e)
	{
		newPosition = 0;
	}

	return newPosition.valueOf();
}