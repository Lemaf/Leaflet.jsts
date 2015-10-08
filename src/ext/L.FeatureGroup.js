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

	jstsCopy: function (geometry) {
		if (geometry.isEmpty())
			return new this.constructor([]);

		throw new Error('Unsupported operation!');
	},

	_cleanJstsGeometry: function () {
		delete this._jstsGeometry;
	}

});

L.FeatureGroup.addInitHook(function() {

	this.on('layeradd', this._cleanJstsGeometry, this);
	this.on('layerremove', this._cleanJstsGeometry, this);

});

Object.defineProperty(L.FeatureGroup.prototype, 'jsts', {
	get: function () {
		if (!this._jsts)
			this._jsts = new L.Jsts(this);

		return this._jsts;
	}
});