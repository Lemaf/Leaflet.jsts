(function () {

	var METHODS = [
		'intersects',
		'within'
	];

	L.jsts.BinaryTest = {};

	var slice = Array.prototype.slice;

	METHODS.forEach(function (methodName) {
		L.jsts.BinaryTest[methodName] = function () {
			return invokeTestMethod.apply(this, [methodName].concat(slice.call(arguments, 0)));
		};
	});

	function invokeTestMethod (methodName, layer) {
		var thisJstsGeometry = this.getJstsGeometry();
		if (thisJstsGeometry.isEmpty())
			return false;

		var otherJstsGeometry = layer.getJstsGeometry();
		if (otherJstsGeometry.isEmpty())
			return false;

		if (arguments.length < 3)
			return thisJstsGeometry[methodName](otherJstsGeometry);
		else {
			var args = [otherJstsGeometry].concat(slice.call(arguments, 2));
			return thisJstsGeometry[methodName].apply(thisJstsGeometry, args);
		}
	}
	
})();