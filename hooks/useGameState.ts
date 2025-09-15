
import { useState, useCallback, useEffect, useReducer } from 'react';
import { GameState, StoryNodeId, TopicId, Message, ClueId, HauntingEvent } from '../types';
import { storyData } from '../data';

const initialState: GameState = {
  messengerOpened: false,
  ilContacted: false,
  unlockedTopics: new Set(),
  storyNode: 'start',
  diaryRead: false,
  confrontationReady: false,
  gameEnded: false,
  epilogueStarted: false,
  hasMentionedPromise: false,
  bsodActive: false,
  chatHistory: [],
  hauntingEvent: null,
  showFakeError: false,
  openedFiles: new Set(),
  collectedClues: new Set(),
  discussedTopics: new Set(),
  firstInteractionDone: false,
  keywordsFileUnlocked: false,
};

type GameAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_MESSAGES'; payload: Message[] }
  | { type: 'SET_STORY_NODE'; payload: StoryNodeId }
  | { type: 'DISCUSS_TOPIC'; payload: StoryNodeId }
  | { type: 'UNLOCK_TOPIC'; payload: TopicId }
  | { type: 'SET_STATE'; payload: Partial<GameState> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'ADD_MESSAGES':
      return { ...state, chatHistory: [...state.chatHistory, ...action.payload] };
    case 'SET_STORY_NODE':
      return { ...state, storyNode: action.payload };
    case 'DISCUSS_TOPIC':
        const newDiscussed = new Set(state.discussedTopics);
        newDiscussed.add(action.payload);
        return { ...state, storyNode: action.payload, discussedTopics: newDiscussed };
    case 'UNLOCK_TOPIC':
      const newTopics = new Set(state.unlockedTopics);
      newTopics.add(action.payload);
      return { ...state, unlockedTopics: newTopics, keywordsFileUnlocked: true };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const addMessage = useCallback((sender: string, text: string, senderClass: Message['senderClass'], options: { isHTML?: boolean, date?: string } = {}) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now() + Math.random(), sender, text, senderClass, ...options } });
  }, []);

  const sendIlMessages = useCallback((messages: string[]) => {
    let delay = 500;
    messages.forEach((msg, index) => {
      setTimeout(() => {
        addMessage('IL_Otome99', msg, 'il');
      }, delay);
      delay += 1000 + msg.length * 30;
    });
    return delay;
  }, [addMessage]);

  const checkClueCombination = useCallback((newClues: Set<ClueId>) => {
    if (newClues.has('clue_sickness') && newClues.has('clue_stress')) {
       setTimeout(() => {
        addMessage('System', 'System Memory Cache Purge... ERROR. Fragment Found: [A vision of a dark room. The sound of a keyboard clicking furiously, interrupted by a painful, racking cough. The screen flickers. The promise must be kept...]', 'system');
       }, 2000);
       // Prevent this from firing again
       newClues.delete('clue_sickness');
       newClues.delete('clue_stress');
    }
  }, [addMessage]);
  
  const addClue = useCallback((clueId: ClueId) => {
    dispatch({
        type: 'SET_STATE',
        payload: {
            collectedClues: new Set(state.collectedClues).add(clueId)
        }
    });
    checkClueCombination(new Set(state.collectedClues).add(clueId));
  }, [state.collectedClues, checkClueCombination]);


  const triggerHaunting = useCallback(() => {
    const events: HauntingEvent[] = ['glitch', 'error-dialog', 'cough-sound'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    dispatch({ type: 'SET_STATE', payload: { hauntingEvent: randomEvent } });

    if (randomEvent === 'error-dialog') {
        dispatch({ type: 'SET_STATE', payload: { showFakeError: true } });
        setTimeout(() => dispatch({ type: 'SET_STATE', payload: { showFakeError: false } }), 2000);
    }
    
    setTimeout(() => dispatch({ type: 'SET_STATE', payload: { hauntingEvent: null } }), 500);
  }, []);

  const openTextFile = useCallback((fileId: string) => {
    const hauntedFiles = ['log_mom', 'corporate_memo'];
    if (!state.openedFiles.has(fileId)) {
        const newOpenedFiles = new Set(state.openedFiles).add(fileId);
        dispatch({ type: 'SET_STATE', payload: { openedFiles: newOpenedFiles } });
        if (hauntedFiles.includes(fileId)) {
            triggerHaunting();
        }
    }
    if (fileId === 'notes') addClue('clue_sickness');
    if (fileId === 'log_father') addClue('clue_stress');
  }, [state.openedFiles, triggerHaunting, addClue]);

  const handleChoice = useCallback((action: StoryNodeId, text: string) => {
    if (state.gameEnded) return;

    addMessage('You', text, 'player');
    
    // If it's a topic, use a different action to also add it to discussedTopics
    if (action.startsWith('topic_')) {
        dispatch({ type: 'DISCUSS_TOPIC', payload: action });
    } else {
        dispatch({ type: 'SET_STORY_NODE', payload: action });
    }

    const node = storyData[action];
    
    setTimeout(() => {
      if (node) {
        if (action === 'ask_more_kielala' && !state.hasMentionedPromise) {
            dispatch({ type: 'SET_STATE', payload: { hasMentionedPromise: true } });
        }
        sendIlMessages(node.response);
      }
    }, 1200);
  }, [addMessage, sendIlMessages, state.gameEnded, state.hasMentionedPromise]);
  
  const discoverClue = useCallback((topicId: TopicId, clueText: string, flavorText: string) => {
    if (state.unlockedTopics.has(topicId) || state.gameEnded) return;
    dispatch({ type: 'UNLOCK_TOPIC', payload: topicId });
    addMessage('System', flavorText, 'system');
    addMessage('System', `New Topic Unlocked: ${clueText}`, 'system');
  }, [addMessage, state.unlockedTopics, state.gameEnded]);

  const unlockDiary = useCallback(() => {
    dispatch({ type: 'SET_STATE', payload: { diaryRead: true } });
    addMessage('System', 'Diary Unlocked. The file contains an unsent letter.', 'system');
  }, [addMessage]);

  const accessNewsArchive = useCallback(() => {
    if (state.diaryRead) {
        if (state.confrontationReady) return;
        dispatch({ type: 'SET_STATE', payload: { confrontationReady: true } });
        addMessage('System', 'You piece the clues together. The final truth is unlocked.', 'system');
        return true;
    } else {
        addMessage('System', 'ERROR 404: Archive damaged. You need more information to access this page.', 'system');
        return false;
    }
  }, [addMessage, state.diaryRead, state.confrontationReady]);

  const triggerEndSequence = useCallback((finalMessage: string) => {
    if (state.gameEnded) return;
    dispatch({ type: 'SET_STATE', payload: { gameEnded: true } });
    addMessage('You', finalMessage, 'player');

    const finalLines = [
        { text: "What is this joke?", delay: 4000 },
        { text: "That's impossible. The new millennium hasn't even started.", delay: 3000 },
        { text: "Y2K didn't break the computers.", delay: 3000 },
        { text: "It broke... me?", delay: 4000 },
        { text: "...", delay: 5000 },
        { text: "Tell Kielala... I'm sorry.", delay: 4000 }
    ];

    let cumulativeDelay = 1000;
    finalLines.forEach(line => {
      setTimeout(() => {
        sendIlMessages([line.text]);
      }, cumulativeDelay);
      cumulativeDelay += line.delay;
    });

    setTimeout(() => {
        dispatch({ type: 'SET_STATE', payload: { bsodActive: true } });
        document.title = "...Tell Kielala... I'm sorry...";
    }, cumulativeDelay + 2000);

  }, [addMessage, sendIlMessages, state.gameEnded]);

  const startEpilogue = useCallback(() => {
    dispatch({ type: 'SET_STATE', payload: { epilogueStarted: true, chatHistory: [], bsodActive: false, gameEnded: false }});
    
    const epilogueMessages = [
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'bro? are you there?', date: '01/01/2000' },
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'i miss you.', date: '07/07/2000' },
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'happy birthday big bro. i drew you something.<br><img class="w-full max-w-[300px] mt-2 border border-gray-400" src="https://placehold.co/300x200/000000/FFFFFF?text=For+Il" alt="drawing">', date: '07/07/2001', isHTML: true },
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'i wish you were here', date: '12/28/2001' },
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'i still think about your promise. i\'m trying to be strong.', date: '05/15/2002' },
        { sender: 'Kielala_O', senderClass: 'kielala' as const, text: 'happy birthday illmimi', date: '07/07/2002' },
        { sender: 'System', senderClass: 'system' as const, text: '...<br>...<br>USER NOT FOUND', date: '...', isHTML: true}
    ];

    let messageDelay = 3000;
    epilogueMessages.forEach(msg => {
        setTimeout(() => {
            dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now() + Math.random(), ...msg } });
        }, messageDelay);
        messageDelay += 4000;
    });
  }, []);

  useEffect(() => {
    if(state.bsodActive) {
      const timer = setTimeout(startEpilogue, 8000);
      return () => clearTimeout(timer);
    }
  }, [state.bsodActive, startEpilogue]);

  // Haunting effects
  useEffect(() => {
      if (state.hauntingEvent === 'cough-sound') {
          const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_b2742910e5.mp3");
          audio.volume = 0.3;
          audio.play().catch(e => console.error("Audio play failed:", e)); // Added error handling
      }
  }, [state.hauntingEvent]);
  
  return {
    state,
    dispatch,
    addMessage,
    handleChoice,
    discoverClue,
    unlockDiary,
    accessNewsArchive,
    triggerEndSequence,
    openTextFile,
  };
}