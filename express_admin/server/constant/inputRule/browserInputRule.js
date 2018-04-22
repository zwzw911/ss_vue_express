/*    gene by D:\ss_vue_express\server_common\maintain\generateFunction\generateAllRuleInOneFile.js     */ 
 
    "use strict"

const browserInputRule={"admin_penalize":{"punishedId":{"chineseName":"受罚人","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10080,"msg":"受罚人不能为空"},"mongoError":{"rc":20080,"msg":"受罚人不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10081,"msg":"受罚人格式不正确"},"mongoError":{"rc":20081,"msg":"受罚人格式不正确"}}},"reason":{"chineseName":"受罚原因","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10082,"msg":"受罚原因不能为空"},"mongoError":{"rc":20082,"msg":"受罚原因不能为空"}},"minLength":{"define":15,"error":{"rc":10083,"msg":"受罚原因至少15个字符"},"mongoError":{"rc":20083,"msg":"受罚原因至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10084,"msg":"受罚原因的字数不能超过1000个字符"},"mongoError":{"rc":20084,"msg":"受罚原因的字数不能超过1000个字符"}}},"penalizeType":{"chineseName":"受罚类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10085,"msg":"受罚类型不能为空"},"mongoError":{"rc":20085,"msg":"受罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5","7","8","9","10"],"error":{"rc":10086,"msg":"受罚类型不正确"},"mongoError":{"rc":20086,"msg":"受罚类型不正确"}}},"penalizeSubType":{"chineseName":"受罚子类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10087,"msg":"受罚子类型不能为空"},"mongoError":{"rc":20087,"msg":"受罚子类型不能为空"}},"enum":{"define":["1","2","3","4","9"],"error":{"rc":10088,"msg":"受罚子类型不正确"},"mongoError":{"rc":20088,"msg":"受罚子类型不正确"}}},"duration":{"chineseName":"受罚时长","dataType":"int","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10089,"msg":"受罚时长不能为空"},"mongoError":{"rc":20089,"msg":"受罚时长不能为空"}},"min":{"define":0,"error":{"rc":10090,"msg":"受罚时长至少1天"},"mongoError":{"rc":20090,"msg":"受罚时长至少1天"}},"max":{"define":30,"error":{"rc":10091,"msg":"受罚时长最长30天"},"mongoError":{"rc":20091,"msg":"受罚时长最长30天"}}},"revokeReason":{"chineseName":"撤销原因","dataType":"string","applyRange":["delete"],"require":{"define":{"delete":true},"error":{"rc":10092,"msg":"撤销原因不能为空"},"mongoError":{"rc":20092,"msg":"撤销原因不能为空"}},"minLength":{"define":15,"error":{"rc":10093,"msg":"撤销原因至少15个字符"},"mongoError":{"rc":20093,"msg":"撤销原因至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10094,"msg":"撤销原因原因的字数不能超过1000个字符"},"mongoError":{"rc":20094,"msg":"撤销原因原因的字数不能超过1000个字符"}}}},"admin_sugar":{},"admin_user":{"name":{"chineseName":"用户名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10000,"msg":"用户名不能为空"},"mongoError":{"rc":20000,"msg":"用户名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10002,"msg":"用户名必须由2-20个字符组成"},"mongoError":{"rc":20002,"msg":"用户名必须由2-20个字符组成"}}},"password":{"chineseName":"密码","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10006,"msg":"密码不能为空"},"mongoError":{"rc":20006,"msg":"密码不能为空"}},"format":{"define":/^[A-Za-z0-9~`!@#%&)(_=}{:\"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,"error":{"rc":10012,"msg":"密码必须由6-20个字符组成"},"mongoError":{"rc":20012,"msg":"密码必须由6-20个字符组成"}}},"userType":{"chineseName":"管理员类型","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10014,"msg":"管理员类型不能为空"},"mongoError":{"rc":20014,"msg":"管理员类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10016,"msg":"管理员类型不正确"},"mongoError":{"rc":20016,"msg":"管理员类型不正确"}}},"userPriority":{"chineseName":"用户权限","dataType":["string"],"applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10018,"msg":"用户权限不能为空"},"mongoError":{"rc":20018,"msg":"用户权限不能为空"}},"enum":{"define":["1","2","3","10","11","12","20","21"],"error":{"rc":10020,"msg":"用户权限不正确"},"mongoError":{"rc":20020,"msg":"用户权限不正确"}},"arrayMinLength":{"define":1,"error":{"rc":10021,"msg":"至少拥有1个权限"},"mongoError":{"rc":20021,"msg":"至少拥有1个权限"}},"arrayMaxLength":{"define":8,"error":{"rc":10022,"msg":"最多拥有8个权限"},"mongoError":{"rc":20022,"msg":"最多拥有8个权限"}}}},"category":{"name":{"chineseName":"分类名称","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10050,"msg":"分类名不能为空"},"mongoError":{"rc":20050,"msg":"分类名不能为空"}},"minLength":{"define":2,"error":{"rc":10052,"msg":"分类名至少2个字符"},"mongoError":{"rc":20052,"msg":"分类名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10054,"msg":"分类名的长度不能超过50个字符"},"mongoError":{"rc":20054,"msg":"分类名的长度不能超过50个字符"}}},"parentCategoryId":{"chineseName":"上级分类","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10056,"msg":"上级分类不能为空"},"mongoError":{"rc":20056,"msg":"上级分类不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10058,"msg":"上级分类必须是objectId"},"mongoError":{"rc":20058,"msg":"上级分类必须是objectId"}}}},"resource_profile":{"name":{"chineseName":"资源配置名称","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":11100,"msg":"资源配置名称不能为空"},"mongoError":{"rc":21100,"msg":"资源配置名称不能为空"}},"minLength":{"define":2,"error":{"rc":11102,"msg":"资源配置名称至少2个字符"},"mongoError":{"rc":21102,"msg":"资源配置名称至少2个字符"}},"maxLength":{"define":50,"error":{"rc":11104,"msg":"资源配置名称的长度不能超过50个字符"},"mongoError":{"rc":21104,"msg":"资源配置名称的长度不能超过50个字符"}}},"range":{"chineseName":"资源配置范围","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":11106,"msg":"资源配置范围不能为空"},"mongoError":{"rc":21106,"msg":"资源配置范围不能为空"}},"enum":{"define":["1","2","3","5","7"],"error":{"rc":11107,"msg":"资源配置范围的类型不正确"},"mongoError":{"rc":21107,"msg":"资源配置范围的类型不正确"}}},"type":{"chineseName":"资源配置类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":11108,"msg":"资源配置类型不能为空"},"mongoError":{"rc":21108,"msg":"资源配置类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":11109,"msg":"资源配置类型的值类型不正确"},"mongoError":{"rc":21109,"msg":"资源配置类型的值类型不正确"}}},"maxFileNum":{"chineseName":"最大文件数量","dataType":"number","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":11110,"msg":"最大文件数量不能为空"},"mongoError":{"rc":21110,"msg":"最大文件数量不能为空"}}},"totalFileSizeInMb":{"chineseName":"最大存储空间","dataType":"number","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":11112,"msg":"最大存储空间不能为空"},"mongoError":{"rc":21112,"msg":"最大存储空间不能为空"}}}},"store_path":{"name":{"chineseName":"存储路径名称","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10060,"msg":"存储路径名称不能为空"},"mongoError":{"rc":20060,"msg":"存储路径名称不能为空"}},"minLength":{"define":2,"error":{"rc":10062,"msg":"存储路径名称至少1个字符"},"mongoError":{"rc":20062,"msg":"存储路径名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10064,"msg":"存储路径名称的长度不能超过50个字符"},"mongoError":{"rc":20064,"msg":"存储路径名称的长度不能超过50个字符"}}},"path":{"chineseName":"存储路径","dataType":"folder","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10066,"msg":"存储路径不能为空"},"mongoError":{"rc":20066,"msg":"存储路径不能为空"}}},"usage":{"chineseName":"用途","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10068,"msg":"存储路径用途不能为空"},"mongoError":{"rc":20068,"msg":"存储路径用途不能为空"}},"enum":{"define":["1","2","3","4","5"],"error":{"rc":10069,"msg":"储路径用途的类型不正确"},"mongoError":{"rc":20069,"msg":"储路径用途的类型不正确"}}},"sizeInKb":{"chineseName":"容量","dataType":"number","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10070,"msg":"容量不能为空"},"mongoError":{"rc":20070,"msg":"容量不能为空"}},"max":{"define":1000000,"error":{"rc":10071,"msg":"容量最多1000M"},"mongoError":{"rc":20071,"msg":"容量最多1000M"}}},"lowThreshold":{"chineseName":"容量下限值","dataType":"number","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10072,"msg":"容量下限值不能为空"},"mongoError":{"rc":20072,"msg":"容量下限值不能为空"}},"min":{"define":50,"error":{"rc":10073,"msg":"容量下限值至少50%"},"mongoError":{"rc":20073,"msg":"容量下限值至少50%"}},"max":{"define":80,"error":{"rc":10074,"msg":"容量门限报警值最多95%"},"mongoError":{"rc":20074,"msg":"容量门限报警值最多95%"}}},"highThreshold":{"chineseName":"容量上限值","dataType":"number","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10075,"msg":"容量上限值不能为空"},"mongoError":{"rc":20075,"msg":"容量上限值不能为空"}},"min":{"define":60,"error":{"rc":10076,"msg":"容量上限值至少60%"},"mongoError":{"rc":20076,"msg":"容量上限值至少60%"}},"max":{"define":95,"error":{"rc":10077,"msg":"容量上限值最多95%"},"mongoError":{"rc":20077,"msg":"容量上限值最多95%"}}}},"article":{"name":{"chineseName":"文档名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10100,"msg":"文档名不能为空"},"mongoError":{"rc":20000,"msg":"文档名不能为空"}},"maxLength":{"define":50,"error":{"rc":10104,"msg":"文档名的长度不能超过50个字符"},"mongoError":{"rc":20104,"msg":"文档名的长度不能超过50个字符"}}},"status":{"chineseName":"文档状态","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10106,"msg":"文档状态不能为空"},"mongoError":{"rc":20106,"msg":"文档状态不能为空"}},"enum":{"define":["0","1","2"],"error":{"rc":10108,"msg":"文档状态不正确"},"mongoError":{"rc":20108,"msg":"文档状态不正确"}}},"folderId":{"chineseName":"文档目录","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10110,"msg":"文档目录不能为空"},"mongoError":{"rc":20110,"msg":"文档目录不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10112,"msg":"文档目录必须是objectId"},"mongoError":{"rc":20112,"msg":"文档目录必须是objectId"}}},"htmlContent":{"chineseName":"文档内容","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10114,"msg":"文档内容不能为空"},"mongoError":{"rc":20114,"msg":"文档内容不能为空"}},"minLength":{"define":15,"error":{"rc":10116,"msg":"文档内容至少15个字符"},"mongoError":{"rc":20116,"msg":"文档内容至少15个字符"}},"maxLength":{"define":50000,"error":{"rc":10118,"msg":"文档内容的长度不能超过50000个字符"},"mongoError":{"rc":20118,"msg":"文档内容的长度不能超过50000个字符"}}},"tags":{"chineseName":"文档标签","dataType":["string"],"applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10120,"msg":"文档标签不能为空"},"mongoError":{"rc":20120,"msg":"文档标签不能为空"}},"arrayMaxLength":{"define":5,"error":{"rc":10123,"msg":"最多设置5标签"},"mongoError":{"rc":20123,"msg":"最多设置5标签"}},"minLength":{"define":2,"error":{"rc":10123,"msg":"文档标签至少2个字符"},"mongoError":{"rc":20123,"msg":"文档标签至少2个字符"}},"maxLength":{"define":20,"error":{"rc":10124,"msg":"文档标签的长度不能超过20个字符"},"mongoError":{"rc":20124,"msg":"文档标签的长度不能超过20个字符"}}},"categoryId":{"chineseName":"分类","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10130,"msg":"文档分类不能为空"},"mongoError":{"rc":20130,"msg":"文档分类不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10132,"msg":"文档分类必须是objectId"},"mongoError":{"rc":20132,"msg":"文档分类必须是objectId"}}}},"article_attachment":{},"article_comment":{"articleId":{"chineseName":"文档","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10170,"msg":"文档不能为空"},"mongoError":{"rc":20170,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10172,"msg":"文档必须是objectId"},"mongoError":{"rc":20172,"msg":"文档必须是objectId"}}},"content":{"chineseName":"评论内容","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10174,"msg":"评论内容不能为空"},"mongoError":{"rc":10174,"msg":"评论内容不能为空"}},"minLength":{"define":15,"error":{"rc":10176,"msg":"评论内容至少15个字符"},"mongoError":{"rc":10176,"msg":"评论内容至少15个字符"}},"maxLength":{"define":255,"error":{"rc":10178,"msg":"评论内容不能超过255个字符"},"mongoError":{"rc":10178,"msg":"评论内容不能超过255个字符"}}}},"article_image":{},"folder":{"name":{"chineseName":"目录名称","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10190,"msg":"目录名不能为空"},"mongoError":{"rc":20190,"msg":"目录名不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{1,255}$/,"error":{"rc":10196,"msg":"目录名必须由1-255个字符组成"},"mongoError":{"rc":20196,"msg":"目录名必须由1-255个字符组成"}}},"parentFolderId":{"chineseName":"上级目录","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10198,"msg":"上级目录不能为空"},"mongoError":{"rc":20198,"msg":"上级目录不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10200,"msg":"上级目录必须是objectId"},"mongoError":{"rc":20200,"msg":"上级目录必须是objectId"}}}},"like_dislike":{"articleId":{"chineseName":"文档","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10210,"msg":"文档不能为空"},"mongoError":{"rc":20210,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10212,"msg":"文档必须是objectId"},"mongoError":{"rc":20212,"msg":"文档必须是objectId"}}},"like":{"chineseName":"喜欢","dataType":"boolean","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10218,"msg":"喜欢不能为空"},"mongoError":{"rc":20218,"msg":"喜欢不能为空"}}}},"tag":{"name":{"chineseName":"标签名称","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10220,"msg":"标签名称不能为空"},"mongoError":{"rc":20220,"msg":"标签名称不能为空"}},"format":{"define":/^[\u4E00-\u9FFF\w]{2,20}$/,"error":{"rc":10226,"msg":"标签名必须由2-20个字符组成"},"mongoError":{"rc":20226,"msg":"标签名必须由2-20个字符组成"}}}},"add_friend":{"receiver":{"chineseName":"添加的好友","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10440,"msg":"添加好友不能为空"},"mongoError":{"rc":20440,"msg":"添加好友不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10442,"msg":"好友必须是objectId"},"mongoError":{"rc":20442,"msg":"好友必须是objectId"}}},"status":{"chineseName":"当前请求所处状态","dataType":"string","applyRange":["update_scalar"],"require":{"define":{"update_scalar":true},"error":{"rc":10444,"msg":"状态不能为空"},"mongoError":{"rc":20444,"msg":"状态不能为空"}},"enum":{"define":["1","2","3"],"error":{"rc":10446,"msg":"状态未定义"},"mongoError":{"rc":20446,"msg":"状态未定义"}}}},"member_penalize":{"publicGroupId":{"chineseName":"群","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10300,"msg":"群不能为空"},"mongoError":{"rc":20300,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10302,"msg":"群必须是objectId"},"mongoError":{"rc":20302,"msg":"群必须是objectId"}}},"memberId":{"chineseName":"成员","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10304,"msg":"成员不能为空"},"mongoError":{"rc":20304,"msg":"成员不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10306,"msg":"成员必须是objectId"},"mongoError":{"rc":20306,"msg":"成员必须是objectId"}}},"penalizeType":{"chineseName":"处罚类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10308,"msg":"处罚类型不能为空"},"mongoError":{"rc":20308,"msg":"处罚类型不能为空"}},"enum":{"define":["0","1","2","3","4","5","7","8","9","10"],"error":{"rc":10310,"msg":"未知处罚类型"},"mongoError":{"rc":20310,"msg":"未知处罚类型"}}},"duration":{"chineseName":"处罚时间","dataType":"int","applyRange":["create"],"searchRange":["all"],"require":{"define":{"create":true},"error":{"rc":10312,"msg":"处罚时间不能为空"},"mongoError":{"rc":20312,"msg":"处罚时间不能为空"}},"min":{"define":1,"error":{"rc":10314,"msg":"处罚时间最少1天"},"mongoError":{"rc":20314,"msg":"处罚时间最少1天"}},"max":{"define":30,"error":{"rc":10316,"msg":"处罚时间最多30天"},"mongoError":{"rc":20316,"msg":"处罚时间最多30天"}}}},"public_group":{"name":{"chineseName":"群名称","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10330,"msg":"群名称不能为空"},"mongoError":{"rc":20330,"msg":"群名称不能为空"}},"minLength":{"define":1,"error":{"rc":10332,"msg":"群名称至少1个字符"},"mongoError":{"rc":20332,"msg":"群名称至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10334,"msg":"群名称的长度不能超过20个字符"},"mongoError":{"rc":20334,"msg":"群名称的长度不能超过20个字符"}}},"membersId":{"chineseName":"群成员","dataType":["objectId"],"applyRange":["update_array"],"require":{"define":{"update_array":false},"error":{"rc":10336,"msg":"群成员不能为空"},"mongoError":{"rc":20336,"msg":"群成员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10338,"msg":"群至少有一个成员"},"mongoError":{"rc":20338,"msg":"群至少有一个成员"}},"arrayMaxLength":{"define":200,"error":{"rc":10340,"msg":"群最多有200个成员"},"mongoError":{"rc":20340,"msg":"群最多有200个成员"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10342,"msg":"群成员必须是objectId"},"mongoError":{"rc":20342,"msg":"群成员必须是objectId"}}},"adminsId":{"chineseName":"群管理员","dataType":["objectId"],"applyRange":["update_array"],"require":{"define":{"update_array":false},"error":{"rc":10344,"msg":"群管理员不能为空"},"mongoError":{"rc":20344,"msg":"群管理员不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10346,"msg":"群管理员至少有一个成员"},"mongoError":{"rc":20346,"msg":"群管理员至少有一个成员"}},"arrayMaxLength":{"define":10,"error":{"rc":10348,"msg":"群最多有10个群管理员"},"mongoError":{"rc":20348,"msg":"群最多有10个群管理员"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10350,"msg":"群管理员必须是objectId"},"mongoError":{"rc":20350,"msg":"群管理员必须是objectId"}}},"joinInRule":{"chineseName":"新成员加入规则","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10352,"msg":"新成员加入规则不能为空"},"mongoError":{"rc":20352,"msg":"新成员加入规则不能为空"}},"enum":{"define":["1","2","3"],"error":{"rc":10354,"msg":"新成员加入规则不正确"},"mongoError":{"rc":20354,"msg":"新成员加入规则不正确"}}},"waitApproveId":{"chineseName":"等待批准加入","dataType":["objectId"],"applyRange":["update_array"],"require":{"define":{"update_array":false},"error":{"rc":10360,"msg":"等待批准加入不能为空"},"mongoError":{"rc":20360,"msg":"等待批准加入不能为空"}},"arrayMaxLength":{"define":200,"error":{"rc":10361,"msg":"等待批准加入的名单长度不能超过200"},"mongoError":{"rc":30361,"msg":"等待批准加入的名单长度不能超过200"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10362,"msg":"等待批准加入必须是objectId"},"mongoError":{"rc":20362,"msg":"等待批准加入必须是objectId"}}}},"public_group_event":{"publicGroupId":{"chineseName":"群","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10360,"msg":"群不能为空"},"mongoError":{"rc":20360,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10362,"msg":"群必须是objectId"},"mongoError":{"rc":20362,"msg":"群必须是objectId"}}},"eventType":{"chineseName":"群事件类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10364,"msg":"群事件类型不能为空"},"mongoError":{"rc":20364,"msg":"群事件类型不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10366,"msg":"未知群事件类型"},"mongoError":{"rc":20366,"msg":"未知群事件类型"}}},"targetId":{"chineseName":"事件接收者","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":false},"error":{"rc":10368,"msg":"事件接收者不能为空"},"mongoError":{"rc":20368,"msg":"事件接收者不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10370,"msg":"事件接收者必须是objectId"},"mongoError":{"rc":20370,"msg":"事件接收者必须是objectId"}}},"status":{"chineseName":"事件状态","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10372,"msg":"事件状态不能为空"},"mongoError":{"rc":20372,"msg":"事件状态不能为空"}},"enum":{"define":["0","1","2","3","4","5"],"error":{"rc":10374,"msg":"未知事件状态"},"mongoError":{"rc":20374,"msg":"未知事件状态"}}}},"public_group_interaction":{"publicGroupId":{"chineseName":"群","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10390,"msg":"群不能为空"},"mongoError":{"rc":20390,"msg":"群不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10392,"msg":"群必须是objectId"},"mongoError":{"rc":20392,"msg":"群必须是objectId"}}},"content":{"chineseName":"群发言内容","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10394,"msg":"群发言内容不能为空"},"mongoError":{"rc":20394,"msg":"群发言内容不能为空"}},"minLength":{"define":15,"error":{"rc":10396,"msg":"群发言内容至少15个字符"},"mongoError":{"rc":20396,"msg":"群发言内容至少15个字符"}},"maxLength":{"define":1000,"error":{"rc":10398,"msg":"群发言内容的长度不能超过1000个字符"},"mongoError":{"rc":20398,"msg":"群发言内容的长度不能超过1000个字符"}}}},"user_friend_group":{"friendGroupName":{"chineseName":"朋友分组名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10410,"msg":"朋友分组名不能为空"},"mongoError":{"rc":20410,"msg":"朋友分组名不能为空"}},"minLength":{"define":1,"error":{"rc":10412,"msg":"朋友分组名至少1个字符"},"mongoError":{"rc":20412,"msg":"朋友分组名至少1个字符"}},"maxLength":{"define":20,"error":{"rc":10414,"msg":"朋友分组名的长度不能超过20个字符"},"mongoError":{"rc":20414,"msg":"朋友分组名的长度不能超过20个字符"}}},"friendsInGroup":{"chineseName":"好友分组","dataType":["objectId"],"applyRange":["update_array"],"require":{"define":{"update_array":false},"error":{"rc":10420,"msg":"好友分组不能为空"},"mongoError":{"rc":20420,"msg":"好友分组不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10422,"msg":"好友分组最多包含100个好友"},"mongoError":{"rc":20422,"msg":"好友分组最多包含100个好友"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10424,"msg":"好友必须是objectId"},"mongoError":{"rc":20424,"msg":"好友必须是objectId"}}}},"user_public_group":{},"impeach":{"title":{"chineseName":"举报名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10500,"msg":"举报名不能为空"},"mongoError":{"rc":20500,"msg":"举报名不能为空"}},"minLength":{"define":2,"error":{"rc":10502,"msg":"举报名至少2个字符"},"mongoError":{"rc":20502,"msg":"举报名至少2个字符"}},"maxLength":{"define":50,"error":{"rc":10504,"msg":"举报名的长度不能超过50个字符"},"mongoError":{"rc":20504,"msg":"举报名的长度不能超过50个字符"}}},"content":{"chineseName":"举报内容","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10506,"msg":"举报内容不能为空"},"mongoError":{"rc":20506,"msg":"举报内容不能为空"}},"minLength":{"define":5,"error":{"rc":10508,"msg":"举报内容至少5个字符"},"mongoError":{"rc":20508,"msg":"举报内容至少5个字符"}},"maxLength":{"define":1999,"error":{"rc":10510,"msg":"举报内容的长度不能超过1999个字符"},"mongoError":{"rc":20510,"msg":"举报内容的长度不能超过1999个字符"}}},"impeachedArticleId":{"chineseName":"举报的文档","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10512,"msg":"举报的文档不能为空"},"mongoError":{"rc":20512,"msg":"举报的文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10514,"msg":"举报的文档必须是objectId"},"mongoError":{"rc":20514,"msg":"举报的文档必须是objectId"}}},"impeachedCommentId":{"chineseName":"举报的评论","dataType":"objectId","applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10516,"msg":"举报的评论不能为空"},"mongoError":{"rc":20516,"msg":"举报的评论不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10518,"msg":"举报的评论必须是objectId"},"mongoError":{"rc":20518,"msg":"举报的评论必须是objectId"}}}},"impeach_action":{"impeachId":{"chineseName":"举报","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10590,"msg":"举报不能为空"},"mongoError":{"rc":20590,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10592,"msg":"举报必须是objectId"},"mongoError":{"rc":20592,"msg":"举报必须是objectId"}}},"adminOwnerId":{"chineseName":"处理人","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":false},"error":{"rc":10594,"msg":"处理人不能为空"},"mongoError":{"rc":20594,"msg":"处理人不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10596,"msg":"处理人必须是objectId"},"mongoError":{"rc":20596,"msg":"处理人必须是objectId"}}},"action":{"chineseName":"操作","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10598,"msg":"操作不能为空"},"mongoError":{"rc":20598,"msg":"操作不能为空"}},"enum":{"define":["1","2","3","4","5","6","7"],"error":{"rc":10092,"msg":"未知操作"},"mongoError":{"rc":20092,"msg":"未知操作"}}}},"impeach_attachment":{},"impeach_comment":{"impeachId":{"chineseName":"举报","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10560,"msg":"举报不能为空"},"mongoError":{"rc":20560,"msg":"举报不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10562,"msg":"举报必须是objectId"},"mongoError":{"rc":20562,"msg":"举报必须是objectId"}}},"content":{"chineseName":"评论内容","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10564,"msg":"评论内容不能为空"},"mongoError":{"rc":20564,"msg":"评论内容不能为空"}},"minLength":{"define":15,"error":{"rc":10566,"msg":"评论内容至少15个字符"},"mongoError":{"rc":20566,"msg":"评论内容至少15个字符"}},"maxLength":{"define":140,"error":{"rc":10568,"msg":"评论内容不能超过140个字符"},"mongoError":{"rc":20568,"msg":"评论内容不能超过140个字符"}}}},"impeach_image":{"referenceId":{"chineseName":"举报对象","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10634,"msg":"举报对象不能为空"},"mongoError":{"rc":20634,"msg":"举报对象不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10636,"msg":"举报对象必须是objectId"},"mongoError":{"rc":20636,"msg":"举报对象必须是objectId"}}},"referenceColl":{"chineseName":"举报对象类型","dataType":"string","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10638,"msg":"举报对象类型不能为空"},"mongoError":{"rc":20638,"msg":"举报对象类型不能为空"}},"enum":{"define":["1","2"],"error":{"rc":10539,"msg":"举报对象的类型未知"},"mongoError":{"rc":20539,"msg":"举报对象的类型未知"}}}},"like_dislike_static":{},"user_resource_static":{},"user_resource_profile":{"userId":{"chineseName":"用户","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10760,"msg":"用户不能为空"},"mongoError":{"rc":20760,"msg":"用户不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10762,"msg":"用户格式不正确"},"mongoError":{"rc":20762,"msg":"用户格式不正确"}}},"resource_profile_id":{"chineseName":"资源配置","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10764,"msg":"资源配置不能为空"},"mongoError":{"rc":20764,"msg":"资源配置不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10766,"msg":"资源配置格式不正确"},"mongoError":{"rc":20766,"msg":"资源配置格式不正确"}}},"duration":{"chineseName":"资源配置有效期","dataType":"number","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10768,"msg":"资源配置有效期不能为空"},"mongoError":{"rc":20768,"msg":"资源配置有效期不能为空"}},"min":{"define":0,"error":{"rc":10770,"msg":"源配置有效期最短1天"},"mongoError":{"rc":20770,"msg":"源配置有效期最短1天"}},"max":{"define":365,"error":{"rc":10772,"msg":"源配置有效期最长1年"},"mongoError":{"rc":20772,"msg":"源配置有效期最长1年"}}}},"read_article":{},"user_input_keyword":{},"collection":{"name":{"chineseName":"收藏夹名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10860,"msg":"收藏夹名不能为空"},"mongoError":{"rc":20860,"msg":"收藏夹名不能为空"}},"minLength":{"define":1,"error":{"rc":10862,"msg":"收藏夹名至少1个字符"},"mongoError":{"rc":20862,"msg":"收藏夹名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10864,"msg":"收藏夹名的字符数不能超过50个字符"},"mongoError":{"rc":20864,"msg":"收藏夹名的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"收藏文档","dataType":["objectId"],"applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10866,"msg":"收藏文档不能为空"},"mongoError":{"rc":20866,"msg":"收藏文档不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10868,"msg":"最多收藏100篇文档"},"mongoError":{"rc":20868,"msg":"最多收藏100篇文档"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10870,"msg":"文档必须是objectId"},"mongoError":{"rc":20870,"msg":"文档必须是objectId"}}},"topicsId":{"chineseName":"收藏系列","dataType":["objectId"],"applyRange":["create","update_scalar"],"require":{"define":{"create":false,"update_scalar":false},"error":{"rc":10872,"msg":"系列不能为空"},"mongoError":{"rc":20872,"msg":"系列不能为空"}},"arrayMaxLength":{"define":100,"error":{"rc":10874,"msg":"最多收藏100个系列"},"mongoError":{"rc":20874,"msg":"最多收藏100个系列"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10876,"msg":"系列必须是objectId"},"mongoError":{"rc":20876,"msg":"系列必须是objectId"}}}},"recommend":{"articleId":{"chineseName":"文档","dataType":"objectId","applyRange":["create"],"require":{"define":{"create":true},"error":{"rc":10800,"msg":"文档不能为空"},"mongoError":{"rc":20800,"msg":"文档不能为空"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10802,"msg":"文档必须是objectId"},"mongoError":{"rc":20802,"msg":"文档必须是objectId"}}},"toUserId":{"chineseName":"被荐人","dataType":["objectId"],"applyRange":["create"],"require":{"define":{"create":false},"error":{"rc":10803,"msg":"被荐人不能为空"},"mongoError":{"rc":20803,"msg":"被荐人不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10804,"msg":"至少推荐给1个用户"},"mongoError":{"rc":20804,"msg":"至少推荐给1个用户"}},"arrayMaxLength":{"define":5,"error":{"rc":10805,"msg":"最多推荐给5个用户"},"mongoError":{"rc":20805,"msg":"最多推荐给5个用户"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10806,"msg":"被荐人必须是objectId"},"mongoError":{"rc":20806,"msg":"被荐人必须是objectId"}}},"toGroupId":{"chineseName":"被荐朋友组","dataType":["objectId"],"applyRange":["create"],"require":{"define":{"create":false},"error":{"rc":10807,"msg":"被荐朋友组不能为空"},"mongoError":{"rc":20807,"msg":"被荐朋友组不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10808,"msg":"至少推荐给1个朋友组"},"mongoError":{"rc":20808,"msg":"至少推荐给1个朋友组"}},"arrayMaxLength":{"define":5,"error":{"rc":10809,"msg":"最多推荐给5个朋友组"},"mongoError":{"rc":20809,"msg":"最多推荐给5个朋友组"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10810,"msg":"被荐朋友组必须是objectId"},"mongoError":{"rc":20810,"msg":"被荐朋友组必须是objectId"}}},"toPublicGroupId":{"chineseName":"被荐群","dataType":["objectId"],"applyRange":["create"],"require":{"define":{"create":false},"error":{"rc":10811,"msg":"被荐群不能为空"},"mongoError":{"rc":20811,"msg":"被荐群不能为空"}},"arrayMinLength":{"define":1,"error":{"rc":10812,"msg":"至少推荐给1个群"},"mongoError":{"rc":20812,"msg":"至少推荐给1个群"}},"arrayMaxLength":{"define":5,"error":{"rc":10813,"msg":"最多推荐给5个群"},"mongoError":{"rc":20813,"msg":"最多推荐给5个群"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10814,"msg":"被荐群必须是objectId"},"mongoError":{"rc":20814,"msg":"被荐群必须是objectId"}}}},"topic":{"name":{"chineseName":"系列名","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10830,"msg":"系列名不能为空"},"mongoError":{"rc":20830,"msg":"系列名不能为空"}},"minLength":{"define":1,"error":{"rc":10832,"msg":"系列名至少1个字符"},"mongoError":{"rc":20832,"msg":"系列名至少1个字符"}},"maxLength":{"define":50,"error":{"rc":10834,"msg":"系列名的字符数不能超过50个字符"},"mongoError":{"rc":20834,"msg":"系列名的字符数不能超过50个字符"}}},"desc":{"chineseName":"系列描述","dataType":"string","applyRange":["create","update_scalar"],"require":{"define":{"create":true,"update_scalar":false},"error":{"rc":10836,"msg":"系列描述不能为空"},"mongoError":{"rc":20836,"msg":"系列描述不能为空"}},"minLength":{"define":1,"error":{"rc":10838,"msg":"系列描述至少1个字符"},"mongoError":{"rc":20838,"msg":"系列描述至少1个字符"}},"maxLength":{"define":140,"error":{"rc":10840,"msg":"系列描述包含的字符数不能超过50个字符"},"mongoError":{"rc":20840,"msg":"系列描述包含的字符数不能超过50个字符"}}},"articlesId":{"chineseName":"系列文档","dataType":["objectId"],"applyRange":["create","update_array"],"require":{"define":{"create":false,"update_array":false},"error":{"rc":10842,"msg":"系列文档不能为空"},"mongoError":{"rc":20842,"msg":"系列文档不能为空"}},"arrayMaxLength":{"define":10,"error":{"rc":10844,"msg":"最多设置10篇文档"},"mongoError":{"rc":20844,"msg":"最多设置10篇文档"}},"format":{"define":/^[0-9a-fA-F]{24}$/,"error":{"rc":10846,"msg":"文档必须是objectId"},"mongoError":{"rc":20846,"msg":"文档必须是objectId"}}}}}

module.exports={
    browserInputRule
}
