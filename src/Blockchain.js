const Block = require('./Block')
const Transaction = require('./Transaction')
const TxIn = require('./TxIn')
const TxOut = require('./TxOut')
const UTXO = require('./UTXO')

class Blockchain{

    constructor() {
        this.difficulty = 1
        this.pendingTransactions = []
        this.miningReward = 0
        this.chain = []
        this.createGenesisBlock()
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty
    }

    setMiningReward(reward) {
        this.miningReward = reward
    }

    createGenesisBlock() {
        // premine 30 and 20 and 10 coins to alice
        let txOuts = []
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 30, 'pre-mint'))
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 20, 'pre-mint'))
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 10, 'pre-mint'))
        let genesisTx = new Transaction([],txOuts)
        genesisTx.timestamp = 1535766955
        genesisTx.hash = 'genesis_tx'
        this.addTransaction(genesisTx)
        // why do we need to hardcode a time?
        let block = new Block(1535766956, this.getPendingTransactions(), "0")
        // for the sake of simplicity, let us fake a hash to something nice
        block.hash = 'genesis_block'
        this.addBlock(block)
        console.log('\nGenesis Block created.\n')
    }

    // allows us to add block rather than mine block
    addBlock(block) {
        this.chain.push(block)
        // clear pending transactions
        this.pendingTransactions = []
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

    mineBlock(minerAddress){

        // coinbase transaction
        this.pendingTransactions.unshift(new Transaction([], [new TxOut(minerAddress,this.miningReward,'coinbase tx')]))

        // create new block based on current timestamp, all pending tx and previous blockhash
        let block = new Block(Date.now(), this.pendingTransactions, this.getBlock(this.getBlockHeight()).hash)
        block.createBlock(this.difficulty)

        this.chain.push(block)
        console.log('\nBlock '+this.getBlockHeight()+' Mined by: '+minerAddress)

        // clear pending transactions
        this.pendingTransactions = []
    }

    addTransaction(transaction){
        this.pendingTransactions.push(transaction)
    }
    // this is a very important function to get all UTXOs
    getUTXO(fromAddress) {
        let utxos = []
        for(const block of this.chain) {
            for(const tx of block.transactions){
                // get all output tx
                for (let i=0; i<tx.txOut.length;i++) {
                    if (tx.txOut[i].toAddress == fromAddress) {
                        utxos.push(new UTXO(tx.hash,i,tx.txOut[i].toAddress,tx.txOut[i].value,tx.txOut[i].data))
                    }
                }
            }
        }
        // now filter away those utxos that has been used
        for(const block of this.chain) {
            for(const tx of block.transactions){
                for (const txIn of tx.txIn) {
                    // get all output tx
                    for (let i=0; i<utxos.length;i++) {
                        if (txIn.txOutHash == utxos[i].txOutHash && txIn.txOutIndex == utxos[i].txOutIndex) {
                            // remove the item
                            utxos.splice(i, 1);
                        }
                    }
                }
            }
        }
        return utxos
    }

    getPendingTransactions(){
        return this.pendingTransactions
    }

    getAddressBalance(address){
        let balance = 0;
        let utxos = this.getUTXO(address)
        for (const utxo of utxos) {
            balance += utxo.value
        }
        return balance;
    }
}

module.exports = Blockchain;