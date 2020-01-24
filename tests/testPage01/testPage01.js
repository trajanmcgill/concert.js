(function ()
{
	"use strict";

	window.sequence = new Concert.Sequence();
	let littleBox = document.getElementById("LittleBox"), bigBox = document.getElementById("BigBox"),
		theRect = document.getElementById("TheRect"),
		centerBox = document.getElementById("CenterBox"), orbitingBox = document.getElementById("OrbitingBox");

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
				keyframes: { times: [0, 4000], values: ["hsl(63,100%,50%)", "hsl(357,100%,50%)"] }
			},
			{
				target: littleBox,
				feature: ["left", "top"],
				unit: "px",
				applicator: Concert.Applicators.Style,
				calculator: Concert.Calculators.Linear,
				keyframes:
					{
						times: [2000, 4000],
						values: [[415, 190], [200, 400]]
					}
			}
		]);
	sequence.addTransformations(
		{
			target: bigBox,
			feature: "top",
			unit: "px",
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			calculatorModifiers: {},
			keyframes:
				{
					times: [0, 2000],
					values: [200, 400]
				}
		});
	sequence.addTransformations(
		{
			target: bigBox,
			feature: "top",
			unit: "px",
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Linear,
			calculatorModifiers: { multiply: 50, modulo: 250, round: 50, offset: 400 },
			segments: [{ t0: 2000, t1: 3000, v0: 0, v1: 10, calculatorModifiers: { multiply: 50, round: 50, offset: 400 } }]
		});
	
	sequence.addTransformations(
		[
			{
				target: centerBox,
				feature: "left",
				unit: "px",
				applicator: Concert.Applicators.Style,
				calculator: Concert.Calculators.Linear,
				keyframes: { times: [0, 4000], values: [0, 395] }
			},
			{
				target: orbitingBox,
				feature: ["left", "top"],
				unit: "px",
				applicator: Concert.Applicators.Style,
				calculator: Concert.Calculators.Rotational,
				calculatorModifiers:
					{
						centerX: {},
						centerY: {},
						radius: { multiply: 2 },
						angle: { round: Math.PI / 4 },
						offsetX: {},
						offsetY: {}
					},
				keyframes:
					{
						times: [0, 4000],
						values:
							[
								{ centerX: 5, centerY: 400, radius: 30, angle: 0, offsetX: -25, offsetY: -25 },
								{ centerX: 400, centerY: 400, radius: 30, angle: 4*Math.PI, offsetX: -25, offsetY: -25 }
							]
					}
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
