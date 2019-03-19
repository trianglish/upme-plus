const { connect } = ReactRedux
const { Redirect } = ReactRouterDOM

class __CreateTaskCard extends React.Component {

  scriptName () {
    return this.props.name
  }

  constructor(props) {
    super(props)

    console.log(props)

    this.state = {
      showAlertAfterFinish: false,
      shouldRedirectToLogs: false,
      delay: 5, // minutes
    }

    const { script, params, state } = this.findScript(this.scriptName())

    this.script = script

    if (!script) return

    this.state = {
      ...this.state,
      ...state,
      params,
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('will receive props', nextProps)

    const { script, params, state } = this.findScript(nextProps.name)

    this.script = script

    if (!script) return

    this.setState({
      ...state,
      params,
    })
  }

  findScript = name => {
    const script = scripts[name]

    if (!script) {
      return { script: null }
    }

    const params = script.params
      .reduce(
        (obj, item) => ({
          ...obj,
          [item.name]: item.defaultValue || ''
        }),
      {})

    return {
      script,
      params: script.params,
      state: params,
    }
  }

  handleSchedule = async () => {
    this.props.showLoader()

    const scriptName = this.scriptName()

    const wasStopped = instagram.isStopped

    wasStopped && instagram.start()

    const params = this.script.params
      .map(item => `${item.name} = ${this.state[item.name]}`)
      .join(`, `)

    this.props.printLog(`Scheduling script ${scriptName}: ${params}`)

    const startAt = Number(this.state.delay) * 60 * 1000 + Date.now()

    // this.props.printLog(`Start at: ${new Date(startAt)}`)

    if (!wasStopped) {
      alert(`
        Service indicates there is something else running.
        Be careful: Keep track manually if two different scripts don't overlap.
        If you're not sure, stop all other scripts before scheduling!
      `)
    }

    schedule.printLog = this.props.printLog
    schedule.add({ startAt, scriptName, params: this.state }, (err, res) => {
      this.props.printLog(`Scheduled task finished running!`)

      if (err) {
        this.props.printLog(`Error: ${err.message}`)
        alert(err.message)
      }

      if (res) {
        this.props.printLog(`Success: ${!!res}`)
      }

      console.log('error', err)
      console.log('result', res)

      wasStopped && instagram.kill()
      this.props.hideLoader()
    })

    this.props.printLog(`Task scheduled successfully. Please wait until it launches`)

    this.handleRedirectToLogs()
  }

  handleSubmit = async () => {
    this.props.showLoader()

    const scriptName = this.scriptName()

    const { showAlertAfterFinish } = this.state
    showAlertAfterFinish && this.props.notifyWhenQueueFinished()

    if (!instagram.isStopped) {
      alert(`Finish other tasks first!`)
      return
    }

    instagram.start()

    const params = this.script.params
      .map(item => `${item.name} = ${this.state[item.name]}`)
      .join(`, `)

    this.props.printLog(`Running script ${scriptName}: ${params}`)

    this.script.run(this.state, this.props.printLog)
      .then(res => this.props.sendMetrikaEvent(`task-success-${scriptName}`))
      .then(res => this.props.printLog(message.PRO_HEADER))
      .then(res => this.props.printLog(message.PRO_TEXT.replace(/<br>/g, '')))
      .then(res => this.props.printLog(`https://instagrambot.github.io/web/#/support-us`))
      .catch(err => {
          console.error(err)
          this.props.printLog(`Error: ${err.message}`)
          alert(err.message)
          this.props.sendMetrikaEvent(`task-error-${scriptName}`)
      })
      .finally(() => instagram.kill())
      .finally(() => this.props.hideLoader())

    this.props.sendMetrikaEvent(`task-started-${scriptName}`)

    this.handleRedirectToLogs()
  }

  handleChange = (event) => {
    const name = event.target.name
    const value = event.target.value

    this.setState({ [name]: value })
  }

  handleCheckboxChange = (event) => {
    const name = event.target.name
    const value = event.target.checked

    this.setState({ [name]: value })
  }

  handleNumberChange = (name, value) => (event) => {
    this.setState({
      [name]: value,
    })
  }

  handleRedirectToLogs = () => {
    this.setState({
      shouldRedirectToLogs: true,
    })
  }

  render () {
    const { params, showAlertAfterFinish, shouldRedirectToLogs } = this.state

    const scriptName = this.scriptName()

    if (shouldRedirectToLogs) {
      return <Redirect push to="/logs" />
    }

    if (!this.script) {
      return (
        <CardFullWidthPage>
          <h2>Script with name '{scriptName}' is not found</h2>
        </CardFullWidthPage>
      )
    }

    return (
      <CardFullWidthPage>
        <div className="row no-gutters align-items-center">
          <div className="col mr-12">
            <div className="text-xs font-weight-bold text-primary text-uppercase mb-12">
              {this.script.name || scriptName}
              &nbsp;
              {this.script.isPRO && (<ProBadge className="badge badge-pill badge-success text-xs" />)}
              {/* this.script.isPRO && (<ProBadge className="btn btn-sm text-xs" />) */}
            </div>
          </div>
        </div>

        {this.script.description && (<div className="row">
          <div className="col-8">
            <div className="pl-2 pb-2 pt-2" style={{ whiteSpace: 'pre-line' }}>
              {this.script.description}
            </div>
          </div>
        </div>)}

        {params.map(({ labelText, name, type, prefix, values }, index) => (
          <div className="row" key={index}>
            <div className="col-auto">
                {(type === 'text' || type === 'number')&& (
                  <label htmlFor={name}>{labelText || name}</label>
                )}

                {type === 'text' && (
                  <div className="input-group mb-3">
                    {prefix && (
                      <div className="input-group-prepend">
                        <span className="input-group-text" id={`${scriptName}-prefix-symbol-${prefix}`}>
                          {prefix}
                        </span>
                      </div>
                    )}

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id={`${scriptName}-${name}`}
                      name={name}
                      aria-describedby={`${scriptName}-prefix-symbol-${prefix}`}
                      value={this.state[name]}
                      onChange={this.handleChange}
                    />
                  </div>
                )}


                {type === 'checkbox' && (
                  <div className="form-check d-inline-block">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${scriptName}-${name}`}
                      name={name}
                      value={this.state[name]}
                      onChange={this.handleCheckboxChange}
                    />
                    <label className="form-check-label" htmlFor={name}>
                      {labelText || name}
                    </label>
                  </div>
                )}

                {type === 'number' && (
                  <div className="btn-group d-block mb-2">
                    {(values || [1, 2, 3, 5, 10]).map((num, index) => (
                      <Button
                        id={`${scriptName}-${name}`}
                        className={num == this.state[name] ? `btn-primary` : `btn-secondary`}
                        key={index}
                        data-value={num}
                        ymParams={{num}}
                        ym={`${scriptName}-${name}-select`}
                        onClick={this.handleNumberChange(name, num)}
                      >
                        {num}
                      </Button>
                    ))}

                  </div>
                )}

            </div>
          </div>
        ))}


        <br />

        <div className="row">
          <div className="col-auto">

          </div>
        </div>


        <div className="row">
          <div className="col-auto">
            <div className="btn-group d-inline-block mr-2">
              <Button
                className={this.script.isPRO ? "btn-outline-primary" : "btn-primary"}
                ym={`${scriptName}-submit`}
                onClick={this.handleSubmit}>
                Run!
              </Button>
            </div>

            {this.script.isPRO && (
              <div className="d-inline-block mr-3">
                <ProBadge>
                  Unlock PRO
                </ProBadge>
              </div>
            )}

            <div className="form-check d-inline-block">
              <input
                type="checkbox"
                className="form-check-input"
                id={`${scriptName}-showAlertAfterFinish`}
                name="showAlertAfterFinish"
                value={showAlertAfterFinish}
                onChange={this.handleChange}
              />
              <label
                className="form-check-label"
                htmlFor="showAlertAfterFinish">Notify when queue finishes
              </label>
            </div>
          </div>
        </div>

        {this.props.BETA_TEST && (
        <div className="row mt-2">

          <div className="col-auto">
            <div className="btn-group d-inline-block"
              data-tip="NOT STABLE YET! Use at your own risk"
              data-type="error"
              data-effect="solid">
              <Button
                className={"btn-outline-warning"}
                ym={`${scriptName}-schedule`}
                onClick={this.handleSchedule}>
                <i className="fas fa-plus"></i>&nbsp;
                Schedule for {this.state.delay} minutes
              </Button>
            </div>
          </div>

          <div className="col-auto">
            <input
              type="number"
              className="form-control"
              id={`${scriptName}-delay`}
              name='delay'
              value={this.state.delay}
              onChange={this.handleChange}
            />
          </div>

        </div>)}

        <ReactTooltip />
      </CardFullWidthPage>
    )
  }
}

const CreateTaskCard = connect(
  null,
  { notifyWhenQueueFinished, showLoader, hideLoader, printLog, sendMetrikaEvent }
)(__CreateTaskCard)
