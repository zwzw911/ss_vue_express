/*    gene by server/maintain/generateMongoUniqueFieldToEnum     */ 
 
    "use strict"

const UniqueField={
    admin_user:["name",],
    catagory:["name",],
    store_path:["name",],
    tag:["name",],
    public_group:["name",],
    sugar:["userId",],
    user:["name","account",],
    user_input_keyword:["name",],
}

module.exports={
    UniqueField,
}