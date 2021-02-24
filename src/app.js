import dotenv from 'dotenv';
import Bot from './bot';
import settings from '../settings.json';

dotenv.config();

let token = process.env.DISCORD_TOKEN;

let bot = new Bot(token, settings);
