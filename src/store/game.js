import * as actionTypes from './actionTypes';
import { shuffleList, generateRandomColor, fillCards } from '../utils/functions';

const initState = {
  level: 1,
  cards: [],
  coverColor: generateRandomColor(40, 40, 60, 60),
  cardsToWin: null,
  isGameStarted: false,
  isTimerPaused: true,
  isKeyPressed: false,
  player: '',
  score: 0,
  timer: 0,
  settings: {
    bgColor: '#f8ebc6',
    musicVolume: 0.5,
    soundVolume: 0.5,
    levels: 5,
    keys: {
      music: 'm',
      sounds: 's',
      reload: 'r',
      fullscreen: 'f',
      pause: 'p',
    },
  },
};

const gameReducer = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.LOAD_LOCAL_DATA: return { ...state, player: action.player, settings: {...state.settings, ...action.settings} };
    case actionTypes.START_GAME: return startGame(state, action);
    case actionTypes.END_GAME: return endGame(state, action);
    case actionTypes.LOAD_LEVEL: return loadLevel(state, action);
    case actionTypes.END_LEVEL: return { ...state, score: action.timer };
    case actionTypes.CHANGE_CARD_STATUS: return updateGameStatus(state, action);
    case actionTypes.CHANGE_VOLUME: return changeVolume(state, action);
    case actionTypes.CHANGE_PAUSE_STATUS: return { ...state, isTimerPaused: action.isPaused };
    case actionTypes.CHANGE_HOTKEY: return changeHotkey(state, action);
    case actionTypes.CHANGE_GAME_LEVELS: return { ...state, settings: { ...state.settings, levels: action.value } };
    case actionTypes.CHANGE_BG_COLOR:   return { ...state, settings: {...state.settings, bgColor: action.bgColor }};
    case actionTypes.SET_DEFAULT_SETTINGS: return { ...state, settings: initState.settings };
    default: return state;
  }
};

const startGame = (state, action) => {
  const coverColor = generateRandomColor(40, 40, 60, 60);
  let cards = createCards(1, coverColor);
  if (action.player === '') return;
  return { ...state, player: action.player, coverColor: coverColor, isGameStarted: true, cards, cardsToWin: cards.length, level: 1, timer: 0 };
};

const endGame = (state, action) => {
  console.log('Your scores: ' + state.score.join(', '));
  return { ...initState, player: state.player };
};

const changeVolume = (state, action) => {
  if (action.audio === 'music') {
    return { ...state, settings: {...state.settings, musicVolume: action.volume} };
  } else {
    return { ...state, settings: {...state.settings, soundVolume: action.volume} };
  }
};

const loadLevel = (state, action) => {
  let level = state.level;
  if (action.param === 'inc' && level < state.settings.levels) {
    level += 1;
  } else if (action.param === 'dec' && level > 1) {
    level -= 1;
  }
  const coverColor = generateRandomColor(40, 40, 60, 60);
  let cards = createCards(level, state.coverColor);
  return {
    ...state,
    cards,
    level,
    coverColor,
    cardsToWin: cards.length,
    isTimerPaused: true,
  };
};

const updateGameStatus = (state, action) => {
  const { selectedCardIndex, oldCardIndex, status } = action;
  let cards = state.cards;
  let selectedCard = cards[selectedCardIndex];
  let oldCard = cards[oldCardIndex];
  let cardsToWin = state.cardsToWin;

  if (status === 'opened') {
    selectedCard.status = 'opened';
    cards = cards.slice(0, selectedCardIndex).concat([selectedCard, ...cards.slice(selectedCardIndex + 1)]);
  } else if (status === 'guessed') {
    selectedCard.status = 'guessed';
    oldCard.status = 'guessed';
    cards = cards.slice(0, selectedCardIndex).concat([selectedCard, ...cards.slice(selectedCardIndex + 1)]);
    cards = cards.slice(0, oldCardIndex).concat([oldCard, ...cards.slice(oldCardIndex + 1)]);
    cardsToWin = cardsToWin - 2;
  } else if (status === 'not-guessed') {
    selectedCard.status = 'not-guessed';
    oldCard.status = 'not-guessed';
    cards = cards.slice(0, selectedCardIndex).concat([selectedCard, ...cards.slice(selectedCardIndex + 1)]);
    cards = cards.slice(0, oldCardIndex).concat([oldCard, ...cards.slice(oldCardIndex + 1)]);
  } else {
    selectedCard.status = 'closed';
    oldCard.status = 'closed';
    cards = cards.slice(0, selectedCardIndex).concat([selectedCard, ...cards.slice(selectedCardIndex + 1)]);
    cards = cards.slice(0, oldCardIndex).concat([oldCard, ...cards.slice(oldCardIndex + 1)]);
  }
  return { ...state, cards, cardsToWin, isTimerPaused: false };
};

const createCards = (level, coverColor) => {
  let cards = [];
  cards = fillCards(cards, level, coverColor);
  cards = shuffleList(cards);
  return cards;
};

const changeHotkey = (state, action) => {
  const keyType = action.keyType;
  const keyValue = action.value;
  return { ...state, settings: {...state.settings, keys: { ...state.settings.keys, [keyType]: keyValue }} };
};

export default gameReducer;
