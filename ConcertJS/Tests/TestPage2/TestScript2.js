/// <reference path="../../Source/MediaSynchronization.js" />
/// <reference path="jquery-1.7.2.min.js" />
/// <reference path="../../Components/BaseObject.js" />


var TestPage2 = (function ()
{
	var PublicNameSpace =
	{
		Test:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function TestConstructor()
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.seekDurations = null;

					thisProtected.showResults = def_showResults;
					thisProtected.getMin = def_getMin;
					thisProtected.getMax = def_getMax;
					thisProtected.getAvg = def_getAvg;

					thisPublic.run = def_run;
				}


				function def_run()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, j, $curBar;
					var $TestArea = jQuery("#TestArea");
					var numTestBars = parseInt(jQuery("#Input_NumBars").val());
					var numHiddenBars = parseInt(jQuery("#Input_NumHiddenBars").val());
					var barHeight = $TestArea.innerHeight() / numTestBars;

					var testClock = new TestPage2.TestClock();
					var timerInterval = parseInt(jQuery("#Input_TimerInterval").val());
					var cycleCount = parseInt(jQuery("#Input_CycleCount").val());
					var halfCycleTime = parseInt(jQuery("#Input_HalfCycleTime").val());
					var halfCycleTimeSeconds = halfCycleTime / 1000;
					var totalRunTime = cycleCount * halfCycleTime * 2;

					var synchElements = [];
					var curTransformationList;
					var quarterCycle = halfCycleTimeSeconds / 2;

					var $timeDisplay = jQuery("#TimeDisplay");

					$TestArea.empty();
					for(i = 0; i < numTestBars; i++)
					{
						$curBar = jQuery("<div>").addClass("TestBar").height(barHeight).css("top", (i * barHeight) + "px").appendTo($TestArea);
						$curBar.height($curBar.height() - ($curBar.outerHeight() - barHeight));

						curTransformationList = [];

						for(j = 0; j < cycleCount; j++)
						{

							// Widen to the right
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "width", 50, 1050, "px", MediaSynchronization.ChangeCurve.Linear));

							// Shrink to the right
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + quarterCycle, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "width", 1050, 50, "px", MediaSynchronization.ChangeCurve.Linear));
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + quarterCycle, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "left", 0, 1000, "px", MediaSynchronization.ChangeCurve.Linear));

							// Widen to the left
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + halfCycleTimeSeconds, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "width", 50, 1050, "px", MediaSynchronization.ChangeCurve.Linear));
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + halfCycleTimeSeconds, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "left", 1000, 0, "px", MediaSynchronization.ChangeCurve.Linear));

							// Shrink to the left
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + 3 * quarterCycle, quarterCycle, MediaSynchronization.ChangingFeatureType.Style, "width", 1050, 50, "px", MediaSynchronization.ChangeCurve.Linear));
						}

						synchElements.push(new MediaSynchronization.Element($curBar.get(0), curTransformationList));
					}
					for(i = 0; i < numHiddenBars; i++)
					{
						$curBar = jQuery("<div>").addClass("TestBar").height(barHeight).css("top", (i * barHeight) + "px").css("display", "none").appendTo($TestArea);
						$curBar.height($curBar.height() - ($curBar.outerHeight() - barHeight));

						curTransformationList = [];
						for(j = 0; j < cycleCount; j++)
						{
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2, halfCycleTimeSeconds, MediaSynchronization.ChangingFeatureType.Style, "width", 50, 1050, "px", MediaSynchronization.ChangeCurve.Linear));
							curTransformationList.push(new MediaSynchronization.Transformation(j * halfCycleTimeSeconds * 2 + halfCycleTimeSeconds, halfCycleTimeSeconds, MediaSynchronization.ChangingFeatureType.Style, "width", 1050, 50, "px", MediaSynchronization.ChangeCurve.Linear));
						}

						synchElements.push(new MediaSynchronization.Element($curBar.get(0), curTransformationList));
					}

					var testSequence = new MediaSynchronization.Synchronization(null, null, synchElements, true);

					$timeDisplay.text("0");
					var seekStartTime, seekEndTime;
					thisProtected.seekDurations = [];
					var seekDurations = thisProtected.seekDurations;
					testClock.start();
					var testTimer = setInterval(
						function()
						{
							seekStartTime = testClock.getElapsedTime();

							if(seekStartTime > totalRunTime)
								clearInterval(testTimer);

							testSequence.seek(seekStartTime / 1000);
							seekEndTime = testClock.getElapsedTime();

							$timeDisplay.text(seekStartTime.toString());

							seekDurations.push(seekEndTime - seekStartTime);

							if(seekStartTime > totalRunTime)
								thisProtected.showResults();
						},
						timerInterval);
				} // end def_run()


				function def_showResults()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var seekDurations = thisProtected.seekDurations;

					jQuery("#ResultsArea").html(
						"<div>Seeks performed:" + seekDurations.length.toString() + "</div>"
						+ "<div>Minimum seek completion time (ms):" + thisProtected.getMin(seekDurations).toString() + "</div>"
						+ "<div>Maximum seek completion time (ms):" + thisProtected.getMax(seekDurations).toString() + "</div>"
						+ "<div>Average seek completion time (ms):" + thisProtected.getAvg(seekDurations).toString() + "</div>"
						);
				} // end def_showResults()


				function def_getMin(numArray)
				{
					var i, returnVal, curVal;
					if(numArray.length > 0)
					{
						returnVal = numArray[0];
						for(i = 0; i < numArray.length; i++)
						{
							curVal = numArray[i];
							if(curVal < returnVal)
								returnVal = curVal;
						}
					}
					else
						returnVal = null;

					return returnVal;
				} // end def_getMin


				function def_getMax(numArray)
				{
					var i, returnVal, curVal;
					if(numArray.length > 0)
					{
						returnVal = numArray[0];
						for(i = 0; i < numArray.length; i++)
						{
							curVal = numArray[i];
							if(curVal > returnVal)
								returnVal = curVal;
						}
					}
					else
						returnVal = null;

					return returnVal;
				} // end def_getMax


				function def_getAvg(numArray)
				{
					var i, sum = 0;
					for(i = 0; i < numArray.length; i++)
						sum += numArray[i];
					return sum / numArray.length;
				} // end def_getAvg


				return TestConstructor;
			}),


		TestClock:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function TestClockConstructor()
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.startTime = null;

					thisPublic.start = def_start;
					thisPublic.getElapsedTime = def_getElapsedTime;
				}


				function def_start()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.startTime = (new Date()).getTime();
				} // end def_start()


				function def_getElapsedTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return (new Date()).getTime() - thisProtected.startTime;
				} // end def_getElapsedTime()


				return TestClockConstructor;
			})	};

	return PublicNameSpace;
})(); // end TestPage2 namespace


this.MainTest = new TestPage2.Test;
