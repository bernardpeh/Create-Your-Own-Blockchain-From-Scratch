class TxIn {

    constructor(txOutHash, txOutIndex, signature) {
        this.txOutHash = txOutHash
        this.txOutIndex = txOutIndex
        this.signature = signature
    }
}

module.exports = TxIn