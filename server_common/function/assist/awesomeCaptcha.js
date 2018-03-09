'use strict'

//var captchaImgPath=require('../assist/general').general.captchaImg_path;
//var captchaImgPath='H:/gj/' //直接以dataURL的格式返回，而不再保存在磁盘上了
const assistError=require('../../constant/error/assistError').awesomeCaptcha
const fs=require('fs');
const ap=require('awesomeprint')
const Canvas = require('canvas');

let defaultParams={
    // expireDuration:1, // minute //有调用函数控制
    resultMode:0,   //0:DataURL; 1:filepath; 2: buffer
    saveDir:__dirname,  //如果保存为file，保存路径
    //saveDir:captchaImgPath[0],//默认使用第一个元素
    //character setting

    fontRandom:true,
    fontSize:20,//[16-32]
    fontType:'normal',
    fontWeight:'normal',
    fontFamily:'serfi',

    shadow:true,

    size:4,//character number
    inclineFactor:0.25, //文字倾斜系数

    //img setting, in px
    width: 80,
    height:32
};

/*  pre defined setting */
// const validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';//these character has the same width and height, while abcdefghijklmnopqrstuvwxyz are hard to calc widht/height
const validFontType=['normal','italic'];
const validFontWeight=['100','200','300','400','500','600','700','800','900','normal','bold','bolder','lighter'];
//var validFontSize=[11,12,13,14,15,16,17]			// in px
const validFontFamily=['serif','sans-serif','monospace','cursive','fantasy'];


/*  get random element from pre defined font array  */
function genRandomEle(array){
    let length=array.length;
    let randomIdx=Math.round(Math.random()*(length-1));
    //console.log(randomIdx)
    return array[randomIdx];
};

/*  gen random character font setting*/
function genRandomFontSetting(params){
    params.fontType=genRandomEle(validFontType);
    params.fontWeight=genRandomEle(validFontWeight);
    //params.fontSize=genRandomEle(validFontSize);	//font should be constant to define the width
    params.fontFamily=genRandomEle(validFontFamily);
    //return params.fontType+' '+params.fontWeight+' '+params.fontSize+'px '+params.fontFamily
};

function convertToInt(number){
    return (isNaN(parseInt(number))) ? false:parseInt(number)
}

function convertToFloat(number){
    return (isNaN(parseFloat(number))) ? false:parseFloat(number)
}

/*generate mandatory params(if not set or param not correct, use default; otherwise use user set param)*/
function generateMandatoryParams({params={}}){
    let tmpInt,tmpFloat;

    if(undefined===params.resultMode){
        params.resultMode=defaultParams.resultMode
    }else{
        tmpInt=convertToInt(params.resultMode);
        if(false===tmpInt || tmpInt<0 || tmpInt>2){
            params.resultMode=defaultParams.resultMode
        }
    }

    //只有当mode为0（产生captcha文件），才要设置超时timer
/*    if(0===params.resultMode){
        if(undefined===params.expireDuration){
            params.expireDuration=defaultParams.expireDuration
        }else{
            tmpInt=convertToInt(params.expireDuration);
            if(false===tmpInt || tmpInt<0 || tmpInt>60){
                params.expireDuration=defaultParams.expireDuration
            }
        }
    }*/
    if (undefined===params.width ) {params.width=defaultParams.width}
    if (undefined===params.height ) {params.height=defaultParams.height}


    if (undefined===params.fontRandom || typeof(params.fontRandom)!=='boolean') {params.fontRandom=defaultParams.fontRandom}
    if (undefined===params.fontType || validFontType.indexOf(params.fontType)===-1) {params.fontType=defaultParams.fontType;}
    if (undefined===params.fontWeight || validFontWeight.indexOf(params.fontWeight)===-1){params.fontWeight=defaultParams.fontWeight;}
    if (undefined===params.fontFamily || validFontFamily.indexOf(params.fontFamily)===-1) { params.fontFamily=defaultParams.fontFamily;}
    if (undefined===params.fontSize) {
        params.fontSize=defaultParams.fontSize;
    }else{
        tmpInt=convertToInt(params.fontSize);
        if(false===tmpInt || tmpInt<16 || tmpInt>32){
            params.fontSize=defaultParams.fontSize;
        }
    }

    if (undefined===params.shadow || typeof(params.shadow)!=='boolean'){params.shadow=defaultParams.shadow;}


    if (undefined===params.size  ){
        params.size=defaultParams.size
    }else{
        tmpInt=convertToInt(params.size);
        if(false===tmpInt || tmpInt<2 || tmpInt>6){
            params.size=defaultParams.size
        }
    }

    if (undefined===params.inclineFactor ) {
        params.inclineFactor =defaultParams.inclineFactor;
    }else{
        tmpFloat=convertToFloat(params.inclineFactor);
        if(false===tmpFloat || tmpFloat<0 || tmpFloat>1 ) {
            params.inclineFactor = defaultParams.inclineFactor;
        }
    }

    return params
}

/* 产生图片
*  @params：设定参数，如果为空，使用default参数代替
*  @captchaString：需要写入的字符
* */
async function captcha_async({params,captchaString}){
    return new Promise(function(resolve,reject){
        // ap.inf('captcha_async in with params',params)
        generateMandatoryParams({params})
        // ap.inf('aafter captcha_async in with params',params)

        params.size=captchaString.length
        //根据必须参数计算其他参数
        let realCharacterWidth=Math.ceil(params.fontSize*0.5*(1+params.inclineFactor));
        let realCharacterHeight=Math.ceil(params.fontSize*0.7*(1+params.inclineFactor));

        let horizontalPadding=realCharacterWidth; //px, captcha padding in horizontal, may change later
        let verticalPadding=Math.round(realCharacterHeight/4);  //px, captcha padding in vertical, may change later

        let characterSpacing=0//Math.round(realCharacterWidth/4); //ps, the spacing between current char and next char, this is a constant

        let color=["rgb(255,165,0)","rgb(16,78,139)","rgb(0,139,0)","rgb(255,0,0)"];
        let bgColor='rgb(255,255,255)';
        let borderColor='rgb(153, 102, 102)';

        // let tmpInt
        let neededWidth=(2*horizontalPadding)+(params.size*realCharacterWidth)+(params.size-1)*characterSpacing;
        // tmpInt=convertToInt(params.width);
        //如果width为定义，或者定义小于计算所需，则设置为计算结果
        if (undefined===params.width || neededWidth>params.width ){
            params.width=neededWidth;
        }
        horizontalPadding=Math.round((params.width-params.size*realCharacterWidth-(params.size-1)*characterSpacing)/2);

/*ap.inf('verticalPadding',verticalPadding)
        ap.inf('realCharacterHeight',realCharacterHeight)
        ap.inf('params.height',params.height)*/

        let neededHeight=2*verticalPadding+realCharacterHeight;
        // ap.inf('neededHeight',neededHeight)

        if (undefined===params.height || neededHeight>params.height ){
            params.height=neededHeight;
        }
        // tmpInt=convertToInt(params.height);
        /*    if (!params.hasOwnProperty('height')){
                params.height=32;
            }else{
                if(false===tmpInt || tmpInt<neededHeight){
                    params.height=neededHeight;
                }else{
                    params.height=tmpInt;
                }
            }*/
        verticalPadding=Math.round((params.height-realCharacterHeight)/2);
        // ap.inf('aafter captcha_async in with params',params)

        /*************************************************************/
        /**************   start to generate captcha  ****************/
        /*************************************************************/
        let canvas = new Canvas(params.width, params.height);
        let ctx = canvas.getContext('2d');

        /*  fill pic background color*/
        ctx.fillStyle =bgColor;
        ctx.fillRect(0, 0, params.width, params.height);
        /*  gen pic border*/
        ctx.fillStyle = borderColor;
        ctx.lineWidth=1;
        // ctx.strokeRect(0,0,params.width,params.height);  //无需边框

        /*  check shadow flag*/
        if(params.shadow){
            let shadowIdx=Math.round(Math.random()*(color.length-1));
            ctx.shadowColor=color[shadowIdx];
            ctx.shadowOffsetX=1;
            ctx.shadowOffsetY=1;
            ctx.shadowBlur=3;
        }
        // /*  start gen captcha   */
        // let genText='';
        // ap.inf('2 aafter captcha_async in with params',params)
        //gen curve which cross all character
        ctx.lineWidth=1;
        ctx.moveTo(horizontalPadding,verticalPadding+Math.random()*realCharacterHeight);
        let randomControlX1=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
        let randomControlY2=verticalPadding+Math.random()*(realCharacterHeight/2);
        let randomControlX2=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
        let randomControlY1=verticalPadding+realCharacterHeight/2+Math.random()*(realCharacterHeight/2);
        let randomControlY3=verticalPadding+parseInt(realCharacterHeight*Math.random())
        ctx.bezierCurveTo(randomControlX1,randomControlY1,randomControlX2,randomControlY2,params.width-horizontalPadding, randomControlY3);
        ctx.stroke();
        // ap.inf('3 aafter captcha_async in with params',params)
        // let singleChar=''
        for (let idx in captchaString)
        {
            // singleChar= validString.substr(parseInt(Math.random()*36,10),1);
            let singleChar=captchaString[idx]
// ap.inf('singleChar',singleChar)
            //console.log(ctx.font)
            //tranform character
            ctx.setTransform(1,Math.random()*params.inclineFactor,Math.random()*params.inclineFactor,1,horizontalPadding+idx*characterSpacing+idx*realCharacterWidth,Math.ceil(params.fontSize*0.7)+verticalPadding );//for axis y, the start still be fontSize*0.7 instead of fontSize*0.7*(1+inclineFactor), thus the character can show in vertical center
            // ap.inf('ctx.lineWidth',ctx.lineWidth)
            ctx.lineWidth=1;
            // ap.inf('ctx.lineWidth',ctx.lineWidth)
            if(params.fontRandom){
                genRandomFontSetting(params);
            }
            //ctx.font=params.fontType+' normal '+params.fontWeight+' '+params.fontSize.toString()+'px '+params.fontFamily;//there is an issue of node-canvas:it not accept font-weight, if set, font will be default 10px sans-serif
            ctx.font=params.fontType+' '+params.fontSize.toString()+'px '+params.fontFamily;
            //console.log(ctx.font)
            // ap.inf('ctx.font',ctx.font)
            let charIdx=parseInt(Math.random()*color.length);
            ctx.fillStyle = color[charIdx];
            let textStroke=(Math.random() > 0.5);
            if(textStroke){
                //ctx.strokeText(singleChar,horizontalPadding+(i-1)*characterSpacing+(i-1)*params.fontSize,params.height-verticalPadding)
                ctx.strokeText(singleChar,0,0);
            }else
            {
                //ctx.fillText(singleChar,horizontalPadding+(i-1)*characterSpacing+(i-1)*params.fontSize,params.height-verticalPadding)
                ctx.fillText(singleChar,0,0);
            }
            // genText+=singleChar;
        }
        // ap.inf('4 aafter captcha_async in with params',params)
        if (2 === params.resultMode) {
            // return new Promise(function(resolve,reject){
            canvas.toBuffer(function(err, buf) {
                if(err){
                    reject(assistError.awesomeCaptcha.genCaptchaBufferFail)
                }
                resolve(buf)
            });
            // })
        }


        if (0 === params.resultMode) {
            // return new Promise(function(resolve,reject){
            canvas.toDataURL('image/png', function(err, data){
                if(err){
                    // ap.inf('gen dataurl fail',err)
                    reject(assistError.awesomeCaptcha.genCaptchaDataUrlFail)
                }
                // ap.inf('gen dataurl result',data)
                resolve(data)
            });
            // })
        };       
    })
    


}




module.exports={
    captcha_async,
    //removeExpireFile:removeExpireFile
}

/*
captcha_async({params:{},captchaString:'asdf'}).then(function(result){
    ap.inf('result',result)
},function(err){
    ap.inf('err',err)
})*/
