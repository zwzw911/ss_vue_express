/**
 * Created by ada on 2017-07-06.
 */



const HashType={
    MD5:'md5',
    SHA1:'sha1',
    SHA256:'sha256',
    SHA512:'sha512',
    RIPEMD160:'ripemd160',
}

const CryptType={
    BLOW_FISH:'blowfish',
    AES192:'aes192',
}

const GmGetter={
    SIZE:'size' ,// returns the size (WxH) of the image
    FORMAT:'format' ,// returns the image format (gif, jpeg, png, etc)
    DEPTH:'depth' ,// returns the image color depth
    COLOR:'color' ,// returns the number of colors
    RES:'res' ,// returns the image resolution
    FILE_SIZE:'filesize' ,// returns image filesize
    IDENTIFY:'identify' ,// returns all image data available
    ORIENTATION:'orientation' ,// returns the EXIF orientation of the image
}

const GmCommand={
    RESIZE_WIDTH_ONLY:'resizeWidthOnly', //对图片的宽度进行处理
    RESIZE_USER_THUMBNAIL:'resizeUserThumbnail',//对用户头像进行处理
    RESIZE_THUMBNAIL:'resizeThumbnail',//对普通图片生成缩略图
    CONVERT_FILE_TYPE:'convertFileType',//转换图片的格式
}

const FileSizeUnit={
    KB:'ki',
    MB:'Mi',
    GB:'Gi'
}

//保存用户信息到session时，那些字段是必须的
const UserInfoField={
    USER_ID:`userId`,
    USER_COLL_NAME:`userCollName`,
    USER_TYPE:`userType`,
    USER_PRIORITY:'userPriority',//adminUser权限
    TEMP_SALT:'tempSalt', //临时salt，用来加密显示给用户的敏感信息（例如objectId）
    ADD_FRIEND_RULE:'addFriendRule',//用户被添加为他人朋友是，如何处理
}

const DataTypeInfoFieldName={
    DATA_TYPE:'dataType',
    IS_ARRAY:'isArray',
    IS_ENUM:'isEnum',
}

const InputValueLogicCheckStep={
    //单个字段级别
    FK_EXIST_AND_PRIORITY:'fkExistsAndHasPriority',
    ENUM_DUPLICATE:'enumDuplicate',
    SINGLE_FIELD_VALUE_UNIQUE:'singleFieldValueUnique',
    XSS:'xss',
    //整个记录
    COMPOUND_VALUE_UNIQUE:'compoundValueUnique',
    RESOURCE_USAGE:'diskUsage',

}

//区分上传文件，以便选择tmpDir
const UploadFileRange={
    ARTICLE_IMAGE:'articleImage',
    ARTICLE_ATTACHMENT:'articleAttachment',
    IMPEACH_IMAGE:'impeachImage',
    IMPEACH_COMMENT_IMAGE:'impeachCommentImage',
}
module.exports={
    HashType,
    CryptType,
    GmGetter,
    GmCommand,
    FileSizeUnit,
    UserInfoField,
    DataTypeInfoFieldName,
    InputValueLogicCheckStep,

    UploadFileRange,
}