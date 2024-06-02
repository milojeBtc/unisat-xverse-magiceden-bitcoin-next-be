import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Request, Response } from "express";
import historyModel from "../model/historyModel";
import walletModel from "../model/walletModel";

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

export const walletConnect = async (req: Request, res: Response) => {
  try {
    const {
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
      hash
    } = req.body;

    console.log("walletConnect req.body ==>", req.body);

    const walletExist = await walletModel.findOne({
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
    })

    if (walletExist) {
      if(walletExist.hash == hash) return res.status(200).json({
        success: true,
        payload: walletExist,
        message: "Signed successfully."
      }) 
      else return res.status(200).json({
        success: false,
        payload: walletExist,
        message: "no match Hash"
      }) 
    }

    const newWallet = new walletModel({
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
      hash
    })

    await newWallet.save()

    return res.status(200).json({
      success: true,
      payload: newWallet,
      message: "New User is stored successfully!"
    });
  } catch (error) {
    console.log("Get Raffles Error : ", error);
    return res.status(500).json({ success: false });
  }
};
