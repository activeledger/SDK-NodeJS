import { Connection } from "../connection";
import { KeyType } from "../enums";
import { KeyHandler } from "../index";
import { IKey, ILedgerResponse } from "../interfaces";

test("Create Elliptic Curve Key", async () => {
  const name = "ec-test";
  const keyHandler = new KeyHandler();
  const key: IKey = await keyHandler.generateKey(name, KeyType.EllipticCurve);

  expect(key.name).toBe(name);
  expect(key.type).toBe("secp256k1");
  expect(key.key).not.toBeNull();
  expect(key.key).not.toBeUndefined();
});

test("Create RSA Key", async () => {
  const name = "rsa-test";
  const keyHandler = new KeyHandler();
  const key: IKey = await keyHandler.generateKey(name, KeyType.RSA);

  expect(key.name).toBe(name);
  expect(key.type).toBe("rsa");
  expect(key.key).not.toBeNull();
  expect(key.key).not.toBeUndefined();
});

test("Onboard Key", () => {
  const keyHandler = new KeyHandler();
  const connection = new Connection("http", "localhost", 5260);

  keyHandler.generateKey("test-onboard", KeyType.EllipticCurve).then((key: IKey) => {
    keyHandler.onboardKey(key, connection).then((res: ILedgerResponse) => {
      expect(res.$streams.new).not.toBeUndefined();
    });
  });
});

test("Export/Import Key - Basic", async () => {
  const keyHandler = new KeyHandler();

  const key: IKey = await keyHandler.generateKey("test-export", KeyType.EllipticCurve);
  await keyHandler.exportKey(key, "./", false);

  const importedKey: IKey = await keyHandler.importKey(`./${key.name}.json`);

  expect(importedKey).toEqual(key);
});

test("Export/Import Key - Overwrite", async () => {
  const keyHandler = new KeyHandler();

  const key: IKey = await keyHandler.generateKey("test-export", KeyType.EllipticCurve);
  const key2: IKey = await keyHandler.generateKey("test-export2", KeyType.EllipticCurve);

  // Write key one to file
  await keyHandler.exportKey(key, "./", false, false, "overwrite-me");

  // Overwrite key one
  await keyHandler.exportKey(key2, "./", false, true, "overwrite-me");

  const importedKey: IKey = await keyHandler.importKey("./overwrite-me.json");

  expect(importedKey).toEqual(key2);
});

test("Export/Import Key - Custom name", async () => {
  const keyHandler = new KeyHandler();

  const key: IKey = await keyHandler.generateKey("test-export", KeyType.EllipticCurve);
  await keyHandler.exportKey(key, "./", false, true, "export-name-test");

  const importedKey: IKey = await keyHandler.importKey("./export-name-test.json");

  expect(importedKey).toEqual(key);
});

test("Export/Import Key - Create directory", async () => {
  const keyHandler = new KeyHandler();

  const key: IKey = await keyHandler.generateKey("test-export", KeyType.EllipticCurve);
  await keyHandler.exportKey(key, "./export/test", true, true);

  const importedKey: IKey = await keyHandler.importKey(`./export/test/${key.name}.json`);

  expect(importedKey).toEqual(key);
});
