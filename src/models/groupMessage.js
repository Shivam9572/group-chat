import { DataTypes } from "sequelize";
import sequelize from "../utils/DB.js";

const GroupMessage = sequelize.define("groupMessage", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM("text", "image", "video", "audio", "document"),
        defaultValue: "text"
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }, 
    mediaID: {
        type: DataTypes.UUID,
        allowNull: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})
export default GroupMessage;