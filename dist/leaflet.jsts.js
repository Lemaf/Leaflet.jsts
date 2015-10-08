;(function () {

	var FACTORY = new jsts.geom.GeometryFactory();

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

			return new Type(latlngs, options);
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


	if (!L.jsts)
		L.jsts = {};

	var EMPTY_POLYGON = FACTORY.createPolygon(FACTORY.createLinearRing([]), []),
	EMPTY_MULTIPOLYGON = FACTORY.createMultiPolygon([EMPTY_POLYGON]),
	EMPTY_LINESTRING = FACTORY.createLineString([]),
	EMPTY_MULTILINESTRING = FACTORY.createMultiLineString([EMPTY_LINESTRING]);

	L.extend(L.jsts, {

		FACTORY: FACTORY,

		EMPTY_POLYGON: EMPTY_POLYGON,

		EMPTY_MULTIPOLYGON: EMPTY_MULTIPOLYGON,

		EMPTY_LINESTRING: EMPTY_LINESTRING,

		EMPTY_MULTILINESTRING: EMPTY_MULTILINESTRING,

		leafletTojsts: function (layer) {
			return JSTS.from(layer);
		},

		jstsToleaflet: function (geometry, options) {
			return LEAFLET.from(geometry, options);
		}

	});

})();
;(function () {

	L.Jsts = L.Class.extend({

		includes: [L.jsts.BinaryTest, L.jsts.BinaryTopology],

		initialize: function (target) {
			this._target = target;
		},

		geometry: function () {
			return this._target.getJstsGeometry();
		},

		_apply: function (geometry) {
			return this._target.jstsCopy(geometry);
		}

	});

	var slice = Array.prototype.slice;

	var BINARY_TEST_METHODS = {
		intersects: 'intersects',
		within: 'within'
	};

	function defineBinaryTestMethod(leafletMethod, jstsMethod) {
		L.Jsts.prototype[leafletMethod] = function () {
			return invokeBinaryTestMethod.apply(this, [jstsMethod].concat(slice.call(arguments, 0)));
		};
	}

	for (var leafletMethod in BINARY_TEST_METHODS) {
		defineBinaryTestMethod(leafletMethod, BINARY_TEST_METHODS[leafletMethod]);
	}

	function invokeBinaryTestMethod (jstsMethod, layer) {
		var thisGeometry = this.geometry();
		if (thisGeometry.isEmpty())
			return false;

		var thatGeometry = layer.jsts.geometry();
		if (thatGeometry.isEmpty())
			return false;

		if (arguments.length < 3)
			return thisGeometry[jstsMethod](thatGeometry);
		else {
			var args = [thatGeometry].concat(slice.call(arguments, 2));
			return thisGeometry[jstsMethod].apply(thisGeometry, args);
		}
	}

	var BINARY_TOPOLOGY_METHODS = {
		intersection: 'intersection',
		union: 'union',
		difference: 'difference'
	}

	function defineBinaryTopologyMethod(leafletMethod, jstsMethod) {
		L.Jsts.prototype[leafletMethod] = function () {
			return invokeBinaryTopologyMethod.apply(this, [jstsMethod].concat(slice.call(arguments, 0)));
		};
	}

	for (var leafletMethod in BINARY_TOPOLOGY_METHODS) {
		defineBinaryTopologyMethod(leafletMethod, BINARY_TOPOLOGY_METHODS[leafletMethod]);
	}

	function invokeBinaryTopologyMethod (jstsMethod, layer) {
		var thisGeometry = this.geometry();
		var thatGeometry = layer.jsts.geometry();

		var result;

		if (arguments.length < 3)
			result = thisGeometry[jstsMethod](thatGeometry);
		else {
			var args = [thatGeometry].concat(slice.call(arguments, 2));
			result = thisGeometry[jstsMethod].apply(thisGeometry, args);
		}

		return this._apply(result);
	}
})();

// L.FeatureGroup.include(L.jsts.BinaryTest);

L.FeatureGroup.include({

	getJstsGeometry: function () {

		if (!this._jstsGeometry) {
			var jstsGeometry  = L.jsts.EMPTY_MULTIPOLYGON;

			this.eachLayer(function(layer) {
				var localGeometry = layer.getJstsGeometry();

				// TODO: Slow...
				if (jstsGeometry) {
					jstsGeometry = jstsGeometry.union(localGeometry);
				} else {
					jstsGeometry = localGeometry;
				}

			});

			this._jstsGeometry = jstsGeometry;
		}

		return this._jstsGeometry;
	},

	_cleanJstsGeometry: function () {
		delete this._jstsGeometry;
	}

});

// L.FeatureGroup.addInitHook(function() {

// 	this.on('layeradd', this._cleanJstsGeometry, this);
// 	this.on('layerremove', this._cleanJstsGeometry, this);

// });
L.Path.include({
	getJstsGeometry: function () {
		if (!this._jstsGeometry)
			this._jstsGeometry = L.jsts.leafletTojsts(this);

		return this._jstsGeometry;
	},

	jstsCopy: function (geometry) {
		var layer;

		if (geometry.isEmpty()) {

			layer = new this.constructor([], this.options);

			if (this instanceof L.MultiPolygon)
				geometry = L.jsts.EMPTY_MULTIPOLYGON;
			else if (this instanceof L.MultiPolyline)
				geometry = L.jsts.EMPTY_MULTILINESTRING;
			else if (this instanceof L.Polygon)
				geometry = L.jsts.EMPTY_POLYGON;
			else if (this instanceof L.Polyline)
				geometry = L.jsts.EMPTY_LINESTRING;
			else
				throw new Error('Unsupported L.Path type');
		} else {
			layer = L.jsts.jstsToleaflet(geometry, this.options);
		}

		layer._jstsGeometry = geometry;

		return layer;
	}
});

Object.defineProperty(L.Path.prototype, "jsts", {

	get: function() {
		if (!this._jsts)
			this._jsts = new L.Jsts(this);

		return this._jsts;
	}

});