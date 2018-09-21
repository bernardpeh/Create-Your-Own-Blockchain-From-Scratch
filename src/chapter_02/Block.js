const CryptoJs= require("crypto-js");

class Block {

    constructor(timestamp, transactions, previousHash = '', data ='') {
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transactions = transactions
        this.hash = this.calculateHash()
    }

    calculateHash() {
        return CryptoJs.SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)).toString()
    }
}

module.exports = Block;