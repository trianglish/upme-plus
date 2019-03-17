const { connect } = ReactRedux

class __ScriptPage extends React.Component {

  render () {
    const scriptName = this.props.match.params.name

    return (
      <div className="container-fluid">
        <CreateTaskCard name={scriptName} />
      </div>
    )
  }
}

const ScriptPage = connect(
  null,
  { }
)(__ScriptPage)
