# Chapter 6: Smart Contracts

> A smart contract is a computerized transaction protocol that executes
  the terms of a contract. The general objectives are to satisfy common
  contractual conditions (such as payment terms, liens, confidentiality,
  and even enforcement), minimize exceptions both malicious and
  accidental, and minimize the need for trusted intermediaries. Related
  economic goals include lowering fraud loss, arbitrations and
  enforcement costs, and other transaction costs. - "The Idea of Smart Contracts" by Nick Szabo
  
This course wouldn't be complete wouldn't talking about Bitcoin Script.

Bitcoin comes with a [non-turing complete](https://simple.wikipedia.org/wiki/Turing_complete) Smart Contract capability which gives Bitcoin [basic Bitcoin Scripting](https://en.bitcoin.it/wiki/Script) capabilities to create simple [DAPPS](https://www.coindesk.com/information/what-is-a-decentralized-application-dapp/). Decentralised apps is commonly known as Web 3.0 and will become very powerful when combined with AI. 

People are usually unaware, but sending funds from one person to another in Bitcoin usually requires some scripting. One such popular script is called [P2PKH](https://bitcoin.org/en/glossary/p2pkh-address)

P2PKH is a simple Bitcoin script and a Smart Contract. The rule is that the receiver is allowed to spend the funds only if they can proof their ownership of the funds creating a signature with their private key.

## Stack Machine

Before diving into P2PKH script, let us talk a bit about [stack machine](https://en.wikipedia.org/wiki/Stack_machine)

Bitcoin script is programmed in [RPN (Reverse Polish Notation)](https://en.wikipedia.org/wiki/Reverse_Polish_notation) in the stack machine.

In normal arithmetic,

```
// Answer is 14. we do multiplication before addition.
10 + 2 * 2
```

In RPN,

```
// Answer is also 14. We executes arithmetic in a stack
2 2 * 10 + 
```

## P2PKH (Pay to Public Key Hash)

![UTXO Model](p2pkh.svg)
*Image Credit: bitcoin.org*

There are 2 parts to a real Bitcoin transaction:

* Input Script: aka as scriptsig, signature script or unlocking script.
* Output Script: aka scriptPubkey, pubkey script or locking script.

The code in the P2PKH output script is usually,

```
OP_DUP OP_HASH160 <PubkeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

where PubkeyHash is the target address.

To spend the funds in the output, the target address has to provide the input to the output, ie

```
<Sig> <PubKey> OP_DUP OP_HASH160 <PubkeyHash> OP_EQUALVERIFY OP_CHECKSIG

```

where Sig is the signature of the target user and Pubkey is the public key of the target user.

Let's say the sender is Alice and the Receiver is Bob.

* Bob's sig is added to the stack first, meaning its at the lowest.
* Bob's public key added next.
* The op code OP_DUP duplicates the public key.
* OP_HASH160 does a [ripmd160](https://en.wikipedia.org/wiki/RIPEMD) on the top public key.
* Bob's Pubkeyhash is inserted
* OP_EQUAL verifies that 2 top Pubkeyhash are identical. If yes, it replaces both entries by a true. If not, it replaces both entries as a false.
* OP_VERIFY checks the value at the top of the stack. If false, script is terminated. If true, it pops the true off the stack.
* OP_CHECKSIG now checks the Pubkey, all data required to be signed and the signature comes from the same person.

## Making MyCoin Smart

In our course, we also want to add some simple scripting capabilities to our coin but not as stack machine like the Bitcoin Script. Let's just say we want to allow the data field to be smart, ie we want the transaction output to be able to execute mycoin javascript. Mycoin script is basically just javascript wrapped in the mycoin tag

```
in src/chapter_06/Blockchain.js

...
    mineBlock(minerAddress) {
        // coinbase transaction
        this.pendingTransactions.unshift(new Transaction([], [new TxOut(minerAddress,this.miningReward,'coinbase tx')]))

        // create new block based on current timestamp, all pending tx and previous blockhash
        let block = new Block(Date.now(), this.pendingTransactions, this.getBlock(this.getBlockHeight()).hash)

        // run smart contract
        block = Blockchain.runSmartContract(block)

        // start mining
        block.mineBlock(this.difficulty)

        this.chain.push(block)
        // reset pending Transactions
        this.pendingTransactions = []
        return block
    }

    static runSmartContract(block) {
        // lets try to execute all the javascript in the outputs in the mined block
        for(let i=0; i < block.transactions.length; i++) {
            for(let j=0; j < block.transactions[i].txOut.length; j++) {
                let matched = block.transactions[i].txOut[j].data.match(/<mycoin>(.*?)<\/mycoin>/g)
                if (matched) {
                    matched.map(function(val){
                        // strip tags
                        val = val.replace(/<\/?[^>]+(>|$)/g, "")
                        eval(val)
                    })
                }
            }
        }
        return block
    }
...
```

What if you run `block = Blockchain.runSmartContract(block)` after `block.mineBlock(this.difficulty)` ?

With mycoin scripting supported, we have godly powers. Let's just say everyone agrees that the miner is getting too much reward. We want to overwrite the system and reduce his their reward from 12.5 to 0.2. We can inject the following script in the data field.

```
<mycoin>block.transactions[0].txOut[0].value=0.2</mycoin>
```

Its time to try it out.

## Testing

A quick reminder.

```
# Alice pubKey: 04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec
and privKey: 9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17

# Bob pubKey: 049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75 and privKey: 885e2b2cfe1262902645880aaf5d44da469c77ca9ebf48550f200ed8482b340e

# Miner pubKey: 046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2 and privKey: f4a13bd5e51b786b1295426cd19b5f23ccf1ee27046baf90b0bb1788a6317f79

```

In Terminal 1, start the node

```
HTTP_PORT=3001 P2P_PORT=6001 node src/chapter_06/main.js
```

In Terminal 2, start the node

```
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 node src/chapter_06/main.js 
```

In Terminal 3, start the node

```
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6002 node src/chapter_06/main.js 
```

In Terminal 4, 

```
# Alice send 31 coins to bob in Node 3 with a twist in the data field. In terminal 4
curl -H "Content-type:application/json" --data '{"fromAddress" :"04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec", "toAddress": "049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75", "value": 11, "data": "<mycoin>block.transactions[0].txOut[0].value=0.2</mycoin>", "privKey": "9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17"}' http://localhost:3003/createTransaction

# Node 3 now mines a block. In terminal 4,
curl -H "Content-type:application/json" --data '{"minerAddress":"046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2"}' http://localhost:3003/mineBlock

# alice balance. It should be 49
curl http://localhost:3001/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# bob balance. It should be 11
curl http://localhost:3001/getBalance/049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75

# miner balance. It should be 0.2
curl http://localhost:3001/getBalance/046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain
```

## Resources
  
  * [Bitcoin Script](https://bitcoin.org/en/developer-guide#transactions)
  * [How Bitcoin address is generated](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses)