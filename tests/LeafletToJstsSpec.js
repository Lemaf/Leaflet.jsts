describe('A simple test', function() {

	it('ok', function() {
		var leaflet = L.polygon([[-21, -45], [-22, -46], [-20, -45]]);

		var geometry = leaflet.getJstsGeometry();
	});

});