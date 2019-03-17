const { connect } = ReactRedux
const { Redirect } = ReactRouterDOM

class __ScriptPage extends React.Component {

  render () {
    const scriptName = this.props.match.params.name

    return (
      <CreateTask name={scriptName} />
    )
  }
}

const ScriptPage = connect(
  null,
  { }
)(__ScriptPage)
