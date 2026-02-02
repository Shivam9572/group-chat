import { DataTypes } from "sequelize";
import sequelize from "../utils/DB.js";

const GroupMember=sequelize.define("groupmemebr",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    // userID:{
    //     type:DataTypes.INTEGER,
    //     allowNull:false
    // },
    role:{
        type:DataTypes.ENUM("admin","member"),
        allowNull:false
    },
    // groupID:{
    //     type:DataTypes.UUID,
    //     allowNull:false
    // }
});

export default GroupMember;