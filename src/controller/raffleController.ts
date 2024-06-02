import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Request, Response } from "express";
import historyModel from "../model/historyModel";

Bitcoin.initEccLib(ecc);

export const writeHistory = async (req: Request, res: Response) => {
  try {
    const {
      walletType,
      txId,
      paymentAddress,
      amountToTransfer } = req.body;

    console.log("writeHistory req.body ==>", req.body);

    const newHistory = new historyModel({
      walletType,
      txId,
      paymentAddress,
      amountToTransfer
    })

    await newHistory.save()

    return res.status(200).json({ success: true, payload: newHistory });
  } catch (error) {
    console.log("Get Raffles Error : ", error);
    return res.status(500).json({ success: false });
  }
};
