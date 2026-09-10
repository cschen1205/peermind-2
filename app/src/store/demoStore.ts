import { create } from 'zustand'
import {
  cloneBundle,
  emptyComparisonInputs,
  emptyHumanReview,
  nextReviewIndex,
  parseComparisonJson,
} from '@/data/adapters/comparisonInputAdapter'
import {
  fetchComparisonFixture,
  fetchPreparedPackage,
} from '@/data/adapters/bundledPackageAdapter'
import { compareIndependentReviews } from '@/data/compareReviews'
import {
  replaceSlotWithReviews,
  type ReviewFileParseResult,
} from '@/data/adapters/reviewFileAdapter'
import { loadDemoPackage } from '@/data/loadDemoPackage'
import { matchAskResponse } from '@/data/matchAsk'
import { deriveSectionId, getNode, nodesForSources } from '@/data/queryPackage'
import { readSessionSnapshot, writeSessionSnapshot } from '@/data/sessionPersistence'
import type { AskContextScope, AskResponse } from '@/types/ask'
import type {
  ComparisonInputBundle,
  ComparisonResult,
  HumanReviewInput,
  LockedRun,
} from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { ConferenceStyle } from '@/types/paper'

export type PackageStatus = 'empty' | 'loading' | 'ready' | 'invalid'
export type DemoStage =
  | 'intake'
  | 'understand'
  | 'plan'
  | 'review'
  | 'verify'
  | 'synthesize'
  | 'compare'
  | 'revise'

export type VerifyPanel = 'evidence' | 'impact'

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete'

type AskAction = NonNullable<AskResponse['actions']>[number]
type OptionalReviewKey = 'metaReview' | 'authorRebuttal' | 'baselineReview'

export interface DemoState {
  package?: DemoDataPackage
  packageStatus: PackageStatus
  packageError?: string
  packageErrors: string[]

  currentStage: DemoStage
  verifyPanel: VerifyPanel

  selectedSectionId?: string
  selectedPaperNodeId?: string
  selectedSourceIds: string[]
  selectedFindingId?: string
  selectedComparisonThemeId?: string

  playback: {
    runId?: string
    eventIndex: number
    status: PlaybackStatus
  }

  lockedRun?: LockedRun

  comparisonInputs: ComparisonInputBundle
  comparisonResult?: ComparisonResult
  comparisonUsedPrepared: boolean

  ask: {
    open: boolean
    scope: AskContextScope
    contextIds: string[]
    query: string
    response?: AskResponse
  }

  toast?: string
  uploadedPaperUrl?: string
  uploadedPaperName?: string

  setStage: (stage: DemoStage) => void
  setVerifyPanel: (panel: VerifyPanel) => void
  setSelectedSectionId: (id?: string) => void
  setSelectedPaperNodeId: (id?: string) => void
  setSelectedSourceIds: (ids: string[]) => void
  setSelectedFindingId: (id?: string) => void
  setSelectedComparisonThemeId: (id?: string) => void
  focusSelection: (input: {
    sourceIds: string[]
    paperNodeId?: string
    findingId?: string
    sectionId?: string
  }) => void
  clearToast: () => void
  showToast: (message: string) => void
  loadFromUnknown: (raw: unknown, conferenceStyle?: ConferenceStyle) => boolean
  syncPreparedPackage: () => Promise<void>
  beginLoading: () => void
  failLoading: (message: string) => void
  clearIntake: () => void
  applyConferenceStyle: (style: ConferenceStyle) => void
  setUploadedPaper: (url?: string, name?: string) => void
  resetDemo: () => void
  setPlaybackIndex: (eventIndex: number) => void
  setPlaybackStatus: (status: PlaybackStatus) => void
  resetPlayback: (runId?: string) => void
  lockRun: () => void
  setComparisonInputs: (inputs: ComparisonInputBundle) => void
  updateHumanReview: (id: string, patch: Partial<HumanReviewInput>) => void
  addHumanReviewer: () => void
  removeHumanReviewer: (id: string) => void
  setOptionalReview: (key: OptionalReviewKey, value?: HumanReviewInput) => void
  loadPreparedComparison: () => Promise<boolean>
  runPreparedCompare: () => boolean
  runCompare: () => boolean
  importComparisonJson: (raw: unknown) => boolean
  importReviewParse: (slotId: string, parsed: ReviewFileParseResult, preferredLabel?: string) => boolean
  openAsk: (scope: AskContextScope, contextIds: string[]) => void
  closeAsk: () => void
  submitAsk: (query: string, promptId?: string) => void
  runAskAction: (action: AskAction) => void
}

const emptyAsk: DemoState['ask'] = {
  open: false,
  scope: 'whole_paper',
  contextIds: [],
  query: '',
}

const emptyPlayback: DemoState['playback'] = {
  eventIndex: 0,
  status: 'idle',
}

function restoreSessionIfNeeded() {
  if (typeof window === 'undefined') return undefined
  const path = window.location.pathname
  if (path === '/' || path === '/intake' || path === '') {
    writeSessionSnapshot(undefined)
    return undefined
  }
  return readSessionSnapshot()
}

const restored = restoreSessionIfNeeded()

function persist(state: DemoState) {
  if (state.packageStatus !== 'ready' || !state.package) {
    writeSessionSnapshot(undefined)
    return
  }
  writeSessionSnapshot({
    package: state.package,
    lockedRun: state.lockedRun,
    selectedFindingId: state.selectedFindingId,
  })
}

export const useDemoStore = create<DemoState>((set, get) => ({
  package: restored?.package,
  packageStatus: restored ? 'ready' : 'empty',
  packageErrors: [],
  currentStage: 'intake',
  verifyPanel: 'evidence',
  selectedSourceIds: [],
  selectedFindingId: restored?.selectedFindingId,
  playback: emptyPlayback,
  lockedRun: restored?.lockedRun,
  comparisonInputs: emptyComparisonInputs(),
  comparisonUsedPrepared: false,
  ask: emptyAsk,

  setStage: (currentStage) => set({ currentStage }),
  setVerifyPanel: (verifyPanel) => set({ verifyPanel }),
  setSelectedSectionId: (selectedSectionId) => set({ selectedSectionId }),
  setSelectedPaperNodeId: (selectedPaperNodeId) => set({ selectedPaperNodeId }),
  setSelectedSourceIds: (selectedSourceIds) => set({ selectedSourceIds }),
  setSelectedFindingId: (selectedFindingId) => {
    set({ selectedFindingId })
    persist(get())
  },
  setSelectedComparisonThemeId: (selectedComparisonThemeId) => set({ selectedComparisonThemeId }),
  focusSelection: ({ sourceIds, paperNodeId, findingId, sectionId }) => {
    set((state) => {
      const pkg = state.package
      const derivedSection = pkg ? deriveSectionId(pkg, sourceIds) : undefined
      const derivedNodeId = pkg ? nodesForSources(pkg, sourceIds)[0]?.id : undefined
      return {
        selectedSourceIds: sourceIds,
        selectedSectionId: sectionId ?? derivedSection,
        selectedPaperNodeId: paperNodeId ?? derivedNodeId,
        selectedFindingId: findingId ?? state.selectedFindingId,
      }
    })
    persist(get())
  },
  clearToast: () => set({ toast: undefined }),
  showToast: (message) => set({ toast: message }),

  beginLoading: () =>
    set({
      packageStatus: 'loading',
      packageError: undefined,
      packageErrors: [],
    }),

  failLoading: (message) => {
    set({
      package: undefined,
      packageStatus: 'invalid',
      packageError: message,
      packageErrors: [message],
    })
    persist(get())
  },

  loadFromUnknown: (raw, conferenceStyle) => {
    const result = loadDemoPackage(raw)
    if (!result.ok) {
      set({
        package: undefined,
        packageStatus: 'invalid',
        packageError: result.message,
        packageErrors: result.errors,
        toast: undefined,
      })
      persist(get())
      return false
    }

    const data = conferenceStyle
      ? {
          ...result.data,
          paper: { ...result.data.paper, conferenceStyle },
          synthesis: { ...result.data.synthesis, conferenceStyle },
        }
      : result.data

    set({
      package: data,
      packageStatus: 'ready',
      packageError: undefined,
      packageErrors: [],
      selectedSectionId: undefined,
      selectedPaperNodeId: undefined,
      selectedSourceIds: [],
      selectedFindingId: data.findings[0]?.id,
      selectedComparisonThemeId: undefined,
      verifyPanel: 'evidence',
      playback: emptyPlayback,
      lockedRun: undefined,
      comparisonInputs: emptyComparisonInputs(),
      comparisonResult: undefined,
      comparisonUsedPrepared: false,
      ask: emptyAsk,
      toast: 'Manuscript processed.',
    })
    persist(get())
    return true
  },

  syncPreparedPackage: async () => {
    const current = get().package
    if (!current || current.demo.id !== 'model-soups-v1') return
    try {
      const raw = await fetchPreparedPackage()
      const result = loadDemoPackage(raw)
      if (!result.ok) return
      const conferenceStyle = current.paper.conferenceStyle
      const next = conferenceStyle
        ? {
            ...result.data,
            paper: { ...result.data.paper, conferenceStyle },
            synthesis: { ...result.data.synthesis, conferenceStyle },
          }
        : result.data
      const sameRoster =
        current.reviewPlan.selectedVerifierIds.join() === next.reviewPlan.selectedVerifierIds.join() &&
        current.reviewerRun.candidateAgents.map((agent) => `${agent.id}:${agent.label}`).join() ===
          next.reviewerRun.candidateAgents.map((agent) => `${agent.id}:${agent.label}`).join()
      if (sameRoster) return
      set({ package: next })
      persist(get())
    } catch {
      // Keep the session package if the bundled fixture cannot be re-fetched.
    }
  },

  clearIntake: () => {
    const previous = get().uploadedPaperUrl
    if (previous?.startsWith('blob:')) {
      URL.revokeObjectURL(previous)
    }
    set({
      package: undefined,
      packageStatus: 'empty',
      packageError: undefined,
      packageErrors: [],
      uploadedPaperUrl: undefined,
      uploadedPaperName: undefined,
      toast: undefined,
      selectedSectionId: undefined,
      selectedPaperNodeId: undefined,
      selectedSourceIds: [],
      selectedFindingId: undefined,
      selectedComparisonThemeId: undefined,
      verifyPanel: 'evidence',
      playback: emptyPlayback,
      lockedRun: undefined,
      comparisonInputs: emptyComparisonInputs(),
      comparisonResult: undefined,
      comparisonUsedPrepared: false,
      ask: emptyAsk,
    })
    persist(get())
  },

  applyConferenceStyle: (conferenceStyle) => {
    const pkg = get().package
    if (!pkg) return
    set({
      package: {
        ...pkg,
        paper: { ...pkg.paper, conferenceStyle },
        synthesis: { ...pkg.synthesis, conferenceStyle },
      },
    })
    persist(get())
  },

  setUploadedPaper: (url, name) => {
    const previous = get().uploadedPaperUrl
    if (previous && previous !== url && previous.startsWith('blob:')) {
      URL.revokeObjectURL(previous)
    }
    set({ uploadedPaperUrl: url, uploadedPaperName: name })
  },

  resetDemo: () => {
    const pkg = get().package
    set({
      playback: emptyPlayback,
      lockedRun: undefined,
      comparisonInputs: emptyComparisonInputs(),
      comparisonResult: undefined,
      comparisonUsedPrepared: false,
      selectedComparisonThemeId: undefined,
      ask: emptyAsk,
      selectedSectionId: undefined,
      selectedPaperNodeId: undefined,
      selectedSourceIds: [],
      selectedFindingId: pkg?.findings[0]?.id,
      verifyPanel: 'evidence',
      toast: 'Demo reset.',
    })
    persist(get())
  },

  setPlaybackIndex: (eventIndex) =>
    set((state) => ({
      playback: { ...state.playback, eventIndex },
    })),

  setPlaybackStatus: (status) =>
    set((state) => ({
      playback: { ...state.playback, status },
    })),

  resetPlayback: (runId) =>
    set((state) => ({
      playback: {
        runId: runId ?? state.playback.runId,
        eventIndex: 0,
        status: 'idle',
      },
    })),

  lockRun: () => {
    set((state) => {
      if (!state.package || state.lockedRun) return state
      return {
        lockedRun: {
          runId: `run-${state.package.demo.id}-${Date.now()}`,
          lockedAt: new Date().toISOString(),
          findingIds: state.package.findings.map((finding) => finding.id),
        },
        toast: 'Run locked.',
      }
    })
    persist(get())
  },

  setComparisonInputs: (comparisonInputs) => set({ comparisonInputs }),

  updateHumanReview: (id, patch) =>
    set((state) => ({
      comparisonInputs: {
        ...state.comparisonInputs,
        humanReviews: state.comparisonInputs.humanReviews.map((review) =>
          review.id === id ? { ...review, ...patch } : review,
        ),
      },
    })),

  addHumanReviewer: () =>
    set((state) => ({
      comparisonInputs: {
        ...state.comparisonInputs,
        humanReviews: [
          ...state.comparisonInputs.humanReviews,
          emptyHumanReview(nextReviewIndex(state.comparisonInputs.humanReviews)),
        ],
      },
    })),

  removeHumanReviewer: (id) =>
    set((state) => {
      const remaining = state.comparisonInputs.humanReviews.filter((review) => review.id !== id)
      return {
        comparisonInputs: {
          ...state.comparisonInputs,
          humanReviews: remaining.length > 0 ? remaining : [emptyHumanReview(1)],
        },
      }
    }),

  setOptionalReview: (key, value) =>
    set((state) => ({
      comparisonInputs: {
        ...state.comparisonInputs,
        [key]: value,
      },
    })),

  loadPreparedComparison: async () => {
    try {
      const preset = await fetchComparisonFixture()
      const pkg = get().package
      set({
        package: pkg ? { ...pkg, comparisonPreset: preset } : pkg,
        comparisonInputs: cloneBundle(preset.inputs ?? emptyComparisonInputs()),
        comparisonResult: structuredClone(preset.result),
        comparisonUsedPrepared: true,
        selectedComparisonThemeId: preset.result.themes[0]?.id,
        toast: 'Comparison loaded from the demo result file.',
      })
      return true
    } catch (error) {
      const preset = get().package?.comparisonPreset
      if (!preset) {
        set({
          toast:
            error instanceof Error
              ? error.message
              : 'No prepared comparison file was found.',
        })
        return false
      }
      set({
        comparisonInputs: cloneBundle(preset.inputs ?? emptyComparisonInputs()),
        comparisonResult: structuredClone(preset.result),
        comparisonUsedPrepared: true,
        selectedComparisonThemeId: preset.result.themes[0]?.id,
        toast: 'Prepared comparison loaded.',
      })
      return true
    }
  },

  runPreparedCompare: () => {
    const preset = get().package?.comparisonPreset
    if (!preset) {
      set({ toast: 'No prepared comparison in this package.' })
      return false
    }
    set({
      comparisonResult: structuredClone(preset.result),
      comparisonUsedPrepared: true,
      selectedComparisonThemeId: preset.result.themes[0]?.id,
      toast: 'Comparison complete.',
    })
    return true
  },

  runCompare: () => {
    const pkg = get().package
    if (!pkg) return false
    const inputs = get().comparisonInputs
    const hasText = [
      ...inputs.humanReviews,
      inputs.metaReview,
      inputs.authorRebuttal,
      inputs.baselineReview,
    ].some((review) => review?.reviewText.trim())
    if (!hasText) {
      set({ toast: 'Upload at least one review file before comparing.' })
      return false
    }
    const result = compareIndependentReviews(pkg, inputs)
    set({
      comparisonResult: result,
      comparisonUsedPrepared: false,
      selectedComparisonThemeId: result.themes[0]?.id,
      toast: 'Comparison complete.',
    })
    return true
  },

  importComparisonJson: (raw) => {
    const parsed = parseComparisonJson(raw)
    if (!parsed.ok) {
      set({ toast: parsed.errors[0] ?? 'Could not import comparison JSON.' })
      return false
    }
    if (parsed.kind === 'preset') {
      set({
        comparisonInputs: cloneBundle(parsed.data.inputs ?? emptyComparisonInputs()),
        comparisonResult: structuredClone(parsed.data.result),
        comparisonUsedPrepared: true,
        selectedComparisonThemeId: parsed.data.result.themes[0]?.id,
        toast: 'Comparison imported.',
      })
      return true
    }
    set({
      comparisonInputs: cloneBundle(parsed.data),
      toast: 'Comparison inputs imported.',
    })
    return true
  },

  importReviewParse: (slotId, parsed, preferredLabel) => {
    if (!parsed.ok) {
      set({ toast: parsed.errors[0] ?? 'Could not read the review file.' })
      return false
    }
    if (parsed.kind === 'preset' || parsed.kind === 'inputs') {
      return get().importComparisonJson(parsed.data)
    }
    const reviews = parsed.reviews
    if (reviews.length === 0) {
      set({ toast: 'No review text was found in that file.' })
      return false
    }
    set((state) => ({
      comparisonInputs: {
        ...state.comparisonInputs,
        humanReviews: replaceSlotWithReviews(
          state.comparisonInputs.humanReviews,
          slotId,
          reviews,
          preferredLabel,
        ),
      },
      comparisonResult: undefined,
      toast:
        reviews.length > 1
          ? `Imported ${reviews.length} reviews from the file.`
          : 'Review file imported.',
    }))
    return true
  },

  openAsk: (scope, contextIds) =>
    set({
      ask: {
        open: true,
        scope,
        contextIds,
        query: '',
        response: undefined,
      },
    }),

  closeAsk: () =>
    set((state) => ({
      ask: { ...state.ask, open: false },
    })),

  submitAsk: (query, promptId) =>
    set((state) => ({
      ask: {
        ...state.ask,
        open: true,
        query,
        response: matchAskResponse(state.package?.askPeerMind, {
          query,
          scope: state.ask.scope,
          contextIds: state.ask.contextIds,
          promptId,
        }),
      },
    })),

  runAskAction: (action) => {
    const state = get()
    const pkg = state.package
    const targetId = action.targetId
    if (!pkg || !targetId) return

    if (action.type === 'open_source') {
      state.focusSelection({ sourceIds: [targetId] })
      return
    }
    if (action.type === 'focus_graph') {
      const node = getNode(pkg, targetId)
      state.focusSelection({
        sourceIds: node?.sourceIds ?? state.selectedSourceIds,
        paperNodeId: targetId,
      })
      return
    }
    if (action.type === 'open_finding' || action.type === 'open_verification') {
      const finding = pkg.findings.find((item) => item.id === targetId)
      state.focusSelection({
        sourceIds: finding?.sourceIds ?? [],
        findingId: targetId,
      })
    }
  },
}))
