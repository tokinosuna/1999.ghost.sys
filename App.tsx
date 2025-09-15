import React, { useState, useEffect, useCallback, useRef } from 'react';
import Window from './components/Window';
import { useGameState } from './hooks/useGameState';
import { WindowId, WindowState, TopicId } from './types';
import { storyData, textFileData, searchData } from './data';

const w = window.innerWidth;
const h = window.innerHeight;

const initialWindows: Record<WindowId, WindowState> = {
    'my-computer': { id: 'my-computer', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.05, y: h * 0.1 }, zIndex: 10, title: '🖥️ My Computer', size: { width: Math.min(400, w * 0.9), height: Math.min(300, h * 0.8) } },
    'messenger': { id: 'messenger', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.2, y: h * 0.05 }, zIndex: 10, title: '💬 Instant Messenger', size: { width: Math.min(450, w * 0.95), height: Math.min(500, h * 0.9) } },
    'netscape': { id: 'netscape', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.3, y: h * 0.15 }, zIndex: 10, title: '🌐 Netscape Navigator', size: { width: Math.min(600, w * 0.95), height: Math.min(400, h * 0.9) } },
    'winamp': { id: 'winamp', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.4, y: h * 0.2 }, zIndex: 10, title: '🎵 Winamp', size: { width: Math.min(350, w * 0.9), height: Math.min(250, h * 0.8) } },
    'diary': { id: 'diary', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.5, y: h * 0.25 }, zIndex: 10, title: '🔒 Diary_Final_Draft.txt', size: { width: Math.min(400, w * 0.9), height: Math.min(300, h * 0.8) } },
    'search': { id: 'search', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.1, y: h * 0.2 }, zIndex: 10, title: '🔎 Search', size: { width: Math.min(500, w * 0.95), height: Math.min(400, h * 0.9) } },
    'file-explorer': { id: 'file-explorer', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.1, y: h * 0.15 }, zIndex: 10, title: '📄 File Explorer', size: { width: Math.min(500, w * 0.95), height: Math.min(400, h * 0.9) } },
    'text-viewer': { id: 'text-viewer', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.25, y: h * 0.25 }, zIndex: 10, title: '📄 Notepad', size: { width: Math.min(550, w * 0.95), height: Math.min(350, h * 0.9) } },
    'dev-log-viewer': { id: 'dev-log-viewer', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.25, y: h * 0.2 }, zIndex: 10, title: '📝 DEV_LOG.txt', size: { width: Math.min(550, w * 0.95), height: Math.min(400, h * 0.9) } },
    'settings': { id: 'settings', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.2, y: h * 0.2 }, zIndex: 10, title: '⚙️ Settings', size: { width: Math.min(400, w * 0.9), height: Math.min(300, h * 0.8) } },
    'help': { id: 'help', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.2, y: h * 0.2 }, zIndex: 10, title: '❓ Help', size: { width: Math.min(450, w * 0.95), height: Math.min(350, h * 0.9) } },
    'chat-log-viewer': { id: 'chat-log-viewer', isOpen: false, isFocused: false, isMinimized: false, position: { x: w * 0.15, y: h * 0.15 }, zIndex: 10, title: '💬 Chat Log', size: { width: Math.min(400, w * 0.9), height: Math.min(450, h * 0.9) } },
};

const BSOD: React.FC = () => (
    <div className="fixed inset-0 bg-[#0000AA] text-white font-mono z-[99999] p-8 flex flex-col justify-center">
        <p className="text-center">A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
        <br />
        <p className="text-center">A GHOST IN THE MACHINE</p>
        <br />
        <p>If this is the first time you've seen this stop error screen, restart your computer. If this screen appears again, follow these steps:</p>
        <br/>
        <p>Check to be sure you have adequate disk space. If a driver is identified in the stop message, disable the driver or check with the manufacturer for driver updates. Try changing video adapters.</p>
        <br />
        <p>Technical information:</p>
        <br />
        <p>*** STOP: 0x0000DEAD (Promise_Not_Kept, Memory_Corrupted, He_is_gone)</p>
    </div>
);

const DesktopIcon: React.FC<{ emoji: string; label: string; onDoubleClick: () => void; isVisible?: boolean; isNew?: boolean }> = ({ emoji, label, onDoubleClick, isVisible = true, isNew = false }) => {
    if (!isVisible) return null;
    return (
        <div className={`w-24 h-24 text-center text-white flex flex-col items-center justify-center p-2 cursor-pointer ${isNew ? 'new-icon-anim' : ''}`} onDoubleClick={onDoubleClick}>
            <div className="text-4xl">{emoji}</div>
            <span className="mt-1 text-sm break-words shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{label}</span>
        </div>
    );
};

export default function App() {
    const { state, dispatch, handleChoice, discoverClue, unlockDiary, accessNewsArchive, triggerEndSequence, openTextFile } = useGameState();
    const { chatHistory, storyNode, unlockedTopics, epilogueStarted, discussedTopics, keywordsFileUnlocked } = state;

    const [windows, setWindows] = useState(initialWindows);
    const [highestZIndex, setHighestZIndex] = useState(20);
    const [currentTime, setCurrentTime] = useState('10:14 PM 12/27/1999');
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    
    // File/Window specific states
    const [fileExplorerContent, setFileExplorerContent] = useState({title: 'File Explorer', content: <></>});
    const [textViewerContent, setTextViewerContent] = useState({title: 'Notepad', content: ''});
    const [chatLogViewerContent, setChatLogViewerContent] = useState<React.ReactNode>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState('<p>Enter a term to search for system-wide information.</p>');
    const [diaryPassword, setDiaryPassword] = useState('');
    const [newsArchiveUnlocked, setNewsArchiveUnlocked] = useState(false);
    
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    // Window Management
    const openWindow = useCallback((id: WindowId) => {
        if (state.epilogueStarted && id !== 'messenger') return;
        
        setWindows(prev => {
            const newZ = highestZIndex + 1;
            setHighestZIndex(newZ);
            
            const focusedWindows = Object.entries(prev).reduce((acc, [key, value]) => {
                acc[key as WindowId] = { ...value, isFocused: false };
                return acc;
            }, {} as Record<WindowId, WindowState>);

            return {
                ...focusedWindows,
                [id]: { ...prev[id], isOpen: true, zIndex: newZ, isFocused: true, isMinimized: false }
            };
        });
    }, [highestZIndex, state.epilogueStarted]);

    const closeWindow = useCallback((id: WindowId) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false, isFocused: false, isMinimized: false } }));
    }, []);

    const focusWindow = useCallback((id: WindowId) => {
        setWindows(prev => {
            if (prev[id].isFocused && !prev[id].isMinimized) return prev;

            const newZ = highestZIndex + 1;
            setHighestZIndex(newZ);

            const focusedWindows = Object.entries(prev).reduce((acc, [key, value]) => {
                acc[key as WindowId] = { ...value, isFocused: false };
                return acc;
            }, {} as Record<WindowId, WindowState>);

            return { ...focusedWindows, [id]: { ...prev[id], zIndex: newZ, isFocused: true, isMinimized: false } };
        });
    }, [highestZIndex]);
    
    const minimizeWindow = useCallback((id: WindowId) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true, isFocused: false }
        }));
    }, []);
    
    const handleTaskbarClick = useCallback((id: WindowId) => {
        const window = windows[id];
        if (window.isMinimized) {
            focusWindow(id);
        } else {
            if (window.isFocused) {
                minimizeWindow(id);
            } else {
                focusWindow(id);
            }
        }
    }, [windows, focusWindow, minimizeWindow]);

    // Game Logic: First Interaction triggers messenger
    const handleFirstInteraction = useCallback((callback: () => void) => {
        callback();
        if (!state.firstInteractionDone) {
            dispatch({ type: 'SET_STATE', payload: { firstInteractionDone: true } });
        }
    }, [state.firstInteractionDone, dispatch]);

    useEffect(() => {
        if (state.firstInteractionDone && !state.messengerOpened) {
            openWindow('messenger');
            dispatch({ type: 'SET_STATE', payload: { messengerOpened: true } });
            setTimeout(() => {
                if (!state.ilContacted) {
                    dispatch({ type: 'SET_STATE', payload: { ilContacted: true } });
                    const node = storyData.start;
                    let delay = 500;
                    node.response.forEach(msg => {
                        setTimeout(() => dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now() + Math.random(), sender: 'IL_Otome99', text: msg, senderClass: 'il' } }), delay);
                        delay += 1000 + msg.length * 30;
                    });
                }
            }, 2000); // 2-second delay after first interaction
        }
    }, [state.firstInteractionDone, state.messengerOpened, state.ilContacted, openWindow, dispatch]);


    const handleOpenTextFile = (fileId: string) => {
        const file = textFileData[fileId];
        if (file) {
            setWindows(p => ({ ...p, 'text-viewer': {...p['text-viewer'], title: `📄 ${file.title}`} }));
            setTextViewerContent({ title: file.title, content: file.content });
            openWindow('text-viewer');
            openTextFile(fileId);
        }
    };
    
    const handleOpenChatLog = (fileId: string) => {
        const file = textFileData[fileId];
        if (!file) return;

        const lines = file.content.split('\n');
        const content = lines.map((line, index) => {
            const [sender, ...textParts] = line.split(': ');
            const text = textParts.join(': ');
            let senderClass = 'text-black';
            if (sender.startsWith('IL_')) senderClass = 'text-red-700 font-bold';
            if (sender.startsWith('Kielala_')) senderClass = 'text-blue-600 font-bold';
            if (sender.startsWith('Kikyo_')) senderClass = 'text-purple-700 font-bold';
            if (sender.startsWith('Siririll_')) senderClass = 'text-gray-700 font-bold';
            return <p key={index}><span className={senderClass}>{sender}:</span> {text}</p>;
        });

        setWindows(p => ({ ...p, 'chat-log-viewer': {...p['chat-log-viewer'], title: `💬 ${file.title}`} }));
        setChatLogViewerContent(<div>{content}</div>);
        openWindow('chat-log-viewer');
        openTextFile(fileId); // This will still trigger haunting events
    };


    const handleOpenDevLog = () => {
        const file = textFileData['dev_log'];
        setWindows(p => ({ ...p, 'dev-log-viewer': {...p['dev-log-viewer'], title: `📝 ${file.title}`} }));
        setTextViewerContent({ title: file.title, content: file.content });
        openWindow('dev-log-viewer');
    };

    const handleOpenKeywordsFile = () => {
        const topicMap: Record<TopicId, string> = {
            'otome_media': 'Otome Media',
            'kielala': 'Kielala',
            'hospital_recording': 'The hospital recording',
            'diary': 'The locked diary file',
            'y2k': 'Y2K',
        };
        const keywords = Array.from(unlockedTopics).map(topic => `- ${topicMap[topic] || topic}`).join('\n');
        const content = `System Keywords Logged:\n\nThis file automatically updates with topics of interest discovered within the system. These may be useful for system-wide searches.\n\n${keywords.length > 0 ? keywords : '(No keywords logged)'}`;

        setWindows(p => ({ ...p, 'text-viewer': {...p['text-viewer'], title: `📄 keywords.txt`} }));
        setTextViewerContent({ title: 'keywords.txt', content: content });
        openWindow('text-viewer');
        dispatch({ type: 'SET_STATE', payload: { openedFiles: new Set(state.openedFiles).add('keywords.txt') } });
    };

    const handleSearch = () => {
        const term = searchQuery.toLowerCase().trim();
        let found = false;
        if (!term) return;

        for (const key in searchData) {
            if (term.includes(key)) {
                const result = searchData[key];
                setSearchResults(`<h3>${result.title}</h3>${result.content}`);
                found = true;
                if (key === 'y2k' && !unlockedTopics.has('y2k')) {
                    dispatch({ type: 'UNLOCK_TOPIC', payload: 'y2k' });
                    dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now(), sender: 'System', text: 'New Topic Unlocked: [Y2K]', senderClass: 'system' } });
                }
                break;
            }
        }
        if (!found) {
            setSearchResults(`<p>No system-wide results found for "${term}".</p>`);
        }
    };

    const handleCheckPassword = () => {
        if(diaryPassword === 'K1elala_my_pr0m1s3') {
            unlockDiary();
        } else {
            alert('Incorrect Password.');
        }
    }
    
    // Ghostly Interference Effect
    useEffect(() => {
        if (state.ilContacted && !state.gameEnded && !state.epilogueStarted) {
            const interval = setInterval(() => {
                if (Math.random() < 0.2) { // 20% chance
                    const events = ['message', 'focus'];
                    const randomEvent = events[Math.floor(Math.random() * events.length)];
                    if (randomEvent === 'message') {
                        const messages = ['...', 'Why?', 'Kielala...'];
                        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                        dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now(), sender: 'IL_Otome99', text: randomMsg, senderClass: 'il' } });
                    } else if (randomEvent === 'focus' && windows.messenger.isOpen) {
                        focusWindow('messenger');
                    }
                }
            }, 45000); // Every 45 seconds
            return () => clearInterval(interval);
        }
    }, [state.ilContacted, state.gameEnded, state.epilogueStarted, windows.messenger.isOpen, focusWindow, dispatch]);
    
    // Update clock for epilogue
    useEffect(() => {
        if (epilogueStarted && chatHistory.length > 0) {
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage.date) {
                setCurrentTime(lastMessage.date);
            }
        } else if (!epilogueStarted) {
            const interval = setInterval(() => {
                 setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' 12/27/1999');
            }, 1000); // Update every second
            return () => clearInterval(interval);
        }
    }, [epilogueStarted, chatHistory]);
    
    // Auto-scroll chat
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Final Confrontation
    const [finalMessage, setFinalMessage] = useState<string[]>([]);
    const finalWords = "Otome Media Scion, Illmimi Otome, Dies of Rare Pulmonary Illness.".split(' ');
    const [usedWords, setUsedWords] = useState<boolean[]>(Array(finalWords.length).fill(false));
    const addWordToFinalMessage = (word: string, index: number) => {
        setFinalMessage(prev => [...prev, word]);
        setUsedWords(prev => {
            const newUsed = [...prev];
            newUsed[index] = true;
            return newUsed;
        });
    };

    const renderFileContent = (folderId: string) => {
        let content;
        let title = '';
        switch(folderId) {
            case 'drive_c':
                title = '💽 Local Disk (C:)';
                content = <>
                    <li onClick={() => handleFirstInteraction(() => renderFileContent('my_docs'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📁</span> My Documents</li>
                    <li onClick={() => handleFirstInteraction(() => renderFileContent('windows_folder'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📁</span> WINDOWS</li>
                </>;
                break;
            case 'my_docs':
                title = '📁 My Documents';
                content = <>
                    <li onClick={() => handleFirstInteraction(() => renderFileContent('chat_logs'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📁</span> Chat_Logs</li>
                    <li onClick={() => handleFirstInteraction(() => renderFileContent('family_photos'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📁</span> Family_Photos</li>
                    <li onClick={() => handleFirstInteraction(() => handleOpenTextFile('notes'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> Notes.txt</li>
                    <li onClick={() => handleFirstInteraction(() => handleOpenTextFile('corporate_memo'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> Y2K_memo.txt</li>
                </>;
                break;
            case 'windows_folder':
                title = '📁 WINDOWS';
                content = <><li onClick={() => handleFirstInteraction(() => handleOpenTextFile('sys_config'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> sys_config.bak</li></>;
                break;
            case 'chat_logs':
                title = '📁 Chat_Logs';
                content = <>
                    <li onClick={() => handleFirstInteraction(() => handleOpenChatLog('log_mom'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> mom_log.txt</li>
                    <li onClick={() => handleFirstInteraction(() => handleOpenChatLog('log_father'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> father_log.txt</li>
                    <li onClick={() => handleFirstInteraction(() => handleOpenChatLog('log_kielala'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> kielala_log.txt</li>
                    <li onClick={() => handleFirstInteraction(() => handleOpenTextFile('draft_email'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>📄</span> draft_email.txt</li>
                </>;
                break;
            case 'family_photos':
                title = '📁 Family_Photos';
                content = <>
                    <li onClick={() => handleFirstInteraction(() => discoverClue('kielala', '[Kielala]', 'An image of two young boys. The filename is kielala_and_me.jpg.'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>🖼️</span> kielala_and_me.jpg</li>
                    <li className="flex items-center gap-2 p-1 text-gray-500"><span>🚧</span> family_vacation_98.jpg (Corrupted)</li>
                </>;
                break;
        }
        setWindows(p => ({ ...p, 'file-explorer': {...p['file-explorer'], title: title || 'File Explorer'} }));
        setFileExplorerContent({ title: title || 'File Explorer', content });
        openWindow('file-explorer');
    };

    if (state.bsodActive) return <BSOD />;
    
    return (
        <div className={`h-screen w-screen bg-cover bg-center overflow-hidden ${state.hauntingEvent === 'glitch' || (state.gameEnded && !state.bsodActive) ? 'screen-glitch-anim' : ''}`} style={{ backgroundImage: "url('https://placehold.co/1920x1080/008080/008080?text=.')"}}>
            {/* Desktop Area */}
            <div className="h-[calc(100%-30px)] w-full p-5 flex flex-col flex-wrap content-start">
                <DesktopIcon emoji="🖥️" label="My Computer" onDoubleClick={() => handleFirstInteraction(() => renderFileContent('drive_c'))} />
                <DesktopIcon emoji="💬" label="IL_Messenger" onDoubleClick={() => handleFirstInteraction(() => openWindow('messenger'))} />
                <DesktopIcon emoji="🌐" label="Netscape" onDoubleClick={() => handleFirstInteraction(() => openWindow('netscape'))} />
                <DesktopIcon emoji="🎵" label="Winamp" onDoubleClick={() => handleFirstInteraction(() => openWindow('winamp'))} />
                <DesktopIcon emoji="📝" label="DEV_LOG.txt" onDoubleClick={() => handleFirstInteraction(handleOpenDevLog)} />
                <DesktopIcon emoji="🔬" label="keyword_research.txt" onDoubleClick={() => handleFirstInteraction(() => handleOpenTextFile('keyword_research'))} />
                <DesktopIcon emoji="🔑" label="keywords.txt" onDoubleClick={() => handleFirstInteraction(handleOpenKeywordsFile)} isVisible={keywordsFileUnlocked} isNew={keywordsFileUnlocked && !state.openedFiles.has('keywords.txt')} />
                <DesktopIcon emoji="🔒" label="Diary_Final_Draft.txt" onDoubleClick={() => handleFirstInteraction(() => openWindow('diary'))} isVisible={state.hasMentionedPromise} isNew={state.hasMentionedPromise && !state.openedFiles.has('diary')} />
            </div>

            {/* Windows */}
            {(Object.values(windows) as WindowState[]).filter(w => w.isOpen && !w.isMinimized).sort((a,b) => a.zIndex - b.zIndex).map(win => (
                <Window key={win.id} {...win} onClose={() => closeWindow(win.id)} onFocus={() => focusWindow(win.id)} onMinimize={() => minimizeWindow(win.id)} initialPosition={win.position} initialSize={win.size}>
                    {/* Window Content Switcher */}
                    {win.id === 'my-computer' && (<ul><li onClick={() => handleFirstInteraction(() => renderFileContent('drive_c'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>💽</span> Local Disk (C:)</li></ul>)}
                    
                    {win.id === 'file-explorer' && <ul className='list-none p-0 m-0'>{fileExplorerContent.content}</ul>}
                    
                    {win.id === 'text-viewer' && <pre className='font-mono whitespace-pre-wrap p-2'>{textViewerContent.content}</pre>}
                    {win.id === 'dev-log-viewer' && <pre className='font-mono whitespace-pre-wrap p-2'>{textViewerContent.content}</pre>}
                    {win.id === 'chat-log-viewer' && <div className='p-2 font-mono text-sm leading-relaxed break-words'>{chatLogViewerContent}</div>}

                    {win.id === 'help' && <div className='p-4'>
                        <h2 className='font-bold text-lg mb-2'>GHOST.SYS Help</h2>
                        <p className='mb-2'>Welcome. You have accessed a closed system. The entity 'IL_Otome99' is present.</p>
                        <p className='mb-2'>1. <span className='font-bold'>Explore the Desktop:</span> Double-click icons to open files and programs.</p>
                        <p className='mb-2'>2. <span className='font-bold'>Communicate:</span> Use the Instant Messenger to speak with the entity. Unlocked topics will appear as buttons.</p>
                        <p className='mb-2'>3. <span className='font-bold'>Find Clues:</span> Information is scattered across files, websites, and programs. New clues may unlock new conversation topics.</p>
                        <p>Your goal is to uncover the truth.</p>
                    </div>}

                    {win.id === 'settings' && <div className='p-4 text-gray-500'>
                        <h2 className='font-bold text-lg mb-2 text-black'>Settings</h2>
                        <p className='mb-2'>Display Resolution:</p>
                        <select disabled className='w-full bg-gray-200 p-1 w95-inset'><option>1024x768</option></select>
                        <p className='mt-4 mb-2'>Sound Volume:</p>
                        <input type="range" disabled className='w-full' />
                        <p className='mt-4 text-center'>[System settings are locked.]</p>
                    </div>}

                    {win.id === 'netscape' && <div className='p-2'><h3>Welcome to Netscape!</h3><p>Bookmarks:</p>
                        <ul className="list-none p-0 m-0 mt-2">
                            <li onClick={() => handleFirstInteraction(() => discoverClue('otome_media', '[Otome Media]', 'GeoCities site: OtomeMedia.com. A corporate nightmare of buzzwords.'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>🔗</span> Otome Media Corporate Site</li>
                            <li onClick={() => handleFirstInteraction(() => discoverClue('kielala', '[Kielala]', 'GeoCities site: Kielala\'s Art Page. Mostly video game doodles.'))} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>🔗</span> Kielala's Art Page</li>
                            <li onClick={() => handleFirstInteraction(() => { if(accessNewsArchive()) setNewsArchiveUnlocked(true); })} className={`flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer ${newsArchiveUnlocked ? 'bg-[#000080] text-white' : ''}`}><span>🔗</span> {newsArchiveUnlocked ? 'Otome Media Scion, Illmimi Otome, Dies. Dec 28th, 1999.' : 'News Archive: December 1999 (Archive Damaged)'}</li>
                        </ul>
                    </div>}

                    {win.id === 'winamp' && <div className='p-2'><h4>Playlist:</h4>
                        <ol className="list-decimal list-inside mt-2">
                            <li>techno_mix_98.mid</li>
                            <li>gaming_anthem.mid</li>
                            <li onClick={() => handleFirstInteraction(() => discoverClue('hospital_recording', '[The hospital recording]', 'You hear the faint beeping of a heart monitor and painful, suppressed coughing.'))} className="cursor-pointer hover:bg-[#000080] hover:text-white">Hospital_Recording_Final.mp3</li>
                        </ol>
                    </div>}

                    {win.id === 'diary' && !state.diaryRead && <div className='p-4'>
                        <p>This file is encrypted.</p>
                        <p className="mt-2">Password: <input type="text" value={diaryPassword} onChange={e => setDiaryPassword(e.target.value)} className="w95-inset bg-white p-1" /> <button className="w95-button bg-[#c0c0c0] px-3 py-1 ml-2" onClick={handleCheckPassword}>Unlock</button></p>
                    </div>}
                    {win.id === 'diary' && state.diaryRead && <div className='p-4'>
                        <h4>To Kielala,</h4><p className="mt-2">If you're reading this, it means I messed up. The doctors keep saying things I don't understand... It's hard to breathe. I'm supposed to be the strong one... but I'm just tired. The coughing won't stop. I'm sorry if I was ever too hard on you. I just wanted you to be safe. Wait for me. Once this Y2K bug is over, we'll...</p>
                    </div>}

                    {win.id === 'search' && <div className='p-2 flex flex-col h-full bg-[#c0c0c0]'>
                        <div className="w95-inset bg-white p-2">
                            <label htmlFor="search-term">Search for:</label>
                            <input type="text" id="search-term" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 w95-inset bg-white p-1 ml-1" />
                            <button className="w95-button bg-[#c0c0c0] px-3 py-1 ml-2" onClick={handleSearch}>Search Now</button>
                        </div>
                        <div className="w95-inset bg-white p-2 mt-2 flex-grow overflow-y-auto" dangerouslySetInnerHTML={{ __html: searchResults }}></div>
                    </div>}
                    
                    {win.id === 'messenger' && <div className="flex flex-col h-full bg-white p-0">
                        <div ref={chatHistoryRef} className="flex-grow p-2 overflow-y-auto">
                            {chatHistory.map(msg => (
                                <div key={msg.id} className={`mb-2 break-words ${msg.senderClass === 'system' ? 'text-center' : ''}`}>
                                    <span className={`font-bold ${
                                        msg.senderClass === 'il' ? 'text-red-700' :
                                        msg.senderClass === 'kielala' ? 'text-blue-600' :
                                        msg.senderClass === 'player' ? 'text-blue-800' :
                                        'text-green-700 italic'
                                    }`}>{msg.sender}:</span>
                                    {msg.isHTML ? <span dangerouslySetInnerHTML={{ __html: ` ${msg.text}` }}/> : ` ${msg.text}`}
                                </div>
                            ))}
                        </div>
                        <div className="p-1 border-t-2 border-t-white border-l-2 border-l-white bg-[#c0c0c0] min-h-[60px]">
                            {!state.confrontationReady && !epilogueStarted && (
                              <div className="max-h-[120px] overflow-y-auto pr-1">
                                <div className="flex flex-wrap gap-2">
                                    {storyData[storyNode]?.options?.map(opt => <button key={opt.action} className="w95-button bg-[#c0c0c0] px-2 py-1" onClick={() => handleChoice(opt.action, opt.text)}>{opt.text}</button>)}
                                    {Array.from(unlockedTopics).map(topic => {
                                        const topicData = {
                                            'otome_media': { text: '[Otome Media]', action: 'topic_otome_media' },
                                            'kielala': { text: '[Kielala]', action: 'topic_kielala' },
                                            'hospital_recording': { text: '[The hospital recording]', action: 'topic_hospital_recording' },
                                            'diary': { text: '[The locked file]', action: 'topic_diary' },
                                            'y2k': { text: '[Y2K]', action: 'topic_y2k' }
                                        };
                                        const t = topicData[topic as TopicId];
                                        if(discussedTopics.has(t.action)) return null;
                                        return <button key={t.action} className="w95-button bg-[#c0c0c0] px-2 py-1" onClick={() => handleChoice(t.action, t.text)}>{t.text}</button>
                                    })}
                                </div>
                              </div>
                            )}
                            {state.confrontationReady && !state.gameEnded && <div>
                                <div className="w95-inset bg-white p-1 min-h-[24px] mb-1">{finalMessage.join(' ')}</div>
                                <div className="flex flex-wrap gap-1">
                                    {finalWords.map((word, index) => <button key={index} className="w95-button bg-[#c0c0c0] px-2 py-1 disabled:opacity-50" onClick={() => addWordToFinalMessage(word, index)} disabled={usedWords[index]}>{word}</button>)}
                                    {finalMessage.length === finalWords.length && <button className="w95-button bg-[#c0c0c0] px-4 py-1" onClick={() => triggerEndSequence(finalMessage.join(' '))}>Send</button>}
                                </div>
                            </div>}
                            {epilogueStarted && <div className="text-center text-gray-600 p-4">-- CONNECTION TERMINATED --</div>}
                        </div>
                    </div>}
                </Window>
            ))}

            {/* Fake Error Dialog */}
            {state.showFakeError && (
                <div className="fixed inset-0 flex items-center justify-center z-[50000]">
                    <div className="w95-outset bg-[#c0c0c0] p-1 shadow-lg w-80 animate-pulse">
                        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white p-1 font-bold">System Error</div>
                        <div className="p-4 text-center">
                            <p className="text-red-600 font-bold">MEMORY_CORRUPTION_DETECTED</p>
                            <p className="mt-2">He is still here.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Taskbar */}
            <div className="absolute bottom-0 left-0 w-full h-[30px] bg-[#c0c0c0] w95-outset flex items-center px-1 z-[4999]">
                <button onClick={() => setStartMenuOpen(!startMenuOpen)} className="w95-button bg-[#c0c0c0] font-bold flex items-center gap-1 px-2 py-0.5">
                    <img src="https://placehold.co/20x20/008080/FFFFFF?text=S" alt="Start"/>
                    <span>Start</span>
                </button>
                {startMenuOpen && <div className="absolute bottom-[28px] left-0 w-48 bg-[#c0c0c0] w95-outset flex z-[5000]">
                    <div className="w-6 bg-[#000080] text-white font-bold text-xl p-2 start-menu-sidebar"><span>Windows 2000</span></div>
                    <ul className="flex-1 list-none p-1">
                        <li onClick={() => handleFirstInteraction(() => { openWindow('search'); setStartMenuOpen(false); })} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>🔎</span> Search</li>
                        <li onClick={() => handleFirstInteraction(() => { openWindow('settings'); setStartMenuOpen(false); })} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>⚙️</span> Settings</li>
                        <li onClick={() => handleFirstInteraction(() => { openWindow('help'); setStartMenuOpen(false); })} className="flex items-center gap-2 p-1 hover:bg-[#000080] hover:text-white cursor-pointer"><span>❓</span> Help</li>
                        <li className="flex items-center gap-2 p-1 text-gray-500 cursor-not-allowed"><span>🏃</span> Run...</li>
                        <li className="border-t-2 border-t-gray-400 border-b-2 border-b-white my-1"></li>
                        <li className="flex items-center gap-2 p-1 text-gray-500 cursor-not-allowed"><span>🔌</span> Shut Down...</li>
                    </ul>
                </div>}

                <div className='h-full border-l-2 border-gray-400 ml-2'></div>
                
                <div className="flex-1 flex items-center gap-1 ml-1 h-full overflow-x-auto">
                    {(Object.values(windows) as WindowState[]).filter(w => w.isOpen).map(win => (
                        <button 
                            key={win.id} 
                            onClick={() => handleTaskbarClick(win.id)}
                            className={`h-[24px] min-w-[100px] max-w-[150px] px-2 flex items-center gap-1 text-black text-xs truncate ${win.isFocused && !win.isMinimized ? 'w95-inset bg-gray-300' : 'w95-button bg-[#c0c0c0]'}`}
                        >
                            <span dangerouslySetInnerHTML={{__html: win.title.split(' ')[0]}}></span>
                            <span className="truncate">{win.title.substring(win.title.indexOf(' ') + 1)}</span>
                        </button>
                    ))}
                </div>

                <div className="ml-auto w95-inset px-2 py-0.5">{currentTime}</div>
            </div>
        </div>
    );
}