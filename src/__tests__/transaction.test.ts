import { Connection } from "../connection";
import { KeyType } from "../enums";
import { IBaseTransaction, IKey } from "../interfaces";
import { KeyHandler } from "../key";
import { TransactionHandler } from "../transaction";

test("Send an encrypted onboard transaction", () => {
  const keyHandler = new KeyHandler();
  const txHandler = new TransactionHandler();
  const connection = new Connection("http", "testnet-uk.activeledger.io", 5260, true);

  keyHandler.generateKey("test", KeyType.EllipticCurve).then((key: IKey) => {
    txHandler.onboardKey(key).then((keyTx: any) => {
      txHandler.sendTransaction(keyTx, connection).then((res: any) => {
        expect(res.$streams.new).not.toBeUndefined();
      });
    });
  });
});

test("Create a namespace transaction", () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "testnet-uk.activeledger.io", 5260);
  let key: IKey;

  keyHandler.generateKey("test", KeyType.EllipticCurve).then((generatedKey: IKey) => {
    key = generatedKey;
    keyHandler.onboardKey(key, connection).then((res: any) => {

      key.identity = res.$streams.new[0].id;

      const txHandler = new TransactionHandler();
      const tx: IBaseTransaction = {
        $sigs: {},
        $tx: {
          $contract: "namespace",
          $i: {},
          $namespace: "default",
        },
      };

      tx.$tx.$i[key.identity] = {
        namespace: "test",
      };

      txHandler.signTransaction(tx, key).then((txBody: IBaseTransaction) => {
        txHandler.sendTransaction(txBody, connection).then((resp: any) => {
          expect(resp.$streams.new).not.toBeUndefined();
        });
      });

      
    });
  });
});
