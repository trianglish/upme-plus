export const get_locale = () => {
    try {
        if (window.navigator.languages) {
            return window.navigator.languages[0];
        } else {
            return window.navigator.userLanguage || window.navigator.language;
        }
    } catch (err) {
        console.error(err)
        return null
    }
}