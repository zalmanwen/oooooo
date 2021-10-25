
const url = $request.url;
var body = $request.body;

const path1 = "/v1/configs";
const path2 = "/analyticseventsv2/async";

if (url.indexOf(path1) != -1) {
    var configs = JSON.parse(body);  
        configs["deviceInfo"]["preferredLanguages"] = ["zh-CN","zh-HK","zh-US","en-US"];
        configs["deviceInfo"]["countryCode"] = "US";
    body = JSON.stringify(configs);
};

if (url.indexOf(path2) != -1) {
    var async = JSON.parse(body);
        async["data"]["session"]["mobileData"]["countryCode"] = "310";
        async["data"]["session"]["mobileData"]["carrier"] = "Google Fi";
        async["data"]["session"]["mobileData"]["networkCode"] = "260";
    body = JSON.stringify(async);
};

$done({body});
