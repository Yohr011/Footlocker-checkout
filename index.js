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

    const contactInfo = async () => {
        try {
            let response = await got.put(`https://www.footlocker.com/api/users/carts/current/email/deezbruh@example.org?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-length": "0",
                    "origin": "https://www.footlocker.com",
                    "pragma": "no-cache",
                    "referer": "https://www.footlocker.com/checkout",
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-csrf-token": csrfToken,
                    "x-fl-request-id": uuidv4(),
                },
                cookieJar: cookieJar
            })
            response.statusCode == 200 ? console.log(`Status ${response.statusCode}: Submitted contact info`.cyan) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }

    const submitShipping = async () => {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/addresses/shipping?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "origin": "https://www.footlocker.com",
                    "pragma": "no-cache",
                    "referer": "https://www.footlocker.com/checkout",
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-csrf-token": csrfToken,
                    "x-fl-request-id": uuidv4(),
                },
                json: {"shippingAddress":{"setAsDefaultBilling":false,"setAsDefaultShipping":false,"firstName":"Deez","lastName":"Bruh","phone":"3051233210","country":{"isocode":"US","name":"United States"},"email":false,"id":null,"setAsBilling":true,"saveInAddressBook":false,"region":{"countryIso":"US","isocode":"US-FL","isocodeShort":"FL","name":"Florida"},"type":"default","LoqateSearch":"","line1":"1600 Pennsylvania Avenue","postalCode":"33139","town":"MIAMI BEACH","regionFPO":null,"shippingAddress":true,"recordType":" "}},
                cookieJar: cookieJar
            })
            response.statusCode == 201 ? console.log(`Status ${response.statusCode}: Submitted shipping info`.cyan) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
        } catch(err) {
            try {
                console.log(err.response.body)
            } catch(e) {
                console.log(err)
            }
        }
    }

    const submitBilling = async () => {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/set-billing?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "scheme": "https",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "origin": "https://www.footlocker.com",
                    "pragma": "no-cache",
                    "referer": "https://www.footlocker.com/checkout",
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-csrf-token": csrfToken,
                    "x-fl-request-id": uuidv4(),
                },
                json: {"setAsDefaultBilling":false,"setAsDefaultShipping":false,"firstName":"Deez","lastName":"Bruh","phone":"3051233210","country":{"isocode":"US","name":"United States"},"email":false,"id":null,"setAsBilling":false,"saveInAddressBook":false,"region":{"countryIso":"US","isocode":"US-FL","isocodeShort":"FL","name":"Florida"},"type":"default","LoqateSearch":"","line1":"1600 Pennsylvania Avenue","postalCode":"33139","town":"MIAMI BEACH","regionFPO":null,"shippingAddress":true,"recordType":" ","visibleInAddressBook":false},
                cookieJar: cookieJar
            })
            response.statusCode == 200 ? console.log(`Status ${response.statusCode}: Submitted billing info`.cyan) : console.log(`Status ${response.statusCode}: ${response.statusMessage}`.red)
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
    await sleep(1000);
    await contactInfo();
    await submitShipping();
    await submitBilling();
}

main();