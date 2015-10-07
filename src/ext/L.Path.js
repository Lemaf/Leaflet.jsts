L.Path.include(L.jsts.BinaryTest);
L.Path.include(L.jsts.BinaryTopology);

L.Path.include({
	getJstsGeometry: function () {
		if (!this._jstsGeometry)
			this._jstsGeometry = L.jsts.leafletTojsts(this);

		return this._jstsGeometry;
	}
});