cd "D:/ss_repilcaset"

cd mongo



cd log
cd shard1_1
erase shard1_1.log.2*
cd ..
cd shard1_2
erase shard1_2.log.2*
cd ..
cd shard1_3
erase shard1_3.log.2*
cd ..
cd shard2_1
erase shard2_1.log.2*
cd ..
cd shard2_2
erase shard2_2.log.2*
cd ..
cd shard2_3
erase shard2_3.log.2*
cd ..
cd cfgsvr_1
erase cfgsvr_1.log.2*
cd ..
cd cfgsvr_2
erase cfgsvr_2.log.2*
cd ..
cd cfgsvr_3
erase cfgsvr_3.log.2*
cd ..
cd mongos_1
erase mongos_1.log.2*
cd ..
cd mongos_2
erase mongos_2.log.2*
cd ..
cd mongos_3
erase mongos_3.log.2*
cd ..



cd ../..