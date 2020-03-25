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


**Status**: 400 ???

```json
{
    "message": "feedback_required",
    ...
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

