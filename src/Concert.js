/**
 * @file Concert.js: Easy synchronized animation with JavaScript.
 * @name Concert.js
 * @version 1.0.1
 * @author Trajan McGill <code@trajanmcgill.com>
 */

/* @ifndef ES_MODULE */
(function(globalContext)
{
"use strict";
/* @endif */

var setGlobal = false, previousNameSpaceValue; // Used for tracking if we replaced a global object and restoring it if needed.

/* @ifndef ES_MODULE */
// Set up Concert object as a module, if possible; otherwise as a global object.
if (typeof define === "function" && typeof define.amd === "object")
	define(ConcertFactory); // In an AMD module context; set this up as such.
else if (typeof module === "object" && typeof exports === "object")
	module.exports = ConcertFactory(); // In a CommonJS module context; set this up as such.
else
{
	// Modules not in use. Fall back to creating a global Concert object.

	// Save any prior value of the global variable Concert, so the
	// user can revert to it with revertNameSpace() if there is a collision.
	setGlobal = true;
	previousNameSpaceValue = globalContext.Concert;

	// Create the global Concert object.
	globalContext.Concert = ConcertFactory();
}
// =============================================================================


function ConcertFactory()
{
	/* @endif */
	var getNowTime = Date.now;

	var BaseObject = (function(){var b;function C(){var c=this;c.thisPublic=this;var d={thisPublic:c};c.___accessProtectedMembers=function(){b = d;};}function g(){this.___accessProtectedMembers();return b;}function B(){}C.extend=function(h){var c=h(g, this);B.prototype=this.prototype;c.prototype=new B();c.prototype.constructor=c;c.extend=this.extend;return c;};return C;})();

	/** @namespace Concert */
	var _Concert =
	{
		nextSequenceID: 0,

		// "Constants", things worth gathering together to avoid using magic numbers throughout the code.
		Definitions:
			{
				FallbackAutoPollerInterval: 16,

				IterationRoundTimeHalfBound: 50,

				StartingIterationsPerAsynchProcessingRound:
					{
						buildBreakPointList: 1,
						consolidateDistinctValues: 1,
						buildSortedArray: 1,
						buildDistinctSegmentList: 1,
						indexTargetSequences: 1
					}
			}, // end Definitions object definition


		// Some utility functions for use throughout.
		Util:
			{
				applyCalculatorModifiers: function(originalValue, calculatorModifiers)
				{
					var doMultiply, multiplicationFactor, doModulo, moduloFactor, doRound, roundFactor, addOffset, offset,
						returnValue = originalValue;

					// Only bother taking the time to check for individual modifiers and do the corresponding calculations
					// if a calculatorModifiers object exists in the first place. If not, we'll just return the unmodified original value.
					if (typeof calculatorModifiers === "object")
					{
						multiplicationFactor = calculatorModifiers.multiply;
						doMultiply = (typeof multiplicationFactor === "number" || multiplicationFactor instanceof Number);

						moduloFactor = calculatorModifiers.modulo;
						doModulo = (typeof moduloFactor === "number" || moduloFactor instanceof Number);

						roundFactor = calculatorModifiers.round;
						doRound = (typeof roundFactor === "number" || roundFactor instanceof Number);

						offset = calculatorModifiers.offset;
						addOffset = (typeof offset === "number" || offset instanceof Number);

						if (doMultiply)
							returnValue *= multiplicationFactor;
						if (doModulo)
							returnValue %= moduloFactor;
						if (doRound)
							returnValue = roundFactor * Math.round(returnValue / roundFactor);
						if (addOffset)
							returnValue += offset;
					}

					return returnValue;
				}, // end applyCalculatorModifiers()


				arraysShallowlyEqual: function (array1, array2)
				{
					var i, arrayLength = array1.length;

					if (array2.length !== arrayLength)
						return false;

					for (i = 0; i < arrayLength; i++)
					{
						if (array1[i] !== array2[i])
							return false;
					}

					return true;
				}, // end arraysShallowlyEqual()


				coalesceUndefined: function (item1, item2)
				{
					return (typeof item1 !== "undefined") ? item1 : item2;
				}, // end coalesceUndefined()


				correctFeatureNames: function (featureNames, applicator)
				{
					function camelizeFeatureName(fullMatch, captured) { return captured.toUpperCase(); }

					var i, correctedFeatureNames = [];

					if (applicator !== _Concert.Applicators.Style)
						return featureNames;

					for (i = 0; i < featureNames.length; i++)
						correctedFeatureNames.push(featureNames[i].replace(/^-ms/, "ms").replace(/-(\w)/g, camelizeFeatureName));

					return correctedFeatureNames;
				}, // end correctFeatureNames()


				isArray: function (testVar)
				{
					return ((typeof testVar === "object") && (Object.prototype.toString.call(testVar) === "[object Array]"));
				}, // end isArray()


				loadObjectData: function (newPublicData, newProtectedData, publicContext, protectedContext)
				{
					var propertyName;

					for (propertyName in newPublicData) if (Object.prototype.hasOwnProperty.call(newPublicData, propertyName))
						publicContext[propertyName] = newPublicData[propertyName];

					for (propertyName in newProtectedData) if (Object.prototype.hasOwnProperty.call(newProtectedData, propertyName))
						protectedContext[propertyName] = newProtectedData[propertyName];
				}, // end loadObjectData()


				requireFunctionOrNothing: function (userObject, propertyName, errorMsg_Undefined, errorMsg_invalid, defaultFunction)
				{
					var propertyType,
						functionToUse = defaultFunction;

					if (Object.prototype.hasOwnProperty.call(userObject, propertyName))
					{
						propertyType = typeof userObject[propertyName];
						if (propertyType === "function")
							functionToUse = userObject[propertyName];
						else if (propertyType === "undefined")
							throw errorMsg_Undefined;
						else
							throw errorMsg_invalid;
					}

					return functionToUse;
				} // end requireFunctionOrNothing()
			}, // end Util singleton definition


		/**
		 * Commonly used functions for applying a value to the target of a transformation.
		 * @public
		 * @namespace
		 * @memberof Concert
		 * @property {function} Property - Applies a value to <b>any</b> target object, treating the feature as a <strong>property</strong> of the target object.
		 * @property {function} Style - Applies a value to a target <b>DOM element</b>, treating the feature as a <strong>style</strong> of the target object.
		 * @property {function} SVG_ElementAttribute - Applies a value to a target <b>SVG element</b>, treating the feature as an <strong>attribute</strong> of the target object.
		 */
		Applicators:
			{
				Property:
					function (target, feature, value)
					{
						target[feature] = value;
					},

				Style:
					function (target, feature, value, unit)
					{
						target.style[feature] = (unit === null) ? value : (value.toString() + unit);
					},

				SVG_ElementAttribute:
					function (target, feature, value, unit)
					{
						target.setAttribute(feature, (unit === null) ? value : (value.toString() + unit));
					}
			}, // end Applicator singleton / namespace definition


		/**
		 * Commonly used functions for calculating the current value to apply in the middle of a transformation based on the start and end values defined in the transformation.
		 * @public
		 * @namespace
		 * @memberof Concert
		 * @property {function} Color - Calculates a color in between the colors specified as start and end values.
		 * <br><br><em>Expected start / end values</em>: <strong>CSS color style value strings</strong>, specified in any of hex, rgb, rgba, hsl, or hsla format
		 * (start and end values must be in the same format as each other).
		 * <br><br><em>Returns</em>: <strong>A CSS color style value string</strong> in the same format as the start and end values.
		 * @property {function} Discrete - Used when output needed should jump directly from one value to another
		 * rather than gradually moving from the start value to the end value.
		 * <br><br><em>Expected start / end values</em>: <strong>(Any type)</strong>
		 * <br><br><em>Returns</em>: Either the start value (if the transformation is not yet complete) or the end value (if the transformation is complete).
		 * <br><br>If the transformation has a property called <code>round</code> whose value is X the value will be treated as numeric
		 * and the return value will be rounded to the nearest multiple of X.
		 * @property {function} Linear - Calculates a value based on linear interpolation between the start and end values.
		 * <br><br><em>Expected start / end values</em>: <strong>Numeric</strong>
		 * <br><br><em>Returns</em>: <strong>Numeric</strong>.
		 * <br><br>If the transformation has a property called <code>round</code> whose value is X the value will be treated as numeric
		 * and the return value will be rounded to the nearest multiple of X.
		 * <br><br><em>Note: This should not be confused with the [ConstantRate easing function]{@link Concert.EasingFunctions}.
		 * The easing function is used to determine what fraction of the transformation is complete (i.e., it affects the <em>rate</em> of the transformation),
		 * whereas the selected calculator function determines the method by which the values are calculated
		 * (i.e., numeric interpolation vs. discrete values, vs. specialized calculations such as determining what color is partway between two other colors).</em>
		 * @property {function} Rotational - Calculates a set of coordinates resulting from rotational motion.
		 * <br><br><em>Expected start / end values</em>: <strong>Object</strong>, in the form
		 * <br><code>{ centerX: xCoordinate, centerY: yCoordinate, radius: r, angle: angleRadians, offsetX: xDistance, offsetY: yDistance }</code>.<br>
		 * These values define the center point around which the rotation occurs, the distance from that point, the angle (in radians),
		 * and an offset added to the resulting point. (The offset is useful, for instance, for making an object's centerpoint orbit the rotational center
		 * rather than its upper left corner being the anchor point for the rotational movement.)
		 * Each of these values can be animated separately. For instance, giving different start and end values for <code>angle</code> results in
		 * rotational movement, and also giving different start and end values for <code>radius</code> would result in spiraling movement.
		 * <br><br><em>Returns</em>: <strong>Numeric Array</strong> determined from calculating the current rotational position
		 * and converting it to resulting coordinates in the form <code>[left, top]</code>.
		 */
		Calculators:
			{
				Color:
					function (distanceFraction, startValue, endValue)
					{
						var i, valueLength, returnValue;

						// Utility function for converting a hexadecimal color string to a decimal number.
						function hexColorToDecimal(hexStr)
						{
							if (hexStr.length === 1)
								hexStr += hexStr;
							return parseInt(hexStr, 16);
						} // end hexColorToDecimal()

						// Utility function for calculating a color some fraction of the distance between two other colors.
						function interpolateColor(color1, color2, distanceFraction)
						{
							var color1Pieces, color2Pieces, calculatedValues, i, curVal1, tempVal, interpolatedValueStr;
							var hexColors1, hexColors2;
							var rgbFunctionPattern = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$|^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i;
							var hslFunctionPattern = /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$|^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([0-9.]+)\s*\)$/i;
							var hexRGBPattern = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$|^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
							var rgbFunctionMatch = false, hslFunctionMatch = false;

							// Try parsing the specified colors as rgb[a] or hsl[a] color functions
							if ((color1Pieces = rgbFunctionPattern.exec(color1)) !== null)
							{
								// First color is an rgb function. Treat the other one as the same.
								color2Pieces = rgbFunctionPattern.exec(color2);
								rgbFunctionMatch = true;
							}
							else if ((color1Pieces = hslFunctionPattern.exec(color1)) !== null)
							{
								// First color is an hsl function. Treat the other one as the same.
								color2Pieces = hslFunctionPattern.exec(color2);
								hslFunctionMatch = true;
							}

							if (rgbFunctionMatch || hslFunctionMatch)
							{
								// Process these colors as functions (rgb or hsl).

								// Parse out the results of the regular expression match, to get the pieces of the string corresponding to each value (r, g, and b [and possibly a]; or h, s, and l).
								calculatedValues = [];
								for (i = 1; i < 8; i++) // skip the first element, it contains the full string match
								{
									// Get one of the arguments of first color's color function.
									curVal1 = color1Pieces[i];

									if (typeof curVal1 !== "undefined")
									{
										// Convert the value to an int.
										curVal1 = parseInt(curVal1, 10);
										// Get the corresponding argument of the second color's color function, convert that to an int,
										// and calculate what the in-between value is, based on the fraction of the distance traversed so far.
										tempVal = curVal1 + distanceFraction * (parseInt(color2Pieces[i], 10) - curVal1);
										// Store the calculated value as one of the values that will be used to build the result string.
										calculatedValues.push((i < 7) ? Math.round(tempVal) : tempVal);
									}
								}

								if (rgbFunctionMatch)
								{
									// Assemble the interpolated color string, in the form "rgb(1,2,3)" or "rgba(1,2,3,4)".
									interpolatedValueStr = "rgb" + ((calculatedValues.length === 4) ? "a" : "") + "(" + calculatedValues.join() + ")";
								}
								else
								{
									// Assemble the interpolated color string, in the form "hsla(1,2%,3%, 4)" or "hsl(1,2%,3%)".
									tempVal = calculatedValues[0].toString() + "," + calculatedValues[1].toString() + "%," + calculatedValues[2].toString() + "%";
									if (calculatedValues.length === 4)
										interpolatedValueStr = "hsla(" + tempVal + "," + calculatedValues[3].toString() + ")";
									else
										interpolatedValueStr = "hsl(" + tempVal + ")";
								}
							}
							else
							{
								// Strings were not in the form of rgb or hsl functions. Process them as hex color values.
								color1Pieces = hexRGBPattern.exec(color1);
								color2Pieces = hexRGBPattern.exec(color2);
								hexColors1 = [];
								hexColors2 = [];

								// Break out the R, G, B[, and A]
								for (i = 1; i < 9; i++)
								{
									tempVal = color1Pieces[i];
									if (typeof tempVal !== "undefined")
										hexColors1.push(tempVal);
									tempVal = color2Pieces[i];
									if (typeof tempVal !== "undefined")
										hexColors2.push(tempVal);
								}

								// If either of the colors specifies an alpha value, make sure the other has one as well.
								if(hexColors1.length > 3 && hexColors2.length < 4)
									hexColors2.push("ff");
								else if(hexColors2.length > 3 && hexColors1.length < 4)
									hexColors1.push("ff");

								// Iterate over each of the colors [and alpha value], building the string containing "#" plus all the interpolated values.
								interpolatedValueStr = "#";
								for (i = 0; i < hexColors1.length; i++)
								{
									// Convert the first value to an int.
									curVal1 = hexColorToDecimal(hexColors1[i]);
									// Get the corresponding value from the second color, convert that to an int,
									// and calculate what the in-between value is, based on the fraction of the distance traversed so far.
									tempVal = Math.round(curVal1 + distanceFraction * (hexColorToDecimal(hexColors2[i]) - curVal1));
									// Concatenate that into the result string.
									interpolatedValueStr += ((tempVal < 16) ? "0" : "") + tempVal.toString(16);
								}
							} // end if/else on (rgbFunctionMatch || hslFunctionMatch)

							return interpolatedValueStr;
						} // end interpolateColor()

						if (_Concert.Util.isArray(startValue))
						{
							// Function is being called on a whole array of values. Generate an array of interpolated colors to return.
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
								returnValue.push(interpolateColor(startValue[i], endValue[i], distanceFraction));
						}
						else
							returnValue = interpolateColor(startValue, endValue, distanceFraction); // Generate the interpolated color to return.

						return returnValue;
					}, // end Color Calculator function

				Discrete:
					function (distanceFraction, startValue, endValue, calculatorModifiers)
					{
						var i, returnValue, valueLength;

						// Return an array of values if passed in an array of values, and a single value otherwise.
						// Either way, the value returned is either the start value or the end value,
						// (altered by any specified modifiers, such as modulo, rounding, a multiplier, or an offset)
						if (_Concert.Util.isArray(startValue))
						{
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
								returnValue.push(_Concert.Util.applyCalculatorModifiers(((distanceFraction < 1) ? startValue[i] : endValue[i]), calculatorModifiers));
						}
						else
							returnValue = _Concert.Util.applyCalculatorModifiers(((distanceFraction < 1) ? startValue : endValue), calculatorModifiers);

						return returnValue;
					}, // end Discrete Calculator function

				Linear:
					function (distanceFraction, startValue, endValue, calculatorModifiers)
					{
						var i, valueLength, curStartValue, returnValue;

						// Return an array of values if passed in an array of values, and a single value otherwise.
						// Either way, the value returned is a simple interpolation of numeric values,
						// (altered by any specified modifiers, such as modulo, rounding, a multiplier, or an offset)
						if (_Concert.Util.isArray(startValue))
						{
							returnValue = [];
							for (i = 0, valueLength = startValue.length; i < valueLength; i++)
							{
								curStartValue = startValue[i];
								returnValue.push(_Concert.Util.applyCalculatorModifiers(curStartValue + distanceFraction * (endValue[i] - curStartValue), calculatorModifiers));
							}
						}
						else
							returnValue = _Concert.Util.applyCalculatorModifiers(startValue + distanceFraction * (endValue - startValue), calculatorModifiers);

						return returnValue;
					}, // end Linear Calculator function

				Rotational:
					function (distanceFraction, startValue, endValue, calculatorModifiers)
					{
						// Calculate the coordinates of the point found by interpolating between the start and end values specified
						// for center coordinates, radius, angle, and x- and y-offset.
						// startValue and endValue should each look like this:
						//   { centerX: xCoordinate, centerY: yCoordinate, radius: r, angle: a, offsetX: xCoordinate, offsetY: yCoordinate }
						// calculatorModifiers for rotational transformations are expected to look like this:
						//   { centerX: xModifier, centerY: yModifier, radius: rModifier, angle: aModifier, offsetX: xModifier, offsetY: yModifier] }
						var startCenterX = startValue.centerX, startCenterY = startValue.centerY,
							startRadius = startValue.radius, startAngle = startValue.angle,
							startOffsetX = startValue.offsetX, startOffsetY = startValue.offsetY,
							endCenterX = endValue.centerX, endCenterY = endValue.centerY,
							endRadius = endValue.radius, endAngle = endValue.angle,
							endOffsetX = endValue.offsetX, endOffsetY = endValue.offsetY,
							calculatedCenterX, calculatedCenterY, calculatedRadius, calculatedAngle, calculatedOffsetX, calculatedOffsetY,
							returnX, returnY;
						
						calculatedCenterX = _Concert.Calculators.Linear(distanceFraction, startCenterX, endCenterX, calculatorModifiers.centerX);
						calculatedCenterY = _Concert.Calculators.Linear(distanceFraction, startCenterY, endCenterY, calculatorModifiers.centerY);
						calculatedRadius = _Concert.Calculators.Linear(distanceFraction, startRadius, endRadius, calculatorModifiers.radius);
						calculatedAngle = _Concert.Calculators.Linear(distanceFraction, startAngle, endAngle, calculatorModifiers.angle);
						calculatedOffsetX = _Concert.Calculators.Linear(distanceFraction, startOffsetX, endOffsetX, calculatorModifiers.offsetX);
						calculatedOffsetY = _Concert.Calculators.Linear(distanceFraction, startOffsetY, endOffsetY, calculatorModifiers.offsetY);

						returnX = calculatedCenterX + calculatedRadius * Math.cos(calculatedAngle) + calculatedOffsetX;
						returnY = calculatedCenterY + calculatedRadius * Math.sin(calculatedAngle) + calculatedOffsetY;

						return [returnX, returnY];
					} // end Rotational Calculator function
			}, // end Calculator singleton / namespace definition


		/**
		 * Pre-defined functions for calculating the current effective distance traveled (represented as a fractional value from 0 to 1) along a transformation time path.
		 * @public
		 * @namespace
		 * @memberof Concert
		 * @property {function} ConstantRate - Returns a value that increases linearly from 0 to 1 as the current time moves from the start time to the end time; or 0 if the current time is before the start time; or 1 if the current time is after the end time.
		 * @property {function} QuadIn - Return value is 0 at or before the start time, changes slowly at first, then accelerates as the current time moves closer to the end time, returning 1 at or after the end time. Specifically, uses the formula: <br><code>([currentTime - startTime] / [endTime - startTime])<sup>2</sup></code>
		 * @property {function} QuadInOut - Return value is 0 at or before the start time, changes slowly at first, then accelerates to reach the halfway point, then decelerates again at the same rate as the current time moves closer to the end time, returning 1 at or after the end time. Effectively is the same as breaking the transformation in half, applying QuadIn to the first half, and QuadOut to the second half.
		 * @property {function} QuadOut - Return value is 0 at or before the start time, changes quickly at first, then decelerates as the current time moves closer to the end time, returning 1 at or after the end time. Specifically, uses the formula: <br><code>(1 - (1 - ((currentTime - startTime) / (endTime - startTime))<sup>2</sup>))</code>
		 * @property {function} Smoothstep - Another function which starts slowly, accelerates to the mid-point, then decelerates, returning 0 at or before the start time and 1 at or after the end time (See {@link http://en.wikipedia.org/wiki/Smoothstep}).
		 */
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
								return (0.5 + (1 - Math.pow(1 - (currentTime - halfway) / (endTime - halfway), 2)) / 2);
						}
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


		/**
		 * Pre-defined functions for controlling the behavior of a sequence when the current time exceeds the end time or moves before the start time of the sequence. When running a sequence, any of these can be applied to the <code>before</code> or <code>after</code> properties of the parameters object passed into the [run]{@link Concert.Sequence#run}, [begin]{@link Concert.Sequence#begin}, [follow]{@link Concert.Sequence#follow}, or [syncTo]{@link Concert.Sequence#syncTo} methods.
		 * @public
		 * @namespace
		 * @memberof Concert
		 * @property {function} Bounce(bounceCount) - The <strong>result of calling this function</strong> with a specified number of times to bounce is a function object that can be passed into [setBefore]{@link Concert.Sequence#setBefore} or [setAfter]{@link Concert.Sequence#setAfter}, or into one of the run methods as the value of the <code>before</code> or <code>after</code> property. It results in the sequence bouncing (that is, alternating directions to play forward and backward) the specified number of times when it reaches that time boundary. A <code>bounceCount</code> value of <code>0</code> is the same as using <code>Concert.Repeating.None</code>, <code>1</code> means add a single extra run-through in the reverse direction, and so on.
		 * @property {function} Loop(loopbackCount) - The <strong>result of calling this function</strong> with a specified number of times to loop is a function object that can be passed into [setBefore]{@link Concert.Sequence#setBefore} or [setAfter]{@link Concert.Sequence#setAfter}, or into one of the run methods as the value of the <code>before</code> or <code>after</code> property. It results in the sequence looping the specified number of times when it reaches that time boundary. A <code>loopbackCount</code> value of <code>0</code> is the same as using <code>Concert.Repeating.None</code>, <code>1</code> means play through twice (that is, loop back to the beginning 1 time), and so on.
		 * @property {function} None - This function should be <strong>passed directly into</strong> the [setBefore]{@link Concert.Sequence#setBefore} or [setAfter]{@link Concert.Sequence#setAfter} method or into one of the run methods as the value of the <code>before</code> or <code>after</code> property. It results in the sequence halting when it reaches that time boundary.
		 */
		Repeating:
			{
				Bounce:
					function (bounceCount)
					{
						// Interprete no bounce count at all as infinite bouncing.
						var infinite = ((typeof bounceCount) === "undefined" || bounceCount === null);

						// Generate a function that calculates the appropriate seek time within the sequence,
						// when passed a raw time value which is outside the sequence, to result in
						// the sequence bouncing (running back and forth) the specified number of times.
						function bounceFunction(sequenceStart, sequenceEnd, unadjustedTime)
						{
							var distanceOut, bounceNum, curBounceOffset,
								duration = sequenceEnd - sequenceStart; // length of the sequence

							if (unadjustedTime < sequenceStart)
							{
								// The raw time value is before the beginning of the sequence.

								// Calculate how far before the beginning it is, and figure out
								// how many sequence durations outside the sequence timeline the present time is
								// (that is, how many bounces away from the beginning we are).
								distanceOut = sequenceStart - unadjustedTime;
								bounceNum = Math.floor(distanceOut / duration) + 1;

								// Determine whether (based on the number of bounces being even or odd)
								// the sequence would be running forward or backward, and calculate accordingly
								// the equivalent seek time inside the sequence to get to this spot in the bounce.
								// If we're outside the specified number of bounces, the equivalent seek time
								// is the very beginning or end of the sequence.
								if (infinite || bounceNum <= bounceCount)
								{
									curBounceOffset = distanceOut % duration;
									return { adjustedTime: (((bounceNum % 2) === 0) ? (sequenceEnd - curBounceOffset) : curBounceOffset), hitFinalBoundary: false };
								}
								else
									return { adjustedTime: (((bounceCount % 2) === 0) ? sequenceStart : sequenceEnd), hitFinalBoundary: true };
							}
							else
							{
								// The raw time value is after the end of the sequence.

								// Calculate how far after the end it is, and figure out
								// how many sequence durations outside the sequence timeline the present time is
								// (that is, how many bounces away from the end we are).
								distanceOut = unadjustedTime - sequenceEnd;
								bounceNum = Math.floor(distanceOut / duration) + 1;

								// Determine whether (based on the number of bounces being even or odd)
								// the sequence would be running forward or backward, and calculate accordingly
								// the equivalent seek time inside the sequence to get to this spot in the bounce.
								// If we're outside the specified number of bounces, the equivalent seek time
								// is the very beginning or end of the sequence.
								if (infinite || bounceNum <= bounceCount)
								{
									curBounceOffset = distanceOut % duration;
									return { adjustedTime: (((bounceNum % 2) === 0) ? curBounceOffset : sequenceEnd - curBounceOffset), hitFinalBoundary: false };
								}
								else
									return { adjustedTime: (((bounceCount % 2) === 0) ? sequenceEnd : sequenceStart), hitFinalBoundary: true };
							}
						} // end inner bounceFunction()

						return bounceFunction;
					},

				Loop:
					function (loopbackCount)
					{
						// Interprete no loop count at all as infinite looping.
						var infinite = ((typeof loopbackCount) === "undefined" || loopbackCount === null);

						// Generate a function that calculates the appropriate seek time within the sequence,
						// when passed a raw time value which is outside the sequence, to result in
						// the sequence looping (running in a forward direction again and again) the specified number of times.
						function loopFunction(sequenceStart, sequenceEnd, unadjustedTime)
						{
							var distanceOut,
								duration = sequenceEnd - sequenceStart; // length of the sequence

							if (unadjustedTime < sequenceStart)
							{
								// The raw time value is before the beginning of the sequence.
								// Calculate how far outside the sequence we are.
								distanceOut = sequenceStart - unadjustedTime;

								// If we are inside the specified number of loopbacks, calculate how far into the present
								// loop we are, and return that as the adjusted time. Otherwise, the adjusted time is
								// the beginning of the sequence.
								if (infinite || (distanceOut / duration) <= loopbackCount)
									return { adjustedTime: (sequenceEnd - (distanceOut % duration)), hitFinalBoundary: false };
								else
									return { adjustedTime: sequenceStart, hitFinalBoundary: true };
							}
							else
							{
								// The raw time value is after the end of the sequence.
								// Calculate how far outside the sequence we are.
								distanceOut = unadjustedTime - sequenceEnd;

								// If we are inside the specified number of loopbacks, calculate how far into the present
								// loop we are, and return that as the adjusted time. Otherwise, the adjusted time is
								// the end of the sequence.
								if (infinite || (distanceOut / duration) <= loopbackCount)
									return { adjustedTime: (sequenceStart + (distanceOut % duration)), hitFinalBoundary: false };
								else
									return { adjustedTime: sequenceEnd, hitFinalBoundary: true };
							}
						} // end inner loopFunction()

						return loopFunction;
					},

				None:
					function (sequenceStart, sequenceEnd, unadjustedTime)
					{
						// When reaching the end, just stop.
						// Any seek time before the beginning of the sequence gets adjusted to the start time of the sequence.
						// Any seek time after the end of the sequence gets adjusted to the end time of the sequence.
						return ((unadjustedTime < sequenceStart) ? { adjustedTime: sequenceStart, hitFinalBoundary: true } : { adjustedTime: sequenceEnd, hitFinalBoundary: true });
					}
			},


		Pollers:
			{
				Auto:
					BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
					{
						function AutoConstructor()
						{
							// The Auto constructor tries to use window.requestAnimationFrame().
							// However, if the current browser does not support that, instead of creating an auto
							// poller, create and return a fixed interval poller, using the default polling interval.
							if (!window.cancelAnimationFrame)
								return new _Concert.Pollers.FixedInterval(_Concert.Definitions.FallbackAutoPollerInterval);

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

							// If there is a stored frame request ID from a previous call to requestAnimationFrame(),
							// this poller is already running, so do nothing. If there isn't one, however, go ahead
							// and initiate the running of this poller.
							if (thisProtected.frameRequestID === null)
							{
								// Create a function which, when requestAnimationFrame() returns,
								// 1) immediately asks for another frame; and
								// 2) invokes the callback function that this poller exists to call (which is ordinarily a function that seeks a sequence).
								doNextFrame =
									function ()
									{
										thisProtected.frameRequestID = window.requestAnimationFrame(doNextFrame);
										callbackFunction();
									};
								
								// Go ahead and call the function the first time to kick everything off.
								doNextFrame();
							}
						} // end __run()


						function __stop()
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							// If there is a stored ID that came from a call to requestAnimationFrame, that means
							// the poller is running.
							if (thisProtected.frameRequestID !== null)
							{
								// Cancel the next frame, and erase the previously stored requestAnimationFrame() ID.
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

							// Running a fixed-interval poller is simple. Just set an interval on which to run the callback function.
							if (thisProtected.intervalID === null)
								thisProtected.intervalID = setInterval(callbackFunction, thisProtected.interval);
						} // end __run()


						function __stop()
						{
							var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

							// If this poller is running (that is, we've previously called window.setInterval() and stored the ID it returned),
							// then clear that interval, and drop the stored interval ID that indicates the poller is presently running.
							if (thisProtected.intervalID !== null)
							{
								clearInterval(thisProtected.intervalID);
								thisProtected.intervalID = null;
							}
						} // end __stop()


						return FixedIntervalConstructor;
					}) // end FixedInterval definition
			}, // end Pollers singleton / namespace definition


		Transformation:
			(function ()
			{
				var nextTransformationID = 0;

				// ===============================================
				// -- Transformation Constructor

				function TransformationConstructor(properties)
				{
					var propertyName;

					// Initialize data members
					this.transformationID = nextTransformationID++;

					// Initialize data members
					for (propertyName in properties) if (Object.prototype.hasOwnProperty.call(properties, propertyName))
						this[propertyName] = properties[propertyName];
					if (typeof this.calculatorModifiers !== "object")
						this.calculatorModifiers = {};
					if (typeof this.userProperties !== "object")
						this.userProperties = {};
					this.lastFrameID = null;
					this.lastCalculatedValue = null;
					this.lastAppliedValueContainer =
						{
							value: (_Concert.Util.isArray(this.feature) ? new Array(this.feature.length) : null),
							unit: (_Concert.Util.isArray(this.unit) ? new Array(this.unit.length) : null)
						};

					// Methods
					this.clone = __clone;
					this.generateValues = __generateValues;
					this.hasDynamicValues = __hasDynamicValues;
					this.retarget = __retarget;
					this.seek = __seek;
				} // end TransformationConstructor()



				// ===============================================
				// -- Transformation Internal Function Definitions

				function _applyValue(applicator, target, transformationFeatures, seekFeature, newValueContainer, lastAppliedValueContainer, forceApplication)
				{
					var i, newValue, newUnit, lastValue, lastUnit, applyForSure, numTransformationFeatures,
						curTransformationFeature, unitIsArray, currentIndividualValue, currentIndividualUnit;

					newValue = newValueContainer.value;
					newUnit = newValueContainer.unit;
					lastValue = lastAppliedValueContainer.value;
					lastUnit = lastAppliedValueContainer.unit;

					applyForSure = (forceApplication || lastValue === null);

					if (_Concert.Util.isArray(transformationFeatures))
					{
						unitIsArray = _Concert.Util.isArray(newUnit);

						for (i = 0, numTransformationFeatures = transformationFeatures.length; i < numTransformationFeatures; i++)
						{
							curTransformationFeature = transformationFeatures[i];
							if (curTransformationFeature === seekFeature)
							{
								currentIndividualValue = newValue[i];
								currentIndividualUnit = unitIsArray ? newUnit[i] : newUnit;
								if (applyForSure || currentIndividualValue !== lastValue[i] || currentIndividualUnit !== (unitIsArray ? lastUnit[i] : lastUnit))
								{
									applicator(target, curTransformationFeature, currentIndividualValue, currentIndividualUnit);
									lastValue[i] = currentIndividualValue;
									if (unitIsArray)
										lastUnit[i] = currentIndividualUnit;
									else
										lastAppliedValueContainer.unit = currentIndividualUnit;
								}
								break;
							}
						}
					}
					else
					{
						if (applyForSure || newValue !== lastValue || newUnit !== lastUnit)
						{
							applicator(target, transformationFeatures, newValue, newUnit);
							lastAppliedValueContainer.value = newValue;
							lastAppliedValueContainer.unit = newUnit;
						}
					}
				} // end _applyValue()



				// ===============================================
				// -- Transformation Public Method Definitions

				function __clone(newTarget)
				{
					var newTransformation, propertyName,
						calculatorModifiers = this.calculatorModifiers, newCalculatorModifiers,
						userProperties = this.userProperties, newUserProperties,
						propertiesNotToCopy =
						{
							transformationID: true, calculatorModifiers: true, userProperties: true, target: true,
							lastAppliedValueContainer: true, lastFrameID: true, lastCalculatedValue: true,
							clone: true, generateValues: true, hasDynamicValues: true, retarget: true, seek: true
						};

					newTransformation = new _Concert.Transformation();

					for (propertyName in this) if (Object.prototype.hasOwnProperty.call(this, propertyName) && !propertiesNotToCopy[propertyName])
						newTransformation[propertyName] = this[propertyName];
					newTransformation.target = newTarget;
					newTransformation.lastAppliedValueContainer =
						{
							value: (_Concert.Util.isArray(this.feature) ? new Array(this.feature.length) : null),
							unit: (_Concert.Util.isArray(this.unit) ? new Array(this.unit.length) : null)
						};
					newTransformation.lastFrameID = null;
					newTransformation.lastCalculatedValue = null;

					// The cloned transformation doesn't share a calculatorModifiers object with the original; it gets a new object with the properties copied in.
					newCalculatorModifiers = newTransformation.calculatorModifiers;
					for (propertyName in calculatorModifiers) if (Object.prototype.hasOwnProperty.call(calculatorModifiers, propertyName))
						newCalculatorModifiers[propertyName] = calculatorModifiers[propertyName];
					// The cloned transformation doesn't share a userProperties object with the original; it gets a new object with the properties copied in.
					newUserProperties = newTransformation.userProperties;
					for (propertyName in userProperties) if (Object.prototype.hasOwnProperty.call(userProperties, propertyName))
						newUserProperties[propertyName] = userProperties[propertyName];

					return newTransformation;
				} // end __clone()


				function __generateValues(sequence)
				{
					var v0Generator = this.v0Generator, v1Generator = this.v1Generator;

					if (typeof v0Generator === "function")
						this.v0 = v0Generator(sequence);
					if (typeof v1Generator === "function")
						this.v1 = v1Generator(sequence);
				} // end __generateValues()


				function __hasDynamicValues()
				{
					return ((typeof this.v0Generator === "function") || (typeof this.v1Generator === "function"));
				} // end _hasDynamicValues()


				function __retarget(newTarget)
				{
					this.target = newTarget;
					this.lastAppliedValueContainer =
						{
							value: (_Concert.Util.isArray(this.feature) ? new Array(this.feature.length) : null),
							unit: (_Concert.Util.isArray(this.unit) ? new Array(this.unit.length) : null)
						};
				} // end _retarget()


				function __seek(time, frameID, seekFeature, forceApplication)
				{
					var newValue =
						(frameID === this.lastFrameID)
						? this.lastCalculatedValue
						: this.calculator(this.easing(this.t0, this.t1, time), this.v0, this.v1, this.calculatorModifiers, this.userProperties);

					_applyValue(this.applicator, this.target, this.feature, seekFeature,
					            { value: newValue, unit: this.unit },
								this.lastAppliedValueContainer, forceApplication);
				} // end __seek()

				// ===============================================

				return TransformationConstructor;
			})(), // end Transformation definition


		FeatureSequence:
			(function ()
			{
				// ===============================================
				// -- FeatureSequence Constructor

				function FeatureSequenceConstructor(target, feature)
				{
					// Data members
					this.target = target;
					this.feature = feature;
					this.transformations = [];
					this.transformationIndexBySegment = null;

					// Public methods
					this.clone = __clone;
					this.indexTransformations = __indexTransformations;
					this.retarget = __retarget;
					this.seek = __seek;
				} // end FeatureSequenceConstructor()



				// ===============================================
				// -- FeatureSequence Public Method Definitions

				function __clone(newTarget)
				{
					var i, j, numSegments, curIndexedTransformation,
						transformations = this.transformations,
						numTransformations = transformations.length,
						newTransformations = new Array(numTransformations),
						transformationIndexBySegment = this.transformationIndexBySegment,
						newTransformationIndexBySegment = null,
						newFeatureSequence = new _Concert.FeatureSequence(newTarget, this.feature),
						returnVal = { featureSequence: newFeatureSequence, transformations: newTransformations };

					for (i = 0; i < numTransformations; i++)
						newTransformations[i] = transformations[i].clone(newTarget);
					newFeatureSequence.transformations = newTransformations;

					if (transformationIndexBySegment)
					{
						numSegments = transformationIndexBySegment.length;
						newTransformationIndexBySegment = new Array(numSegments);

						for (i = 0; i < numSegments; i++)
						{
							curIndexedTransformation = transformationIndexBySegment[i];
							for (j = 0; j < numTransformations; j++)
							{
								if (curIndexedTransformation === transformations[j])
								{
									newTransformationIndexBySegment[i] = newTransformations[j];
									break;
								}
							}
						}
					}
					newFeatureSequence.transformationIndexBySegment = newTransformationIndexBySegment;

					return returnVal;
				} // end __clone()


				function __indexTransformations(overallSequenceSegments)
				{
					var transformations = this.transformations, finalTransformationNumber = transformations.length - 1,
						currentTransformationNumber, beforeLastTransformation, numSegments = overallSequenceSegments.length,
						transformationIndexBySegment, currentSegmentNumber, currentTransformation, nextTransformation,
						nextTransformationStartTime, currentSegmentStartTime;

					if (finalTransformationNumber < 0)
						return;

					transformations.sort(
						function (a, b)
						{
							var aStartTime = a.t0;
							var bStartTime = b.t0;
							return ((aStartTime === bStartTime) ? 0 : ((aStartTime < bStartTime) ? -1 : 1));
						});

					transformationIndexBySegment = this.transformationIndexBySegment = new Array(numSegments);

					currentSegmentNumber = 0;
					currentSegmentStartTime = overallSequenceSegments[0].startTime;
					currentTransformationNumber = 0;
					currentTransformation = transformations[0];
					if (finalTransformationNumber > 0)
					{
						nextTransformation = transformations[1];
						nextTransformationStartTime = nextTransformation.t0;
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
								nextTransformationStartTime = nextTransformation.t0;
							}
							else
								beforeLastTransformation = false;
						}
						else
						{
							transformationIndexBySegment[currentSegmentNumber] = currentTransformation;
							currentSegmentNumber++;
							if (currentSegmentNumber < numSegments)
								currentSegmentStartTime = overallSequenceSegments[currentSegmentNumber].startTime;
							else
								break;
						}
					}
				} // end __indexTransformations()


				function __retarget(newTarget)
				{
					var i, transformations = this.transformations, numTransformations = transformations.length;
					for (i = 0; i < numTransformations; i++)
						transformations[i].retarget(newTarget);

					this.target = newTarget;
				} // end __retarget()


				function __seek(sequenceSegmentNumber, time, frameID, forceApplication)
				{
					this.transformationIndexBySegment[sequenceSegmentNumber].seek(time, frameID, this.feature, forceApplication);
				} // end __seek()

				// ===============================================

				return FeatureSequenceConstructor;
			})(), // end FeatureSequence definition


		TargetSequence:
			BaseObject.extend(function (_getProtectedMembers, BaseConstructor)
			{
				// ===============================================
				// -- TargetSequence Constructor

				function TargetSequenceConstructor(target)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Protected data members
					thisProtected.target = target;
					thisProtected.featureSequences = [];

					// Public methods
					thisPublic.addFeatureSequence = __addFeatureSequence;
					thisPublic.clone = __clone;
					thisPublic.findFeatureSequenceByFeature = __findFeatureSequenceByFeature;
					thisPublic.getTarget = __getTarget;
					thisPublic.indexTransformations = __indexTransformations;
					thisPublic.retarget = __retarget;
					thisPublic.seek = __seek;
				} // end TargetSequenceConstructor()



				// ===============================================
				// -- TargetSequence Public Method Definitions

				function __addFeatureSequence(featureSequence)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.featureSequences.push(featureSequence);
				} // end __addFeatureSequence()


				function __clone(newTarget)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, featureSequenceCloneReturn, allNewTransformations = [],
						featureSequences = thisProtected.featureSequences, numFeatureSequences = featureSequences.length,
						newTargetSequence = new _Concert.TargetSequence(newTarget),
						returnVal = { targetSequence: newTargetSequence, transformations: allNewTransformations };

					for (i = 0; i < numFeatureSequences; i++)
					{
						featureSequenceCloneReturn = featureSequences[i].clone(newTarget);
						newTargetSequence.addFeatureSequence(featureSequenceCloneReturn.featureSequence);
						allNewTransformations.push.apply(allNewTransformations, featureSequenceCloneReturn.transformations);
					}

					return returnVal;
				} // end __clone()


				function __findFeatureSequenceByFeature(feature)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, curFeatureSequence, featureSequences = thisProtected.featureSequences, numFeatureSequences = featureSequences.length;

					for (i = 0; i < numFeatureSequences; i++)
					{
						curFeatureSequence = featureSequences[i];
						if (curFeatureSequence.feature === feature)
							return curFeatureSequence;
					}

					return null;
				} // end __findFeatureSequenceByFeature()


				function __getTarget()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.target;
				} // end __getTarget()


				function __indexTransformations(overallSequenceSegments)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, numFeatureSequences;
					var featureSequences = thisProtected.featureSequences;
					for (i = 0, numFeatureSequences = featureSequences.length; i < numFeatureSequences; i++)
						featureSequences[i].indexTransformations(overallSequenceSegments);
				} // end __indexTransformations()


				function __retarget(newTarget)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, featureSequences = thisProtected.featureSequences, numFeatureSequences = featureSequences.length;
					for(i = 0; i < numFeatureSequences; i++)
						featureSequences[i].retarget(newTarget);
					thisProtected.target = newTarget;
				} // end _retarget()


				function __seek(sequenceSegmentNumber, time, frameID, forceApplication)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var numFeatureSequences, i, featureSequences = thisProtected.featureSequences;
					for (i = 0, numFeatureSequences = featureSequences.length; i < numFeatureSequences; i++)
						featureSequences[i].seek(sequenceSegmentNumber, time, frameID, forceApplication);
				} // end __seek()

				// ===============================================

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
				// ===============================================
				// -- Sequence Constructor

				/**
				 * Represents an animation sequence, or, more broadly, a series of changes which are applied to a collection of objects over time.
				 * A sequence contains a set of transformations that are applied to DOM Elements, JavaScript objects, or anything else that can be manipulated with JavasScript.
				 * It contains methods that allow defining those transformations, seeking to any point in the sequence timeline, and running the sequence in various ways.
				 * @name Sequence
				 * @public
				 * @memberof Concert
				 * @constructor
				 * @param {Object} [transformationSet] An object defining an initial set of transformations to add to the sequence. The layout of this object is the same as used in the [addTransformations method]{@link Concert.Sequence#addTransformations}.
				 * @returns {Object} A new Sequence object.
				 */
				function SequenceConstructor(transformationSet)
				{
					// Initialize object:
					BaseConstructor.call(this);
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Protected data members
					thisProtected.ID = _Concert.nextSequenceID; _Concert.nextSequenceID++;
					thisProtected.nextFrameID = 0;
					thisProtected.targetSequences = [];
					thisProtected.timelineSegments = [];
					thisProtected.lastUsedTimelineSegmentNumber = 0;
					thisProtected.allTransformations = [];
					thisProtected.dynamicValueTransformations = [];
					thisProtected.indexCompletionCallbacks = [];
					thisProtected.indexed = false;
					thisProtected.indexingInProgress = false;
					thisProtected.indexTimerID = null;
					thisProtected.indexingProcessData = {};
					thisProtected.running = false;
					thisProtected.currentTime = null;
					thisProtected.unadjustedTime = null;
					thisProtected.sequenceStartTime = null;
					thisProtected.sequenceEndTime = null;
					thisProtected.poller = null;
					thisProtected.synchronizer = null;
					thisProtected.initialSyncSourcePoint = null;
					thisProtected.lastSegmentNumber = null;

					thisProtected.defaults =
						{
							unit: null,
							applicator: _Concert.Applicators.Property,
							easing: _Concert.EasingFunctions.ConstantRate,
							calculator: _Concert.Calculators.Linear,
							calculatorModifiers: {},
							userProperties: null
						};

					thisProtected.synchronizeTo = null;
					thisProtected.speed = 1;
					thisProtected.timeOffset = 0;
					thisProtected.pollingInterval = 0;
					thisProtected.after = _Concert.Repeating.None;
					thisProtected.before = _Concert.Repeating.None;
					thisProtected.autoStopAtEnd = true;
					thisProtected.onAutoStop = null;
					thisProtected.stretchStartTimeToZero = true;
					thisProtected.soleControlOptimizationDuringRun = true;

					// Protected methods
					thisProtected.advanceIndexingToNextStep = __advanceIndexingToNextStep;
					thisProtected.findSequenceSegmentNumberByTime = __findSequenceSegmentNumberByTime;
					thisProtected.findSequenceSegmentNumberInRange = __findSequenceSegmentNumberInRange;
					thisProtected.findTargetSequenceByTarget = __findTargetSequenceByTarget;
					thisProtected.resetIndexing = __resetIndexing;
					thisProtected.runIndexing = __runIndexing;

					// Public methods
					thisPublic.addTransformations = __addTransformations;
					thisPublic.begin = __begin;
					thisPublic.clone = __clone;
					thisPublic.follow = __follow;
					thisPublic.generateValues = __generateValues;
					thisPublic.getCurrentTime = __getCurrentTime;
					thisPublic.getEndTime = __getEndTime;
					thisPublic.getID = __getID;
					thisPublic.getStartTime = __getStartTime;
					thisPublic.index = __index;
					thisPublic.isRunning = __isRunning;
					thisPublic.retarget = __retarget;
					thisPublic.run = __run;
					thisPublic.seek = __seek;
					thisPublic.setAfter = __setAfter;
					thisPublic.setBefore = __setBefore;
					thisPublic.setDefaults = __setDefaults;
					thisPublic.stop = __stop;
					thisPublic.syncTo = __syncTo;

					// Add transformations if any were specified
					if (transformationSet)
						thisPublic.addTransformations(transformationSet);
				} // end SequenceConstructor()



				// ===============================================
				// -- Sequence Internal Function Definitions

				function _getCombinedParams(initialParams, overrides)
				{
					var paramName, combined = {};

					if (initialParams)
					{
						for (paramName in initialParams) if (Object.prototype.hasOwnProperty.call(initialParams, paramName))
							combined[paramName] = initialParams[paramName];
					}

					if (overrides)
					{
						for (paramName in overrides) if (Object.prototype.hasOwnProperty.call(overrides, paramName))
							combined[paramName] = overrides[paramName];
					}

					return combined;
				} // end _overrideParams()


				function _getParamValue(parameters, paramName, defaultValue)
				{
					return ((parameters && (typeof parameters[paramName] !== "undefined")) ? parameters[paramName] : defaultValue);
				} // end _getParamValue


				function _loadObjectData(newPublicData, newProtectedData)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					_Concert.Util.loadObjectData(newPublicData, newProtectedData, thisPublic, thisProtected);
				} // end _loadObjectData()


				function _sortSingleValue (distinctVal, workingArray)
				{
					var searchStart = 0, searchEnd = workingArray.length - 1, middle;

					if (searchEnd < 0 || distinctVal > workingArray[searchEnd])
						workingArray.push(distinctVal);
					else if (distinctVal < workingArray[0])
						workingArray.unshift(distinctVal);
					else
					{
						while (searchStart + 1 < searchEnd)
						{
							middle = Math.floor((searchStart + searchEnd) / 2);
							if (distinctVal < workingArray[middle])
								searchEnd = middle;
							else
								searchStart = middle;
						}

						workingArray.splice(searchEnd, 0, distinctVal);
					}
				} // end _sortSingleValue()


				// ===============================================
				// -- Sequence Protected Method Definitions

				function __advanceIndexingToNextStep()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var distinctValuesObject, distinctValStr, distinctValuesArray, timelineSegments,
						indexingProcessData = thisProtected.indexingProcessData, indexingComplete = false;

					indexingProcessData.step++;
					indexingProcessData.startingIndex = 0;

					switch (indexingProcessData.step)
					{
						case 1:
							indexingProcessData.inputData = indexingProcessData.outputData;
							indexingProcessData.iterationsPerRound = _Concert.Definitions.StartingIterationsPerAsynchProcessingRound.consolidateDistinctValues;
							indexingProcessData.totalIterationsThisStep = indexingProcessData.inputData.length;
							indexingProcessData.outputData = {};
							break;

						case 2:
							indexingProcessData.iterationsPerRound = _Concert.Definitions.StartingIterationsPerAsynchProcessingRound.buildSortedArray;
							if (indexingProcessData.isAsynchronous)
							{
								distinctValuesObject = indexingProcessData.outputData;
								distinctValuesArray = [];
								for (distinctValStr in distinctValuesObject) if (Object.prototype.hasOwnProperty.call(distinctValuesObject, distinctValStr))
									distinctValuesArray.push(distinctValuesObject[distinctValStr]);
								indexingProcessData.inputData = distinctValuesArray;
								indexingProcessData.totalIterationsThisStep = distinctValuesArray.length;
							}
							else
							{
								indexingProcessData.inputData = indexingProcessData.outputData;
								indexingProcessData.totalIterationsThisStep = 1;
							}
							indexingProcessData.outputData = [];
							break;

						case 3:
							indexingProcessData.inputData = indexingProcessData.outputData;
							indexingProcessData.iterationsPerRound = _Concert.Definitions.StartingIterationsPerAsynchProcessingRound.buildDistinctSegmentList;
							indexingProcessData.totalIterationsThisStep = indexingProcessData.inputData.length - 1;
							indexingProcessData.outputData = new Array(indexingProcessData.totalIterationsThisStep);
							break;

						case 4:
							indexingProcessData.inputData = indexingProcessData.outputData;
							indexingProcessData.iterationsPerRound = _Concert.Definitions.StartingIterationsPerAsynchProcessingRound.indexTargetSequences;
							indexingProcessData.totalIterationsThisStep = thisProtected.targetSequences.length;
							indexingProcessData.outputData = null;
							break;

						case 5:
							indexingComplete = true;

							thisProtected.timelineSegments = timelineSegments = indexingProcessData.inputData;
							thisProtected.sequenceStartTime = ((!timelineSegments || timelineSegments.length < 1) ? null : timelineSegments[0].startTime);
							thisProtected.sequenceEndTime = ((!timelineSegments || timelineSegments.length < 1) ? null : timelineSegments[timelineSegments.length - 1].endTime);

							thisProtected.indexed = true;
							thisProtected.indexingInProgress = false;

							indexingProcessData.inputData = null;
							indexingProcessData.iterationsPerRound = 1;
							indexingProcessData.totalIterationsThisStep = 0;
							indexingProcessData.outputData = null;

							while (thisProtected.indexCompletionCallbacks.length)
								(thisProtected.indexCompletionCallbacks.shift())(thisPublic);
					} // end switch (indexingProcessData.step)

					return indexingComplete;
				} // end __setIndexingCurrentStep()


				// Find the array index of the animation segment (in the timelineSegments array) that is active at the specified time.
				function __findSequenceSegmentNumberByTime(time)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var match, currentSegmentNumber, currentSegment, currentSegmentEnd;

					// Get the array of all the blocks of time in the sequence in which animation is actively occurring.
					var timelineSegments = thisProtected.timelineSegments,
						numSegments = timelineSegments.length;

					if (numSegments < 1)
						match = null; // There are no segments at all, so none of them could possibly be active at the specified time. We will return null.
					else
					{
						// Figure out which segment was last returned by this function. Get that segment and its end time.
						// Since very often the next segment is either same as the one last needed, or the one right after that,
						// it speeds things up a lot to start searching there.
						currentSegmentNumber = thisProtected.lastUsedTimelineSegmentNumber;
						currentSegment = timelineSegments[currentSegmentNumber];
						currentSegmentEnd = currentSegment.endTime;

						// Compare the passed-in time to the start time of the last-used segment.
						if (time >= currentSegment.startTime)
						{
							// The specified time is after the beginning of the current segment (as of the last call to this function).

							if (time < currentSegmentEnd)
								match = { segmentNumber: currentSegmentNumber, timeMatchType: 0 }; // Specified time is in the present segment. That's the one we'll return.
							else if (currentSegmentNumber === numSegments - 1)
								match = { segmentNumber: currentSegmentNumber, timeMatchType: 1 }; // Specified time is after the present segment, but the present segment is the last one. Return this one, but indicate we're outside its final bounds.
							else
							{
								// Specified time is in some segment following the current one.
								// Begin a search of the segments ranging from the next one through the last one.

								currentSegmentNumber++;
								currentSegment = timelineSegments[currentSegmentNumber];
								currentSegmentEnd = currentSegment.endTime;

								// For an optimized search, recognize that a significant amount of the time the correct segment, if it isn't the last-used one,
								// will be the very next one. So before we launch into the binary search done by findSequenceNumberInRange, first check
								// the very next segment to see if it matches the passed-in time.
								if (time < currentSegmentEnd)
									match = { segmentNumber: currentSegmentNumber, timeMatchType: 0 }; // Specified time is within the bounds of that segment. That's the one we'll return.
								else if (currentSegmentNumber === numSegments - 1)
									match = { segmentNumber: currentSegmentNumber, timeMatchType: 1 }; // Specified time is after the bounds of that segment, but there are no more segments after that. Return that one,  but indicate we're outside its final bounds.
								else
									match = thisProtected.findSequenceSegmentNumberInRange(time, currentSegmentNumber + 1, numSegments - 1); // Jump into a binary search of the segments between here and the end.
							}
						}
						else
						{
							// The specified time is before the beginning of the current segment (as of the last call to this function).

							if (currentSegmentNumber === 0)
								match = { segmentNumber: 0, timeMatchType: -1 }; // The current segment is the first segment of all, and the specified time comes before it, so return this segment, but indicating this time is prior to its actual start.
							else
								match = thisProtected.findSequenceSegmentNumberInRange(time, 0, currentSegmentNumber - 1); // Jump into a binary search of the segments between the first one and this one.
						}

						// Store the last segment found by this function, for use the next time.
						thisProtected.lastUsedTimelineSegmentNumber = match.segmentNumber;
					}

					return match;
				} // end __findSequenceSegmentNumberByTime()


				// Find the array index of the animation segment (in the timelineSegments array) that is active at the specified time, searching only within the specified range of indices.
				function __findSequenceSegmentNumberInRange(time, rangeStart, rangeEnd)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var currentSegmentNumber, currentSegment, currentTimeMatchType;

					// Do an iterative binary search.
					do
					{
						// Find the segment at the middle of the range presently being searched.
						currentSegmentNumber = Math.floor((rangeStart + rangeEnd) / 2);
						currentSegment = thisProtected.timelineSegments[currentSegmentNumber];

						if (time < currentSegment.startTime)
						{
							// The sought-after segment is before the current one.
							// Change the end of the search range to the segment just before this one.
							rangeEnd = currentSegmentNumber - 1;
							currentTimeMatchType = -1;
						}
						else
						{
							// The sought-after segment is in or after the current one.

							if (time >= currentSegment.endTime)
							{
								// The sought-after segment is after the current one.
								// Change the beginning of the search range to the segment just after this one.
								rangeStart = currentSegmentNumber + 1;
								currentTimeMatchType = 1;
							}
							else
							{
								// The specified time falls within this segment's start and end times. This is the one we'll return.
								currentTimeMatchType = 0;
								break;
							}
						}
					} while (rangeStart <= rangeEnd);

					return { segmentNumber: currentSegmentNumber, timeMatchType: currentTimeMatchType };
				} // end __findSequenceSegmentNumberInRange()


				function __findTargetSequenceByTarget(target)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, targetSequences = thisProtected.targetSequences, numTargetSequences = targetSequences.length;

					for (i = 0; i < numTargetSequences; i++)
					{
						if (targetSequences[i].getTarget() === target)
							return targetSequences[i];
					}

					return null;
				} // end _findTargetSequenceByTarget()


				function __resetIndexing()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var indexingProcessData = thisProtected.indexingProcessData;
					indexingProcessData.step = 0;
					indexingProcessData.startingIndex = 0;
					indexingProcessData.iterationsPerRound = _Concert.Definitions.StartingIterationsPerAsynchProcessingRound.buildBreakPointList;
					indexingProcessData.inputData = thisProtected.allTransformations;
					indexingProcessData.totalIterationsThisStep = thisProtected.allTransformations.length;
					indexingProcessData.outputData = new Array(indexingProcessData.totalIterationsThisStep * 2);
				} // end __resetIndexing()


				function __runIndexing()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var indexingProcessData = thisProtected.indexingProcessData, indexingComplete;


					function doProcessing()
					{
						var step = indexingProcessData.step, isAsynchronous = indexingProcessData.isAsynchronous,
							startTime, endTime, inputData = indexingProcessData.inputData,
							curIndex = indexingProcessData.startingIndex, totalItemsToProcessThisStep = indexingProcessData.totalIterationsThisStep,
							maxItemsToProcessThisRound = isAsynchronous ? indexingProcessData.iterationsPerRound : totalItemsToProcessThisStep,
							stoppingPoint = Math.min(totalItemsToProcessThisStep, curIndex + maxItemsToProcessThisRound),
							outputData = indexingProcessData.outputData, indexingComplete = false,
							curTransformation, curBreakpointIndex = ((step === 0) ? curIndex * 2 : null),
							curBreakpointValue, distinctValStr, nextBreakpointValue, targetSequences;

						if (isAsynchronous)
							startTime = getNowTime();

						if (step === 2 && !isAsynchronous && !_Concert.Util.isArray(inputData))
						{
							// If we're doing this synchronously, we skip a step of copying object properties into an array.
							// This is faster, but doesn't work in asynchronous mode, because there's no good way to break up
							// the below loop into multiple rounds. We also can't do this if we've already started processing
							// this step asynchronously and switched to synchronous mode in between rounds, so we also check
							// whether the input data is an array (in which case we've already skipped the opimization and can
							// just continue by means of the normal while/switch loop below).
							for (distinctValStr in inputData) if (Object.prototype.hasOwnProperty.call(inputData, distinctValStr))
								_sortSingleValue(inputData[distinctValStr], outputData);
						}
						else
						{
							if (step === 3)
								curBreakpointValue = inputData[curIndex];
							else if (step === 4)
								targetSequences = thisProtected.targetSequences;

							while (curIndex < stoppingPoint)
							{
								switch (step)
								{
									case 0: // Building breakpoint list
										curTransformation = inputData[curIndex];
										outputData[curBreakpointIndex++] = curTransformation.t0;
										outputData[curBreakpointIndex++] = curTransformation.t1;
										break;
									case 1: // Consolidating distinct breakpoint values
										curBreakpointValue = inputData[curIndex];
										outputData[curBreakpointValue] = curBreakpointValue;
										break;
									case 2: // Building a sorted array of distinct breakpoint values
										_sortSingleValue(inputData[curIndex], outputData);
										break;
									case 3: // Building a sorted array of distinct timeline segments
										nextBreakpointValue = inputData[curIndex + 1];
										outputData[curIndex] = new _Concert.TimelineSegment(curBreakpointValue, nextBreakpointValue);
										curBreakpointValue = nextBreakpointValue;
										break;
									case 4: // Indexing the target sequences to the timeline segment list
										targetSequences[curIndex].indexTransformations(inputData);
										break;
								}

								curIndex++;
							} // end while (curIndex < stoppingPoint)
						} // end if/else on (step === 2 && !isAsynchronous && !_Concert.Util.isArray(inputData))

						if (stoppingPoint === totalItemsToProcessThisStep)
							indexingComplete = thisProtected.advanceIndexingToNextStep();
						else
						{
							endTime = getNowTime();
							indexingProcessData.startingIndex = curIndex;
							if ((endTime - startTime) < _Concert.Definitions.IterationRoundTimeHalfBound)
								indexingProcessData.iterationsPerRound *= 2;
						}

						if (isAsynchronous && !indexingComplete)
							thisProtected.indexTimerID = window.setTimeout(doProcessing, 0);

						return indexingComplete;
					} // end doProcessing()


					if (indexingProcessData.isAsynchronous)
					{
						thisProtected.indexingInProgress = true;
						thisProtected.indexTimerID = window.setTimeout(doProcessing, 0);
					}
					else
					{
						if (thisProtected.indexTimerID !== null) // This is the "join thread" case, where we're already indexing asynchronously but have been instructed to index synchronously.
						{
							window.clearTimeout(thisProtected.indexTimerID);
							thisProtected.indexTimerID = null;
						}
						while (!indexingComplete)
							indexingComplete = doProcessing();
					}
				} // end __startIndexing()



				// ===============================================
				// -- Sequence Public Method Definitions

				/**
				 * Adds a set of transformations (i.e., changes applied to objects over time) to the sequence.<br>
				 * <p class="ExplanationParagraph"><strong>Terminology:</strong></p>
				 * <p class="ExplanationParagraph">-A <em>transformation</em> is a single change applied over time to a single feature of a single object. Its properties include which object to modify and what feature of it will be altered, a start time and starting value, and end time and ending value. For instance, a transformation may represent changing the "width" style of a DIV element from "100px" at time 1000 to "200px" at time 2000.</p>
				 * <p class="ExplanationParagraph">-A <em>sequence</em> is a collection of transformations that are to be applied together as a group.</p>
				 * <p class="ExplanationParagraph">-A <em>target object</em> is anything that will be modified by a transformation (e.g., a DOM element or a JavaScript object).</p>
				 * <p class="ExplanationParagraph">-A <em>target feature</em> is the aspect of the target object that will be modified (e.g., for a DOM element this might be "width").</p>
				 * <p class="ExplanationParagraph">-A <em>unit</em> is an optional (initially defaults to <code>null</code>) string appended to a calculated value when applying it to a target feature
				 * (e.g., for a DOM style property this might be "px").</p>
				 * <p class="ExplanationParagraph">-A <em>calculator</em> is a function that looks at the start and end values of a target feature and calculates a current value to apply
				 * based on the current distance along the timeline. Ordinarily this is set to one of the pre-defined calculator functions in the [Concert.Calculators]{@link Concert.Calculators} namespace
				 * (initially defaulting to <code>Concert.Calculators.Linear</code>), but can also be a custom function, as explained further below.</p>
				 * <p class="ExplanationParagraph">-An <em>applicator</em> is a function that takes the values computed by the calculator function and applies them to the target feature.
				 * For instance, different applicators would be used for setting JavaScript object properties, DOM element styles, or SVG element attributes.
				 * Ordinarily this is set to one of the pre-defined applicator functions in the [Concert.Applicators]{@link Concert.Applicators} namespace
				 * (initially defaulting to <code>Concert.Applicators.Property</code>), but can also be a custom function, as explained further below.</p>
				 * <p class="ExplanationParagraph">-An <em>easing</em> is a function which modifies the rate at which a transformation moves from beginning to end.
				 * For instance, it may progress steadily from the start time to the end time, or it may accelerate and decelerate to make motion appear smoother.
				 * Ordinarily this is set to one of the pre-defined easing functions in the [Concert.EasingFunctions]{@link Concert.EasingFunctions} namespace
				 * (initially defaulting to <code>Concert.EasingFunctions.ConstantRate</code>) but can also be a custom function, as explained further below.</p>
				 * <p class="ExplanationParagraph">Note: The easing function could easily be confused with the calculator function, because many animation libraries combine these two concepts.
				 * Here, however, they can be set independently. Essentially, a calculator function, given a start value, an end value, and the current time (in the form of a fractional distance
				 * between the start time and end time of the transformation), calculates a current value to apply. The easing function is what computes the current time that will be passed into
				 * the calculator function, allowing the rate at which a transformation proceeds to change over time. The reason for separating these becomes apparent when we consider that different
				 * types of calculation are necessary for different types of features. A function calculating an animated transition from one RGB color value to another uses a different algorithm than
				 * one calculating the animation of a simple, numeric value, for instance, or a complex calculator function that takes multiple inputs and calculates rotational movement.
				 * Because Concert.js allows anything at all to be animated, it supports the ability to choose any method of calculating values, and then (regardless of which one is used)
				 * specifying any easing function to alter the rate at which the animation takes place. Easing functions are specified at the level of the transformation (not the full sequence,
				 * although it is possible to set a default easing function for a sequence), so a single sequence can contain different transformations using a different easing functions.</p>
				 * @name addTransformations
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Object} transformationSet An object or array describing a set of changes which will be applied at specified times to specified target objects.
				 * (A target object being anything that will be modified by the sequence, such as a DOM element or a JavaScript object.)
				 * The <code>transformationSet</code> parameter is either a single object whose properties define a set of transformations, or an array of such objects.
				 * Certain of the properties (as indicated below) are optional, and each sequence maintains its own settings for what default values will be applied to transformations
				 * when the optional properties are not defined. (Note: these defaults are applied at the time the transformations are added, not at run-time, so changing the defaults
				 * for a sequence will never alter transformations which have already been added to that sequence.)<br><br>
				 * Important note: Adding two animation segments that overlap in time, and both try to modify the same feature
				 * of the same target object, produces undefined behavior.<br><br>

				 * The expected layout of the object passed into this method is defined as follows (also see examples below):<pre>
				 * <strong>transformationSet</strong> = <em>TransformationsObject</em>
				 * OR
				 * <strong>transformationSet</strong> = [<em>TransformationsObject<sub>1</sub></em>, <em>TransformationsObject<sub>2</sub></em>, ...]
				 * 
				 * <strong><em>TransformationsObject</em></strong> =
				 *   {
				 *       target: <em>TargetObjectDefinition</em>,
				 *       AND/OR
				 *       targets: [<em>TargetObjectDefinition<sub>1</sub></em>, <em>TargetObjectDefinition<sub>2</sub></em>, ...],
				 *
				 *       feature: <em>FeatureDefinition</em>,
				 *       [unit: <em>UnitDefinition</em>,] // If absent, uses sequence's default value
				 *       [applicator: <em>ApplicatorFunction</em>,] // If absent, uses sequence's default value
				 *       [calculator: <em>CalculatorFunction</em>,] // If absent, uses sequence's default value
				 *       [calculatorModifiers: <em>CalculatorModifiersObject</em>,]
				 *       [easing: <em>EasingFunction</em>,] // If absent, uses sequence's default value
				 *       [userProperties: <em>UserPropertiesObject</em>,]
				 *
				 *       keyframes: <em>KeyframesDefinition</em>
				 *       OR
				 *       segments: <em>SegmentDefinition</em> OR [<em>SegmentDefinition<sub>1</sub></em>, <em>SegmentDefinition<sub>2</sub></em>, ...]
				 *   };
				 * 
				 * </pre>
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>TargetObjectDefinition</em></strong>
				 * 	= The object to be modified by these transformations.
				 * </code>
				 * Often this will be a DOM object, but it can be anything at all. Multiple targets can
				 * be specified, by using the <code>targets</code> (plural) property, as a shorthand method of
				 * duplicating the transformation definitions to target all the included target objects.
				 * </p>
				 * 
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>FeatureDefinition</em></strong>
				 * 	= The feature of the target object which will be modified, OR an array of such features.
				 * </code>
				 * In most cases, this will be a string (for example, when
				 * animating a DOM style, this might be "width") or an array of strings. Arrays are
				 * allowed as a shorthand method of defining multiple features, values, and units
				 * together in a more compact notation. The first feature in the array will be
				 * matched with the first unit and the first value in those arrays, and so on. See
				 * below samples for an example of using arrays in this way.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>UnitDefinition</em></strong>
				 * 	= A string to be appended to calculated values before they are applied to the target
				 * 	(for example, when animating a DOM style, this might be "px"),
				 * 	OR an array of such strings.
				 * </code>
				 * Arrays are allowed as a shorthand method of defining multiple features, values, and units together
				 * in a more compact notation. The first unit in the array will be matched with the first feature
				 * and the first value in those arrays, and so on. See below samples for an example of using arrays in this way.
				 * Use <em>null</em> if nothing should be appended to the calculated values for this transformation.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>ApplicatorFunction</em></strong>
				 * 	= Function used to apply the calculated current value to the feature.
				 * </code>
				 * Because different types of features (e.g., DOM element styles as contrasted to plain JavaScript object properties)
				 * are applied in different ways, different applicator functions are needed. This can be set to one of the functions
				 * defined in the [Concert.Applicators]{@link Concert.Applicators} namespace, or to any function with the signature:
				 *   <em>function applicatorFunction(target, feature, value, unit)</em>
				 * See below examples for a sample of a custom applicator.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>CalculatorFunction</em></strong>
				 * 	= Function used to calculate a current value to apply to the target feature.
				 * </code>
				 * This can be set to one of the functions defined in the [Concert.Calculators]{@link Concert.Calculators} namespace,
				 * or to any function returning an approprate value for this transformation's target feature and having the signature:
				 *   <code><em>function calculatorFunction(distanceFraction, startValue, endValue, addlProperties)</em></code>
				 * See below examples for a sample of a custom calculator.
				 * </p>
				 * 
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>CalculatorModifiersObject</em></strong>
				 * 	= Object used to apply additional factors used to modify calculations during the animation of these transformations.
				 * </code>
				 * Several such factors can be specified. For non-rotational transformations, takes the form:
				 * <pre>    {
				 *         [multiply: <em>multiplicationFactorValue</em>,]
				 *         [modulo: <em>moduloFactorValue</em>,]
				 *         [roundFactor: <em>roundFactorValue</em>,]
				 *         [offset: <em>offsetValue</em>,]
				 *     }</pre>
				 * These options are modifiers to the animation calculation engine, applied in the following ways and in the following order:
				 * <ul>
				 * 	<li>
				 * 		<code><strong><em>multiplicationFactorValue</em></strong></code>: While animating the target object,
				 * 		the value to be applied to the target feature is multiplied by this number.
				 * 	</li>
				 * 	<li>
				 *		<code><strong><em>moduloFactorValue</em></strong></code>: While animating the target object,
				 *		the value to be applied to the target feature is divided by this number, and
				 *		the remainder is actually what is applied.
				 *	</li>
				 *	<li>
				 *		<code><strong><em>roundFactorValue</em></strong></code>: While animating the target property,
				 *		the value to be applied is rounded to the nearest multiple of this number.
				 *	</li>
				 *	<li>
				 *		<code><strong><em>offsetValue</em></strong></code>: While animating the target property,
				 *		this value is added to the value to be applied to the target feature.
				 *	</li>
				 * </ul>
				 * When the <code>Rotational</code> calculator (see [Concert.Calculators]{@link Concert.Calculators})
				 * is being used (i.e., when this transformation is animating rotational motion),
				 * the object should be of the form:
				 * <pre>    {
				 *         [centerX: <em>CalculatorModifiersObject</em>,]
				 *         [centerY: <em>CalculatorModifiersObject</em>,]
				 *         [radius:<em>CalculatorModifiersObject</em>,]
				 *         [angle: <em>CalculatorModifiersObject</em>,]
				 *         [offsetX: <em>CalculatorModifiersObject</em>,]
				 *         [offsetY: <em>CalculatorModifiersObject</em>]
				 *     }</pre>
				 * Each individual <code>CalculatorModifiersObject</code> specified is an object of the form described above
				 * (an object with some or all of these properties: multiply, modulo, roundFactor, offset).
				 * This allows a separate set of modifiers to be applied to each of the values that can be animated in a
				 * rotational transformation. For instance, the angle could be rounded to the nearest multiple of a number.
				 * A very common use case would be specifying an offset so that the center of an element is what is rotated
				 * around the specified center point rather than its upper left corner.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>EasingFunction</em></strong>
				 * 	= Function used to compute the current time (as a fractional proportion of the distance traversed,
				 * 	from 0 to 1, between the start time and end time of the transformation).
				 * </code>
				 * This can be set to one of the functions defined in the [Concert.EasingFunctions]{@link Concert.EasingFunctions} namespace,
				 * or to any function returning a value from 0 to 1 and having the signature:
				 *   <code><em>function easingFunction(startTime, endTime, currentTime)</em></code>
				 * See below examples for a sample of a custom easing function.
				 * </p>
				 * 
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>UserPropertiesObject</em></strong>
				 * 	= Object used to apply additional, optional, user properties to each of transformations being added.
				 * </code>
				 * The primary use case of this object is when employing user-defined, custom calculator functions.
				 * If the Transformation uses a custom calculator, this UserPropertiesObject is passed into the calculator function
				 * as an argument. This allows setting user-defined properties on the Transformation object that can be used
				 * by a user-defined calculator function.
				 * </p>
				 * 
				 * <pre><strong><em>KeyframesDefinition</em></strong> =
				 * 	 {
				 *       times: <em>KeyframeTimesArray</em>,
				 *
				 *       [values: <em>KeyframeValuesArray</em>]
				 *       OR
				 *       [valueGenerators: <em>ValueGeneratorsArray</em>]
				 *   };
				 * 
				 * <strong><em>SegmentDefinition</em></strong> = 
				 *   {
				 *       t0: <em>TimeDefinition</em>, // Start time of this transformation
				 *       t1: <em>TimeDefinition</em>, // End time of this transformation: must be equal to or greater than t0.
				 *
				 *       v0: <em>ValueDefinition</em>, // Value applied at the start time
				 *       v1: <em>ValueDefinition</em>, // Value applied at the end time
				 *       // OR //
				 *       v0Generator: <em>ValueGenerator</em>, // Function to calculate v0
				 *       v1Generator: <em>ValueGenerator</em>, // Function to calculate v1
				 *
				 *       [calculator: <em>CalculatorFunction</em>,] // If absent, falls back to the calculator
				 *       // defined at the <em>TransformationsObject</em> level; if also absent there, to the
				 *       // sequence's default calculator.
				 *
				 *       [calculatorModifers: <em>CalculatorModifiersObject</em>,] // If absent, falls back
				 *       // to the calculatorModifiers object defined at the <em>TransformationsObject</em> level;
				 *       // if also absent there, to the sequence's default calculatorModifiers object.
				 *
				 *       [easing: <em>EasingFunction</em>,] // If absent, falls back to the easing function
				 *       // defined at the <em>TransformationsObject</em> level; if also absent there, to the
				 *       // sequence's default easing.
				 *
				 *       [unit: <em>UnitDefinition</em>,] // If absent, falls back to the unit defined at the
				 *       // <em>TransformationsObject</em> level; if also absent there, to the sequence's
				 *       // default unit.
				 * 
				 *       [userProperties: <em>CalculatorModifiersObject</em>] // If absent, falls back
				 *       // to the userProperties object defined at the <em>TransformationsObject</em> level;
				 *       // if also absent there, to the sequence's default userProperties object.
				 *   };</pre>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>KeyframeTimesArray</em></strong>
				 * 	= An array of the form [<em>TimeDefinition<sub>1</sub></em>, <em>TimeDefinition<sub>2</sub></em>, ...].
				 * </code>
				 * This defines the timeline points used as keyframes for this transformation series,
				 * to be matched up with the values in the corresponding <code><em>KeyframeValuesArray</em></code>. A null
				 * element has the effect of breaking the keyframe string into two segments. For example,
				 * the array <code>[0, 100, 1000, 2000]</code> defines a constant flow of transition with four
				 * keyframes. The array <code>[0, 100, null, 1000, 2000]</code>, on the other hand, defines a flow
				 * that is broken in two pieces: one animated segment with keyframes at time 0 and 100,
				 * then no further animation at all until until time 1000, followed by another period
				 * of animation between the keyframes at times 1000 and 2000.
				 * Important: Keyframe times for each null-separated segment (or for the whole array, if there are no null breaks)
				 * must be passed to the function in ascending order. (That is, an array of times such as
				 * [1000, 2000, 0, 500] will not work properly. But it is perfectly okay to use an array of times such as
				 * [1000, 2000, null, 0, 500], because that actually produces two entirely separate animation segments,
				 * and each of them is specified ascending time order.)
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>KeyframeValuesArray</em></strong>
				 * 	= An array of the form [<em>ValueDefinition<sub>1</sub></em>, <em>ValueDefinition<sub>2</sub></em>, ...].
				 * </code>
				 * This defines the values applied at each keyframe point, as matched up with the keyframe
				 * points defined in the corresponding <em>KeyframeTimesArray</em>. Note that null values
				 * appearing in this array work exactly the same way (and should match up with) null
				 * values in the <em>KeyframeTimesArray</em>. Both arrays must have the same number of elements.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>ValueGeneratorsArray</em></strong>
				 * 	= An array of the form [<em>ValueGenerator<sub>1</sub></em>, <em>ValueGenerator<sub>2</sub></em>, ...].
				 * </code>
				 * This defines the functions that calculate values applied at each keyframe point, as
				 * matched up with the keyframe points defined in the corresponding <em>KeyframeTimesArray</em>.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>TimeDefinition</em></strong>
				 * 	= A number indicating a point along the sequence timeline.
				 * </code>
				 * When synchronizing to a media object or running by the system clock, this should ordinarily be specified
				 * as a number of milliseconds (1/1000's of a second). Otherwise, there is no restriction; it simply indicates
				 * a numeric point on the overall timeline, with no particular unit implied. For instance, a sequence could be
				 * synchronized to the value of a slider or other user control, in which case this number would just be anything
				 * from the minimum to the maximum values of that control.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>ValueDefinition</em></strong>
				 * 	= A value to be applied to the target object feature, or an array of such values.
				 * </code>
				 * This value can be of any type, although it needs to be one appropriate to the target feature, calculator,
				 * and applicator being used. If a unit is specified, the value will be treated as a string and the unit
				 * will be appended to it before application. Arrays are allowed as a shorthand method of defining multiple
				 * features, values, and units together in a more compact notation. The first value in the array will be
				 * matched with the first unit and the first feature in those arrays, and so on.
				 * See below samples for an example of using arrays in this way.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>ValueGenerator</em></strong>
				 * 	= A function which returns a valid <em>ValueDefinition</em> and has the signature:
				 *  <em>function generatorFunction(sequence)</em>
				 * </code>
				 * This is a mechanism that allows specifying functions that will calculate start and end values for
				 * a transformation, instead of using fixed values determined at the time the transformation is initially
				 * specified. This can be helpful if the same transformation will be run more than once with different
				 * start and end values, such as a motion that might be repeated in more than one place on the screen
				 * at different times, or if the transformation is being added to the sequence before the actual start
				 * and end values are yet known. This is not to be confused with a Calculator function. A Calculator
				 * takes a start and end value along with the current time and calculates the current value.
				 * This function, by contrast, is called prior to running the sequence and determines what the start
				 * and end values are that the Calculator will look at during run-time of the sequence. All of the
				 * value generator functions for an entire sequence are called at once, either manually by calling
				 * the sequence's [generateValues]{@link Concert.Sequence#generateValues} method, or at the time
				 * the sequence is run, by specifying <code>true</code> for the <code>generateValues</code> option when
				 * calling the [run]{@link Concert.Sequence#run}, [begin]{@link Concert.Sequence#begin},
				 * [follow]{@link Concert.Sequence#follow}, or [syncTo]{@link Concert.Sequence#syncTo} methods.
				 * The generator function will be passed a reference to the sequence object containing the
				 * transformation whose values are currently being generated.
				 * </p>
				 *
				 * @example <caption>Example 1 Below: Single target object and feature, using keyframes, not relying on defaults. This would move a DOM object with id "someObject"
				 * by changing its "left" style value from "0px" to "60px" over the timeline period from time 1000 to 2000.</caption>
				 * sequence.addTransformations({
				 *     target: document.getElementById("someObject"),
				 *     feature: "left",
				 *     unit: "px",
				 *     applicator: Concert.Applicators.Style,
				 *     calculator: Concert.Calculators.Linear,
				 *     easing: Concert.EasingFunctions.ConstantRate,
				 *     keyframes: { times: [1000, 2000], values: [0, 60] }
				 *   });
				 *     
				 * @example <caption>Example 2 Below: This example demonstrates adding transformations for more than one target at a time, using both the
				 * "keyframes" and "segments" styles of definition, and using arrays for the target features and values. (An array could also have been
				 * specified for the "unit" property, but that isn't necessary if the same unit is being used for all the features as it is here.) Also
				 * note that the setDefaults method is being used to avoid having to specify common properties over and over again.
				 * This code would move the DOM object with id "someObject1" from position (0, 0) to (100, 200) from time 0 to 1000,
				 * and would change the width on the object with id "someObject2" from 75 to 150 and back to 75 again over the same time period.</caption>
				 * sequence.setDefaults(
				 *   {
				 *     applicator: Concert.Applicators.Style,
				 *     calculator: Concert.Calculators.Linear,
				 *     easing: Concert.EasingFunctions.ConstantRate,
				 *     unit: "px"
				 *   });
				 *
				 * sequence.addTransformations(
				 *   [
				 *     {
				 *       target: document.getElementById("someObject1"),
				 *       feature: ["left", "top"],
				 *       keyframes: { times: [0, 1000], values: [[0, 0], [100, 200]] }
				 *     },
				 *
				 *     {
				 *       target: document.getElementById("someObject2"),
				 *       feature: "width",
				 *       segments:
				 *         [
				 *           { t0:   0, t1:  500,    v0:  75, v1: 150 },
				 *           { t0: 500, t1: 1000,    v0: 150, v1:  75 },
				 *         ]
				 *     }
				 *   ]);
				 *     
				 * @example <caption>Example 3 Below: This example demonstrates using value generator functions instead of fixed values.
				 * This could would create a single transformation that animates the "left" property of the DOM element with ID "PhotonTorpedoBox".
				 * The animation runs from time 0 to time 1000, but the actual values are not yet known. Imagining that we're animating the firing
				 * of a torpedo from a ship whose location at the time the torpedo will be fired is not yet known, we set up functions that can
				 * determine the proper start and end locations later. Then, whenever it is appropriate to determine and fix the actual numbers,
				 * we would call generateValues(), which calls the generator functions and stores the values returned to be used when the sequence
				 * is run. (Or, if the generateValues option is specified with a value of true when running the sequence, generateValues() will be
				 * called automatically at that time.) Also note, the QuadIn easing function is used here, which will cause the motion to speed
				 * up as it proceeds from beginning to end.</caption>
				 * sequence.setDefaults(
				 *   {
				 *     applicator: Concert.Applicators.Style,
				 *     calculator: Concert.Calculators.Linear,
				 *     easing: Concert.EasingFunctions.QuadIn,
				 *     unit: "px"
				 *   });
				 * 
				 * sequence.addTransformations(
				 *   {
				 *     target: document.getElementById("PhotonTorpedoBox"),
				 *     feature: "left",
				 *     segments:
				 *       [{
				 *         t0: 0,
				 *         t1: 1000,
				 *         v0Generator:
				 *           function ()
				 *           {
				 *             var ship = document.getElementById("SpaceshipBox");
				 *             return (ship.offsetLeft + ship.offsetWidth);
				 *           },
				 *         v1Generator:
				 *           function ()
				 *           {
				 *             var ship = document.getElementById("SpaceshipBox");
				 *             return (ship.offsetLeft + ship.offsetWidth + 1000);
				 *           }
				 *       }]
				 *   });
				 * // ... sometime later:
				 * sequence.generateValues();
				 * 
				 * @example <caption>Example 3b Below: Shown here is the relevant portion of the last example modified to use keyframes notation
				 * instead of segments notation.</caption>
				 * sequence.addTransformations(
				 *   {
				 *     target: document.getElementById("PhotonTorpedoBox"),
				 *     feature: "left",
				 *     keyframes:
				 *       {
				 *         times: [0, 1000],
				 *         valueGenerators:
				 *         [
				 *           function ()
				 *           {
				 *             var ship = document.getElementById("SpaceshipBox");
				 *             return (ship.offsetLeft + ship.offsetWidth);
				 *           },
				 *
				 *           function ()
				 *           {
				 *             var ship = document.getElementById("SpaceshipBox");
				 *             return (ship.offsetLeft + ship.offsetWidth + 1000);
				 *           }
				 *         ]
				 *       }
				 *   });
				 *
				 * @example <caption>Example 4 Below: This example demonstrates using custom applicator, calculator, and easing functions
				 * to manipulate the width of a DOM object. The code shows a custom applicator function that could be used if we wanted to
				 * use a jQuery object containing multiple elements as a target object. <strong>Note that Concert.js does NOT depend in any
				 * way on jQuery; this example merely shows
				 * using the two libraries in conjunction.</strong> The custom calculator function below also makes use of jQuery, and shows how
				 * a custom calculator could be used to generate truly dynamic values- in this case, it generates the calculated value based on
				 * the width at that moment of a particular DOM element. The custom easing function shown here causes the animation to proceed at
				 * half-speed for two thirds of the time, then double-speed for the final third of the time.
				 * </caption>
				 * function customApplicator(target, feature, value, unit)
				 * {
				 *   target.each(function () { $(this).css(feature, value + unit); });
				 * }
				 * 
				 * function customCalculator(distanceFraction, startValue, endValue, addlProperties)
				 * {
				 *   var outerBoxWidth = $("#OuterBox").innerWidth();
				 *   return (distanceFraction * (endValue - startValue) * outerBoxWidth);
				 * }
				 * 
				 * function customEasing(startTime, endTime, currentTime)
				 * {
				 *   var fractionComplete = (currentTime - startTime) / (endTime - startTime);
				 *   if (fractionComplete < 2 / 3)
				 *     return (fractionComplete / 2);
				 *   else
				 *     return (1 / 3 + 2 * (fractionComplete - 2 / 3));
				 * }
				 * 
				 * sequence.addTransformations(
				 *   {
				 *     target: $(".InnerBox"),
				 *     feature: "width",
				 *     applicator: customApplicator,
				 *     calculator: customCalculator,
				 *     easing: customEasing,
				 *     unit: "px",
				 *     keyframes:
				 *     {
				 *       times: [0, 1000],
				 *       values: [0, 0.5]
				 *     }
				 *   });
				 */
				function __addTransformations(transformationSet)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic); // Get ahold of this object's basic properties

					// Initialize all the variables needed for this function
					var i, j, k, numTransformationGroups, curTransformationGroup, curGroupTarget, curGroupTargets, numCurGroupTargets, singleTargetVersion,
						curGroupFeatures, curGroupUnit, curGroupCalculator, curGroupCalculatorModifiers,
						curGroupEasing, curGroupUserProperties, curGroupApplicator, curGroupKeyFrames, curGroupSegments,
						numSegments, curSegment, propertyName, newTransformationProperties, newTransformation, singleFeatureSequence, curFeatureSequences,
						existingTargetSequences = thisProtected.targetSequences, curTargetSequence = null, defaults = thisProtected.defaults, numKeyFrames, times,
						values, valueGenerators, curKeyFrameTime, curKeyFrameValue, curKeyFrameValueGenerator, lastKeyFrameTime, lastKeyFrameValue, lastKeyFrameValueGenerator,
						createSegment, allTransformations = thisProtected.allTransformations, dynamicValueTransformations = thisProtected.dynamicValueTransformations;

					// If an asynchronous indexing is in progress when new transformations are added to the sequence,
					// the index will be wrong when completed. So cancel the indexing process if one is in progress.
					if (thisProtected.indexingInProgress)
						thisProtected.resetIndexing();
					else
						thisProtected.indexed = false;

					// If only one transformation group was passed in, convert it to a one-item array so the rest of the function
					// works identically regardless of whether an array or single object was passed in.
					if (!(_Concert.Util.isArray(transformationSet)))
						transformationSet = [transformationSet];

					// Iterate through the transformation groups, adding each of them to the sequence
					for (i = 0, numTransformationGroups = transformationSet.length; i < numTransformationGroups; i++)
					{
						// Grab the transformation group being added on this iteration of the loop.
						curTransformationGroup = transformationSet[i];

						// Get the target or targets of this transformation group.
						curGroupTarget = curTransformationGroup.target;
						curGroupTargets = curTransformationGroup.targets;
						if (_Concert.Util.isArray(curGroupTargets))
						{
							// There is an array of targets, all getting the same transformations applied.
							// This is a shorthand method of applying the same transformations to multiple things.

							// If there is also a single target specified, build an array containing that plus the existing array.
							if ((typeof curGroupTarget !== "undefined") && (curGroupTarget !== null))
								curGroupTargets = [curGroupTarget].concat(curGroupTargets);

							// Deal with the array of targets by simply iterating over each one, building an object
							// just like the current transformation group except with only a single target,
							// and then recursively calling this same function on just the single-target version.
							for (j = 0, numCurGroupTargets = curGroupTargets.length; j < numCurGroupTargets; j++)
							{
								singleTargetVersion = {};
								for (propertyName in curTransformationGroup) if (Object.prototype.hasOwnProperty.call(curTransformationGroup, propertyName))
									singleTargetVersion[propertyName] = curTransformationGroup[propertyName];
								singleTargetVersion.targets = null;
								singleTargetVersion.target = curGroupTargets[j];
								thisPublic.addTransformations(singleTargetVersion);
							}

							// Since we've dealt with the current transformation group already through recursion,
							// go ahead and skip on to the next loop iteration.
							continue;
						}

						// Internally, the sequence stores a set of target sequences--
						// that is, a set of objects where each contains all the transformations operating on a single target.
						// Try to find the existing target sequence for the specified target. If one does not yet exist, create one.
						curTargetSequence = thisProtected.findTargetSequenceByTarget(curGroupTarget);
						if (curTargetSequence === null)
						{
							curTargetSequence = new _Concert.TargetSequence(curGroupTarget);
							existingTargetSequences.push(curTargetSequence);
						}
						
						// Set up variables containing all the assorted properties that will be applied to the transformations in this group,
						// applying defaults for all those which are not specified in the object that was passed in,
						// and throwing errors for those which were specified but clearly not valid.
						curGroupApplicator = _Concert.Util.requireFunctionOrNothing(curTransformationGroup, "applicator", "Error: Undefined applicator function (check spelling and capitalization?)", "Error: Invalid applicator specified (must be a function)", defaults.applicator);
						curGroupFeatures = _Concert.Util.correctFeatureNames(_Concert.Util.isArray(curTransformationGroup.feature) ? curTransformationGroup.feature : [curTransformationGroup.feature], curGroupApplicator);
						curGroupUnit = _Concert.Util.coalesceUndefined(curTransformationGroup.unit, defaults.unit);
						curGroupCalculator = _Concert.Util.requireFunctionOrNothing(curTransformationGroup, "calculator", "Error: Undefined calculator function (check spelling and capitalization?)", "Error: Invalid calculator specified (must be a function)", defaults.calculator);
						curGroupCalculatorModifiers = _Concert.Util.coalesceUndefined(curTransformationGroup.calculatorModifiers, defaults.calculatorModifiers);
						curGroupEasing = _Concert.Util.requireFunctionOrNothing(curTransformationGroup, "easing", "Error: Undefined easing function (check spelling and capitalization?)", "Error: Invalid easing specified (must be a function)", defaults.easing);
						curGroupUserProperties = _Concert.Util.coalesceUndefined(curTransformationGroup.userProperties, defaults.userProperties);

						// The internal model has:
						//   An overall sequence has a set of target sequences, each of which represents all the transformations applying to a single target.
						//   A target sequence has a set of feature sequences, each of which represents all the transformations applying to a single feature of that target.
						// Here we produce an array pointing to all the feature sequences being added to by this call to the addTransformations method.
						curFeatureSequences = new Array(curGroupFeatures.length); // Create an array of the same length as the number of mentioned features.
						// Iterate through the number of features being touched here.
						for (j = 0; j < curGroupFeatures.length; j++)
						{
							// If the current target sequence already has a feature sequence for this feature, get it.
							// If not, create one.
							singleFeatureSequence = curTargetSequence.findFeatureSequenceByFeature(curGroupFeatures[j]);
							if (singleFeatureSequence === null)
							{
								singleFeatureSequence = new _Concert.FeatureSequence(curGroupTarget, curGroupFeatures[j]);
								curTargetSequence.addFeatureSequence(singleFeatureSequence);
							}
							// Add the existing or new feature sequence to an array for use below.
							curFeatureSequences[j] = singleFeatureSequence;
						}

						// Grab the specified key frames list, if there was one.
						curGroupKeyFrames = curTransformationGroup.keyframes;
						if (typeof curGroupKeyFrames === "object" && curGroupKeyFrames !== null)
						{
							// Key frames were indeed specified. Get the times and values or value generators.
							times = curGroupKeyFrames.times;
							values = curGroupKeyFrames.values;
							valueGenerators = curGroupKeyFrames.valueGenerators;
							
							// Initialize to null a number of variables used to track current and last-iteration values while looping over all the keyframes.
							lastKeyFrameTime = lastKeyFrameValue = lastKeyFrameValueGenerator = curKeyFrameValue = curKeyFrameValueGenerator = null;
							
							// Loop over all the keyframes and create motion segment definitions for the segments defined by those keyframes.
							for (j = 0, numKeyFrames = times.length; j < numKeyFrames; j++)
							{
								curKeyFrameTime = times[j]; // Get the time at which the current keyframe occurs.
								if (values)
									curKeyFrameValue = values[j]; // Get the value matching the current keyframe time.
								if (valueGenerators)
									curKeyFrameValueGenerator = valueGenerators[j]; // Get the function to be used to generate a value for this keyframe.

								if (lastKeyFrameTime === null)
								{
									// There is no previous keyframe. Either this is the very first keyframe,
									// or there was a null time specified last in the list of keyframes,
									// which is a way of indicating no transformation segment should be created
									// between the last actual keyframe and this one.
									
									// Set the previous-keyframe storage variables for the next keyframe iteration.
									lastKeyFrameTime = curKeyFrameTime;
									lastKeyFrameValue = curKeyFrameValue;
									lastKeyFrameValueGenerator = curKeyFrameValueGenerator;

									// If this is the very last keyframe, we should create a segment out of just this one keyframe,
									// since there is no previous keyframe and no next one.
									createSegment = ((curKeyFrameTime !== null) && (j === numKeyFrames - 1));
								}
								else if (curKeyFrameTime === null)
								{
									// The present keyframe is not a true keyframe marking the beginning and/or end of a transformation segment.
									// Rather, it marks a non-animated segment-- that is, a break between segments before and after.
									// Set the previous-keyframe storage variables all to null for use in the next keyframe iteration,
									// and do not create a transformation segment.
									lastKeyFrameTime = lastKeyFrameValue = lastKeyFrameValueGenerator = null;
									createSegment = false;
								}
								else
									createSegment = true; // This is the usual case; create a transformation segment from the previous frame to this one.

								if (createSegment)
								{
									// Set up properties for a new transformation, using the previous and present times, values,
									// and other known info about how the target will be transformed in this segment.
									newTransformationProperties =
										{
											target: curGroupTarget,
											feature: (curGroupFeatures.length === 1) ? curGroupFeatures[0] : curGroupFeatures,
											applicator: curGroupApplicator,
											unit: curGroupUnit,
											calculator: curGroupCalculator,
											calculatorModifiers: curGroupCalculatorModifiers,
											easing: curGroupEasing,
											t0: lastKeyFrameTime,
											t1: curKeyFrameTime,
											v0: lastKeyFrameValue,
											v1: curKeyFrameValue,
											v0Generator: lastKeyFrameValueGenerator,
											v1Generator: curKeyFrameValueGenerator,
											userProperties: curGroupUserProperties
										};
									
									// Create a new Transformation object and add it to the list of all transformations owned by this sequence.
									newTransformation = new _Concert.Transformation(newTransformationProperties);
									allTransformations.push(newTransformation);
									
									// If this transformation is using value generators, add it to the list maintained internally
									// of transformations that utilize value generators.
									if (lastKeyFrameValueGenerator || curKeyFrameValueGenerator)
										dynamicValueTransformations.push(newTransformation);
									
									// A "feature sequence" represents all of the transformations which apply, over the course of the entire animation,
									// to a particular feature of a particular target. This is tracked as part of Concert's internal data structure which
									// helps make seek times really fast. Further up above, all the target features touched by this transformation group
									// were ascertained, and an array (curFeatureSequences) was created to store pointers to their respective feature sequences.
									// This new transformation, since it modifies each of those features, here gets added to each of those feature sequences'
									// internal list of transformations applying to it.
									for(k = 0; k < curFeatureSequences.length; k++)
										curFeatureSequences[k].transformations.push(newTransformation);

									// Set the previous-keyframe storage variables for the next keyframe iteration.
									lastKeyFrameTime = curKeyFrameTime;
									lastKeyFrameValue = curKeyFrameValue;
								} // end if (createSegment)
							} // end for loop iterating through keyframes
						} // end if (typeof curGroupKeyFrames != "undefined")
						else
						{
							// Key frames were not specified. Look for and use segment definitions instead.
							curGroupSegments = curTransformationGroup.segments;
							// The below code expects an array of segments, so if only one is specified, turn it into a single-element array.
							if (!(_Concert.Util.isArray(curGroupSegments)))
								curGroupSegments = [curGroupSegments];

							// Iterate over and add all the new animation segments.
							for (j = 0, numSegments = curGroupSegments.length; j < numSegments; j++)
							{
								curSegment = curGroupSegments[j]; // Get a reference to the current segment to process.

								// Set up the basic properties of the transformation that will represent this segment.
								newTransformationProperties =
									{
										target: curGroupTarget,
										feature: (curGroupFeatures.length === 1) ? curGroupFeatures[0] : curGroupFeatures, // Store the array of features, unless there is only one, in which case store just that value.
										applicator: curGroupApplicator
									};

								// Take all the defined properties of the passed-in segment and set those properties on the new transformation object as well.
								for (propertyName in curSegment) if (Object.prototype.hasOwnProperty.call(curSegment, propertyName))
									newTransformationProperties[propertyName] = curSegment[propertyName];
								
								// Certain properties are required. If those are specified at the individual segment level, that takes precedence.
								// If they aren't specified at that level, though, then use the values given for the whole group.
								if (typeof newTransformationProperties.unit === "undefined")
									newTransformationProperties.unit = curGroupUnit;
								if (typeof newTransformationProperties.calculator === "undefined")
									newTransformationProperties.calculator = curGroupCalculator;
								if (typeof newTransformationProperties.calculatorModifiers === "undefined")
									newTransformationProperties.calculatorModifiers = curGroupCalculatorModifiers;
								if (typeof newTransformationProperties.easing === "undefined")
									newTransformationProperties.easing = curGroupEasing;
								if (typeof newTransformationProperties.userProperties === "undefined")
									newTransformationProperties.userProperties = curGroupUserProperties;

								// Create a new Transformation object and add it to the list of all transformations owned by this sequence.
								newTransformation = new _Concert.Transformation(newTransformationProperties);
								allTransformations.push(newTransformation);

								// If this transformation is using value generators, add it to the list maintained internally
								// of transformations that utilize value generators.
								if ((typeof newTransformationProperties.v0Generator !== "undefined") || (typeof newTransformationProperties.v1Generator !== "undefined"))
									dynamicValueTransformations.push(newTransformation);
								
								// A "feature sequence" represents all of the transformations which apply, over the course of the entire animation,
								// to a particular feature of a particular target. This is tracked as part of Concert's internal data structure which
								// helps make seek times really fast. Further up above, all the target features touched by this transformation group
								// were ascertained, and an array (curFeatureSequences) was created to store pointers to their respective feature sequences.
								// This new transformation, since it modifies each of those features, here gets added to each of those feature sequences'
								// internal list of transformations applying to it.
								for (k = 0; k < curFeatureSequences.length; k++)
									curFeatureSequences[k].transformations.push(newTransformation);
							} // end loop through segments
						} // end if/else on (typeof curGroupKeyFrames != "undefined")
					} // end for loop iterating through transformation groups
				} // end __addTransformations()


				/**
				 * Runs the sequence starting from the beginning, locked to the system clock and automatically stopping upon reaching the end.
				 * This is really just a shortcut method provided for a common usage scenario; it is exactly the same as calling the [run]{@link Concert.Sequence#run} method with the parameters
				 * <code>{ synchronizeTo: null, initialSeek: 0, timeOffset: null, autoStopAtEnd: true }</code>. Note that these parameter values can still be overridden, or any of the other parameters
				 * accepted by the [run]{@link Concert.Sequence#run} method can be specified in the <code>parameters</code> argument passed into this method.
				 * @name begin
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Object} [parameters] An object with property values setting options for how to run the sequence.
				 * See the [run]{@link Concert.Sequence#run} method for information on allowable properties and values in this object.
				 */
				function __begin(parameters)
				{
					var thisPublic = this.thisPublic; //, thisProtected = _getProtectedMembers.call(thisPublic); // Can save a few bytes in the minified version since thisProtected isn't used in this function

					// Run this sequence, synchronized to no user object (i.e., synched to the system clock), starting at the beginning with no time offset and stopping at the end.
					thisPublic.run(_getCombinedParams({ synchronizeTo: null, initialSeek: 0, timeOffset: null, autoStopAtEnd: true }, parameters));
				} // end __begin()


				/**
				 * Creates a duplicate of a sequence, allowing a sequence to be defined once and then cloned to apply to any number of different sets of target objects.
				 * For example, the same series of animated motions might be applied to numerous on-screen elements.
				 * Since each sequence may contain transformations targeting numerous different objects, this is accomplished by passing in a function that,
				 * when passed a transformation target from the original sequence, returns the corresponding object to be targeted in the new sequence.
				 * (Note that one useful way of doing this easily is to set the targets of the original sequence to be strings or integers instead of actual objects. The original sequence then just becomes essentially a dummy sequence with placeholder targets that your function can easily identify and use for looking up substitute target objects.)
				 * This method is capable of duplicating nearly every aspect of the original sequence, including jumping to the same current point in time and even
				 * cloning its running or non-running status if desired. (To change the target objects of a sequence without creating a new one, see the [retarget]{@link Concert.Sequence#retarget} method.)
				 * @name clone
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {function} targetLookupFunction A function taking a single parameter. The value passed in will be one of the transformation targets of the original sequence. The function must return the equivalent object which should be targeted by the equivalent transformation in the new sequence.
				 * @param {boolean} [matchRunningStatus=false] If <code>true</code>, and the sequence being cloned is currently running, the new sequence will jump to the same point on the timeline and run as well. Otherwise, the new sequence will not automatically start running.
				 * @param {boolean} [doInitialSeek=false] If <code>true</code>, the new sequence will immediately seek to the same point on the timeline as the original sequence. Otherwise, the new sequence will merely be created, but will not immediately perform any action (unless the matchRunningStatus parameter is <code>true</code>).
				 * @returns {Object} A new [Sequence]{@link Concert.Sequence} object, with the same properties and duplicates of all the same transformations that were in the original sequence, but with new target objects of those transformations substituted in as controlled by the <code>targetLookupFunction</code> parameter.
				 * @example <caption>One possible method of using this function easily for replicating a sequence definition onto any number of targets is shown below. The initial sequence here is defined with two transformations that are given strings ("UpperElement" and "LowerElement") as targets. The initial sequence is thus just a dummy from which we can clone easily and repeatedly, and the strings make helpful placeholders for the function passed into the clone method to use for matching up to real DOM elements or other intended target objects which we may have created dynamically at a later time. Note further that if you index a sequence before cloning it, resulting cloned sequences will already be indexed and can be run instantly without any indexing lag.</caption>
				 * var originalSequence = new Concert.Sequence();
				 * originalSequence.setDefaults(
				 *   {
				 *     applicator: Concert.Applicators.Style,
				 *     calculator: Concert.Calculators.Linear,
				 *     easing: Concert.EasingFunctions.ConstantRate,
				 *     unit: "px"
				 *   });
				 * originalSequence.addTransformations(
				 *   [
				 *     {
				 *       target: "UpperElement", feature: "left",
				 *       keyframes: { times: [0, 1000], values: [100, 200] }
				 *     },
				 *     {
				 *       target: "LowerElement", feature: "left",
				 *       keyframes: { times: [0, 1000], values: [100, 200] }
				 *     }
				 *   ]);
				 * 
				 * //...some time later, having created DOM elements with id values
				 * // like "UpperElement1", "LowerElement1", "UpperElement2", ...
				 * var newSequence1 = originalSequence.clone(
				 *     function (originalTarget)
				 *     { return document.getElementById(originalTarget + "1"); });
				 * var newSequence2 = originalSequence.clone(
				 *     function (originalTarget)
				 *     { return document.getElementById(originalTarget + "2"); });
				 */
				function __clone(targetLookupFunction, matchRunningStatus, doInitialSeek)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic); // Get ahold of this object's basic properties

					// Initialize all the variables needed for this function, and calculate many of the values which will be copied into the new sequence object.
					var i, j, propertyName, curTargetTransformations, curTargetNumTransformations, newPoller,
						newRunning = (matchRunningStatus && thisProtected.running), newCurrentTime = thisProtected.currentTime,
						newSynchronizer = thisProtected.synchronizer, newSpeed = thisProtected.speed,
						newTimeOffset = thisProtected.timeOffset, newPollingInterval = thisProtected.pollingInterval,
						newInitialSyncSourcePoint = thisProtected.initialSyncSourcePoint,
						numAllTransformations = thisProtected.allTransformations.length,
						newTransformationsAdded = 0, newDynamicValueTransformationsAdded = 0,
						curNewTransformation, allNewTransformations = new Array(numAllTransformations),
						newDynamicValueTransformations = new Array(thisProtected.dynamicValueTransformations.length),
						targetSequences = thisProtected.targetSequences, numTargetSequences = targetSequences.length,
						newTargetSequences = new Array(numTargetSequences), curTargetSequence, targetSequenceCloneReturn,
						timelineSegments = thisProtected.timelineSegments, numTimelineSegments = timelineSegments.length,
						newTimelineSegments = new Array(numTimelineSegments), curTimelineSegment,
						defaults = thisProtected.defaults, newDefaults = {},
						newSequence = new _Concert.Sequence(), newPublicData = {}, newProtectedData,
						newSoleControlOptimizationDuringRun = thisProtected.soleControlOptimizationDuringRun;

					// Iterate through all the target sequences of this sequence, for each one creating a new one that is identical
					// except for the target object.
					for (i = 0; i < numTargetSequences; i++)
					{
						// Get the current target sequence. Look up the new animation target, using the target lookup function
						// passed into this function. Call the target sequence's clone() method to create a copy of it
						// that has a different target.
						curTargetSequence = targetSequences[i];
						targetSequenceCloneReturn = curTargetSequence.clone(targetLookupFunction(curTargetSequence.getTarget()));

						// The return value of the clone() method called above is an object with two properties:
						//   targetSequence: the new target sequence clone that was created
						//   transformations: an array of all the transformations that were created in that clone
						// Get ahold of those things. For each new transformation, add it to an array containing all the
						// new transformations being added for all the target sequences in the cloned sequence.
						newTargetSequences[i] = targetSequenceCloneReturn.targetSequence;
						curTargetTransformations = targetSequenceCloneReturn.transformations;
						for (j = 0, curTargetNumTransformations = curTargetTransformations.length; j < curTargetNumTransformations; j++)
						{
							curNewTransformation = curTargetTransformations[j];
							allNewTransformations[newTransformationsAdded] = curNewTransformation;
							newTransformationsAdded++;
							
							// If this new transformation uses value generators, add it to the array of all new transformations that use those, also.
							// That list will need to be part of the internal data structure of the new clone sequence.
							if (curNewTransformation.hasDynamicValues())
							{
								newDynamicValueTransformations[newDynamicValueTransformationsAdded] = curNewTransformation;
								newDynamicValueTransformationsAdded++;
							}
						} // end for loop iterating over all target transformations of the current target sequence
					} // end for loop iterating over all target sequences

					// The timelineSegments array stores all the blocks of time (start and end times) in which animation is occurring during the sequence.
					// This is used for indexing and quickly seeking to any time.
					// Create a duplicate of this array for use in the new (cloned) sequence.
					for (i = 0; i < numTimelineSegments; i++)
					{
						curTimelineSegment = timelineSegments[i];
						newTimelineSegments[i] = new _Concert.TimelineSegment(curTimelineSegment.startTime, curTimelineSegment.endTime);
					}

					// Grab an array of any and all extra properties belonging to this sequence object, to apply also to the new one.
					for (propertyName in defaults) if (Object.prototype.hasOwnProperty.call(defaults, propertyName))
						newDefaults[propertyName] = defaults[propertyName];

					// The newRunning variable has been calculated above to true or false based on whether the new sequence will be created
					// in an already-running state. (It is possible to clone a running sequence and match its running status.)
					// If creating an already-running sequence, assign it a poller matching the present one; otherwise it gets no poller (null).
					newPoller = newRunning ? (newPoller = (newPollingInterval < 1) ? (new _Concert.Pollers.Auto()) : (new _Concert.Pollers.FixedInterval(newPollingInterval))) : null;

					// Set up an object containing all the protected data that will belong to the new sequence object,
					// as calculated in above steps or as copied from existing data members of this sequence object.
					newProtectedData =
						{
							targetSequences: newTargetSequences,
							timelineSegments: newTimelineSegments,
							lastUsedTimelineSegmentNumber: thisProtected.lastUsedTimelineSegmentNumber,
							allTransformations: allNewTransformations,
							dynamicValueTransformations: newDynamicValueTransformations,
							indexCompletionCallbacks: [],
							indexed: thisProtected.indexed,
							indexingInProgress: false,
							indexTimerID: null,
							indexingProcessData: {},
							running: newRunning,
							currentTime: newCurrentTime,
							unadjustedTime: thisProtected.unadjustedTime,
							sequenceStartTime: thisProtected.sequenceStartTime,
							sequenceEndTime: thisProtected.sequenceEndTime,
							poller: newPoller,
							synchronizer: newSynchronizer,
							initialSyncSourcePoint: newInitialSyncSourcePoint,

							defaults: newDefaults,

							synchronizeTo: thisProtected.synchronizeTo,
							speed: newSpeed,
							timeOffset: newTimeOffset,
							pollingInterval: newPollingInterval,
							after: thisProtected.after,
							before: thisProtected.before,
							autoStopAtEnd: thisProtected.autoStopAtEnd,
							onAutoStop: thisProtected.onAutoStop,
							stretchStartTimeToZero: thisProtected.stretchStartTimeToZero,
							soleControlOptimizationDuringRun: newSoleControlOptimizationDuringRun
						};

					// Call a utility function to fill in values for all the new sequence object's data members.
					_loadObjectData.call(newSequence, newPublicData, newProtectedData);

					// If the caller specified immediately seeking the new sequence to the same point as the one being cloned, call its seek() method.
					if (doInitialSeek)
						newSequence.seek(newCurrentTime, newSoleControlOptimizationDuringRun);

					// If the caller specified immediately running the new sequence, start its poller running and seeking the new sequence on every poller tick.
					if (newRunning)
						newPoller.run(function () { newSequence.seek(newInitialSyncSourcePoint + newSpeed * (newSynchronizer() - newInitialSyncSourcePoint) + newTimeOffset, newSoleControlOptimizationDuringRun); });

					return newSequence;
				} // end __clone()


				/**
				 * Runs a transformation starting from the current timeline position, locked to the specified synchronization source. This differs from the [syncTo]{@link Concert.Sequence#syncTo} method
				 * in that <code>follow</code> causes the sequence to run exactly in time with the synchronization source and in the same direction, but starting at the current timeline position, whereas
				 * with [syncTo]{@link Concert.Sequence#syncTo} the sequence will first jump to a timeline position matching the current value of the synchronization source and then do the same.
				 * This is really just a shortcut method provided for a common usage scenario; it is exactly the same as calling the [run]{@link Concert.Sequence#run} method with the parameters
				 * <code>{ synchronizeTo: <em>syncSource</em>, initialSeek: null, timeOffset: null }</code>. Note that these parameter values can still be overridden, or any of the other parameters
				 * accepted by the [run]{@link Concert.Sequence#run} method can be specified in the <code>parameters</code> argument passed into this method.
				 * @name follow
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Varies} syncSource A synchronization source. Can take any of the following different types of values:
				 * <ul>
				 * 	<li>
				 * 		<code>null</code>: locks sequence to the system clock.
				 * 	</li>
				 * 	<li>
				 * 		<code><em>function object</em></code>: the passed-in function is called every time the polling
				 *       interval is reached, and the return value is used as the seek time.
				 *       Using a custom function here allows you to synchronize the sequence to anything you want
				 * 		(for instance, locking it to the current value of a UI element, such as a slider,
				 *  	or to another Concert.Sequence object.)
				 * 	</li>
				 * 	<li>
				 * 		<code><em>html audio or video DOM object</em></code>:
				 *  	locks the sequence to the currentTime property of the media element.
				 *  	This allows the sequence to remain synchronized to the media even when it is paused, scrubbed,
				 *  	or the user skips around.
				 * 	</li>
				 * </ul>
				 * @param {Object} [parameters] An object with property values setting options for how to run the sequence.
				 * See the [run]{@link Concert.Sequence#run} method for information on allowable properties and values in this object.
				 */
				function __follow(syncSource, parameters)
				{
					var thisPublic = this.thisPublic; //, thisProtected = _getProtectedMembers.call(thisPublic); // Can save a few bytes in the minified version since thisProtected isn't used in this function

					// Run this sequence, synchronized to the specified object, starting at this sequence's present seek point.
					thisPublic.run(_getCombinedParams({ synchronizeTo: syncSource, initialSeek: null, timeOffset: null }, parameters));
				} // end __follow()


				/**
				 * Calls the value generation functions attached to transformations that have value generators instead of fixed start and end values.<br>
				 * <em>It may be useful at times to define transformations whose start and end values are not fixed at the time the transformations are first defined,
				 * but which instead are calculated dynamically at some later time prior to running the sequence. This is accomplished by specifying functions instead
				 * of start and end values, as explained in the documentation for the [addTransformations]{@link Concert.Sequence#addTransformations} method.
				 * Those functions (for all such transformations in a sequence) are then called, and their return values stored as the start and end values of their
				 * respective transformations, either at the time the sequence is run by specifying the appropriate option when calling the [run]{@link Concert.Sequence#run},
				 * [begin]{@link Concert.Sequence#begin}, [follow]{@link Concert.Sequence#follow}, or [syncTo]{@link Concert.Sequence#syncTo} methods, or at any time by
				 * calling <code>generateValues</code>.</em>
				 * @name generateValues
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 */
				function __generateValues()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);
					var i;

					// Get ahold of the array of all transformations in the sequence that use value generators instead of having
					// values specified at the time the transformations were added to the sequence.
					var dynamicValueTransformations = thisProtected.dynamicValueTransformations,
						numDynamicValueTransformations = dynamicValueTransformations.length;

					// Iterate over all the transformations that use value generators, and for each one, tell it to generate its values.
					for (i = 0; i < numDynamicValueTransformations; i++)
						dynamicValueTransformations[i].generateValues(thisPublic);
				} // end __generateValues();


				/**
				 * Gets the current position along a sequence's timeline.
				 * @name getCurrentTime
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @returns {number} The sequence's current timeline position.
				 */
				function __getCurrentTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.currentTime;
				} // end _getCurrentTime()


				/**
				 * Gets the end time of a sequence's timeline. This end time of a sequence is considered to be the last end time of any transformation within that sequence.
				 * @name getEndTime
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @returns {number} The end time of the sequence's timeline.
				 */
				function __getEndTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// If the sequence isn't yet indexed, run the indexer first, so we can have a known end time to return.
					if (!(thisProtected.indexed))
						thisPublic.index(null, false);

					return thisProtected.sequenceEndTime;
				} // end __getEndTime()


				/**
				 * Returns a unique integer identifying this sequence.
				 * @name getID
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @returns {number} The sequence ID.
				 */
				function __getID()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.ID;
				} // end __getID()


				/**
				 * Gets the start time of a sequences timeline. The start time of a sequence is considered to be the first start time of any transformation within that sequence.
				 * @name getStartTime
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @returns {number} The start time of the sequence's timeline.
				 */
				function __getStartTime()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// If the sequence isn't yet indexed, run the indexer first, so we can have a known start time to return.
					if (!(thisProtected.indexed))
						thisPublic.index(null, false);

					// Sequences have an option called stretchStartTimeToZero, which allows the sequence to act as though its start time is 0
					// even if the first transformation in the sequence starts at a time greater than 0. This prevents a sequence whose first
					// animations begin some time into the timeline from auto-stopping or triggering its before-start behavior when being run
					// from time 0.
					// So here we return the sequence's start time, unless stretchStartTimeToZero is true, in which case the lesser is returned
					// of the actual start time and 0.
					return (thisProtected.stretchStartTimeToZero ? Math.min(thisProtected.sequenceStartTime, 0) : thisProtected.sequenceStartTime);
				} // end __getStartTime()


				/**
				 * Indexes a sequence. This function is run automatically (if necessary) any time a sequence is run or the [seek]{@link Concert.Sequence#seek} method is called.
				 * However, for very large sequences (large enough that indexing would cause a noticable lag), it may be desirable to manually control when indexing takes place
				 * (that is, to pre-index the sequence), so that seeking or running will begin instantly. Once indexed, a sequence (or any sequences cloned from it) will not need
				 * to be indexed again unless new transformations are added to it.<br><br>
				 * <strong>Explanation of Indexing:</strong> Concert.js sequences can consist of very large numbers of transformations applied to numerous target objects,
				 * with the ability to seek extremely quickly to any point in the sequence. This is what makes it useful for synchronizing to other things (such as audio or video)
				 * and for other situations that require arbitrary seeking, running at different speeds or in either direction, or other uses that don't conform to a simple,
				 * run-once-forward-only-at-normal-speed scenario. What makes this possible is an internal data structure that optimizes for quickly finding the correct value
				 * to apply to every target feature of every one of the objects being animated, at any point along the timeline. This internal structure involves a set of pre-built indexes
				 * of timeline segments. Much like indexes on database tables, this vastly speeds up run-time lookup performance by doing some processing ahead of time to analyze and organize the data.
				 * Every sequence needs to be indexed once (or again after any new transformations are added). Running or seeking to any point in an un-indexed sequence will cause indexing to take place
				 * automatically, or indexing can be run manually with this method. In many cases, the automatic indexing will run fast enough that manually running the indexer is not necessary.
				 * @name index
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {function} completionCallback This function will be executed upon completion of indexing. It is especially useful if the <code>isAsynchronous</code>
				 * parameter is set to <code>true</code>. The function specified here should have a signature of the form <code>someCallBackFunction(sequenceObject)</code>.
				 * That is, the function will be called with a single argument, which will be the sequence object whose indexing has completed. (For purposes of handling this
				 * callback when there are multiple sequences being manipulated, it may also be helpful to remember that every [Sequence]{@link Concert.Sequence} object has a
				 * unique  integer ID which can be retrieved using the [getID]{@link Concert.Sequence#getID} method.)
				 * @param {boolean} isAsynchronous If <code>true</code>, the indexing process will not be run all at once, but will instead be broken into
				 * smaller chunks of work and scheduled using calls to <code>window.setTimeout</code>. This is useful for very large sequences, to help reduce
				 * or eliminate any noticable pause in browser responsiveness while indexing is taking place.<br>
				 * <em>For the current version, the indexer makes a best effort to keep each processing chunk under 100 ms. Future versions may allow the
				 * programmer to adjust this value, and may also be able to incorporate web workers as a way of pushing most of the work into a completely separate,
				 * concurrent thread.
				 */
				function __index(completionCallback, isAsynchronous)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					if (thisProtected.indexed && completionCallback)
						completionCallback(thisPublic); // Indexing is already completed. Just go ahead and call the on-completion callback function.
					else if (thisProtected.allTransformations.length < 1)
					{
						// Indexing is not completed, but there are no transformations to index.
						// Set the indexed variable to true, indicating indexing is now completed, and call the on-completion callback function.
						thisProtected.indexed = true;
						if (completionCallback)
							completionCallback(thisPublic);
					}
					else
					{
						// Indexing is not completed. We need to do the indexing now.

						// If a callback function was passed in to run on completion, add it to the array of functions to call
						// upon indexing completion (this is done because it is possible this function was called while indexing was
						// already in progress with a callback function waiting for its completion, meaning now there is more than one
						// function needing to be called at index completion time.)
						if (completionCallback)
							thisProtected.indexCompletionCallbacks.push(completionCallback);

						// If indexing is already in progress, cancel it, and reset all the internal variables tracking indexing status.
						if (!thisProtected.indexingInProgress)
							thisProtected.resetIndexing();

						// Record internally whether the indexing will proceed synchronously or asynchronously.
						thisProtected.indexingProcessData.isAsynchronous = isAsynchronous ? true : false;

						// Start the sequence indexing process.
						thisProtected.runIndexing();
					}
				} // end __index()


				/**
				 * Gets a value indicating whether the sequence is currently running or not.
				 * @name isRunning
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @returns {boolean} <code>true</code> if the sequence is currently running, <code>false</code> otherwise.
				 */
				function __isRunning()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					return thisProtected.running;
				} // end __isRunning()


				/**
				 * Changes the target objects for all the transformations in a sequence. This could be useful if a sequence is being defined before its targets are created.
				 * For instance, if it will be used to animate DOM elements that don't yet exist at the time the sequence is being created, a sequence can be created with
				 * placeholder targets (such as strings or integers), and then the real targets substituted in later with this method.
				 * (If you wish to apply the same sequence to multiple sets of targets, or to more than one set of targets simultaneously, you may wish to see the [clone]{@link Concert.Sequence#clone} method.)
				 * @name retarget
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {function} targetLookupFunction A function that, when passed a transformation target from the sequence as currently defined, returns the new object to be targeted.
				 */
				function __retarget(targetLookupFunction)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Get the array of all target sequences (that is, an array of all the transformation sequences organized by the objects they target).
					var targetSequences = thisProtected.targetSequences, numTargetSequences = targetSequences.length;

					// Iterate over all the target sequences. For each one, tell it to retarget all its transformations to whatever target object
					// is returned by calling the target lookup function that was passed in, passing it the current target to use in looking up
					// what the corresponding new target should be.
					var i, curTargetSequence;
					for (i = 0; i < numTargetSequences; i++)
					{
						curTargetSequence = targetSequences[i];
						curTargetSequence.retarget(targetLookupFunction(curTargetSequence.getTarget()));
					}
				} // end _retarget()


				/**
				 * Runs the sequence, with the options defined in the <code>parameters</code> object.
				 * For many purposes, one of the other run methods ([begin]{@link Concert.Sequence#begin}, [follow]{@link Concert.Sequence#follow}, or [syncTo]{@link Concert.Sequence#syncTo})
				 * may be easier, because they assume certain default options that are correct in most usage scenarios, but this method is the general-purpose way to run a sequence
				 * with any set of behavioral options, and is in fact used behind the scenes by those other methods. Except for <code>generateValues</code>, <code>initialSeek</code>, and
				 * <code>timeOffset</code> (the last of which is automatically re-calculated if null), options specified in the <code>parameters</code> object are remembered and will be retained
				 * as the default values. This means for restarting stopped sequences, it is not always necessary to explicitly re-state all the options, and it also means that this method can be
				 * called on an already-running sequence to change run-time options on the fly.
				 * @name run
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Object} [parameters] An object with property values setting options for how to run the sequence.
				 * Defined as follows below. Any or all of the below options may be specified:
				 * <pre><code><em>parameters =
				 * {
				 *   <strong>after</strong>: <em>VALUE</em>, // Initial default: Concert.Repeating.None
				 *   <strong>autoStopAtEnd</strong>: <em>VALUE</em>, // Initial default: true
				 *   <strong>before</strong>: <em>VALUE</em>, // Initial default: Concert.Repeating.None
				 *   <strong>generateValues</strong>: <em>VALUE</em>, // Default value: true
				 *   <strong>initialSeek</strong>: <em>VALUE</em>, // Default: null
				 *   <strong>onAutoStop</strong>: <em>VALUE</em>, // Initial default: null
				 *   <strong>pollingInterval</strong>: <em>VALUE</em>, // Initial default: 0
				 *   <strong>speed</strong>: <em>VALUE</em>, // Initial default: 1
				 *   <strong>stretchStartTimeToZero</strong>: <em>VALUE</em>, // Initial default: true
				 *   <strong>synchronizeTo</strong>: <em>VALUE</em>, // Initial default: null
				 *   <strong>timeOffset</strong>: <em>VALUE</em>, // Default value: null
				 *   <strong>useSoleControlOptimization</strong>: <em>VALUE</em> // Initial default: true
				 * }</em></code></pre>
				 * 
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>after</em></strong>
				 *  = Function which defines how the sequence behaves when the sequence end time is reached and exceeded.
				 * </code>
				 * (Can also be set using the [setAfter]{@link Concert.Sequence#setAfter} method.)
				 * Takes one of the functions defined in the [Concert.Repeating]{@link Concert.Repeating} namespace, or a custom function.
				 * For instance, a value of Concert.Repeating.Loop(2) will cause the sequence to loop back to the beginning twice
				 * (thus running a total of three times) before ceasing. See [Concert.Repeating]{@link Concert.Repeating} for information
				 * on the pre-defined values, or see [setAfter]{@link Concert.Sequence#setAfter} for more information on using a custom function.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>autoStopAtEnd</em></strong>
				 * 	= Boolean value indicating whether or not to automatically call stop() upon hitting the end.
				 * </code>
				 * (Note that "the end" means after all looping, bouncing, etc. is taken into account.)
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>before</em></strong>
				 * 	= Function which defines how the sequence behaves when the calculated current time is at or less than the sequence start time.
				 * </code>
				 * (Can also be set using the [setBefore]{@link Concert.Sequence#setBefore} method.)
				 * Takes one of the functions defined in the [Concert.Repeating]{@link Concert.Repeating} namespace, or a custom function.
				 * For instance, a value of Concert.Repeating.Loop(2) will cause the sequence to loop back to the end twice
				 * (thus running a total of three times) before ceasing. See [Concert.Repeating]{@link Concert.Repeating} for information
				 * on the pre-defined values, or see [setBefore]{@link Concert.Sequence#setBefore} for more information on using a custom function.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>generateValues</em></strong>
				 * 	= Boolean value.
				 * </code>
				 * If the sequence has any transformations whose start and end values are dynamic rather than fixed
				 * (see [addTransformations]{@link Concert.Sequence#addTransformations} for details), the actual values
				 * to use will have to be calculated at some point in order to run the sequence.
				 * This can be accomplished by calling [generateValues]{@link Concert.Sequence#generateValues} manually,
				 * or it will happen automatically just before run-time if this parameter is set to true.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>initialSeek</em></strong>
				 * 	= Numeric value indicating an initial seek point along the timeline.
				 * </code>
				 * If specified and non-null, sequence will seek to this time before commencing the run.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>onAutoStop</em></strong>
				 * 	= Function called upon reaching the end of the sequence.
				 * </code>
				 * This specifies a callback function to be invoked just after automatically stopping at the
				 * end of the sequence. It only will be called if autoStopAtEnd is true.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>pollingInterval</em></strong>
				 * 	= Numeric value indicating the time in between animation updates.
				 * </code>
				 * In other words, how often (in milliseconds) to calculate and seek to a new timeline position when running.
				 * Set to any value > 0 for manual control, or set to 0 (or anything < 1) to let Concert determine this automatically.
				 * (It does this by using requestAnimationFrame() if the browser supports  it, or a fixed interval of 16 ms otherwise.)
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>speed</em></strong>
				 * 	= Numeric value indicating a run speed multiplier.
				 * </code>
				 * (0.5 = half-speed, 2 = double-speed, etc.)
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>stretchStartTimeToZero</em></strong>
				 * 	= Boolean value indicating whether to treat the sequence start time as 0 even if the first transformation
				 * 	in the sequence starts at a time greater than 0.
				 * </code>
				 * This prevents a sequence whose first animations begin some time into the timeline from auto-stopping
				 * or triggering its <em>before</em> behavior when it is run from time 0. To define the beginning of
				 * the sequence timeline as the beginning of the first transformation in the timeline no matter what, set to <em>false</em>.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>synchronizeTo</em></strong>
				 *  = a variable type which sets a synchronization source for this sequence.
				 * </code>
				 * Can take any of the following different types of values:
				 * <ul>
				 * 	<li>
				 * 		<code>null</code>: locks sequence to the system clock.
				 * 	</li>
				 * 	<li>
				 * 		<code><em>function object</em></code>:
				 * 		the passed-in function is called every time the polling interval is reached, and the return value is used as the seek time.
				 * 		Using a custom function here allows you to synchronize the sequence to anything you want
				 * 		(for instance, locking it to the current value of a UI element, such as a slider, or to another Concert.Sequence object.)
				 * 	</li>
				 * 	<li>
				 * 		<code><em>html audio or video DOM object</em></code>:
				 * 		locks the sequence to the currentTime property of the media element.
				 * 		This allows the sequence to remain synchronized to the media even when it is paused, scrubbed,
				 * 		or the user skips around.
				 * 	</li>
				 * </ul>
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>timeOffset</em></strong>
				 * 	= Numeric value indicating an offset added to the current time before seeking.
				 * </code>
				 * This is useful if you want your sequence to run fixed amount ahead of, or behind, your synchronization source.
				 * If null, this value is automatically calculated assuming that you want the current sequence time
				 * (or the sequence start time if no calls to seek() have yet been made) to match up with the current return value
				 * of the synchronization source. For instance, you may have a sequence that runs, locked to the system clock,
				 * from time 0 to time 10000 (i.e., for 10 seconds). But the raw value coming from the system clock is never between 0 and 10000;
				 * it is the number of milliseconds since January 1, 1970 00:00:00 UTC, which is a very high number.
				 * The timeOffset value is therefore added in order to translate the raw starting clock value to the start time of the sequence.
				 * But because this automatic translation may not always be the desired behavior, it can be explicitly set here.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>useSoleControlOptimization</em></strong>
				 * 	= Boolean value indicating whether the sequence can optimize assuming it is the only thing controlling
				 * 	all the object properties it is modifying.
				 * </code>
				 * If your sequence is animating a property whose values could also be modified by anything else, this should be
				 * set to <code>false</code>. When <code>true</code>, the sequence will assume that every value it has set has remained set.
				 * If, for instance, two successive animation frames both would set the <code>left</code> property of a <code>DIV</code> object
				 * to "200px", the sequence won't bother setting the value again during second frame, assuming it is still set from the first frame.
				 * This speeds up seek times and thus improves overall performance. But if something else has modified the value in the meantime,
				 * failing to set the value on the second frame could result in unexpected behavior.
				 * See the [seek]{@link Concert.Sequence#seek} method for details.
				 * (Note that regardless of the value specified here, the seek method can be called manually at any point with its
				 * useSoleControlOptimization parameter set to either true or false.)
				 * </p>
				 */
				function __run(parameters)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var synchronizeTo, speed, timeOffset, initialSeek, pollingInterval,
						synchronizer, initialSyncSourcePoint, soleControlOptimizationDuringRun;

					// Need to halt before re-running with the new parameters.
					if (thisProtected.running)
						thisPublic.stop();

					// Sequence needs to be indexed before it can run.
					if (!(thisProtected.indexed))
						thisPublic.index(null, false);

					// If the parameters passed in specify generating all the start and end values now, do so.
					// Otherwise, we assume they have already been generated at a time chosen by the user.
					if (_getParamValue(parameters, "generateValues", true))
						thisPublic.generateValues();

					// Determine if the caller specified an initial seek point. If so, jump to it.
					initialSeek = _getParamValue(parameters, "initialSeek", null);
					if (initialSeek !== null)
						thisPublic.seek(initialSeek, false);

					// Determine a number of run-time parameters needed. If they were specified in the passed-in parameters,
					// use the specified values. Otherwise, use the values already stored in the sequence.
					thisProtected.speed = speed = _getParamValue(parameters, "speed", thisProtected.speed);
					thisProtected.after = _getParamValue(parameters, "after", thisProtected.after);
					thisProtected.before = _getParamValue(parameters, "before", thisProtected.before);
					thisProtected.autoStopAtEnd = _getParamValue(parameters, "autoStopAtEnd", thisProtected.autoStopAtEnd);
					thisProtected.onAutoStop = _getParamValue(parameters, "onAutoStop", thisProtected.onAutoStop);
					thisProtected.stretchStartTimeToZero = _getParamValue(parameters, "stretchStartTimeToZero", thisProtected.stretchStartTimeToZero);
					thisProtected.soleControlOptimizationDuringRun = soleControlOptimizationDuringRun = _getParamValue(parameters, "useSoleControlOptimization", thisProtected.soleControlOptimizationDuringRun);

					// Set up a poller. If a polling interval was specified (or, more precisely, if one of 1ms or greater was specified),
					// create a fixed-interval poller. Otherwise, create an automatic one.
					thisProtected.pollingInterval = pollingInterval = _getParamValue(parameters, "pollingInterval", thisProtected.pollingInterval);
					thisProtected.poller = (pollingInterval < 1) ? (new _Concert.Pollers.Auto()) : (new _Concert.Pollers.FixedInterval(pollingInterval));

					// Set the synchronization function for this run.
					// If the synchronization value passed in (or, if none, the one belonging to the sequence) is null,
					// create a synch function that synchronizes to the system clock, starting with the present time.
					// If the synchronization value passed in is a function, use that as the synchronization function.
					// Otherwise, create a synch function that attaches to the currentTime property of the thing passed in
					// (which is presumed to be something like an HTML audio or video element, having a currentTime property whose value is measured in seconds.)
					synchronizeTo = _getParamValue(parameters, "synchronizeTo", thisProtected.synchronizeTo);
					if (synchronizeTo === null)
						synchronizer = function () { return getNowTime(); };
					else
						synchronizer = ((typeof synchronizeTo) === "function") ? synchronizeTo : function () { return 1000 * synchronizeTo.currentTime; };
					thisProtected.synchronizer = synchronizer;

					// Record the initial point we are synchronizing to. Adjust it by the time offset, if one was specified.
					thisProtected.initialSyncSourcePoint = initialSyncSourcePoint = synchronizer();
					timeOffset = _getParamValue(parameters, "timeOffset", null);
					if (timeOffset === null)
						timeOffset = (thisProtected.unadjustedTime !== null) ? (thisProtected.unadjustedTime - initialSyncSourcePoint) : (thisPublic.getStartTime() - initialSyncSourcePoint);
					thisProtected.timeOffset = timeOffset;

					// Mark the sequence as running, and set the poller going with a callback function to do a seek on every poller tick.
					thisProtected.running = true;
					thisProtected.poller.run(function () { thisPublic.seek(initialSyncSourcePoint + speed * (synchronizer() - initialSyncSourcePoint) + timeOffset, soleControlOptimizationDuringRun); });
				} // end __run()


				/**
				 * Seeks to the specified point along the sequence timeline.
				 * If the <code>time</code> value is less than the sequence's start time or greater than the sequence's end time,
				 * the resulting behavior will be defined by the sequence's "before" or "after" repeating behavior settings,
				 * as controlled by the [setBefore]{@link Concert.Sequence#setBefore} and [setAfter]{@link Concert.Sequence#setAfter} methods
				 * or by the options passed into the [run]{@link Concert.Sequence#run}, [begin]{@link Concert.Sequence#begin},
				 * [follow]{@link Concert.Sequence#follow}, or [syncTo]{@link Concert.Sequence#syncTo} methods.
				 * The default behavior, if none has explicitly been specified, is [Concert.Repeating.None]{@link Concert.Repeating},
				 * which seeks to the sequence start time for any <code>time</code> value less than or equal to the sequence's
				 * start time, and to the end time for any <code>time</code> value greater than or equal to the sequence's end time.
				 * The <code>useSoleControlOptimization</code> option, when set to true, enhances run-time performance,
				 * but should only be used if nothing other than the Concert sequence will be modifying any target object properties
				 * that are modified by transformations in the sequence. Essentially it skips updating target object properties
				 * any time a newly calculated value is the same as the last one applied. This speeds up seek times,
				 * especially when doing relatively slow things such as DOM updates. However, if a target object property's value
				 * has been changed by something else since the last time the sequence object touched it, this optimization
				 * can result in that value not being updated by the seek() function.
				 * @name seek
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {number} time The intended seek point.
				 * @param {boolean} [useSoleControlOptimization] Whether or not the sequence can optimize by assuming sole control over the target objects.
				 */
				function __seek(time, useSoleControlOptimization)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var i, segmentMatch, segmentNumber, sequenceStart, sequenceEnd,
						adjustedTimeContainer, adjustedTime, frameID, forceApplication,
					    hitFinalBoundary = false,
					    targetSequences = thisProtected.targetSequences,
					    numTargetSequences = targetSequences.length;

					// Before seeking anywhere, the sequence needs to be indexed.
					if (!(thisProtected.indexed))
						thisPublic.index(null, false);

					// Get / calculate the overall start and end times for the sequence.
					sequenceStart = thisPublic.getStartTime();
					sequenceEnd = thisProtected.sequenceEndTime;

					// Set a present frame number.
					frameID = thisProtected.nextFrameID++;

					// The time we are seeking to could be before the beginning of the sequence or after its end.
					// Sequences can have defined before-the-beginning and after-the-end behavior (such as looping, or bouncing, etc.),
					// so if we are before the beginning or after the end, we here look up what the "before" or "after" behavior definition
					// mandates based on how far past the beginning or end we are, whether we've hit the final end (or beginning),
					// and what the calculated equivalent time point is in the sequence to which we should seek. (For instance,
					// if looping twice, and we've gone just past the end in real time, the calculated seek point should be just past
					// the beginning, since we're on the first loop back to the beginning.)
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
						adjustedTime = time; // Not past the beginning or end, so the time to seek to is the real present time.

					// Record the seek-to time and the real time.
					thisProtected.currentTime = adjustedTime;
					thisProtected.unadjustedTime = time;

					// Find the indexed sequence segment that this moment in time fits within (if there is one), and seek to the right spot in it.
					segmentMatch = thisProtected.findSequenceSegmentNumberByTime(adjustedTime);
					if (segmentMatch !== null)
					{
						segmentNumber = segmentMatch.segmentNumber;

						// We track the last segment number to which we have done a seek.
						// This allows an optimization of not actually forcing updates when values have not changed.
						// If the present segment is not the same as the last one to which we have done a seek,
						// then force all updates when doing this seek. Otherwise, forcing updates of all targets occurs,
						// or does not occur, based on whether the useSoleControlOptimization option is set.
						if (segmentNumber !== thisProtected.lastSegmentNumber)
						{
							forceApplication = true;
							thisProtected.lastSegmentNumber = segmentNumber;
						}
						else
							forceApplication = (typeof useSoleControlOptimization === "undefined") ? true : !useSoleControlOptimization;
						
						// For each target object, tell its corresponding target sequence to do whatever needs to happen to that target
						// to seek its animation to the correct time.
						for (i = 0; i < numTargetSequences; i++)
							targetSequences[i].seek(segmentNumber, adjustedTime, frameID, forceApplication);
					} // end if (segmentMatch !== null)

					// If the seek point is outside the time boundaries of the sequence, and the sequence is running,
					// and the sequence is set to auto-stop, this is when we should stop, and invoke the callback function
					// stored (if the user specified one) for when auto-stop occurs.
					if (hitFinalBoundary && thisProtected.running && thisProtected.autoStopAtEnd)
					{
						thisPublic.stop();
						if (thisProtected.onAutoStop)
							thisProtected.onAutoStop(thisPublic);
					}
				} // end __seek()


				/**
				 * Sets the behavior of the sequence when asked to seek after its end time. For instance, it may halt, loop, or bounce.
				 * @name setAfter
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {function} newAfter One of the functions defined in [Concert.Repeating]{@link Concert.Repeating}, or a custom function.
				 * For any sequence where this is not explicitly set, the "after" behavior defaults to <code>Concert.Repeating.None</code>.
				 * Any function passed in here should have a signature of the form <code>function (sequenceStart, sequenceEnd, unadjustedTime)</code> and must return
				 * an object of the form <code>{ adjustedTime: XXX, hitFinalBoundary: YYY }</code>, where <code>XXX</code> is the actual time to use in the seek, and
				 * <code>YYY</code> is a boolean value indicating whether this seek will put the sequence at one of its final boundary points. For instance, a looping
				 * behavior function could take an <code>unadjustedTime</code> value past the end of the sequence and map it to a resulting value somewhere between the
				 * sequence start and end times, and if it does not loop infinitely, a high enough input would result in hitting the final boundary beyond which looping
				 * does not continue. The <code>hitFinalBoundary</code> property value is what is used to determine whether to automatically call the
				 * [stop]{@link Concert.Sequence#stop} method if running with <code>autoStopAtEnd</code> set to <code>true</code>.
				 */
				function __setAfter(newAfter)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.after = newAfter;
				} // end __setAfter()


				/**
				 * Sets the behavior of the sequence when asked to seek before its start time. For instance, it may halt, loop, or bounce.
				 * @name setBefore
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Object} newBefore One of the functions defined in [Concert.Repeating]{@link Concert.Repeating}, or a custom function.
				 * For any sequence where this is not explicitly set, the "after" behavior defaults to <code>Concert.Repeating.None</code>.
				 * Any function passed in here should have a signature of the form <code>function (sequenceStart, sequenceEnd, unadjustedTime)</code> and must return
				 * an object of the form <code>{ adjustedTime: XXX, hitFinalBoundary: YYY }</code>, where <code>XXX</code> is the actual time to use in the seek, and
				 * <code>YYY</code> is a boolean value indicating whether this seek will put the sequence at one of its final boundary points. For instance, a looping
				 * behavior function could take an <code>unadjustedTime</code> value past the end of the sequence and map it to a resulting value somewhere between the
				 * sequence start and end times, and if it does not loop infinitely, a high enough input would result in hitting the final boundary beyond which looping
				 * does not continue. The <code>hitFinalBoundary</code> property value is what is used to determine whether to automatically call the
				 * [stop]{@link Concert.Sequence#stop} method if running with <code>autoStopAtEnd</code> set to <code>true</code>.
				 */
				function __setBefore(newBefore)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					thisProtected.before = newBefore;
				} // end __setBefore()


				/**
				 * When adding transformations to a sequence, several properties have default values and can therefore be left unspecified in the objects passed into the
				 * [addTransformations]{@link Concert.Sequence#addTransformations} method. This can be very helpful in avoiding repetition if most or all of the transformations
				 * have the same values for these properties. This method sets those default values for new transformations added to the sequence.
				 * @name setDefaults
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Object} newDefaults An object with property values setting default options for new transformations. Defined as follows.
				 * Any or all of the below options may be specified.
				 * <pre><code><em>newDefaults =
				 * {
				 *   <strong>applicator</strong>: VALUE, // Initial default value: Concert.Applicators.Property
				 *   <strong>calculator</strong>: VALUE, // Initial default value: Concert.Calculators.Linear
				 *   <strong>easing</strong>: VALUE, // Initial default value: Concert.EasingFunctions.ConstantRate
				 *   <strong>unit</strong>: VALUE, // Initial default value: null (no unit at all)
				 * }</em></code></pre>
				 * 
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>applicator</em></strong>
				 * 	= Function used to apply calculated target feature values to the target feature.
				 * </code>
				 * One of the [Concert.Applicators]{@link Concert.Applicators} functions, or a custom function.
				 * See [Concert.Applicators]{@link Concert.Applicators} and [addTransformations]{@link Concert.Sequence#addTransformations}
				 * for more information about the meaning of this property and its allowable values.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>calculator</em></strong>
				 * 	= Function used to calculate values applied to the target feature during the animation.
				 * </code>
				 * One of the [Concert.Calculators]{@link Concert.Calculators} functions, or a custom function.
				 * See [Concert.Calculators]{@link Concert.Calculators} and [addTransformations]{@link Concert.Sequence#addTransformations}
				 * for more information about the meaning of this property and its allowable values.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>easing</em></strong>
				 * 	= Function used to specify a rate curve for the animation.
				 * </code>
				 * One of the [Concert.EasingFunctions]{@link Concert.EasingFunctions} functions, or a custom function.
				 * See [Concert.EasingFunctions]{@link Concert.EasingFunctions} and [addTransformations]{@link Concert.Sequence#addTransformations}
				 * for more information about the meaning of this property and its allowable values.
				 * </p>
				 *
				 * <p class="ExplanationParagraph">
				 * <code>
				 * 	<strong><em>unit</em></strong>
				 * 	= String indicating the unit to be appended to the end of a calculated value before it is applied,
				 * 	or null if there is none.
				 * </code>
				 * Common values would include "px", "%", "em", and so on.
				 * </p>
				 */
				function __setDefaults(newDefaults)
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					var propertyName, defaults = thisProtected.defaults;

					// Copy all the properties from the passed-in object to this sequence's defaults object.
					for (propertyName in newDefaults) if (Object.prototype.hasOwnProperty.call(newDefaults, propertyName))
						defaults[propertyName] = newDefaults[propertyName];
				} // end __setDefaults()


				/**
				 * Stops a currently running sequence. Calling this function, whether explicitly or by setting <code>autoStopAtEnd</code> to <code>true</code>,
				 * is recommended when you wish the sequence to stop running or synchronizing, because otherwise the timers which continually update the sequence will continue to run.
				 * This may be the desired behavior if the sequence is being synchronized to a value which may continue to change, but in many cases it would be a waste of processor
				 * cycles to continue running a completed sequence. (Note that <code>autoStopAtEnd</code> is automatically enabled if the sequence is run using the
				 * [begin]{@link Concert.Sequence#begin} method.)
				 * @name stop
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 */
				function __stop()
				{
					var thisPublic = this.thisPublic, thisProtected = _getProtectedMembers.call(thisPublic);

					// Set the running state to false, stop the poller from generating new frames, and then remove the poller.
					thisProtected.running = false;
					if (thisProtected.poller)
					{
						thisProtected.poller.stop();
						thisProtected.poller = null;
					}
				} // end __stop()


				/**
				 * Runs a transformation locked to the specified synchronization source and matching its position. This differs from the [follow]{@link Concert.Sequence#follow} method
				 * in that [follow]{@link Concert.Sequence#follow} causes the sequence to run exactly in time with the synchronization source and in the same direction, but starting at the current
				 * timeline position, whereas with <code>syncTo</code> the sequence will first jump to a timeline position matching the current value of the synchronization source and then do the same.
				 * This is really just a shortcut method provided for a common usage scenario; it is exactly the same as calling the [run]{@link Concert.Sequence#run} method with the parameters
				 * <code>{ synchronizeTo: syncSource, initialSeek: null, timeOffset: 0, autoStopAtEnd: false }</code>. Note that these parameter values can still be overridden,
				 * or any of the other parameters accepted by the [run]{@link Concert.Sequence#run} method can be specified in the <code>parameters</code> argument passed into this method.
				 * @name syncTo
				 * @memberof Concert.Sequence#
				 * @public
				 * @method
				 * @param {Varies} syncSource A synchronization source. Can take any of the following different types of values:
				 * <ul>
				 * 	<li>
				 * 		<code>null</code>: locks sequence to the system clock.
				 * 	</li>
				 * 	<li>
				 * 		<code><em>function object</em></code>: the passed-in function is called every time the polling interval is reached,
				 * 		and the return value is used as the seek time. Using a custom function here allows you to synchronize the sequence
				 * 		to anything you want (for instance, locking it to the current value of a UI element, such as a slider,
				 * 		or to another Concert.Sequence object.)
				 * 	</li>
				 * 	<li>
				 * 		<code><em>html audio or video DOM object</em></code>: locks the sequence to the currentTime property of the media element.
				 * 		This allows the sequence to remain synchronized to the media even when it is paused, scrubbed, or the user skips around.
				 * 	</li>
				 * </ul>
				 * @param {Object} [parameters] An object with property values setting options for how to run the sequence.
				 * See the [run]{@link Concert.Sequence#run} method for information on allowable properties and values in this object.
				 */
				function __syncTo(syncSource, parameters)
				{
					var thisPublic = this.thisPublic; //, thisProtected = _getProtectedMembers.call(thisPublic); // Can save a few bytes in the minified version since thisProtected isn't used in this function

					// Run this sequence, synchronized to the specified function or object,
					// starting from the present position (no initial seek), and not stopping automatically.
					// That is, the sequence will stay synchronized with whatever it is being synched to until it is explicitly stopped.
					thisPublic.run(_getCombinedParams({ synchronizeTo: syncSource, initialSeek: null, timeOffset: 0, autoStopAtEnd: false }, parameters));
				} // end __syncTo()

				// ===============================================

				return SequenceConstructor;
			}), // end Sequence definition


		/**
		 * Can be used to avoid namespace collision problems.
		 * Sets the global variable Concert back to what it was before this component assigned a new value to it.
		 * Usage: run the Concert.js definition script (e.g., include the Concert.js file via a script element on a web page),
		 * then immediately capture the object assigned to <code>Concert</code> in some other, non-conflicting variable for
		 * actual use, and then call <code>Concert.revertNameSpace()</code> to put back <code>Concert</code> to whatever value it had before.
		 * @public
		 * @method
		 * @memberof Concert
		 */
		revertNameSpace:
			function ()
			{
				if (setGlobal)
					globalContext.Concert = previousNameSpaceValue;
			} // end revertNameSpace()
	}; // end _Concert


	var __Concert_PublicInterface =
		{
			Applicators: _Concert.Applicators,
			Calculators: _Concert.Calculators,
			EasingFunctions: _Concert.EasingFunctions,
			Repeating: _Concert.Repeating,

			Sequence: _Concert.Sequence,

			revertNameSpace: _Concert.revertNameSpace
		};

/* @ifndef ES_MODULE */
	return __Concert_PublicInterface;
} // end ConcertFactory()

})(this);
/* @endif */
