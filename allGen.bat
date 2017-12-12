cd ./server_common/maintain
node genCollFieldEnum.js exit

cd ../../express/maintain
start node genCollFieldEnum.js

cd ../../express_admin/maintain
start node genCollFieldEnum.js