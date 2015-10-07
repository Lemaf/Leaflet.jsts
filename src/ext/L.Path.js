;(function () {

	var BINARY_TEST_METHODS = [
		'intersects',
		'within'
	];

	var BINARY_TOPOLOGY_METHODS = [
		'intersection',
		'union',
		'difference'
	];

	var BINARY_TOPOLOGY_MIXIN = {}, BINARY_TEST_MIXIN = {};

	var slice = Array.prototype.slice;

	BINARY_TEST_METHODS.forEach(function (methodName) {
		BINARY_TEST_MIXIN[methodName] = function () {
			return invokeTestMethod.apply(this, [methodName].concat(slice.call(arguments, 0)));
		};
	});

	BINARY_TOPOLOGY_METHODS.forEach(function (methodName) {
		BINARY_TOPOLOGY_MIXIN[methodName] = function () {
			return invokeTopologyMethod.apply(this, [methodName].concat(slice.call(arguments, 0)));
		};
	});


	function invokeTestMethod (methodName, layer) {
		var thisJstsGeometry = this.getJstsGeometry();
		var otherJstsGeometry = layer.getJstsGeometry();

		if (arguments.length < 3)
			return thisJstsGeometry[methodName](otherJstsGeometry);
		else {
			var args = [otherJstsGeometry].concat(slice.call(arguments, 2));
			return thisJstsGeometry[methodName].apply(thisJstsGeometry, args);
		}
	}

	function invokeTopologyMethod (methodName, layer) {
		var thisJstsGeometry = this.getJstsGeometry();
		var otherJstsGeometry = layer.getJstsGeometry();

		var result;

		if (arguments.length < 3)
			result = thisJstsGeometry[methodName](otherJstsGeometry);
		else {
			var args = [otherJstsGeometry].concat(slice.call(arguments, 2));
			result = thisJstsGeometry[methodName].apply(thisJstsGeometry, args);
		}

		if (!result.isEmpty())
			return L.jsts.jstsToleaflet(result, this.options);

		layer = new this.constructor([], this.options);

		if (this instanceof L.MultiPolygon)
			layer._jstsGeometry = L.jsts.EMPTY_MULTIPOLYGON;
		else if (this instanceof L.MultiPolyline)
			layer._jstsGeometry = L.jsts.EMPTY_MULTILINESTRING;
		else if (this instanceof L.Polygon)
			layer._jstsGeometry = L.jsts.EMPTY_POLYGON;
		else if (this instanceof L.Polyline)
			layer._jstsGeometry = L.jsts.EMPTY_LINESTRING;
		else
			throw new Error('Unsupported L.Path type');

		return layer;
	}

	L.Path.include(BINARY_TEST_MIXIN);
	L.Path.include(BINARY_TOPOLOGY_MIXIN);

	L.Path.include({
		getJstsGeometry: function () {
			if (!this._jstsGeometry)
				this._jstsGeometry = L.jsts.leafletTojsts(this);

			return this._jstsGeometry;
		}
	});

	

})();