import sequlize from '../utils/DB.js';
import { DataTypes } from 'sequelize';

const Message = sequlize.define('Message',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    content:{
        type: DataTypes.TEXT,
        allowNull:false
    }
});
export default Message;