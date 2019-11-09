(function ()
{
	"use strict";

	var sequence = new Concert.Sequence();

	sequence.addTransformations(
		{
			target: document.getElementById("MovingDiv"),
			feature: ["left", "top"],
			unit: ["px", "px"],
			applicator: Concert.Applicators.Style,
			calculator: Concert.Calculators.Rotational, /*
			keyframes:
			{
				times: [0, 2000],
				values:
				[
					{ center: { left: 400, top: 300 }, offset: { left: -25, top: -25 }, radius: 25, angle: 0 },
					{ center: { left: 400, top: 300 }, offset: { left: -25, top: -25 }, radius: 25, angle: 2 * Math.PI }
				]
			} */
			keyframes: { times: [0, 2000], values: [[25, 0], [25, 2*Math.PI]] },
			userProperties:
			{
				center: [400, 300],
				offset: [-25, -25]
			}
		});

	document.getElementById("GoButton").onclick = function () { sequence.begin(); };
})();
