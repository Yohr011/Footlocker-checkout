const got = require('got');
const tough = require('tough-cookie');
const colors = require('colors');
const { v4: uuidv4 } = require('uuid');
const adyenEncrypt = require('node-adyen-encrypt')(18);

function randchoice(array) {
    array[Math.floor(Math.random() * array.length)]
}

function sleep(ms) {
    new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = class Task {
    constructor(num, sku, cardData, personalData) {
        this.sku = sku;
        this.cardData = cardData;
        this.personalData = personalData;
        this.num = num;

        this.cookieJar = new tough.CookieJar();
        this.csrfToken;
        this.sizeId = [];
        this.variantAttribute;
        this.pdpSizes;
        this.jSes;
        this.sizeSelect;
        this.cartId;
        this.cseInstance = adyenEncrypt.createEncryption('10001|A237060180D24CDEF3E4E27D828BDB6A13E12C6959820770D7F2C1671DD0AEF4729670C20C6C5967C664D18955058B69549FBE8BF3609EF64832D7C033008A818700A9B0458641C5824F5FCBB9FF83D5A83EBDF079E73B81ACA9CA52FDBCAD7CD9D6A337A4511759FA21E34CD166B9BABD512DB7B2293C0FE48B97CAB3DE8F6F1A8E49C08D23A98E986B8A995A8F382220F06338622631435736FA064AEAC5BD223BAF42AF2B66F1FEA34EF3C297F09C10B364B994EA287A5602ACF153D0B4B09A604B987397684D19DBC5E6FE7E4FFE72390D28D6E21CA3391FA3CAADAD80A729FEF4823F6BE9711D4D51BF4DFCB6A3607686B34ACCE18329D415350FD0654D', {});
    }

    async getSession() {
        try {
            let response = await got(`https://www.footlocker.com/api/v3/session?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
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
                cookieJar: this.cookieJar
            })
            response.statusCode === 200 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Initiated session`.cyan) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
            this.csrfToken = JSON.parse(response.body).data.csrfToken;
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`.red);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async getPdp() {
        try {
            let response = await got(`https://www.footlocker.com/api/products/pdp/${this.sku}?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "referer": `https://www.footlocker.com/product/~/${this.sku}.html`,
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-fl-request-id": uuidv4(),
                },
                cookieJar: this.cookieJar
            })
            this.variantAttribute = JSON.parse(response.body).variantAttributes[0].code;
            this.pdpSizes = JSON.parse(response.body).sellableUnits;
            let re = /(?<=JSESSIONID=)([^;]*)/s;
            this.jSes = re.exec(this.cookieJar.store.idx['www.footlocker.com']['/'].JSESSIONID)[0];
            for (let i = 0; i < this.pdpSizes.length; i++) {
                if (this.pdpSizes[i].attributes[1].id === this.variantAttribute && this.pdpSizes[i].stockLevelStatus === 'inStock') {
                    this.sizeId.push(this.pdpSizes[i].attributes[0].id);
                }
            }
            this.sizeSelect = this.sizeId[Math.floor(Math.random() * this.sizeId.length)];
            response.statusCode === 200 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Got size ID (${response.headers['x-cache']})`.cyan) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async addToCart() {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/entries?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "origin": "https://www.footlocker.com",
                    "pragma": "no-cache",
                    "referer": `https://www.footlocker.com/product/~/${this.sku}.html`,
                    "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                    "x-csrf-token": this.csrfToken,
                    "x-fl-productid": this.sizeSelect,
                    "x-flapi-session-id": this.jSes,
                    "x-fl-request-id": uuidv4(),
                },
                json: {
                    "productQuantity": 1,
                    "productId": this.sizeSelect
                },
                cookieJar: this.cookieJar
            })
            let atcResponse = JSON.parse(response.body);
            response.statusCode === 200 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Successful ATC - ${atcResponse.entries[0].product.baseOptions[1].selected.sku} size ${atcResponse.entries[0].product.baseOptions[0].selected.size} (${response.headers['x-cache']})`.magenta) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async contactInfo() {
        try {
            let response = await got.put(`https://www.footlocker.com/api/users/carts/current/email/${this.personalData.email}?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
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
                    "x-csrf-token": this.csrfToken,
                    "x-flapi-session-id": this.jSes,
                    "x-fl-request-id": uuidv4(),
                },
                cookieJar: this.cookieJar
            })
            response.statusCode === 200 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Submitted contact info`.cyan) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async submitShipping() {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/addresses/shipping?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
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
                    "x-csrf-token": this.csrfToken,
                    "x-flapi-session-id": this.jSes,
                    "x-fl-request-id": uuidv4(),
                },
                json: {
                    "shippingAddress": {
                        "setAsDefaultBilling": false,
                        "setAsDefaultShipping": false,
                        "firstName": this.personalData.firstName,
                        "lastName": this.personalData.lastName,
                        "phone": this.personalData.phoneNumber,
                        "country": {
                            "isocode": "US",
                            "name": "United States"
                        },
                        "email": false,
                        "id": null,
                        "setAsBilling": true,
                        "saveInAddressBook": false,
                        "region": {
                            "countryIso": "US",
                            "isocode": `US-${this.personalData.stateAbbreviation}`,
                            "isocodeShort": this.personalData.stateAbbreviation,
                            "name": this.personalData.state
                        },
                        "type": "default",
                        "LoqateSearch": "",
                        "line1": this.personalData.streetAddress,
                        "postalCode": this.personalData.zipCode,
                        "town": this.personalData.city,
                        "regionFPO": null,
                        "shippingAddress": true,
                        "recordType": " "
                    }
                },
                cookieJar: this.cookieJar
            })
            response.statusCode === 201 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Submitted shipping info`.cyan) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async submitBilling() {
        try {
            let response = await got.post(`https://www.footlocker.com/api/users/carts/current/set-billing?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
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
                    "x-csrf-token": this.csrfToken,
                    "x-flapi-session-id": this.jSes,
                    "x-fl-request-id": uuidv4(),
                },
                json: {
                    "setAsDefaultBilling": false,
                    "setAsDefaultShipping": false,
                    "firstName": this.personalData.firstName,
                    "lastName": this.personalData.lastName,
                    "phone": this.personalData.phoneNumber,
                    "country": {
                        "isocode": "US",
                        "name": "United States"
                    },
                    "email": false,
                    "id": null,
                    "setAsBilling": false,
                    "saveInAddressBook": false,
                    "region": {
                        "countryIso": "US",
                        "isocode": `US-${this.personalData.stateAbbreviation}`,
                        "isocodeShort": this.personalData.stateAbbreviation,
                        "name": this.personalData.state
                    },
                    "type": "default",
                    "LoqateSearch": "",
                    "line1": this.personalData.streetAddress,
                    "postalCode": this.personalData.zipCode,
                    "town": this.personalData.city,
                    "regionFPO": null,
                    "shippingAddress": true,
                    "recordType": " ",
                    "visibleInAddressBook": false
                },
                cookieJar: this.cookieJar
            })
            response.statusCode === 200 
                ? console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: Submitted billing info`.cyan) 
                : console.log(`Task ${this.num}`.underline.blue + ` - Status ${response.statusCode}: ${response.statusMessage}`.red);
            let re = /(?<=cart-guid=)([^;]*)/s;
            this.cartId = re.exec(response.req['_header'])[0];
        } catch (err) {
            try {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err.response.body}`);
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }


    async submitOrder() {
        try {
            let response = await got.post(`https://www.footlocker.com/api/v2/users/orders?timestamp=${Date.now()}`, {
                headers: {
                    "authority": "www.footlocker.com",
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
                    "x-csrf-token": this.csrfToken,
                    "x-flapi-session-id": this.jSes,
                    "x-fl-request-id": uuidv4()
                },
                json: {
                    "preferredLanguage": "en",
                    "termsAndCondition": false,
                    "cartId": this.cartId,
                    "encryptedCardNumber": this.cseInstance.encrypt(this.cardData),
                    "encryptedExpiryMonth": this.cseInstance.encrypt(this.cardData),
                    "encryptedExpiryYear": this.cseInstance.encrypt(this.cardData),
                    "encryptedSecurityCode": this.cseInstance.encrypt(this.cardData),
                    "paymentMethod": "CREDITCARD",
                    "returnUrl": "https://www.footlocker.com/adyen/checkout",
                    "browserInfo": {
                        "screenWidth": 1440,
                        "screenHeight": 900,
                        "colorDepth": 30,
                        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
                        "timeZoneOffset": 240,
                        "language": "en-US",
                        "javaEnabled": false
                    }
                },
                cookieJar: this.cookieJar
            })
            this.cseInstance.validate(this.cardData);
            if (response.statusCode === 200) console.log(`Task ${this.num}`.underline.blue + ` - Status 200: Successfully checked out`.green);
        } catch (err) {
            try {
                if (err.response.statusCode === 400 && JSON.parse(err.response.body).errors[0].message.includes('We suggest you try again or use another payment method')) {
                    console.log(`Task ${this.num}`.underline.blue + ` - Status 400: Payment declined`.red);
                } else {
                    console.log(`Task ${this.num}`.underline.blue + ` - Status ${err.response.statusCode}: ${err.response.statusMessage}`.red);
                }
            } catch {
                console.log(`Task ${this.num}`.underline.blue + ` - ${err}`);
            }
        }
    }

    async start() {
        await this.getSession();
        await this.getPdp();
        await this.addToCart();
        await this.contactInfo();
        await this.submitShipping();
        await this.submitBilling();
        await this.submitOrder();
    }
}
