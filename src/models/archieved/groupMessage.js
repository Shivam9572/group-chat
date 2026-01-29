import { DataTypes } from "sequelize";
import sequelize from "../../utils/DB.js";

const ArchievedGroupMessage = sequelize.define("archieved_groupMessage", {
    id: {
        type: DataTypes.UUID,
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
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    senderID:{
        type:DataTypes.UUID
    },
    groupID:{
        type:DataTypes.UUID
    },
    createdAt:{
        type:DataTypes.DATE
    },
    updatedAt:{
        type:DataTypes.DATE
    }


},{timestamps:false});
export default ArchievedGroupMessage;