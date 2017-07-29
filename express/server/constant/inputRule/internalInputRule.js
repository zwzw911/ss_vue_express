/*    gene by H:\ss_vue_express\express\server\maintain\generateAllRuleInOneFile.js     */ 
 
    "use strict"

const internalInputRule={"admin_penalize":{"creatorId":{"chineseName":"处罚人","type":"objectId","require":{"define":true,"error":{"rc":10096},"mongoError":{"rc":20096,"msg":"处罚人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10097},"mongoError":{"rc":20097,"msg":"处罚人格式不正确"}}}},"admin_sugar":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10030},"mongoError":{"rc":20030,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10032},"mongoError":{"rc":20032,"msg":"用户id由24个字符组成"}}},"sugar":{"chineseName":"糖","require":{"define":true,"error":{"rc":10034},"mongoError":{"rc":20034,"msg":"糖不能为空"}},"format":{"define":/^[0-9a-zA-Z]{1,10}$/,"error":{"rc":10040},"mongoError":{"rc":20040,"msg":"糖必须由1-10个字符组成"}}}},"admin_user":{"password":{"chineseName":"密码","type":"string","require":{"define":true,"error":{"rc":10022},"mongoError":{"rc":20022,"msg":"密码不能为空"}},"format":{"define":/^[0-9a-f]{128}$/,"error":{"rc":10024},"mongoError":{"rc":20024,"msg":"密码必须由128个字符组成"}}}},"category":{},"store_path":{"usedSize":{"chineseName":"已使用容量","type":"number","require":{"define":true,"error":{"rc":10075},"mongoError":{"rc":20075,"msg":"已使用容量不能为空"}}}},"article":{"authorId":{"chineseName":"作者","type":"objectId","require":{"define":true,"error":{"rc":10126},"mongoError":{"rc":20126,"msg":"作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10128},"mongoError":{"rc":20128,"msg":"作者必须是objectId"}}},"categoryId":{"chineseName":"分类","type":"objectId","require":{"define":true,"error":{"rc":10130},"mongoError":{"rc":20130,"msg":"文档分类不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10132},"mongoError":{"rc":20132,"msg":"文档分类必须是objectId"}}},"tagsId":{"chineseName":"标签","type":["objectId"],"require":{"define":true,"error":{"rc":10134},"mongoError":{"rc":20134,"msg":"文档标签不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10136},"mongoError":{"rc":20136,"msg":"至少设置1个标签"}},"arrayMaxLength":{"define":5,"error":{"rc":10138},"mongoError":{"rc":20138,"msg":"最多设置5标签"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10140},"mongoError":{"rc":20140,"msg":"文档分类必须是objectId"}}},"articleImagesId":{"chineseName":"文档图片","type":["objectId"],"require":{"define":false,"error":{"rc":10142},"mongoError":{"rc":20142,"msg":"文档图片不能为空"}},"arrayMaxLength":{"define":5,"error":{"rc":10144},"mongoError":{"rc":20144,"msg":"最多插入5个图片"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10146},"mongoError":{"rc":20146,"msg":"文档图片必须是objectId"}}},"articleAttachmentsId":{"chineseName":"文档附件","type":["objectId"],"require":{"define":false,"error":{"rc":10148},"mongoError":{"rc":20148,"msg":"文档附件不能为空"}},"arrayMaxLength":{"define":5,"error":{"rc":10150},"mongoError":{"rc":20150,"msg":"最多添加5个附件"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10152},"mongoError":{"rc":20152,"msg":"文档附件片必须是objectId"}}},"articleCommentsId":{"chineseName":"留言","type":["objectId"],"require":{"define":false,"error":{"rc":10154},"mongoError":{"rc":20154,"msg":"文档留言不能为空"}},"arrayMaxLength":{"define":500,"error":{"rc":10156},"mongoError":{"rc":20156,"msg":"最多添加500个留言"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10158},"mongoError":{"rc":20158,"msg":"文档留言片必须是objectId"}}}},"article_attachment":{"name":{"chineseName":"文档附件名称","type":"string","require":{"define":true,"error":{"rc":10230},"mongoError":{"rc":20230,"msg":"文档附件名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":10236},"mongoError":{"rc":20236,"msg":"文档附件必须由4-255个字符组成"}}},"hashName":{"chineseName":"文档附件名称","type":"string","require":{"define":true,"error":{"rc":10238},"mongoError":{"rc":20238,"msg":"文档附件名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":10240},"mongoError":{"rc":20240,"msg":"hash文档名必须由43~44个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10242},"mongoError":{"rc":20242,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10244},"mongoError":{"rc":20244,"msg":"存储路径必须是objectId"}}},"size":{"chineseName":"附件大小","type":"int","require":{"define":true,"error":{"rc":10246},"mongoError":{"rc":20246,"msg":"附件大小不能为空"}},"max":{"define":10485760,"error":{"rc":10248},"mongoError":{"rc":20248,"msg":"附件大小不能超过10MB"}}},"authorId":{"chineseName":"附件上传者","type":"objectId","require":{"define":true,"error":{"rc":10250},"mongoError":{"rc":20250,"msg":"附件上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10252},"mongoError":{"rc":20252,"msg":"附件上传者必须是objectId"}}},"articleId":{"chineseName":"附件文档","type":"objectId","require":{"define":true,"error":{"rc":10254},"mongoError":{"rc":20254,"msg":"附件文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10256},"mongoError":{"rc":20256,"msg":"文档必须是objectId"}}}},"article_comment":{"authorId":{"chineseName":"评论作者","type":"objectId","require":{"define":true,"error":{"rc":10180},"mongoError":{"rc":20180,"msg":"评论作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10182},"mongoError":{"rc":20182,"msg":"评论作者必须是objectId"}}}},"article_image":{"name":{"chineseName":"文档图片名称","type":"string","require":{"define":true,"error":{"rc":10260},"mongoError":{"rc":20260,"msg":"文档图片名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":10266},"mongoError":{"rc":20266,"msg":"文档名必须由4-255个字符组成"}}},"hashName":{"chineseName":"文档图片名称","type":"string","require":{"define":true,"error":{"rc":10268},"mongoError":{"rc":20268,"msg":"文档图片名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(jpg|png|jpeg)/,"error":{"rc":10270},"mongoError":{"rc":20270,"msg":"hash文档名必须由44个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10272},"mongoError":{"rc":20272,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10274},"mongoError":{"rc":20274,"msg":"存储路径必须是objectId"}}},"size":{"chineseName":"图片大小","type":"int","require":{"define":true,"error":{"rc":10276},"mongoError":{"rc":20276,"msg":"图片大小不能为空"}},"max":{"define":2097152,"error":{"rc":10278},"mongoError":{"rc":20278,"msg":"图片大小不能超过2MB"}}},"authorId":{"chineseName":"图片上传者","type":"objectId","require":{"define":true,"error":{"rc":10280},"mongoError":{"rc":20280,"msg":"图片上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10282},"mongoError":{"rc":20282,"msg":"图片上传者必须是objectId"}}},"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10284},"mongoError":{"rc":20284,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10286},"mongoError":{"rc":20286,"msg":"文档必须是objectId"}}}},"folder":{"authorId":{"chineseName":"创建人","type":"objectId","require":{"define":true,"error":{"rc":10202},"mongoError":{"rc":20202,"msg":"创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10204},"mongoError":{"rc":20204,"msg":"创建人必须是objectId"}}}},"like_dislike":{"authorId":{"chineseName":"提交者","type":"objectId","require":{"define":true,"error":{"rc":10214},"mongoError":{"rc":20214,"msg":"提交者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10216},"mongoError":{"rc":20216,"msg":"提交者必须是objectId"}}}},"like_dislike_static":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10290},"mongoError":{"rc":20290,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10292},"mongoError":{"rc":20292,"msg":"文档必须是objectId"}}}},"tag":{},"member_penalize":{"creatorId":{"chineseName":"处罚发起者","type":"objectId","require":{"define":true,"error":{"rc":10318},"mongoError":{"rc":20318,"msg":"处罚发起者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10320},"mongoError":{"rc":20320,"msg":"处罚发起者必须是objectId"}}}},"public_group":{"creatorId":{"chineseName":"群创建者","type":"objectId","require":{"define":true,"error":{"rc":10356},"mongoError":{"rc":20356,"msg":"群创建者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10358},"mongoError":{"rc":20358,"msg":"群创建者必须是objectId"}}}},"public_group_event":{"sourceId":{"chineseName":"事件发起者","type":"objectId","require":{"define":true,"error":{"rc":10376},"mongoError":{"rc":20376,"msg":"事件发起者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10378},"mongoError":{"rc":20378,"msg":"事件发起者必须是objectId"}}}},"public_group_interaction":{"creatorId":{"chineseName":"发言者","type":"objectId","require":{"define":true,"error":{"rc":10400},"mongoError":{"rc":20400,"msg":"发言者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10402},"mongoError":{"rc":20402,"msg":"发言者必须是objectId"}}},"deleteById":{"chineseName":"删除者","type":"objectId","require":{"define":false,"error":{"rc":10404},"mongoError":{"rc":20404,"msg":"删除者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10406},"mongoError":{"rc":20406,"msg":"删除者必须是objectId"}}}},"user_friend_group":{},"user_public_group":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10430},"mongoError":{"rc":20430,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10432},"mongoError":{"rc":20432,"msg":"用户必须是objectId"}}},"currentJoinGroup":{"chineseName":"用户所处群","type":["objectId"],"require":{"define":false,"error":{"rc":10434},"mongoError":{"rc":20434,"msg":"用户所处群不能为空"}},"arrayMaxLength":{"define":20,"error":{"rc":10436},"mongoError":{"rc":20436,"msg":"用户最多加入20个群"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10438},"mongoError":{"rc":20438,"msg":"用户所处群必须是objectId"}}}},"impeach":{"creatorId":{"chineseName":"举报人","type":"objectId","require":{"define":true,"error":{"rc":10550},"mongoError":{"rc":20550,"msg":"举报人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10552},"mongoError":{"rc":20552,"msg":"举报人必须是objectId"}}}},"impeach_attachment":{"name":{"chineseName":"举报附件名称","type":"string","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":30000,"msg":"举报附件名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":10005},"mongoError":{"rc":30005,"msg":"举报附件必须由4-255个字符组成"}}},"hashName":{"chineseName":"举报附件名称","type":"string","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":30000,"msg":"举报附件名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":10005},"mongoError":{"rc":30005,"msg":"举报附件的hash名必须由43~44个字符组成"}}},"authorId":{"chineseName":"附件上传者","type":"objectId","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"附件上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10005},"mongoError":{"rc":20005,"msg":"附件上传者必须是objectId"}}},"size":{"chineseName":"附件大小","type":"int","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"附件大小不能为空"}},"max":{"define":10485760,"error":{"rc":10004},"mongoError":{"rc":20004,"msg":"附件大小不能超过10MB"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10005},"mongoError":{"rc":20005,"msg":"存储路径必须是objectId"}}}},"impeach_comment":{"authorId":{"chineseName":"评论作者","type":"objectId","require":{"define":true,"error":{"rc":10570},"mongoError":{"rc":20570,"msg":"评论作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10572},"mongoError":{"rc":20572,"msg":"评论作者必须是objectId"}}},"impeachImagesId":{"chineseName":"评论图片","type":["objectId"],"require":{"define":false,"error":{"rc":10574},"mongoError":{"rc":20574,"msg":"评论图片不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10576},"mongoError":{"rc":20576,"msg":"评论中最多插入10个图片"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10578},"mongoError":{"rc":20578,"msg":"评论图片必须是objectId"}}},"impeachAttachmentsId":{"chineseName":"评论附件","type":["objectId"],"require":{"define":false,"error":{"rc":10580},"mongoError":{"rc":20580,"msg":"评论附件不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10582},"mongoError":{"rc":20582,"msg":"评论中最多添加10个附件"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10584},"mongoError":{"rc":20584,"msg":"评论附件必须是objectId"}}}},"impeach_dealer":{},"impeach_image":{"name":{"chineseName":"举报图片名称","type":"string","require":{"define":true,"error":{"rc":10610},"mongoError":{"rc":20610,"msg":"举报图片名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":10616},"mongoError":{"rc":20616,"msg":"举报图片名必须由4-255个字符组成"}}},"hashName":{"chineseName":"举报图片名称","type":"string","require":{"define":true,"error":{"rc":10618},"mongoError":{"rc":20618,"msg":"举报图片名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(jpg|png|jpeg)/,"error":{"rc":10620},"mongoError":{"rc":20620,"msg":"hash名必须由44~45个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10622},"mongoError":{"rc":20622,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10624},"mongoError":{"rc":20624,"msg":"存储路径必须是objectId"}}},"size":{"chineseName":"图片大小","type":"int","require":{"define":true,"error":{"rc":10626},"mongoError":{"rc":20626,"msg":"图片大小不能为空"}},"max":{"define":2097152,"error":{"rc":10628},"mongoError":{"rc":20628,"msg":"图片大小不能超过2MB"}}},"authorId":{"chineseName":"图片上传者","type":"objectId","require":{"define":true,"error":{"rc":10630},"mongoError":{"rc":20630,"msg":"图片上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10632},"mongoError":{"rc":20632,"msg":"图片上传者必须是objectId"}}}},"sugar":{},"user":{"password":{"chineseName":"密码","type":"string","require":{"define":true,"error":{"rc":10724},"mongoError":{"rc":20724,"msg":"密码不能为空"}},"format":{"define":/^[0-9a-f]{64}$/,"error":{"rc":10725},"mongoError":{"rc":20725,"msg":"密码必须由64个字符组成"}}},"photoPathId":{"chineseName":"头像存储路径","type":"objectId","require":{"define":false,"error":{"rc":10726},"mongoError":{"rc":20726,"msg":"头像存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10727},"mongoError":{"rc":20727,"msg":"头像存储路径格式不正确"}}},"photoHashName":{"chineseName":"头像hash名","type":"string","require":{"define":false,"error":{"rc":10728},"mongoError":{"rc":20728,"msg":"头像hash名不能为空"}},"format":{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10729},"mongoError":{"rc":20729,"msg":"头像hash名由27~28个字符组成"}}},"docStatus":{"chineseName":"document状态","type":"string","require":{"define":true,"error":{"rc":10730},"mongoError":{"rc":20730,"msg":"document状态不能为空"}},"enum":{"define":["1","2","3"],"error":{"rc":10731},"mongoError":{"rc":20731,"msg":"document状态不是预定义的值"}}},"accountType":{"chineseName":"账号类型","type":"string","require":{"define":true,"error":{"rc":10732},"mongoError":{"rc":20732,"msg":"账号类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10733},"mongoError":{"rc":20733,"msg":"账号类型不是预定义的值"}}},"usedAccount":{"chineseName":"历史账号","type":["string"],"require":{"define":true,"error":{"rc":10734},"mongoError":{"rc":20734,"msg":"历史账号不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10735},"mongoError":{"rc":20135,"msg":"至少设置1个标签"}},"arrayMaxLength":{"define":10,"error":{"rc":10736},"mongoError":{"rc":20736,"msg":"最多保存10个历史账号"}}},"lastAccountUpdateDate":{"chineseName":"账号更改日期","type":["date"],"require":{"define":true,"error":{"rc":10737},"mongoError":{"rc":20737,"msg":"账号更改日期不能为空"}}},"lastSignInDate":{"chineseName":"上次登录时间","type":["date"],"require":{"define":true,"error":{"rc":10738},"mongoError":{"rc":20738,"msg":"上次登录时间不能为空"}}},"photoSize":{"chineseName":"头像大小","type":"number","require":{"define":false,"error":{"rc":10739},"mongoError":{"rc":20739,"msg":"头像大小不能为空"}}}},"read_article":{},"user_input_keyword":{},"collection":{"creatorId":{"chineseName":"收藏夹创建人","type":"objectId","require":{"define":false,"error":{"rc":10878},"mongoError":{"rc":20878,"msg":"收藏夹创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10880},"mongoError":{"rc":20880,"msg":"收藏夹创建人必须是objectId"}}}},"recommend":{"initiatorId":{"chineseName":"推荐人","type":"objectId","require":{"define":true,"error":{"rc":10816},"mongoError":{"rc":20816,"msg":"推荐人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10818},"mongoError":{"rc":20818,"msg":"推荐人必须是objectId"}}}},"topic":{"creatorId":{"chineseName":"创建人","type":"objectId","require":{"define":false,"error":{"rc":10848},"mongoError":{"rc":20848,"msg":"创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10850},"mongoError":{"rc":20850,"msg":"创建人必须是objectId"}}}}}

module.exports={
    internalInputRule
}
