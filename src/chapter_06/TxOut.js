class TxOut {

    constructor(toAddress, value, data='') {
        this.value = value
        this.toAddress = toAddress
        this.data = data
    }
}

module.exports = TxOut