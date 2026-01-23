import {DataTypes} from "sequelize";
import sequelize from "../utils/DB.js";

 const GroupMessage= sequelize.define("groupMessage",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
   type:{
    type:DataTypes.ENUM("text","image","video","audio","document"),
    defaultValue:"text"
   },
   content:{
    type:DataTypes.TEXT,
    allowNull:false
   },
   mediaUrl:{
    type:DataTypes.STRING,
    allowNull:true
   },
   isDeleted:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
   }

})
export default GroupMessage;