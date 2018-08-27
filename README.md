# Create A New Blockchain from Scratch

The best way to learn Blockchain is to create one from scratch. The best resource at the moment is still Satoshi's original [whitepaper](https://bitcoin.org/bitcoin.pdf).

This simple Blockchain tutorial is written in Javascript and only for learning purposes. This tutorial features:

* A simple blockchain, illustrating transfer of value
* POW Concensus
* Miner's incentivisation
* Decentralized Computing

**Disclaimer: DO NOT use this code in production wholesale.**

## Installation

```
npm install
```

## Test Scenario
Assuming Node 1 is not connected to anyone. Node 2 is connected to Node 1 and Node 3 is connected to Node 2.

```
# Node 1 is not connected to anyone. In terminal 1,
HTTP_PORT=3001 P2P_PORT=6001 npm start

# Node 2 is connected to node 1. In terminal 2,
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start

# Node 3 is connected to Node 2. In terminal 3,
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6002 npm start

# In terminal 4, check peers to understand the network relationships
curl http://localhost:3001/peers
curl http://localhost:3002/peers
curl http://localhost:3003/peers

# Lets add a tx to Node 3. In terminal 4
 curl -H "Content-type:application/json" --data '{"from" : "alice", "to" : "bob", "value" : 40}' http://localhost:3003/createTransaction

# Node 3 now mines a block. In terminal 4,
curl -H "Content-type:application/json" --data '{"miner":"0xMinerAddress"}' http://localhost:3003/mineBlock

# Check all the 3 nodes and make sure the Blockchain is the same. In terminal 4,
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# check balance
curl http://localhost:3003/getBalance/0xMinerAddress
```

## Exercises

* What happens if the difficulty is kept constant?
* How do you know that the hash of each block is unique?