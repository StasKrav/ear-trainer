import { AudioEngine } from './audio.js'
import * as AnswersUI from './ui/answers.js'
import { showToast, clearToast, showRoundResult } from './ui/toast.js'
import { highlightKeys, clearHighlights } from './ui/piano.js'
import { RANGES, ROUND_SIZE, ADVANCE_DELAY } from './constants.js'

export function createSession({ exercise, mode, direction, difficulty }) {
  const state = {
    mode,
    direction,
    allowed: ['M3', 'm3'],
    difficulty,
    exercise,

    // текущий вопрос
    current: null,
    answered: false,

    // подход
    roundActive: false,
    roundCorrect: 0,
    roundTotal: 0,

    // таймер автоперехода
    advanceTimer: null,
  }

  const playBtn = document.getElementById('playBtn')
  const repeatBtn = document.getElementById('repeatBtn')

  // ── Таймер ────────────────────────────────────────────────
  function cancelAdvance() {
    if (state.advanceTimer) {
      clearTimeout(state.advanceTimer)
      state.advanceTimer = null
    }
  }

  function scheduleAdvance() {
    if (!state.roundActive) return
    cancelAdvance()
    state.advanceTimer = setTimeout(() => {
      state.advanceTimer = null
      newQuestion()
    }, ADVANCE_DELAY)
  }

  // ── Статистика ────────────────────────────────────────────
  function updateStats() {
    document.getElementById('statCorrect').textContent = state.roundCorrect
    document.getElementById('statTotal').textContent = state.roundTotal
    const acc =
      state.roundTotal === 0 ? '—' : Math.round((state.roundCorrect / state.roundTotal) * 100) + '%'
    document.getElementById('statAccuracy').textContent = acc
  }

  // ── Вопрос ────────────────────────────────────────────────
  function newQuestion() {
    cancelAdvance()
    state.answered = false
    clearToast()
    clearHighlights()
    AnswersUI.resetAnswerButtons()

    state.current = state.exercise.generate()
    playBtn.focus()

    if (AudioEngine.ready()) {
      setTimeout(() => {
        AudioEngine.resume()
        state.exercise.play(state.current)
      }, 150)
    }
  }

  // -- Повтор вопроса ---------
  function repeatCurrent() {
    if (!state.current) return
    if (!AudioEngine.ready()) return
    AudioEngine.resume()
    state.exercise.play(state.current)
    if (state.answered && state.roundActive) scheduleAdvance()
  }

  // ── Подход ────────────────────────────────────────────────
  function startRound() {
    state.roundActive = true
    state.roundCorrect = 0
    state.roundTotal = 0
    updateStats()
    clearToast()
    playBtn.disabled = true
    repeatBtn.disabled = false // ← добавить
    newQuestion()
  }

  function endRound() {
    state.roundActive = false
    cancelAdvance()
    AnswersUI.disableAnswers()

    // «Слушать» снова активна
    playBtn.disabled = false
    repeatBtn.disabled = true

    const acc = Math.round((state.roundCorrect / ROUND_SIZE) * 100)
    showRoundResult({
      correct: state.roundCorrect,
      total: ROUND_SIZE,
      accuracy: acc,
    })
  }

  // ── Ответ ─────────────────────────────────────────────────
  function answer(id, btn) {
    if (state.answered || !state.roundActive) return
    state.answered = true
    state.roundTotal++

    const correct = id === state.current.answer
    AnswersUI.disableAnswers()

    if (correct) {
      AnswersUI.markCorrect(id)
      state.roundCorrect++
      showToast({ correct: true })
    } else {
      AnswersUI.markWrong(id)
      AnswersUI.markCorrect(state.current.answer)
      const name = state.exercise.pool().find(i => i.id === state.current.answer)?.name
      showToast({ correct: false, answerName: name })
    }

    updateStats()

    if (state.roundTotal >= ROUND_SIZE) {
      endRound()
      return
    }

    highlightKeys(state.current.notes)
    scheduleAdvance()
  }

  // ── Сброс при смене настроек ──────────────────────────────
  function resetForSettingsChange() {
    cancelAdvance()
    state.roundActive = false
    state.roundCorrect = 0
    state.roundTotal = 0
    state.answered = false
    state.current = null

    updateStats()
    clearToast()
    clearHighlights()

    playBtn.disabled = false
    repeatBtn.disabled = true
    AnswersUI.resetAnswerButtons()
    AnswersUI.disableAnswers()
  }

  // ── Сеттеры настроек ──────────────────────────────────────
  function setMode(mode) {
    state.mode = mode
    state.exercise.opts.mode = mode
    resetForSettingsChange()
  }

  function setDirection(direction) {
    state.direction = direction
    state.exercise.opts.direction = direction
    resetForSettingsChange()
  }

  function setDifficulty(difficulty) {
    state.difficulty = difficulty
    state.exercise.opts.range = RANGES[difficulty]
    resetForSettingsChange()
  }

  function setAllowed(allowed) {
    state.allowed = allowed
    state.exercise.opts.allowed = [...allowed]
    resetForSettingsChange()
  }

  function getState() {
    return state
  }

  // ── Исходное состояние ────────────────────────────────────
  resetForSettingsChange()

  return {
    startRound,
    repeatCurrent,
    answer,
    setMode,
    setDirection,
    setDifficulty,
    setAllowed,
    getState,
  }
}