(function ()
{
	"use strict";

	var callbackList = [];
	var unusedIDs = [];
	var timeoutID = null;
	var lastFrameTime = 0;

	function request(callback)
	{
		var newID = (unusedIDs.length > 0) ? unusedIDs.pop() : callbackList.length;
		callbackList[newID] = callback;
		if (timeoutID == null)
			timeoutID = window.setTimeout(doProcessing, Math.max(0, 16 - ((new Date()).getTime() - lastFrameTime)));
		return newID;
	};


	function cancel(requestID)
	{
		if (callbackList[requestID])
			cancelUnchecked(requestID);
	};


	function cancelUnchecked(requestID)
	{
		callbackList[requestID] = null;
		if (unusedIDs.length == callbackList.length - 1)
		{
			if (timeoutID != null)
			{
				window.clearTimeout(timeoutID);
				timeoutID = null;
			}
			callbackList = [];
			unusedIDs = [];
		}
		else
			unusedIDs.push(requestID);
	};


	function doProcessing()
	{
		var i, currentCallback;
		lastFrameTime = (new Date()).getTime();
		for (i = 0; i < callbackList.length; i++)
		{
			currentCallback = callbackList[i];
			if (currentCallback != null)
			{
				cancelUnchecked(i);

				try { currentCallback(lastFrameTime); }  // Exactly what value is passed to the callback function may still be changing in the spec.
				catch (e) { }
			}
		}
	};

	if (!(window.requestAnimationFrame))
	{
		// Note: The spec actually calls for there to be just one task, at the top-level browsing context,
		// processing all of the queued callbacks. Implemented here instead on a per-window basis to avoid
		// potentially running afoul of cross-site scripting restrictions.
		window.requestAnimationFrame = request;
		window.cancelAnimationFrame = cancel;
	}
})();