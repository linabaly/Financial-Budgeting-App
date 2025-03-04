import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


export default class AccountManager {

  // Create Account
  public static async createAccount(req: any, res: any) {
    try {
      const { email, password, name } = req.body;

      // Check if email already exists
      const existingAccount = await prisma.account.findUnique({ where: { email } }); 
      if (existingAccount) {
        return res.status(400).json({ message: 'User already exists' });
      }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create account
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword, 
        name, 
      },
    });

    res.status(201).json({ message: 'User created successfully', account});
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get Account
  public static async getAccount(req: any, res: any) {
    try {
      const { id } = req.body;
      const account = await prisma.account.findUnique({ where: { id } });
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static updateAccount();
  public static deleteAccount();
}
