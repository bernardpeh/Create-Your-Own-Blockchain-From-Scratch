# Chapter 3: Consensus (Proof of Work) and Incentivisation

> For our timestamp network, we implement the proof-of-work by incrementing a nonce in the block until a value is found that gives the block's hash the required zero bits. - Bitcoin's Whitepaper

In a decentralised system, Consensus is achieved if majority of the nodes agree on a common truth. What if some nodes are dishonest? In networking, this is the typical [Byzantine General's Problem](https://en.wikipedia.org/wiki/Byzantine_fault_tolerance). If all the generals are attacking the city, how could they coordinate the attack so that they act at the same time? The challenge is not only ensuring the message get passed through, but also to mitigate traitors.

There are many [Consensus Algorithm](https://www.coindesk.com/short-guide-blockchain-consensus-protocols/) in the Blockchain ecosystem. In Bitcoin, [Proof-of-Work](https://en.bitcoin.it/wiki/Proof_of_work) is used as a probabilistic solution to the Byzantine's problem. 

## Proof of Work

Proof of Work is about using computing power to find a cryptographic solution (a hash) for the right to generate the next block in the Blockchain, ie you proof that the block you created is legit. **The hash should be hard to find but easy to verify**.

In Bitcoin, the right hash is one with a specific number of zeros prefixing it. The difficulty property defines how many prefixing zeros the hash must have.

Q1. Write a mineBlock function that accepts a difficulty parameter in the Block class. this.hash must also be guaranteed unique.

```
# mycode/Block.js

const CryptoJs= require("crypto-js");

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        # Note that this is not the way bitcoin calculate the hash. Its just an example for our workshop.
        return CryptoJs.SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)).toString();
    }

    mineBlock(difficulty) {
    }
}

module.exports = Block;
```

## Incentivisation

> By convention, the first transaction in a block is a special transaction that starts a new coin owned by the creator of the block. This adds an incentive for nodes to support the network, and provides a way to initially distribute coins into circulation, since there is no central authority to issue them. - Bitcoin's Whitepaper

One very clever thing that Satoshi did was to reward nodes for becoming a block producer. This move attracts global participation, achieving successful decentralisation.

Anyone could become a miner if they are willing to use their computational power. They will be rewarded with some currency (block reward, transaction fees) for finding the next block. In the case of Bitcoin, its 12.5 BTC at the time of writing. 

It is also important to note that due to the limited supply and price of Bitcoin, there is no incentive to cheat. Attacking the network successfully would require more than 51% of malicious nodes which would be very costly and achieves no monetary incentives.

Q2. In Blockchain.js, add a mineBlock function that accepts a minerAddress argument. Add a new transaction before all other pending transactions. This is the coinbase transaction to reward the miner only.

```
# mycode/Blockchain.js

const Block = require('./Block');
const Transaction = require('./Transaction')

class Blockchain{

    constructor() {
        ...
        this.difficulty = 1
        this.miningReward = 1
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
    }
    ...
}

module.exports = Blockchain;
```

Next, let us set the mining difficulty, reward and change the api endpoint in main.js from createBlock to mineBlock,

```
# mycode/main.js

...
const CryptoJs= require("crypto-js")
...

// create mycoin blockchain
let mycoin = new Blockchain();
// Set the difficulty based on your CPU speed
mycoin.setDifficulty(3);
// set miner reward
mycoin.setMiningReward(12.5);

var initHttpServer = () => {
    ...
    app.post('/mineBlock', (req, res) => {
        if (mycoin.pendingTransactions.length > 0) {
            let block = mycoin.mineBlock(req.body.minerAddress)
            console.log(JSON.stringify(block))
            broadcast(block)
            res.send('new Block created: '+JSON.stringify(block))
        }
        else {
            res.send('cannot create empty block')
        }
    });
    ...
}
var initP2PServer = () => {
    wss = new WebSocket.Server({port: p2p_port})
    wss.on('connection', (ws) => {
        // do something and broadcast incoming message
        ws.on('message', (data) => {
            // if a new block is created, update current chain and broadcast again
            let parsedData = JSON.parse(data)
            if (parsedData.hasOwnProperty('previousHash')) {
                console.log('Syncing Blocks: '+JSON.stringify(parsedData))
                // current block
                let currentBlock = mycoin.getBlock(mycoin.getBlockHeight())

                // if new Block found, verify it
                let hash = CryptoJs.SHA256(parsedData.previousHash + parsedData.timestamp + JSON.stringify(parsedData.transactions) + parsedData.nonce).toString()
                if (currentBlock.hash == parsedData.previousHash && parsedData.hash == hash) {
                    mycoin.addBlock(parsedData)
                    broadcast(parsedData)
                }
            }
        })
    })
    console.log('listening websocket p2p port on: ' + p2p_port)
}
```

In mineBlock api, we make sure we provide the miner Address. Once a block is produced, we broadcast the data. All nodes receiving the data must verify the data before accepting it into the chain. Once this protocol is established, we will have a consistent decentralised ledger.

## Testing

In Terminal 1, start the node

```
HTTP_PORT=3001 P2P_PORT=6001 node mycode/main.js
```

In Terminal 2, start the node

```
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 node mycode/main.js 
```

In Terminal 3, start the node

```
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6002 node mycode/main.js 
```

In Terminal 4, 

```
# Lets add a tx to node 3. Is the mining successful? Why?
curl -H "Content-type:application/json" --data '{"fromAddress" : "alice", "toAddress" : "bob", "value" : 40}' http://localhost:3003/createTransaction

curl -H "Content-type:application/json" --data '{"minerAddress":"miner"}' http://localhost:3003/mineBlock

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# get the balance of alice, bob and miner from node 1.
curl http://localhost:3001/getBalance/alice
curl http://localhost:3001/getBalance/bob
curl http://localhost:3001/getBalance/miner
```

Tip: Remember to commit your code before moving on to the next chapter.

## Short Quiz

{quiz, id: chapter_03, attempts: 1}

? Why are we hardcoding a 1535766955 as timestamp when creating the genesis block? 

a) Because its the standard for genesis block creation.
b) Because it has certain meaning in Bitcoin.
C) Because we want a predictable block hash.

{/quiz}