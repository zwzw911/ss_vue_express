-- common command: get/set/
-- @KEYS: command要操作的key
-- @ARGV:
	-- 1. command
	-- 2. value
	-- 3. db
	-- 4. TTL: set key ttl
	-- 5. TTLUnit: s/ms
	
local key=KEYS[1]
	
local tmp=ARGV[1]

local param=loadstring('return '..tmp)()

local command=param['command']
local value=param['value']

--默认选择db0
if param['db']~=nil then
	redis.call('select',0)
else
	redis.call('select',db)
end
	
	
--执行命令
if 'set'==command then
	redis.call(command, key, value)
	if nil~=param['TTL'] then
		local ttl=param['TTL']
		if 'ms'==param['TTLUnit'] then
			redis.call('pexpire',key,ttl)
		elseif 's'==param['TTLUnit'] then
			redis.call('expire',key,ttl)
		else
			--默认unit
			redis.call('expire',key,ttl)
		end
	end	
end	