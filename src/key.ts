/*
 * MIT License (MIT)
 * Copyright (c) 2019 Activeledger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ActiveCrypto } from "@activeledger/activecrypto";
import * as fs from "fs";
import { Connection } from "./connection";
import { KeyType } from "./enums";
import { IKey, IKeyExportOptions, ILedgerResponse, IOnboardTx } from "./interfaces";
import { TransactionHandler } from "./transaction";

export class KeyHandler {
  /**
   * Generate a new key
   *
   * @param {string} keyName - The name of the key
   * @param {KeyType} keyType - The type of Key to generate
   * @returns {Promise<IKey>} Returns the Key Object
   * @memberof KeyHandler
   */
  public generateKey(keyName: string, keyType: KeyType): Promise<IKey> {
    return new Promise((resolve, reject) => {
      try {
        const keyHolder: IKey = {
          key: new ActiveCrypto.KeyPair(keyType).generate(),
          name: keyName,
          type: keyType,
        };

        return resolve(keyHolder);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * Onboard a key to the ledger and assign an identity to the key
   *
   * @param {IKey} key - The key to onboard
   * @param {Connection} connection - The connection to send the transaction over
   * @returns {Promise<ILedgerResponse>} Returns Ledger response as a promise
   * @memberof KeyHandler
   */
  public onboardKey(key: IKey, connection: Connection): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      const txHandler = new TransactionHandler();

      txHandler
        .buildOnboardKeyTx(key)
        .then((txBody: IOnboardTx) => {
          return txHandler.sendTransaction(txBody, connection);
        })
        .then((response: ILedgerResponse) => {
          key.identity = response.$streams.new[0].id;
          resolve(response);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * Export a key to a file
   *
   * @param {IKey} key - The key to export
   * @param {IKeyExportOptions} options - The configuration options for the export
   * @returns {Promise<void>}
   * @memberof KeyHandler
   */
  public exportKey(key: IKey, options: IKeyExportOptions): Promise<void>;
  /**
   *
   *
   * @param {IKey} key
   * @param {string} location - The location to save the key to
   * @param {boolean} [createDir] - (Optional) Create the directory structure
   * @param {boolean} [overwrite] - (Optional) Overwrite an existing file if it exists
   * @param {string} [name] - (Optional) - Set a name for the file
   * @returns {Promise<void>}
   * @memberof KeyHandler
   */
  public exportKey(key: IKey, location: string, createDir?: boolean, overwrite?: boolean, name?: string): Promise<void>;
  public exportKey(
    key: IKey,
    locationOrOptions: string | IKeyExportOptions,
    createDir?: boolean,
    overwrite?: boolean,
    name?: string,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      /**
       * Internal function to handle overload and setup
       *
       * @returns {IKeyExportOptions}
       */
      const setOptions = (): IKeyExportOptions => {
        return {
          createDir: createDir ? true : false,
          location: locationOrOptions as string,
          name,
          overwrite: overwrite ? true : false,
        };
      };

      const options: IKeyExportOptions =
        typeof locationOrOptions === "string" ? setOptions() : (locationOrOptions as IKeyExportOptions);

      // Recursively create dir
      if (options.createDir) {
        try {
          fs.mkdirSync(options.location, { recursive: true });
        } catch (err) {
          reject(err);
        }
      }

      // Strip trailing /
      options.location = this.stripTrailing(options.location);

      // Set name of file
      const path = options.name ? `${options.location}/${options.name}.json` : `${options.location}/${key.name}.json`;

      // Check folder exists
      const dirExists = fs.existsSync(options.location);
      if (dirExists) {
        // Check if the file exists
        const fileExists = fs.existsSync(path);
        // If exists and overwrite is false
        if (fileExists && !options.overwrite) {
          reject("File already exists, set overwrite to true or use a different name");
        } else {
          // Write
          fs.writeFile(path, JSON.stringify(key), err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      } else {
        reject("Unable to find location");
      }
    });
  }

  /**
   * Import a key from a file
   *
   * @param {string} path - The location of the key file
   * @returns {Promise<IKey>}
   * @memberof KeyHandler
   */
  public importKey(path: string): Promise<IKey> {
    return new Promise((resolve, reject) => {
      // Check if the file exists
      fs.exists(path, (fileExists: boolean) => {
        // If exists and overwrite is false
        if (fileExists) {
          // read
          fs.readFile(path, (err, buffer) => {
            if (err) {
              reject(err);
            } else {
              const data = buffer.toString();
              resolve(JSON.parse(data) as IKey);
            }
          });
        } else {
          reject("File already exists, set overwrite to true or use a different name");
        }
      });
    });
  }

  /**
   * Remove a trailing / from the location
   *
   * @private
   * @param {string} path - String to strip from
   * @returns {string}
   * @memberof KeyHandler
   */
  private stripTrailing(path: string): string {
    const lastChar = path.slice(path.length - 1, path.length);
    if (lastChar === "/") {
      return path.slice(0, path.length - 1);
    }
    return path;
  }
}
