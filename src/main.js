import './style.css'
import { AudioEngine } from './audio.js'
import { EXERCISE_TYPES, INTERVAL_GROUPS, CHORD_GROUPS } from './exercises/index.js'
import { RANGES, CHORD_RANGES } from './constants.js'
import * as AnswersUI from './ui/answers.js'
import * as GroupsUI from './ui/groups.js'
import * as PianoUI from './ui/piano.js'
import * as ToastUI from './ui/toast.js'
import { initSettings } from './ui/settings.js'
import { createSession } from './session.js'

// ── Инициализация UI ─────────────────────────────────────────
PianoUI.initPiano(document.getElementById('piano'))
ToastUI.initToast(document.getElementById('toastLayer'))
ToastUI.initRoundLayer(document.getElementById('roundLayer'))
AnswersUI.initAnswers(document.getElementById('answers'), (id, btn) => {
  session.answer(id, btn)
})

// ── Состояние приложения ─────────────────────────────────────
const state = {
  type: 'intervals', // 'intervals' | 'chords'
  mode: 'melodic',
  direction: 'up',
  difficulty: 'medium',
  allowedIntervals: ['M3', 'm3'],
  allowedChordGroups: ['triads'],
}

function currentRange() {
  return state.type === 'chords' ? CHORD_RANGES[state.difficulty] : RANGES[state.difficulty]
}

function buildExercise() {
  const Ex = EXERCISE_TYPES[state.type]
  const base = {
    mode: state.mode,
    direction: state.direction,
    range: currentRange(),
  }
  if (state.type === 'chords') {
    return new Ex({ ...base, allowedGroups: [...state.allowedChordGroups] })
  }
  return new Ex({ ...base, allowed: [...state.allowedIntervals] })
}

const session = createSession({
  exercise: buildExercise(),
  mode: state.mode,
  direction: state.direction,
})

// ── Чипы групп ───────────────────────────────────────────────
const groupsLabel = document.getElementById('groupsLabel')
const groupChipsEl = document.getElementById('groupChips')

function renderChips() {
  if (state.type === 'chords') {
    groupsLabel.textContent = 'Аккорды'
    GroupsUI.renderGroupChips(CHORD_GROUPS, expandChordGroups())
  } else {
    groupsLabel.textContent = 'Интервалы'
    GroupsUI.renderGroupChips(INTERVAL_GROUPS, state.allowedIntervals)
  }
}

// Для аккордов activeIds — это все члены включённых групп,
// чтобы chip.active подсвечивался, когда вся группа включена.
function expandChordGroups() {
  const ids = []
  CHORD_GROUPS.forEach(g => {
    if (state.allowedChordGroups.includes(g.id)) ids.push(...g.members)
  })
  return ids
}

function toggleIntervalGroup(groupId) {
  const g = INTERVAL_GROUPS.find(x => x.id === groupId)
  if (!g) return
  const allActive = g.members.every(id => state.allowedIntervals.includes(id))
  if (allActive) {
    const after = state.allowedIntervals.filter(id => !g.members.includes(id))
    if (after.length < 2) return
    state.allowedIntervals = after
  } else {
    const added = g.members.filter(id => !state.allowedIntervals.includes(id))
    state.allowedIntervals = [...state.allowedIntervals, ...added]
  }
  session.setAllowed(state.allowedIntervals)
  AnswersUI.setAnswerOrder(session.getState().exercise.getAnswerOptions())
  renderChips()
}

function toggleChordGroup(groupId) {
  const g = CHORD_GROUPS.find(x => x.id === groupId)
  if (!g) return

  const active = state.allowedChordGroups.includes(groupId)
  if (active) {
    const after = state.allowedChordGroups.filter(id => id !== groupId)
    if (after.length === 0) return // последняя группа — не выключаем
    state.allowedChordGroups = after
  } else {
    state.allowedChordGroups = [...state.allowedChordGroups, groupId]
  }
  session.setAllowedGroups(state.allowedChordGroups)
  renderChips()
}

GroupsUI.initGroups(groupChipsEl, groupId => {
  if (state.type === 'chords') toggleChordGroup(groupId)
  else toggleIntervalGroup(groupId)
})

// ── Смена типа упражнения ───────────────────────────────────
function switchType(type) {
  state.type = type

  // Сброс ответов под новый тип
  const ex = buildExercise()
  session.setExercise(ex)
  AnswersUI.setAnswerOrder(ex.getAnswerOptions())

  // Интервалы: показываем группу «Интервалы» в чипах.
  // Аккорды: та же группа чипов, но с аккордными группами.
  renderChips()
}

// ── Настройки ────────────────────────────────────────────────
initSettings({
  onTypeChange: type => switchType(type),
  onModeChange: mode => {
    state.mode = mode
    session.setMode(mode)
  },
  onDirectionChange: direction => {
    state.direction = direction
    session.setDirection(direction)
  },
  onDifficultyChange: difficulty => {
    state.difficulty = difficulty
    session.setRange(currentRange())
  },
})

// ── Кнопки ───────────────────────────────────────────────────
const playBtn = document.getElementById('playBtn')
const repeatBtn = document.getElementById('repeatBtn')
let audioLoading = false

playBtn.addEventListener('click', async () => {
  if (playBtn.disabled) return

  if (!AudioEngine.ready()) {
    if (audioLoading) return
    audioLoading = true
    const originalText = playBtn.textContent
    playBtn.textContent = 'Загрузка…'
    try {
      await AudioEngine.resume()
      await AudioEngine.load()
    } catch (e) {
      console.error(e)
      ToastUI.showToast({
        correct: false,
        answerName: 'не удалось загрузить звук (см. консоль)',
      })
      playBtn.textContent = originalText
      audioLoading = false
      return
    }
    playBtn.textContent = originalText
    audioLoading = false
  }

  session.startRound()
})

repeatBtn.addEventListener('click', () => {
  if (repeatBtn.disabled) return
  session.repeatCurrent()
})

// ── Старт ────────────────────────────────────────────────────
AnswersUI.setAnswerOrder(session.getState().exercise.getAnswerOptions())
renderChips()
AnswersUI.disableAnswers()