/**
 * Created by wzhan039 on 2015-08-19.
 */
const testModule=require('../../../server/function/assist/pagination');



exports.testPagination=function(test){
    test.expect(4);

    let total=187,pageSize=5,pageLength=10
    let curPage,result


    //检测页码超出范围，是否自动设成第一、最后也
     curPage=-1
     result=testModule.pagination({total:total,currentPage:curPage,pageSize:pageSize,pageLength:pageLength});
    test.equal(result.toString(),{start:1,end:10,currentPage:1,showPrevious:false,showNext:true,totalPage:38,pageSize:5,pageLength:10}.toString(),'cant set to first page');

     curPage=39
    result=testModule.pagination({total:total,currentPage:curPage,pageSize:pageSize,pageLength:pageLength});
    test.equal(result.toString(),{start:31,end:38,currentPage:38,showPrevious:true,showNext:false}.toString(),'cant set to last page');

     curPage=20
    result=testModule.pagination({total:total,currentPage:curPage,pageSize:pageSize,pageLength:pageLength});
    console.log(result.toString())
    //test.equal(Object.is(result,{start:11,end:20,curPage:20, showPrevious:true,showNext:true}),true,'page 20 failed');
    test.equal(JSON.stringify(result),JSON.stringify({start:11,end:20,currentPage:20, showPrevious:true,showNext:true,totalPage:38,pageSize:5,pageLength:10}),'page 20 failed');

     total=3;
     curPage=1
    result=testModule.pagination({total:total,currentPage:curPage,pageSize:pageSize,pageLength:pageLength});
    //console.log(result)
    test.equal(JSON.stringify(result),JSON.stringify({start:1,end:1,currentPage:1, showPrevious:false,showNext:false,totalPage:1,pageSize:5,pageLength:10}),'page 1 failed');
    test.done();
}