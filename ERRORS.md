# Collection of errors



## Logged out

**Status**: 403 Forbidden

```json
{
    "message": "login_required",
    "error_title": "You've Been Logged Out",
    "error_body": "Please log back in.",
    "logout_reason": 2,
    "status": "fail"
}
```


## feedback_required

**Status**: 400

```json
{
    "message": "feedback_required",
    "comment_error_key": "comment_si_blocked",
    "spam": true,
    "feedback_title": "Action Blocked",
    "feedback_message": "This action was blocked. Please try again later. We restrict certain content and actions to protect our community. Tell us if you think we made a mistake.",
    "feedback_url": "repute/report_problem/instagram_comment/",
    "feedback_appeal_label": "Report problem",
    "feedback_ignore_label": "OK",
    "feedback_action": "report_problem",
    "status": "fail"
}
```

```json
{
    "message": "feedback_required",
    "spam": true,
    "feedback_title": "Action Blocked",
    "feedback_message": "This action was blocked. Please try again later. We restrict certain content and actions to protect our community. Tell us if you think we made a mistake.",
    "feedback_url": "repute/report_problem/instagram_like_add/",
    "feedback_appeal_label": "Tell us",
    "feedback_ignore_label": "OK",
    "feedback_action": "report_problem",
    "status": "fail"
}
```


## bad_password

**Status**: 400

Only on `/login`

```json
{
    "message": "The password you entered is incorrect. Please try again.",
    "invalid_credentials": true,
    "error_title": "Incorrect password for neuralcat",
    "buttons": [{"title": "Try Again", "action": "dismiss"}],
    "status": "fail",
    "error_type": "bad_password"
}
```

## Too many requests

**Status**: 429

```javascript
console.error(`That means 'too many requests'. I'll go to sleep for ${sleep_minutes}minutes`)
```

## Empty error

**Status**: 405

When there's wrong endpoint, for example,
```
/friendships/show/:pk/
```
has extra `/` in the end

```javascript
if (status === 405) {
    // Empty data
    throw new Error('Empty response 405')
}
```

## Error

```javascript
if (status === 400) {
    const error_message = data.message
    const error_type = data.error_type

    console.log(`Instagram's error message: ${error_message}, Error type: ${error_type}`)
    throw new Error(`InstagramError: ${error_type}: ${error_message}`)
}
```

Example:

```
Request URL: https://i.instagram.com/api/v1/media/2274212798530940616/like/
Request Method: POST
Status Code: 400
```

```json
{
  "message": "Sorry, this media has been deleted",
  "like_error_key": "like_media_does_not_exist",
  "status": "fail"
}
```
