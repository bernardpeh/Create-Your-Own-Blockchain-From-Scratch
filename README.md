# Create A New Blockchain from Scratch

## Introduction

There is a very strong corelation between the popularity of Blockchain and Bitcoin (cryptocurrency). Today, many people use these words interchangeably. The fact is that Bitcoin is a product of Blockchain, ie Blockchain can exists without Bitcoin and not the other way round. Think of Blockchain as the bricks and Bitcoin as the townhouse. With the same bricks, you could also build different type of houses. Technically, this means that the same technology could create other Cryptocurrencies such as Litecoin, Ethereum, Ripple...etc.

Contrary to what many people thought, Satoshi didn't create Bitcoin. He simply bundled several existing technologies together and created an incentive for using them. In my opinion, his greatest contribution would be creating a system to incentivise the miners. Without the miners, Bitcoin will have no value and its network will not be secure.

Bitcoin has its humble beginnings in 2009 and has attracted worldwide attention ever since. The fact that it allows cross border payments without interference from anyone including the government means that it is a highly controversial technology. For the first time in history, we have a currency that is beyond the control of any governments, giving everyone full financial freedom. 

Today, most people see Cryptocurrencies as a get rich scheme. Let's be honest, people who know it well are technical people who cannot explain it in layman's language. People who can explain it are marketeers and scammers who love to trick the uneducated. Sadly, cryptocurrencies are still highly manipulative at this stage and mainly used by traders for pump and dump.

There are always 2 sides to a coin. Cryptocurrency shares a unique property with a real fiat currency - it is impossible to double spend. If I give 1 dollar to bob, my pocket will have 1 dollar less. I cannot magically make another dollar appear in my pocket. There is no way to fake this event and if I do it in public, everyone will know that I have 1 dollar less and bob has 1 dollar more. This immutable transactional property can be very useful for any applications that requires transparency which is the biggest usecase of a public ledger. 

It is important to note that when people talk about Blockchain, they are actually referring to the Blockchain ecosystem. The ecosystem comprises of 5 technologies with the Blockchain being one of them. The immutability transactional system cannot work if its missing one of the five key ingredients. The 5 technologies are:

* Distributed System
* Blockchain
* Concensus
* Incentivisation
* Public Key Cryptography

## Learning the Blockchain

The best way to learn about Blockchain is to create a cryptocurrency from scratch. The best resource at the moment is still Satoshi's original [whitepaper](https://bitcoin.org/bitcoin.pdf) and [Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook) by Andreas Antonopoulos.

In this 5 part tutorial series, we will attempt to create a coin called MyCoin. We will be using Javascript and focus on the concepts rather than the syntax.

**Disclaimer: DO NOT copy the code in this tutorial wholesale without know what it does.**

## Distributed System

"A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution." - Bitcoin's Whitepaper

## Concensus

"For our timestamp network, we implement the proof-of-work by incrementing a nonce in the
 block until a value is found that gives the block's hash the required zero bits." - Bitcoin's Whitepaper
 
 ## Incentivisation and Coin Circulation
 
 "By convention, the first transaction in a block is a special transaction that starts a new coin owned by the creator of the block. This adds an incentive for nodes to support the network, and provides a way to initially distribute coins into circulation, since there is no central authority to issue them." - Bitcoin's Whitepaper

## The Blockchain

"A timestamp server works by taking a hash of a block of items to be timestamped and widely publishing the hash, such as in a newspaper or Usenet post. The timestamp proves that the data must have existed at the time, obviously, in order to get into the hash. Each timestamp includes the previous timestamp in its hash, forming a chain, with each additional timestamp reinforcing the ones before it." - Bitcoin's Whitepaper

"To allow value to be split and combined, transactions contain multiple inputs and outputs. Normally there will be either a single input from a larger previous transaction or multiple inputs combining smaller amounts, and at most two outputs: one for the payment, and one returning the change, if any, back to the sender." - Bitcoin's Whitepaper

# Public Key Cryptography

"What is needed is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party." - Bitcoin's Whitepaper

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