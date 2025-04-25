import { TWord } from './word'

export type SearchWordsResponse = {
  words: string[]
  totalCount: number
}

export type WordResponse = {
  word: string
  details: TWord
}

export type APIError = {
  message: string
  status: number
} 