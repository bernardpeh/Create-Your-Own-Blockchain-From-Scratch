const express = require("express")
const bodyParser = require('body-parser')
const WebSocket = require("ws")
const CryptoJs= require("crypto-js")

const Blockchain = require('./Blockchain')
const Transaction = require('./Transaction')
const Block = require('./Block')

const http_port = process.env.HTTP_PORT || 3001
const p2p_port = process.env.P2P_PORT || 6001
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []
var peers = []
var wss

// create mycoin blockchain
let mycoin = new Blockchain();
// Set the difficulty based on your CPU speed
mycoin.setDifficulty(3);
// set miner reward
mycoin.setMiningReward(12.5);

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

        // check balance
        // if (mycoin.getAddressBalance(req.body.fromAddress) - req.body.value < 0) {
        //     res.send('Not enough funds!\n')
        //     return false
        // }

        // req.body.data
        mycoin.createTransaction(new Transaction(req.body.fromAddress, req.body.toAddress, req.body.value));
        let pendingTx = JSON.stringify(mycoin.getPendingTransactions())
        broadcast(pendingTx)
        res.send('Current Pending Txs: '+pendingTx+'\n')
    });

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

initHttpServer()
initP2PServer()
initPeers(initialPeers)
