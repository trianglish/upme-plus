// const { replaceHeaders } = require('./GramUp/src/background/services/insecure_headers')

const PREFIX = 'X-Instaweb-'

const FILTER = { urls: ['https://i.instagram.com/*'] }

const onHeadersReceived = (details, callback) => {

  if (details.method !== 'OPTIONS') {
    // details.responseHeaders['access-control-allow-origin'] = '*'
  } else {
    details.responseHeaders['access-control-allow-headers'] = '*'
  }

  // callback({ responseHeaders: details.responseHeaders })
  callback({ responseHeaders: details.responseHeaders })
}

const onBeforeSendHeaders = (details, callback) => {

  const headers = details.requestHeaders

  // const new_headers = replaceHeaders(details.requestHeaders)

  const new_headers = Object.keys(headers)
    .filter(header => header.includes(PREFIX))
    .map(header => {
      return {
        name: header.replace(PREFIX, ''),
        value: headers[header],
      }
    })

  console.log('new headers', new_headers)

  Object.keys(headers).forEach(header => {
    const new_header = new_headers.find(_ => _.name === header)

    if (new_header) {
      console.log(`changing header '${header}' to '${new_header.name}':`, new_header.value)
      headers[header] = new_header.value
    }
  })

  console.log('edited headers', headers)

  // return {
  //   requestHeaders: headers,
  // }

  callback({ requestHeaders: details.requestHeaders })
}

module.exports = {
  FILTER,
  onBeforeSendHeaders,
  onHeadersReceived,
}
