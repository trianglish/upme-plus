# [Up!](https://gramup.me/)

Up! - We Automate boring social network stuff for you. Start to get followers for free without any coding skills.

[<img width="200" alt="GramUp" src="https://user-images.githubusercontent.com/1909384/77645412-bcf02b80-6f73-11ea-8992-07755920b061.png">](https://get.gramup.me)

# [Download the extension!](https://get.gramup.me)

## [Video demo](https://www.youtube.com/watch?v=CPFkPjB0lzQ)

<a href="https://www.producthunt.com/posts/gram-up?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-gram-up" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=152224&theme=light" alt="GramUp! - Automate boring social network stuff with your browser for free. | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px" /></a>

[![paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/okhlopkov/10)
[![patreon](https://camo.githubusercontent.com/6446a7907a4d4f8de024ec85750feb07d7914658/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f70617472656f6e2d646f6e6174652d79656c6c6f772e737667)](https://patreon.com/join/morejust)

----

## Automate social network with your browser!

> Yes, we moved [Instabot](https://github.com/instagrambot/instabot) to the browser. No coding skills needed! Just our [extension](https://get.gramup.me).

This browser extension can help you to:
* Get Free 100 likes
* Double your followers
* Start Earning with your

There are a lot of ways to automate your activity in social networks but you have to give them your credentials to allow them perform in-app activity for you. As a result you can eventually found yourself being subscribed to unknown people or even lose your account.

We found a hack that allowed to insert all automation scripts into a browser. As a result, we don’t need a backend and your private data - your passwords never left your browser. And we made this tool completely free and open source. Miracle? Reality!

If you find our free tool useful or just want more features available, please donate [Paypal](https://paypal.me/okhlopkov/500) or become our [Patron](https://patreon.com/morejust).

### Features

- Like posts by hashtag, by user, by location
- [Send and receive](https://github.com/instagrambot/gramup-dm) Direct messages
- Follow users' followers, followees
- Follow users' who posted to hashtag
- Follow likers of a hashtag or a user
- Comment medias by hashtag
- Download users' followers, stories or emails
- ... And many more are coming! Drop us a line into [Telegram](https://t.me/instabotproject) for feature request!

### Minimal Requirements

While we are in early alpha version, to use our service you should fit these requirements:

1. Update Google Chrome browser
2. Install [Extension](https://get.gramup.me)
3. Don't close the website while it doing his job. If you close tab - everything would stop.

### How to start automating

1. Install and update your [Google Chrome browser](https://chrome.google.com)
2. Install our extension from the [Official store](https://get.gramup.me/)
3. Press our pink extension icon and login with your account (we don't have a backend, so don't store your credentials)
4. Open [Dashboard](https://dashboard.gramup.me/)
5. Enjoy!

---------  
# More details

## Tasks

Task is a collection of the requests, for example, a series of likes sent to user media. There are few types of tasks, some are listed above in the "Features" section: like by hashtag, like user's media, follow followers etc. Tasks are added to the queue.

  **When one task is added to the queue, you can't run any new tasks.**

This is intentional: we automatically make big pauses between all the requests so that we don't flood the API. If you want to run a new task, stop current, wait until it unwinds, and then continue.

During the work, task prints all the relevant information to the log. If one of the requests fail, task will continue to progress, and you can see an error and it's description in the log.

**If you were downloading something, the previous and the following results should be saved OK**

If some error happens and all the requests fail, you can stop the task manually. You'll need to wait until it will unwind to it's end, though. However, don't worry, **the data you've already downloaded should be safe and sound.**

If you feel the need for some custom task, you can drop us a feature request into [Issues](https://github.com/instagrambot/gramup/issues/new), [Telegram](https://t.me/instabotproject) or contribute here: [build custom task (Javascript)](https://github.com/instagrambot/gramup/blob/master/client/src/scripts.js).

## Updating the extension

While we are in early alpha version (again, sorry), please keep our Extension updated. Your browser should update it automatically. You can update it manually:

1. Go to [chrome://extensions](chrome://extensions)
2. Press update button on the top
<img width="300" alt="Developer mode" src="https://user-images.githubusercontent.com/1909384/53411050-9198b700-39d6-11e9-8300-088791dcf6dc.png">

## Troubleshooting

If you passed all steps in Installation guide and you sure that you satisfied all conditions but something went wrong, please try to handle the issue by yourself. Just follow this 'reset' steps:

1. Restart the browser
2. Check for [extension updates](chrome://extensions) on chrome://extensions
3. Logout and login again in the extension
4. Delete extension and reinstall it

If it still fails, please follow [the guide](https://github.com/instagrambot/gramup/issues/1) to provide us with all data we may need to fix this. Send all screenshots to [GitHub Issues](https://github.com/instagrambot/gramup/issues/new). Thanks!


# For developers Only
If you want to code some features to the website, you can clone the repo and:

## Build Chrome Extension Manually

``` bash
npm i
npm run build
```

## Add built Extension to Google Chrome

1. Build extension manually
2. Open [chrome://extensions](chrome://extensions) in Chrome
3. If not enabled, enable Developer mode on the right side:
<img width="391" alt="Developer mode" src="https://user-images.githubusercontent.com/1909384/52903546-0ed26800-3230-11e9-8ae1-e0c2e5070191.png">
4. Choose `Load unpacked` and point Chrome to the `chrome-ext` dir in this repo.
<img width="391" alt="Load unpacked button" src="https://user-images.githubusercontent.com/1909384/52903494-53a9cf00-322f-11e9-9c29-29540586cecb.png">


# Final words

Get free real followers and likes with our open source Chrome extension app. We've already developed a really good growth strategies for you. Join now: https://get.gramup.me.

----------
*authors: [@caffeinum](https://github.com/caffeinum), [@ohld](https://github.com/ohld). Love [Morejust](https://morejust.foundation).*

<a href="https://www.buymeacoffee.com/okhlopkov" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

[![paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/okhlopkov/10)
[![patreon](https://camo.githubusercontent.com/6446a7907a4d4f8de024ec85750feb07d7914658/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f70617472656f6e2d646f6e6174652d79656c6c6f772e737667)](https://patreon.com/morejust)
----------
