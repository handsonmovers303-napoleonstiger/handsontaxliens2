//#region node_modules/topojson-client/src/identity.js
function identity_default(x) {
	return x;
}
//#endregion
//#region node_modules/topojson-client/src/transform.js
function transform_default(transform) {
	if (transform == null) return identity_default;
	var x0, y0, kx = transform.scale[0], ky = transform.scale[1], dx = transform.translate[0], dy = transform.translate[1];
	return function(input, i) {
		if (!i) x0 = y0 = 0;
		var j = 2, n = input.length, output = new Array(n);
		output[0] = (x0 += input[0]) * kx + dx;
		output[1] = (y0 += input[1]) * ky + dy;
		while (j < n) output[j] = input[j], ++j;
		return output;
	};
}
//#endregion
//#region node_modules/topojson-client/src/reverse.js
function reverse_default(array, n) {
	var t, j = array.length, i = j - n;
	while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
}
//#endregion
//#region node_modules/topojson-client/src/feature.js
function feature_default(topology, o) {
	if (typeof o === "string") o = topology.objects[o];
	return o.type === "GeometryCollection" ? {
		type: "FeatureCollection",
		features: o.geometries.map(function(o) {
			return feature(topology, o);
		})
	} : feature(topology, o);
}
function feature(topology, o) {
	var id = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
	return id == null && bbox == null ? {
		type: "Feature",
		properties,
		geometry
	} : bbox == null ? {
		type: "Feature",
		id,
		properties,
		geometry
	} : {
		type: "Feature",
		id,
		bbox,
		properties,
		geometry
	};
}
function object(topology, o) {
	var transformPoint = transform_default(topology.transform), arcs = topology.arcs;
	function arc(i, points) {
		if (points.length) points.pop();
		for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) points.push(transformPoint(a[k], k));
		if (i < 0) reverse_default(points, n);
	}
	function point(p) {
		return transformPoint(p);
	}
	function line(arcs) {
		var points = [];
		for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
		if (points.length < 2) points.push(points[0]);
		return points;
	}
	function ring(arcs) {
		var points = line(arcs);
		while (points.length < 4) points.push(points[0]);
		return points;
	}
	function polygon(arcs) {
		return arcs.map(ring);
	}
	function geometry(o) {
		var type = o.type, coordinates;
		switch (type) {
			case "GeometryCollection": return {
				type,
				geometries: o.geometries.map(geometry)
			};
			case "Point":
				coordinates = point(o.coordinates);
				break;
			case "MultiPoint":
				coordinates = o.coordinates.map(point);
				break;
			case "LineString":
				coordinates = line(o.arcs);
				break;
			case "MultiLineString":
				coordinates = o.arcs.map(line);
				break;
			case "Polygon":
				coordinates = polygon(o.arcs);
				break;
			case "MultiPolygon":
				coordinates = o.arcs.map(polygon);
				break;
			default: return null;
		}
		return {
			type,
			coordinates
		};
	}
	return geometry(o);
}
//#endregion
//#region node_modules/topojson-client/src/stitch.js
function stitch_default(topology, arcs) {
	var stitchedArcs = {}, fragmentByStart = {}, fragmentByEnd = {}, fragments = [], emptyIndex = -1;
	arcs.forEach(function(i, j) {
		var arc = topology.arcs[i < 0 ? ~i : i], t;
		if (arc.length < 3 && !arc[1][0] && !arc[1][1]) t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
	});
	arcs.forEach(function(i) {
		var e = ends(i), start = e[0], end = e[1], f, g;
		if (f = fragmentByEnd[start]) {
			delete fragmentByEnd[f.end];
			f.push(i);
			f.end = end;
			if (g = fragmentByStart[end]) {
				delete fragmentByStart[g.start];
				var fg = g === f ? f : f.concat(g);
				fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
			} else fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
		} else if (f = fragmentByStart[end]) {
			delete fragmentByStart[f.start];
			f.unshift(i);
			f.start = start;
			if (g = fragmentByEnd[start]) {
				delete fragmentByEnd[g.end];
				var gf = g === f ? f : g.concat(f);
				fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
			} else fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
		} else {
			f = [i];
			fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
		}
	});
	function ends(i) {
		var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
		if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) {
			p1[0] += dp[0], p1[1] += dp[1];
		});
		else p1 = arc[arc.length - 1];
		return i < 0 ? [p1, p0] : [p0, p1];
	}
	function flush(fragmentByEnd, fragmentByStart) {
		for (var k in fragmentByEnd) {
			var f = fragmentByEnd[k];
			delete fragmentByStart[f.start];
			delete f.start;
			delete f.end;
			f.forEach(function(i) {
				stitchedArcs[i < 0 ? ~i : i] = 1;
			});
			fragments.push(f);
		}
	}
	flush(fragmentByEnd, fragmentByStart);
	flush(fragmentByStart, fragmentByEnd);
	arcs.forEach(function(i) {
		if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
	});
	return fragments;
}
//#endregion
//#region node_modules/topojson-client/src/mesh.js
function mesh_default(topology) {
	return object(topology, meshArcs.apply(this, arguments));
}
function meshArcs(topology, object, filter) {
	var arcs, i, n;
	if (arguments.length > 1) arcs = extractArcs(topology, object, filter);
	else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
	return {
		type: "MultiLineString",
		arcs: stitch_default(topology, arcs)
	};
}
function extractArcs(topology, object, filter) {
	var arcs = [], geomsByArc = [], geom;
	function extract0(i) {
		var j = i < 0 ? ~i : i;
		(geomsByArc[j] || (geomsByArc[j] = [])).push({
			i,
			g: geom
		});
	}
	function extract1(arcs) {
		arcs.forEach(extract0);
	}
	function extract2(arcs) {
		arcs.forEach(extract1);
	}
	function extract3(arcs) {
		arcs.forEach(extract2);
	}
	function geometry(o) {
		switch (geom = o, o.type) {
			case "GeometryCollection":
				o.geometries.forEach(geometry);
				break;
			case "LineString":
				extract1(o.arcs);
				break;
			case "MultiLineString":
			case "Polygon":
				extract2(o.arcs);
				break;
			case "MultiPolygon": extract3(o.arcs);
		}
	}
	geometry(object);
	geomsByArc.forEach(filter == null ? function(geoms) {
		arcs.push(geoms[0].i);
	} : function(geoms) {
		if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
	});
	return arcs;
}
//#endregion
export { feature_default as n, mesh_default as t };
