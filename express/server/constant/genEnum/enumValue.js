/*    gene by server/maintain/generateMongoEnum     */ 
 
"use strict"
const ArticleStatus=["0","1","2",] 
const ArticleAllowComment=["1","2",] 
const AddFriendRule=["1","2","3",] 
const AdminUserType=["1","2",] 
const UserType=["10",] 
const AllUserType=["1","2","10",] 
const AdminPriorityType=["1","2","3","10","11","12","20","21",] 
const PublicGroupJoinInRule=["1","2","3",] 
const PublicGroupEventType=["0","1","2","3","4","5",] 
const EventStatus=["0","1","2",] 
const PenalizeType=["1","2","3","4","10","20","21","30","31","40","50","60","61","70","80","90",] 
const PenalizeSubType=["1","2","3","4","5","9",] 
const ImpeachType=["0","1",] 
const ImpeachAllAction=["1","2","3","4","5","6","7",] 
const ImpeachUserAction=["1","2","3",] 
const ImpeachAdminAction=["4","5","6","7",] 
const ImpeachState=["1","2","3","4","5","6",] 
const ImpeachImageReferenceColl=["1","2",] 
const DocStatus=["1","2","3",] 
const AccountType=["1","2",] 
const StorePathUsage=["1","2","3","4","5",] 
const StorePathStatus=["1","2",] 
const ResourceRange=["1","10","12","14","16","18","20","100","102","105","106","110","112","114","116","118","120","122","124","126","128","130","140","150","151","160","161","162",] 
const ResourceType=["1","2",] 
const DocumentStatus=["1","2",] 
const AddFriendStatus=["1","2","3",] 
const JoinPublicGroupHandleResult=["1","2","3",] 
module.exports={
    ArticleStatus,
    ArticleAllowComment,
    AddFriendRule,
    AdminUserType,
    UserType,
    AllUserType,
    AdminPriorityType,
    PublicGroupJoinInRule,
    PublicGroupEventType,
    EventStatus,
    PenalizeType,
    PenalizeSubType,
    ImpeachType,
    ImpeachAllAction,
    ImpeachUserAction,
    ImpeachAdminAction,
    ImpeachState,
    ImpeachImageReferenceColl,
    DocStatus,
    AccountType,
    StorePathUsage,
    StorePathStatus,
    ResourceRange,
    ResourceType,
    DocumentStatus,
    AddFriendStatus,
    JoinPublicGroupHandleResult,
}