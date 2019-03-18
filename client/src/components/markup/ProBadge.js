const message = {
  PRO_HEADER: `Here's our business model:`,
  PRO_TEXT: `
 We decided it's better to spend time building PRO features, <br>
 than setting up payment system to charge for them, so if you like it, <br>
 consider donating 5$ a month!
 `
}

const ProBadge = props => (<div className="row pt-4 pb-2">
  <ReactTooltip />

  <div className="col-auto">
    <Link className="btn btn-success" to="/support-us"
      data-tip={`${message.PRO_HEADER}<br><br>${message.PRO_TEXT}`}
      data-multiline="true"
      data-place="top"
      data-effect="solid"
      data-class="text-sm"
    >
      PRO feature <i className="fa fa-info"></i>
    </Link>
  </div>
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
</div>)
