//===============================================
// ClientDevUtils
// Figure it out.
//===============================================
"use strict";


var getUrlVars = function (asArray) {
	var vars = (asArray) ? [] : {}, hash;

	if (!window.location.search)
		return vars;

	var q = window.location.search.slice(1);
	q = q.split('&');
	for (var i = 0; i < q.length; i++) {
		hash = q[i].split('=');

		if (asArray) vars.push(decodeURI(hash[1]));
		vars[hash[0]] = decodeURI(hash[1]);
	}

	return vars;
}
