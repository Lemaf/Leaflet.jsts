;(function () {

	L.Jsts = L.Class.extend({

		includes: [L.jsts.BinaryTest, L.jsts.BinaryTopology],

		initialize: function (target) {
			this._target = target;
		},

		clean: function() {
			if (this._target.jstsClean)
				this._target.jstsClean();
		},

		geometry: function () {
			return this._target.getJstsGeometry();
		},

		_apply: function (geometry) {
			return this._target.jstsCopy(geometry);
		}

	});

	var slice = Array.prototype.slice, leafletMethod;

	var BINARY_TEST_METHODS = {
		intersects: 'intersects',
		within: 'within',
		disjoint: 'disjoint'
	};

	function defineBinaryTestMethod(leafletMethod, jstsMethod) {
		L.Jsts.prototype[leafletMethod] = function () {
			return invokeBinaryTestMethod.apply(this, [jstsMethod].concat(slice.call(arguments, 0)));
		};
	}

	for (leafletMethod in BINARY_TEST_METHODS) {
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
	};

	function defineBinaryTopologyMethod(leafletMethod, jstsMethod) {
		L.Jsts.prototype[leafletMethod] = function () {
			return invokeBinaryTopologyMethod.apply(this, [jstsMethod].concat(slice.call(arguments, 0)));
		};
	}

	for (leafletMethod in BINARY_TOPOLOGY_METHODS) {
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
