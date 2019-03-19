class Scheduler {
  tasks = []
  _key = 'schedule'
  timers = {}

  _store() {
    console.log(`Stored ${this.tasks.length} tasks.`)
    localStorage.setItem(this._key, JSON.stringify(this.tasks))
  }

  _restore() {
    this.tasks = JSON.parse(localStorage.getItem(this._key)) || []
    console.log(`Loaded ${this.tasks.length} tasks.`)
  }

  constructor() {
    this._restore()
    this.tasks.map(task => this._schedule(task))
  }

  add(task) {
    const { startAt, scriptName, params } = task

    this.tasks.push(task)
    this._store()
    this._schedule(task)
  }

  remove(task) {
    this._remove(task)
  }

  print() {
    return this.tasks
        .map(task => `${new Date(task.startAt)}: [${task.scriptName.toUpperCase()}], ${Object.keys(task.params)}: ${Object.values(task.params)}`)
        .join(`\n`)
  }

  _remove(task) {
    let index = this.tasks.indexOf(task)

    while (index !== -1) {
      this.tasks.splice(index, 1)
      console.log(`Removed task at index ${index}`)
      index = this.tasks.indexOf(task)
    }

    this._store()
  }

  _schedule(task) {
    const { startAt, scriptName, params } = task
    const now = Date.now()
    if (startAt <= now) {
      this._run(task)
    } else {
      const key = `${startAt}-${scriptName}`

      this.timers[key] = setTimeout(() => this._run(task), startAt - now)

      console.log(`Scheduled to run ${key} at ${new Date(startAt)}, in ${startAt - now}`)
    }
  }

  _run(task) {
    const { startAt, scriptName, params } = task

    if (startAt > Date.now) throw new Error(`Task is not ready yet. Wait until ${new Date(startAt)}`)

    if (instagram.isStopped) throw new Error(`Cant run scheduled task if something is running`)

    const key = `${startAt}-${scriptName}`

    const timerID = this.timers[key]

    clearTimeout(timerID)

    console.log(`${new Date()}: Running ${key}`)
    scripts[scriptName].run(params)

    this._remove(task)
  }

  _closeAll() {
    this.timers.map(clearTimeout)
    console.log(`Removed all timers`)
    this._store()
  }
}



const schedule = new Scheduler()
