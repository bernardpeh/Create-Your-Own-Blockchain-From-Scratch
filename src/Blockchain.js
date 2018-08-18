const Block = require('./Block');
const Transaction = require('./Transaction');

class Blockchain{

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 1;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    setMiningReward(reward) {
        this.miningReward = reward;
    }

    createGenesisBlock() {
        return new Block(Date.now(), [], "0");
    }

    getBlock(id) {
        return this.chain[id];
    }

    getBlockHeight() {
        return this.chain.length-1;
    }

    minePendingTransactions(minerAddress){

        // coinbase transaction
        this.pendingTransactions.unshift(new Transaction(null, minerAddress, this.miningReward));

        // create new block based on current timestamp, all pending tx and previous blockhash
        let block = new Block(Date.now(), this.pendingTransactions, this.getBlock(this.getBlockHeight()).hash);
        block.mineBlock(this.difficulty);

        this.chain.push(block);
        console.log('\nBlock '+this.getBlockHeight()+' Mined.');

        // clear pending transactions
        this.pendingTransactions = [];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getAddressBalance(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;