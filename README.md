#  Automated footlocker checkout

To create a task, make a tasks.json file in this format using your information.
To add more tasks, add another task object to the json file in the same format as the previous task objects:

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
