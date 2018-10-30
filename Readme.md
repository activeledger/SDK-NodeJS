
<img src="https://www.activeledger.io/wp-content/uploads/2018/09/Asset-23.png" alt="Activeledger" width="500"/>

Activeledger - Node SDK
=======================================

The Activeledger Node SDK has been built to provide an easy way to connect your Node based application with an Activeledger network.
This SDK can be used in JavaScript and TypeScript projects.

### GitHub
[Repository here](https://github.com/activeledger/nodejs-sdk)

### Further Documentation
[Documentation here](http://activeledger.github.io/nodejs-sdk)

## Installation
***
npm i -s @activeledger/sdk

## Usage
***
The SDK currently supports the following functionality
* Connection handling
* Key generation
* Key onboarding
* Transaction building
* Encrypted & unencrypted transaction posting

Once the SDK has been installed import the classes and interfaces as you need them.

```typescript
// Example
import { Connection } from "@activeledger/sdk";
```

### Interfaces
The Activeledger Node SDK provides multiple interfaces to provide you with 
***
### Connection

When sending a transaction, you must pass a connection that provides the information needed to establish a link to the network and specified node.

To do this a connection object must be created. This object must be passed the protocol, address, port, and optionally the encryption flag.
#### Example
``` typescript
import { Connection } from "@activeledger/sdk";
// Setup the connection object to use localhost over http unencrypted
const connection = new Connection("http", "localhost", 5260);

// Use localhost but encrypt transactions
const connection = new Connection("http", "localhost", 5260, true);
```
***
### KeyHandler



#### Example
``` typescript
import { Connection } from "@activeledger/sdk";
// Setup the connection object to use localhost over http unencrypted
const connection = new Connection("http", "localhost", 5260);

// Use localhost but encrypt transactions
const connection = new Connection("http", "localhost", 5260, true);
```
***
### TransactionHandler
#### Example
``` typescript
// Setup the connection object to use localhost over http unencrypted
const connection = new Connection("http", "localhost", 5260);

// Use localhost but encrypt transactions
const connection = new Connection("http", "localhost", 5260, true);
```
***
### JSDocs
You can read further documentation [here.](out/index.html)

### Activeledger

[Visit Activeledger.io](https://activeledger.io/) 

[Read Activeledgers documentation](https://github.com/activeledger/activeledger)

## License
***

This project is licensed under the [MIT](https://github.com/activeledger/activeledger/blob/master/LICENSE) License