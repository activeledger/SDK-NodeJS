"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var activecrypto_1 = require("@activeledger/activecrypto");
var enums_1 = require("./enums");
var transaction_1 = require("./transaction");
var KeyHandler = /** @class */ (function () {
    function KeyHandler() {
    }
    /**
     * Generate a new key
     *
     * @param {string} keyName - The name of the key
     * @param {KeyType} keyType - The type of Key to generate
     * @returns {Promise<IKey>} Returns the Key Object
     * @memberof KeyHandler
     */
    KeyHandler.prototype.generateKey = function (keyName, keyType) {
        var internalType;
        return new Promise(function (resolve, reject) {
            switch (keyType) {
                case enums_1.KeyType.EllipticCurve:
                    internalType = "secp256k1";
                    break;
                case enums_1.KeyType.RSA:
                default:
                    internalType = "rsa";
                    break;
            }
            // tslint:disable-next-line:no-console
            console.log("Type: " + internalType);
            try {
                var keyHolder = {
                    key: new activecrypto_1.ActiveCrypto.KeyPair(internalType).generate(),
                    name: keyName,
                    type: internalType,
                };
                return resolve(keyHolder);
            }
            catch (e) {
                return reject(e);
            }
        });
    };
    /**
     * Onboard a key to the ledger
     *
     * @param {IKey} key - The key to onboard
     * @param {string} protocol - http or https
     * @param {string} address - The IP address or domain name e.g 0.0.0.0 or www.example.com
     * @param {number} port - The port to use
     * @returns {Promise<ILedgerResponse>} Returns Ledger response as a promise
     * @memberof KeyHandler
     */
    KeyHandler.prototype.onboardKey = function (key, protocol, address, port) {
        return new Promise(function () {
            var tx = new transaction_1.Transaction();
            tx.onboardKey(key).then(function (txBody) {
                return tx.sendTransaction(txBody, protocol, address, port);
            });
        });
    };
    return KeyHandler;
}());
exports.KeyHandler = KeyHandler;
