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