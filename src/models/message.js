import sequlize from '../utils/DB.js';
import { DataTypes } from 'sequelize';

const Message = sequlize.define('Message',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
 
    type:{
        type:DataTypes.ENUM("text","image","video","audio","document"),
        defaultValue:"text"
    },
    content:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    ownerName:{
        type: DataTypes.STRING,
        allowNull:false
    },
    mediaUrl:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM("sent","delivered","read"),
        defaultValue:"sent"
    },
    isDeletedForEveryone:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
});
export default Message;