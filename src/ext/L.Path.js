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