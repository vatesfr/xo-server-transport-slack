import Slack from 'slack-node'
import { promisify } from 'promise-toolbox'

// ===================================================================

const logAndRethrow = error => {
  console.error('[WARN] plugin transport-slack:', error && error.stack || error)

  throw error
}

// ===================================================================

export const configurationSchema = {
  type: 'object',
  properties: {
    webhookUri: {
      type: 'string',
      description: 'The Mattermost or Slack webhook URL.'
    },
    channel: {
      type: 'string',
      description: 'Channel, private group, or IM channel to send message to.'
    },
    username: {
      type: 'string',
      description: 'Bot username.'
    },
    icon_emoji: {
      type: 'string',
      description: 'The bot icone. It can be a slack emoji or an URL image.'
    }
  },
  additionalProperties: false,
  required: ['webhookUri', 'channel']
}

// ===================================================================

class XoServerTransportNagios {
  constructor ({ xo }) {
    this._sendSlack = ::this._sendSlack
    this._set = ::xo.defineProperty
    this._unset = null

   // Defined in configure().
    this._conf = null
    this._send = null
  }

  configure ({
    webhookUri,
    ...conf
  }) {
    const slack = new Slack()
    slack.setWebhook(webhookUri)
    this._conf = conf
    this._send = promisify(slack.webhook)
  }

  load () {
    this._unset = this._set('sendSlack', this._sendSlack)
  }

  unload () {
    this._unset()
  }

  test () {
    return this._sendSlack({
      text: `Hi there,

The transport-slack plugin for Xen Orchestra server seems to be working fine, nicely done :)`
    })
  }

  _sendSlack ({
    text
  }) {
    this._conf.text = text
    // TODO: handle errors
    return this._send(this._conf).catch(logAndRethrow)
  }
}

export default opts => new XoServerTransportNagios(opts)
