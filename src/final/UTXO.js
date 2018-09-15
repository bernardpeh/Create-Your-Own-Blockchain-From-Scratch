class UTXO {

    constructor(txOutHash, txOutIndex, toAddress, value, data='') {
        this.txOutHash = txOutHash
        this.txOutIndex = txOutIndex
        this.toAddress = toAddress
        this.value = value
        this.data = data
    }
}

module.exports = UTXO