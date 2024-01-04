const isValidKey = (
  key: string | number | symbol,
  object: object): key is keyof typeof object => {
  return key in object
}
const storageChatParams = (chatParams: Chat.ChatParams) => {
  Object.keys(chatParams).forEach((key) => {
    if (isValidKey(key, chatParams))
      localStorage.setItem(key, chatParams[key])
  })
}

const storageKnowledgeParams = (knowledgeParams: Chat.KnowledgeParams) => {
  Object.keys(knowledgeParams).forEach((key) => {
    if (isValidKey(key, knowledgeParams))
      localStorage.setItem(key, knowledgeParams[key])
  })
}

const clearChatParams = (chatParams: Chat.ChatParams) => {
  Object.keys(chatParams).forEach((key) => {
    localStorage.removeItem(key)
  })
}

const clearKnowledgeParams = (knowledgeParams: Chat.KnowledgeParams) => {
  Object.keys(knowledgeParams).forEach((key) => {
    localStorage.removeItem(key)
  })
}

export { storageChatParams, storageKnowledgeParams, clearChatParams, clearKnowledgeParams }
