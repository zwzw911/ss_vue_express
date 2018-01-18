/**
 * Created by Ada on 2017/8/1.
 */
'use strict'


const createDOMPurify = require('dompurify')
const {JSDOM} = require('jsdom')
/*const dom=new JSDOM('')
const window = dom.window*/
const window = (new JSDOM('')).window
const DOMPurify = createDOMPurify(window)


function sanityHtml(dirty){
    return DOMPurify.sanitize(dirty)
}

// sanityHtml('<script></script>>asadf')
module.exports={
    sanityHtml
}
