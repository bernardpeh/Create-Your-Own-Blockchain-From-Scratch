const wallet = require('./Wallet')

let w = new wallet()
console.log('public key '+w.getPublicKey())
console.log('private key '+w.getPrivateKey())

