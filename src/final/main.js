const Transaction = require('./Transaction')
const TxIn = require('./TxIn')
const TxOut = require('./TxOut')
const Blockchain = require('./Blockchain')
const wallet = require('./Wallet')
var express = require("express")
var bodyParser = require('body-parser')
var WebSocket = require("ws")

let mycoin = new Blockchain()
// Set the difficulty based on your CPU speed
mycoin.setDifficulty(3)
// set miner reward
mycoin.setMiningReward(12.5)

var http_port = process.env.HTTP_PORT || 3001
var p2p_port = process.env.P2P_PORT || 6001
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []
var peers = []
var wss

var initHttpServer = () => {

    var app = express()
    app.use(bodyParser.json())

    app.post('/sendTransaction', (req, res) => {

        if (mycoin.getAddressBalance(req.params.fromAddress) - req.body.value > 0) {
            res.send('Not enough funds!\n')
            return false
        }

        // Get the UTXO and decide how many utxo to sign. this is the most tricky part. What problems can you see?
        let utxos = mycoin.getUTXO(req.body.fromAddress)
        let accumulatedUTXOVal = 0
        let requiredUTXOs = []
        for(const utxo of utxos) {
            requiredUTXOs.push(utxo)
            accumulatedUTXOVal += utxo.value
            if (accumulatedUTXOVal - req.body.value > 0) {
                break
            }
        }
        let txIns = []
        let requiredUTXOValue = 0
        // lets spend the the UTXO by signing them. What is wrong with this?
        for(let requireUTXO of requiredUTXOs) {
            // why is this a bad practice?
            let sig = wallet.sign(requireUTXO.txOutHash, req.body.privKey)
            if (wallet.verifySignature(requireUTXO.txOutHash, sig, req.body.fromAddress)) {
                let txIn = new TxIn(requireUTXO.txOutHash, requireUTXO.txOutIndex, sig)
                requiredUTXOValue += requireUTXO.value
                txIns.push(txIn)
            }
            else {
                res.send('You are not the owner of the funds!')
                return
            }
        }
        // Check if change is required. In the real world, the change is normally send to a new address.
        let txOuts = []
        txOuts.push(new TxOut(req.body.toAddress, req.body.value, req.body.data))

        let changeValue = requiredUTXOValue - req.body.value
        if (changeValue > 0) {
            txOuts.push(new TxOut(req.body.fromAddress,changeValue,'change'))
        }

        mycoin.addTransaction(new Transaction(txIns, txOuts))

        res.send('Tx added successfully. Current Pending Txs: '+JSON.stringify(mycoin.getPendingTransactions())+'\n')
    });

    app.post('/mineBlock', (req, res) => {
        mycoin.mineBlock(req.body.miner)
        broadcast(mycoin.getBlock(mycoin.getBlockHeight()))
        res.send()
    });

    app.get('/getUTXO/:address', (req, res) => {
        res.send(mycoin.getUTXO(req.params.address))
    });

    app.get('/getPendingTransaction', (req, res) => {
        res.send(JSON.stringify(mycoin.getPendingTransactions()));
    });

    app.get('/getBlockchain', (req, res) => {
        res.send(JSON.stringify(mycoin.getBlockchain()));
    });

    app.get('/getBlockheight', (req, res) => {
        res.send(JSON.stringify(mycoin.getBlockHeight()));
    });

    app.get('/getBalance/:address', (req, res) => {
        res.send(req.params.address+' balance is: '+mycoin.getAddressBalance(req.params.address)+'\n')
    });

    app.get('/peers', (req, res) => {
        res.send(peers.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort))
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port))
};


var initP2PServer = () => {

    wss = new WebSocket.Server({port: p2p_port})
    wss.on('connection', (ws) => {
        // do something for incoming message
        ws.on('message', (data) => {
            // server received message. pass it on
            console.log('Syncing Blocks: %s', data)
            // check if broadcasted block is valid. if so, add to current block and broadcast
            // current block
            let currentBlock = mycoin.getBlock(mycoin.getBlockHeight())
            // broadcasted new block
            let newBlock = JSON.parse(data)
            // if new Block found, update current chain and re-broadcast

            if (currentBlock.hash == newBlock.previousHash) {
                mycoin.addBlock(newBlock)
                broadcast(newBlock)
            }
            else {
                broadcast('Blocks out of Sync! Current Block hash: '+currentBlock.hash+' new Block prev hash: '+newBlock.previousHash)
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