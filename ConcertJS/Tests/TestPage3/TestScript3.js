/// <reference path="../../Source/Concert.js" />
/// <reference path="jquery-1.7.2.min.js" />

"use strict";

var sequence, sequence2, syncSource;


function init()
{
	var i, j, x1, y1, x2, y2, $testArea, $curdiv, curTransformationList, transformationSet = [];
	var timeSoFar;
	var numSegments, thisSegmentTime;

	var numDots = 100;
	var numSegmentsMin = 100, numSegmentsMax = 100;
	var segmentTimeMin = 100, segmentTimeMax = 5000;
	//var totalTime = 10000;
	var easingFunction = Concert.EasingFunctions.Smoothstep;
	//var segmentTime = totalTime / numSegments;

	$testArea = $("#TestArea");
	for (i = 0; i < numDots; i++)
	{
		$curdiv = $("<div>").addClass("dot").appendTo($testArea);

		x1 = Math.floor(Math.random() * 800);
		y1 = Math.floor(Math.random() * 800);
		numSegments = numSegmentsMin + Math.floor(Math.random() * (numSegmentsMax - numSegmentsMin))

		curTransformationList = [];
		timeSoFar = 0;
		for(j = 0; j < numSegments; j++)
		{
			x2 = Math.floor(Math.random() * 800);
			y2 = Math.floor(Math.random() * 800);
			thisSegmentTime = segmentTimeMin + Math.floor(Math.random() * (segmentTimeMax - segmentTimeMin));

			curTransformationList.push(
				{
					startTime: timeSoFar,
					endTime: timeSoFar + thisSegmentTime,
					easingFunction: easingFunction,
					calculator: Concert.Calculators.Linear,
					startValue: [x1, y1],
					endValue: [x2, y2],
					unit: ["px", "px"]
				});

			x1 = x2;
			y1 = y2;
			timeSoFar += thisSegmentTime;
		}

		transformationSet.push(
			{
				objectTarget: $curdiv.get(0),
				objectSequences:
					[{
						featureTarget: ["left", "top"],
						applicator: Concert.Applicators.Style,
						transformations: curTransformationList
					}]
			});
	}

	sequence = new Concert.Sequence(transformationSet);
	sequence.index();
	sequence.seek(0);
}

function init2()
{
	var $d1 = $("<div>1</div>").css({ position: "absolute", left: "100px", top: "100px", width: "50px", height: "50px", backgroundColor:"#ff0000" });
	var $d2 = $("<div>2</div>").css({ position: "absolute", left: "200px", top: "100px", width: "50px", height: "50px", backgroundColor: "rgb(0, 255, 0)" });
	var $d3 = $("<div>3</div>").css({ position: "absolute", left: "300px", top: "100px", width: "50px", height: "50px", backgroundColor: "hsl(90, 100%, 50%)" });
	var $d4 = $("<div>4</div>").css({ position: "absolute", left: "400px", top: "100px", width: "50px", height: "50px", backgroundColor: "rgba(0, 0, 255, 1)" });
	var $d5 = $("<div>5</div>").css({ position: "absolute", left: "500px", top: "100px", width: "50px", height: "50px", backgroundColor: "hsla(270, 100%, 50%, 1)" });

	var $testArea = $("#TestArea");

	$testArea.append($d1).append($d2).append($d3).append($d4).append($d5);

	sequence = new Concert.Sequence(
		[
			{
				objectTarget: $d1.get(0),
				objectSequences:
					[{
						featureTarget: "background-color",
						applicator: Concert.Applicators.Style,
						transformations:
							[
								{
									startTime: 0,
									endTime: 4000,
									easingFunction: Concert.EasingFunctions.ConstantRate,
									calculator: Concert.Calculators.Color,
									startValue: "#000000",
									endValue: "#f00"
								}
							]
					}]
			},

			{
				objectTarget: $d2.get(0),
				objectSequences:
					[{
						featureTarget: "background-color",
						applicator: Concert.Applicators.Style,
						transformations:
							[
								{
									startTime: 0,
									endTime: 4000,
									easingFunction: Concert.EasingFunctions.ConstantRate,
									calculator: Concert.Calculators.Color,
									startValue: "rgb(0, 0, 0)",
									endValue: "rgb(0, 255, 0)"
								}
							]
					}]
			},

			{
				objectTarget: $d3.get(0),
				objectSequences:
					[{
						featureTarget: "background-color",
						applicator: Concert.Applicators.Style,
						transformations:
							[
								{
									startTime: 0,
									endTime: 4000,
									easingFunction: Concert.EasingFunctions.ConstantRate,
									calculator: Concert.Calculators.Color,
									startValue: "hsl(0, 0%, 50%)",
									endValue: "hsl(90, 100%, 100%)"
								}
							]
					}]
			},

			{
				objectTarget: $d4.get(0),
				objectSequences:
					[{
						featureTarget: "background-color",
						applicator: Concert.Applicators.Style,
						transformations:
							[
								{
									startTime: 0,
									endTime: 4000,
									easingFunction: Concert.EasingFunctions.ConstantRate,
									calculator: Concert.Calculators.Color,
									startValue: "rgba(0, 255, 0, 0)",
									endValue: "rgba(0, 0, 255, 1)"
								}
							]
					}]
			},

			{
				objectTarget: $d5.get(0),
				objectSequences:
					[{
						featureTarget: "background-color",
						applicator: Concert.Applicators.Style,
						transformations:
							[
								{
									startTime: 0,
									endTime: 4000,
									easingFunction: Concert.EasingFunctions.ConstantRate,
									calculator: Concert.Calculators.Color,
									startValue: "hsla(0, 100%, 50%, 1)",
									endValue: "hsla(360, 100%, 50%, 1)"
								}
							]
					}]
			}
		]);
	sequence.index();
}


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
				keyframes:
					{
						times: [0, 1000, null, 2000, 3000],
						values: [[100, 50], [200, 50], null, [200, 50], [200, 100]]
					}
			}
		]);
	
	sequence.index();

	//sequence2 = sequence.clone(function (oldTarget) { return $d2.get(0); });

	/*
	sequence.retarget(
		function (oldTarget)
		{
			if (oldTarget == "d1")
				return $d1.get(0);
			else if (oldTarget == "d2")
				return $d2.get(0);
			else if (oldTarget == "d3")
				return $d3.get(0);
			else if (oldTarget == "caption")
				return $caption;
			else
				return oldTarget;
		});

	*/
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
			//synchronizeTo: jQuery("#TestAudioElement").get(0),
			speed: new Number(jQuery("#TimeScaleFactorText").get(0).value),
			initialSeek: 25000,
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

	sequence2 = sequence.clone(function (oldTarget) { return $("#d2").get(0); });
	
	sequence.begin(
		{
			//after: Concert.Repeating.Bounce(5),
			onAutoStop: function () { jQuery("#StatusLabel").text("Auto-stopped."); }
		});
	
	sequence2.begin(
		{
			//after: Concert.Repeating.Bounce(5),
			onAutoStop: function () { jQuery("#StatusLabel").text("Auto-stopped."); }
		});
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