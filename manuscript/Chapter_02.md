# Chapter 2: The Blockchain

> A timestamp server works by taking a hash of a block of items to be timestamped and widely publishing the hash, such as in a newspaper or Usenet post. The timestamp proves that the data must have existed at the time, obviously, in order to get into the hash. Each timestamp includes the previous timestamp in its hash, forming a chain, with each additional timestamp reinforcing the ones before it. - Bitcoin's Whitepaper

It is interesting to note that Satoshi didn't use the term "Blockchain" in the entire white paper, but instead he used the word "timestamp server". However, in the code of his earliest commit, he did use the word "block chain" many times.

```
# https://github.com/bitcoin/bitcoin/blob/4405b78d6059e536c36974088a8ed4d9f0f29898/main.h

//
// The block chain is a tree shaped structure starting with the
// genesis block at the root, with each block potentially having multiple
// candidates to be the next block.  pprev and pnext link a path through the
// main/longest chain.  A blockindex may have multiple pprev pointing back
// to it, but pnext will only point forward to the longest branch, or will
// be null if the block is not part of the longest chain.
//
class CBlockIndex
{
public:
    const uint256* phashBlock;
    CBlockIndex* pprev;
    CBlockIndex* pnext;
    unsigned int nFile;
    unsigned int nBlockPos;
    int nHeight;

    // block header
    int nVersion;
    uint256 hashMerkleRoot;
    unsigned int nTime;
    unsigned int nBits;
    unsigned int nNonce;
    ...
```

Many people are confused with the word "Blockchain" today. Some even mixed it with consensus and incentivisation mechanism. Based on Satoshi's original definition, the Blockchain is simply a chain of blocks. In the technical term, it is an insert only database. The ecosystem ensures that the data in the Blockchain cannot be changed and hence protect against [double spending](https://en.wikipedia.org/wiki/Double-spending) when used as a currency.

Each block consists of transactions and the miner (node) is responsible to assemble all the transactions in the block.

![blockchain overview](en-blockchain-overview.jpg)
*Image Credit: bitcoin.org*

Each transaction is hashed and then paired repeatedly until the last single hash remains (merkle root). The merkle root is stored in the block header referencing the previous block's merkle root, forming an immutable chain.

## The Block

Let us first create a simple block.

```
# mycode/Block.js

const CryptoJs= require("crypto-js");

class Block {

    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transactions = transactions
        this.hash = this.calculateHash()
    }

    calculateHash() {
        return CryptoJs.SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)).toString()
    }
}

module.exports = Block;
```

The block has all the properties as we described previously. A big part of Blockchain is the hashing algorithm. We are using the same hashing algorithm that Bitcoin uses, ie SHA256.

Q1. What is the unique identifier in the Block? How do we ensure that its unique?

## The Transaction

Now lets create a simple Transaction object.

```
# mycode/Transaction.js

class Transaction{
    constructor(fromAddress, toAddress, amount, data=''){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.value = amount
        this.data = data
    }
}

module.exports = Transaction;
```

Each Transaction records who is sending how much to who. This is a simple Account Based Transaction Model that scans through the chain to get the balance.

Q2. Do you see a problem with the Transaction class?

## The Chain

Now, the actual Blockchain class.

```
# mycode/Blockchain.js

const Block = require('./Block');

class Blockchain{

    constructor() {
        this.chain = [this.createGenesisBlock()]
        this.pendingTransactions = []
    }

    createGenesisBlock() {
        return new Block('this_is_genesis_address', [], "0")
    }

    addBlock(block) {
        this.chain.push(block)
        // reset pending Transactions
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
```

The actual implementation of the chain is quite simple. Its basically an incremental insert-only array of the Blocks object.

Q3. Why is there a need for pendingTransactions?

Q4. What is the problem with the getAddressBalance function in the Blockchain class?

Its time to add 4 more api endpoints to main.js, ie createTransaction, createBlock, getBlockchain and getBalance.

```
# mycode/main.js

var express = require("express")
var bodyParser = require('body-parser')
var WebSocket = require("ws")

const Blockchain = require('./Blockchain')
const Transaction = require('./Transaction')
const Block = require('./Block')

var http_port = process.env.HTTP_PORT || 3001
var p2p_port = process.env.P2P_PORT || 6001
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []
var peers = []
var wss

// create mycoin blockchain
let mycoin = new Blockchain();

var initHttpServer = () => {

    var app = express()
    app.use(bodyParser.json())

    app.get('/ping', (req, res) => {
        let ping = "I'm alive"
        console.log(ping)
        broadcast(ping)
        res.send(ping)
    });

    app.post('/createTransaction', (req, res) => {
        // req.body.data
        mycoin.createTransaction(new Transaction(req.body.fromAddress, req.body.toAddress, req.body.value));
        let pendingTx = JSON.stringify(mycoin.getPendingTransactions())
        broadcast(pendingTx)
        res.send('Current Pending Txs: '+pendingTx+'\n')
    });

    app.get('/createBlock', (req, res) => {
        if (mycoin.pendingTransactions.length > 0) {
            let block = new Block(Date.now(), mycoin.pendingTransactions, mycoin.getBlock(mycoin.getBlockHeight()).hash)
            mycoin.addBlock(block)
            console.log(JSON.stringify(block))
            broadcast(block)
            res.send('new Block created: '+JSON.stringify(block))
        }
        else {
            res.send('cannot create empty block')
        }
    });

    app.get('/getBlockchain', (req, res) => {
        res.send(mycoin.getBlockchain());
    });

    app.get('/getBalance/:address', (req, res) => {
        res.send(req.params.address+' balance is: '+mycoin.getAddressBalance(req.params.address)+'\n');
    });


    app.listen(http_port, () => console.log('Listening http on port: ' + http_port))
};


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
                // if new Block found, update current chain and re-broadcast
                if (currentBlock.hash == parsedData.previousHash) {
                    mycoin.addBlock(parsedData)
                    broadcast(parsedData)
                }
            }
        });
    });

    console.log('listening websocket p2p port on: ' + p2p_port)

};

var initPeers = (initialPeers) => {
    initialPeers.forEach( (peer) => {
        var ws = new WebSocket(peer)
        peers.push(ws)
    })
};

var broadcast = (data) => {
    peers.forEach(ws => {
        ws.send(JSON.stringify(data))
    });
}

initHttpServer();
initP2PServer();
initPeers(initialPeers)
```

We broadcast to different nodes when new transactions and blocks are added. In this way, all the nodes are synced. Querying any nodes will return the same results.

## Testing

We are now going to create a transaction, add it to a block and verify that all the chain are in sync.

Open up 3 terminals, Lets assign terminal 1 to node 1 and vice versa.

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
# Lets add a tx to node 3.
curl -H "Content-type:application/json" --data '{"fromAddress" : "alice", "toAddress" : "bob", "value" : 40}' http://localhost:3003/createTransaction

# create a block in node 3. Check what happens in all the terminals.
curl http://localhost:3003/createBlock

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# get the balance of alice and bob from node 1. What values did you get?
curl http://localhost:3001/getBalance/alice
curl http://localhost:3001/getBalance/bob
```

Q5. Did you see any problems with alice sending 40 tokens to bob? How do we fix it? (ungraded)

Tip: Remember to commit your code before moving on to the next chapter.

## Short Quiz

{quiz, id: chapter_02, attempts: 10}

? In Bitcoin, what happens when 2 miners find a block at the same time?

a) The Blockchain will use the chain of the miner that has the most nodes replicating its block.
b) The Blockchain will use the chain of the miner with the most number of transaction in its block, ie the heaviest chain.
c) The Blockchain will use the chain of the miner with the highest transaction fee in its block.
D) Nothing happens, the network continues to have 2 split chains.
e) None of the above.

? How can one person double spend in Bitcoin?

A) The attacker sends the coin to an address and receives a tx id. It then builds a fork that does not contain the tx id and hope that this fork will become the longest chain in the network.
b) The attacker sends 2 different transactions at the same time to the network. Only one of them is recorded in the Blockchain and the other one disappear due to race onditions. 
c) The attacker sends the coin to an address and receives a tx id. It then creates another transaction to cancel the previous transaction and get the funds back.
d) The attacker sends the coin to an address and receives a tx id. It then builds a fork containing the same tx id but with 0 btc, hoping that this fork will become the longest chain in the network.

{/quiz}

## Resources

* [Bitcoin Developer Guide](https://bitcoin.org/en/developer-guide)