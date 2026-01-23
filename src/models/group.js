import { DataTypes } from "sequelize";
import sequelize  from "../utils/DB.js";

const Group=sequelize.define("group",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    createdBy:{
        type:DataTypes.INTEGER,
        allowNull:false
    }

});
export default Group;