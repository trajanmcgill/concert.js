/// <reference path="../Components/BaseObject/BaseObject.js" />

var Concert = (function ()
{
	"use strict";
	
	// Save any prior value of the global variable Concert, so the
	// user can revert to it with revertNameSpace() if there is a collision.
	var previousNameSpaceValue = Concert;
	

	var _Concert =
	{
		// Some utility functions for use throughout.
		Util:
			{
				isArray: function (testVar)
				{
					return ((typeof testVar == "object") && (Object.prototype.toString.call(testVar) == "[object Array]"))
				}, // end isArray()


				deduplicateAndSort: function (origArray)
				{
					var i, distinctValStr, distinctVal, distinctArray = [], pigeonholer = {}, origNumValues = origArray.length;
					var searchStart, searchEnd, middle, curOrigVal;

					for (i = 0; i < origNumValues; i++)
					{
						curOrigVal = origArray[i];
						pigeonholer[curOrigVal] = curOrigVal;
					}

					for (distinctValStr in pigeonholer)
					{
						distinctVal = pigeonholer[distinctValStr];
						searchStart = 0;
						searchEnd = distinctArray.length - 1;

						if (searchEnd < 0 || distinctVal > distinctArray[searchEnd])
							distinctArray.push(distinctVal);
						else if(distinctVal < distinctArray[0])
							distinctArray.unshift(distinctVal);
						else
						{
							while (searchStart + 1 < searchEnd)
							{
								middle = Math.floor((searchStart + searchEnd) / 2);
								if (distinctVal < distinctArray[middle])
									searchEnd = middle;
								else
									searchStart = middle;
							}

							distinctArray.splice(searchEnd, 0, distinctVal);
						}
					}

					return distinctArray;
				}, // end deduplicateAndSort()


				round: function (input, roundFactor)
				{
					return (roundFactor * Math.round(input / roundFactor));
				}, // end round()


				arraysShallowlyEqual: function (array1, array2)
				{
					var i, arrayLength = array1.length;

					if (array2.length != arrayLength)
						return false;

					for (i = 0; i < arrayLength; i++)
					{
						if (array1[i] !== array2[i])
							return false;
					}

					return true;
				} // end arraysShallowlyEqual()

			}, // end Util singleton definition


		// Commonly used functions for applying the current value in the middle of a transformation.
		Applicators:
			{
				Custom:
					function(customFunction)
					{
						function applicatorFunction (objectTarget, featureTarget, valueContainer, lastValueContainer, forceApplication)
						{
							var i, numProperties, currentIndividualValue, applyForSure;
							var value, lastValue, unit, lastUnit, unitIsArray;

							value = valueContainer.value;
							unit = valueContainer.unit;
							if (lastValueContainer == null)
							{
								lastValue = null;
								lastUnit = null;
							}
							else
							{
								lastValue = lastValueContainer.value;
								lastUnit = lastValueContainer.unit;
							}

							applyForSure = (forceApplication || lastValue == null);

							if ((typeof featureTarget == "string") || (featureTarget instanceof String))
							{
								if (applyForSure || value !== lastValue)
									customFunction(objectTarget, featureTarget, value, unit);
							}
							else
							{
								unitIsArray = _Concert.Util.isArray(unit);

								for (i = 0, numProperties = featureTarget.length; i < numProperties; i++)
								{
									currentIndividualValue = value[i];
									if (applyForSure || currentIndividualValue !== lastValue[i])
										customFunction(objectTarget, featureTarget[i], currentIndividualValue, unitIsArray ? unit[i] : unit);
								}
							}

							return valueContainer;
						}

						return applicatorFunction;
					},

				Property:
					function (objectTarget, featureTarget, valueContainer, lastValueContainer, forceApplication)
					{
						var i, numProperties, currentIndividualValue, applyForSure;
						var value, lastValue;

						value = valueContainer.value;
						lastValue = (lastValueContainer == null) ? null : lastValueContainer.value;

						applyForSure = (forceApplication || lastValue == null);

						if ((typeof featureTarget == "string") || (featureTarget instanceof String))
						{
							if (applyForSure || value !== lastValue)
								objectTarget[featureTarget] = value;
						}
						else
						{
							for (i = 0, numProperties = featureTarget.length; i < numProperties; i++)
							{
								currentIndividualValue = value[i];
								if (applyForSure || currentIndividualValue !== lastValue[i])
									objectTarget[featureTarget[i]] = currentIndividualValue;
							}
						}

						return valueContainer;
					},

				Style:
					function (objectTarget, featureTarget, valueContainer, lastValueContainer, forceApplication)
					{
						var i, numStyles, currentIndividualValue, applyForSure;
						var value, lastValue, unit, lastUnit, unitIsArray;

						value = valueContainer.value;
						unit = valueContainer.unit;
						if (lastValueContainer == null)
						{
							lastValue = null;
							lastUnit = null;
						}
						else
						{
							lastValue = lastValueContainer.value;
							lastUnit = lastValueContainer.unit;
						}

						applyForSure = (forceApplication || lastValue == null || unit !== lastUnit);

						if ((typeof featureTarget == "string") || (featureTarget instanceof String))
						{
							if(applyForSure || value !== lastValue)
								objectTarget.style[featureTarget] = (unit == null) ? value : (value.toString() + unit);
						}
						else
						{
							unitIsArray = _Concert.Util.isArray(unit);

							for (i = 0, numStyles = featureTarget.length; i < numStyles; i++)
							{
								currentIndividualValue = value[i];
								if (applyForSure || currentIndividualValue !== lastValue[i])
									objectTarget.style[featureTarget[i]] = (unit == null) ? currentIndividualValue : (currentIndividualValue.toString() + (unitIsArray ? unit[i] : unit));
							}
						}

						return valueContainer;
					},

				SVG_ElementAttribute:
					function (objectTarget, featureTarget, valueContainer, lastValueContainer, forceApplication)
					{
						var i, numStyles, currentIndividualValue, applyForSure;
						var value, lastValue, unit, lastUnit, unitIsArray;

						value = valueContainer.value;
						unit = valueContainer.unit;
						if (lastValueContainer == null)
						{
							lastValue = null;
							lastUnit = null;
						}
						else
						{
							lastValue = lastValueContainer.value;
							lastUnit = lastValueContainer.unit;
						}

						applyForSure = (forceApplication || lastValue == null || unit !== lastUnit);

						if ((typeof featureTarget == "string") || (featureTarget instanceof String))
						{
							if (applyForSure || value !== lastValue)
								objectTarget.setAttribute(featureTarget, (unit == null) ? value : (value.toString() + unit));
						}
						else
						{
							unitIsArray = _Concert.Util.isArray(unit);

							for (i = 0, numStyles = featureTarget.length; i < numStyles; i++)
							{
								currentIndividualValue = value[i];
								if (applyForSure || currentIndividualValue !== lastValue[i])
									objectTarget.setAttribute(featureTarget[i], (unit == null) ? currentIndividualValue : (currentIndividualValue.toString() + (unitIsArray ? unit[i] : unit)));
							}
						}

						return valueContainer;
					}
			}, // end Applicator singleton / namespace definition


		// Commonly used functions for calculating a current value in the middle of a transformation.
		Calculators:
			{
				Discrete:
					function (distanceFraction, startValue, endValue, additionalProperties)
					{
						var i, curReturnValue, returnValue, valueLength, roundFactor, doRounding = (typeof additionalProperties.round != "undefined");
						if (doRounding)
							roundFactor = additionalProperties.round;

						if (_Concert.Util.isArray(startValue))
						{
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
							{
								curReturnValue = ((distanceFraction < 1) ? startValue[i] : endValue[i])
								returnValue.push(doRounding ? _Concert.Util.round(curReturnValue, roundFactor) : curReturnValue);
							}
						}
						else
						{
							curReturnValue = ((distanceFraction < 1) ? startValue : endValue);
							returnValue = doRounding ? _Concert.Util.round(curReturnValue, roundFactor) : curReturnValue;
						}

						return returnValue;
					}, // end Discrete Calculator function

				Linear:
					function (distanceFraction, startValue, endValue, additionalProperties)
					{
						var i, valueLength, curStartValue, curCalcValue, returnValue, roundFactor, doRounding = (typeof additionalProperties.round != "undefined");
						if (doRounding)
							roundFactor = additionalProperties.round;

						if (_Concert.Util.isArray(startValue))
						{
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
							{
								curStartValue = startValue[i];
								curCalcValue = curStartValue + distanceFraction * (endValue[i] - curStartValue);
								returnValue.push(doRounding ? _Concert.Util.round(curCalcValue, roundFactor) : curCalcValue);
							}
						}
						else
						{
							curCalcValue = startValue + distanceFraction * (endValue - startValue);
							returnValue = doRounding ? _Concert.Util.round(curCalcValue, roundFactor) : curCalcValue;
						}

						return returnValue;
					}, // end Linear Calculator function

				Color:
					function (distanceFraction, startValue, endValue, additionalProperties)
					{
						var i, valueLength, curStartValue, returnValue;

						function hexColorToDecimal(hexStr)
						{
							if (hexStr.length == 1)
								hexStr += hexStr;
							return parseInt(hexStr, 16);
						} // end hexColorToDecimal()

						function interpolateColor(color1, color2, distanceFraction)
						{
							var color1Pieces, color2Pieces, calculatedValues, i, curVal1, tempVal, interpolatedValueStr;
							var hexColors1, hexColors2;
							var rgbFunctionPattern = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$|^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i;
							var hslFunctionPattern = /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$|^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([0-9.]+)\s*\)$/i;
							var hexRGBPattern = /^#([0-9a-f])([0-9a-f])([0-9a-f])$|^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
							var rgbFunctionMatch = false, hslFunctionMatch = false;

							if ((color1Pieces = rgbFunctionPattern.exec(color1)) != null)
							{
								color2Pieces = rgbFunctionPattern.exec(color2);
								rgbFunctionMatch = true;
							}
							else if ((color1Pieces = hslFunctionPattern.exec(color1)) != null)
							{
								color2Pieces = hslFunctionPattern.exec(color2);
								hslFunctionMatch = true;
							}

							if (rgbFunctionMatch || hslFunctionMatch)
							{
								calculatedValues = [];
								for (i = 1; i < 8; i++) // skip the first element, it contains the full string match
								{
									curVal1 = color1Pieces[i];
									if(typeof curVal1 != "undefined")
									{
										curVal1 = (new Number(curVal1)).valueOf();
										tempVal = curVal1 + distanceFraction * ((new Number(color2Pieces[i])).valueOf() - curVal1);
										calculatedValues.push((i < 7) ? _Concert.Util.round(tempVal, 1) : tempVal);
									}
								}

								if (rgbFunctionMatch)
									interpolatedValueStr = "rgb" + ((calculatedValues.length == 4) ? "a" : "") + "(" + calculatedValues.join() + ")";
								else
								{
									tempVal = calculatedValues[0].toString() + "," + calculatedValues[1].toString() + "%," + calculatedValues[2].toString() + "%";
									if (calculatedValues.length == 4)
										interpolatedValueStr = "hsla(" + tempVal + "," + calculatedValues[3].toString() + ")";
									else
										interpolatedValueStr = "hsl(" + tempVal + ")";
								}
							}
							else
							{
								color1Pieces = hexRGBPattern.exec(color1);
								color2Pieces = hexRGBPattern.exec(color2);
								hexColors1 = [];
								hexColors2 = [];

								for (i = 1; i < 7; i++)
								{
									tempVal = color1Pieces[i];
									if (typeof tempVal != "undefined")
										hexColors1.push(tempVal);
									tempVal = color2Pieces[i];
									if (typeof tempVal != "undefined")
										hexColors2.push(tempVal);
								}

								interpolatedValueStr = "#";
								for (i = 0; i < 3; i++)
								{
									curVal1 = hexColorToDecimal(hexColors1[i]);
									tempVal = _Concert.Util.round(curVal1 + distanceFraction * (hexColorToDecimal(hexColors2[i]) - curVal1), 1);
									interpolatedValueStr += ((tempVal < 16) ? "0" : "") + tempVal.toString(16);
								}
							} // end if/else on (rgbFunctionMatch || hslFunctionMatch)

							return interpolatedValueStr;
						} // end interpolateColor()

						if (_Concert.Util.isArray(startValue))
						{
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
								returnValue.push(interpolateColor(startValue[i], endValue[i], distanceFraction));
						}
						else
							returnValue = interpolateColor(startValue, endValue, distanceFraction);
						
						return returnValue;
					}, // end Color Calculator function

				Rotational:
					function (distanceFraction, startValue, endValue, additionalProperties)
					{
						var roundFactor, doRounding = (typeof additionalProperties.round != "undefined");
						if (doRounding)
							roundFactor = additionalProperties.round;
						var centerX = additionalProperties.center[0];
						var centerY = additionalProperties.center[1];
						var offsetX = additionalProperties.offset[0];
						var offsetY = additionalProperties.offset[1];
						var startRadius = startValue[0], endRadius = endValue[0];
						var startAngle = startValue[1], endAngle = endValue[1];
						var newRadius = startRadius + distanceFraction * (endRadius - startRadius);
						var newAngle = startAngle + distanceFraction * (endAngle - startAngle);
						var resultX = centerX + newRadius * Math.cos(newAngle) + offsetX;
						var resultY = centerY + newRadius * Math.sin(newAngle) + offsetY;
						if (doRounding)
						{
							resultX = _Concert.Util.round(resultX, roundFactor);
							resultY = _Concert.Util.round(resultY, roundFactor);
						}
						return [resultX, resultY];
					} // end Rotational Calculator function
			}, // end Calculator singleton / namespace definition


		// Pre-defined functions for calculating the effective distance along a transformation time path.
		EasingFunctions:
			{
				ConstantRate:
					function (startTime, endTime, currentTime)
					{
						if (currentTime >= endTime)
							return 1;
						else if (currentTime < startTime)
							return 0;
						else
							return ((currentTime - startTime) / (endTime - startTime));
					},

				QuadIn:
					function (startTime, endTime, currentTime)
					{
						if (currentTime >= endTime)
							return 1;
						else if (currentTime < startTime)
							return 0;
						else
							return Math.pow((currentTime - startTime) / (endTime - startTime), 2);
					},

				QuadOut:
					function (startTime, endTime, currentTime)
					{
						if (currentTime >= endTime)
							return 1;
						else if (currentTime < startTime)
							return 0;
						else
							return (1 - Math.pow(1 - ((currentTime - startTime) / (endTime - startTime)), 2));
					},

				QuadInOut:
					function (startTime, endTime, currentTime)
					{
						var halfway;

						if (currentTime >= endTime)
							return 1;
						else if (currentTime < startTime)
							return 0;
						else
						{
							halfway = (startTime + endTime) / 2;
							if (currentTime < halfway)
								return (Math.pow((currentTime - startTime) / (halfway - startTime), 2) / 2);
							else
								return (.5 + (1 - Math.pow(1 - (currentTime - halfway) / (endTime - halfway), 2)) / 2);
						}
					},

				Smoothstep:
					function (startTime, endTime, currentTime)
					{
						var linearPosition;

						if (currentTime >= endTime)
							return 1;
						else if (currentTime < startTime)
							return 0;
						else
						{
							linearPosition = ((currentTime - startTime) / (endTime - startTime));
							return (linearPosition * linearPosition * (3 - 2 * linearPosition));
						}
					}
			}, // end EasingFunctions singleton / namespace definition


		Repeating:
			{
				None:
					function (sequenceStart, sequenceEnd, unadjustedTime)
					{
						return ((unadjustedTime < sequenceStart) ? { adjustedTime: sequenceStart, hitFinalBoundary: true } : { adjustedTime: sequenceEnd, hitFinalBoundary: true });
					},

				Loop:
					function (loopbackCount)
					{
						var infinite = ((typeof loopbackCount) == "undefined" || loopbackCount == null);

						function loopFunction (sequenceStart, sequenceEnd, unadjustedTime)
						{
							var distanceOut, duration = sequenceEnd - sequenceStart;

							if (unadjustedTime < sequenceStart)
							{
								distanceOut = sequenceStart - unadjustedTime;

								if (infinite || (distanceOut / duration) <= loopbackCount)
									return { adjustedTime: (sequenceEnd - (distanceOut % duration)), hitFinalBoundary: false };
								else
									return { adjustedTime: sequenceStart, hitFinalBoundary: true };
							}
							else
							{
								distanceOut = unadjustedTime - sequenceEnd;

								if (infinite || (distanceOut / duration) <= loopbackCount)
									return { adjustedTime: (sequenceStart + (distanceOut % duration)), hitFinalBoundary: false };
								else
									return { adjustedTime: sequenceEnd, hitFinalBoundary: true };
							}
						} // end inner loopFunction()

						return loopFunction;
					},

				Bounce:
					function (bounceCount)
					{
						var infinite = ((typeof bounceCount) == "undefined" || bounceCount == null);

						function bounceFunction(sequenceStart, sequenceEnd, unadjustedTime)
						{
							var distanceOut, bounceNum, curBounceOffset, duration = sequenceEnd - sequenceStart;

							if (unadjustedTime < sequenceStart)
							{
								distanceOut = sequenceStart - unadjustedTime;
								bounceNum = Math.floor(distanceOut / duration) + 1;

								if (infinite || bounceNum <= bounceCount)
								{
									curBounceOffset = distanceOut % duration;
									return { adjustedTime: (((bounceNum % 2) == 0) ? (sequenceEnd - curBounceOffset) : curBounceOffset), hitFinalBoundary: false };
								}
								else
									return { adjustedTime: (((bounceCount % 2) == 0) ? sequenceStart : sequenceEnd), hitFinalBoundary: true };
							}
							else
							{
								distanceOut = unadjustedTime - sequenceEnd;
								bounceNum = Math.floor(distanceOut / duration) + 1;

								if (infinite || bounceNum <= bounceCount)
								{
									curBounceOffset = distanceOut % duration;
									return { adjustedTime: (((bounceNum % 2) == 0) ? curBounceOffset : sequenceEnd - curBounceOffset), hitFinalBoundary: false };
								}
								else
									return { adjustedTime: (((bounceCount % 2) == 0) ? sequenceEnd : sequenceStart), hitFinalBoundary: true };
							}
						} // end inner bounceFunction()

						return bounceFunction;
					}
			},

		Pollers:
			{
				Auto:
					BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
					{
						function AutoConstructor()
						{
							// Initialize object:
							BaseConstructor.call(this);
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							// Protected data members
							thisProtected.frameRequestID = null;

							// Public methods
							thisPublic.run = __run;
							thisPublic.stop = __stop;
						} // end AutoConstructor()


						function __run(callbackFunction)
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							var doNextFrame;

							if (thisProtected.frameRequestID == null)
							{
								doNextFrame =
									function ()
									{
										thisProtected.frameRequestID = window.requestAnimationFrame(doNextFrame);
										callbackFunction();
									};
								doNextFrame();
							}
						} // end __run()


						function __stop()
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							if (thisProtected.frameRequestID != null)
							{
								window.cancelAnimationFrame(thisProtected.frameRequestID);
								thisProtected.frameRequestID = null;
							}
						} // end __stop()


						return AutoConstructor;
					}), // end Auto definition

				FixedInterval:
					BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
					{
						function FixedIntervalConstructor(interval)
						{
							// Initialize object:
							BaseConstructor.call(this);
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							// Protected data members
							thisProtected.interval = interval;
							thisProtected.intervalID = null;

							// Public methods
							thisPublic.run = __run;
							thisPublic.stop = __stop;
						} // end FixedIntervalConstructor()


						function __run(callbackFunction)
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							if (thisProtected.intervalID == null)
								thisProtected.intervalID = setInterval(callbackFunction, thisProtected.interval);
						} // end __run()


						function __stop()
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							if (thisProtected.intervalID != null)
							{
								clearInterval(thisProtected.intervalID);
								thisProtected.intervalID = null;
							}
						} // end __stop()


						return FixedIntervalConstructor;
					}) // end FixedInterval definition
			}, // end Pollers singleton / namespace definition


		Transformation:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function TransformationConstructor(properties)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var propertyName;

					// Initialize data members
					thisProtected.additionalProperties = {};
					for (propertyName in properties)
					{
						if (propertyName == "target"
						    || propertyName == "feature"
						    || propertyName == "applicator"
						    || propertyName == "calculator"
						    || propertyName == "v1"
						    || propertyName == "v2"
						    || propertyName == "unit"
						    || propertyName == "easing")
						{
							thisProtected[propertyName] = properties[propertyName];
						}
						else if (propertyName == "t1" || propertyName == "t2")
							thisPublic[propertyName] = properties[propertyName]; // Making these public rather than requiring accessor methods improves indexing time noticably for large sequences.
						else if (properties.hasOwnProperty(propertyName))
							thisProtected.additionalProperties[propertyName] = properties[propertyName];
					}
					thisProtected.lastAppliedValue = null;

					// Public methods
					thisPublic.seek = __seek;
				} // end TransformationConstructor()


				function __seek(time, useSoleControlOptimization)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var round, roundTenPower, newValue;

					newValue = thisProtected.calculator(thisProtected.easing(thisPublic.t1, thisPublic.t2, time),
					                                    thisProtected.v1, thisProtected.v2,
														thisProtected.additionalProperties);

					thisProtected.lastAppliedValue = thisProtected.applicator(thisProtected.target, thisProtected.feature,
					                                                          { value: newValue, unit: thisProtected.unit },
																			  thisProtected.lastAppliedValue,
					                                                          !useSoleControlOptimization);
				} // end __seek()


				return TransformationConstructor;
			}), // end Transformation definition


		FeatureSequence:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function FeatureSequenceConstructor(objectTarget, featureTarget)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Protected data members
					thisProtected.objectTarget = objectTarget;
					thisProtected.featureTarget = featureTarget;
					thisProtected.transformations = [];
					thisProtected.transformationIndexBySegment = null;

					// Public methods
					thisPublic.addTransformation = __addTransformation;
					thisPublic.getFeatureTarget = __getFeatureTarget;
					thisPublic.indexTransformations = __indexTransformations;
					thisPublic.seek = __seek;
				} // end FeatureSequenceConstructor()


				function __addTransformation(newTransformation)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.transformations.push(newTransformation);
				} // end __addTransformation()


				function __getFeatureTarget()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.featureTarget;
				} // end __getFeatureTarget()


				function __indexTransformations(overallSequenceSegments)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var transformations, beforeLastTransformation;
					var numSegments, currentSegmentNumber, currentTransformation, nextTransformation, nextTransformationStartTime, currentSegmentStartTime;
					var finalTransformationNumber, currentTransformationNumber;
					var transformationIndexBySegment;

					transformations = thisProtected.transformations;
					finalTransformationNumber = transformations.length - 1;
					if (finalTransformationNumber < 0)
						return;

					numSegments = overallSequenceSegments.length;

					transformations.sort(
						function (a, b)
						{
							var aStartTime = a.t1;
							var bStartTime = b.t1;
							return ((aStartTime == bStartTime) ? 0 : ((aStartTime < bStartTime) ? -1 : 1));
						});

					transformationIndexBySegment = thisProtected.transformationIndexBySegment = [];

					currentSegmentNumber = 0;
					currentSegmentStartTime = overallSequenceSegments[0].startTime;
					currentTransformationNumber = 0;
					currentTransformation = transformations[0];
					if (finalTransformationNumber > 0)
					{
						nextTransformation = transformations[1];
						nextTransformationStartTime = nextTransformation.t1;
						beforeLastTransformation = true;
					}
					else
						beforeLastTransformation = false;
					while (currentSegmentNumber < numSegments)
					{
						if (beforeLastTransformation && currentSegmentStartTime >= nextTransformationStartTime)
						{
							currentTransformationNumber++;
							currentTransformation = nextTransformation;
							if (currentTransformationNumber < finalTransformationNumber)
							{
								nextTransformation = transformations[currentTransformationNumber + 1];
								nextTransformationStartTime = nextTransformation.t1;
							}
							else
								beforeLastTransformation = false;
						}
						else
						{
							transformationIndexBySegment.push(currentTransformation);
							currentSegmentNumber++;
							if (currentSegmentNumber < numSegments)
								currentSegmentStartTime = overallSequenceSegments[currentSegmentNumber].startTime;
							else
								break;
						}
					}
				} // end __indexTransformations()


				function __seek(sequenceSegmentNumber, time, useSoleControlOptimization)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.transformationIndexBySegment[sequenceSegmentNumber].seek(time, useSoleControlOptimization);
				} // end _seek()


				return FeatureSequenceConstructor;
			}), // end FeatureSequence definition


		TargetSequence:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function TargetSequenceConstructor(objectTarget)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Protected data members
					thisProtected.objectTarget = objectTarget;
					thisProtected.featureSequences = [];

					// Public methods
					thisPublic.addFeatureSequence = __addFeatureSequence;
					thisPublic.findFeatureSequenceByFeature = __findFeatureSequenceByFeature;
					thisPublic.getObjectTarget = __getObjectTarget;
					thisPublic.indexTransformations = __indexTransformations;
					thisPublic.seek = __seek;
				} // end TargetSequenceConstructor()


				function __addFeatureSequence(featureSequence)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.featureSequences.push(featureSequence);
				} // end __addFeatureSequence()


				function __findFeatureSequenceByFeature(feature)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, numFeatureSequences, curFeatureSequence, curFeature,
						featureSequences = thisProtected.featureSequences,
						featureIsArray = _Concert.Util.isArray(feature);

					for (i = 0, numFeatureSequences = featureSequences.length; i < numFeatureSequences; i++)
					{
						curFeatureSequence = featureSequences[i];
						curFeature = curFeatureSequence.getFeatureTarget();
						if (curFeature === feature)
							return curFeatureSequence;
						else if (featureIsArray && _Concert.Util.isArray(curFeature) && _Concert.Util.arraysShallowlyEqual(curFeature, feature))
							return curFeatureSequence;
					}

					return null;
				} // end __findFeatureSequenceByFeature()


				function __getObjectTarget()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.objectTarget;
				} // end __getObjectTarget()


				function __indexTransformations(overallSequenceSegments)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, numFeatureSequences;
					var featureSequences = thisProtected.featureSequences;
					for (i = 0, numFeatureSequences = featureSequences.length; i < numFeatureSequences; i++)
						featureSequences[i].indexTransformations(overallSequenceSegments);
				} // end __indexTransformations()


				function __seek(sequenceSegmentNumber, time, useSoleControlOptimization)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var numFeatureSequences, i, featureSequences = thisProtected.featureSequences;
					for (i = 0, numFeatureSequences = featureSequences.length; i < numFeatureSequences; i++)
						featureSequences[i].seek(sequenceSegmentNumber, time, useSoleControlOptimization);
				} // end __seek()


				return TargetSequenceConstructor;
			}), // end TargetSequence definition


		TimelineSegment:
			function TimelineSegmentConstructor(startTime, endTime)
			{
				this.startTime = startTime;
				this.endTime = endTime;
			}, // end TimelineSegment definition


		Sequence:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				function SequenceConstructor(transformationSet)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Protected data members
					thisProtected.targetSequences = [];
					thisProtected.timelineSegments = [];
					thisProtected.lastUsedTimelineSegmentNumber = 0;
					thisProtected.allTransformations = [];
					thisProtected.indexed = false;
					thisProtected.running = false;
					thisProtected.currentTime = null;
					thisProtected.unadjustedTime = null;
					thisProtected.sequenceStartTime = null;
					thisProtected.sequenceEndTime = null;
					thisProtected.poller = null;
					thisProtected.synchronizer = null;

					thisProtected.defaults =
						{
							unit: null,
							applicator: Concert.Applicators.Property,
							easing: Concert.EasingFunctions.ConstantRate,
							calculator: Concert.Calculators.Linear,
						};

					thisProtected.synchronizeTo = null;
					thisProtected.speed = 1;
					thisProtected.absoluteSync = false;
					thisProtected.timeOffset = 0;
					thisProtected.pollingInterval = 0;
					thisProtected.after = _Concert.Repeating.None;
					thisProtected.before = _Concert.Repeating.None;
					thisProtected.autoStopAtEnd = true;
					thisProtected.onAutoStop = null;

					// Protected methods
					thisProtected.findSequenceSegmentNumberInRange = __findSequenceSegmentNumberInRange;
					thisProtected.findSequenceSegmentNumberByTime = __findSequenceSegmentNumberByTime;

					// Public methods
					thisPublic.addTransformations = __addTransformations;
					thisPublic.clone = __clone;
					thisPublic.retarget = __retarget;
					thisPublic.index = __index;
					thisPublic.getCurrentTime = __getCurrentTime;
					thisPublic.getEndTime = __getEndTime;
					thisPublic.getStartTime = __getStartTime;
					thisPublic.isRunning = __isRunning;
					thisPublic.run = __run;
					thisPublic.begin = __begin;
					thisPublic.follow = __follow;
					thisPublic.syncTo = __syncTo;
					thisPublic.seek = __seek;
					thisPublic.setDefaults = __setDefaults;
					thisPublic.stop = __stop;

					// Add transformations if any were specified
					if (transformationSet)
						thisPublic.addTransformations(transformationSet);
				} // end SequenceConstructor()


				function _getParamValue(parameters, paramName, defaultValue)
				{
					return ((parameters && (typeof parameters[paramName] != "undefined")) ? parameters[paramName] : defaultValue);
				} // end _getParamValue


				function _getCombinedParams(initialParams, overrides)
				{
					var paramName, combined = {};

					if (initialParams)
					{
						for (paramName in initialParams)
						{
							if (initialParams.hasOwnProperty(paramName))
								combined[paramName] = initialParams[paramName];
						}
					}

					if (overrides)
					{
						for (paramName in overrides)
						{
							if (overrides.hasOwnProperty(paramName))
								combined[paramName] = overrides[paramName];
						}
					}

					return combined;
				} // end _overrideParams()


				function __findSequenceSegmentNumberInRange(time, rangeStart, rangeEnd)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var currentSegmentNumber, currentSegment, currentTimeMatchType;

					do
					{
						currentSegmentNumber = Math.floor((rangeStart + rangeEnd) / 2);
						currentSegment = thisProtected.timelineSegments[currentSegmentNumber];

						if (time < currentSegment.startTime)
						{
							rangeEnd = currentSegmentNumber - 1;
							currentTimeMatchType = -1;
						}
						else
						{
							if (time >= currentSegment.endTime)
							{
								rangeStart = currentSegmentNumber + 1;
								currentTimeMatchType = 1;
							}
							else
							{
								currentTimeMatchType = 0;
								break;
							}
						}
					} while (rangeStart < rangeEnd)

					return { segmentNumber: currentSegmentNumber, timeMatchType: currentTimeMatchType };
				} // end __findSequenceSegmentNumberInRange()


				function __findSequenceSegmentNumberByTime(time)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var match, currentSegmentNumber, currentSegment, currentSegmentEnd;

					var timelineSegments = thisProtected.timelineSegments;
					var numSegments = timelineSegments.length;

					if (numSegments > 0)
					{
						currentSegmentNumber = thisProtected.lastUsedTimelineSegmentNumber;
						currentSegment = timelineSegments[currentSegmentNumber];
						currentSegmentEnd = currentSegment.endTime;

						if (time >= currentSegment.startTime)
						{
							if (time < currentSegmentEnd)
								match = { segmentNumber: currentSegmentNumber, timeMatchType: 0 };
							else if (currentSegmentNumber == numSegments - 1)
								match = { segmentNumber: currentSegmentNumber, timeMatchType: 1 };
							else
							{
								currentSegmentNumber++;
								currentSegment = timelineSegments[currentSegmentNumber];
								currentSegmentEnd = currentSegment.endTime;

								if (time < currentSegmentEnd)
									match = { segmentNumber: currentSegmentNumber, timeMatchType: 0 };
								else if (currentSegmentNumber == numSegments - 1)
									match = { segmentNumber: currentSegmentNumber, timeMatchType: 1 };
								else
									match = thisProtected.findSequenceSegmentNumberInRange(time, currentSegmentNumber + 1, numSegments - 1);
							}
						}
						else
						{
							if (currentSegmentNumber == 0)
								match = { segmentNumber: 0, timeMatchType: -1 };
							else
								match = thisProtected.findSequenceSegmentNumberInRange(time, 0, currentSegmentNumber - 1);
						}
						thisProtected.lastUsedTimelineSegmentNumber = match.segmentNumber;
					}
					else
						match = null;

					return match;
				} // end __findSequenceSegmentNumberByTime()


				function __setDefaults(newDefaults)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var propertyName, defaults = thisProtected.defaults;

					for (propertyName in newDefaults)
					{
						if (newDefaults.hasOwnProperty(propertyName))
							defaults[propertyName] = newDefaults[propertyName];
					}
				} // end __setDefaults()


				function __addTransformations(transformationSet)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, j, k, numTransformationGroups, curTransformationGroup,
						curGroupObjectTarget, curGroupFeature, curGroupUnit, curGroupCalculator, curGroupEasing, curGroupApplicator, curGroupKeyFrames, curGroupSegments,
						numSegments, curSegment, propertyName, curSegmentT1, curSegmentT2, curSegmentV1, curSegmentV2, curSegmentUnit, curSegmentCalculator, curSegmentEasing,
						existingTargetSequences = thisProtected.targetSequences, numExistingTargetSequences, curTargetSequence = null, tempTargetSequence,
						newTransformationProperties, newTransformation, curFeatureSequence, defaults = thisProtected.defaults, times, values, numKeyFrames,
						curKeyFrameTime, curKeyFrameValue, lastKeyFrameTime, lastKeyFrameValue, createSegment;

					thisProtected.indexed = false;

					if (!(_Concert.Util.isArray(transformationSet)))
						transformationSet = [transformationSet];

					for (i = 0, numTransformationGroups = transformationSet.length; i < numTransformationGroups; i++)
					{
						curTransformationGroup = transformationSet[i];

						curGroupObjectTarget = curTransformationGroup.target;
						curTargetSequence = null;
						for (j = 0, numExistingTargetSequences = existingTargetSequences.length; j < numExistingTargetSequences; j++)
						{
							tempTargetSequence = existingTargetSequences[j];
							if (tempTargetSequence.getObjectTarget() === curGroupObjectTarget)
							{
								curTargetSequence = tempTargetSequence;
								break;
							}
						}
						if (curTargetSequence == null)
						{
							curTargetSequence = new _Concert.TargetSequence(curGroupObjectTarget);
							existingTargetSequences.push(curTargetSequence);
						}

						curGroupFeature = curTransformationGroup.feature;
						curGroupApplicator = curTransformationGroup.applicator;
						if (typeof curGroupApplicator == "undefined")
							curGroupApplicator = defaults.applicator;
						curGroupUnit = curTransformationGroup.unit;
						if (typeof curGroupUnit == "undefined")
							curGroupUnit = defaults.unit;
						curGroupCalculator = curTransformationGroup.calculator;
						if (typeof curGroupCalculator == "undefined")
							curGroupCalculator = defaults.calculator;
						curGroupEasing = curTransformationGroup.easing;
						if (typeof curGroupEasing == "undefined")
							curGroupEasing = defaults.easing;

						curFeatureSequence = curTargetSequence.findFeatureSequenceByFeature(curGroupFeature);
						if (curFeatureSequence == null)
						{
							curFeatureSequence = new _Concert.FeatureSequence(curGroupObjectTarget, curGroupFeature);
							curTargetSequence.addFeatureSequence(curFeatureSequence);
						}

						curGroupKeyFrames = curTransformationGroup.keyframes;
						if (typeof curGroupKeyFrames != "undefined")
						{
							times = curGroupKeyFrames.times;
							values = curGroupKeyFrames.values;
							
							lastKeyFrameTime = null;
							lastKeyFrameValue = null;
							for (j = 0, numKeyFrames = times.length; j < numKeyFrames; j++)
							{
								curKeyFrameTime = times[j];
								curKeyFrameValue = values[j];

								if (lastKeyFrameTime == null)
								{
									lastKeyFrameTime = curKeyFrameTime;
									lastKeyFrameValue = curKeyFrameValue;

									createSegment = ((curKeyFrameTime != null) && (j == numKeyFrames - 1)); // If this is the last keyframe, preceded by a null keyframe, create a segment out of just this one keyframe.
								}
								else if (curKeyFrameTime == null)
								{
									lastKeyFrameTime = lastKeyFrameValue = null;
									createSegment = false;
								}
								else
									createSegment = true;

								if (createSegment)
								{
									newTransformationProperties =
										{
											target: curGroupObjectTarget,
											feature: curGroupFeature,
											applicator: curGroupApplicator,
											unit: curGroupUnit,
											calculator: curGroupCalculator,
											easing: curGroupEasing,
											t1: lastKeyFrameTime,
											t2: curKeyFrameTime,
											v1: lastKeyFrameValue,
											v2: curKeyFrameValue
										};
									newTransformation = new _Concert.Transformation(newTransformationProperties);
									thisProtected.allTransformations.push(newTransformation);
									curFeatureSequence.addTransformation(newTransformation);

									lastKeyFrameTime = curKeyFrameTime;
									lastKeyFrameValue = curKeyFrameValue;
								} // end if (createSegment)
							} // end for loop iterating through keyframes
						} // end if (typeof curGroupKeyFrames != "undefined")
						else
						{
							curGroupSegments = curTransformationGroup.segments;
							if(!(_Concert.Util.isArray(curGroupSegments)))
								curGroupSegments = [curGroupSegments];

							for (j = 0, numSegments = curGroupSegments.length; j < numSegments; j++)
							{
								curSegment = curGroupSegments[j];

								newTransformationProperties =
									{
										target: curGroupObjectTarget,
										feature: curGroupFeature,
										applicator: curGroupApplicator
									};

								for (propertyName in curSegment)
								{
									if (curSegment.hasOwnProperty(propertyName))
										newTransformationProperties[propertyName] = curSegment[propertyName];
								}
								if (typeof newTransformationProperties.unit == "undefined")
									newTransformationProperties.unit = curGroupUnit;
								if (typeof newTransformationProperties.calculator == "undefined")
									newTransformationProperties.calculator = curGroupCalculator;
								if (typeof newTransformationProperties.easing == "undefined")
									newTransformationProperties.easing = curGroupEasing;

								newTransformation = new _Concert.Transformation(newTransformationProperties);
								thisProtected.allTransformations.push(newTransformation);
								curFeatureSequence.addTransformation(newTransformation);
							} // end loop through segments
						} // end if/else on (typeof curGroupKeyFrames != "undefined")
					} // end for loop iterating through transformation groups
				} // end __addTransformations()


				function __retarget(targetLookupFunction)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// ADDCODE
				} // end _retarget()


				function __clone(targetLookupFunction)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// ADDCODE
				} // end __clone()


				function __index()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var allTransformations = thisProtected.allTransformations;
					var timelineSegments, targetSequences;
					var i, lastBreakPoint, currentBreakPoint;
					var numTransformations, numTargetSequences, numTotalBreakPoints, finalDistinctBreakPoint;
					var allBreakPoints = [], distinctBreakPoints = [];

					for (i = 0, numTransformations = allTransformations.length; i < numTransformations; i++)
					{
						allBreakPoints.push(allTransformations[i].t1);
						allBreakPoints.push(allTransformations[i].t2);
					}

					distinctBreakPoints = _Concert.Util.deduplicateAndSort(allBreakPoints);

					finalDistinctBreakPoint = distinctBreakPoints.length - 1
					timelineSegments = thisProtected.timelineSegments = new Array(finalDistinctBreakPoint);
					for (i = 0; i < finalDistinctBreakPoint; i++)
						timelineSegments[i] = new _Concert.TimelineSegment(distinctBreakPoints[i], distinctBreakPoints[i + 1]);

					targetSequences = thisProtected.targetSequences;
					for (i = 0, numTargetSequences = targetSequences.length; i < numTargetSequences; i++)
						targetSequences[i].indexTransformations(timelineSegments);

					thisProtected.sequenceStartTime = ((!timelineSegments || timelineSegments.length < 1) ? null : timelineSegments[0].startTime);
					thisProtected.sequenceEndTime = ((!timelineSegments || timelineSegments.length < 1) ? null : timelineSegments[timelineSegments.length - 1].endTime);

					thisProtected.indexed = true;
				} // end __index()


				function __getCurrentTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.currentTime;
				} // end _getCurrentTime()


				function __getEndTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					if (!(thisProtected.indexed))
						thisPublic.index();

					return thisProtected.sequenceEndTime;
				} // end __getEndTime()


				function __getStartTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					if (!(thisProtected.indexed))
						thisPublic.index();

					return thisProtected.sequenceStartTime;
				} // end __getStartTime()


				function __isRunning()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.running;
				} // end __isRunning()


				function __run(parameters)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var synchronizeTo, speed, timeOffset, initialSeek, pollingInterval, synchronizer, initialSyncSourcePoint;

					if (thisProtected.running)
						thisPublic.stop();

					if (!thisProtected.indexed)
						thisPublic.index();

					initialSeek = _getParamValue(parameters, "initialSeek", null);
					if (initialSeek != null)
						thisPublic.seek(initialSeek);

					thisProtected.speed = speed = _getParamValue(parameters, "speed", thisProtected.speed);
					thisProtected.after = _getParamValue(parameters, "after", thisProtected.after);
					thisProtected.before = _getParamValue(parameters, "before", thisProtected.before);
					thisProtected.autoStopAtEnd = _getParamValue(parameters, "autoStopAtEnd", thisProtected.autoStopAtEnd);
					thisProtected.onAutoStop = _getParamValue(parameters, "onAutoStop", thisProtected.onAutoStop);

					thisProtected.pollingInterval = pollingInterval = _getParamValue(parameters, "pollingInterval", thisProtected.pollingInterval);
					thisProtected.poller = (pollingInterval < 1) ? (new _Concert.Pollers.Auto()) : (new _Concert.Pollers.FixedInterval(pollingInterval));

					synchronizeTo = _getParamValue(parameters, "synchronizeTo", thisProtected.synchronizeTo);
					if (synchronizeTo == null)
						synchronizer = function () { return (new Date()).getTime(); };
					else
						synchronizer = ((typeof synchronizeTo) == "function") ? synchronizeTo : (function () { return 1000 * synchronizeTo.currentTime; });
					thisProtected.synchronizer = synchronizer;
					
					initialSyncSourcePoint = synchronizer();
					timeOffset = _getParamValue(parameters, "timeOffset", null);
					if (timeOffset == null)
						timeOffset = (thisProtected.unadjustedTime != null) ? (thisProtected.unadjustedTime - initialSyncSourcePoint) : (thisProtected.sequenceStartTime - initialSyncSourcePoint);

					thisProtected.running = true;

					thisProtected.poller.run(
						function ()
						{
							var newUnadjustedTime = initialSyncSourcePoint + speed * (synchronizer() - initialSyncSourcePoint) + timeOffset;
							thisPublic.seek(newUnadjustedTime);
						});
				} // end __run()


				function __begin(parameters)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisPublic.run(_getCombinedParams({ synchronizeTo: null, initialSeek: 0, timeOffset: null, autoStopAtEnd: true }, parameters));
				} // end __begin()


				function __follow(syncSource, parameters)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisPublic.run(_getCombinedParams({ synchronizeTo: syncSource, initialSeek: null, timeOffset: null }, parameters));
				} // end __follow()


				function __syncTo(syncSource, parameters)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisPublic.run(_getCombinedParams({ synchronizeTo: syncSource, initialSeek: null, timeOffset: 0, autoStopAtEnd: false }, parameters));
				} // end __syncTo()


				function __seek(time, useSoleControlOptimization)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, segmentMatch, segmentNumber, sequenceStart, sequenceEnd, adjustedTimeContainer, adjustedTime;
					var hitFinalBoundary = false, returnVal = null;
					var targetSequences = thisProtected.targetSequences;
					var numTargetSequences = targetSequences.length;

					if (!(thisProtected.indexed))
						thisPublic.index();

					sequenceStart = thisProtected.sequenceStartTime;
					sequenceEnd = thisProtected.sequenceEndTime;

					if (time < sequenceStart)
					{
						adjustedTimeContainer = thisProtected.before(sequenceStart, sequenceEnd, time);
						adjustedTime = adjustedTimeContainer.adjustedTime;
						hitFinalBoundary = adjustedTimeContainer.hitFinalBoundary;
					}
					else if (time > sequenceEnd)
					{
						adjustedTimeContainer = thisProtected.after(sequenceStart, sequenceEnd, time);
						adjustedTime = adjustedTimeContainer.adjustedTime;
						hitFinalBoundary = adjustedTimeContainer.hitFinalBoundary;
					}
					else
						adjustedTime = time;

					thisProtected.currentTime = adjustedTime;
					thisProtected.unadjustedTime = time;

					segmentMatch = thisProtected.findSequenceSegmentNumberByTime(adjustedTime);
					if (segmentMatch != null)
					{
						segmentNumber = segmentMatch.segmentNumber;
						for (i = 0; i < numTargetSequences; i++)
							targetSequences[i].seek(segmentNumber, adjustedTime, useSoleControlOptimization);
						returnVal = segmentMatch.timeMatchType;
					}

					if (hitFinalBoundary && thisProtected.running && thisProtected.autoStopAtEnd)
					{
						thisPublic.stop();
						if (thisProtected.onAutoStop)
							thisProtected.onAutoStop();
					}

					return returnVal;
				} // end __seek()


				function __stop()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.running = false;
					if (thisProtected.poller)
					{
						thisProtected.poller.stop();
						thisProtected.poller = null;
					}
				} // end __stop()


				return SequenceConstructor;
			}), // end Sequence definition


		// revertNameSpace: Can be used to avoid namespace collision problems.
		// Sets the global variable Concert back to what it was before this component assigned a new value to it.
		// Use of this would essentially be to run this definition script (e.g., include it in via script element on a web page),
		// then immediately capture the object assigned to Concert in some other, non-conflicting variable for
		// actual use, and then call revertNameSpace() to put back Concert to whatever value it had before.
		revertNameSpace:
			function ()
			{
				Concert = previousNameSpaceValue;
			} // end revertNameSpace()

	}; // end _Concert


	var _Concert_PublicInterface =
		{
			Applicators: _Concert.Applicators,
			Calculators: _Concert.Calculators,
			EasingFunctions: _Concert.EasingFunctions,
			Repeating: _Concert.Repeating,

			Sequence: _Concert.Sequence,

			revertNameSpace: _Concert.revertNameSpace
		};


	return _Concert_PublicInterface;
})(); // end Concert namespace
