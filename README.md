#  Automated footlocker checkout

To create a task, edit [tasks.json](tasks.json) to include your information. Replace the current info with yours. After changing the information in [tasks.json](tasks.json), run [start.js](start.js) to start the tasks you've created.
To add more tasks, add another task object to the json file in the same format as the example task objects:
```JSON
{
    "task1": {
        "sku": "X6898010",
        "cardData": {
            "number": "4444 4444 4444 4444",
            "cvc": "123",
            "holderName": "Card Holder",
            "expiryMonth": "06",
            "expiryYear": "2021"
        },
        "personalData": {
            "email": "johndoe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "3051233210",
            "streetAddress": "1600 Pennsylvania Avenue",
            "city": "MIAMI BEACH",
            "state": "Florida",
            "stateAbbreviation": "FL",
            "zipCode": "33139"
        }
    },
    "task2": {
        "sku": "X7180913",
        "cardData": {
            "number": "4242 4242 4242 4242",
            "cvc": "321",
            "holderName": "Card Holder",
            "expiryMonth": "12",
            "expiryYear": "2022"
        },
        "personalData": {
            "email": "johndoe@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "phoneNumber": "3051233210",
            "streetAddress": "1600 Pennsylvania Avenue",
            "city": "MIAMI BEACH",
            "state": "Florida",
            "stateAbbreviation": "FL",
            "zipCode": "33139"
        }
    }
}
```
