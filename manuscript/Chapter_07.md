# Chapter 7: Scalability

Scalability is the biggest problem in a fully decentralised Blockchain like Bitcoin at the moment. As we have learned, the more decentralised the Blockchain is, the slower the concensus, meaning the lesser the tx/s is. To be fully usable in the day to day life, it has to support micropayments cheaply and be as fast as visa which is about 4000 tx/s. 

Q1. In the POW system, given each transaction as 249 bytes and if it takes an average of 10 mins to mine a block, find the transaction speed of Bitcoin (per second)?

There are several ways to increase the transaction speed without sacrificing decentralisation. One way is to use [layer 2 solutions](https://hackernoon.com/blockchain-scalability-layer2-bitcoin-ethereum-bb34afd1f9d2).

## Layer 2 Solutions

Bitcoin’s main chain (Layer 1) transaction speed is too slow for mass adoption. Satoshi did propose a solution:

> “One use of nLockTime is high frequency trades between a set of parties. They can keep updating a tx by unanimous agreement. The party giving money would be the first to sign the next version. If one party stops agreeing to changes, then the last state will be recorded at nLockTime. If desired, a default transaction can be prepared after each version so n-1 parties can push an unresponsive party out. Intermediate transactions do not need to be broadcast. Only the final outcome gets recorded by the network.” - Satoshi Nakamoto

So what satoshi is suggesting is that there are only 2 on-chain touch points between 2 parties. The first touch point is when both parties enter into a locked contract (payment channel) and the second is when either one of the party decides to break the contract. All intermediate transactions can happen off-chain. It’s a bit like linkedin, you don’t have to know anyone in order to trade with them. Indeed, this is how many new scaling technologies like the [Lightning Network](https://lightning.network/) operates. 

## Segwit

The second option is to pack more transactions into a block and we can do this is reorganising the block structure or increasing the block size limit. 

Segwit (Segregated Witness) is a backwards compatible upgrade of the core Bitcoin blockchain. In the current Bitcoin implementation, all transactions are packed in a 1 MB block limit. In a transaction, the digital signature (witness) takes up the most space. The digital signature is the encrypted proof of the sender, receiver and the transaction details, ie who sends how much BTC to who. If we can segregate the signature from each transaction, then we can pack more transactions in each block, thereby increasing transaction speed and reducing transaction fees. The segregated signature lives in a new extended block area and not part of the 1 MB main block.

Another way to improve scalability is to pack more transactions into a block. Let's just say we increase the block size from 1 MB to 4MB or more, then suddenly we can increase the transaction speed by 4 times. This is what Bitcoin Cash (BCH) has done.

It is important to note that Traditional Bitcoin address should start with 1 or 3. Segwit address should start with 3 or bc1. See prefixes in https://en.bitcoin.it/wiki/List_of_address_prefixes if interested.

The biggest Segwit confusion lies in the definition of Block Size and Block Weight. Since Segwit, block size concept is replaced by block weight. Block Size is measured in Bytes and Block Weight is measured in Weight Units (WU). The maximum weight of a 1 MB block is 4000 WU. In calculating the weight of a transaction, a non-witness byte weighs four weight units and a witness byte weighs one weight unit. A non-witness byte weighs four weight units. A witness byte weighs one weight unit.

Take this [Segwit transaction](https://www.blockchain.com/btc/tx/08e6f7be047709b145502c9f173ee62cd47e7b30d2e0e22607681f806f5b63c7) for example and compare it with a [normal transaction](https://www.blockchain.com/btc/tx/1c689ae229213eefccb5e1fdbf388d7143906fd907354857bc6da750fe7cd563).

The actual tx size is 249 bytes and it would take up 249 x 4 = 996 WU if its not Segwit. Since it is Segwit, it takes up only 669 WU, meaning the signature (witness) saves the transaction 996 - 669 = 327 WU (32.831% savings).

What does all this mean? For a typical Bitcoin transaction of value, you get 33% discount on transaction fee if you use Segwit. You get bigger discount if your signature is bigger.

[Segwit2x]((https://cointelegraph.com/news/bitcoin-core-developers-remain-adamant-in-opposition-to-segwit2x-potential-showdown-in-november)) combines Segwit in with a 2MB block size Hard-Fork instead of 1MB, meaning a maximum of 8000 WU. On November 8, 2017 the developers of SegWit2x announced that the planned hard fork had been canceled, due to a lack of sufficient consensus.

## Short Quiz

{quiz, id: chapter_07, attempts: 10}

? How does a crypto exchange provide fast Bitcoin to Litecoin trading since we know that Bitcoin cannot scale at the moment?

A) The trading doesn't happen on the chain, its just fake manipulation of database values.
b) Many crypto exchange uses the Lightning Network.
c) Many crypto exchanges uses Atomic Swaps

? You created a transaction in the Bitcoin network but realised your fee was too low. Due to its low scalability, what is the best way to ensure that your transaction is mined as soon as possible.

a) Be patient and wait for weekends because the number of transactions are lower during the weekends.
b) Try to spend the unconfirmed output from the previous transaction with the same transaction fee but turning on the “Replace-by-fee” option.
c) Call up a miner and tell them to include your transaction manually in the next block.
D) Try to spend one of the unconfirmed output from the previous transaction with a higher tx fee.

{/quiz}

## Resources

* [History of Segwit and Segwit2x](https://cointelegraph.com/explained/all-you-need-to-know-about-this-whole-segwit-vs-segwit2x-thing-explained)
* [Lightning Network](https://lightning.network/)

