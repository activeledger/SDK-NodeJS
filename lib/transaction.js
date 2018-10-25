"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var activecrypto_1 = require("@activeledger/activecrypto");
var connection_1 = require("./connection");
var Transaction = /** @class */ (function () {
    function Transaction() {
        this.contract = "onboard";
        this.namespace = "default";
    }
    /**
     * Internal use
     * Build a key onboarding transaction
     *
     * @param {IKey} key - The key to onboard
     * @param {string} [contract] - Optional: The contract to run the transaction against
     * @param {string} [namespace] - Optional: The namespace to run the transaction against
     * @returns {Promise<IOnboardTx>} Returns the built transaction
     * @memberof Transaction
     */
    Transaction.prototype.onboardKey = function (key, contract, namespace) {
        var _this = this;
        if (contract) {
            this.contract = contract;
        }
        if (namespace) {
            this.namespace = namespace;
        }
        return new Promise(function (resolve, reject) {
            var tx = {
                $selfsign: true,
                $sigs: {},
                $tx: {
                    $contract: _this.contract,
                    $i: {},
                    $namespace: _this.namespace,
                },
            };
            tx.$tx.$i[key.name] = {
                publicKey: key.key.pub.pkcs8pem,
                type: key.type,
            };
            try {
                var keyPair = new activecrypto_1.ActiveCrypto.KeyPair(key.type, key.key.prv.pkcs8pem);
                tx.$sigs[key.name] = keyPair.sign(tx.$tx);
                return resolve(tx);
            }
            catch (err) {
                return reject(err);
            }
        });
    };
    /**
     * Send a transaction to the ledger
     *
     * @param {(IBaseTransaction | IOnboardTx)} tx - The transaction to send
     * @param {string} protocol - http or https
     * @param {string} address - The IP address or domain name e.g 0.0.0.0 or www.example.com
     * @param {number} port - The port to use
     * @returns {Promise<ILedgerResponse>} Returns the ledger response
     * @memberof Transaction
     */
    Transaction.prototype.sendTransaction = function (tx, protocol, address, port) {
        var connection = new connection_1.Connection(protocol, address, port);
        return connection.sendTransaction(tx);
    };
    return Transaction;
}());
exports.Transaction = Transaction;
