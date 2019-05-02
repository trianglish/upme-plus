# [Gram Up!](https://gramup.me/)

Gram Up - We Automate boring Instagram stuff for you like mass liking, commenting, parsing etc. 

[<img width="200" alt="Instagrambot Web" src="https://user-images.githubusercontent.com/1909384/52903490-47be0d00-322f-11e9-954c-9035f4d9ac7f.png">](https://chrome.google.com/webstore/detail/instagram-yourself/njonkbhnmmjgancfbncekpgkmidhbbpo)
<img width="200" alt="Instagrambot Gif" src="https://raw.githubusercontent.com/instagrambot/gramup/master/client/img/gif.gif">

# [Download the extension!](https://chrome.google.com/webstore/detail/instagram-yourself/njonkbhnmmjgancfbncekpgkmidhbbpo)

## [Video demo](https://www.youtube.com/watch?v=CPFkPjB0lzQ)

<a href="https://www.producthunt.com/posts/gram-up?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-gram-up" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=152224&theme=light" alt="Gram Up! - Automate boring Instagram stuff with your browser for free. | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px" /></a>

----

## Automate your Instagram with your browser!

> Yes, we moved [Instabot](https://github.com/instagrambot/instabot) to the browser. No coding skills needed! Just our [extension](https://get.gramup.me).

There are a lot of similar products but you have to give them your Instagram credentials to allow them perform in-app activity for you. As a result you can eventually found yourself being subscribed to unknown people.

We found a hack that allowed to insert all automation scripts into a browsers. As a result, we don’t need a backend and your private data - your passwords never left your browser. And we made this tool completely free. Miracle? Reality! 

If you find our free tool useful or just want more features available, please donate [Paypal](https://paypal.me/okhlopkov/500) or become our [Patron](https://patreon.com/join/morejust).

## Features

- Like posts by hashtag
- Like posts by user
- Follow users' followers
- Follow users' followings
- Follow users' who posted to hashtag
- Follow likers of a hashtag or a user
- Comment medias by hashtag
- Download users' followers and stories
- Stop any task at any moment – results will still be available
- ... And many more are coming! Drop us a line into [Telegram](https://t.me/instabotproject)

## Minimal Requirements

While we are in early alpha version, to use our service you should fit these requirements:

1. Update Google Chrome browser
2. Install [Extension](https://chrome.google.com/webstore/detail/instagram-yourself/njonkbhnmmjgancfbncekpgkmidhbbpo)
3. Disable 2FA on your Instagram account
4. Don't close the website while it doing his job. If you close tab - everything would stop.

## How to start automating your Instagram

1. Install and update your [Google Chrome browser](https://chrome.google.com)
2. Install our extension from the [Official store](https://get.gramup.me/)
3. Press our pink icon and login with your Instagram account
4. Open [Dashboard](https://insta.gramup.me/)
5. Enjoy!


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


----------
*authors: [@caffeinum](https://github.com/caffeinum), [@ohld](https://github.com/ohld). Love [Morejust](https://morejust.foundation).*

<a href="https://www.buymeacoffee.com/okhlopkov" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
----------
