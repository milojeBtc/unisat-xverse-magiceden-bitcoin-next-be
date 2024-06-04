import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Request, Response } from "express";
import historyModel from "../model/historyModel";
import walletModel from "../model/walletModel";
import Joi from 'joi';
import mongoose from "mongoose";
Bitcoin.initEccLib(ecc);

const historySchema = Joi.object({
  walletType: Joi.string().required(),
  txId: Joi.string().required(),
  paymentAddress: Joi.string().required(),
  amountToTransfer: Joi.string().required()
});

const WalletSchema = Joi.object({
  paymentAddress: Joi.string().required(),
  paymentPublicKey: Joi.string().required(),
  ordinalAddress: Joi.string().required(),
  ordinalPublicKey: Joi.string().required(),
  walletType: Joi.string().required(),
  hash: Joi.string().required(),
});


export const writeHistory = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      walletType,
      txId,
      paymentAddress,
      amountToTransfer } = req.body;
    const { error, value } = historySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }
    console.log("writeHistory req.body ==>", req.body);

    const existingHistory = await historyModel.findOne({
      walletType,
      txId,
      paymentAddress,
      amountToTransfer,
    });

    if (existingHistory) {
      // If the entry already exists, return a response indicating that
      return res.status(409).json({
        success: false,
        error: 'This history entry already exists',
      });
    }

    const newHistory = new historyModel({
      walletType,
      txId,
      paymentAddress,
      amountToTransfer
    })

    await newHistory.save({session });
    await session.commitTransaction();

    return res.status(200).json({ success: true, payload: newHistory });
  } catch (error) {
    console.log("Get Raffles Error : ", error);
    await session.abortTransaction();
    return res.status(500).json({ success: false });
  }
  finally {
    await session.endSession();
  }
};

export const walletConnect = async (req: Request, res: Response) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
      hash
    } = req.body;
    const { error, value } = WalletSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const walletExist = await walletModel.findOne({
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletType,
    })

    console.log("walletExist ==> ", walletExist);

    if (walletExist) {
      if (walletExist.hash == hash) return res.status(200).json({
        success: true,
        payload: walletExist,
        message: "Signed successfully."
      })
      else return res.status(200).json({
        success: false,
        payload: walletExist,
        message: "no matchHash "
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

    // await newWallet.save({ session })
    await newWallet.save({session})
    await session.commitTransaction();
    console.log("walletExist ==> ", newWallet);

    return res.status(200).json({
      success: true,
      payload: newWallet,
      message: "New User is stored successfully!"
    });
  } catch (error) {
    console.log("Get Raffles Error : ", error);
    await session.abortTransaction();
    return res.status(500).json({ success: false });
  } finally {
    await session.endSession();
  }
};
