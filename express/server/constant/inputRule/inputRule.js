/*    gene by H:\ss_vue_express\server_common\maintain\generateAllRuleInOneFile.js     */ 
 
    "use strict"

const inputRule={"admin_penalize":{"punishedId":{"chineseName":"受罚人","type":"objectId","require":{"define":true,"error":{"rc":10080},"mongoError":{"rc":20080,"msg":"受罚人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10082},"mongoError":{"rc":20082,"msg":"受罚人格式不正确"}}},"reason":{"chineseName":"受罚原因","type":"string","require":{"define":true,"error":{"rc":10084},"mongoError":{"rc":20084,"msg":"受罚原因不能为空"}},"minLength":{"define":15,"error":{"rc":10086},"mongoError":{"rc":20086,"msg":"受罚原因至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10088},"mongoError":{"rc":20088,"msg":"受罚原因的字数不能超过1000个字符"}}},"penalizeType":{"chineseName":"受罚类型","type":"string","require":{"define":true,"error":{"rc":10089},"mongoError":{"rc":20089,"msg":"受罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10090},"mongoError":{"rc":20090,"msg":"受罚类型不正确"}}},"penalizeSubType":{"chineseName":"受罚子类型","type":"string","require":{"define":true,"error":{"rc":10091},"mongoError":{"rc":20091,"msg":"受罚子类型不能为空"}},"enum":{"define":["1","2","3","4","9"],"error":{"rc":10092},"mongoError":{"rc":20092,"msg":"受罚子类型不正确"}}},"duration":{"chineseName":"受罚时长","type":"int","require":{"define":true,"error":{"rc":10093},"mongoError":{"rc":20093,"msg":"受罚时长不能为空"}},"min":{"define":0,"error":{"rc":10094},"mongoError":{"rc":20094,"msg":"受罚时长至少1天"}},"max":{"define":30,"error":{"rc":10095},"mongoError":{"rc":20095,"msg":"受罚时长最长30天"}}},"creatorId":{"chineseName":"处罚人","type":"objectId","require":{"define":true,"error":{"rc":10096},"mongoError":{"rc":20096,"msg":"处罚人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10097},"mongoError":{"rc":20097,"msg":"处罚人格式不正确"}}}},"category":{"name":{"chineseName":"分类名称","type":"string","require":{"define":true,"error":{"rc":10050},"mongoError":{"rc":20050,"msg":"分类名不能为空"}},"minLength":{"define":2,"error":{"rc":10052},"mongoError":{"rc":20052,"msg":"分类名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10054},"mongoError":{"rc":20054,"msg":"分类名的长度不能超过50个字符"}}},"parentCategoryId":{"chineseName":"上级分类","type":"objectId","require":{"define":false,"error":{"rc":10056},"mongoError":{"rc":20056,"msg":"上级分类不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10058},"mongoError":{"rc":20058,"msg":"上级分类必须是objectId"}}}},"resource_profile":{"name":{"chineseName":"资源配置名称","type":"string","require":{"define":true,"error":{"rc":11100},"mongoError":{"rc":21100,"msg":"资源配置名称不能为空"}},"minLength":{"define":2,"error":{"rc":11102},"mongoError":{"rc":21102,"msg":"资源配置名称至少2个字符"}},"maxLength":{"define":50,"error":{"rc":11104},"mongoError":{"rc":21104,"msg":"资源配置名称的长度不能超过50个字符"}}},"range":{"chineseName":"资源配置范围","type":"string","require":{"define":true,"error":{"rc":11106},"mongoError":{"rc":21106,"msg":"资源配置范围不能为空"}},"enum":{"define":["1","2","3","4"],"error":{"rc":11107},"mongoError":{"rc":21107,"msg":"资源配置范围的类型不正确"}}},"type":{"chineseName":"资源配置类型","type":"string","require":{"define":true,"error":{"rc":11108},"mongoError":{"rc":21108,"msg":"资源配置类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":11109},"mongoError":{"rc":21109,"msg":"资源配置类型的值类型不正确"}}},"maxFileNum":{"chineseName":"最大文件数量","type":"number","require":{"define":true,"error":{"rc":11110},"mongoError":{"rc":21110,"msg":"最大文件数量不能为空"}}},"totalFileSizeInMb":{"chineseName":"最大存储空间","type":"number","require":{"define":true,"error":{"rc":11112},"mongoError":{"rc":21112,"msg":"最大存储空间不能为空"}}}},"store_path":{"name":{"chineseName":"存储路径名称","type":"string","require":{"define":true,"error":{"rc":10060},"mongoError":{"rc":20060,"msg":"存储路径名称不能为空"}},"minLength":{"define":2,"error":{"rc":10062},"mongoError":{"rc":20062,"msg":"存储路径名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10064},"mongoError":{"rc":20064,"msg":"存储路径名称的长度不能超过50个字符"}}},"path":{"chineseName":"存储路径","type":"folder","require":{"define":true,"error":{"rc":10066},"mongoError":{"rc":20066,"msg":"存储路径不能为空"}}},"usage":{"chineseName":"用途","type":"string","require":{"define":true,"error":{"rc":10068},"mongoError":{"rc":20068,"msg":"存储路径用途不能为空"}},"enum":{"define":["1","2","3","4","5"],"error":{"rc":10069},"mongoError":{"rc":20069,"msg":"储路径用途的类型不正确"}}},"sizeInKb":{"chineseName":"容量","type":"number","require":{"define":true,"error":{"rc":10070},"mongoError":{"rc":20070,"msg":"容量不能为空"}},"max":{"define":1000000,"error":{"rc":10071},"mongoError":{"rc":20071,"msg":"容量最多1000M"}}},"lowThreshold":{"chineseName":"容量下限值","type":"number","require":{"define":true,"error":{"rc":10072},"mongoError":{"rc":20072,"msg":"容量下限值不能为空"}},"min":{"define":50,"error":{"rc":10073},"mongoError":{"rc":20073,"msg":"容量下限值至少50%"}},"max":{"define":80,"error":{"rc":10074},"mongoError":{"rc":20074,"msg":"容量门限报警值最多95%"}}},"highThreshold":{"chineseName":"容量上限值","type":"number","require":{"define":true,"error":{"rc":10075},"mongoError":{"rc":20075,"msg":"容量上限值不能为空"}},"min":{"define":60,"error":{"rc":10076},"mongoError":{"rc":20076,"msg":"容量上限值至少60%"}},"max":{"define":95,"error":{"rc":10077},"mongoError":{"rc":20077,"msg":"容量上限值最多95%"}}},"usedSize":{"chineseName":"已使用容量","type":"number","require":{"define":true,"error":{"rc":10075},"mongoError":{"rc":20075,"msg":"已使用容量不能为空"}}},"status":{"chineseName":"存储路径状态","type":"string","require":{"define":true,"error":{"rc":10076},"mongoError":{"rc":20076,"msg":"存储路径状态不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10077},"mongoError":{"rc":20077,"msg":"存储路径状态不正确"}}}},"article":{"name":{"chineseName":"文档名","type":"string","require":{"define":true,"error":{"rc":10100},"mongoError":{"rc":20000,"msg":"文档名不能为空"}},"minLength":{"define":1,"error":{"rc":10102},"mongoError":{"rc":20102,"msg":"文档名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10104},"mongoError":{"rc":20104,"msg":"文档名的长度不能超过50个字符"}}},"status":{"chineseName":"文档状态","type":"string","require":{"define":true,"error":{"rc":10106},"mongoError":{"rc":20106,"msg":"文档状态不能为空"}},"enum":{"define":["0","1","2"],"error":{"rc":10108},"mongoError":{"rc":20108,"msg":"文档状态不正确"}}},"folderId":{"chineseName":"文档目录","type":"objectId","require":{"define":true,"error":{"rc":10110},"mongoError":{"rc":20110,"msg":"文档目录不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10112},"mongoError":{"rc":20112,"msg":"文档目录必须是objectId"}}},"htmlContent":{"chineseName":"格式内容","type":"string","require":{"define":true,"error":{"rc":10114},"mongoError":{"rc":20114,"msg":"格式内容不能为空"}},"minLength":{"define":1,"error":{"rc":10116},"mongoError":{"rc":20116,"msg":"格式内容至少1个字符"}},"maxLength":{"define":50000,"error":{"rc":10118},"mongoError":{"rc":20118,"msg":"格式内容的长度不能超过50000个字符"}}},"tags":{"chineseName":"文档标签","type":["string"],"require":{"define":false,"error":{"rc":10120},"mongoError":{"rc":20120,"msg":"文档标签不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10122},"mongoError":{"rc":20122,"msg":"至少设置1个标签"}},"arrayMaxLength":{"define":5,"error":{"rc":10123},"mongoError":{"rc":20123,"msg":"最多设置5标签"}},"minLength":{"define":2,"error":{"rc":10123},"mongoError":{"rc":20123,"msg":"文档标签至少2个字符"}},"maxLength":{"define":20,"error":{"rc":10124},"mongoError":{"rc":20124,"msg":"文档标签的长度不能超过20个字符"}}},"categoryId":{"chineseName":"分类","type":"objectId","require":{"define":true,"error":{"rc":10130},"mongoError":{"rc":20130,"msg":"文档分类不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10132},"mongoError":{"rc":20132,"msg":"文档分类必须是objectId"}}},"authorId":{"chineseName":"作者","type":"objectId","require":{"define":true,"error":{"rc":10126},"mongoError":{"rc":20126,"msg":"作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10128},"mongoError":{"rc":20128,"msg":"作者必须是objectId"}}},"articleImagesId":{"chineseName":"文档图片","type":["objectId"],"require":{"define":false,"error":{"rc":10142},"mongoError":{"rc":20142,"msg":"文档图片不能为空"}},"arrayMaxLength":{"define":5,"error":{"rc":10144},"mongoError":{"rc":20144,"msg":"最多插入5个图片"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10146},"mongoError":{"rc":20146,"msg":"文档图片必须是objectId"}}},"articleAttachmentsId":{"chineseName":"文档附件","type":["objectId"],"require":{"define":false,"error":{"rc":10148},"mongoError":{"rc":20148,"msg":"文档附件不能为空"}},"arrayMaxLength":{"define":5,"error":{"rc":10150},"mongoError":{"rc":20150,"msg":"最多添加5个附件"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10152},"mongoError":{"rc":20152,"msg":"文档附件片必须是objectId"}}},"articleCommentsId":{"chineseName":"留言","type":["objectId"],"require":{"define":false,"error":{"rc":10154},"mongoError":{"rc":20154,"msg":"文档留言不能为空"}},"arrayMaxLength":{"define":500,"error":{"rc":10156},"mongoError":{"rc":20156,"msg":"最多添加500个留言"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10158},"mongoError":{"rc":20158,"msg":"文档留言片必须是objectId"}}}},"article_attachment":{"name":{"chineseName":"文档附件名称","type":"string","require":{"define":true,"error":{"rc":10230},"mongoError":{"rc":20230,"msg":"文档附件名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":10236},"mongoError":{"rc":20236,"msg":"文档附件必须由4-255个字符组成"}}},"hashName":{"chineseName":"文档附件名称","type":"string","require":{"define":true,"error":{"rc":10238},"mongoError":{"rc":20238,"msg":"文档附件名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":10240},"mongoError":{"rc":20240,"msg":"hash文档名必须由35~36个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10242},"mongoError":{"rc":20242,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10244},"mongoError":{"rc":20244,"msg":"存储路径必须是objectId"}}},"sizeInMb":{"chineseName":"附件大小","type":"int","require":{"define":true,"error":{"rc":10246},"mongoError":{"rc":20246,"msg":"附件大小不能为空"}},"max":{"define":10,"error":{"rc":10248},"mongoError":{"rc":20248,"msg":"附件大小不能超过10MB"}}},"authorId":{"chineseName":"附件上传者","type":"objectId","require":{"define":true,"error":{"rc":10250},"mongoError":{"rc":20250,"msg":"附件上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10252},"mongoError":{"rc":20252,"msg":"附件上传者必须是objectId"}}},"articleId":{"chineseName":"附件文档","type":"objectId","require":{"define":true,"error":{"rc":10254},"mongoError":{"rc":20254,"msg":"附件文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10256},"mongoError":{"rc":20256,"msg":"文档必须是objectId"}}}},"article_comment":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10170},"mongoError":{"rc":20170,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10172},"mongoError":{"rc":20172,"msg":"文档必须是objectId"}}},"content":{"chineseName":"评论内容","type":"string","require":{"define":true,"error":{"rc":10174},"mongoError":{"rc":10174,"msg":"评论内容不能为空"}},"minLength":{"define":1,"error":{"rc":10176},"mongoError":{"rc":10176,"msg":"评论内容至少1个字符"}},"maxLength":{"define":255,"error":{"rc":10178},"mongoError":{"rc":10178,"msg":"评论内容不能超过255个字符"}}},"authorId":{"chineseName":"评论作者","type":"objectId","require":{"define":true,"error":{"rc":10180},"mongoError":{"rc":20180,"msg":"评论作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10182},"mongoError":{"rc":20182,"msg":"评论作者必须是objectId"}}}},"article_image":{"name":{"chineseName":"文档图片名称","type":"string","require":{"define":true,"error":{"rc":10260},"mongoError":{"rc":20260,"msg":"文档图片名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":10266},"mongoError":{"rc":20266,"msg":"文档名必须由4-255个字符组成"}}},"hashName":{"chineseName":"文档图片名称","type":"string","require":{"define":true,"error":{"rc":10268},"mongoError":{"rc":20268,"msg":"文档图片名称不能为空"}},"format":{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10270},"mongoError":{"rc":20270,"msg":"hash文档名必须由35~36个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10272},"mongoError":{"rc":20272,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10274},"mongoError":{"rc":20274,"msg":"存储路径必须是objectId"}}},"sizeInMb":{"chineseName":"图片大小","type":"int","require":{"define":true,"error":{"rc":10276},"mongoError":{"rc":20276,"msg":"图片大小不能为空"}},"max":{"define":2,"error":{"rc":10278},"mongoError":{"rc":20278,"msg":"图片大小不能超过2MB"}}},"authorId":{"chineseName":"图片上传者","type":"objectId","require":{"define":true,"error":{"rc":10280},"mongoError":{"rc":20280,"msg":"图片上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10282},"mongoError":{"rc":20282,"msg":"图片上传者必须是objectId"}}},"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10284},"mongoError":{"rc":20284,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10286},"mongoError":{"rc":20286,"msg":"文档必须是objectId"}}}},"folder":{"name":{"chineseName":"目录名称","type":"string","require":{"define":true,"error":{"rc":10190},"mongoError":{"rc":20190,"msg":"目录名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,255}$/,"error":{"rc":10196},"mongoError":{"rc":20196,"msg":"目录名必须由1-255个字符组成"}}},"parentFolderId":{"chineseName":"上级目录","type":"objectId","require":{"define":false,"error":{"rc":10198},"mongoError":{"rc":20198,"msg":"上级目录不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10200},"mongoError":{"rc":20200,"msg":"上级目录必须是objectId"}}},"authorId":{"chineseName":"创建人","type":"objectId","require":{"define":true,"error":{"rc":10202},"mongoError":{"rc":20202,"msg":"创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10204},"mongoError":{"rc":20204,"msg":"创建人必须是objectId"}}}},"like_dislike":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10210},"mongoError":{"rc":20210,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10212},"mongoError":{"rc":20212,"msg":"文档必须是objectId"}}},"like":{"chineseName":"喜欢","type":"boolean","require":{"define":true,"error":{"rc":10218},"mongoError":{"rc":20218,"msg":"喜欢不能为空"}}},"authorId":{"chineseName":"提交者","type":"objectId","require":{"define":true,"error":{"rc":10214},"mongoError":{"rc":20214,"msg":"提交者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10216},"mongoError":{"rc":20216,"msg":"提交者必须是objectId"}}}},"tag":{"name":{"chineseName":"标签名称","type":"string","require":{"define":true,"error":{"rc":10220},"mongoError":{"rc":20220,"msg":"标签名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10226},"mongoError":{"rc":20226,"msg":"标签名必须由2-20个字符组成"}}}},"member_penalize":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10300},"mongoError":{"rc":20300,"msg":"群不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10302},"mongoError":{"rc":20302,"msg":"群必须是objectId"}}},"memberId":{"chineseName":"成员","type":"objectId","require":{"define":true,"error":{"rc":10304},"mongoError":{"rc":20304,"msg":"成员不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10306},"mongoError":{"rc":20306,"msg":"成员必须是objectId"}}},"penalizeType":{"chineseName":"处罚类型","type":"string","require":{"define":true,"error":{"rc":10308},"mongoError":{"rc":20308,"msg":"处罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10310},"mongoError":{"rc":20310,"msg":"未知处罚类型"}}},"duration":{"chineseName":"处罚时间","type":"int","require":{"define":true,"error":{"rc":10312},"mongoError":{"rc":20312,"msg":"处罚时间不能为空"}},"min":{"define":1,"error":{"rc":10314},"mongoError":{"rc":20314,"msg":"处罚时间最少1天"}},"max":{"define":30,"error":{"rc":10316},"mongoError":{"rc":20316,"msg":"处罚时间最多30天"}}},"creatorId":{"chineseName":"处罚发起者","type":"objectId","require":{"define":true,"error":{"rc":10318},"mongoError":{"rc":20318,"msg":"处罚发起者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10320},"mongoError":{"rc":20320,"msg":"处罚发起者必须是objectId"}}}},"public_group":{"name":{"chineseName":"群名称","type":"string","require":{"define":true,"error":{"rc":10330},"mongoError":{"rc":20330,"msg":"群名称不能为空"}},"minLength":{"define":1,"error":{"rc":10332},"mongoError":{"rc":20332,"msg":"群名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10334},"mongoError":{"rc":20334,"msg":"群名称的长度不能超过20个字符"}}},"memberId":{"chineseName":"群成员","type":["objectId"],"require":{"define":false,"error":{"rc":10336},"mongoError":{"rc":20336,"msg":"群成员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10338},"mongoError":{"rc":20338,"msg":"群至少有一个成员"}},"arrayMaxLength":{"define":200,"error":{"rc":10340},"mongoError":{"rc":20340,"msg":"群最多有200个成员"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10342},"mongoError":{"rc":20342,"msg":"群成员必须是objectId"}}},"adminId":{"chineseName":"群管理员","type":["objectId"],"require":{"define":true,"error":{"rc":10344},"mongoError":{"rc":20344,"msg":"群管理员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10346},"mongoError":{"rc":20346,"msg":"群管理员至少有一个成员"}},"arrayMaxLength":{"define":10,"error":{"rc":10348},"mongoError":{"rc":20348,"msg":"群最多有10个群管理员"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10350},"mongoError":{"rc":20350,"msg":"群管理员必须是objectId"}}},"joinInRule":{"chineseName":"新成员加入规则","type":"string","require":{"define":true,"error":{"rc":10352},"mongoError":{"rc":20352,"msg":"新成员加入规则不能为空"}},"enum":{"define":["0","1"],"error":{"rc":10354},"mongoError":{"rc":20354,"msg":"新成员加入规则不正确"}}},"creatorId":{"chineseName":"群创建者","type":"objectId","require":{"define":true,"error":{"rc":10356},"mongoError":{"rc":20356,"msg":"群创建者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10358},"mongoError":{"rc":20358,"msg":"群创建者必须是objectId"}}}},"public_group_event":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10360},"mongoError":{"rc":20360,"msg":"群不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10362},"mongoError":{"rc":20362,"msg":"群必须是objectId"}}},"eventType":{"chineseName":"群事件类型","type":"string","require":{"define":true,"error":{"rc":10364},"mongoError":{"rc":20364,"msg":"群事件类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10366},"mongoError":{"rc":20366,"msg":"未知群事件类型"}}},"targetId":{"chineseName":"事件接收者","type":"objectId","require":{"define":false,"error":{"rc":10368},"mongoError":{"rc":20368,"msg":"事件接收者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10370},"mongoError":{"rc":20370,"msg":"事件接收者必须是objectId"}}},"status":{"chineseName":"事件状态","type":"string","require":{"define":true,"error":{"rc":10372},"mongoError":{"rc":20372,"msg":"事件状态不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10374},"mongoError":{"rc":20374,"msg":"未知事件状态"}}},"sourceId":{"chineseName":"事件发起者","type":"objectId","require":{"define":true,"error":{"rc":10376},"mongoError":{"rc":20376,"msg":"事件发起者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10378},"mongoError":{"rc":20378,"msg":"事件发起者必须是objectId"}}}},"public_group_interaction":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10390},"mongoError":{"rc":20390,"msg":"群不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10392},"mongoError":{"rc":20392,"msg":"群必须是objectId"}}},"content":{"chineseName":"群发言内容","type":"string","require":{"define":true,"error":{"rc":10394},"mongoError":{"rc":20394,"msg":"群发言内容不能为空"}},"minLength":{"define":15,"error":{"rc":10396},"mongoError":{"rc":20396,"msg":"群发言内容至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10398},"mongoError":{"rc":20398,"msg":"群发言内容的长度不能超过1000个字符"}}},"creatorId":{"chineseName":"发言者","type":"objectId","require":{"define":true,"error":{"rc":10400},"mongoError":{"rc":20400,"msg":"发言者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10402},"mongoError":{"rc":20402,"msg":"发言者必须是objectId"}}},"deleteById":{"chineseName":"删除者","type":"objectId","require":{"define":false,"error":{"rc":10404},"mongoError":{"rc":20404,"msg":"删除者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10406},"mongoError":{"rc":20406,"msg":"删除者必须是objectId"}}}},"user_friend_group":{"name":{"chineseName":"朋友分组","type":"string","require":{"define":true,"error":{"rc":10410},"mongoError":{"rc":20410,"msg":"朋友分组名不能为空"}},"minLength":{"define":1,"error":{"rc":10412},"mongoError":{"rc":20412,"msg":"朋友分组名至少1个字符"}},"maxLength":{"define":20,"error":{"rc":10414},"mongoError":{"rc":20414,"msg":"朋友分组名的长度不能超过20个字符"}}},"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10416},"mongoError":{"rc":20416,"msg":"文档目录不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10418},"mongoError":{"rc":20418,"msg":"文档目录必须是objectId"}}},"friendsInGroup":{"chineseName":"好友分组","type":["objectId"],"require":{"define":false,"error":{"rc":10420},"mongoError":{"rc":20420,"msg":"好友分组不能为空"}},"arrayMaxLength":{"define":500,"error":{"rc":10422},"mongoError":{"rc":20422,"msg":"好友分组最多包含500个好友"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10424},"mongoError":{"rc":20424,"msg":"好友必须是objectId"}}}},"user_public_group":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10430},"mongoError":{"rc":20430,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10432},"mongoError":{"rc":20432,"msg":"用户必须是objectId"}}},"currentJoinGroup":{"chineseName":"用户所处群","type":["objectId"],"require":{"define":false,"error":{"rc":10434},"mongoError":{"rc":20434,"msg":"用户所处群不能为空"}},"arrayMaxLength":{"define":20,"error":{"rc":10436},"mongoError":{"rc":20436,"msg":"用户最多加入20个群"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10438},"mongoError":{"rc":20438,"msg":"用户所处群必须是objectId"}}}},"impeach":{"title":{"chineseName":"举报名","type":"string","require":{"define":true,"error":{"rc":10500},"mongoError":{"rc":20500,"msg":"举报名不能为空"}},"minLength":{"define":2,"error":{"rc":10502},"mongoError":{"rc":20502,"msg":"举报名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10504},"mongoError":{"rc":20504,"msg":"举报名的长度不能超过50个字符"}}},"content":{"chineseName":"举报内容","type":"string","require":{"define":true,"error":{"rc":10506},"mongoError":{"rc":20506,"msg":"举报内容不能为空"}},"minLength":{"define":5,"error":{"rc":10508},"mongoError":{"rc":20508,"msg":"举报内容至少5个字符"}},"maxLength":{"define":1999,"error":{"rc":10510},"mongoError":{"rc":20510,"msg":"举报内容的长度不能超过1999个字符"}}},"impeachedArticleId":{"chineseName":"举报的文档","type":"objectId","require":{"define":false,"error":{"rc":10534},"mongoError":{"rc":20534,"msg":"举报的文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10536},"mongoError":{"rc":20536,"msg":"举报的文档必须是objectId"}}},"impeachedCommentId":{"chineseName":"举报的评论","type":"objectId","require":{"define":false,"error":{"rc":10538},"mongoError":{"rc":20538,"msg":"举报的评论不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10540},"mongoError":{"rc":20540,"msg":"举报的评论必须是objectId"}}},"impeachStatus":{"chineseName":"文档状态","type":"string","require":{"define":true,"error":{"rc":10546},"mongoError":{"rc":20546,"msg":"文档状态不能为空"}},"enum":{"define":["0","1","2","3","4","5","6"],"error":{"rc":10548},"mongoError":{"rc":20548,"msg":"文档状态不正确"}}},"creatorId":{"chineseName":"举报人","type":"objectId","require":{"define":true,"error":{"rc":10550},"mongoError":{"rc":20550,"msg":"举报人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10552},"mongoError":{"rc":20552,"msg":"举报人必须是objectId"}}},"impeachType":{"chineseName":"举报的对象","type":"string","require":{"define":true,"error":{"rc":10530},"mongoError":{"rc":20530,"msg":"举报的对象不能为空"}},"enum":{"define":["0","1"],"error":{"rc":10532},"mongoError":{"rc":20532,"msg":"未知举报的对象"}}},"impeachedUserId":{"chineseName":"被举报人","type":"objectId","require":{"define":true,"error":{"rc":10542},"mongoError":{"rc":20542,"msg":"被举报人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10544},"mongoError":{"rc":20544,"msg":"被举报人必须是objectId"}}},"impeachImagesId":{"chineseName":"举报图片","type":["objectId"],"require":{"define":false,"error":{"rc":10512},"mongoError":{"rc":20512,"msg":"举报图片不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10514},"mongoError":{"rc":20514,"msg":"最多插入10个图片"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10516},"mongoError":{"rc":20516,"msg":"举报图片必须是objectId"}}},"impeachAttachmentsId":{"chineseName":"举报附件","type":["objectId"],"require":{"define":false,"error":{"rc":10518},"mongoError":{"rc":20518,"msg":"举报附件不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10520},"mongoError":{"rc":20520,"msg":"最多添加10个附件"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10522},"mongoError":{"rc":20522,"msg":"举报附件片必须是objectId"}}},"impeachCommentsId":{"chineseName":"留言","type":["objectId"],"require":{"define":false,"error":{"rc":10524},"mongoError":{"rc":20524,"msg":"举报留言不能为空"}},"arrayMaxLength":{"define":200,"error":{"rc":10526},"mongoError":{"rc":20526,"msg":"最多添加200个举报"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10528},"mongoError":{"rc":20528,"msg":"举报留言片必须是objectId"}}}},"impeach_attachment":{"name":{"chineseName":"举报附件名称","type":"string","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":30000,"msg":"举报附件名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,"error":{"rc":10005},"mongoError":{"rc":30005,"msg":"举报附件必须由4-255个字符组成"}}},"hashName":{"chineseName":"举报附件名称","type":"string","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":30000,"msg":"举报附件名称不能为空"}},"format":{"define":/[0-9a-f]{40}\.(txt|7z|log)/,"error":{"rc":10005},"mongoError":{"rc":30005,"msg":"举报附件的hash名必须由27~28个字符组成"}}},"authorId":{"chineseName":"附件上传者","type":"objectId","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"附件上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10005},"mongoError":{"rc":20005,"msg":"附件上传者必须是objectId"}}},"sizeInMb":{"chineseName":"附件大小","type":"int","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"附件大小不能为空"}},"max":{"define":10,"error":{"rc":10004},"mongoError":{"rc":20004,"msg":"附件大小不能超过10MB"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10000},"mongoError":{"rc":20000,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10005},"mongoError":{"rc":20005,"msg":"存储路径必须是objectId"}}}},"impeach_comment":{"impeachId":{"chineseName":"举报","type":"objectId","require":{"define":true,"error":{"rc":10560},"mongoError":{"rc":20560,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10562},"mongoError":{"rc":20562,"msg":"举报必须是objectId"}}},"content":{"chineseName":"评论内容","type":"string","require":{"define":true,"error":{"rc":10564},"mongoError":{"rc":20564,"msg":"评论内容不能为空"}},"minLength":{"define":15,"error":{"rc":10566},"mongoError":{"rc":20566,"msg":"评论内容至少15个字符"}},"maxLength":{"define":140,"error":{"rc":10568},"mongoError":{"rc":20568,"msg":"评论内容不能超过140个字符"}}},"authorId":{"chineseName":"评论作者","type":"objectId","require":{"define":true,"error":{"rc":10570},"mongoError":{"rc":20570,"msg":"评论作者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10572},"mongoError":{"rc":20572,"msg":"评论作者必须是objectId"}}},"impeachImagesId":{"chineseName":"评论图片","type":["objectId"],"require":{"define":false,"error":{"rc":10574},"mongoError":{"rc":20574,"msg":"评论图片不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10576},"mongoError":{"rc":20576,"msg":"评论中最多插入10个图片"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10578},"mongoError":{"rc":20578,"msg":"评论图片必须是objectId"}}},"impeachAttachmentsId":{"chineseName":"评论附件","type":["objectId"],"require":{"define":false,"error":{"rc":10580},"mongoError":{"rc":20580,"msg":"评论附件不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10582},"mongoError":{"rc":20582,"msg":"评论中最多添加10个附件"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10584},"mongoError":{"rc":20584,"msg":"评论附件必须是objectId"}}}},"impeach_dealer":{"impeachId":{"chineseName":"举报","type":"objectId","require":{"define":true,"error":{"rc":10590},"mongoError":{"rc":20590,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10592},"mongoError":{"rc":20592,"msg":"举报必须是objectId"}}},"assignerId":{"chineseName":"分配人","type":"objectId","require":{"define":true,"error":{"rc":10594},"mongoError":{"rc":20594,"msg":"分配人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10596},"mongoError":{"rc":20596,"msg":"分配人必须是objectId"}}},"dealerId":{"chineseName":"处理人","type":"objectId","require":{"define":true,"error":{"rc":10598},"mongoError":{"rc":20598,"msg":"处理人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10600},"mongoError":{"rc":20600,"msg":"处理人必须是objectId"}}}},"impeach_image":{"referenceId":{"chineseName":"举报对象","type":"objectId","require":{"define":true,"error":{"rc":10634},"mongoError":{"rc":20634,"msg":"举报对象不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10636},"mongoError":{"rc":20636,"msg":"举报对象必须是objectId"}}},"referenceColl":{"chineseName":"举报对象类型","type":"string","require":{"define":true,"error":{"rc":10638},"mongoError":{"rc":20638,"msg":"举报对象类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10539},"mongoError":{"rc":20539,"msg":"举报对象的类型未知"}}},"name":{"chineseName":"举报图片名称","type":"string","require":{"define":true,"error":{"rc":10610},"mongoError":{"rc":20610,"msg":"举报图片名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,"error":{"rc":10616},"mongoError":{"rc":20616,"msg":"举报图片名必须由4-255个字符组成"}}},"hashName":{"chineseName":"举报图片名称","type":"string","require":{"define":true,"error":{"rc":10618},"mongoError":{"rc":20618,"msg":"举报图片名称不能为空"}},"format":{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10620},"mongoError":{"rc":20620,"msg":"hash名必须由35~36个字符组成"}}},"pathId":{"chineseName":"存储路径","type":"objectId","require":{"define":true,"error":{"rc":10622},"mongoError":{"rc":20622,"msg":"存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10624},"mongoError":{"rc":20624,"msg":"存储路径必须是objectId"}}},"sizeInMb":{"chineseName":"图片大小","type":"int","require":{"define":true,"error":{"rc":10626},"mongoError":{"rc":20626,"msg":"图片大小不能为空"}},"max":{"define":2,"error":{"rc":10628},"mongoError":{"rc":20628,"msg":"图片大小不能超过2MB"}}},"authorId":{"chineseName":"图片上传者","type":"objectId","require":{"define":true,"error":{"rc":10630},"mongoError":{"rc":20630,"msg":"图片上传者不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10632},"mongoError":{"rc":20632,"msg":"图片上传者必须是objectId"}}}},"like_dislike_static":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":11200},"mongoError":{"rc":21200,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":11202},"mongoError":{"rc":21202,"msg":"文档必须是objectId"}}}},"resource_profile_static":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":11210},"mongoError":{"rc":21210,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":11212},"mongoError":{"rc":21212,"msg":"用户必须是objectId"}}},"resourceProfileId":{"chineseName":"资源设定","type":"objectId","require":{"define":true,"error":{"rc":11214},"mongoError":{"rc":21214,"msg":"资源设定不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":11216},"mongoError":{"rc":21216,"msg":"资源设定必须是objectId"}}},"usedFileNum":{"chineseName":"已创建文件数量","type":"number","require":{"define":true,"error":{"rc":11218},"mongoError":{"rc":21218,"msg":"已创建文件数量不能为空"}}},"usedFileSize":{"chineseName":"已使用磁盘空间","type":"number","require":{"define":true,"error":{"rc":11220},"mongoError":{"rc":21220,"msg":"已使用磁盘空间不能为空"}}}},"sugar":{},"user":{"name":{"chineseName":"用户名","type":"string","require":{"define":true,"error":{"rc":10700},"mongoError":{"rc":20700,"msg":"用户名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10706},"mongoError":{"rc":20706,"msg":"用户名必须由2-20个字符组成"}}},"account":{"chineseName":"账号","type":"string","require":{"define":true,"error":{"rc":10708},"mongoError":{"rc":20708,"msg":"账号不能为空"}},"format":{"define":/^(([\w\u4e00-\u9fa5\-]+\.)*[\w\u4e00-\u9fa5\-]+@([\w\u4e00-\u9fa5\-]+\.)+[A-Za-z]+|1\d{10})$/,"error":{"rc":10714},"mongoError":{"rc":20714,"msg":"账号必须是手机号或者email"}}},"password":{"chineseName":"密码","type":"string","require":{"define":true,"error":{"rc":10724},"mongoError":{"rc":20724,"msg":"密码不能为空"}},"format":{"define":/^[0-9a-f]{64}$/,"error":{"rc":10725},"mongoError":{"rc":20725,"msg":"密码必须由64个字符组成"}}},"userType":{"chineseName":"用户类型","type":"string","require":{"define":true,"error":{"rc":10720},"mongoError":{"rc":20720,"msg":"用户类型不能为空"}},"enum":{"define":["1"],"error":{"rc":10722},"mongoError":{"rc":20722,"msg":"用户类型不正确"}}},"photoPathId":{"chineseName":"头像存储路径","type":"objectId","require":{"define":false,"error":{"rc":10726},"mongoError":{"rc":20726,"msg":"头像存储路径不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10727},"mongoError":{"rc":20727,"msg":"头像存储路径格式不正确"}}},"photoHashName":{"chineseName":"头像hash名","type":"string","require":{"define":false,"error":{"rc":10728},"mongoError":{"rc":20728,"msg":"头像hash名不能为空"}},"format":{"define":/^[0-9a-f]{32}\.(jpg|jpeg|png)$/,"error":{"rc":10729},"mongoError":{"rc":20729,"msg":"头像hash名由27~28个字符组成"}}},"docStatus":{"chineseName":"document状态","type":"string","require":{"define":true,"error":{"rc":10730},"mongoError":{"rc":20730,"msg":"document状态不能为空"}},"enum":{"define":["1","2","3"],"error":{"rc":10731},"mongoError":{"rc":20731,"msg":"document状态不是预定义的值"}}},"accountType":{"chineseName":"账号类型","type":"string","require":{"define":true,"error":{"rc":10732},"mongoError":{"rc":20732,"msg":"账号类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10733},"mongoError":{"rc":20733,"msg":"账号类型不是预定义的值"}}},"usedAccount":{"chineseName":"历史账号","type":["string"],"require":{"define":false,"error":{"rc":10734},"mongoError":{"rc":20734,"msg":"历史账号不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10735},"mongoError":{"rc":20135,"msg":"至少设置1个标签"}},"arrayMaxLength":{"define":10,"error":{"rc":10736},"mongoError":{"rc":20736,"msg":"最多保存10个历史账号"}}},"lastAccountUpdateDate":{"chineseName":"账号更改日期","type":"date","require":{"define":true,"error":{"rc":10737},"mongoError":{"rc":20737,"msg":"账号更改日期不能为空"}}},"lastSignInDate":{"chineseName":"上次登录时间","type":"date","require":{"define":true,"error":{"rc":10738},"mongoError":{"rc":20738,"msg":"上次登录时间不能为空"}}},"photoSize":{"chineseName":"头像大小","type":"number","require":{"define":false,"error":{"rc":10739},"mongoError":{"rc":20739,"msg":"头像大小不能为空"}}}},"user_resource_profile":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10760},"mongoError":{"rc":20760,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10762},"mongoError":{"rc":20762,"msg":"用户格式不正确"}}},"resource_profile_id":{"chineseName":"资源配置","type":"objectId","require":{"define":true,"error":{"rc":10764},"mongoError":{"rc":20764,"msg":"资源配置不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10766},"mongoError":{"rc":20766,"msg":"资源配置格式不正确"}}},"duration":{"chineseName":"资源配置有效期","type":"number","require":{"define":true,"error":{"rc":10768},"mongoError":{"rc":20768,"msg":"资源配置有效期不能为空"}},"min":{"define":0,"error":{"rc":10770},"mongoError":{"rc":20770,"msg":"源配置有效期最短1天"}},"max":{"define":365,"error":{"rc":10772},"mongoError":{"rc":20772,"msg":"源配置有效期最长1年"}}}},"read_article":{},"user_input_keyword":{},"collection":{"name":{"chineseName":"收藏夹名","type":"string","require":{"define":true,"error":{"rc":10860},"mongoError":{"rc":20860,"msg":"收藏夹名不能为空"}},"minLength":{"define":1,"error":{"rc":10862},"mongoError":{"rc":20862,"msg":"收藏夹名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10864},"mongoError":{"rc":20864,"msg":"收藏夹名的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"收藏文档","type":["objectId"],"require":{"define":false,"error":{"rc":10866},"mongoError":{"rc":20866,"msg":"收藏文档不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10868},"mongoError":{"rc":20868,"msg":"最多收藏100篇文档"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10870},"mongoError":{"rc":20870,"msg":"文档必须是objectId"}}},"topicsId":{"chineseName":"收藏系列","type":["objectId"],"require":{"define":false,"error":{"rc":10872},"mongoError":{"rc":20872,"msg":"系列不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10874},"mongoError":{"rc":20874,"msg":"最多收藏100个系列"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10876},"mongoError":{"rc":20876,"msg":"系列必须是objectId"}}},"creatorId":{"chineseName":"收藏夹创建人","type":"objectId","require":{"define":false,"error":{"rc":10878},"mongoError":{"rc":20878,"msg":"收藏夹创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10880},"mongoError":{"rc":20880,"msg":"收藏夹创建人必须是objectId"}}}},"recommend":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10800},"mongoError":{"rc":20800,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10802},"mongoError":{"rc":20802,"msg":"文档必须是objectId"}}},"toUserId":{"chineseName":"被荐人","type":["objectId"],"require":{"define":false,"error":{"rc":10803},"mongoError":{"rc":20803,"msg":"被荐人不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10804},"mongoError":{"rc":20804,"msg":"至少推荐给1个用户"}},"arrayMaxLength":{"define":5,"error":{"rc":10805},"mongoError":{"rc":20805,"msg":"最多推荐给5个用户"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10806},"mongoError":{"rc":20806,"msg":"被荐人必须是objectId"}}},"toGroupId":{"chineseName":"被荐朋友组","type":["objectId"],"require":{"define":false,"error":{"rc":10807},"mongoError":{"rc":20807,"msg":"被荐朋友组不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10808},"mongoError":{"rc":20808,"msg":"至少推荐给1个朋友组"}},"arrayMaxLength":{"define":5,"error":{"rc":10809},"mongoError":{"rc":20809,"msg":"最多推荐给5个朋友组"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10810},"mongoError":{"rc":20810,"msg":"被荐朋友组必须是objectId"}}},"toPublicGroupId":{"chineseName":"被荐群","type":["objectId"],"require":{"define":false,"error":{"rc":10811},"mongoError":{"rc":20811,"msg":"被荐群不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10812},"mongoError":{"rc":20812,"msg":"至少推荐给1个群"}},"arrayMaxLength":{"define":5,"error":{"rc":10813},"mongoError":{"rc":20813,"msg":"最多推荐给5个群"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10814},"mongoError":{"rc":20814,"msg":"被荐群必须是objectId"}}},"initiatorId":{"chineseName":"推荐人","type":"objectId","require":{"define":true,"error":{"rc":10816},"mongoError":{"rc":20816,"msg":"推荐人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10818},"mongoError":{"rc":20818,"msg":"推荐人必须是objectId"}}}},"topic":{"name":{"chineseName":"系列名","type":"string","require":{"define":true,"error":{"rc":10830},"mongoError":{"rc":20830,"msg":"系列名不能为空"}},"minLength":{"define":1,"error":{"rc":10832},"mongoError":{"rc":20832,"msg":"系列名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10834},"mongoError":{"rc":20834,"msg":"系列名的字符数不能超过50个字符"}}},"desc":{"chineseName":"系列描述","type":"string","require":{"define":true,"error":{"rc":10836},"mongoError":{"rc":20836,"msg":"系列描述不能为空"}},"minLength":{"define":1,"error":{"rc":10838},"mongoError":{"rc":20838,"msg":"系列描述至少1个字符"}},"maxLength":{"define":140,"error":{"rc":10840},"mongoError":{"rc":20840,"msg":"系列描述包含的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"系列文档","type":["objectId"],"require":{"define":false,"error":{"rc":10842},"mongoError":{"rc":20842,"msg":"系列文档不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10844},"mongoError":{"rc":20844,"msg":"最多设置10篇文档"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10846},"mongoError":{"rc":20846,"msg":"文档必须是objectId"}}},"creatorId":{"chineseName":"创建人","type":"objectId","require":{"define":false,"error":{"rc":10848},"mongoError":{"rc":20848,"msg":"创建人不能为空"}},"format":{"define":/^[0-9a-f]{24}$/,"error":{"rc":10850},"mongoError":{"rc":20850,"msg":"创建人必须是objectId"}}}}}

module.exports={
    inputRule
}
