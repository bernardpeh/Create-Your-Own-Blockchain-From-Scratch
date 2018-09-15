# Chapter 1: Decentralised System

> A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. - Bitcoin's Whitepaper

A peer-to-peer (P2P) network is a network in which interconnected nodes ("peers") share resources amongst each other without the use of a centralized administrative system. This technology is not new as we have seen it being used in Napster and BitTorrent.

![Different Systems](centralised_decentralised.jpeg)

* Centralised System - Centralised control (single point of failure)

* Distributed System - Distribute part of the resource to other nodes but could still be centrally controlled with points of failure.

* Decentralised System - Every node is fully redundant with no points of failure.
 
## Creating a Simple P2P System with WebSocket

[WebSockets](https://en.wikipedia.org/wiki/WebSocket) allow a long-held single TCP socket connection to be established between the client and server which allows for bi-directional, full duplex, messages to be instantly distributed with little overhead resulting in a very low latency connection.

Let us assume that we have 3 nodes in our decentralised system.

* Node 1 is not connected to anyone. (HTTP_PORT=3001, P2P_PORT=6001)
* Node 2 is connected to Node 1. (HTTP_PORT=3002, P2P_PORT=6002) 
* Node 3 is connected to Node 2. (HTTP_PORT=3003, P2P_PORT=6003)

The connected nodes gossip with each other to transfer data. If the ledger in Node 3 is updated, the data will be broadcasted to Node 2 and eventually to Node 1.

We will be using this simple network throughout all the chapters of the course.

The code for the simple websocket server with the api endpoint will be as follows:

```
# src/chapter_01/main.js

```

Open up 3 terminals, Lets assign terminal 1 to node 1 and vice versa.

In Terminal 1,
```
HTTP_PORT=3001 P2P_PORT=6001 node src/chapter_01/main.js
```

In Terminal 2,
```
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 node src/chapter_01/main.js 
```

In Terminal 3,
```
HTTP_PORT=3003 P2P_PORT=6003 PEERS=ws://localhost:6002 node src/chapter_01/main.js 
```

## Testing

Open another Terminal. Let's call this terminal 4 and make a simple curl call to Node 3.

```
curl http://localhost:3003/ping
```

Now check terminal 1,2 and 3. Do they all display the same message? If yes, all the nodes are synchronised. You have created a very simple P2P network.

## Using Currencies in P2P network 

Unlike making digital copies of a file, using PSP network to replicate **real time** digital transactions means that all the nodes have to be synchronised with each other at any point in time in order to prevent double spending. There needs to be rules in which we group different transactions into batches for synchronisation. The more nodes we have, the slower it is to propagate the batches of transactions. We will leave this for chapter 3.

## Exercises

{quiz, id: q1}
? Why is decentralisation important?
! consider redundancy and security
{/quiz}

{quiz, id: q2}
? How is cost, transaction speed and decentralisation related?
! choose 2 out of 3
{/quiz}

{quiz, id: q3}
? Is Bitcoin fully decentralised? How do you know?
! consider decentralisation from different perspectives, ie network and human.
{/quiz}