const Transaction = require('./Transaction');
const Blockchain = require('./Blockchain');
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

let mycoin = new Blockchain();
// Set the difficulty based on your CPU speed
mycoin.setDifficulty(3);
// set miner reward
mycoin.setMiningReward(12.5);

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];
var peers = [];
var wss;

var initHttpServer = () => {

    var app = express();
    app.use(bodyParser.json());

    app.post('/createTransaction', (req, res) => {
        // req.body.data
        mycoin.createTransaction(new Transaction(req.body.from, req.body.to, req.body.value));
        // broadcast(getLatestBlockJSON);
        res.send('Current Pending Txs: '+JSON.stringify(mycoin.getPendingTransactions())+'\n');
    });

    app.post('/mineBlock', (req, res) => {
        mycoin.mineBlock(req.body.miner);
        broadcast(mycoin.getBlock(mycoin.getBlockHeight()));
        res.send();
    });

    app.get('/getBlockchain', (req, res) => {
        res.send(mycoin.getBlockchain());
    });

    app.get('/getBalance/:address', (req, res) => {
        res.send(req.params.address+' balance is: '+mycoin.getAddressBalance(req.params.address)+'\n');
    });

    app.get('/peers', (req, res) => {
        res.send(peers.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};


var initP2PServer = () => {

    wss = new WebSocket.Server({port: p2p_port});
    wss.on('connection', (ws) => {
        // do something for incoming message
        ws.on('message', (data) => {
            // server received message. pass it on
            console.log('Syncing Blocks: %s', data);
            // check if broadcasted block is valid. if so, add to current block and broadcast
            // current block
            let currentBlock = mycoin.getBlock(mycoin.getBlockHeight())
            // broadcasted new block
            let newBlock = JSON.parse(data)
            // if new Block found, update current chain
            if (currentBlock.hash == newBlock.previousHash) {
                mycoin.addBlock(newBlock)
                broadcast(newBlock)
            }
        });
    });

    console.log('listening websocket p2p port on: ' + p2p_port);

};

var initPeers = (initialPeers) => {
    initialPeers.forEach( (peer) => {
        var ws = new WebSocket(peer);
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
initPeers(initialPeers);