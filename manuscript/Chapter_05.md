# Chapter 5: UTXO Transaction Model

> To allow value to be split and combined, transactions contain multiple inputs and outputs. Normally there will be either a single input from a larger previous transaction or multiple inputs combining smaller amounts, and at most two outputs: one for the payment, and one returning the change, if any, back to the sender. - Bitcoin's Whitepaper

## 3 Rules of UTXO model

* Every transaction must prove that the sum of its inputs are greater than the sum of its outputs.
* Every referenced input must be valid and not yet spent.
* The transaction must have a signature matching the owner of the input for every input.