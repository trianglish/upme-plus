const { connect } = ReactRedux
const { Redirect } = ReactRouterDOM
const { Fragment } = React

class __LikePage extends React.Component {

  state = {
    hashtag: 'cats',
    nPhotos: 10,
    showAlertAfterFinish: false,
    shouldRedirectToLogs: false,
  }

  handleLikeHashtagButton = async () => {
    this.props.showLoader()

    const { hashtag, nPhotos, showAlertAfterFinish } = this.state

    showAlertAfterFinish && this.props.notifyWhenQueueFinished()

    try {
      if (!instagram.isStopped) {
        alert(`Please stop all other tasks before running!`)
        return
      }

      likePhotosByHashtag(hashtag, nPhotos, this.props.printLog)
        .then(() => this.props.sendMetrikaEvent(`task-success-like-hashtag`))
        .catch(err => {
            console.error(err)
            this.props.printLog(`Error: ${err.message}`)
            alert(err.message)
            this.props.sendMetrikaEvent(`task-error-like-hashtag`)
        })
        .finally(() => this.props.hideLoader())

      this.props.sendMetrikaEvent(`task-started-like-hashtag`)

      this.handleRedirectToLogs()
    } catch (err) {
      console.error(err)
      this.props.printLog(`Error: ${err.message}`, false)
      alert(err.message)
    } finally {
      this.props.hideLoader()
    }
  }

  handleChange = (event) => {
    const name = event.target.name
    const value = event.target.value

    this.setState({ [name]: value })
  }

  handlePhotosNumberChange = (num = 10) => (event) => {
    this.setState({
      nPhotos: num,
    })
  }

  handleRedirectToLogs = () => {
    this.setState({
      shouldRedirectToLogs: true,
    })
  }

  render () {
    const { nPhotos, hashtag, showAlertAfterFinish, shouldRedirectToLogs } = this.state

    if (shouldRedirectToLogs) {
      return <Redirect push to="/logs" />
    }

    return (
      <div className="container-fluid">
        <CreateTaskCard name="like_by_hashtag" />
        <CreateTaskCard name="like_location" />
        <CreateTaskCard name="like_user" />
        <CreateTaskCard name="like_followers" />
      </div>
    )
  }
}

const LikePage = connect(
  null,
  { likePhotosByHashtag, notifyWhenQueueFinished, showLoader, hideLoader, printLog, sendMetrikaEvent }
)(__LikePage)
