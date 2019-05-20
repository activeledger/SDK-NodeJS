import { Connection } from "../connection";
import { KeyType } from "../enums";
import { IBaseTransaction, IKey, ILabelledTransaction, ILabelledTransactionOptions } from "../interfaces";
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

  if (res.$streams.new[0]) {
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
      namespace: "test" + new Date().getTime(),
    };

    const txBody: IBaseTransaction = await txHandler.signTransaction(tx, key);
    const resp: any = await txHandler.sendTransaction(txBody, connection);

    expect(resp.$streams.updated).not.toBeUndefined();
  } else {
    throw new Error("Onboarding problem");
  }
}, 30000);

test("Create a labelled transaction", async () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "localhost", 5260);
  const key: IKey = await keyHandler.generateKey("test-labelled", KeyType.EllipticCurve);
  key.identity = "";

  const res = await keyHandler.onboardKey(key, connection);

  if (res.$streams.new[0]) {
    key.identity = res.$streams.new[0].id;

    const txHandler = new TransactionHandler();

    const labelOptions: ILabelledTransactionOptions = {
      contract: "namespace",
      inputData: { namespace: "labelled-tx-test" + new Date().getTime() },
      inputLabel: "Test input label",
      key,
      namespace: "default",
    };

    const signedTx = await txHandler.labelledTransaction(labelOptions);
    const resp = await txHandler.sendTransaction(signedTx, connection);

    expect(resp.$streams.updated).not.toBeUndefined();
  } else {
    throw new Error("Labelled TX problem");
  }
}, 30000);
