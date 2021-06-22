const got = require('got');
const tough = require('tough-cookie');
const colors = require('colors');
const { v4: uuidv4 } = require('uuid');

const main = async () => {
    let sku = 'X6898010'
    let cookieJar = new tough.CookieJar();
    const randchoice = (array) => array[Math.floor(Math.random() * array.length)];
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
            response.statusCode == 200 ? console.log(`Status ${response.statusCode}: Initiated session`.cyan) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
            csrfToken = JSON.parse(response.body).data.csrfToken
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }
    
    let sizeId = [];
    var sizeSelect;
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
            for (let i = 0; i < pdpSizes.length; i++) {
                // console.log(`${pdpSizes[i].attributes[1].id} - ${variantAttribute}`)
                // console.log(pdpSizes[i].stockLevelStatus)
                // console.log('---------------------------')
                if (pdpSizes[i].attributes[1].id === variantAttribute && pdpSizes[i].stockLevelStatus === 'inStock') {
                    sizeId.push(pdpSizes[i].attributes[0].id)
                }
            }
            sizeSelect = randchoice(sizeId)
            response.statusCode == 200 ? console.log(`Status ${response.statusCode}: Got size ID (${response.headers['x-cache']})`.cyan) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }

    const addToCart = async () => {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/entries?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "cookie": 'at_check=true; JSESSIONID=bsrgbgyaaegq1igq9lv11usav.fzcexflapipdb658880; AMCVS_40A3741F578E26BA7F000101%40AdobeOrg=1; s_pr_tbe65=1624320562411; s_cc=true; se=aks; AMCV_40A3741F578E26BA7F000101%40AdobeOrg=-1124106680%7CMCIDTS%7C18801%7CMCMID%7C47730606704948939542585762322303476399%7CMCAAMLH-1624925362%7C7%7CMCAAMB-1624925362%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1624327762s%7CNONE%7CMCSYNCSOP%7C411-18808%7CvVersion%7C5.2.0; userStatus=guest; userVIP=unknown; IR_gbd=footlocker.com; _gcl_au=1.1.392054387.1624320564; _scid=df689c52-18b6-4ad3-b183-b02dcbd9f0a1; __attentive_id=3c0021c172014b00968c5fc0fb1e61da; __attentive_cco=1624320564042; __attentive_ss_referrer="ORGANIC"; IR_PI=19c85287-d2ee-11eb-8700-0a2fd3f6ad9e%7C1624406963926; _ga=GA1.2.1940290243.1624320564; _gid=GA1.2.502835888.1624320564; __attentive_dv=1; bluecoreNV=true; _sctr=1|1624248000000; ccpa_consent=disabled; ku1-sid=kQbsSP7xMOqSuia6moFmC; ku1-vid=f19168a1-0c5c-221c-5769-7b89548b202a; BVBRANDID=80a26a0d-bb86-477d-b32f-955c5fa2c047; BVImplmain_site=8001; s_pr_tbe66=1624323094165; termsofuse_consent=true; __zlcmid=14ik7i8mwFzh2pV; cart-guid=c3d948be-7077-474d-a31e-9b07ca8de3cc; s_pr_tbe67=1624323166252; rskxRunCookie=0; rCookie=yggt22sjyrgteiogwlkwskq7c2qj4; s_vs=1; s_lv_s=Less%20than%201%20day; bc_invalidateUrlCache_targeting=1624325744489; lastRskxRun=1624325747423; _gat_gtag_UA_50007301_5=1; aa_pageHistory=[{"n":"FL',
                    "origin": "https://www.footlocker.com",
                    "pragma": "no-cache",
                    "referer": `https://www.footlocker.com/product/~/${sku}.html`,
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-csrf-token": csrfToken,
                    "x-fl-productid": sizeSelect,
                    "x-fl-request-id": uuidv4(),
                },
                json: {"productQuantity":1,"productId":sizeSelect},
                cookieJar: cookieJar
            })
            let atcResponse = JSON.parse(response.body);
            response.statusCode == 200 ? console.log(`Status ${response.statusCode}: Successful ATC - ${atcResponse.entries[0].product.baseOptions[1].selected.sku} size ${atcResponse.entries[0].product.baseOptions[0].selected.size} (${response.headers['x-cache']})`.magenta) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
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
    await addToCart();
}

main();