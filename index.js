const got = require('got');
const tough = require('tough-cookie');
const colors = require('colors');
const { v4: uuidv4 } = require('uuid');

const main = async () => {
    let sku = 'X6898010'
    let cookieJar = new tough.CookieJar();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    var csrfToken;
    const getSession = async () => {
        try {
            let response = await got(`https://www.footlocker.com/api/v3/session?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "referer": "https://www.footlocker.com/",
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-fl-request-id": uuidv4(),
                },
                cookieJar: cookieJar
            })
            console.log(`Status ${response.statusCode}: Initiated session`.cyan)
            csrfToken = JSON.parse(response.body).data.csrfToken
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }
    
    var sizeId;
    const getPdp = async () => {
        try {
            let response = await got(`https://www.footlocker.com/api/products/pdp/${sku}?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "referer": `https://www.footlocker.com/product/~/${sku}.html`,
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-fl-request-id": uuidv4(),
                },
                cookieJar: cookieJar
            })
            const variantAttribute = JSON.parse(response.body).variantAttributes[0].code;
            const pdpSizes = JSON.parse(response.body).sellableUnits;
            (function() {
                for (let i = 0; i < pdpSizes.length; i++) {
                    // console.log(`${pdpSizes[i].attributes[1].id} - ${variantAttribute}`)
                    // console.log(pdpSizes[i].stockLevelStatus)
                    // console.log('---------------------------')
                    if (pdpSizes[i].attributes[1].id === variantAttribute && pdpSizes[i].stockLevelStatus === 'inStock') {
                        sizeId = pdpSizes[i].attributes[0].id
                        console.log(`Status ${response.statusCode}: Got size ID (${response.headers['x-cache']})`.cyan)
                        // console.log(sizeId)
                        return
                    }
                }
            })()
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }

    await getSession();
    await getPdp();
    await sleep(1000);
}

main();