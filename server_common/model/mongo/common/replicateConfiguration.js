/**
 * Created by 张伟 on 2019/1/9.
 */
'use strict'
const ap=require('awesomeprint')
//https://docs.mongodb.com/manual/reference/replica-configuration/#rsconf.settings
const rs_shard1={
    _id: "rs_shard1", 								//字符，复制集的名称，设定后无法更改
    version: 1, 									//int。递增字符，用来和之前的rep config区分
    protocolVersion: 1,  							//4.0后，必须是1
    writeConcernMajorityJournalDefault: true,		//如果没有显示的在日志option中设置{ w: "majority" }，那么在这里定义，默认是true（在primary上写数据）
    configsvr: false,								//是否为config server的复制集。根据情况具体设施

    settings: {								//适用于整个复制集的设置
        chainingAllowed : true,					//默认true。是否可从secondary进行复制。如果设成false，只能从primary上复制
        heartbeatIntervalMillis : 1000,		//发送心跳的间隔
        heartbeatTimeoutSecs: 10,				//默认10秒.等待心跳回应的时间
        electionTimeoutMillis : 10000,			//默认10000。primary unrachable后，多少时间确定fail
        catchUpTimeoutMillis : -1,				//默认-1（无限）。选举出新primary后，此primary花费多少时间，去其他member同步（选举duration中）写入的数据
        catchUpTakeoverDelayMillis : 30000,		//默认30秒。功能未知
        getLastErrorModes : undefined,			//定义一个或者多个复合tag（例如，2个数据中心，各有单独tag，在getLastErrorModes中设置复合tag，包含2个数据中心的tag，然后read或write的时候，使用这个复合tag，就可以对2个数据中心同时操作）。 { MultipleDC : { "dc_va": 1, "dc_gto": 1 } }
        getLastErrorDefaults : undefined,		//write concern only。如果设置，那么write操作或者getLastError未设置，这使用此设置；the default write concern for the replica set only requires confirmation from the primary.
        replicaSetId: undefined,				// rs.initiate() or replSetInitate自动创建。ObjectId
    },

    members: [									//数组，复制集的成员（一般是shard）
        {
            _id: 1,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30001",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 2,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30002",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 3,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30003",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: true,					//是否 只用作 选举节点（(一般只需要主备用，需要2个成员，mongodb选举需要3个node，第三个设成arbiterOnly，减轻负担)）
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {} ,						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
    ],
}

const rs_shard2={
    _id: "rs_shard2", 								//字符，复制集的名称，设定后无法更改
    version: 1, 									//int。递增字符，用来和之前的rep config区分
    protocolVersion: 1,  							//4.0后，必须是1
    writeConcernMajorityJournalDefault: true,		//如果没有显示的在日志option中设置{ w: "majority" }，那么在这里定义，默认是true（在primary上写数据）
    configsvr: false,								//是否为config server的复制集。根据情况具体设施

    settings: {								//适用于整个复制集的设置
        chainingAllowed : true,					//默认true。是否可从secondary进行复制。如果设成false，只能从primary上复制
        heartbeatIntervalMillis : 1000,		//发送心跳的间隔
        heartbeatTimeoutSecs: 10,				//默认10秒.等待心跳回应的时间
        electionTimeoutMillis : 10000,			//默认10000。primary unrachable后，多少时间确定fail
        catchUpTimeoutMillis : -1,				//默认-1（无限）。选举出新primary后，此primary花费多少时间，去其他member同步（选举duration中）写入的数据
        catchUpTakeoverDelayMillis : 30000,		//默认30秒。功能未知
        getLastErrorModes : undefined,			//定义一个或者多个复合tag（例如，2个数据中心，各有单独tag，在getLastErrorModes中设置复合tag，包含2个数据中心的tag，然后read或write的时候，使用这个复合tag，就可以对2个数据中心同时操作）。 { MultipleDC : { "dc_va": 1, "dc_gto": 1 } }
        getLastErrorDefaults : undefined,		//write concern only。如果设置，那么write操作或者getLastError未设置，这使用此设置；the default write concern for the replica set only requires confirmation from the primary.
        replicaSetId: undefined,				// rs.initiate() or replSetInitate自动创建。ObjectId
    },

    members: [									//数组，复制集的成员（一般是shard）
        {
            _id: 1,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30011",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 2,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30012",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: true,					//是否 只用作 选举节点(一般只需要主备用，需要2个成员，mongodb选举需要3个node，第三个设成arbiterOnly，减轻负担)
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 3,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30013",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
    ],
}

/**     config server 不能有仲裁节点   **/
const rs_cfgsvr={
    _id: "rs_cfgsvr", 								//字符，复制集的名称，设定后无法更改
    version: 1, 									//int。递增字符，用来和之前的rep config区分
    protocolVersion: 1,  							//4.0后，必须是1
    writeConcernMajorityJournalDefault: true,		//如果没有显示的在日志option中设置{ w: "majority" }，那么在这里定义，默认是true（在primary上写数据）
    configsvr: true,								//是否为config server的复制集。根据情况具体设施

    settings: {								//适用于整个复制集的设置
        chainingAllowed : true,					//默认true。是否可从secondary进行复制。如果设成false，只能从primary上复制
        heartbeatIntervalMillis : 1000,		//发送心跳的间隔
        heartbeatTimeoutSecs: 10,				//默认10秒.等待心跳回应的时间
        electionTimeoutMillis : 10000,			//默认10000。primary unrachable后，多少时间确定fail
        catchUpTimeoutMillis : -1,				//默认-1（无限）。选举出新primary后，此primary花费多少时间，去其他member同步（选举duration中）写入的数据
        catchUpTakeoverDelayMillis : 30000,		//默认30秒。功能未知
        getLastErrorModes : undefined,			//定义一个或者多个复合tag（例如，2个数据中心，各有单独tag，在getLastErrorModes中设置复合tag，包含2个数据中心的tag，然后read或write的时候，使用这个复合tag，就可以对2个数据中心同时操作）。 { MultipleDC : { "dc_va": 1, "dc_gto": 1 } }
        getLastErrorDefaults : undefined,		//write concern only。如果设置，那么write操作或者getLastError未设置，这使用此设置；the default write concern for the replica set only requires confirmation from the primary.
        replicaSetId: undefined,				// rs.initiate() or replSetInitate自动创建。ObjectId
    },

    members: [									//数组，复制集的成员（一般是shard）
        {
            _id: 1,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30021",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 2,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30022",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点(一般只需要主备用，需要2个成员，mongodb选举需要3个node，第三个设成arbiterOnly，减轻负担)
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 3,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30023",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: {},						    //对象。标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
    ],
}

/**         mongos 没有复制集        **/
const rs_mongos={
    _id: "rs_mongos", 								//字符，复制集的名称，设定后无法更改
    version: 1, 									//int。递增字符，用来和之前的rep config区分
    protocolVersion: 1,  							//4.0后，必须是1
    writeConcernMajorityJournalDefault: true,		//如果没有显示的在日志option中设置{ w: "majority" }，那么在这里定义，默认是true（在primary上写数据）
    configsvr: false,								//是否为config server的复制集。根据情况具体设施

    settings: {								//适用于整个复制集的设置
        chainingAllowed : true,					//默认true。是否可从secondary进行复制。如果设成false，只能从primary上复制
        heartbeatIntervalMillis : 1000,		//发送心跳的间隔
        heartbeatTimeoutSecs: 10,				//默认10秒.等待心跳回应的时间
        electionTimeoutMillis : 10000,			//默认10000。primary unrachable后，多少时间确定fail
        catchUpTimeoutMillis : -1,				//默认-1（无限）。选举出新primary后，此primary花费多少时间，去其他member同步（选举duration中）写入的数据
        catchUpTakeoverDelayMillis : 30000,		//默认30秒。功能未知
        getLastErrorModes : undefined,			//定义一个或者多个复合tag（例如，2个数据中心，各有单独tag，在getLastErrorModes中设置复合tag，包含2个数据中心的tag，然后read或write的时候，使用这个复合tag，就可以对2个数据中心同时操作）。 { MultipleDC : { "dc_va": 1, "dc_gto": 1 } }
        getLastErrorDefaults : undefined,		//write concern only。如果设置，那么write操作或者getLastError未设置，这使用此设置；the default write concern for the replica set only requires confirmation from the primary.
        replicaSetId: undefined,				// rs.initiate() or replSetInitate自动创建。ObjectId
    },

    members: [									//数组，复制集的成员（一般是shard）
        {
            _id: 1,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30031",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: '',						//标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 2,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30032",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点(一般只需要主备用，需要2个成员，mongodb选举需要3个node，第三个设成arbiterOnly，减轻负担)
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: '',						//标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
        {
            _id: 3,								//成员编号，0～255，每个成员必须不同。
            host: "localhost:30033",							//hostname，加可选的port。hostname如果不是IP，必须是可以解析的
            arbiterOnly: false,					//是否 只用作 选举节点
            buildIndexes: true,					//成员新加入的时候，是否build index。创建后无法更改。只作为备份且不接受任何查询的成员，才需设成false。即使设成false，在_id上也会index来完成复制操作。
            hidden: false,						//默认false。true：不会接收read（查询）操作，且不会在
            priority: 1,						//0～1000，一个成员成为primary的可能性，值越大，越有可能。修改值会触发选择。0，仲裁节点，，添加buildIndex=false的成员，会报错。1或者以上：primary/secondary
            tags: '',						//标签，可以有针对性的读取replicaset中部分成员的信息。都是字符。customize write concern and read preferences for a replica set。read preferences会包含所有，而read concern只考虑是否unique。
            slaveDelay: 0,						//默认0。secondary在多少  秒 后同步primary数据，以便维持一个 多少秒 之前的备份
            votes: 1								//默认1。是否有投票权。仲裁节点总是1
        },
    ],
}

let config=[rs_shard1,rs_shard2,rs_cfgsvr,]
for(let singleConfig of config){
    let replaceResult=JSON.stringify(singleConfig).replace(/\/\/.+\r\n/,'').replace(/\r\n/,'').replace(/\s/,'').replace(/\t/,'')
    ap.inf('rs_shard1',JSON.parse(replaceResult))
}