# Chapter 2: The Blockchain

> A timestamp server works by taking a hash of a block of items to be timestamped and widely publishing the hash, such as in a newspaper or Usenet post. The timestamp proves that the data must have existed at the time, obviously, in order to get into the hash. Each timestamp includes the previous timestamp in its hash, forming a chain, with each additional timestamp reinforcing the ones before it. - Bitcoin's Whitepaper

The Blockchain is simply a chain of blocks. In the technical term, it is an insert only database. The ecosystem ensures that the data in the Blockchain cannot be changed and hence protect against double spending when used as a currency.

Each block consists of transactions and the miner is responsible to assemble all the transactions in the block.

![blockchain overview](en-blockchain-overview.svg)
{caption: "Image Credit: bitcoin.org"}

Each transaction is hashed and then paired repeatedly until the last single hash remains (merkle root). The merkle root is stored in the block header referencing the previous block's merkle root, forming an immutable chain.

Let us first create a simple block.

```
# src/chapter_02/Block.js

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

Q1. What creates uniqueness in the Block?

Now lets create a simple Transaction object.

```
# src/chapter_02/Transaction.js

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.value = amount;
    }
}

module.exports = Transaction;
```

Each Transaction records who is sending how much to who. This is a simple Account Based Transaction Model. Can you see a problem with this class?

Now, the actual Blockchain class.

```
# src/chapter_02/Blockchain.js

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

Q2. Why is there a need for pendingTransactions?

Q3. What is the problem with the getAddressBalance function?

It time to add 4 more api endpoints to main.js, ie createTransaction, createBlock, getBlockchain and getBalance.

```
# src/chapter_02/main.js

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

Open up 3 terminals, Lets assign terminal 1 to node 1 and vice versa.

In Terminal 1, start the node

```
HTTP_PORT=3001 P2P_PORT=6001 node src/chapter_02/main.js
```

In Terminal 2, start the node

```
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 node src/chapter_02/main.js 
```

In Terminal 3, start the node

```
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6002 node src/chapter_02/main.js 
```

In Terminal 4, 

```
# Lets add a tx to node 3.
curl -H "Content-type:application/json" --data '{"fromAddress" : "alice", "toAddress" : "bob", "value" : 40}' http://localhost:3003/createTransaction

# create a block in node 3.
curl http://localhost:3003/createBlock

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# get the balance of alice and bob from node 1.
curl http://localhost:3001/getBalance/alice
curl http://localhost:3001/getBalance/bob
```

## Resources

* [Bitcoin Developer Guide](https://bitcoin.org/en/developer-guide)