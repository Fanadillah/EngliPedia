# Graph Report - english-app  (2026-07-26)

## Corpus Check
- 138 files · ~490,890 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 908 nodes · 1819 edges · 81 communities (59 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a164efdd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- gamification.ts
- sw.js
- index.ts
- compilerOptions
- cn
- motion-components.tsx
- [lessonId]/page.tsx
- components.json
- devDependencies
- layout.tsx
- handle
- flashcard-deck.tsx
- app/page.tsx
- dependencies
- writing/page.tsx
- clean-transcripts.mjs
- quiz/page.tsx
- spaced-repetition.ts
- login/page.tsx
- createClient
- lib/learning.ts
- onboarding-wrapper.tsx
- types/learning.ts
- manifest.json
- Word
- search/page.tsx
- getDb
- constructor
- speaking/page.tsx
- generate-sounds.py
- video-learning/page.tsx
- clean-dataset.js
- generate-cara-baca.js
- toast-provider.tsx
- waitUntil
- import-dataset.js
- dialog.tsx
- clean-dataset-v2.js
- generate-sql.js
- card.tsx
- ipa-converter.ts
- package.json
- clone
- database.ts
- fix-examples.js
- seed-vocabulary-lessons.js
- word-tabs.tsx
- fix-ipa.js
- offline-cache.ts
- fetch-transcripts.mjs
- youtube-transcript/route.ts
- analyze-meanings.js
- add-conjugations-column.js
- check-column.js
- check-columns.js
- check-examples.js
- middleware.ts
- next.config.ts
- check-available-words.js
- gen
- sw.ts
- clsx
- eslint.config.mjs
- @formkit/auto-animate
- lucide-react
- react-dom
- @serwist/next
- @serwist/sw
- @supabase/ssr
- @supabase/supabase-js
- postcss.config.mjs
- translate-examples.py
- layout.tsx
- sound-manager.tsx
- waitUntil
- _awaitComplete
- README.md
- utils.ts
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 59 edges
2. `createClient()` - 41 edges
3. `Button()` - 26 edges
4. `awardXp()` - 25 edges
5. `useSound()` - 23 edges
6. `Word` - 23 edges
7. `client()` - 20 edges
8. `FlashcardDeck()` - 19 edges
9. `useToast()` - 19 edges
10. `loadState()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `QuizPage()` --indirect_call--> `d()`  [INFERRED]
  src/app/quiz/page.tsx → public/sw.js
- `SpeakingPage()` --indirect_call--> `d()`  [INFERRED]
  src/app/speaking/page.tsx → public/sw.js
- `WritingPage()` --indirect_call--> `d()`  [INFERRED]
  src/app/writing/page.tsx → public/sw.js
- `SpeakingPage()` --indirect_call--> `size()`  [INFERRED]
  src/app/speaking/page.tsx → public/sw.js
- `WritingPage()` --indirect_call--> `size()`  [INFERRED]
  src/app/writing/page.tsx → public/sw.js

## Import Cycles
- None detected.

## Communities (81 total, 22 thin omitted)

### Community 0 - "gamification.ts"
Cohesion: 0.06
Nodes (50): GET(), AuthMode, LoginPageContent(), FilterOption, FILTERS, LEVEL_CONFIG, LevelFilter, SavedWordsPage() (+42 more)

### Community 1 - "sw.js"
Cohesion: 0.08
Nodes (10): createHandlerBoundToUrl(), deleteEntry(), getPrecacheKeyForUrl(), matchPrecache(), popEntry(), popRequest(), _removeEntry(), _removeRequest() (+2 more)

### Community 2 - "index.ts"
Cohesion: 0.09
Nodes (20): BookEmptyIllustration(), IllustrationProps, CardsEmptyIllustration(), IllustrationProps, CelebrationIllustration(), IllustrationProps, ErrorStateIllustration(), IllustrationProps (+12 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "cn"
Cohesion: 0.17
Nodes (19): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Card(), CardAction() (+11 more)

### Community 5 - "motion-components.tsx"
Cohesion: 0.13
Nodes (14): difficultyColors, difficultyLabels, practiceModes, AnimatedWordProps, FadeInProps, HoverCardProps, PageTransitionProps, ScaleInProps (+6 more)

### Community 6 - "[lessonId]/page.tsx"
Cohesion: 0.17
Nodes (17): LessonPage(), ListeningQuestion, shuffleArray(), Step, ReviewQuestion, GrammarExample(), Props, GrammarExercise() (+9 more)

### Community 7 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+13 more)

### Community 9 - "layout.tsx"
Cohesion: 0.19
Nodes (9): AppShell(), AppShellProps, BottomNav(), leftItems, practiceItems, rightItems, PageTransition(), OfflineIndicator() (+1 more)

### Community 10 - "handle"
Cohesion: 0.24
Nodes (18): cacheMatch(), cachePut(), _ensureResponseSafeToCache(), fetch(), fetchAndCachePut(), getCacheKey(), _getNetworkPromise(), getPreloadResponse() (+10 more)

### Community 11 - "flashcard-deck.tsx"
Cohesion: 0.09
Nodes (38): WordDetailPage(), FlashcardDeck(), ReviewDifficulty, SessionStats, XP_REWARDS, PronunciationWave(), PronunciationWaveProps, InfoBar() (+30 more)

### Community 12 - "app/page.tsx"
Cohesion: 0.18
Nodes (12): Home(), motivationalQuotes, ProgressPage(), AnimatedWord(), OrganicBlobs(), OrganicBlobsProps, ProgressRing(), ProgressRingProps (+4 more)

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, class-variance-authority, motion, next, dependencies, @base-ui/react, class-variance-authority, motion (+11 more)

### Community 14 - "writing/page.tsx"
Cohesion: 0.21
Nodes (11): Difficulty, DIFFICULTY_COLORS, DIFFICULTY_LABELS, generateHint(), normalize(), Phase, QUESTION_COUNTS, shuffleArray() (+3 more)

### Community 15 - "clean-transcripts.mjs"
Cohesion: 0.23
Nodes (18): capitalize(), cleanText(), decodeEntities(), __dirname, FILLER_WORDS, hasPunctuation(), isFiller(), isLineWorthKeeping() (+10 more)

### Community 16 - "quiz/page.tsx"
Cohesion: 0.18
Nodes (11): size(), AnswerState, Difficulty, DIFFICULTY_COLORS, DIFFICULTY_LABELS, QUIZ_SIZES, QuizConfig, QuizMode (+3 more)

### Community 17 - "spaced-repetition.ts"
Cohesion: 0.21
Nodes (15): StatisticsPage(), awardXp(), checkStreak(), cumulativeXpForLevel(), defaultState, GamificationState, levelFromXp(), loadState() (+7 more)

### Community 18 - "login/page.tsx"
Cohesion: 0.22
Nodes (13): ProfilePage(), useAuth(), navItems, Sidebar(), applyTheme(), DarkModeToggle(), DarkModeToggleProps, getStoredTheme() (+5 more)

### Community 19 - "createClient"
Cohesion: 0.18
Nodes (13): difficulties, ListeningPage(), modes, normalize(), Phase, PracticeMode, Question, shuffleArray() (+5 more)

### Community 20 - "lib/learning.ts"
Cohesion: 0.27
Nodes (16): CourseDetailPage(), LearnPage(), checkCourseCompletion(), checkUnitCompletion(), client(), enrollInCourse(), getCourseContent(), getCourses() (+8 more)

### Community 21 - "onboarding-wrapper.tsx"
Cohesion: 0.14
Nodes (10): FirstWordReveal(), FirstWordRevealProps, levels, LevelSelect(), LevelSelectProps, markOnboardingDone(), OnboardingWrapper(), Step (+2 more)

### Community 22 - "types/learning.ts"
Cohesion: 0.18
Nodes (13): Course, CourseWithProgress, Lesson, LessonContent, LessonWithProgress, LessonWord, UserCourseProgress, UserDailyGoal (+5 more)

### Community 23 - "manifest.json"
Cohesion: 0.14
Nodes (13): background_color, categories, description, display, icons, lang, name, orientation (+5 more)

### Community 24 - "Word"
Cohesion: 0.40
Nodes (4): ConjugationDetail, Conjugations, UserProfile, UserWord

### Community 25 - "search/page.tsx"
Cohesion: 0.15
Nodes (13): ALPHABET, FREQ_OPTIONS, LEVEL_OPTIONS, LEVEL_STYLE, POS_OPTIONS, SearchPage(), Input(), Skeleton() (+5 more)

### Community 26 - "getDb"
Cohesion: 0.12
Nodes (18): addEntry(), get(), getAllEntriesByQueueName(), _getDateHeaderTimestamp(), getDb(), getEndEntryFromIndex(), getEntryCountByQueueName(), getFirstEntryByQueueName() (+10 more)

### Community 27 - "constructor"
Cohesion: 0.20
Nodes (12): addToPrecacheList(), constructor(), d(), delete(), deleteCacheAndMetadata(), getIntegrityForPrecacheKey(), getUrlsToPrecacheKeys(), handleActivate() (+4 more)

### Community 28 - "speaking/page.tsx"
Cohesion: 0.21
Nodes (11): calculateSimilarity(), Difficulty, DIFFICULTY_COLORS, DIFFICULTY_LABELS, getScoreLabel(), Phase, QUESTION_COUNTS, shuffleArray() (+3 more)

### Community 29 - "generate-sounds.py"
Cohesion: 0.15
Nodes (12): apply_fade(), mix(), noise_wave(), pad(), Pad with zeros to total_duration., Write 16-bit mono WAV file., Generate sine wave samples., Generate noise samples. (+4 more)

### Community 30 - "video-learning/page.tsx"
Cohesion: 0.21
Nodes (12): compareWords(), levenshtein(), normalizeWord(), Phase, Sentence, SentenceResult, useYouTubePlayer(), VideoLearningPage() (+4 more)

### Community 31 - "clean-dataset.js"
Cohesion: 0.17
Nodes (9): cleaned, commonIPA, datasetPath, fs, outPath, path, posFixes, removePatterns (+1 more)

### Community 32 - "generate-cara-baca.js"
Cohesion: 0.18
Nodes (11): datasetPath, fs, IPA_TOKENS, ipaToIndonesian(), path, sampleOutputs, SORTED_TOKENS, TOKEN_REGEX (+3 more)

### Community 33 - "toast-provider.tsx"
Cohesion: 0.16
Nodes (12): ExerciseItem, ExerciseResult, GrammarLesson, GrammarPracticePage(), Phase, Toast, ToastContext, ToastContextType (+4 more)

### Community 34 - "waitUntil"
Cohesion: 0.60
Nodes (5): cacheDidUpdate(), cachedResponseWillBeUsed(), expireEntries(), _getCacheExpiration(), updateTimestamp()

### Community 35 - "import-dataset.js"
Cohesion: 0.24
Nodes (10): convertWord(), { createClient }, datasetPath, fs, getDefinition(), getExample(), importWords(), path (+2 more)

### Community 36 - "dialog.tsx"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 37 - "clean-dataset-v2.js"
Cohesion: 0.20
Nodes (9): cleaned, datasetPath, defCleaned, finalCleaned, fs, knownExamples, path, samples (+1 more)

### Community 38 - "generate-sql.js"
Cohesion: 0.24
Nodes (7): datasetPath, fs, getDefinition(), getExample(), path, truncate(), words

### Community 39 - "card.tsx"
Cohesion: 0.33
Nodes (5): GrammarExplanation(), Props, Badge(), badgeVariants, ExplanationContent

### Community 40 - "ipa-converter.ts"
Cohesion: 0.27
Nodes (8): generateCaraBaca(), getSyllableStartPos(), IPA_TOKENS, ipaToIndonesian(), PronunciationOptions, SORTED_TOKENS, TOKEN_REGEX, tokenizeIPA()

### Community 41 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 42 - "clone"
Cohesion: 0.43
Nodes (7): _addRequest(), clone(), fromRequest(), pushRequest(), replayRequests(), toObject(), unshiftRequest()

### Community 43 - "database.ts"
Cohesion: 0.19
Nodes (11): AchievementsPage(), Badge, badges, loadEarnedBadgeIds(), saveEarnedBadgeIds(), COLORS, Confetti(), ConfettiProps (+3 more)

### Community 44 - "fix-examples.js"
Cohesion: 0.25
Nodes (7): datasetPath, exampleFixes, fs, path, samplesToCheck, updated, words

### Community 45 - "seed-vocabulary-lessons.js"
Cohesion: 0.32
Nodes (7): { createClient }, findWord(), findWords(), lessons, main(), supabase, units

### Community 46 - "word-tabs.tsx"
Cohesion: 0.43
Nodes (6): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), WordTabs()

### Community 47 - "fix-ipa.js"
Cohesion: 0.29
Nodes (6): datasetPath, fs, ipaFixes, path, updated, words

### Community 48 - "offline-cache.ts"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 49 - "fetch-transcripts.mjs"
Cohesion: 0.47
Nodes (5): __dirname, fetchTranscript(), main(), segmentIntoSentences(), VIDEOS

### Community 50 - "youtube-transcript/route.ts"
Cohesion: 0.47
Nodes (5): fetchLiveTranscript(), GET(), segmentIntoSentences(), Sentence, TranscriptSegment

### Community 51 - "analyze-meanings.js"
Cohesion: 0.40
Nodes (4): categories, fs, indoKeywords, words

### Community 73 - "layout.tsx"
Cohesion: 0.22
Nodes (8): howler, howler, inter, metadata, RootLayout(), viewport, ToastProvider(), SoundProvider()

### Community 74 - "sound-manager.tsx"
Cohesion: 0.22
Nodes (8): PracticePage(), shuffleArray(), UnitReviewPage(), playSound(), SOUND_FILES, SoundContext, SoundContextType, SoundName

### Community 75 - "waitUntil"
Cohesion: 0.33
Nodes (6): _addSyncListener(), findMatchingRoute(), handleCache(), handleRequest(), registerSync(), waitUntil()

### Community 76 - "_awaitComplete"
Cohesion: 0.40
Nodes (6): _awaitComplete(), destroy(), doneWaiting(), _getResponse(), handleAll(), runCallbacks()

### Community 77 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **315 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+310 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SoundProvider()` connect `layout.tsx` to `sound-manager.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `lucide-react`, `react-dom`, `@serwist/next`, `@serwist/sw`, `@supabase/ssr`, `@supabase/supabase-js`, `layout.tsx`, `package.json`, `clsx`, `@formkit/auto-animate`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `howler` connect `layout.tsx` to `dependencies`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _315 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `gamification.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06498015873015874 - nodes in this community are weakly interconnected._
- **Should `sw.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08275862068965517 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08602150537634409 - nodes in this community are weakly interconnected._