## Usage

```lua
local c = {
    {x = 24.12536, y = -1347.095, z = 28.49703, h = 268.9323425293},
}

local d = {
    inv = true,
    events = true,
    rag = true,
    frozen = true
}

exports["debugg-peds"]:createJobPed(c, "mp_m_shopkeep_01", nil, d)
```
arg 1 = a table including all the peds locations

arg 2 = ped "skin" or whatever...

arg 3 = task/animation name or nil

arg 4 = properties (invincible, not to react to nearby events, disable ragdoll and freeze ped)