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

	sequence = new Concert.Sequence(transformationSet);
	sequence.index();
	sequence.seek(0);
}


function init2()
{}


function init3()
{
	var $d1 = $("<div id=\"d1\">1</div>").css({ position: "absolute", left: "100px", top: "100px", width: "50px", height: "50px", backgroundColor: "#ff0000" });
	var $d2 = $("<div id=\"d2\">2</div>").css({ position: "absolute", left: "200px", top: "100px", width: "50px", height: "50px", backgroundColor: "#00ff00" });
	var $testArea = $("#TestArea");
	$testArea.append($d1).append($d2);

	sequence = new Concert.Sequence();
	sequence.setDefaults({ applicator: Concert.Applicators.Style });
	
	sequence.addTransformations(
		[
			{
				target: $d1.get(0),
				feature: ["top", "width"],
				unit: "px",
				easing: Concert.EasingFunctions.ConstantRate,
				keyframes:
					{
						times: [0, 1000, null, 2000, 3000],
						values: [[100, 50], [200, 50], null, [200, 50], [200, 100]]
					}
			}
		]);
	
	sequence.index();
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