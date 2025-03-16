# wweb-js

Message (Object)
├── \_data (Object)
│ ├── id (Object)
│ │ ├── fromMe: boolean
│ │ ├── remote: string (e.g., phone number with @c.us)
│ │ ├── id: string
│ │ └── \_serialized: string
│ ├── viewed: boolean
│ ├── body: string (the actual message text)
│ ├── type: string ("chat", "image", etc.)
│ ├── t: number (timestamp)
│ ├── from: string (sender, phone@c.us)
│ ├── to: string (recipient, phone@c.us)
│ ├── ack: number (acknowledgment status)
│ ├── isNewMsg: boolean
│ ├── star: boolean
│ ├── kicNotified: boolean
│ ├── isFromTemplate: boolean
│ ├── pollInvalidated: boolean
│ ├── isSentCagPollCreation: boolean
│ ├── latestEditMsgKey: null or value (if edited)
│ ├── latestEditSenderTimestampMs: null or number
│ ├── mentionedJidList: array
│ ├── groupMentions: array
│ ├── isEventCanceled: boolean
│ ├── eventInvalidated: boolean
│ ├── isVcardOverMmsDocument: boolean
│ ├── isForwarded: boolean
│ ├── labels: array
│ ├── hasReaction: boolean
│ ├── ephemeralDuration: number (seconds)
│ ├── ephemeralSettingTimestamp: number (timestamp)
│ ├── disappearingModeInitiator: string ("me" or "other")
│ ├── disappearingModeTrigger: string
│ ├── disappearingModeInitiatedByMe: boolean
│ ├── productHeaderImageRejected: boolean
│ ├── lastPlaybackProgress: number
│ ├── isDynamicReplyButtonsMsg: boolean
│ ├── isCarouselCard: boolean
│ ├── parentMsgId: null or string
│ ├── callSilenceReason: null or string
│ ├── isVideoCall: boolean
│ ├── callDuration: null or number
│ ├── isMdHistoryMsg: boolean
│ ├── stickerSentTs: number
│ ├── isAvatar: boolean
│ ├── lastUpdateFromServerTs: number
│ ├── invokedBotWid: null or string
│ ├── bizBotType: null or string
│ ├── botResponseTargetId: null or string
│ ├── botPluginType: null or string
│ ├── botPluginReferenceIndex: null or number
│ ├── botPluginSearchProvider: null or string
│ ├── botPluginSearchUrl: null or string
│ ├── botPluginSearchQuery: null or string
│ ├── botPluginMaybeParent: boolean
│ ├── botReelPluginThumbnailCdnUrl: null or string
│ ├── botMsgBodyType: null or string
│ ├── requiresDirectConnection: null or boolean
│ ├── bizContentPlaceholderType: null or string
│ ├── hostedBizEncStateMismatch: boolean
│ ├── senderOrRecipientAccountTypeHosted: boolean
│ ├── placeholderCreatedWhenAccountIsHosted: boolean
│ ├── links: array
│
├── id (Object) (same as \_data.id)
│ ├── fromMe: boolean
│ ├── remote: string
│ ├── id: string
│ └── \_serialized: string
│
├── ack: number
├── hasMedia: boolean
├── body: string (message text again)
├── type: string ("chat", "image", etc.)
├── timestamp: number
├── from: string (sender)
├── to: string (recipient)
├── deviceType: string (e.g., "android")
├── isForwarded: boolean
├── forwardingScore: number
├── isStatus: boolean
├── isStarred: boolean
├── fromMe: boolean
├── hasQuotedMsg: boolean
├── hasReaction: boolean
├── vCards: array
├── mentionedIds: array
├── groupMentions: array
├── isGif: boolean
├── links: array

---

Chat
├── id
│ ├── server: string
│ ├── user: string
│ └── \_serialized: string
├── name: string
├── isReadOnly: boolean
├── unreadCount: number
├── timestamp: number
├── archived: boolean
├── pinned: boolean
├── muteExpiration: number
└── lastMessage
├── \_data
│ ├── id
│ │ ├── fromMe: boolean
│ │ ├── remote: string
│ │ ├── id: string
│ │ └── \_serialized: string
│ ├── viewed: boolean
│ ├── body: string
│ ├── type: string
│ ├── t: number
│ ├── from
│ │ ├── server: string
│ │ ├── user: string
│ │ └── \_serialized: string
│ ├── to
│ │ ├── server: string
│ │ ├── user: string
│ │ └── \_serialized: string
│ ├── ack: number
│ ├── isNewMsg: boolean
│ ├── star: boolean
│ ├── kicNotified: boolean
│ ├── isFromTemplate: boolean
│ ├── pollInvalidated: boolean
│ ├── isSentCagPollCreation: boolean
│ ├── latestEditMsgKey: null
│ ├── latestEditSenderTimestampMs: null
│ ├── mentionedJidList: array
│ ├── groupMentions: array
│ ├── isEventCanceled: boolean
│ ├── eventInvalidated: boolean
│ ├── isVcardOverMmsDocument: boolean
│ ├── isForwarded: boolean
│ ├── labels: array
│ ├── hasReaction: boolean
│ ├── ephemeralDuration: number
│ ├── ephemeralSettingTimestamp: number
│ ├── disappearingModeInitiator: string
│ ├── disappearingModeTrigger: string
│ ├── disappearingModeInitiatedByMe: boolean
│ ├── productHeaderImageRejected: boolean
│ ├── lastPlaybackProgress: number
│ ├── isDynamicReplyButtonsMsg: boolean
│ ├── isCarouselCard: boolean
│ ├── parentMsgId: null
│ ├── callSilenceReason: null
│ ├── isVideoCall: boolean
│ ├── callDuration: null
│ ├── isMdHistoryMsg: boolean
│ ├── stickerSentTs: number
│ ├── isAvatar: boolean
│ ├── lastUpdateFromServerTs: number
│ ├── invokedBotWid: null
│ ├── bizBotType: null
│ ├── botResponseTargetId: null
│ ├── botPluginType: null
│ ├── botPluginReferenceIndex: null
│ ├── botPluginSearchProvider: null
│ ├── botPluginSearchUrl: null
│ ├── botPluginSearchQuery: null
│ ├── botPluginMaybeParent: boolean
│ ├── botReelPluginThumbnailCdnUrl: null
│ ├── botMsgBodyType: null
│ ├── requiresDirectConnection: boolean
│ ├── bizContentPlaceholderType: null
│ ├── hostedBizEncStateMismatch: boolean
│ ├── senderOrRecipientAccountTypeHosted: boolean
│ ├── placeholderCreatedWhenAccountIsHosted: boolean
│ └── links: array
├── id
│ ├── fromMe: boolean
│ ├── remote: string
│ ├── id: string
│ └── \_serialized: string
├── ack: number
├── hasMedia: boolean
├── body: string
├── type: string
├── timestamp: number
├── from: string
├── to: string
├── deviceType: string
├── isForwarded: boolean
├── forwardingScore: number
├── isStatus: boolean
├── isStarred: boolean
├── fromMe: boolean
├── hasQuotedMsg: boolean
├── hasReaction: boolean
├── vCards: array
├── mentionedIds: array
├── groupMentions: array
├── isGif: boolean
└── links: array
