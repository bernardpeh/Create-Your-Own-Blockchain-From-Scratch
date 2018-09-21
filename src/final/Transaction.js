// WE ASSUME THAT YOU CAN ONLY SEND TO 1 ADDRESS AT A TIME. This is not the case with Bitcoin
const CryptoJs= require("crypto-js")

class Transaction {

    constructor(txIn, txOut) {
        this.txIn = txIn
        this.txOut = txOut
        this.timestamp = Date.now()
        this.hash = CryptoJs.SHA256(this.txIn.toString() + this.timestamp + this.txOut.toString()).toString();
        this.data = data
    }

}

module.exports = Transaction