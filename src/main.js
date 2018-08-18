const Transaction = require('./Transaction');
const Blockchain = require('./Blockchain');

let mycoin = new Blockchain();
// Set the difficulty based on your CPU speed
mycoin.setDifficulty(3);
// set miner reward
mycoin.setMiningReward(12.5);

// get Genesis Block
console.log(mycoin.getBlock(0))

// First Block
mycoin.createTransaction(new Transaction('alice', 'bob', 40));
mycoin.minePendingTransactions('miner');
console.log(mycoin.getBlock(1))
console.log('\nBalance of alice is', mycoin.getAddressBalance('alice'));
console.log('\nBalance of bob is', mycoin.getAddressBalance('bob'));
console.log('\nBalance of miner is', mycoin.getAddressBalance('miner'));

// Second Block
mycoin.createTransaction(new Transaction('bob', 'alice', 10));
mycoin.minePendingTransactions('miner');
console.log(mycoin.getBlock(2))
console.log('\nBalance of alice is', mycoin.getAddressBalance('alice'));
console.log('\nBalance of bob is', mycoin.getAddressBalance('bob'));
console.log('\nBalance of miner is', mycoin.getAddressBalance('miner'));