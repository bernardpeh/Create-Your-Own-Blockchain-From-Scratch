# Introduction

There is a very strong correlation between the popularity of Blockchain and Bitcoin (cryptocurrency). Today, many people use these words interchangeably. The fact is that Bitcoin is a product of Blockchain, ie Blockchain can exists without Bitcoin and not the other way round. Think of Blockchain as the bricks and Bitcoin as the house. With the same bricks, we could also build different type of houses. Technically, this means that the same technology could create other Cryptocurrencies such as Litecoin, Ethereum, Ripple...etc.

Cryptocurrency is simply a framework that allows the transfer of value and people have been trying to do that for years. Many projects were unsuccessful because of the need of a fully functional decentralised system.

Contrary to what many people thought, Satoshi didn't create the whole of Bitcoin. He simply bundled several existing technologies together and created an incentive for using them. In my opinion, his greatest contribution would be creating a system to incentivise the miners. Without the miners, Bitcoin will have no value and its network will not be secure (decentralised).

Bitcoin has its humble beginnings in 2009 and has attracted worldwide attention ever since. The fact that it allows cross border payments without interference from anyone including the government means that it is a highly controversial technology. For the first time in history, we have a currency that is beyond the control of any banks and governments, giving everyone full financial freedom.

Today, most people see Cryptocurrencies as a get rich scheme. Let's be honest, people who know it well are technical people who cannot explain it in layman's language. People who can explain it are marketeers and even scammers who love to trick the uneducated. Sadly, cryptocurrencies are still highly manipulative at this stage and mainly used by traders for pump and dump.

There are always 2 sides to a coin. Cryptocurrencies share a unique property with fiat currency - it is impossible to double spend. If I give 1 dollar to bob, my pocket will have 1 dollar less. I cannot magically make another dollar appear in my pocket and there is no way to fake this event. If I do it in public, everyone will know that I have 1 dollar less and bob has 1 dollar more. This immutable transactional property can be very useful for any applications that requires transparency which is the biggest usecase of a public ledger.

## The Genesis Block

2009-01-03 18:15:05 is an important date in our evolution history as we have our first **trustless** virtual currency. It is the date when Satoshi mined the first block being (Genesis Block), ie [Block height 0](https://www.blockchain.com/btc/block-height/0).

Let us look at the first transaction ever made. Satoshi embedded a message into the transaction "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"

> The root problem with conventional currency is all the trust that's required to make it work. The central bank must be trusted not to debase the currency, but the history of fiat currencies is full of breaches of that trust. Banks must be trusted to hold our money and transfer it electronically, but they lend it out in waves of credit bubbles with barely a fraction in reserve. We have to trust them with our privacy, trust them not to let identity thieves drain our accounts. - Satoshi Nakamoto

Satoshi was concerned that many banks lied about the amount of funds they have and they could threaten the governments and get away easily after crashing the global economy.

Bitcoin was created to fight corruption.

## The Blockchain Ecosystem

It is important to note that when people talk about Blockchain, they are actually referring to the Blockchain ecosystem. The ecosystem comprises of 6 technologies with "Blockchain" being one of them. This immutability transactional ecosystem cannot work if its missing one of the six key ingredients. The 6 technologies are:

* Decentralised Systems
* Blockchain
* Concensus
* Incentivisation
* Public Key Cryptography
* Smart Contracts

In this course, we will take a dive into all the 6 components of the Blockchain Ecosystem (aka Distributed Ledger Technology).

## How the Course is Conducted

The best way to learn about Blockchain is to learn how Bitcoin works since it is the first Blockchain application. The best resource for learning Bitcoin at the moment is still [Satoshi's original whitepaper](https://bitcoin.org/bitcoin.pdf) and [Bitcoin Developer's Documentation](https://bitcoin.org/en/developer-documentation). This course aims to give readers hands-on experience to complement the Bitcoin Developer's Documentation.

This course is an **intensive deep dive into the building blocks** of the Blockchain and how Bitcoin works. It is ideally conducted as a workshop in a computer lab where every participant can listen and code at the same time. **The course duration is estimated to be 15 to 21 hrs (depending on speed), consisting of 30% theory and 70% practical**.

In every chapter, the theory will consists of going through some basic concepts with Questions and Answer sessions. Sample code will be provided. Participants are strongly advised to answer the questions and run the code in a separate branch in their own environment to see how things work.
 
If participants got stuck, *they can use the source code from various chapters under the src dir* so as to keep the course moving. Remember the best way to learn is to experiment yourself and make mistakes. Participants are strongly encouraged not to look at the answers unless absolutely necessary.

## The Challenge

In the year 2025, your company decided to pay all employees using the company's own Cryptocurrency called "mycoin".

You have been tasked to create a proof of concept in NodeJS using the Bitcoin's model. You are not to take shortcuts but instead create one from scratch. It doesn't have to be 100% working. You just need to focus on proofing the concept rather worrying about the syntax.

Put all your knowledge about the Blockchain and Cryptocurrency into code and give it a shot.

## Course Objectives

* To give participants more confidence in how the Blockchain and Cryptocurrency works.
* To inspire participants to pursue further knowledge in Blockchain Technologies.
* To give participants strong foundation to take on more complex Ethereum and Hyperledger development projects.

## Course Pre-requisites

* A modern day computer or laptop
* Ubuntu or Mac OS
* Git account signed up and Git installed locally
* Internet connection
* NodeJS installed
* IDE (VS Code or Sublime Text) installed
* Javascript programming language
* Comfortable with using the Command Line
* Basic knowledge of Blockchain and Cryptocurrency
* An open mind and a passion to learn

**Disclaimer: DO NOT copy the code in this course wholesale without know what it does.**

## Installation

Clone the repo in your home dir:

```
git clone https://github.com/bernardpeh/Create-Your-Own-Blockchain-From-Scratch.git
```

Opening up a terminal and in the mycoin folder, install all node packages and initialise our workspace

```
cd Create-Your-Own-Blockchain-From-Scratch
npm install

# Let us create a new branch from the master branch so we can commit to it
git checkout -b mycode
# mycode dir is the place where we will create our code
mkdir mycode
touch mycode/.gitkeep
git add mycode
git commit -m"init"
```

Our environment is now set.

Note: For windows users, you might also need

```
npm install --save-dev cross-env
```

## Short Quiz

{quiz, id: introduction, attempts: 10}

? What are the legitimate ways to create a new cryptocurrency other than creating one from scratch?

a) Copy the code of a current coin and tweak the parameters.
b) Create a Token Smart Contract on a platform that supports it.
C) All of the above.

? Which of the following is/are true for all cryptocurrencies currently?

A) It is faster to use cryptocurrency for cross border funds transfer as compared to using traditional banking system.
b) It is cheap to send and receive crytocurrencies.
c) The price of cryptocurrencies can be manipulated.
d) Using cryptocurrency to transfer funds is more secure than using fiat currency. 
e) All of the above.

{/quiz}

## Resources

* The [Bitoin Whitepaper](https://bitcoin.org/bitcoin.pdf)
* [Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook)
