import Message from "../models/message.js";
import GroupMessage from "../models/groupMessage.js";
import Media from "../models/media.js";
import ArchievedMessage from "../models/archieved/message.js";
import ArchivedGroupMessage from "../models/archieved/groupMessage.js";
import ArchievedMedia from "../models/archieved/media.js";
import { CronJob } from "cron";
import { Op } from "sequelize";
import sequelize from "../utils/DB.js";

async function ArchievedOneDayMessage() {
  let transaction;

  try {
    transaction = await sequelize.transaction();
    console.log("⏳ Archive job started");

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const messages = await Message.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    const groupMessages = await GroupMessage.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    const media = await Media.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    if (!messages.length && !groupMessages.length && !media.length) {
      console.log("ℹ️ No data to archive");
      await transaction.commit();
      return;
    }

    if (messages.length) {
      await ArchievedMessage.bulkCreate(
        messages.map(m => m.get({ plain: true })),
        { transaction }
      );
    }

    if (groupMessages.length) {
      await ArchivedGroupMessage.bulkCreate(
        groupMessages.map(g => g.get({ plain: true })),
        { transaction }
      );
    }

    if (media.length) {
      await ArchievedMedia.bulkCreate(
        media.map(m => m.get({ plain: true })),
        { transaction }
      );
    }

    await Message.destroy({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    await GroupMessage.destroy({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    await Media.destroy({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction
    });

    await transaction.commit();
    console.log("✅ Archive completed successfully");

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ Archive failed, rolled back:", error);
  }
}

export const cronJob = new CronJob(
  "0 0 2 * * *", // daily 2 AM
  ArchievedOneDayMessage,
  null,
  true,
  "Asia/Kolkata"
);
