;(function () {

	L.jsts.BinaryTopology = {};

	var slice = Array.prototype.slice;

	var METHODS = [
		'intersection',
		'union',
		'difference'
	];

	METHODS.forEach(function (methodName) {
		L.jsts.BinaryTopology[methodName] = function () {
			return invokeTopologyMethod.apply(this, [methodName].concat(slice.call(arguments, 0)));
		};
	});


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

})();