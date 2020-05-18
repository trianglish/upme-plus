import amplitude from 'amplitude-js'

export const instance = amplitude.getInstance()

instance.init('42ca3c6562cdbef619110c8b1d8bcfec')

export const logEvent = (name, eventProperties) => {
  try {
    instance.logEvent(name, eventProperties)
  } catch (err) {
    console.log('AmplitudeError', err)
  }
}

export const identify = (key, value) => {
  try {
    const identify = new amplitude.Identify().add(key, value)
    instance.identify(identify)
  } catch (err) {
    console.log('AmplitudeError', err)
  }
}
