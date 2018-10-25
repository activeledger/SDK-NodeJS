"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var activecrypto_1 = require("@activeledger/activecrypto");
var http = require("http");
var https = require("https");
var Connection = /** @class */ (function () {
    function Connection(protocol, address, portNumber) {
        this.encryptedHeaders = {
            "Content-Type": "application/json",
            "X-Activeledger-Encrypt": "1",
        };
        this.httpOptions = {
            headers: {
                "Content-Type": "application/json",
            },
            hostname: address,
            method: "POST",
            path: "/",
            port: portNumber,
        };
        this.protocol = protocol;
        this.address = address;
        this.port = portNumber;
        if (protocol === "https") {
            this.protocolService = https;
        }
        else {
            this.protocolService = http;
        }
    }
    /**
     * Send a transaction to the specified ledger
     *
     * @param {IBaseTransaction} txBody - The Body of the transaction
     * @param {boolean} [encrypt] - Whether or not the transaction should be encrypted
     * @returns {Promise<ILedgerResponse>} Returns the response as a promise
     * @memberof Connection
     */
    Connection.prototype.sendTransaction = function (txBody, encrypt) {
        var _this = this;
        return new Promise(function (reject) {
            if (encrypt) {
                _this.httpOptions.headers = _this.encryptedHeaders;
                _this.encrypt(txBody)
                    .then(function (encryptedTx) {
                    return _this.postTransaction(encryptedTx);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            return _this.postTransaction(txBody);
        });
    };
    /**
     * POST the provided transaction to the ledger
     *
     * @private
     * @param {(string | IBaseTransaction)} tx - The transaction to POST
     * @returns {Promise<ILedgerResponse>} Returns the ledger response
     * @memberof Connection
     */
    Connection.prototype.postTransaction = function (tx) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = _this.protocolService.request(_this.httpOptions, function (res) {
                if (res.statusCode !== 200) {
                    reject(res);
                }
                res.setEncoding("utf8");
                res.on("data", function (body) {
                    resolve(body);
                });
            });
            req.on("error", function (err) {
                reject(err);
            });
            if (typeof tx !== "string") {
                tx = JSON.stringify(tx);
            }
            req.write(tx);
            req.end();
        });
    };
    /**
     * Encrypts the transaction if required
     *
     * @private
     * @param {IBaseTransaction} txBody - The transaction to encrypt
     * @returns {Promise<string>} Returns the encrypted data as a string
     * @memberof Connection
     */
    Connection.prototype.encrypt = function (txBody) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getNodeKeyData()
                .then(function (keyData) {
                var keyPair = new activecrypto_1.ActiveCrypto.KeyPair(keyData.encryption, keyData.pem);
                resolve(keyPair.encrypt(txBody));
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    /**
     * Get the key data from the node specified in the connection
     *
     * @private
     * @returns {Promise<INodeKeyData>} Returns the key data as a promise
     * @memberof Connection
     */
    Connection.prototype.getNodeKeyData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var url = _this.protocol + "://" + _this.address + ":" + _this.port + "/a/status";
            _this.protocolService
                .get(url, function (resp) {
                var data = "";
                resp.on("data", function (chunk) {
                    data += chunk;
                });
                resp.on("end", function () {
                    var jsonData = JSON.parse(data);
                    var nodeKey = {
                        encryption: "rsa",
                        pem: atob(jsonData.pem),
                    };
                    resolve(nodeKey);
                });
            })
                .on("error", function (err) {
                reject(err);
            });
        });
    };
    return Connection;
}());
exports.Connection = Connection;
