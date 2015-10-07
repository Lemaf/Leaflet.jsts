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

	var FACTORY = new jsts.geom.GeometryFactory();

	var EMPTY_POLYGON = FACTORY.createPolygon(FACTORY.createLinearRing([]), []),
	EMPTY_MULTIPOLYGON = FACTORY.createMultiPolygon([EMPTY_POLYGON]),
	EMPTY_LINESTRING = FACTORY.createLineString([]),
	EMPTY_MULTILINESTRING = FACTORY.createMultiLineString([EMPTY_LINESTRING]);

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
			return LEAFLET.from(result, this.options);

		layer = new this.constructor([], this.options);

		if (this instanceof L.MultiPolygon)
			layer._jstsGeometry = EMPTY_MULTIPOLYGON;
		else if (this instanceof L.MultiPolyline)
			layer._jstsGeometry = EMPTY_MULTILINESTRING;
		else if (this instanceof L.Polygon)
			layer._jstsGeometry = EMPTY_POLYGON;
		else if (this instanceof L.Polyline)
			layer._jstsGeometry = EMPTY_LINESTRING;
		else
			throw new Error('Unsupported L.Path type');

		return layer;
	}

	L.Path.include(BINARY_TEST_MIXIN);
	L.Path.include(BINARY_TOPOLOGY_MIXIN);

	L.Path.include({
		getJstsGeometry: function () {
			if (!this._jstsGeometry)
				this._jstsGeometry = JSTS.from(this);
			

			return this._jstsGeometry;
		}
	});

	var LEAFLET = {
		from: function (geometry, options) {
			var latlngs, Type, layer;
			if (geometry instanceof jsts.geom.MultiPolygon) {

				latlngs = this.multiPolygonToLatLngs(geometry);
				Type = L.MultiPolygon;

			} else if (geometry instanceof jsts.geom.MultiLineString) {

				latlngs = this.multiLineStringToLatLngs(geometry);
				Type = L.MultiPolyline;

			} else if (geometry instanceof jsts.geom.Polygon) {

				latlngs = this.polygonToLatLngs(geometry);
				Type = L.Polygon;

			} else if (geometry instanceof jsts.geom.LineString) {

				latlngs = this.lineStringToCoordinates(geometry);
				Type = L.Polyline;

			} else {
				throw new Error('Unsupported geometry');
			}

			layer = new Type(latlngs, options);
			layer._jstsGeometry = geometry;

			return layer;
		},

		coordinateToLatLng: function (coordinate) {
			return new L.LatLng(coordinate.y, coordinate.x);
		},

		coordinatesToLatLngs: function(coordinates) {
			return coordinates.map(this.coordinateToLatLng, this);
		},

		linearRingToLatLngs: function (linearRing) {
			return this.coordinatesToLatLngs(linearRing.getCoordinates().slice(0, -1));
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
				latlngs.push(this.polygonToLatLngs(multiPolygon.getGeometryN(i)));
			}

			return latlngs;
		},

		polygonToLatLngs: function (polygon) {
			var shell = this.linearRingToLatLngs(polygon.getExteriorRing());

			var holes = [];
			for (var i = 0, l = polygon.getNumInteriorRing(); i < l; i++) {
				holes.push(this.linearRingToLatLngs(polygon.getInteriorRingN(i)));
			}

			return !holes.length ? shell : [shell].concat(holes);
		}
	};

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

		coordinatesToLinearRing: function(coordinates) {
			return FACTORY.createLinearRing(coordinates.concat(coordinates[0]));
		},

		coordinatesToLineString: function (coordinates) {
			return FACTORY.createLineString(coordinates);
		},

		coordinatesToPolygon: function (coordinates) {
			var rings = coordinates.map(this.coordinatesToLinearRing, this);
			if (rings.length  < 2) {
				return FACTORY.createPolygon(rings[0], []);
			} else
				return FACTORY.createPolygon(rings[0], rings.slice(1));
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
				return latlngs.map(this.latLngsToCoordinates, this);
			else
				return [latlngs.map(this.latLngToCoordinate, this)];
		}
	};

})();