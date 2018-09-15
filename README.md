# Create A New Blockchain from Scratch

This is a Leanpub course - https://leanpub.com/c/create-your-own-blockchain-from-scratch
 
## Installation

```
npm install
```

## Test Scenario
Assuming Node 1 is not connected to anyone. Node 2 is connected to Node 1 and Node 3 is connected to Node 2.

```

# Alice pubKey: 04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec
and privKey: 9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17

# Bob pubKey: 049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75 and privKey: 885e2b2cfe1262902645880aaf5d44da469c77ca9ebf48550f200ed8482b340e

# Miner pubKey: 046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2 and privKey: f4a13bd5e51b786b1295426cd19b5f23ccf1ee27046baf90b0bb1788a6317f79

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

# Get UTXO of Alice node 3. In terminal 4,
curl http://localhost:3003/getUTXO/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# check alice balance. Should gives you 60. In terminal 4,
curl http://localhost:3003/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# Alice send 31 coins to bob in Node 3. In terminal 4
curl -H "Content-type:application/json" --data '{"fromAddress" :"04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec", "toAddress": "049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75", "value": 31, "data": "i love TMA", "privKey": "9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17"}' http://localhost:3003/sendTransaction

# Node 3 now mines a block. In terminal 4,
curl -H "Content-type:application/json" --data '{"miner":"046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2"}' http://localhost:3003/mineBlock

# Check blockchain in all nodes. Ensure they are the same. In terminal 4
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# check alice balance on node 1. Should be 29
curl http://localhost:3001/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# check bob balance on node 1. Should be 31
curl http://localhost:3001/getBalance/049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75

# check miner balance on node 1. Should be 12.5
curl http://localhost:3001/getBalance/046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2

# get utxo of alice on node 1. In terminal 4
curl http://localhost:3001/getUTXO/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec
```

## Exercises

* What happens if the difficulty is kept constant?
* How do you know that the hash of each block is unique?