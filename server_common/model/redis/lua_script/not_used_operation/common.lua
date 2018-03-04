-- common command: keys/exists/del
-- @KEYS: command要操作的key
-- @ARGV:
	-- 1. command
	-- 2. value
	-- 3. db
	
local key=KEYS[1]	

local tmp=ARGV[1]
local param=loadstring('return '..tmp)()
local command=param['command']
local db=param['db']
local value=param['value']

--默认选择db0
if db==nil then
	redis.call('select',0)
else
	redis.call('select',db)
end
	
--执行命令
return redis.call(command, key, value)	
	
