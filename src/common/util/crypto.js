import crypto from "miniprogram-sm-crypto";
import { parseJSON, stringifyJSON } from "@/common/util/json";
const { sm2, sm4 } = crypto;
const keypair = sm2.generateKeyPairHex();

let { publicKey } = keypair; // 公钥
let { privateKey } = keypair; // 私钥
let cipherMode = 1;

export const setCryptoConfig = (config) => {
  publicKey = config.publicKey;
  privateKey = config.privateKey;
  cipherMode = config.cipherMode || 1;
};

// 默认生成公钥 130 位太长，可以压缩公钥到 66 位
const compressedPublicKey = sm2.compressPublicKeyHex(publicKey) // compressedPublicKey 和 publicKey 等价
const  compareCompressPublicKey = sm2.comparePublicKeyHex(publicKey, compressedPublicKey) // 判断公钥是否等价

let verifyResult = sm2.verifyPublicKey(publicKey) // 验证公钥
let verifyResult2 = sm2.verifyPublicKey(compressedPublicKey) // 验证公钥

console.log('crypto',{crypto,keypair,compressedPublicKey,publicKey,privateKey,compareCompressPublicKey,verifyResult,verifyResult2})

export const encrypt = (msg) => {
  if (typeof msg !== "string") {
    msg = stringifyJSON(msg);
  }
  if (!publicKey || !cipherMode) {
    throw new Error("请先设置加密公钥");
  }
  const encryptMsg = sm2.doEncrypt(msg, publicKey, cipherMode);
  return encryptMsg;
};
export const decrypt = (encryptMsg) => {
  if (!privateKey || !cipherMode) {
    throw new Error("请先设置解密私钥");
  }
  const decryptMsg = sm2.doDecrypt(encryptMsg, privateKey, cipherMode);

  return parseJSON(decryptMsg);
};

// 视频双录专用
export const sm2Encrypt = (msg) => {
  const publicKey =
    "04bd46d726cadb5272b849ec1900aa50053293089992f1bef574d7225a93bc054db1a1cbf9b7cd8a7d39e7684efc4d19d8a1eee1fe51aceb1dd909221f287d00ba";
  const encryptMsg = sm2.doEncrypt(msg, publicKey, 1);
  return encryptMsg;
};

// const {sm4} = require("miniprogram-sm-crypto");
const encryptData = `102d5b959368260f1df4341d4f71e89f8a677fc16df07f013b50822f3b6d9d709af2bb205fee5c9bcda89f400e0de584eb06c8a3afd23124eac322bc77bd542f8f26f8b6096118603e6162e720ceb6b20bd7d0548b1043208613ee9eeeb3da351ee7c5aa6f471617756e1a6250c83d229745394fd8012e3cf6796063c008675d2eb2ab7ead9c63900da0cd49ab2309843b26f9193ad631d571f04deb07e0efb9d6a8378472c8742d22230941ae87ac1f5e30b8e06cce02b07b1406d79ddad90152af059fc31743d7bb0692978e66063380c40680c81f9a3658954dc24a1a7642932b9dd3d88b339ef455b91ea1d2c213cdfdfcc7e5d85054a9595d93fb815a438dc093dbe96c323e0324d97307c880dc3d0218d2873dd39105cf6ed6c159f00975f0db72d3a3a05f3662dc11f45e23e610b09ad58fd94c92cfb4a5520ec52c45ee8ec155993cf0c032f99bbf627c242797351a1c03cab9d2996acc92fd56910d9883cef851df4993e77231cd9a4ea6ce` 

const obj = {
  CREDIT_APPLICATION_ID: "MH",
  PHONENO: "17346623929",
  ENTERPRISE_CERT_NO: "92133010084624530C",
  VIDEO_SCENE: "20000.00",
  ENTERPRISE_NAME: "金测一某某某八有限公司",
  ASSAGENTID: "15",
  LEGAL_PERSON_CERT_NO: "341221200003150011",
  CHANNEL_CODE: "CCR",
  TRANSACTION_ID: "1866795165743603712",
  PRODUCT_CODE: "110202011502",
  LEGAL_PERSON_NAME: "金测一",
  PRODUCT_NAME: "个人消费贷款",
  token: 'c5c60c869395456dbded7c6dcbb4326e'
}

const sm4key = 'a56a0a9b1d2413f71fbb157b69f6b781'

// let encryptDat2a = sm4.encrypt(JSON.stringify(obj), sm4key) 


// console.log('加密',encryptDat2a)

// let decryptData = sm4.decrypt(encryptDat2a, sm4key) 
// console.log('解密',decryptData)
export const sm4Decrypt = (encryptData) => {
  return sm4.decrypt(encryptData, sm4key)
}




