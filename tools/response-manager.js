const path = require("path");
const fs = require("fs");

const PATH_RESPONSE_LIST = path.join(__dirname, "response_list.json");

let resList = JSON.parse(fs.readFileSync(PATH_RESPONSE_LIST));

module.exports = function (code, message) {
	let ans;
	if (code >= 300) {
		ans = {
			error: message || resList[code] || "Error.",
			code: code
		};
	} else {
		ans = {
			message: message || resList[code] || "Ok"
		};
	}

	return ans;
};