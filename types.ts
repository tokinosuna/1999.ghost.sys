
export type WindowId = 
  | 'my-computer' 
  | 'messenger' 
  | 'netscape' 
  | 'winamp' 
  | 'diary' 
  | 'search' 
  | 'file-explorer' 
  | 'text-viewer' 
  | 'dev-log-viewer'
  | 'settings'
  | 'help'
  | 'chat-log-viewer';

export interface WindowState {
  id: WindowId;
  isOpen: boolean;
  isFocused: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  zIndex: number;
  title: string;
  size: { width: number, height: number };
}

export type StoryNodeId = string;
export type ClueId = 'clue_sickness' | 'clue_stress';
export type TopicId = 'otome_media' | 'kielala' | 'hospital_recording' | 'diary' | 'y2k';
export type HauntingEvent = 'glitch' | 'error-dialog' | 'cough-sound' | null;

export interface Message {
  id: number;
  sender: string;
  senderClass: 'player' | 'il' | 'system' | 'kielala';
  text: string;
  isHTML?: boolean;
  date?: string;
}

export interface StoryOption {
  text: string;
  action: StoryNodeId;
}

export interface StoryNode {
  response: string[];
  options?: StoryOption[];
  onEnter?: () => void;
}

export type GameState = {
  messengerOpened: boolean;
  ilContacted: boolean;
  unlockedTopics: Set<TopicId>;
  storyNode: StoryNodeId;
  diaryRead: boolean;
  confrontationReady: boolean;
  gameEnded: boolean;
  epilogueStarted: boolean;
  hasMentionedPromise: boolean;
  bsodActive: boolean;
  chatHistory: Message[];
  hauntingEvent: HauntingEvent;
  showFakeError: boolean;
  openedFiles: Set<string>;
  collectedClues: Set<ClueId>;
  discussedTopics: Set<StoryNodeId>;
  firstInteractionDone: boolean;
  keywordsFileUnlocked: boolean;
};

export interface FileNode {
  type: 'folder' | 'file' | 'image' | 'audio' | 'corrupted';
  name: string;
  action?: () => void;
}

export interface FolderNode {
  title: string;
  content: FileNode[];
}