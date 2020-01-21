(function ()
{
	"use strict";

	window.sequence = new Concert.Sequence();
	let littleBox = document.getElementById("LittleBox"), bigBox = document.getElementById("BigBox"),
		theRect = document.getElementById("TheRect");

	sequence.addTransformations(
		[
			{
				target: littleBox,
				feature: "left",
				unit: "px",
				applicator: Concert.Applicators.Style,
				calculator: Concert.Calculators.Linear,
				keyframes:
					{
						times:  [0, 100, null, 200, 300, null, 400, 500, null, 600, 700, null, 800, 900, null, 1000, 1100, null, 1200, 1300, null, 1400, 1500, null, 1600, 1700],
						values: [0,  15, null,  50,  65, null, 100, 115, null, 150, 165, null, 200, 215, null,  250,  265, null,  300,  315, null,  350,  365, null,  400,  415]
					}
			},
			{
				target: bigBox,
				feature: "background-color",
				applicator: Concert.Applicators.Style,
				calculator: Concert.Calculators.Color,
				keyframes: { times: [0, 4000], values: ["#ff0000", "#ff000000"] }
			}
		]);
/*
	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["left"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [2000, 3000, null, 1000, 0], values: [550, 290, null, 190, 650] }
		});
*/
/*
	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["top"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [3000, 4000], values: [250, 190] }
		});
*/
/*
	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["left"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [0, 1000], values: [390, 450] }
		});
*/
/*
	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["top"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [1000, 2000], values: [190, 250] }
		});

	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["left"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [1250, 1500, 1750], values: [450, 475, 450] }
		});

	sequence.addTransformations(
		{
			target: littleBox,
			feature: ["top"],
			unit: ["px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			keyframes: { times: [500], values: [140] }
		});
*/
		document.getElementById("GoButton").onclick = function () { sequence.begin(); };
})();
