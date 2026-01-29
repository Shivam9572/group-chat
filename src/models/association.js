import User from "./user.js";
import Group from "./group.js";
import GroupMember from "./groupMember.js";
import Message from "./message.js";
import GroupMessage from "./groupMessage.js";
import Media from "./media.js";


User.hasMany(Message,{foreignKey:"senderID",as:"sender"});
User.hasMany(Message,{foreignKey:"recieverID",as:"reciever"});
Message.belongsTo(User,{foreignKey:"senderID",as:"sender"});
Message.belongsTo(User,{foreignKey:"recieverID",as:"reciever"});


User.belongsToMany(Group,{through:GroupMember,foreignKey:"userID"});
Group.belongsToMany(User,{through:GroupMember,foreignKey:"groupID"});
GroupMessage.belongsTo(User,{foreignKey:"senderID",as:"senderInfo"});
GroupMessage.belongsTo(Group,{foreignKey:"groupID",as:"groupInfo"});
User.hasMany(GroupMessage,{foreignKey:"senderID"});
Group.hasMany(GroupMessage,{foreignKey:"groupID"});
GroupMember.belongsTo(Group,{foreignKey:"groupID",as:"group"});
GroupMember.belongsTo(User,{foreignKey:"userID",as:"userMember"});
Group.hasMany(GroupMember,{foreignKey:"groupID"});
User.hasMany(GroupMember,{foreignKey:"userID"});
Media.hasMany(Message, {
  foreignKey: "mediaID",
});

Message.belongsTo(Media, {
  foreignKey: "mediaID",
  as: "media",
});
Media.hasMany(GroupMessage, {
  foreignKey: "mediaID",
});

GroupMessage.belongsTo(Media, {
  foreignKey: "mediaID",
  as: "groupMedia",
});


let models={User,Message,Group,GroupMember,GroupMessage,Media};
export default models;

