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
module.exports={
    HashType,
    CryptType,
    GmGetter,
    GmCommand,
    FileSizeUnit,

}