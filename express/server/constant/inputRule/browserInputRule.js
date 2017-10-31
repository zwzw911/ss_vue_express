/*    gene by H:\ss_vue_express\server_common\maintain\generateFunction\generateAllRuleInOneFile.js     */ 
 
    "use strict"

const browserInputRule={"admin_penalize":{"punishedId":{"chineseName":"受罚人","type":"objectId","require":{"define":true,"error":{"rc":10080},"mongoError":{"rc":20080,"msg":"受罚人不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10081},"mongoError":{"rc":20081,"msg":"受罚人格式不正确"}}},"reason":{"chineseName":"受罚原因","type":"string","require":{"define":true,"error":{"rc":10082},"mongoError":{"rc":20082,"msg":"受罚原因不能为空"}},"minLength":{"define":15,"error":{"rc":10083},"mongoError":{"rc":20083,"msg":"受罚原因至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10084},"mongoError":{"rc":20084,"msg":"受罚原因的字数不能超过1000个字符"}}},"penalizeType":{"chineseName":"受罚类型","type":"string","require":{"define":true,"error":{"rc":10085},"mongoError":{"rc":20085,"msg":"受罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10086},"mongoError":{"rc":20086,"msg":"受罚类型不正确"}}},"penalizeSubType":{"chineseName":"受罚子类型","type":"string","require":{"define":true,"error":{"rc":10087},"mongoError":{"rc":20087,"msg":"受罚子类型不能为空"}},"enum":{"define":["1","2","3","4","9"],"error":{"rc":10088},"mongoError":{"rc":20088,"msg":"受罚子类型不正确"}}},"duration":{"chineseName":"受罚时长","type":"int","require":{"define":true,"error":{"rc":10089},"mongoError":{"rc":20089,"msg":"受罚时长不能为空"}},"min":{"define":0,"error":{"rc":10090},"mongoError":{"rc":20090,"msg":"受罚时长至少1天"}},"max":{"define":30,"error":{"rc":10091},"mongoError":{"rc":20091,"msg":"受罚时长最长30天"}}},"revokeReason":{"chineseName":"撤销原因","type":"string","require":{"define":false,"error":{"rc":10092},"mongoError":{"rc":20092,"msg":"撤销原因不能为空"}},"minLength":{"define":15,"error":{"rc":10093},"mongoError":{"rc":20093,"msg":"撤销原因至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10094},"mongoError":{"rc":20094,"msg":"撤销原因原因的字数不能超过1000个字符"}}}},"category":{"name":{"chineseName":"分类名称","type":"string","require":{"define":true,"error":{"rc":10050},"mongoError":{"rc":20050,"msg":"分类名不能为空"}},"minLength":{"define":2,"error":{"rc":10052},"mongoError":{"rc":20052,"msg":"分类名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10054},"mongoError":{"rc":20054,"msg":"分类名的长度不能超过50个字符"}}},"parentCategoryId":{"chineseName":"上级分类","type":"objectId","require":{"define":false,"error":{"rc":10056},"mongoError":{"rc":20056,"msg":"上级分类不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10058},"mongoError":{"rc":20058,"msg":"上级分类必须是objectId"}}}},"resource_profile":{"name":{"chineseName":"资源配置名称","type":"string","require":{"define":true,"error":{"rc":11100},"mongoError":{"rc":21100,"msg":"资源配置名称不能为空"}},"minLength":{"define":2,"error":{"rc":11102},"mongoError":{"rc":21102,"msg":"资源配置名称至少2个字符"}},"maxLength":{"define":50,"error":{"rc":11104},"mongoError":{"rc":21104,"msg":"资源配置名称的长度不能超过50个字符"}}},"range":{"chineseName":"资源配置范围","type":"string","require":{"define":true,"error":{"rc":11106},"mongoError":{"rc":21106,"msg":"资源配置范围不能为空"}},"enum":{"define":["1","2","3","4"],"error":{"rc":11107},"mongoError":{"rc":21107,"msg":"资源配置范围的类型不正确"}}},"type":{"chineseName":"资源配置类型","type":"string","require":{"define":true,"error":{"rc":11108},"mongoError":{"rc":21108,"msg":"资源配置类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":11109},"mongoError":{"rc":21109,"msg":"资源配置类型的值类型不正确"}}},"maxFileNum":{"chineseName":"最大文件数量","type":"number","require":{"define":true,"error":{"rc":11110},"mongoError":{"rc":21110,"msg":"最大文件数量不能为空"}}},"totalFileSizeInMb":{"chineseName":"最大存储空间","type":"number","require":{"define":true,"error":{"rc":11112},"mongoError":{"rc":21112,"msg":"最大存储空间不能为空"}}}},"store_path":{"name":{"chineseName":"存储路径名称","type":"string","require":{"define":true,"error":{"rc":10060},"mongoError":{"rc":20060,"msg":"存储路径名称不能为空"}},"minLength":{"define":2,"error":{"rc":10062},"mongoError":{"rc":20062,"msg":"存储路径名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10064},"mongoError":{"rc":20064,"msg":"存储路径名称的长度不能超过50个字符"}}},"path":{"chineseName":"存储路径","type":"folder","require":{"define":true,"error":{"rc":10066},"mongoError":{"rc":20066,"msg":"存储路径不能为空"}}},"usage":{"chineseName":"用途","type":"string","require":{"define":true,"error":{"rc":10068},"mongoError":{"rc":20068,"msg":"存储路径用途不能为空"}},"enum":{"define":["1","2","3","4","5"],"error":{"rc":10069},"mongoError":{"rc":20069,"msg":"储路径用途的类型不正确"}}},"sizeInKb":{"chineseName":"容量","type":"number","require":{"define":true,"error":{"rc":10070},"mongoError":{"rc":20070,"msg":"容量不能为空"}},"max":{"define":1000000,"error":{"rc":10071},"mongoError":{"rc":20071,"msg":"容量最多1000M"}}},"lowThreshold":{"chineseName":"容量下限值","type":"number","require":{"define":true,"error":{"rc":10072},"mongoError":{"rc":20072,"msg":"容量下限值不能为空"}},"min":{"define":50,"error":{"rc":10073},"mongoError":{"rc":20073,"msg":"容量下限值至少50%"}},"max":{"define":80,"error":{"rc":10074},"mongoError":{"rc":20074,"msg":"容量门限报警值最多95%"}}},"highThreshold":{"chineseName":"容量上限值","type":"number","require":{"define":true,"error":{"rc":10075},"mongoError":{"rc":20075,"msg":"容量上限值不能为空"}},"min":{"define":60,"error":{"rc":10076},"mongoError":{"rc":20076,"msg":"容量上限值至少60%"}},"max":{"define":95,"error":{"rc":10077},"mongoError":{"rc":20077,"msg":"容量上限值最多95%"}}}},"article":{"name":{"chineseName":"文档名","type":"string","require":{"define":true,"error":{"rc":10100},"mongoError":{"rc":20000,"msg":"文档名不能为空"}},"maxLength":{"define":50,"error":{"rc":10104},"mongoError":{"rc":20104,"msg":"文档名的长度不能超过50个字符"}}},"status":{"chineseName":"文档状态","type":"string","require":{"define":true,"error":{"rc":10106},"mongoError":{"rc":20106,"msg":"文档状态不能为空"}},"enum":{"define":["0","1","2"],"error":{"rc":10108},"mongoError":{"rc":20108,"msg":"文档状态不正确"}}},"folderId":{"chineseName":"文档目录","type":"objectId","require":{"define":true,"error":{"rc":10110},"mongoError":{"rc":20110,"msg":"文档目录不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10112},"mongoError":{"rc":20112,"msg":"文档目录必须是objectId"}}},"htmlContent":{"chineseName":"文档内容","type":"string","require":{"define":true,"error":{"rc":10114},"mongoError":{"rc":20114,"msg":"文档内容不能为空"}},"minLength":{"define":15,"error":{"rc":10116},"mongoError":{"rc":20116,"msg":"文档内容至少15个字符"}},"maxLength":{"define":50000,"error":{"rc":10118},"mongoError":{"rc":20118,"msg":"文档内容的长度不能超过50000个字符"}}},"tags":{"chineseName":"文档标签","type":["string"],"require":{"define":false,"error":{"rc":10120},"mongoError":{"rc":20120,"msg":"文档标签不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10122},"mongoError":{"rc":20122,"msg":"至少设置1个标签"}},"arrayMaxLength":{"define":5,"error":{"rc":10123},"mongoError":{"rc":20123,"msg":"最多设置5标签"}},"minLength":{"define":2,"error":{"rc":10123},"mongoError":{"rc":20123,"msg":"文档标签至少2个字符"}},"maxLength":{"define":20,"error":{"rc":10124},"mongoError":{"rc":20124,"msg":"文档标签的长度不能超过20个字符"}}},"categoryId":{"chineseName":"分类","type":"objectId","require":{"define":true,"error":{"rc":10130},"mongoError":{"rc":20130,"msg":"文档分类不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10132},"mongoError":{"rc":20132,"msg":"文档分类必须是objectId"}}}},"article_attachment":{},"article_comment":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10170},"mongoError":{"rc":20170,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10172},"mongoError":{"rc":20172,"msg":"文档必须是objectId"}}},"content":{"chineseName":"评论内容","type":"string","require":{"define":true,"error":{"rc":10174},"mongoError":{"rc":10174,"msg":"评论内容不能为空"}},"minLength":{"define":15,"error":{"rc":10176},"mongoError":{"rc":10176,"msg":"评论内容至少15个字符"}},"maxLength":{"define":255,"error":{"rc":10178},"mongoError":{"rc":10178,"msg":"评论内容不能超过255个字符"}}}},"article_image":{},"folder":{"name":{"chineseName":"目录名称","type":"string","require":{"define":true,"error":{"rc":10190},"mongoError":{"rc":20190,"msg":"目录名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,255}$/,"error":{"rc":10196},"mongoError":{"rc":20196,"msg":"目录名必须由1-255个字符组成"}}},"parentFolderId":{"chineseName":"上级目录","type":"objectId","require":{"define":false,"error":{"rc":10198},"mongoError":{"rc":20198,"msg":"上级目录不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10200},"mongoError":{"rc":20200,"msg":"上级目录必须是objectId"}}}},"like_dislike":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10210},"mongoError":{"rc":20210,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10212},"mongoError":{"rc":20212,"msg":"文档必须是objectId"}}},"like":{"chineseName":"喜欢","type":"boolean","require":{"define":true,"error":{"rc":10218},"mongoError":{"rc":20218,"msg":"喜欢不能为空"}}}},"tag":{"name":{"chineseName":"标签名称","type":"string","require":{"define":true,"error":{"rc":10220},"mongoError":{"rc":20220,"msg":"标签名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10226},"mongoError":{"rc":20226,"msg":"标签名必须由2-20个字符组成"}}}},"member_penalize":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10300},"mongoError":{"rc":20300,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10302},"mongoError":{"rc":20302,"msg":"群必须是objectId"}}},"memberId":{"chineseName":"成员","type":"objectId","require":{"define":true,"error":{"rc":10304},"mongoError":{"rc":20304,"msg":"成员不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10306},"mongoError":{"rc":20306,"msg":"成员必须是objectId"}}},"penalizeType":{"chineseName":"处罚类型","type":"string","require":{"define":true,"error":{"rc":10308},"mongoError":{"rc":20308,"msg":"处罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10310},"mongoError":{"rc":20310,"msg":"未知处罚类型"}}},"duration":{"chineseName":"处罚时间","type":"int","require":{"define":true,"error":{"rc":10312},"mongoError":{"rc":20312,"msg":"处罚时间不能为空"}},"min":{"define":1,"error":{"rc":10314},"mongoError":{"rc":20314,"msg":"处罚时间最少1天"}},"max":{"define":30,"error":{"rc":10316},"mongoError":{"rc":20316,"msg":"处罚时间最多30天"}}}},"public_group":{"name":{"chineseName":"群名称","type":"string","require":{"define":true,"error":{"rc":10330},"mongoError":{"rc":20330,"msg":"群名称不能为空"}},"minLength":{"define":1,"error":{"rc":10332},"mongoError":{"rc":20332,"msg":"群名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10334},"mongoError":{"rc":20334,"msg":"群名称的长度不能超过20个字符"}}},"memberId":{"chineseName":"群成员","type":["objectId"],"require":{"define":false,"error":{"rc":10336},"mongoError":{"rc":20336,"msg":"群成员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10338},"mongoError":{"rc":20338,"msg":"群至少有一个成员"}},"arrayMaxLength":{"define":200,"error":{"rc":10340},"mongoError":{"rc":20340,"msg":"群最多有200个成员"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10342},"mongoError":{"rc":20342,"msg":"群成员必须是objectId"}}},"adminId":{"chineseName":"群管理员","type":["objectId"],"require":{"define":true,"error":{"rc":10344},"mongoError":{"rc":20344,"msg":"群管理员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10346},"mongoError":{"rc":20346,"msg":"群管理员至少有一个成员"}},"arrayMaxLength":{"define":10,"error":{"rc":10348},"mongoError":{"rc":20348,"msg":"群最多有10个群管理员"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10350},"mongoError":{"rc":20350,"msg":"群管理员必须是objectId"}}},"joinInRule":{"chineseName":"新成员加入规则","type":"string","require":{"define":true,"error":{"rc":10352},"mongoError":{"rc":20352,"msg":"新成员加入规则不能为空"}},"enum":{"define":["0","1"],"error":{"rc":10354},"mongoError":{"rc":20354,"msg":"新成员加入规则不正确"}}}},"public_group_event":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10360},"mongoError":{"rc":20360,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10362},"mongoError":{"rc":20362,"msg":"群必须是objectId"}}},"eventType":{"chineseName":"群事件类型","type":"string","require":{"define":true,"error":{"rc":10364},"mongoError":{"rc":20364,"msg":"群事件类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10366},"mongoError":{"rc":20366,"msg":"未知群事件类型"}}},"targetId":{"chineseName":"事件接收者","type":"objectId","require":{"define":false,"error":{"rc":10368},"mongoError":{"rc":20368,"msg":"事件接收者不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10370},"mongoError":{"rc":20370,"msg":"事件接收者必须是objectId"}}},"status":{"chineseName":"事件状态","type":"string","require":{"define":true,"error":{"rc":10372},"mongoError":{"rc":20372,"msg":"事件状态不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10374},"mongoError":{"rc":20374,"msg":"未知事件状态"}}}},"public_group_interaction":{"publicGroupId":{"chineseName":"群","type":"objectId","require":{"define":true,"error":{"rc":10390},"mongoError":{"rc":20390,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10392},"mongoError":{"rc":20392,"msg":"群必须是objectId"}}},"content":{"chineseName":"群发言内容","type":"string","require":{"define":true,"error":{"rc":10394},"mongoError":{"rc":20394,"msg":"群发言内容不能为空"}},"minLength":{"define":15,"error":{"rc":10396},"mongoError":{"rc":20396,"msg":"群发言内容至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10398},"mongoError":{"rc":20398,"msg":"群发言内容的长度不能超过1000个字符"}}}},"user_friend_group":{"name":{"chineseName":"朋友分组","type":"string","require":{"define":true,"error":{"rc":10410},"mongoError":{"rc":20410,"msg":"朋友分组名不能为空"}},"minLength":{"define":1,"error":{"rc":10412},"mongoError":{"rc":20412,"msg":"朋友分组名至少1个字符"}},"maxLength":{"define":20,"error":{"rc":10414},"mongoError":{"rc":20414,"msg":"朋友分组名的长度不能超过20个字符"}}},"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10416},"mongoError":{"rc":20416,"msg":"文档目录不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10418},"mongoError":{"rc":20418,"msg":"文档目录必须是objectId"}}},"friendsInGroup":{"chineseName":"好友分组","type":["objectId"],"require":{"define":false,"error":{"rc":10420},"mongoError":{"rc":20420,"msg":"好友分组不能为空"}},"arrayMaxLength":{"define":500,"error":{"rc":10422},"mongoError":{"rc":20422,"msg":"好友分组最多包含500个好友"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10424},"mongoError":{"rc":20424,"msg":"好友必须是objectId"}}}},"user_public_group":{},"impeach":{"title":{"chineseName":"举报名","type":"string","require":{"define":true,"error":{"rc":10500},"mongoError":{"rc":20500,"msg":"举报名不能为空"}},"minLength":{"define":2,"error":{"rc":10502},"mongoError":{"rc":20502,"msg":"举报名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10504},"mongoError":{"rc":20504,"msg":"举报名的长度不能超过50个字符"}}},"content":{"chineseName":"举报内容","type":"string","require":{"define":true,"error":{"rc":10506},"mongoError":{"rc":20506,"msg":"举报内容不能为空"}},"minLength":{"define":5,"error":{"rc":10508},"mongoError":{"rc":20508,"msg":"举报内容至少5个字符"}},"maxLength":{"define":1999,"error":{"rc":10510},"mongoError":{"rc":20510,"msg":"举报内容的长度不能超过1999个字符"}}},"impeachedArticleId":{"chineseName":"举报的文档","type":"objectId","require":{"define":false,"error":{"rc":10512},"mongoError":{"rc":20512,"msg":"举报的文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10514},"mongoError":{"rc":20514,"msg":"举报的文档必须是objectId"}}},"impeachedCommentId":{"chineseName":"举报的评论","type":"objectId","require":{"define":false,"error":{"rc":10516,"mongoError":{"rc":20516,"msg":"举报的评论不能为空"}},"format":{"define":{},"error":{"rc":10518},"mongoError":{"rc":20518,"msg":"举报的评论必须是objectId"}}}}},"impeach_action":{"impeachId":{"chineseName":"举报","type":"objectId","require":{"define":true,"error":{"rc":10590},"mongoError":{"rc":20590,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10592},"mongoError":{"rc":20592,"msg":"举报必须是objectId"}}},"adminOwnerId":{"chineseName":"处理人","type":"objectId","require":{"define":false,"error":{"rc":10594},"mongoError":{"rc":20594,"msg":"处理人不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10596},"mongoError":{"rc":20596,"msg":"处理人必须是objectId"}}},"action":{"chineseName":"操作","type":"string","require":{"define":true,"error":{"rc":10598},"mongoError":{"rc":20598,"msg":"操作不能为空"}},"enum":{"define":["1","2","3","4","5","6","7"],"error":{"rc":10092},"mongoError":{"rc":20092,"msg":"未知操作"}}}},"impeach_attachment":{},"impeach_comment":{"impeachId":{"chineseName":"举报","type":"objectId","require":{"define":true,"error":{"rc":10560},"mongoError":{"rc":20560,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10562},"mongoError":{"rc":20562,"msg":"举报必须是objectId"}}},"content":{"chineseName":"评论内容","type":"string","require":{"define":true,"error":{"rc":10564},"mongoError":{"rc":20564,"msg":"评论内容不能为空"}},"minLength":{"define":15,"error":{"rc":10566},"mongoError":{"rc":20566,"msg":"评论内容至少15个字符"}},"maxLength":{"define":140,"error":{"rc":10568},"mongoError":{"rc":20568,"msg":"评论内容不能超过140个字符"}}}},"impeach_image":{"referenceId":{"chineseName":"举报对象","type":"objectId","require":{"define":true,"error":{"rc":10634},"mongoError":{"rc":20634,"msg":"举报对象不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10636},"mongoError":{"rc":20636,"msg":"举报对象必须是objectId"}}},"referenceColl":{"chineseName":"举报对象类型","type":"string","require":{"define":true,"error":{"rc":10638},"mongoError":{"rc":20638,"msg":"举报对象类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10539},"mongoError":{"rc":20539,"msg":"举报对象的类型未知"}}}},"like_dislike_static":{},"resource_profile_static":{},"sugar":{},"user":{"name":{"chineseName":"用户名","type":"string","require":{"define":true,"error":{"rc":10700},"mongoError":{"rc":20700,"msg":"用户名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10706},"mongoError":{"rc":20706,"msg":"用户名必须由2-20个字符组成"}}},"account":{"chineseName":"账号","type":"string","require":{"define":true,"error":{"rc":10708},"mongoError":{"rc":20708,"msg":"账号不能为空"}},"format":{"define":/^(([\w\u4e00-\u9fa5\-]+\.)*[\w\u4e00-\u9fa5\-]+@([\w\u4e00-\u9fa5\-]+\.)+[A-Za-z]+|1\d{10})$/,"error":{"rc":10714},"mongoError":{"rc":20714,"msg":"账号必须是手机号或者email"}}},"password":{"chineseName":"密码","type":"string","require":{"define":true,"error":{"rc":10716},"mongoError":{"rc":20716,"msg":"密码不能为空"}},"format":{"define":/^[A-Za-z0-9~`!@#%&)(_=}{:\"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,"error":{"rc":10718},"mongoError":{"rc":20718,"msg":"密码必须由6-20个字符组成"}}},"userType":{"chineseName":"用户类型","type":"string","require":{"define":true,"error":{"rc":10720},"mongoError":{"rc":20720,"msg":"用户类型不能为空"}},"enum":{"define":["10"],"error":{"rc":10722},"mongoError":{"rc":20722,"msg":"用户类型不正确"}}}},"user_resource_profile":{"userId":{"chineseName":"用户","type":"objectId","require":{"define":true,"error":{"rc":10760},"mongoError":{"rc":20760,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10762},"mongoError":{"rc":20762,"msg":"用户格式不正确"}}},"resource_profile_id":{"chineseName":"资源配置","type":"objectId","require":{"define":true,"error":{"rc":10764},"mongoError":{"rc":20764,"msg":"资源配置不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10766},"mongoError":{"rc":20766,"msg":"资源配置格式不正确"}}},"duration":{"chineseName":"资源配置有效期","type":"number","require":{"define":true,"error":{"rc":10768},"mongoError":{"rc":20768,"msg":"资源配置有效期不能为空"}},"min":{"define":0,"error":{"rc":10770},"mongoError":{"rc":20770,"msg":"源配置有效期最短1天"}},"max":{"define":365,"error":{"rc":10772},"mongoError":{"rc":20772,"msg":"源配置有效期最长1年"}}}},"read_article":{},"user_input_keyword":{},"collection":{"name":{"chineseName":"收藏夹名","type":"string","require":{"define":true,"error":{"rc":10860},"mongoError":{"rc":20860,"msg":"收藏夹名不能为空"}},"minLength":{"define":1,"error":{"rc":10862},"mongoError":{"rc":20862,"msg":"收藏夹名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10864},"mongoError":{"rc":20864,"msg":"收藏夹名的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"收藏文档","type":["objectId"],"require":{"define":false,"error":{"rc":10866},"mongoError":{"rc":20866,"msg":"收藏文档不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10868},"mongoError":{"rc":20868,"msg":"最多收藏100篇文档"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10870},"mongoError":{"rc":20870,"msg":"文档必须是objectId"}}},"topicsId":{"chineseName":"收藏系列","type":["objectId"],"require":{"define":false,"error":{"rc":10872},"mongoError":{"rc":20872,"msg":"系列不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10874},"mongoError":{"rc":20874,"msg":"最多收藏100个系列"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10876},"mongoError":{"rc":20876,"msg":"系列必须是objectId"}}}},"recommend":{"articleId":{"chineseName":"文档","type":"objectId","require":{"define":true,"error":{"rc":10800},"mongoError":{"rc":20800,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10802},"mongoError":{"rc":20802,"msg":"文档必须是objectId"}}},"toUserId":{"chineseName":"被荐人","type":["objectId"],"require":{"define":false,"error":{"rc":10803},"mongoError":{"rc":20803,"msg":"被荐人不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10804},"mongoError":{"rc":20804,"msg":"至少推荐给1个用户"}},"arrayMaxLength":{"define":5,"error":{"rc":10805},"mongoError":{"rc":20805,"msg":"最多推荐给5个用户"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10806},"mongoError":{"rc":20806,"msg":"被荐人必须是objectId"}}},"toGroupId":{"chineseName":"被荐朋友组","type":["objectId"],"require":{"define":false,"error":{"rc":10807},"mongoError":{"rc":20807,"msg":"被荐朋友组不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10808},"mongoError":{"rc":20808,"msg":"至少推荐给1个朋友组"}},"arrayMaxLength":{"define":5,"error":{"rc":10809},"mongoError":{"rc":20809,"msg":"最多推荐给5个朋友组"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10810},"mongoError":{"rc":20810,"msg":"被荐朋友组必须是objectId"}}},"toPublicGroupId":{"chineseName":"被荐群","type":["objectId"],"require":{"define":false,"error":{"rc":10811},"mongoError":{"rc":20811,"msg":"被荐群不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10812},"mongoError":{"rc":20812,"msg":"至少推荐给1个群"}},"arrayMaxLength":{"define":5,"error":{"rc":10813},"mongoError":{"rc":20813,"msg":"最多推荐给5个群"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10814},"mongoError":{"rc":20814,"msg":"被荐群必须是objectId"}}}},"topic":{"name":{"chineseName":"系列名","type":"string","require":{"define":true,"error":{"rc":10830},"mongoError":{"rc":20830,"msg":"系列名不能为空"}},"minLength":{"define":1,"error":{"rc":10832},"mongoError":{"rc":20832,"msg":"系列名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10834},"mongoError":{"rc":20834,"msg":"系列名的字符数不能超过50个字符"}}},"desc":{"chineseName":"系列描述","type":"string","require":{"define":true,"error":{"rc":10836},"mongoError":{"rc":20836,"msg":"系列描述不能为空"}},"minLength":{"define":1,"error":{"rc":10838},"mongoError":{"rc":20838,"msg":"系列描述至少1个字符"}},"maxLength":{"define":140,"error":{"rc":10840},"mongoError":{"rc":20840,"msg":"系列描述包含的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"系列文档","type":["objectId"],"require":{"define":false,"error":{"rc":10842},"mongoError":{"rc":20842,"msg":"系列文档不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10844},"mongoError":{"rc":20844,"msg":"最多设置10篇文档"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10846},"mongoError":{"rc":20846,"msg":"文档必须是objectId"}}}}}

module.exports={
    browserInputRule
}
