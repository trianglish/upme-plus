const { connect } = ReactRedux

class __Topbar extends React.Component {
  codefundAdRef = null

  componentDidMount () {

    // https://codefund.app/properties/260/funder.js

    var evt = new Event('codefund');
    var uplift = {};

    function trackUplift() {
      try {
        var url = 'https://codefund.app/impressions/103e18c0-6fc2-4059-ba16-697223a85d80/uplift?advertiser_id=132';
        console.log('CodeFund is recording uplift. ' + url);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.send();
      } catch (e) {
        console.log('CodeFund was unable to record uplift! ' + e.message);
      }
    };

    function verifyUplift() {
      if (uplift.pixel1 === undefined || uplift.pixel2 === undefined) { return; }
      if (uplift.pixel1 && !uplift.pixel2) { trackUplift(); }
    }

    function detectUplift(count) {
      var url = 'https://cdn2.codefund.app/assets/px.js';
      if (url.length === 0) { return; }
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (count === 1) { detectUplift(2); }
            uplift['pixel' + count] = true;
          } else {
            uplift['pixel' + count] = false;
          }
          verifyUplift();
        }
      };
      xhr.open('GET', url + '?ch=' + count + '&rnd=' + Math.random() * 11);
      xhr.send();
    }

    try {
      var targetElement = this.codefundAdRef;

      targetElement.innerHTML = '<div id="cf"> <span class="cf-wrapper"> <a data-href="campaign_url" class="cf-text" target="_blank" rel="noopener"> <strong>Gitcoin</strong> <span>💰 Use your skills to grow Open Source while getting paid!</span> </a> <a href="https://codefund.app" data-target="powered_by_url" class="cf-powered-by" target="_blank" rel="noopener"> <em>ethical</em> ad by CodeFund <img data-src="impression_url"> </a> </span> </div>';
      targetElement.querySelector('img[data-src="impression_url"]').src = 'https://codefund.app/display/103e18c0-6fc2-4059-ba16-697223a85d80.gif?template=horizontal&theme=unstyled';
      targetElement.querySelectorAll('a[data-href="campaign_url"]').forEach(function (a) { a.href = 'https://codefund.app/impressions/103e18c0-6fc2-4059-ba16-697223a85d80/click?campaign_id=147'; });
      targetElement.querySelector('a[data-target="powered_by_url"]').href = 'https://codefund.app/invite/4U7PKDC4gKo';
      evt.detail = { status: 'ok', house: true };
      detectUplift(1);
    } catch (e) {
      console.log('CodeFund detected an error! Please verify an element exists with id="codefund". ' + e.message);
      evt.detail = { status: 'error', message: e.message };
    }

  }

  render () {
    const { props } = this

    return (
  <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
    {/* <!-- Topbar  --> */}

    {/* <!-- Sidebar Toggle (Topbar)  --> */}
    <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
      <i className="fa fa-bars"></i>
    </button>

    {/* <!-- Topbar Navbar  --> */}
    <ul className="navbar-nav ml-auto">

      <li className="nav-item">
        <span className="nav-link">
          <div id="codefund" ref={ref => this.codefundAdRef = ref}>CODEFUND AD</div>
        </span>
      </li>

      <div className="topbar-divider d-none d-sm-block"></div>

      {props.isLoading && (
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="loading-status mr-2 d-none d-lg-inline text-gray-600 small">
              Loading...
            </span>
          </span>
        </li>
      )}

      <div className="topbar-divider d-none d-sm-block"></div>


      {props.connection.status === CONNECTION.NOT_INSTALLED && (
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="connection-status mr-2 d-none d-lg-inline text-danger">
              <i className="fas fa-exclamation-triangle"></i>
              Website works only with our extension installed.
              Please make sure that you have an extension installed,
              you are using the latest Chrome, you are not on mobile.
            </span>
          </span>
        </li>
      )}

      {props.connection.status === CONNECTION.NOT_INSTALLED && (
        <div className="topbar-divider d-none d-sm-block"></div>
      )}

      {props.connection.status === CONNECTION.NOT_INSTALLED && (
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="install-extension mr-2 d-none d-lg-inline text-grey-600">
              <a
                className="btn btn-success"
                target="_blank"
                onClick={() => props.sendMetrikaEvent(`button-click-install-extension`)}
                href="https://chrome.google.com/webstore/detail/instagram-yourself/njonkbhnmmjgancfbncekpgkmidhbbpo"
              >
                Install extension
              </a>
            </span>
          </span>
        </li>
      )}

      {( props.connection.status === CONNECTION.NOT_LOGGED_IN
      || props.connection.status === CONNECTION.UNKNOWN)
      && (
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="connection-status mr-2 d-none d-lg-inline text-danger">
              <i className="fas fa-exclamation-triangle"></i>
              {' '}
              {props.connection.description}
            </span>
          </span>
        </li>
      )}


      {props.connection.status === CONNECTION.LOGGED_IN && (
        <li className="nav-item dropdown no-arrow">
          <span className="nav-link">
            <span className="instagram-status mr-2 d-none d-lg-inline text-gray-600 small">
              {props.instagram.isStopped && (
                <span>
                  Instagram Service: No current task
                </span>
              )}

              {!props.instagram.isStopped && (
                <span>
                  Instagram Service: Working
                </span>
              )}

              {!props.instagram.isStopped && (
                <Button
                  className="btn-danger d-sm-block btn-sm shadow-sm"
                  onClick={() => onKillAll(props.printLog)}>
                  Stop
                </Button>
              )}

            </span>
          </span>
        </li>
      )}


      {props.connection.status === CONNECTION.LOGGED_IN && (
        <div className="topbar-divider d-none d-sm-block"></div>
      )}

      {/* <!-- Nav Item - User Information  --> */}

      {props.connection.status === CONNECTION.LOGGED_IN && (
        <li className="nav-item dropdown no-arrow">
            <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                {props.user.username}
              </span>
              <img className="img-profile rounded-circle" src={props.user.profile_pic_url} />
            </a>
            {/* <!-- Dropdown - User Information --> */}
            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
              <a className="dropdown-item" href={props.user ? `https://www.instagram.com/${props.user.username}/` : `#`} target="_blank">
                <i className="fab fa-instagram fa-md fa-fw mr-2 text-gray-400"></i>
                Your Instagram
              </a>
              <a className="dropdown-item" href="https://chrome.google.com/webstore/detail/gram-up/njonkbhnmmjgancfbncekpgkmidhbbpo">
                <i className="fab fa-chrome fa-sm fa-fw mr-2 text-gray-400"></i>
                Rate Extension
              </a>
              {/* <a className="dropdown-item" href="#">
                <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                Activity Log
              </a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                Logout
              </a> */}
            </div>
        </li>
      )}

    </ul>

    {/* <!-- End of Topbar  --> */}
  </nav>
)
  }
}

const Topbar = connect(
  ({ user, isLoading, error, connection, instagram }) => ({ user, isLoading, error, connection, instagram }),
  { printLog, sendMetrikaEvent }
)(__Topbar)
