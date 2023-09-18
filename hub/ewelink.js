const APP = [
    ["4s1FXKC9FaGfoqXhmXSJneb3qcm1gOak", "oKvCM06gvwkRbfetd6qWRrbC3rFrbIpV"],
    ["R8Oq3y0eSZSYdKccHlrQzT1ACCOUT9Gv", "1ve5Qk9GXfUhKAn1svnKwpAlxXkMarru"],
]
const API = {
    "cn": "https://cn-apia.coolkit.cn",
    "as": "https://as-apia.coolkit.cc",
    "us": "https://us-apia.coolkit.cc",
    "eu": "https://eu-apia.coolkit.cc",
}
async function encode(key, payload) {
    const encoder = new TextEncoder()
    const keyBytes = encoder.encode(key);
    const messageBytes = encoder.encode(JSON.stringify(payload));

    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' },
        true, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);

    // to lowercase hexits
    [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');

    // to base64
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
async function login(username, password, region) {
    let app = 1;
    let payload = {
        "password": password,
        "countryCode": "+86",
    }
    if (username.includes("@")) { payload["email"] = username }
    else if (username.indexOf("+") == 0) { payload["phoneNumber"] = username }
    else
        payload["phoneNumber"] = "+" + username
    let hex_dig = await encode(APP[app][1], payload)

    let headers = {
        "Authorization": "Sign " + hex_dig,
        "Content-Type": "application/json",
        "X-CK-Appid": APP[app][0],
    }

    let response = await fetch(
        API[region] + "/v2/user/login", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    }
    )
    let json = await response.json();
    console.log(json);

    let at = json.data.at
    response = await fetch(
        API[region] + "/v2/device/thing", {
        method: "GET",
        headers: { "Authorization": "Bearer " + at }
    }
    )
    json = await response.json();
    console.log(json);
}

var arguments = process.argv;
if (arguments.length != 5) {
    console.log("wrong number of arguments.")
    process.exit(1)
}
login(arguments[2], arguments[3], arguments[4]).then(x => x)