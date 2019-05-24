// Inspired with Instabot API:
// https://github.com/instagrambot/instabot/blob/master/instabot/api/api.py
import { generate_uuid } from './helpers'

function is_user_id(user_id_or_username){
  return !isNaN(user_id_or_username)
}

export const get_user_info = (self, user_id_or_username) => {
  if (is_user_id(user_id_or_username)) {
    const user_id = user_id_or_username
    return self.send_request(`users/${user_id}/info/`)
  } else {
    const username = user_id_or_username
    return self.send_request(`users/${username}/usernameinfo/`)
  }
}

export const logout = async (self) => {
  if (!self.is_logged_in) {
    return true
  }

  const result = await self.send_request('accounts/logout/')

  self.is_logged_in = !result
  return result
}

export const get_user_followers = (self, user_id, max_id='') => {
  const rank_token = self.rank_token()
  const url = `friendships/${user_id}/followers/?max_id=${max_id}&rank_token=${rank_token}&`
  return self.send_request(url)
}

export const get_user_followings = (self, user_id, max_id='') => {
  const rank_token = self.rank_token()
  const url = `friendships/${user_id}/following/?max_id=${max_id}&rank_token=${rank_token}&`
  return self.send_request(url)
}

export const get_user_feed = (self, user_id, max_id='') => {
  const rank_token = self.rank_token()
  const url = `feed/user/${user_id}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`
  return self.send_request(url)
}

export const get_hashtag_feed = (self, hashtag, max_id='') => {
    const rank_token = self.rank_token()
    const url = `feed/tag/${hashtag}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`
    return self.send_request(url)
}

export const get_location_feed = (self, location_id, max_id='') => {
    const rank_token = self.rank_token()
    const url = `feed/location/${location_id}/?max_id=${max_id}&rank_token=${rank_token}&ranked_content=true&`
    return self.send_request(url)
}

export const media_info = (self, media_id) => {
  return self.send_request(`media/${media_id}/info/`)
}

export const like = (self, media_id) => {
  return self.send_request(`media/${media_id}/like/`, {})
}

export const unlike = (self, media_id) => {
  return self.send_request(`media/${media_id}/unlike/`, {})
}

export const follow = (self, user_id) => {
  return self.send_request(`friendships/create/${user_id}/`, {})
}

export const unfollow = (self, user_id) => {
  return self.send_request(`friendships/destroy/${user_id}/`, {})
}

export const user_friendship = (self, user_id) => {
  return self.send_request(`friendships/show/${user_id}/`, { user_id })
}

export const comment = (self, media_id, comment_text) => {
  return self.send_request(`media/${media_id}/comment/`, { comment_text })
}

export const reply_to_comment = (self, media_id, comment_text, replied_to_comment_id) => {
  return self.send_request(`media/${media_id}/comment/`, { comment_text, replied_to_comment_id })
}

export const delete_comment = (self, media_id, comment_id) => {
  return self.send_request(`media/${media_id}/comment/${comment_id}/delete/`, {})
}

export const get_user_story_feed = (self, user_id) => {
  return self.send_request(`feed/user/${user_id}/story/`)
}

export const search_location = (self, query, lat = '', lng = '') => {
  const rank_token = self.rank_token()
  return self.send_request(`fbsearch/places/?rank_token=${rank_token}&query=${query}&lat=${lat}&lng=${lng}`)
}

export const get_timeline = (self) => {
  return self.send_request(`feed/timeline/?rank_token=${self.rank_token()}&ranked_content=true`)
}

export const get_popular_feed = (self) => {
  return self.send_request(`feed/popular/?people_teaser_supported=1&rank_token=${self.rank_token()}&ranked_content=true`)
}

export const get_comment_likers = (self, comment_id) => {
  return self.send_request(`media/${comment_id}/comment_likers`)
}

export const get_media_likers = (self, media_id) => {
  return self.send_request(`media/${media_id}/likers`)
}

export const get_inbox = (self) => {
  return self.send_request(`direct_v2/inbox/?`)
}

export const get_thread = (self, thread_id, cursor_id = '') => {
  return self.send_request(`direct_v2/threads/${thread_id}/?use_unified_inbox=true&${cursor_id ? `cursor=${cursor_id}` : ''}`)
}

export const get_direct_share = (self) => {
  return self.send_request(`direct_share/inbox/?`)
}


export const get_pending_inbox = (self) => {
  return self.send_request(`direct_v2/pending_inbox/?persistentBadging=true&use_unified_inbox=true`)
}

export const approve_pending_thread = async (self, thread_id) => {
  const data = await self.default_data()

  return self.send_request(`direct_v2/threads/${thread_id}/approve/`, data)
}


const _prepare_recipients = (users, thread_id = null, use_quotes = false) => {
  const result = {}

  if (users && users.join) {
    result.users = `[[${users.join(',')}]]`
  }

  if (thread_id) {
    result.thread = use_quotes ? `["${thread_id}"]` : `[${thread_id}]`
  }

  return result
}

export const send_direct_item = async (self, item_type = 'text', options = {}) => {

  const mutation_token = generate_uuid(true)

  const data = {
    'client_context': generate_uuid(true),
    'action': 'send_item',
  }

  const text = options['text'] || ''

  if (item_type == 'link') {
    data['link_text'] = text
    data['link_urls'] = JSON.stringify(options.urls) // json.dumps(options.get('urls'))
  } else if (item_type == 'text') {
    data['text'] = text
  } else if (item_type == 'media_share') {
    data['text'] = text
    data['media_type'] = options.media_type || 'photo' // options.get('media_type', 'photo')
    data['media_id'] = options.media_id || ''
  } else if (item_type == 'hashtag') {
    data['text'] = text
    data['Hashtag'] = options.hashtag || ''
  } else if (item_type == 'profile') {
    data['text'] = text
    data['profile_user_id'] = options.profile_user_id || ''
  }

  const { thread, users } = _prepare_recipients(options.users, options.thread, false)

  if (thread) {
    data['thread_ids'] = thread
  } else if (users) {
    data['recipient_users'] = users
  } else {
    return false
  }

  // data.update(self.default_data)
  const default_data = await self.default_data()

  const _data = {
    ...default_data,
    ...data,
  }

  console.log('_data', _data)

  return self.send_request(`direct_v2/threads/broadcast/${item_type}/`, _data, { with_signature: false, form: true })
}
