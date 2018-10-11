const Block = require('./Block');
const Transaction = require('./Transaction')

class Blockchain{

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.pendingTransactions = []
        this.difficulty = 1
        this.miningReward = 1
    }

    createGenesisBlock() {
        return new Block('this_is_genesis_address', [], "0")
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty
    }

    setMiningReward(reward) {
        this.miningReward = reward
    }

    // this method is now not available for public use
    addBlock(block) {
        this.chain.push(block)
        // reset pending Transactions
        this.pendingTransactions = []
    }

    mineBlock(minerAddress) {
        // coinbase transaction
        this.pendingTransactions.unshift(new Transaction(null, minerAddress, this.miningReward))

        // create new block based on hardcoded timestamp, all pending tx and previous blockhash
        let block = new Block(1535766955, this.pendingTransactions, this.getBlock(this.getBlockHeight()).hash)
        block.mineBlock(this.difficulty)

        this.chain.push(block)
        // reset pending Transactions
        this.pendingTransactions = []
        return block
    }

    getBlock(id) {
        return this.chain[id]
    }

    getBlockHeight() {
        return this.chain.length-1
    }

    getBlockchain() {
        return this.chain
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction)
    }

    getPendingTransactions(){
        return this.pendingTransactions
    }

    getAddressBalance(address){

        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.value;
                }
                if(trans.toAddress === address){
                    balance += trans.value;
                }
            }
        }
        return balance;
    }
}

module.exports = Blockchain;