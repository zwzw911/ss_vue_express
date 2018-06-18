/*    gene by H:\ss_vue_express\server_common\maintain\generateFunction\generateClientEnum.js     */ 
 
"use strict"
const ArticleStatus=
    {"0":"新建文档","1":"编辑中","2":"编辑完成"}

const AdminUserType=
    {"1":"超级管理员","2":"管理员"}

const UserType=
    {"10":"普通用户"}

const AllUserType=
    {"1":"超级管理员","2":"管理员","10":"普通用户"}

const AdminPriorityType=
    {"1":"浏览举报","2":"分配举报","3":"处理举报","10":"创建管理员","11":"删除管理员","12":"更新管理员","20":"处罚用户","21":"撤销处罚"}

const PublicGroupJoinInRule=
    {"1":"任意加入","2":"批准加入","3":"拒绝加入"}

const PublicGroupEventType=
    {"0":"群创建","1":"新用户申请加入","2":"邀请新用户加入","3":"更改管理员","4":"删除群成员","5":"用户退群"}

const EventStatus=
    {"0":"处理中","1":"处理完毕","2":"拒绝"}

const PenalizeType=
    {"0":"禁止文档","1":"禁止评论","2":"禁止创建系列","3":"禁止踩赞","4":"禁止举报","5":"禁止评论举报","7":"禁止好友分组","8":"禁止添加好友","9":"禁止创建群","10":"禁止上传头像","11":"禁止目录相关操作"}

const PenalizeSubType=
    {"1":"禁止创建","2":"禁止读取","3":"禁止更新","4":"禁止删除","9":"禁止所有操作"}

const ImpeachType=
    {"0":"举报文档","1":"举报评论"}

const ImpeachAllAction=
    {"1":"创建","2":"提交","3":"撤回","4":"分配","5":"接受","6":"驳回","7":"完成"}

const ImpeachUserAction=
    {"1":"创建","2":"提交","3":"撤回"}

const ImpeachAdminAction=
    {"4":"分配","5":"接受","6":"驳回","7":"完成"}

const ImpeachState=
    {"1":"新建","2":"编辑","3":"等待分配","4":"等待处理","5":"处理中","6":"结束"}

const StorePathUsage=
    {"1":"临时文件夹","2":"用户头像","3":"文档图片","4":"文档附件","5":"举报图片"}

const StorePathStatus=
    {"1":"只读","2":"读写"}

const ResourceRange=
    {"1":"用户文档所有资源","10":"文档图片","12":"文档附件","18":"最大目录数量","20":"最大朋友群数量","22":"群人数数量","24":"最大未处理的添加朋友的请求数","26":"最大已同意但是未被分配的添加朋友的请求数","28":"新建但未做过任何处理的文档数","30":"最大文档数","32":"文档最大评论数","34":"用户对文档的最大评论数","36":"单次举报最大可插入图片资源","38":"整个举报过程中最大可插入图片资源","39":"整个举报过程中用户最大可插入图片资源","40":"用户最大编辑中举报数","41":"最大撤销举报数"}

const ResourceType=
    {"1":"基本资源配置","2":"高级资源配置"}

const DocumentStatus=
    {"1":"新建记录，但未提交","2":"新建记录，已经提交"}

const AddFriendStatus=
    {"1":"尚未处理","2":"拒绝","3":"接受但未分配","4":"接受"}

module.exports={
    ArticleStatus,
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
    StorePathUsage,
    StorePathStatus,
    ResourceRange,
    ResourceType,
    DocumentStatus,
    AddFriendStatus,
}