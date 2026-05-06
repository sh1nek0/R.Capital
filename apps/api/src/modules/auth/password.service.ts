import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Injectable } from "@nestjs/common";

const scrypt = promisify(scryptCallback);

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16).toString("base64url");
    const derived = (await scrypt(password, salt, 64)) as Buffer;

    return `scrypt:${salt}:${derived.toString("base64url")}`;
  }

  async verify(password: string, passwordHash: string) {
    const [algorithm, salt, hash] = passwordHash.split(":");
    if (algorithm !== "scrypt" || !salt || !hash) {
      return false;
    }

    const expected = Buffer.from(hash, "base64url");
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;

    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}

