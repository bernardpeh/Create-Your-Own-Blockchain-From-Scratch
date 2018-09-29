const CryptoJs= require("crypto-js")

class Transaction {

    constructor(txIn, txOut) {
        this.txIn = txIn
        this.txOut = txOut
        this.timestamp = Date.now()
        this.hash = CryptoJs.SHA256(this.txIn.toString() + this.timestamp + this.txOut.toString()).toString();
    }

}

module.exports = Transaction;