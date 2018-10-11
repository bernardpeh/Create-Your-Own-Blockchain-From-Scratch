# Chapter 4: Public Key Cryptography

> What is needed is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party. - Bitcoin's Whitepaper

[Public-key cryptography](Public-key_cryptography) is any cryptographic system that uses pairs of keys to ensure security between 2 parties. The public key can be disseminated widely and private key is only known to the owner. There are 2 objectives:

* The public key can verify that the private key signed a message.
* The private key can decrypt the message encrypted by the public key.

The cryptocurrency addresses that we have been using, ie alice, bob and miner were just examples. In the crypto world, each address is mathematically related to the public key. In our course, let's just assume each address is the public key for the sake of simplicity.

![pki](pki.png)
*Image credit: Wikipedia*

Before an amount can be spend from an account, the user needs to sign the transaction with his private key. Since the public key and transaction details are known, each nodes can verify that the owner is indeed the rightful owner of the account.

Instead of using the addresses "Alice" and "Bob", let us create a proper wallet for each one of them.

```
# mycode/Wallet.js

// Note that the wallet does not need to be connected to the Blockchain.
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const request = require('request')

class Wallet {

    // auto generate keypair on init
    constructor() {
        this.keyPair = ec.genKeyPair()
    }

    // get generated pub Key
    getPublicKey() {
        // returns hex
        return this.keyPair.getPublic().encode('hex')
    }

    // get generated priv Key
    getPrivateKey() {
        // convert from big number to hex
        return this.keyPair.getPrivate().toString(16)
    }

    static sign(message, privateKey) {
        let keyPair = ec.keyFromPrivate(privateKey, 'hex');
        return keyPair.sign(message)
    }

    static verifySignature(message, signature, publicKey) {
        let keyPair = ec.keyFromPublic(publicKey, 'hex')
        if (!keyPair.verify(message,signature)) {
            console.log('verification error')
            return false
        }
        return true
    }
}

module.exports = Wallet;
```

[secp256k1](https://en.bitcoin.it/wiki/Secp256k1) is a type of elliptic curve cryptography used by Bitcoin. We will be using it to generate the public and private key pair. 

Let us test it out.

```
# mycode/CreateAddress.js

const wallet = require('./Wallet')

let w = new wallet()
console.log('public key '+w.getPublicKey())
console.log('private key '+w.getPrivateKey())
```

Lets run it.

```
node mycode/CreateAddress.js

public key 04dc6d9a118abb5c26961e6f814d6f61218adee9ced518de231ce63587f9...
private key c64bf4124a706e8e1d2679d2d37919d223abd76b8b0ec435b28b1447a200...
```

Q1. Why is Bitcoin address(eg 367f4YWz1VCFaqBqwbTrzwi2b1h2U3w1AF) much shorter than the public key we generated?

The randomness in the algorithm ensures that you get different public and private keys everytime you run it. So let us use the following keys:

```
# Alice pubKey: 04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec
and privKey: 9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17

# Bob pubKey: 049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75 and privKey: 885e2b2cfe1262902645880aaf5d44da469c77ca9ebf48550f200ed8482b340e

# Miner pubKey: 046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2 and privKey: f4a13bd5e51b786b1295426cd19b5f23ccf1ee27046baf90b0bb1788a6317f79
```

It's very common to see R, S and V in Elliptic curve cryptography. 

Q2. Proof that this signature is a signed "hello" message from alice

```
{"r":"67a63bac0a761021b38c8d5ce602bc2de3210bd236f6b59539b3526395ad2ec8","s":"ed2edaeb2e1893c78a460a4055ca1f6cae41e1eca6da7ae5ffc44981c33c3c97","recoveryParam":1}
```

## Pre-Mine

Pre-mining is the creation of a crypto coins before the cryptocurrency is made available for public use. 

Q3. Where would you make changes in the code to pre-mine some mycoin to alice? Pre-mine 30 coins to alice.

## Adding Hash to Transaction Class

Every interacting objects in the Blockchain should be referenced by a hash. Let us upgrade our Transaction class.

```
# mycode/Transaction.js

const CryptoJs= require("crypto-js")

class Transaction{
    constructor(fromAddress, toAddress, amount, data='', timestamp = Date.now()){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.value = amount
        this.timestamp = timestamp
        this.data = data
        // How to ensure true randomness?
        this.hash = CryptoJs.SHA256(this.fromAddress + this.timestamp + this.toAddress + this.value).toString();
    }
}

module.exports = Transaction;
```

## Proofing Ownership Before Sending Coins

When Alice wants to send some coins to Bob, she needs to proof she owns the coin. Let us update main.js.

Q4. Add logic to createTransaction API endpoint in main.js to check that sender is allowed to spend the funds before adding the transaction to the pending transactions queue.

## Testing

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
# Lets try again with 30 mycoins. What happens when you send 40 coins?
curl -H "Content-type:application/json" --data '{"fromAddress" : "04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec", "toAddress" : "049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75", "value" : 10, "privKey" : "9166a051fa4e3b5a128c83e5c3c172211a277651cb6b57349efc7bff2e9cfd17"}' http://localhost:3003/createTransaction

curl -H "Content-type:application/json" --data '{"minerAddress":"046eea81eeb92fd1772f60abb8b609a8c0710483a4a1c67d1c9ed66e6d366ec206791437a83812820ca9a1a6a186f3f41d1b3537a6c7a86b02a7db7ad46cc9f6e2"}' http://localhost:3003/mineBlock

# check the chain in all the nodes. They should be the same
curl http://localhost:3003/getBlockchain
curl http://localhost:3002/getBlockchain
curl http://localhost:3001/getBlockchain

# get the balance of alice and bob from node 1.

# alice
curl http://localhost:3001/getBalance/04c7facf88f8746f4388bcd1654a43afff83e5552a4b723352b5547cd5ba021e55ea4014c5cdec3133652f93a6d032b394387c487ed881cee5ac232bbc754cddec

# bob
curl http://localhost:3001/getBalance/049cb31ebe756ed1e5101993c5760798f1ff0a8734e4378c138ea36f5503cee4b8b370a028ff3464592bb118a749d8b46f99753729ed64a7a23a0a98bb282c5d75
```

Tip: Remember to commit your code before moving on to the next chapter.

## Short QUiz

Q1. Which of the following option is the best way to protect your private keys?

* Write your key down on a piece of paper.
* Store your key in an encrypted disk.
* Use third party password protection service or software to store your key.
* Try to remember your key in your mind forever.
* Split your key into chunks and give them to different people for safe keeping.

## Resources

* [Bitcoin Addresses](https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses)