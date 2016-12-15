const role = {
  wolf: 1000,
  girl: 1001,
  seer: 1002,
  witch: 1003,
  hunter: 1004,
  madman: 1005,
  cupid: 1006,
  orc: 1007,
}

const step = {
  begin: 0,
  night: 1,
  morning: 2,
  afterVote: 3,
  over: 4,
}

const wolfAction = {
  watch: 0,
}

const seerAction = {
  check: 0,
}

const hunterAction = {
  shoot: 0,
}

const cupidAction = {
  swap: 0,
}

const orcAction = {
  change: 0,
}

const commonAction = {
  vote: 0,
}

const action = {
  wolf: wolfAction,
  seer: seerAction,
  hunter: hunterAction,
  cupid: cupidAction,
  orc: orcAction,
  common: commonAction,
}

const actionRole = {
  wolf: role.wolf,
  seer: role.seer,
  hunter: role.hunter,
  cupid: role.cupid,
  orc: role.orc,
  common: 2000,
}

export {
  role,
  step,
  action,
  actionRole,
}
