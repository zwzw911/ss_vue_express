/*    gene by server/maintain/generateMongoUniqueFieldToEnum     */ 
 
    "use strict"

const UniqueField={
    admin_user:["name",],
    category:["name",],
    store_path:["name","path",],
    resource_profile:["name",],
    tag:["name",],
    public_group:["name",],
    user_input_keyword:["name",],
}

module.exports={
    UniqueField,
}