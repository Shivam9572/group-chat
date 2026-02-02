import { DataTypes } from "sequelize";
import sequelize from "../../utils/DB.js";

const ArchievedMedia=sequelize.define("archieved_media",{
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    mediaType: DataTypes.STRING, // image | video
    mediaKey: DataTypes.STRING,  // S3 original
    thumbKey: {
      type:DataTypes.STRING,
      allowNull:true
    }, 
     createdAt:{
        type:DataTypes.DATE,
        allowNull:false
     },
    updatedAt:{
        type:DataTypes.DATE
    }
  },{timestamps:false});

  export default ArchievedMedia;
 