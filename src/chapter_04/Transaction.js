const CryptoJs= require("crypto-js")

class Transaction{
    constructor(fromAddress, toAddress, amount, data='', timestamp = Date.now()){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.value = amount
        this.timestamp = timestamp
        this.data = data
        // How to ensure true randomness?
        this.hash = CryptoJs.SHA256(this.fromAddress + this.timestamp + this.toAddress + this.value).toString();
    }
}

module.exports = Transaction;