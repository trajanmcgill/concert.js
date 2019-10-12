/// <reference path="MediaSynchronization.js" />
/// <reference path="jquery-1.7.2.min.js" />
/// <reference path="MediaElement/mediaelement-and-player.js" />

var $CurrentTime;
var theTestMediaElement;
var synchronization1;

$(document).ready(function ()
{
	$CurrentTime = jQuery("#CurrentTime");
	testPlayer = new MediaElementPlayer(
		"#TestAudioElement",
		{
			success:
				function (mediaElement, domObject)
				{
					theTestMediaElement = mediaElement;
					//mediaElement.addEventListener("timeupdate", function (e) {  });
				}
		});

	synchronization1 = new MediaSynchronization.Synchronization(
		function () { return theTestMediaElement.currentTime; },
		[
			new MediaSynchronization.Element(document.getElementById("slide01"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),

					new MediaSynchronization.Transformation(5, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
				]),

			new MediaSynchronization.Element(document.getElementById("text01"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text02"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text03"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text04"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text05"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text06"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text07"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text08"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text09"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),
			new MediaSynchronization.Element(document.getElementById("text10"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),
					new MediaSynchronization.Transformation(1, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "font-size", 1, 50, "px", MediaSynchronization.ChangeCurve.Linear),
					new MediaSynchronization.Transformation(1, 4, MediaSynchronization.ChangingFeatureType.Style, "padding-left", 1, 500, "px", MediaSynchronization.ChangeCurve.Linear),
				]),

			new MediaSynchronization.Element(document.getElementById("slide02"),
				[
					new MediaSynchronization.Transformation(0, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "none", "none"),

					new MediaSynchronization.Transformation(5, 0, MediaSynchronization.ChangingFeatureType.Style, "display", "block", "block"),
				])
		]);

	//testPlayer.addEventListener("timeupdate", function () { $CurrentTime.text(testPlayer.currentTime); });
});

var testTimer = null;

function startTestTimer()
{
	testTimer = setInterval(intervalHandler, 1);
}

function stopTestTimer()
{
	if(testTimer != null)
		clearInterval(testTimer);
	testTimer = null;
}

function intervalHandler()
{
	var currentTime = theTestMediaElement.currentTime;
	$CurrentTime.text(currentTime.toString());
	synchronization1.seek(currentTime);
}

function check()
{
	var checkTime = parseFloat(jQuery("#TestInput").val());
	synchronization1.seek(checkTime);
}
/*
var y =
	[
		{
			id: "asdf",
			transformations:
				[
					{
						startTime: 0,
						duration: 5,
						featureType: MediaSynchronization.ChangingFeatureType.Style,
						featureName: "left",
						startValue: 0,
						endValue: 500,
						unit: "px",
						changeCurve: MediaSynchronization.ChangeCurve.Linear
					},
					{
						startTime: 5,
						duration: 5,
						changingFeatureType: MediaSynchronization.ChangingFeatureType.Style,
						changingFeatureName: "top",
						targetValue: 500,
						changeCurve: MediaSynchronization.ChangeCurve.Linear
					}
				]
		},
		{
			id: "qwerty",
			transformations:
				[
					{
						startTime: 5,
						duration: 0,
						changingFeatureType: MediaSynchronization.ChangingFeatureType.Style,
						changingFeatureName: "left",
						targetValue: 0
					},
					{
						startTime: 5,
						duration: 0,
						changingFeatureType: MediaSynchronization.ChangingFeatureType.Style,
						changingFeatureName: "top",
						targetValue: 0
					}
				]
		}
	];
*/
