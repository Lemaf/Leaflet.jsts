L.FeatureGroup.include(L.jsts.BinaryTest);

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

L.FeatureGroup.addInitHook(function() {

	this.on('layeradd', this._cleanJstsGeometry, this);
	this.on('layerremove', this._cleanJstsGeometry, this);

});