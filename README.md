#  Automated footlocker checkout

To create a task, edit tasks.json to include your information. Replace the current info with yours.
To add more tasks, add another task object to the json file in the same format as the previous task objects:
```JSON
{
    "task1": {
        "sku": "X6898010",
        "cardData": {
            "number" : "4444 4444 4444 4444",
            "cvc" : "123",
            "holderName" : "Card Holder",
            "expiryMonth" : "06",
            "expiryYear" : "2021"
        }
    },
    "task2": {
        "sku": "X7180913",
        "cardData": {
            "number" : "4242 4242 4242 4242",
            "cvc" : "321",
            "holderName" : "Card Holder",
            "expiryMonth" : "12",
            "expiryYear" : "2022"
        }
    }
}
```
