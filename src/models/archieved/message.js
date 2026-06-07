import sequlize from '../../utils/DB.js';
import { DataTypes } from 'sequelize';

const ArchievedMessage = sequlize.define('archieved_message', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },

    type: {
        type: DataTypes.ENUM("text", "image", "video", "audio", "document"),
        defaultValue: "text"
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mediaID: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "media",
            key: "id",
        },
    },
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mediaID: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("sent", "delivered", "read"),
        defaultValue: "sent"
    },
    isDeletedForEveryone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    senderID:{
        type:DataTypes.UUID,
        allowNull:false
    },
    recieverID:{
        type:DataTypes.UUID,
        allowNull:true
    },
    createdAt:{
        type:DataTypes.DATE
    },
    updatedAt:{
        type:DataTypes.DATE
    }

},{timestamps:false});
export default ArchievedMessage;