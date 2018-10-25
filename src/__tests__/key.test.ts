import { KeyType } from "../enums";
import { KeyHandler } from "../index";
import { IKey } from "../interfaces";

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
  // 
});