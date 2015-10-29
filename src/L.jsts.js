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

				latlngs = this.lineStringToLatLngs(geometry);
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

		lineStringToLatLngs: function (lineString) {
			return lineString.getCoordinates().map(this.coordinateToLatLng, this);
		},

		multiLineStringToLatLngs: function (multiLineString) {
			var latlngs = [];
			for (var i = 0, l = multiLineString.getNumGeometries(); i < l; i++) {
				latlngs.push(this.lineStringToLatLngs(multiLineString.getGeometryN(i)));
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
		},

		jstsToLatLngs: function (geometry) {
			if (geometry instanceof jsts.geom.MultiPolygon)
				return LEAFLET.multiPolygonToLatLngs(geometry);

			if (geometry instanceof jsts.geom.MultiLineString)
				return LEAFLET.multiLineStringToLatLngs(geometry);

			if (geometry instanceof jsts.geom.Polygon)
				return LEAFLET.polygonToLatLngs(geometry);

			if (geometry instanceof jsts.geom.LineString)
				return LEAFLET.lineStringToLatLngs(geometry);

			throw new Error('Unsupported geometry');
		},

		filter: function (collection, expectedType) {

			var subGeometry, geometries = [];

			for (var i = 0, il = collection.getNumGeometries(); i < il; i++) {
				subGeometry = collection.getGeometryN(i);

				if (subGeometry.getGeometryType().endsWith(expectedType)) {
					if (subGeometry.getGeometryType().startsWith("Multi")) {
						for (var j = 0, jl = subGeometry.getNumGeometries(); j < jl; j++) {
							geometries.push(subGeometry.getGeometryN(j));
						}
					} else {
						geometries.push(subGeometry);
					}
				}
			}

			if (geometries.length > 1) {
				switch (expectedType) {
					case 'Polygon':
					case 'MultiPolygon':
						return FACTORY.createMultiPolygon(geometries);

					case 'LineString':
					case 'MultiLineString':
						return FACTORY.createMultiLineString(geometries);

					default:
						throw new Error('Invalid expectedType ' + expectedType);
				}
			} else if (geometries.length) {
				return geometries[0];
			} else {
				switch (expectedType) {
					case 'Polygon':
						return EMPTY_POLYGON;
					case 'MultiPolygon':
						return EMPTY_MULTIPOLYGON;
					case 'LineString':
						return EMPTY_LINESTRING;
					case 'MultiLineString':
						return EMPTY_MULTILINESTRING;

					default:
						throw new Error('Invalid expectedType ' + expectedType);
				}
			}
		},

		intersection: function (geoA, geoB, expectedType) {
			var intersection = geoA.intersection(geoB);

			if (intersection.isGeometryCollectionBase())
				return this.filter(intersection, expectedType);
			else
				return intersection;
		},

		union: function (geoA, geoB, expectedType) {
			if (geoA.isEmpty())
				return geoB;

			if (geoB.isEmpty())
				return geoA;

			var union = geoA.union(geoB);

			if (union.isGeometryCollectionBase()) {
				return this.filter(union, expectedType);
			} else {
				return union;
			}
		},

		difference: function(geoA, geoB, expectedType) {

			if (geoA.isEmpty())
				return geoB;

			if (geoB.isEmpty())
				return geoA;

			var difference = geoA.difference(geoB);

			if (difference.isGeometryCollectionBase()) {
				return this.filter(difference, expectedType);
			} else {
				return difference;
			}

		}


	});

})();