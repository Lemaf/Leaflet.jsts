describe('Test methods:', function() {

	describe('Intersects should', function() {

		it('true', function() {

			var pol1 = L.polygon([[-20.85258918296893427,-44.68342922899884684],[-21.48768699654775816,-46.50989643268123785],[-20.18365937859609005,-46.05845799769850402],[-20.85258918296893427,-44.68342922899884684]]);
			var pol2 = L.polygon([[-21.6850978135788317,-45.98331415420022239],[-20.79821634062140845,-45.77548906789412086],[-21.20178365937859866,-44.70253164556961423],[-21.6850978135788317,-45.98331415420022239]]);

			chai.expect(pol1.intersects(pol2)).to.be.true;
		});

		it('false', function() {

			var pol1 = L.polygon([[-20.85258918296893427,-44.68342922899884684],[-21.48768699654775816,-46.50989643268123785],[-20.18365937859609005,-46.05845799769850402],[-20.85258918296893427,-44.68342922899884684]]);
			var pol2 = L.polygon([[-21.6850978135788317,-45.98331415420022239],[-21.49902186421174122,-46.5028768699654691],[-21.20178365937859866,-44.70253164556961423],[-21.6850978135788317,-45.98331415420022239]]);

			chai.expect(pol2.intersects(pol1)).to.be.false;
		});

		it('true', function() {
			var pol1 = L.polygon([[-20.85258918296893427,-44.68342922899884684],[-21.48768699654775816,-46.50989643268123785],[-20.18365937859609005,-46.05845799769850402],[-20.85258918296893427,-44.68342922899884684]]);
			var pol2 = L.polygon([[-21.7817606444188776,-46.38446490218641571],[-21.23078250863061456,-46.76144994246259046],[-20.76680092059838856,-44.43187571921748713],[-21.7817606444188776,-46.38446490218641571]]);

			chai.expect(pol1.intersects(pol2)).to.be.true;
		});

	});

});