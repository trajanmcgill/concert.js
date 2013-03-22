(function ()
{
	"use strict";

	var nextID = 0, callbackAddQueue = {}, callbackProcessingQueue = {}, timeoutID = null, lastFrameTime = 0, callbackCount = 0, firstNewID = 0;

	// request(): This function is exported as window.requestAnimationFrame if it isn't already defined.
	// Adds a new animation frame callback to the queue of requests waiting for the next frame.
	// Returns an integer that uniquely identifies this request.
	function request(callback)
	{
		var newID = nextID;
		nextID++;

		callbackAddQueue[newID] = callback;
		callbackCount++;

		if (timeoutID === null)
			timeoutID = window.setTimeout(_doProcessing, Math.max(0, 16 - ((new Date()).getTime() - lastFrameTime)));

		return newID;
	}

	// cancel(): This function is exported as window.cancelAnimationFrame if it isn't already defined.
	// Cancels the outstanding frame request identified by the specified ID.
	function cancel(requestID)
	{
		if (requestID >= firstNewID && callbackAddQueue.hasOwnProperty(requestID))
			_cancelFrom(callbackAddQueue, requestID);
		else if (callbackProcessingQueue.hasOwnProperty(requestID))
			_cancelFrom(callbackProcessingQueue, requestID);
	}

	// _cancelFrom(): Internal function that removes an outstanding frame request from a particular queue.
	function _cancelFrom(queue, requestID)
	{
		delete queue[requestID];
		callbackCount--;
		if (callbackCount < 1 && timeoutID !== null)
		{
			window.clearTimeout(timeoutID);
			timeoutID = null;
		}
	}

	// _doProcessing(): Internal function that processes the queue and makes all the callbacks.
	function _doProcessing()
	{
		var requestID, currentCallback;

		timeoutID = null;
		lastFrameTime = (new Date()).getTime();

		callbackProcessingQueue = callbackAddQueue;
		callbackAddQueue = {};
		firstNewID = nextID;

		for (requestID in callbackProcessingQueue)
		{
			if (callbackProcessingQueue.hasOwnProperty(requestID))
			{
				currentCallback = callbackProcessingQueue[requestID];
				delete callbackProcessingQueue[requestID];
				callbackCount--;
				try { currentCallback(lastFrameTime); }  // Exactly what value is passed to the callback function may still be changing in the spec.
				catch (e) { }
			}
		}
	}

	// Export the requestAnimationFrame() and cancelAnimationFrame() functions if appropriate.
	if (!(window.requestAnimationFrame))
	{
		// Note: The spec actually calls for there to be just one task, at the top-level browsing context,
		// processing all of the queued callbacks. Implemented here instead on a per-window basis to avoid
		// potentially running afoul of cross-site scripting restrictions.
		window.requestAnimationFrame = request;
		window.cancelAnimationFrame = cancel;
	}

})();