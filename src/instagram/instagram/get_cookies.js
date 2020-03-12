
export const get_cookie = (name, host = "https://i.instagram.com") =>
    new Promise((resolve, reject) => {
        chrome.cookies.get({ url: host, name }, cookie => {
            if (cookie.value) {
                resolve(cookie.value)
            } else {
                reject(cookie)
            }
        });
    });

export const get_all_cookies = (keys, host = "https://i.instagram.com") =>
    Promise.all(keys.map(async name => [ name, await get_cookie(name, host) ]))

export const set_cookies = (keys, host = "https://i.instagram.com") => {
    return {}
}
