;(function () {

	var TEST_METHODS = [
		'intersects',
		'within'
	];

	var TOPOLOGY_METHODS = [
		'intersection',
		'union',
		'difference'
	];

	var FACTORY = new jsts.geom.GeometryFactory();

	var TOPOLOGY_MIXIN = {}, TEST_MIXIN = {};

	TEST_METHODS.forEach(function (methodName) {
		TEST_MIXIN[methodName] = function () {
			return invokeTestMethod.apply(this, [methodName].concat(arguments));
		};
	});

	TOPOLOGY_METHODS.forEach(function (methodName) {
		TOPOLOGY_METHODS[methodName] = function () {
			return invokeTopologyMethod.apply(this, [methodName].concat(arguments));
		};
	});

	var slice = Array.prototype.slice;

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

		return LEAFLET.from(result, this.options);
	}

	L.Path.include(TEST_MIXIN);
	L.Path.include(TOPOLOGY_MIXIN);

	L.Path.include({
		getJstsGeometry: function () {
			if (!this._jstsGeometry)
				this._jstsGeometry = JSTS.from(this);
			

			return this._jstsGeometry;
		}
	});

	var JSTS = {
		from: function (layer) {

			var coordinates, geometries;

			if (layer instanceof L.MultiPolygon) {

				coordinates = layer.getLatLngs().map(this.multiLatLngsToCoordinates, this);
				geometries = coordinates.map(this.coordinatesToPolygon, this);
				return FACTORY.createMultiPolygon(geometries);

			} else if (layer instanceof L.MultiPolyline) {

				coordinates = latlngs.getLatLngs().map(this.multiLatLngsToCoordinates, this);
				geometries = coordinates.map(this.coordinatesToLineString, this);
				return FACTORY.createMultiLineString(geometries);

			} else if (layer instanceof L.Polygon) {

				coordinates = this.multiLatLngsToCoordinates(layer.getLatLngs());
				return this.coordinatesToPolygon(coordinates);

			} else if (layer instanceof L.Polyline) {

				coordinates = this.latLngsToCoordinates(layer.getLatLngs());
				return this.coordinatesToLineString(coordinates);

			} else {
				throw new Error('Unsupported layer');
			}
		},

		coordinatesToLineString: function (coordinates) {
			return FACTORY.createLineString(coordinates);
		},

		coordinatesToPolygon: function (coordinates) {
			if (coordinates.length  < 2)
				return FACTORY.createPolygon(coordinates[0], []);
			else
				return FACTORY.createPolygon(coordinates[0], coordinates.slice(1));
		},

		latLngToCoordinate: function (latlng) {
			return new jsts.geom.Coordinate(latlng.lng, latlng.lat);
		},

		latLngsToCoordinates: function (latlngs) {
			return latlngs.map(this.latLngToCoordinate, this);
		},

		multiLatLngsToCoordinates: function (latlngs) {
			if (!latlngs.length)
				return [];

			if (Array.isArray(latlngs[0]))
				latlngs.map(this.latLngsToCoordinates, this);
			else
				latlngs.map(this.latLngToCoordinate, this);
		}
	};

	var LEAFLET = {
		from: function (geometry) {
			var latlngs, Type;
			if (geometry instanceof jsts.geom.MultiPolygon) {

				latlngs = this.multiPolygonToLatLngs(geometry);
				Type = L.MultiPolygon;

			} else if (geometry instanceof jsts.geom.MultiLineString) {

				latlngs = this.multiLineStringToLatLngs(geometry);
				Type = L.MultiPolyline;

			} else if (geometry instanceof jsts.geom.Polygon) {

				latlngs = this.polygonToCoordinates(geometry);
				Type = L.Polygon;

			} else if (geometry instanceof jsts.geom.LineString) {

				latlngs = this.lineStringToCoordinates(geometry);
				Type = L.Polyline;

			} else {
				throw new Error('Unsupported geometry');
			}

			return new Type(latlngs, options);
		},

		coordinateToLatLng: function (coordinate) {
			return new L.LatLng(coordinate.y, coordinate.x);
		},

		lineStringToCoordinates: function (lineString) {
			return lineString.getCoordinates().map(this.coordinateToLatLng, this);
		},

		multiLineStringToLatLngs: function (multiLineString) {
			var latlngs = [];
			for (var i = 0, l = multiLineString.getNumGeometries(); i < l; i++) {
				latlngs.push(this.lineStringToCoordinates(multiLineString.getGeometryN(i)));
			}

			return latlngs;
		},

		multiPolygonToLatLngs: function (multiPolygon) {
			var latlngs = [];
			for (var i = 0, l = multiPolygon.getNumGeometries(); i < l; i++) {
				latlngs.push(this.polygonToCoordinates(multiPolygon.getGeometryN(i)));
			}

			return latlngs;
		},

		polygonToCoordinates: function (polygon) {
			var shell = polygon.getExteriorRing().map(this.coordinateToLatLng, this);

			var holes = [];
			for (var i = 0, l = polygon.getNumInteriorRing(); i < l; i++) {
				holes.push(polygon.getInteriorRingN(i).map(this.coordinateToLatLng, this));
			}

			return !holes.length ? shell : [shell].concat(holes);
		}
	};

})();