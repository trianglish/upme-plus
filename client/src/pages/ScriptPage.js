const { connect } = ReactRedux

class __ScriptPage extends React.Component {

  render () {
    const scriptName = this.props.match.params.name
    const BETA_TEST = this.props.location.search.includes("BETA_TEST")

    return (
      <div className="container-fluid">
        <CreateTaskCard name={scriptName} BETA_TEST={BETA_TEST} />
      </div>
    )
  }
}

const ScriptPage = connect(
  null,
  { }
)(__ScriptPage)
