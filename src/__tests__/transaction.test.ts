import { Connection } from "../connection";
import { KeyType } from "../enums";
import { IBaseTransaction, IKey } from "../interfaces";
import { KeyHandler } from "../key";
import { TransactionHandler } from "../transaction";

jest.useFakeTimers();

test("Send an encrypted onboard transaction", () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "localhost", 5260, true);

  keyHandler.generateKey("test-encrypt", KeyType.EllipticCurve).then((key: IKey) => {
    keyHandler.onboardKey(key, connection).then((res: any) => {
      expect(res.$streams.new).not.toBeUndefined();
    });
  });
}, 30000);

test("Create a namespace transaction", async () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "localhost", 5260);
  const key: IKey = await keyHandler.generateKey("test-namespace", KeyType.EllipticCurve);
  key.identity = "";

  const res = await keyHandler.onboardKey(key, connection);
  
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
    namespace: "test" + new Date().getTime(),
  };

  const txBody: IBaseTransaction = await txHandler.signTransaction(tx, key);
  const resp: any = await txHandler.sendTransaction(txBody, connection)
  
  expect(resp.$streams.updated).not.toBeUndefined();

}, 30000); 
