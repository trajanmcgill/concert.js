var BaseObject = (function ()
{
	"use strict";

	// Save any prior value of the global variable BaseObject, so the
	// user can revert to it with revertNameSpace() if there is a collision.
	var previousNameSpaceValue = BaseObject;

	var _dataBus;

	function innerConstructor()
	{
		var thisPublic = this;
		thisPublic.thisPublic = this;
		var thisProtected = { thisPublic: thisPublic };

		thisPublic.___accessProtectedMembers = function () { _dataBus = thisProtected; };
	}

	function _getProtectedMembers()
	{
		this.___accessProtectedMembers();
		return _dataBus;
	}

	function PrototypeBridge()
	{ }

	innerConstructor.extend = function (childDefinition)
	{
		var childConstructor = childDefinition(_getProtectedMembers, this);
		PrototypeBridge.prototype = this.prototype;
		childConstructor.prototype = new PrototypeBridge();
		childConstructor.prototype.constructor = childConstructor;
		childConstructor.extend = this.extend;
		return childConstructor;
	};

	innerConstructor.revertNameSpace = function ()
	{
		BaseObject = previousNameSpaceValue;
	}; // end revertNameSpace()

	return innerConstructor;
})();