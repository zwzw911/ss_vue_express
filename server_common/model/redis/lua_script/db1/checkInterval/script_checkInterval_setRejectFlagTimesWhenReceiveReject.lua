-- 当收到reject后，对flag和times进行ttl的设置（以便其他程序用来判断是否直接reject 请求）
--
-- KEYS
-- @key_rejectFlag:是否处于被处罚状态，如果存在，直接拒绝  TTL：key_rejectTimes决定
-- @key_rejectTimes:当前被拒次数，根据次数决定key_rejectFlag存在的时间 TTL：key_rejectTimes次数
--
-- ARGV
-- @argv_configuration
	 --rejectTimesToTime ：被拒次数对应的被拒时间  数组 总共rejectTimesThreshold+1个元素，第一个元素为未达threshold的ttl时间，一般等于simple中的expireTimeBetween2Req，最后一个元素为达到或者超出threshold的ttl
     --rejectTimesThreshold : 当被拒次数达到此门限，开始实施惩罚
--
--返回值：进入此函数，必定会被惩罚，所以返回计算后的惩罚时间
--
-- 步骤
-- 1.key_rejectTimes+1
-- 2. 根据key_rejectTimes和rejectTimesThreshold的差值，如果差值小于0，ttl为rejectTimesToTime第一个元素；以差值作为idx，从rejectTimesToTime中获得对应的ttl，设置key_rejectFlag和ey_rejectTimes，并返回0


--检测请求频率的数据，都存储在db 1中
redis.call('select',1)

local key_rejectFlag=KEYS[1]
local key_rejectTimes=KEYS[2]
local tmp=ARGV[1]

--参数从字符转成table
local argv_configuration=loadstring('return '..tmp)()
local rejectTimesToTime=argv_configuration['rejectTimesToTime']
local rejectTimesThreshold=tonumber(argv_configuration['rejectTimesThreshold'])

--存在+1，不存在自动新建，并设为1
local newRejectTimes=redis.call('incr',key_rejectTimes)




--根据newRejectTimes和rejectTimesThreshold的差值，获得ttl
local gap=newRejectTimes-rejectTimesThreshold

local newTTL
if gap<=0 then
	newTTL=rejectTimesToTime[1]
elseif gap>=#rejectTimesToTime then
	newTTL=rejectTimesToTime[#rejectTimesToTime]
else
	newTTL=rejectTimesToTime[gap]
end

if 0==redis.call('exists',key_rejectFlag) then
	redis.call('set',key_rejectFlag,'anyValue')
end	
 
redis.call('expire',key_rejectFlag,newTTL)
redis.call('expire',key_rejectTimes,newTTL)

return newTTL
