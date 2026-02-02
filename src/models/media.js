import { DataTypes } from "sequelize";
import sequelize from "../utils/DB.js";

const Media=sequelize.define("media",{
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    mediaType: DataTypes.STRING, // image | video
    mediaKey: DataTypes.STRING,  // S3 original
    thumbKey: {
      type:DataTypes.STRING,
      allowNull:true
    },  // S3 thumbnail
  });

  export default Media;
 