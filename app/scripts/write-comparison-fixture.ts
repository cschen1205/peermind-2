import { writeFileSync, readFileSync } from 'node:fs'
import { compareIndependentReviews } from '@/data/compareReviews'
import { splitConferenceDiscussion } from '@/data/adapters/reviewFileAdapter'
import { extractReviewRatings } from '@/data/extractReviewScores'
import type { ComparisonPreset, HumanReviewInput } from '@/types/comparison'

const root = '/home/cschen/projects/peermind-2'
const pkg = JSON.parse(readFileSync(`${root}/app/public/demo-data/model-soups-v1.demo.json`, 'utf8'))
const chatgptText = readFileSync(`${root}/papers/chatgpt_review_v1.md`, 'utf8')
const humanText = readFileSync(`${root}/papers/human_review_v1.md`, 'utf8')

function withRatings(review: Omit<HumanReviewInput, 'id'> & { id: string }): HumanReviewInput {
  const ratings = extractReviewRatings(review.reviewText)
  return ratings.length > 0 ? { ...review, ratings } : review
}

const chatgpt = withRatings({
  id: 'BR-chatgpt-v1',
  label: 'ChatGPT',
  reviewText: chatgptText.trim(),
  sourceType: 'other',
  fileName: 'chatgpt_review_v1.md',
})

const humans = splitConferenceDiscussion(humanText).map((review) =>
  withRatings({
    ...review,
    id: `HR-${review.label.replace(/^Reviewer\s+/i, '')}`,
    label: `OpenReview - ${review.label}`,
    fileName: 'human_review_v1.md',
  }),
)

const inputs = { humanReviews: [chatgpt, ...humans] }
const result = compareIndependentReviews(pkg, inputs)

const preset: ComparisonPreset = {
  id: 'model-soups-v1-human-comparison',
  inputs,
  result,
}

const out = `${root}/app/public/demo-data/model-soups-v1.comparison.json`
writeFileSync(out, `${JSON.stringify(preset, null, 2)}\n`)
console.log(
  `Wrote ${out} themes=${result.themes.length} shared=${result.summary.sharedCount} reviewers=${inputs.humanReviews.length}`,
)
