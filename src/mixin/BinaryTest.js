(function () {

	var METHODS = {
		jstsIntersects: 'intersects',
		jstsWithin: 'within'
	};

	L.jsts.BinaryTest = {};

	var slice = Array.prototype.slice;

	function defineMethod(leafletMethod, jstsMethod) {
		L.jsts.BinaryTest[leafletMethod] = function () {
			return invokeTestMethod.apply(this, [jstsMethod].concat(slice.call(arguments, 0)));
		};
	}

	for (var leafletMethod in METHODS) {
		defineMethod(leafletMethod, METHODS[leafletMethod]);
	}

	function invokeTestMethod (jstsMethod, layer) {
		var thisJstsGeometry = this.getJstsGeometry();
		if (thisJstsGeometry.isEmpty())
			return false;

		var otherJstsGeometry = layer.getJstsGeometry();
		if (otherJstsGeometry.isEmpty())
			return false;

		if (arguments.length < 3)
			return thisJstsGeometry[jstsMethod](otherJstsGeometry);
		else {
			var args = [otherJstsGeometry].concat(slice.call(arguments, 2));
			return thisJstsGeometry[jstsMethod].apply(thisJstsGeometry, args);
		}
	}
	
})();