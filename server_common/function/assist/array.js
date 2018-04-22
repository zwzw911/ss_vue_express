/**
 * Created by zhang wei on 2018/4/11.
 */
'use strict'
const _=require('lodash')
const ap=require('awesomeprint')
/*
* 数组中的每个值作为key，值的类型作为value，赋给一个对象。如果已经存在，说明是重复
* */
function ifArrayHasDuplicate(array){
    let obj={} //key是array的元素，value是元素的类型
    for(let singleEle of array){
        //有key且类型一致，说明重复
        if(undefined!==obj[singleEle] && typeof singleEle===obj[singleEle]){
            return true
        }
        obj[singleEle]=typeof singleEle
    }
    return false
}

/*  childArray中的每个元素都包含在parentArray中
*
* */
function ifArrayContainArray({parentArray,childArray}){
    if(childArray.length===0 || parentArray.length===0){
        return false
    }
    for(let singleChildEle of childArray){
        if(-1===parentArray.indexOf(singleChildEle)){
            return false
        }
    }
    return true
}

/*  筛选出baseArray有，但是newArray中没有的元素的idx(baseArray)
* */
function getRemovedEleIdx({baseArray,newArray}){
    let removedEleIdx=[]
    //base为空，则无任何被删除元素
    if(baseArray.length===0){
        return removedEleIdx
    }
    //新array为空，base中所有元素均被删除
    if(newArray.length===0){
        removedEleIdx=Object.keys(baseArray)
        //Object.keys返回数组，元素是字符
        for(let idx in removedEleIdx){
            removedEleIdx[idx]=parseInt(removedEleIdx[idx])
        }
        return removedEleIdx
    }

    let removedValue=_.differenceWith(baseArray,newArray,_.isEqual)
    for(let singleRemovedEle of removedValue){
        removedEleIdx.push(baseArray.indexOf(singleRemovedEle))
    }

    return removedEleIdx
}

/*  筛选出baseArray没有，但是newArray中有的元素的idx（newArray）
* */
function getAddedEleIdx({baseArray,newArray}){
    let addedEleIdx=[]
    //base为空，则无任何被删除元素
    if(baseArray.length===0){
        addedEleIdx=Object.keys(newArray)
        //Object.keys返回数组，元素是字符
        for(let idx in addedEleIdx){
            addedEleIdx[idx]=parseInt(addedEleIdx[idx])
        }
        return addedEleIdx
        // return Object.keys(newArray)

    }
    //新array为空，base中所有元素均被删除
    if(newArray.length===0){
        return addedEleIdx
    }

    let addedValue=_.differenceWith(newArray,baseArray,_.isEqual)
    // ap.inf('addedValue',addedValue)
    for(let singleRemovedEle of addedValue){
        addedEleIdx.push(newArray.indexOf(singleRemovedEle))
    }

    return addedEleIdx
}
module.exports={
    ifArrayHasDuplicate,
    ifArrayContainArray,
    getRemovedEleIdx,
    getAddedEleIdx,
}

// let base=[]
// let n=[1,2,3]
// ap.inf('remove idx',getRemovedEleIdx({baseArray:base,newArray:n}))
// ap.inf('added idx',getAddedEleIdx({baseArray:base,newArray:n}))