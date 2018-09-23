class Transaction{
    constructor(fromAddress, toAddress, amount, data=''){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.value = amount;
        this.data = data
    }
}

module.exports = Transaction;