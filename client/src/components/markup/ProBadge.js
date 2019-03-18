const message = {
  PRO_HEADER: `Here's our "business model":`,
  PRO_TEXT: `
 We decided it's better to spend time building PRO features, <br>
 than setting up payment system to charge for them, so <br>
 we'll be giving them for free. <br>

 If you like the feature, consider donating 5$ a month!
 `
}

class ProBadge extends React.Component {
  state = {
    isOpened: false,
  }

  togglePayment = () => {
    this.setState({
      isOpened: !this.state.isOpened,
    })
  }

  render () {
    const { isOpened } = this.state
    const { isBanner, children, className } = this.props

    if (!isBanner) {
      return (
        <Link className={className || 'btn btn-success'} to="/support-us"
          data-tip={`${message.PRO_HEADER}<br><br><br>${message.PRO_TEXT}`}
          data-multiline="true"
          data-place="top"
          data-effect="solid"
          data-class="text-sm"
          onClick={() => ReactTooltip.hide()}
        >
          {children
            ? children
            : (<span>
                <i className="fa fa-star"></i>
                <span>PRO</span>
              </span>)}
        </Link>
      )
    }

    return (<div className="d-flex justify-between pt-4 pb-2">

      <div className="col-auto">
        <Link className="btn btn-success" to="/support-us"
          data-tip={`${message.PRO_HEADER}<br><br><br>${message.PRO_TEXT}`}
          data-multiline="true"
          data-place="top"
          data-effect="solid"
          data-class="text-sm"
        >
          <i className="fa fa-star"></i>
          <span>PRO</span>
        </Link>
      </div>

      {(isOpened && isBanner) && (
        <Fragment>
          <div className="col-auto">
            <a className="btn btn-danger" href="http://paypal.me/okhlopkov/300" target="_blank">
              Donate via Paypal
            </a>
          </div>
          <div className="col-auto">
            <a className="btn btn-primary" href="https://www.patreon.com/join/morejust" target="_blank">
              Support via Patreon
            </a>
          </div>
          <div className="col-auto">
            <a className="btn btn-warning" href="https://liberapay.com/caffeinum/donate" target="_blank">
              Donate via Liberapay
            </a>
          </div>
        </Fragment>
      )}

    </div>)
  }
}
