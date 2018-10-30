
<img src="https://www.activeledger.io/wp-content/uploads/2018/09/Asset-23.png" alt="Activeledger" width="500"/>

Activeledger - Node SDK
=======================================

The Activeledger Node SDK has been built to provide an easy way to connect your Node based application with an Activeledger network.
This SDK can be used in JavaScript and TypeScript projects.

### GitHub
[Repository here](https://github.com/activeledger/SDK-NodeJS/)

### Further Documentation
[Documentation here](https://activeledger.github.io/SDK-NodeJS/)

## Installation
npm i -s @activeledger/sdk

## Usage
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
### Enums
The Activeledger Node SDK provides an enum to help handle key types.

|Key|Ref|
|---|---|
|Elliptic Curve|KeyType.EllipticCurve|
|RSA|KeyType.RSA|

### Interfaces
The Activeledger Node SDK provides multiple interfaces to provide you with.

|Interface|Description|
|---------|-----------|
|IKey|For Activeledger keys|
|IOnboardTx|Specifically for key onboarding, mainly used internally|
|IOnboardTxBody|Used by IOnboardTx for $tx variable|
|INodeKeyData|Used to hold the node key data for encrypting a transaction|
|IHttpOptions|Internal interface for setting HTTP options|
|ILedgerResponse|A helper for the ledger response|
|ISummaryObject|Used by ILedgerResponse|
|IStreamsObject|Used by ILedgerResponse|
|INewObject|Used by IStreamsObject|
|IUpdatedObject|Used by IStreamsObject|
|IBaseTransaction|Helper for creating transactions|
|ITxBody|Used by IBaseTransaction for the $tx variable|

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
Note: Generating an RSA key is resource intensive and can take a few seconds.

The Key Handler can be used to generate and onboard a key.

The Key generation function and key onboard function are setup to be used separately as you may not want to immediately onboard a key. Additionally, you will need to store the key as it is used to sign all transactions involving the identity created when you onboard it.

There are two key types that can be generated currently, more are planned and will be implemented into Activeledger first. These types are RSA and Elliptic Curve.

#### Generating a key
When generating a key you must pass it a name and the key type.

##### Example
Note: This example uses the IKey interface which provides the structure of the key
```typescript
import { 
  KeyHandler,
  IKey,
  KeyType
} from "@activeledger/sdk";

const keyHandler = new KeyHandler();

let key: IKey;

// Generate RSA Key
keyHandler.generateKey("keyname", KeyType.RSA)
.then((generatedKey: IKey) => {
  key = generatedKey;
})
.catch();
// or to generate an Elliptic Curve key
// keyHandler.generateKey("keyname", KeyType.EllipticCurve)
```

#### Onboarding a key
Once you have a key generated, to use it to sign transactions it must be onboarded to the ledger network
##### Example
```typescript
import { 
  Connection,
  KeyHandler,
  IKey,
  KeyType,
  ILedgerResponse
} from "@activeledger/sdk";

const connection = new Connection("http", "localhost", 5260);
const keyHandler = new KeyHandler();

let key: IKey;
keyHandler.generateKey("keyname", KeyType.EllipticCurve)
.then((generatedKey: IKey) => {
  key = generatedKey;
  return keyHandler.onboardKey(key, connection)
})
.then((ledgerResp: ILedgerResponse) => {
  resolve(ledgerResp);
})
.catch();
```
***
### TransactionHandler

The Transaction Handler is used to sign and send transactions.

You can use the IBaseTransaction as a helper when building a transaction to be sent to the ledger.

#### Signing a transaction
When signing a transaction you must send the finished version of it. No changes can be made after signing as this will cause the ledger to reject it.

You must pass the transaction and the correct key to this function. The key must be one that has been successfully onboarded to the ledger which the transaction is being sent to.

##### Example
``` typescript
import { 
  TransactionHandler,
  IBaseTransaction
} from "@activeledger/sdk";

// Connection and key code goes here if needed

// Create a transaction. In this example a namespace onboarding transaction
const txHandler = new TransactionHandler();
const tx: IBaseTransaction = {
  $sigs: {},
  $tx: {
    $contract: "namespace",
    $i: {},
    $namespace: "default",
  },
};

// The identity of the key that the namespace will be linked to
tx.$tx.$i[key.identity] = {
  namespace: "example-namespace",
};

// Sign the transaction
txHandler.signTransaction(tx, key)
.then((signedTx: IBaseTransaction) => {
  tx = signedTx;
})
.catch();
```

#### Sending a transaction


##### Example
```typescript
import { 
  TransactionHandler,
  IBaseTransaction
} from "@activeledger/sdk";

// Connection setup, Transaction building and signing here

// Send the transaction
txHandler.sendTransaction(tx, connection)
.then((response: ILedgerResponse) => {
  // Do something with the response
})
.catch();
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