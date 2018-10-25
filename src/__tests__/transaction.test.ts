import { Connection } from '../connection';
import { KeyType } from "../enums";
import { IBaseTransaction, IKey } from "../interfaces";
import { KeyHandler } from "../key";
import { TransactionHandler } from "../transaction";

test("Send an onboard transaction", () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "testnet-uk.activeledger.io", 5260);

  keyHandler.generateKey("test", KeyType.EllipticCurve)
    .then((key: IKey) => {
      keyHandler.onboardKey(key, connection)
      .then((res: any) => {
        expect(res.$streams.new).not.toBeUndefined();
      });
    });

});

test("Send an encrypted onboard transaction", () => {
  const keyHandler = new KeyHandler();
  const txHandler = new TransactionHandler();
  const connection = new Connection("http", "testnet-uk.activeledger.io", 5260, true);

  keyHandler.generateKey("test", KeyType.EllipticCurve)
    .then((key: IKey) => {
      txHandler.onboardKey(key)
      .then((keyTx: any) => {
        txHandler.sendTransaction(keyTx, connection)
        .then((res: any) => {
          expect(res.$streams.new).not.toBeUndefined();
        })
      });
    });
});

test("Send a namespace creation transaction", () => {
  //
});