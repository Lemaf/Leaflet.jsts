!function(){var t=new jsts.geom.GeometryFactory,e={from:function(t,e){var n,i;if(t instanceof jsts.geom.MultiPolygon)n=this.multiPolygonToLatLngs(t),i=L.MultiPolygon;else if(t instanceof jsts.geom.MultiLineString)n=this.multiLineStringToLatLngs(t),i=L.MultiPolyline;else if(t instanceof jsts.geom.Polygon)n=this.polygonToLatLngs(t),i=L.Polygon;else{if(!(t instanceof jsts.geom.LineString))throw new Error("Unsupported geometry");n=this.lineStringToLatLngs(t),i=L.Polyline}return new i(n,e)},coordinateToLatLng:function(t){return new L.LatLng(t.y,t.x)},coordinatesToLatLngs:function(t){return t.map(this.coordinateToLatLng,this)},linearRingToLatLngs:function(t){return this.coordinatesToLatLngs(t.getCoordinates().slice(0,-1))},lineStringToLatLngs:function(t){return t.getCoordinates().map(this.coordinateToLatLng,this)},multiLineStringToLatLngs:function(t){for(var e=[],n=0,i=t.getNumGeometries();i>n;n++)e.push(this.lineStringToLatLngs(t.getGeometryN(n)));return e},multiPolygonToLatLngs:function(t){for(var e=[],n=0,i=t.getNumGeometries();i>n;n++)e.push(this.polygonToLatLngs(t.getGeometryN(n)));return e},polygonToLatLngs:function(t){for(var e=this.linearRingToLatLngs(t.getExteriorRing()),n=[],i=0,s=t.getNumInteriorRing();s>i;i++)n.push(this.linearRingToLatLngs(t.getInteriorRingN(i)));return n.length?[e].concat(n):e}},n={from:function(e){var n,i;if(e instanceof L.MultiPolygon)return n=e.getLatLngs().map(this.multiLatLngsToCoordinates,this),i=n.map(this.coordinatesToPolygon,this),t.createMultiPolygon(i);if(e instanceof L.MultiPolyline)return n=latlngs.getLatLngs().map(this.multiLatLngsToCoordinates,this),i=n.map(this.coordinatesToLineString,this),t.createMultiLineString(i);if(e instanceof L.Polygon)return n=this.multiLatLngsToCoordinates(e.getLatLngs()),this.coordinatesToPolygon(n);if(e instanceof L.Polyline)return n=this.latLngsToCoordinates(e.getLatLngs()),this.coordinatesToLineString(n);throw new Error("Unsupported layer")},coordinatesToLinearRing:function(e){return t.createLinearRing(e.concat(e[0]))},coordinatesToLineString:function(e){return t.createLineString(e)},coordinatesToPolygon:function(e){var n=e.map(this.coordinatesToLinearRing,this);return n.length<2?t.createPolygon(n[0],[]):t.createPolygon(n[0],n.slice(1))},latLngToCoordinate:function(t){return new jsts.geom.Coordinate(t.lng,t.lat)},latLngsToCoordinates:function(t){return t.map(this.latLngToCoordinate,this)},multiLatLngsToCoordinates:function(t){return t.length?Array.isArray(t[0])?t.map(this.latLngsToCoordinates,this):[t.map(this.latLngToCoordinate,this)]:[]}};L.jsts||(L.jsts={});var i=t.createPolygon(t.createLinearRing([]),[]),s=t.createMultiPolygon([i]),o=t.createLineString([]),r=t.createMultiLineString([o]);L.extend(L.jsts,{FACTORY:t,EMPTY_POLYGON:i,EMPTY_MULTIPOLYGON:s,EMPTY_LINESTRING:o,EMPTY_MULTILINESTRING:r,leafletTojsts:function(t){return n.from(t)},jstsToleaflet:function(t,n){return e.from(t,n)},jstsToLatLngs:function(t){if(t instanceof jsts.geom.MultiPolygon)return e.multiPolygonToLatLngs(t);if(t instanceof jsts.geom.MultiLineString)return e.multiLineStringToLatLngs(t);if(t instanceof jsts.geom.Polygon)return e.polygonToLatLngs(t);if(t instanceof jsts.geom.LineString)return e.lineStringToLatLngs(t);throw new Error("Unsupported geometry")},filter:function(e,n){for(var a,l=[],g=0,u=e.getNumGeometries();u>g;g++)if(a=e.getGeometryN(g),a.getGeometryType().endsWith(n))if(a.getGeometryType().startsWith("Multi"))for(var L=0,c=a.getNumGeometries();c>L;L++)l.push(a.getGeometryN(L));else l.push(a);if(l.length>1)switch(n){case"Polygon":case"MultiPolygon":return t.createMultiPolygon(l);case"LineString":case"MultiLineString":return t.createMultiLineString(l);default:throw new Error("Invalid expectedType "+n)}else{if(l.length)return l[0];switch(n){case"Polygon":return i;case"MultiPolygon":return s;case"LineString":return o;case"MultiLineString":return r;default:throw new Error("Invalid expectedType "+n)}}},intersection:function(t,e,n){var i=t.intersection(e);return i.isGeometryCollectionBase()?this.filter(i,n):i},union:function(t,e,n){if(t.isEmpty())return e;if(e.isEmpty())return t;var i=t.union(e);return i.isGeometryCollectionBase()?this.filter(i,n):i}})}(),function(){function t(t,n){L.Jsts.prototype[t]=function(){return e.apply(this,[n].concat(o.call(arguments,0)))}}function e(t,e){var n=this.geometry();if(n.isEmpty())return!1;var i=e.jsts.geometry();if(i.isEmpty())return!1;if(arguments.length<3)return n[t](i);var s=[i].concat(o.call(arguments,2));return n[t].apply(n,s)}function n(t,e){L.Jsts.prototype[t]=function(){return i.apply(this,[e].concat(o.call(arguments,0)))}}function i(t,e){var n,i=this.geometry(),s=e.jsts.geometry();if(arguments.length<3)n=i[t](s);else{var r=[s].concat(o.call(arguments,2));n=i[t].apply(i,r)}return this._apply(n)}L.Jsts=L.Class.extend({includes:[L.jsts.BinaryTest,L.jsts.BinaryTopology],initialize:function(t){this._target=t},clean:function(){this._target.jstsClean&&this._target.jstsClean()},geometry:function(){return this._target.getJstsGeometry()},_apply:function(t){return this._target.jstsCopy(t)}});var s,o=Array.prototype.slice,r={intersects:"intersects",within:"within",disjoint:"disjoint"};for(s in r)t(s,r[s]);var a={intersection:"intersection",union:"union",difference:"difference"};for(s in a)n(s,a[s])}(),L.FeatureGroup.include({getJstsGeometry:function(){if(!this._jstsGeometry){var t=L.jsts.EMPTY_MULTIPOLYGON;this.eachLayer(function(e){var n=e.getJstsGeometry();t=t?L.jsts.union(t,n,"Polygon"):n}),this._jstsGeometry=t}return this._jstsGeometry},jstsCopy:function(t){if(t.isEmpty())return new this.constructor([]);throw new Error("Unsupported operation!")},jstsClean:function(){delete this._jstsGeometry},jstsOnLayerAdd:function(t){t.layer.editing&&t.layer.on("edit",this.jstsClean,this)},jstsOnLayerRemove:function(t){t.layer.editing&&t.layer.off("edit",this.jstsClean,this)}}),L.FeatureGroup.addInitHook(function(){this.on("layeradd",this.jstsOnLayerAdd,this),this.on("layeradd",this.jstsClean,this),this.on("layerremove",this.jstsClean,this),this.on("layerremove",this.jstsOnLayerRemove,this)}),Object.defineProperty(L.FeatureGroup.prototype,"jsts",{get:function(){return this._jsts||(this._jsts=new L.Jsts(this)),this._jsts}}),function(){var t=L.Path.prototype.redraw;L.Path.include({getJstsGeometry:function(){return this._jstsGeometry||(this._jstsGeometry=L.jsts.leafletTojsts(this)),this._jstsGeometry},jstsCopy:function(t){var e;if(t.isEmpty())if(e=new this.constructor([],this.options),this instanceof L.MultiPolygon)t=L.jsts.EMPTY_MULTIPOLYGON;else if(this instanceof L.MultiPolyline)t=L.jsts.EMPTY_MULTILINESTRING;else if(this instanceof L.Polygon)t=L.jsts.EMPTY_POLYGON;else{if(!(this instanceof L.Polyline))throw new Error("Unsupported L.Path type");t=L.jsts.EMPTY_LINESTRING}else e=L.jsts.jstsToleaflet(t,this.options);return e._jstsGeometry=t,e},redraw:function(){return delete this._jstsGeometry,t.apply(this,arguments)}}),Object.defineProperty(L.Path.prototype,"jsts",{get:function(){return this._jsts||(this._jsts=new L.Jsts(this)),this._jsts}})}();