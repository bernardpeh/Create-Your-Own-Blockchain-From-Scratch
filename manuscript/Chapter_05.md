# Chapter 5: UTXO Transaction

> To allow value to be split and combined, transactions contain multiple inputs and outputs. Normally there will be either a single input from a larger previous transaction or multiple inputs combining smaller amounts, and at most two outputs: one for the payment, and one returning the change, if any, back to the sender. - Bitcoin's Whitepaper

We have been using Account Balance transaction model so far. In Bitcoin, transactions work differently. In each transaction, there are inputs and outputs. The output of a transaction records the addresses and amount to send to. Each input to a transaction provides evidence to consume an output from a previous transaction. 

Any output that can be spent are called **Unspent Transaction Output** (UTXO).

In practice, the balance of an address in the account transaction model is stored in a global state. In the UTXO model, it is the sum of all UTXO of an address.

## 3 Rules of UTXO model

* Every transaction must prove that the sum of its inputs are greater than the sum of its outputs. 
* Every referenced input must be valid and not yet spent.
* The transaction must produce a signature matching the owner of the input.

![UTXO Model](utxo-model.jpg)
*Image Credit: bitcoin.org*

Let us update our Transaction class, replacing toAddress and fromAddress by txIn and txOut classes.

```
# mycode/Transaction.js

const CryptoJs= require("crypto-js")

class Transaction {

    constructor(txIn, txOut) {
        this.txIn = txIn
        this.txOut = txOut
        this.timestamp = Date.now()
        this.hash = CryptoJs.SHA256(this.txIn.toString() + this.timestamp + this.txOut.toString()).toString();
    }

}

module.exports = Transaction;
```

We also need to create the input class

```
# mycode/TxIn.js

class TxIn {

    constructor(txOutHash, txOutIndex, signature) {
        this.txOutHash = txOutHash
        this.txOutIndex = txOutIndex
        this.signature = signature
    }
}

module.exports = TxIn
```

and output class

```
# mycode/TxOut.js

class TxOut {

    constructor(toAddress, value, data='') {
        this.value = value
        this.toAddress = toAddress
        this.data = data
    }
}

module.exports = TxOut
```

To make life easy for us when getting the balance of all addresses, we create another new UTXO class.

```
# mycode/UTXO.js

class UTXO {

    constructor(txOutHash, txOutIndex, toAddress, value, data='') {
        this.txOutHash = txOutHash
        this.txOutIndex = txOutIndex
        this.toAddress = toAddress
        this.value = value
        this.data = data
    }
}

module.exports = UTXO
```

Before we move on, let us recap some basic concepts:
 
* Each CHAIN consists of blocks. 
* Each BLOCK consists of transactions.
* Each TRANSACTIONS consists of inputs and outputs.

## Updating our Blockchain

With all these changes, we need to update our Blockchain code. As an example, let us premine 3 outputs - 30 and 20 and 10 mycoins to alice

```
# mycode/Bockchain.js

const Block = require('./Block');
const Transaction = require('./Transaction')
const TxOut = require('./TxOut')
const UTXO = require('./UTXO')

...

    createGenesisBlock() {

        // premine 3 outputs - 30 and 20 and 10 coins to alice
        let txOuts = []
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 30, 'pre-mint'))
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 20, 'pre-mint'))
        txOuts.push(new TxOut('04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec', 10, 'pre-mint'))
        let genesisTx = new Transaction([],txOuts)
        genesisTx.timestamp = 1535766955
        genesisTx.hash = 'genesis_tx'
        let block = new Block(1535766956, [genesisTx], "0")

        return block
    }
 
    ...
    mineBlock(minerAddress) {
        // coinbase transaction
        this.pendingTransactions.unshift(new Transaction([], [new TxOut(minerAddress,this.miningReward,'coinbase tx')]))

        // create new block based on current timestamp, all pending tx and previous blockhash
        let block = new Block(Date.now(), this.pendingTransactions, this.getBlock(this.getBlockHeight()).hash)
        block.mineBlock(this.difficulty)

        this.chain.push(block)
        // reset pending Transactions
        this.pendingTransactions = []
        return block
    }
    
    // this is a very important function
    // Get all outputs without inputs
    getUTXO(fromAddress) {
        let utxos = []
        for(const block of this.chain) {
            for(const tx of block.transactions){
                // get all output tx
                for (let i=0; i<tx.txOut.length;i++) {
                    if (tx.txOut[i].toAddress == fromAddress) {
                        utxos.push(new UTXO(tx.hash,i,tx.txOut[i].toAddress,tx.txOut[i].value,tx.txOut[i].data))
                    }
                }
            }
        }
        // now filter away those utxos that has been used
        for(const block of this.chain) {
            for(const tx of block.transactions){
                for (const txIn of tx.txIn) {
                    // get all output tx
                    for (let i=0; i<utxos.length;i++) {
                        if (txIn.txOutHash == utxos[i].txOutHash && txIn.txOutIndex == utxos[i].txOutIndex) {
                            // remove the item
                            utxos.splice(i, 1)
                        }
                    }
                }
            }
        }
        return utxos
    }

    // Update this function
    getAddressBalance(address){
        // try writing the code for this part
    }
    ...
 }
```

Q2. Update the code for the getAddressBalance function in Blockchain.js

Now in main.js

```
# mycode/main.js

...
const TxIn = require('./TxIn')
const TxOut = require('./TxOut')
...
    app.post('/createTransaction', (req, res) => {

        // check balance
        if (mycoin.getAddressBalance(req.body.fromAddress) - req.body.value < 0) {
            res.send('Not enough funds!\n')
            return false
        }

        // Get the UTXO and decide how many utxo to sign.
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
        mycoin.createTransaction(new Transaction(txIns, txOuts))
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

    app.get('/getUTXO/:address', (req, res) => {
        res.send(mycoin.getUTXO(req.params.address))
    });
...
```

Q3. Refer to the createTransaction endpoint in main.js. What problem can you see with the code here?

```
// Get the UTXO and decide how many utxo to sign.
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
```

Q4. Refer to the createTransaction endpoint in main.js. What problem can you see with the code here?

```
// lets spend the the UTXO by signing them. What is wrong with this?
for(let requireUTXO of requiredUTXOs) {
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
```

## Testing

A quick reminder.

```
# Alice pubKey: 04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec
and privKey: 9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17

# Bob pubKey: 049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75 and privKey: 885e2b2cfe1262902645880aaf5d44da469c77ca9ebf48550f200ed8482b340e

# Miner pubKey: 046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2 and privKey: f4a13bd5e51b786b1295426cd19b5f23ccf1ee27046baf90b0bb1788a6317f79

```

Its time to simulate the scenario.

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
# Get UTXO of Alice in node 3. In terminal 4,
curl http://localhost:3003/getUTXO/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# get alice balance. it should be 60
curl http://localhost:3001/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# Alice send 31 coins to bob in Node 3. In terminal 4
curl -H "Content-type:application/json" --data '{"fromAddress" :"04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec", "toAddress": "049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75", "value": 31, "data": "i love BTC", "privKey": "9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17"}' http://localhost:3003/createTransaction

# Node 3 now mines a block. In terminal 4,
curl -H "Content-type:application/json" --data '{"minerAddress":"046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2"}' http://localhost:3003/mineBlock

# alice balance. It should be 29
curl http://localhost:3001/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# bob balance. It should be 39
curl http://localhost:3001/getBalance/049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75

# miner balance. It should be 12.5
curl http://localhost:3001/getBalance/046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain
```

Tip: Remember to commit your code before moving on to the next chapter.

## Short Quiz

{quiz, id: chapter_05, attempts: 10}

? In a Bitcoin transaction, why is the sum of output always lesser than the sum of input?

a) Because the input need to include the transaction fees
B) Because the output need to include the transaction fees
c) Because this is just the way it works in Bitcoin

? What happens if Alice uses 1 UTXO (30 mycoins) to send 1 mycoin to Bob and doesn't provide change address?

A) The miner gets Alice's 29 mycoins.
b) Alice UTXO is now updated to 29 mycoins.
c) Bob gets an extra 29 mycoins.
d) No one gets the 29 mycoins. Its lost forever.

{/quiz}

## Resources

* [Optimising UTXO](https://medium.com/@lopp/the-challenges-of-optimizing-unspent-output-selection-a3e5d05d13ef)