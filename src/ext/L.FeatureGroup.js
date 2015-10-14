L.FeatureGroup.include({

	getJstsGeometry: function () {

		if (!this._jstsGeometry) {
			var jstsGeometry  = L.jsts.EMPTY_MULTIPOLYGON;

			this.eachLayer(function(layer) {
				var localGeometry = layer.getJstsGeometry();

				// TODO: Slow...
				if (jstsGeometry) {
					jstsGeometry = L.jsts.union(jstsGeometry, localGeometry, 'Polygon');
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

	jstsClean: function () {
		delete this._jstsGeometry;
	},

	jstsOnLayerAdd: function (evt) {
		if (evt.layer.editing) {
			evt.layer.on('edit', this.jstsClean, this);
		}
	},

	jstsOnLayerRemove: function (evt) {
		if (evt.layer.editing) {
			evt.layer.off('edit', this.jstsClean, this);
		}
	}

});

L.FeatureGroup.addInitHook(function() {
	this.on('layeradd', this.jstsOnLayerAdd, this);
	this.on('layeradd', this.jstsClean, this);
	this.on('layerremove', this.jstsClean, this);
	this.on('layerremove', this.jstsOnLayerRemove, this);

});

Object.defineProperty(L.FeatureGroup.prototype, 'jsts', {
	get: function () {
		if (!this._jsts)
			this._jsts = new L.Jsts(this);

		return this._jsts;
	}
});