import './style.css'
import { AudioEngine } from './audio.js'
import { EXERCISE_TYPES, INTERVAL_GROUPS } from './exercises/index.js'
import { RANGES, ADVANCE_DELAY } from './constants.js'
import * as AnswersUI from './ui/answers.js'
import * as GroupsUI from './ui/groups.js'
import * as PianoUI from './ui/piano.js'
import { initSettings } from './ui/settings.js'
import { createSession } from './session.js'
import * as ToastUI from './ui/toast.js'

// ── Инициализация UI ─────────────────────────────────────────
PianoUI.initPiano(document.getElementById('piano'));
ToastUI.initToast(document.getElementById('toastLayer'));   // ← добавьте
AnswersUI.initAnswers(document.getElementById('answers'), (id, btn) => {
  session.answer(id, btn);
});

// ── Сессия ───────────────────────────────────────────────────
const state = {
  mode: 'melodic',
  direction: 'up',
  allowed: ['M3', 'm3'],
  difficulty: 'medium',
}

function buildExercise() {
  const Ex = EXERCISE_TYPES.interval
  return new Ex({
    allowed: [...state.allowed],
    mode: state.mode,
    direction: state.direction,
    range: RANGES[state.difficulty],
  })
}

const session = createSession({
  exercise: buildExercise(),
  mode: state.mode,
  direction: state.direction,
  difficulty: state.difficulty,
})

// ── Группы интервалов ────────────────────────────────────────
function toggleGroup(groupId) {
  const g = INTERVAL_GROUPS.find(x => x.id === groupId)
  if (!g) return

  const allActive = g.members.every(id => state.allowed.includes(id))
  if (allActive) {
    const after = state.allowed.filter(id => !g.members.includes(id))
    if (after.length < 2) return
    state.allowed = after
  } else {
    const added = g.members.filter(id => !state.allowed.includes(id))
    state.allowed = [...state.allowed, ...added]
  }

  session.setAllowed(state.allowed)
  GroupsUI.renderGroupChips(state.allowed)
  AnswersUI.setAnswerOrder(state.allowed)
}

GroupsUI.initGroups(document.getElementById('groupChips'), toggleGroup)
GroupsUI.renderGroupChips(state.allowed)
AnswersUI.setAnswerOrder(state.allowed)

// ── Настройки ────────────────────────────────────────────────
initSettings({
  onModeChange: mode => {
    state.mode = mode
    session.exercise.opts.mode = mode
    session.setMode(mode)
  },
  onDirectionChange: direction => {
    state.direction = direction
    session.exercise.opts.direction = direction
    session.setDirection(direction)
  },
  onDifficultyChange: difficulty => {
    state.difficulty = difficulty
    session.exercise.opts.range = RANGES[difficulty]
    session.setDifficulty(difficulty)
  },
})

// ── Кнопка «Слушать» ─────────────────────────────────────────
const playBtn = document.getElementById('playBtn')
let audioLoading = false

playBtn.addEventListener('click', async () => {
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
  session.playCurrent()
})

// ── Старт ────────────────────────────────────────────────────
session.newQuestion()