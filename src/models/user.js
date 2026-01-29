import { DataTypes } from 'sequelize';
import sequelize from '../utils/DB.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    about:{
        type:DataTypes.STRING(150),
        defaultValue:"Hay there! I am using Whatsapp"
    },
    profilePic:{
        type:DataTypes.STRING,
        allowNull:true
    },
    isOnline:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    lastSeen:{
        type:DataTypes.DATE,
        allowNull:true
    },
    

});
export default User;