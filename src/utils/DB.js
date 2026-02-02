import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "chat_app",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "12345",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    timezone: "+05:30",
    logging: false,
  }
);


export default sequelize;