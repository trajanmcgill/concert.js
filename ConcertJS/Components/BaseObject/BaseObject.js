var BaseObject = (function ()
{
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

	return innerConstructor;
})();