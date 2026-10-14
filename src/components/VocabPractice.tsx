import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Award, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Sparkles, 
  Shuffle, 
  FolderOpen, 
  Edit3, 
  Volume2, 
  VolumeX,
  X
} from 'lucide-react';
import { PRELOADED_SAT_VOCAB, VocabWord } from '../data/vocabulary';
import { 
  playCorrectSound, 
  playIncorrectSound, 
  playFanfareSound, 
  isSoundEnabled, 
  toggleSound 
} from '../utils/soundEffects';

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  words: VocabWord[];
}

export type WordRating = 'needs_review' | 'almost' | 'know_it';

const LOCAL_STORAGE_DECKS_KEY = 'satify_vocab_decks';
const LOCAL_STORAGE_CUSTOM_DECKS_KEY = 'satify_custom_vocab_decks';
const LOCAL_STORAGE_RATINGS_KEY = 'satify_vocab_word_ratings';

type ReviewTab = 'flashcards' | 'learn' | 'match' | 'library' | 'decks';

// Curated IPA Phonetic Transcriptions for SAT Vocabulary
const IPA_PHONETICS: Record<string, string> = {
  ameliorate: '/əˈmiːljəˌreɪt/',
  anachronistic: '/əˌnæk.rəˈnɪs.tɪk/',
  antipathy: '/ænˈtɪp.ə.θi/',
  bolster: '/ˈboʊl.stər/',
  capricious: '/kəˈprɪʃ.əs/',
  corroborate: '/kəˈrɒb.ə.reɪt/',
  deleterious: '/ˌdɛl.ɪˈtɪər.i.əs/',
  disparate: '/ˈdɪs.pər.ɪt/',
  eloquent: '/ˈɛl.ə.kwənt/',
  ephemeral: '/ɪˈfɛm.ər.əl/',
  esoteric: '/ˌɛs.əˈtɛr.ɪk/',
  fastidious: '/fæˈstɪd.i.əs/',
  frugal: '/ˈfruː.ɡəl/',
  gregarious: '/ɡrɪˈɡɛər.i.əs/',
  haughty: '/ˈhɔː.ti/',
  impetuous: '/ɪmˈpɛtʃ.u.əs/',
  intrepid: '/ɪnˈtrɛp.ɪd/',
  lucid: '/ˈluː.sɪd/',
  mitigate: '/ˈmɪt.ɪ.ɡeɪt/',
  nebulous: '/ˈnɛb.jə.ləs/',
  obsequious: '/əbˈsiː.kwi.əs/',
  pragmatic: '/præɡˈmæt.ɪk/',
  quixotic: '/kwɪkˈsɒt.ɪk/',
  reticent: '/ˈrɛt.ɪ.sənt/',
  sycophant: '/ˈsɪk.ə.fænt/',
  taciturn: '/ˈtæs.ɪ.tɜːrn/',
  ubiquitous: '/juːˈbɪk.wɪ.təs/',
  vacillate: '/ˈvæs.ɪ.leɪt/',
  wary: '/ˈwɛər.i/',
  zealot: '/ˈzɛl.ət/',
  aberration: '/ˌæb.əˈreɪ.ʃən/',
  abstain: '/əbˈsteɪn/',
  adversity: '/ədˈvɜːr.sə.ti/',
  aesthetic: '/iːsˈθɛt.ɪk/',
  amicable: '/ˈæm.ɪ.kə.bəl/',
  assiduous: '/əˈsɪdʒ.u.əs/',
  benevolent: '/bəˈnɛv.ə.lənt/',
  cacophony: '/kəˈkɒf.ə.ni/',
  candid: '/ˈkæn.dɪd/',
  caustic: '/ˈkɔː.stɪk/',
  circumspect: '/ˈsɜːr.kəm.spɛkt/',
  clandestine: '/klænˈdɛs.tɪn/',
  cogent: '/ˈkoʊ.dʒənt/',
  complacent: '/kəmˈpleɪ.sənt/',
  conciliatory: '/kənˈsɪl.i.ə.tɔːr.i/',
  connoisseur: '/ˌkɒn.əˈsɜːr/',
  conspicuous: '/kənˈspɪk.ju.əs/',
  contemptuous: '/kənˈtɛmp.tʃu.əs/',
  contentious: '/kənˈtɛn.ʃəs/',
  copious: '/ˈkoʊ.pi.əs/',
  corroboration: '/kəˌrɒb.əˈreɪ.ʃən/',
  credulous: '/ˈkrɛdʒ.ə.ləs/',
  cursory: '/ˈkɜːr.sər.i/',
  dauntless: '/ˈdɔːnt.lɪs/',
  dearth: '/dɜːrθ/',
  decorum: '/dɪˈkɔːr.əm/',
  deferential: '/ˌdɛf.əˈrɛn.ʃəl/',
  demagogue: '/ˈdɛm.ə.ɡɒɡ/',
  denounce: '/dɪˈnaʊns/',
  deride: '/dɪˈraɪd/',
  derivative: '/dɪˈrɪv.ə.tɪv/',
  desiccated: '/ˈdɛs.ɪ.keɪ.tɪd/',
  didactic: '/daɪˈdæk.tɪk/',
  diffident: '/ˈdɪf.ɪ.dənt/',
  dilatory: '/ˈdɪl.ə.tɔːr.i/',
  dilettante: '/ˌdɪl.əˈtɑːn.ti/',
  disdain: '/dɪsˈdeɪn/',
  disingenuous: '/ˌdɪs.ɪnˈdʒɛn.ju.əs/',
  disparage: '/dɪˈspær.ɪdʒ/',
  dispassionate: '/dɪsˈpæʃ.ən.ət/',
  disseminate: '/dɪˈsɛm.ɪ.neɪt/',
  dissonance: '/ˈdɪs.ə.nəns/',
  divergent: '/daɪˈvɜːr.dʒənt/',
  dogmatic: '/dɒɡˈmæt.ɪk/',
  duplicity: '/djuːˈplɪs.ə.ti/',
  eclectic: '/ɪˈklɛk.tɪk/',
  efficacious: '/ˌɛf.ɪˈkeɪ.ʃəs/',
  effrontery: '/ɪˈfrʌn.tər.i/',
  egregious: '/ɪˈɡriː.dʒəs/',
  elucidate: '/ɪˈluː.sɪ.deɪt/',
  enervate: '/ˈɛn.ər.veɪt/',
  engender: '/ɪnˈdʒɛn.dər/',
  enigma: '/ɪˈnɪɡ.mə/',
  equivocal: '/ɪˈkwɪv.ə.kəl/',
  erudite: '/ˈɛr.uː.daɪt/',
  evanescent: '/ˌɛv.əˈnɛs.ənt/',
  exacerbate: '/ɪɡˈzæs.ər.beɪt/',
  exculpate: '/ˈɛk.skʌl.peɪt/',
  exemplary: '/ɪɡˈzɛm.plər.i/',
  exonerate: '/ɪɡˈzɒn.ə.reɪt/',
  expedient: '/ɪkˈspiː.di.ənt/',
  extraneous: '/ɪkˈstreɪ.ni.əs/',
  facetious: '/fəˈsiː.ʃəs/',
  fallacious: '/fəˈleɪ.ʃəs/',
  fervent: '/ˈfɜːr.vənt/',
  fortuitous: '/fɔːrˈtjuː.ɪ.təs/',
  galvanize: '/ˈɡæl.və.naɪz/',
  garish: '/ˈɡɛər.ɪʃ/',
  garrulous: '/ˈɡær.ə.ləs/',
  gratuitous: '/ɡrəˈtjuː.ɪ.təs/',
  hackneyed: '/ˈhæk.nid/',
  harangue: '/həˈræŋ/',
  hedonist: '/ˈhiː.dən.ɪst/',
  hierarchy: '/ˈhaɪə.rɑːr.ki/',
  hubris: '/ˈhjuː.brɪs/',
  iconoclast: '/aɪˈkɒn.ə.klæst/',
  idiosyncrasy: '/ˌɪd.i.əˈsɪŋ.krə.si/',
  immutable: '/ɪˈmjuː.tə.bəl/',
  impassive: '/ɪmˈpæs.ɪv/',
  impecunious: '/ˌɪm.pɪˈkjuː.ni.əs/',
  imperious: '/ɪmˈpɪər.i.əs/',
  impetus: '/ˈɪm.pɪ.təs/',
  inadvertent: '/ˌɪn.ədˈvɜːr.tənt/',
  inchoate: '/ɪnˈkoʊ.eɪt/',
  incongruous: '/ɪnˈkɒŋ.ɡru.əs/',
  indolent: '/ˈɪn.də.lənt/',
  ineffable: '/ɪnˈɛf.ə.bəl/',
  ingenuous: '/ɪnˈdʒɛn.ju.əs/',
  inimical: '/ɪˈnɪm.ɪ.kəl/',
  innate: '/ɪˈneɪt/',
  innocuous: '/ɪˈnɒk.ju.əs/',
  insidious: '/ɪnˈsɪd.i.əs/',
  intractable: '/ɪnˈtræk.tə.bəl/',
  invective: '/ɪnˈvɛk.tɪv/',
  inveterate: '/ɪnˈvɛt.ər.ət/',
  irascible: '/ɪˈræs.ə.bəl/',
  lethargic: '/ləˈθɑːr.dʒɪk/',
  levity: '/ˈlɛv.ə.ti/',
  loquacious: '/loʊˈkweɪ.ʃəs/',
  lugubrious: '/luːˈɡuː.bri.əs/',
  magnanimous: '/mæɡˈnæn.ɪ.məs/',
  mendacious: '/mɛnˈdeɪ.ʃəs/',
  mercurial: '/mɜːrˈkjʊər.i.əl/',
  modicum: '/ˈmɒd.ɪ.kəm/',
  morose: '/məˈroʊs/'
};

export const getWordPhonetics = (word: string): string => {
  const lower = word.toLowerCase().trim();
  if (IPA_PHONETICS[lower]) return IPA_PHONETICS[lower];
  return `/${lower}/`;
};

export const speakWord = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
  }
};

export const VocabPractice: React.FC = () => {
  // ---------------------------------------------------------------------------
  // Custom Decks State from localStorage
  // ---------------------------------------------------------------------------
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DECKS_KEY) || localStorage.getItem(LOCAL_STORAGE_CUSTOM_DECKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist custom decks to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(customDecks);
      localStorage.setItem(LOCAL_STORAGE_DECKS_KEY, serialized);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_DECKS_KEY, serialized);
    } catch (err) {
      console.error('Failed to save custom decks:', err);
    }
  }, [customDecks]);

  // Persistent Word Ratings from localStorage
  const [wordRatings, setWordRatings] = useState<Record<string, WordRating>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RATINGS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_RATINGS_KEY, JSON.stringify(wordRatings));
    } catch (err) {
      console.error('Failed to save word ratings:', err);
    }
  }, [wordRatings]);

  // Selected Deck: 'all' | 'official' | deck.id
  const [selectedDeckId, setSelectedDeckId] = useState<string>('official');
  const [activeTab, setActiveTab] = useState<ReviewTab>('flashcards');
  const [isSoundActive, setIsSoundActive] = useState<boolean>(() => isSoundEnabled());

  useEffect(() => {
    const handleSoundToggle = (e: any) => {
      setIsSoundActive(e.detail?.enabled ?? isSoundEnabled());
    };
    window.addEventListener('satify_sound_toggle', handleSoundToggle);
    return () => window.removeEventListener('satify_sound_toggle', handleSoundToggle);
  }, []);

  // Currently active word list based on selectedDeckId
  const activeWords = useMemo<VocabWord[]>(() => {
    if (selectedDeckId === 'official') {
      return PRELOADED_SAT_VOCAB;
    }
    if (selectedDeckId === 'all') {
      const customAll = customDecks.flatMap(d => d.words);
      return [...PRELOADED_SAT_VOCAB, ...customAll];
    }
    const deck = customDecks.find(d => d.id === selectedDeckId);
    return deck ? deck.words : PRELOADED_SAT_VOCAB;
  }, [selectedDeckId, customDecks]);

  const activeDeckName = useMemo(() => {
    if (selectedDeckId === 'official') return 'Official SAT Top 150';
    if (selectedDeckId === 'all') return 'All SAT Words (Preloaded + Custom)';
    const deck = customDecks.find(d => d.id === selectedDeckId);
    return deck ? deck.name : 'Selected Deck';
  }, [selectedDeckId, customDecks]);

  const currentCustomDeck = useMemo(() => {
    return customDecks.find(d => d.id === selectedDeckId) || null;
  }, [selectedDeckId, customDecks]);

  // Ratings Count Statistics for the active deck
  const ratingCounts = useMemo(() => {
    let needsReview = 0;
    let almost = 0;
    let knowIt = 0;
    activeWords.forEach(w => {
      const r = wordRatings[w.id];
      if (r === 'needs_review') needsReview++;
      else if (r === 'almost') almost++;
      else if (r === 'know_it') knowIt++;
    });
    return {
      needsReview,
      almost,
      knowIt,
      unrated: Math.max(0, activeWords.length - (needsReview + almost + knowIt)),
    };
  }, [activeWords, wordRatings]);

  // ---------------------------------------------------------------------------
  // 1. Split-Pane Flashcard Reviewer State
  // ---------------------------------------------------------------------------
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isDefinitionRevealed, setIsDefinitionRevealed] = useState<boolean>(false);
  const [queueSearch, setQueueSearch] = useState<string>('');

  // Reset card index & definition state when active deck changes
  useEffect(() => {
    setCardIndex(0);
    setIsDefinitionRevealed(false);
  }, [selectedDeckId]);

  const currentFlashcard = activeWords[cardIndex] || activeWords[0];
  const currentRating = currentFlashcard ? wordRatings[currentFlashcard.id] : undefined;

  // Filtered queue of words for the left pane
  const queuedWords = useMemo(() => {
    if (!queueSearch.trim()) return activeWords;
    const q = queueSearch.toLowerCase().trim();
    return activeWords.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q) ||
      w.synonyms.some(s => s.toLowerCase().includes(q))
    );
  }, [activeWords, queueSearch]);

  const handleNextCard = () => {
    setIsDefinitionRevealed(false);
    setCardIndex(prev => (prev + 1) % (activeWords.length || 1));
  };

  const handlePrevCard = () => {
    setIsDefinitionRevealed(false);
    setCardIndex(prev => (prev - 1 + activeWords.length) % (activeWords.length || 1));
  };

  const handleShuffleCards = () => {
    setIsDefinitionRevealed(false);
    const rand = Math.floor(Math.random() * (activeWords.length || 1));
    setCardIndex(rand);
  };

  const handleRateWord = (rating: WordRating) => {
    if (!currentFlashcard) return;
    if (rating === 'know_it') {
      playCorrectSound();
    } else if (rating === 'needs_review') {
      playIncorrectSound();
    } else {
      playCorrectSound();
    }
    setWordRatings(prev => ({ ...prev, [currentFlashcard.id]: rating }));
    setIsDefinitionRevealed(false);
    setCardIndex(prev => (prev + 1) % (activeWords.length || 1));
  };

  // Keyboard navigation for split-pane flashcards
  useEffect(() => {
    if (activeTab !== 'flashcards') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsDefinitionRevealed(prev => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleRateWord('needs_review');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateWord('almost');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateWord('know_it');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeWords.length, currentFlashcard]);

  // ---------------------------------------------------------------------------
  // 2. Learn Mode (Interactive Quiz) State
  // ---------------------------------------------------------------------------
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizAnswerChecked, setQuizAnswerChecked] = useState<boolean>(false);

  const quizPool = useMemo(() => {
    const list = activeWords.length > 0 ? activeWords : PRELOADED_SAT_VOCAB;
    return [...list].sort(() => Math.random() - 0.5).slice(0, 20);
  }, [activeWords]);

  const currentQuizItem = quizPool[quizIndex] || quizPool[0];

  const quizOptions = useMemo(() => {
    if (!currentQuizItem) return [];
    const correctDef = currentQuizItem.definition;
    const pool = activeWords.length >= 4 ? activeWords : PRELOADED_SAT_VOCAB;
    const wrongDefs = pool
      .filter(w => w.id !== currentQuizItem.id)
      .map(w => w.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correctDef, ...wrongDefs].sort(() => Math.random() - 0.5);
  }, [currentQuizItem, activeWords]);

  const handleSelectQuizOption = (opt: string) => {
    if (quizAnswerChecked) return;
    setSelectedOption(opt);
    setQuizAnswerChecked(true);
    if (opt === currentQuizItem.definition) {
      playCorrectSound();
      setQuizScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      playIncorrectSound();
      setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setQuizAnswerChecked(false);
    setQuizIndex(prev => (prev + 1) % (quizPool.length || 1));
  };

  // ---------------------------------------------------------------------------
  // 3. Timed Match Game State
  // ---------------------------------------------------------------------------
  const [matchTiles, setMatchTiles] = useState<{ id: string; text: string; wordId: string; type: 'word' | 'def' }[]>([]);
  const [selectedTile, setSelectedTile] = useState<{ id: string; wordId: string; type: 'word' | 'def' } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [matchTimer, setMatchTimer] = useState<number>(60);
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [matchScore, setMatchScore] = useState<number>(0);

  const startMatchGame = () => {
    const pool = activeWords.length >= 6 ? activeWords : PRELOADED_SAT_VOCAB;
    const selectedSix = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    const tiles: { id: string; text: string; wordId: string; type: 'word' | 'def' }[] = [];
    selectedSix.forEach(w => {
      tiles.push({ id: `w-${w.id}`, text: w.word, wordId: w.id, type: 'word' });
      const shortDef = w.definition.length > 60 ? w.definition.slice(0, 57) + '...' : w.definition;
      tiles.push({ id: `d-${w.id}`, text: shortDef, wordId: w.id, type: 'def' });
    });
    setMatchTiles(tiles.sort(() => Math.random() - 0.5));
    setMatchedPairs(new Set());
    setSelectedTile(null);
    setMatchTimer(60);
    setMatchScore(0);
    setIsMatchActive(true);
  };

  useEffect(() => {
    if (!isMatchActive || matchTimer <= 0) return;
    const interval = setInterval(() => {
      setMatchTimer(prev => {
        if (prev <= 1) {
          setIsMatchActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMatchActive, matchTimer]);

  const handleTileClick = (tile: { id: string; wordId: string; type: 'word' | 'def' }) => {
    if (matchedPairs.has(tile.wordId)) return;
    if (!selectedTile) {
      setSelectedTile(tile);
    } else {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
      } else if (selectedTile.type !== tile.type && selectedTile.wordId === tile.wordId) {
        playCorrectSound();
        setMatchedPairs(prev => new Set([...prev, tile.wordId]));
        setSelectedTile(null);
        setMatchScore(prev => prev + 100);
        if (matchedPairs.size + 1 === 6) {
          playFanfareSound();
          setTimeout(() => startMatchGame(), 800);
        }
      } else {
        playIncorrectSound();
        setSelectedTile(null);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Word Explorer & Search Library State + Large Word Popup Modal
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [inspectedWord, setInspectedWord] = useState<VocabWord | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedWord(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredWords = useMemo(() => {
    return activeWords.filter(w => {
      const matchSearch = searchTerm === '' ||
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.synonyms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLetter = selectedLetter === 'ALL' || w.word.toUpperCase().startsWith(selectedLetter);
      return matchSearch && matchLetter;
    });
  }, [activeWords, searchTerm, selectedLetter]);

  // ---------------------------------------------------------------------------
  // 5. Create & Edit Vocab Collection Flashcard Builder State
  // ---------------------------------------------------------------------------
  const [isCreatingCollection, setIsCreatingCollection] = useState<boolean>(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [collectionTitle, setCollectionTitle] = useState<string>('');
  const [collectionDescription, setCollectionDescription] = useState<string>('');
  const [builderCards, setBuilderCards] = useState<Array<{ id: string; word: string; definition: string; example: string }>>([
    { id: '1', word: '', definition: '', example: '' },
    { id: '2', word: '', definition: '', example: '' },
    { id: '3', word: '', definition: '', example: '' },
  ]);
  const [builderError, setBuilderError] = useState<string>('');
  const [isQuizletModalOpen, setIsQuizletModalOpen] = useState<boolean>(false);
  const [quizletRawText, setQuizletRawText] = useState<string>('');

  const handleStartEditDeck = (deck: CustomDeck) => {
    setEditingDeckId(deck.id);
    setCollectionTitle(deck.name);
    setCollectionDescription(deck.description || '');
    setBuilderCards(deck.words.map((w, idx) => ({
      id: w.id || `edit-${idx}`,
      word: w.word,
      definition: w.definition,
      example: w.example || '',
    })));
    setBuilderError('');
    setIsCreatingCollection(true);
  };

  const handleCancelBuilder = () => {
    setIsCreatingCollection(false);
    setEditingDeckId(null);
    setCollectionTitle('');
    setCollectionDescription('');
    setBuilderCards([
      { id: '1', word: '', definition: '', example: '' },
      { id: '2', word: '', definition: '', example: '' },
      { id: '3', word: '', definition: '', example: '' },
    ]);
    setBuilderError('');
  };

  const handleAddBuilderCard = () => {
    setBuilderCards(prev => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, word: '', definition: '', example: '' }
    ]);
  };

  const handleUpdateBuilderCard = (id: string, field: 'word' | 'definition' | 'example', value: string) => {
    setBuilderCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteBuilderCard = (id: string) => {
    if (builderCards.length <= 1) {
      setBuilderCards([{ id: `${Date.now()}`, word: '', definition: '', example: '' }]);
      return;
    }
    setBuilderCards(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveCard = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= builderCards.length) return;
    setBuilderCards(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleGenerateExampleSentences = () => {
    setBuilderCards(prev => prev.map(c => {
      if (!c.word.trim()) return c;
      if (c.example.trim()) return c;

      const cleanedWord = c.word.trim();
      const match = PRELOADED_SAT_VOCAB.find(w => w.word.toLowerCase() === cleanedWord.toLowerCase());
      if (match && match.example) {
        return { ...c, example: match.example };
      }

      const def = c.definition.toLowerCase();
      let gen = '';
      if (def.includes('improv') || def.includes('better')) {
        gen = `The team's ongoing initiatives were designed to ${cleanedWord.toLowerCase()} the laboratory's experimental accuracy.`;
      } else if (def.includes('critic') || def.includes('disapprov') || def.includes('attack')) {
        gen = `Literary critics were prompt to ${cleanedWord.toLowerCase()} the inconsistencies found throughout the narrative.`;
      } else if (def.includes('show') || def.includes('reveal') || def.includes('demonstrat')) {
        gen = `The historical documents ${cleanedWord.toLowerCase()} a surprising shift in public sentiment toward the reform.`;
      } else if (def.includes('state') || def.includes('express') || def.includes('speak')) {
        gen = `The speaker ${cleanedWord.toLowerCase()} the fundamental principles of the hypothesis during the opening symposium.`;
      } else {
        gen = `The author strategically employed the concept of "${cleanedWord}" to nuance their central argument in the essay.`;
      }
      return { ...c, example: gen };
    }));
  };

  const handleImportFromQuizletSubmit = () => {
    if (!quizletRawText.trim()) {
      setIsQuizletModalOpen(false);
      return;
    }
    const lines = quizletRawText.split('\n');
    const imported: Array<{ id: string; word: string; definition: string; example: string }> = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let parts = trimmed.split('\t');
      if (parts.length < 2) parts = trimmed.split(' - ');
      if (parts.length < 2) parts = trimmed.split(': ');
      if (parts.length < 2) parts = trimmed.split(',');

      if (parts.length >= 2) {
        const word = parts[0].trim();
        const definition = parts.slice(1).join(' ').trim();
        if (word && definition) {
          imported.push({
            id: `import-${Date.now()}-${idx}`,
            word: word.charAt(0).toUpperCase() + word.slice(1),
            definition,
            example: '',
          });
        }
      }
    });

    if (imported.length > 0) {
      const isCurrentEmpty = builderCards.length <= 1 && !builderCards[0]?.word && !builderCards[0]?.definition;
      setBuilderCards(prev => isCurrentEmpty ? imported : [...prev, ...imported]);
    }

    setQuizletRawText('');
    setIsQuizletModalOpen(false);
  };

  const handleSaveCollectionSubmit = () => {
    if (!collectionTitle.trim()) {
      setBuilderError('Please enter a title for your collection.');
      return;
    }

    const validCards = builderCards.filter(c => c.word.trim() && c.definition.trim());
    if (validCards.length === 0) {
      setBuilderError('Please add at least one card with both a word and its definition.');
      return;
    }

    const words: VocabWord[] = validCards.map((c, idx) => ({
      id: c.id.startsWith('cw-') ? c.id : `cw-${Date.now()}-${idx}`,
      word: c.word.trim().charAt(0).toUpperCase() + c.word.trim().slice(1),
      partOfSpeech: 'noun',
      definition: c.definition.trim(),
      example: c.example.trim() || `The concept of "${c.word.trim()}" plays a key role in the discussion.`,
      synonyms: [],
      difficulty: 'Medium',
    }));

    if (editingDeckId) {
      setCustomDecks(prev => prev.map(d => {
        if (d.id === editingDeckId) {
          return {
            ...d,
            name: collectionTitle.trim(),
            description: collectionDescription.trim() || undefined,
            words,
          };
        }
        return d;
      }));
      setSelectedDeckId(editingDeckId);
    } else {
      const newDeck: CustomDeck = {
        id: `deck-${Date.now()}`,
        name: collectionTitle.trim(),
        description: collectionDescription.trim() || undefined,
        createdAt: Date.now(),
        words,
      };
      setCustomDecks(prev => [newDeck, ...prev]);
      setSelectedDeckId(newDeck.id);
    }

    setIsCreatingCollection(false);
    setEditingDeckId(null);
    setActiveTab('flashcards');
    setCollectionTitle('');
    setCollectionDescription('');
    setBuilderCards([
      { id: '1', word: '', definition: '', example: '' },
      { id: '2', word: '', definition: '', example: '' },
      { id: '3', word: '', definition: '', example: '' },
    ]);
    setBuilderError('');
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this custom deck?')) {
      setCustomDecks(prev => prev.filter(d => d.id !== deckId));
      if (selectedDeckId === deckId) {
        setSelectedDeckId('official');
      }
    }
  };

  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#070a10] text-slate-900 dark:text-white select-text">
      {isCreatingCollection ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
          {/* Top Back Link */}
          <button
            onClick={handleCancelBuilder}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0050d8] dark:text-blue-400 hover:underline transition group cursor-pointer"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back to Word Bank</span>
          </button>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {editingDeckId ? 'Edit vocab collection' : 'Create vocab collection'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {editingDeckId
                ? 'Update deck title, description, or add and edit words.'
                : 'Add a title and description, then add words with their definitions.'}
            </p>
          </div>

          {/* Collection Metadata Inputs */}
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={collectionTitle}
                onChange={e => setCollectionTitle(e.target.value)}
                placeholder="SAT vocab"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-[#0050d8] focus:ring-1 focus:ring-[#0050d8] bg-gray-50 dark:bg-[#0e131d] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={collectionDescription}
                onChange={e => setCollectionDescription(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-sm focus:outline-none focus:border-[#0050d8] focus:ring-1 focus:ring-[#0050d8] bg-gray-50 dark:bg-[#0e131d] resize-y text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Action Tools Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsQuizletModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#111726] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#0050d8] dark:text-blue-400" />
                <span>+ Import from Quizlet</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateExampleSentences}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>✨ Generate example sentences</span>
              </button>
            </div>

            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
              {builderCards.length} {builderCards.length === 1 ? 'card' : 'cards'}
            </span>
          </div>

          {/* Error Alert */}
          {builderError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium">
              {builderError}
            </div>
          )}

          {/* Numbered Dark Card Rows */}
          <div className="space-y-4">
            {builderCards.map((card, index) => (
              <div
                key={card.id}
                className="bg-white dark:bg-[#0f1522] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative group transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Top Row: Index Badge & Tools */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Card #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    {/* Reorder Buttons / Handles */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCard(index, -1)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === builderCards.length - 1}
                      onClick={() => handleMoveCard(index, 1)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs px-1 text-slate-400 dark:text-slate-500 select-none flex items-center" title="Reorder card">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    {/* Delete Card Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBuilderCard(card.id)}
                      className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 dark:text-slate-500 transition cursor-pointer"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side-by-side Word and Definition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Word
                    </label>
                    <input
                      type="text"
                      value={card.word}
                      onChange={e => handleUpdateBuilderCard(card.id, 'word', e.target.value)}
                      placeholder="Enter word..."
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-300 dark:border-[#2e2e33] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Definition
                    </label>
                    <input
                      type="text"
                      value={card.definition}
                      onChange={e => handleUpdateBuilderCard(card.id, 'definition', e.target.value)}
                      placeholder="Enter definition..."
                      className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-300 dark:border-[#2e2e33] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Full-width Example sentence (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Example sentence (optional)
                  </label>
                  <input
                    type="text"
                    value={card.example}
                    onChange={e => handleUpdateBuilderCard(card.id, 'example', e.target.value)}
                    placeholder="Add an example sentence illustrating this word..."
                    className="w-full bg-slate-50 dark:bg-[#121214] border border-slate-300 dark:border-[#2e2e33] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleAddBuilderCard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#111726] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0050d8] dark:text-blue-400" />
              <span>+ Add card</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCollectionSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0050d8] to-[#003da6] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingDeckId ? 'Save collection' : 'Create collection'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Header & Deck Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Vocabulary Mastery
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0050d8] dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  {activeWords.length} Words
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Interactive Split-Pane Flashcards, Learn Mode, Match Game, and custom decks for Digital SAT Reading & Writing.
              </p>
            </div>

            {/* Action: Create Custom Deck Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreatingCollection(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition active:scale-95 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Custom Deck</span>
              </button>
            </div>
          </div>

          {/* Banner: Create your own vocab bank */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-blue-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight">Create your own vocab bank</h3>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  Add custom cards, import from Quizlet, or auto-generate SAT example sentences with AI.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreatingCollection(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition active:scale-95 shrink-0 cursor-pointer self-start sm:self-center"
            >
              <span>Create</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Deck Selector Strip & Tab Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#111726] p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs">
            {/* Active Deck Selector */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#0050d8] dark:text-blue-400" />
                Active Deck:
              </span>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="bg-gray-50 dark:bg-[#0e131d] border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0050d8] cursor-pointer"
              >
                <option value="official">Official SAT Top 150 ({PRELOADED_SAT_VOCAB.length} words)</option>
                <option value="all">All Words ({PRELOADED_SAT_VOCAB.length + customDecks.flatMap(d => d.words).length} words)</option>
                {customDecks.length > 0 && (
                  <optgroup label="Custom Decks">
                    {customDecks.map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name} ({deck.words.length} words)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <span className="text-xs text-gray-500 dark:text-slate-400 italic hidden sm:inline">
                "{activeDeckName}"
              </span>

              {currentCustomDeck && (
                <button
                  type="button"
                  onClick={() => handleStartEditDeck(currentCustomDeck)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#111726] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Edit Deck / Add Words"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0050d8] dark:text-blue-400" />
                  <span>✏️ Edit Deck</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const next = toggleSound();
                  setIsSoundActive(next);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  isSoundActive
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-[#0050d8] dark:text-blue-400 hover:bg-blue-100'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600'
                }`}
                title={isSoundActive ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
              >
                {isSoundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSoundActive ? 'Sound ON' : 'Sound OFF'}</span>
              </button>
            </div>

            {/* Review Mode Tabs */}
            <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700">
              {[
                { id: 'flashcards', label: 'Split-Pane Practice', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'learn', label: 'Learn Mode', icon: <Award className="w-3.5 h-3.5" /> },
                { id: 'match', label: 'Match Game', icon: <Clock className="w-3.5 h-3.5" /> },
                { id: 'library', label: 'Explore Deck', icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: 'decks', label: `My Decks (${customDecks.length})`, icon: <FolderPlus className="w-3.5 h-3.5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ReviewTab);
                    if (tab.id === 'match' && !isMatchActive) startMatchGame();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-[#111726] text-[#0050d8] dark:text-blue-400 shadow-xs'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: Split-Pane Deck Practice UI                                */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              {activeWords.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#111726] rounded-2xl border border-gray-200 dark:border-slate-800">
                  <FolderOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-700 dark:text-slate-200 text-lg">No words in this deck yet</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Add words to this custom deck to review flashcards.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-[#111726] shadow-sm">
                  {/* Top Bar: "✕ Vocabulary Practice", Deck Title & Rating Stats */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 bg-gray-50/80 dark:bg-[#0e131d] border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151a24] hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
                        title="Back to Word Bank"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                        <span>Vocabulary Practice</span>
                      </button>

                      <div className="h-4 w-px bg-gray-300 dark:bg-slate-700 hidden sm:block" />

                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 hidden sm:inline truncate max-w-xs">
                        {activeDeckName}
                      </span>
                    </div>

                    {/* Rating Stats Pills & Sound */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{ratingCounts.needsReview} Needs Review</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{ratingCounts.almost} Almost</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{ratingCounts.knowIt} Mastered</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleShuffleCards}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151a24] border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer ml-auto sm:ml-0"
                        title="Shuffle flashcards"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-[#0050d8] dark:text-blue-400" />
                        <span>Shuffle</span>
                      </button>
                    </div>
                  </div>

                  {/* Split Layout: Left Queue & Centered Flashcard Stage */}
                  <div className="flex flex-col md:flex-row min-h-[580px]">
                    {/* Left Scrollable Queue (w-72) */}
                    <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 flex flex-col bg-gray-50/40 dark:bg-[#0e131d]/70 shrink-0">
                      {/* Search Filter in Queue */}
                      <div className="p-3 border-b border-gray-200 dark:border-slate-800">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={queueSearch}
                            onChange={e => setQueueSearch(e.target.value)}
                            placeholder="Filter queue..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#151a24] border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0050d8]"
                          />
                        </div>
                      </div>

                      {/* Queue List */}
                      <div className="flex-1 overflow-y-auto max-h-[220px] md:max-h-[520px] p-2 space-y-1">
                        {queuedWords.map((word) => {
                          const isActive = currentFlashcard?.id === word.id;
                          const r = wordRatings[word.id];

                          return (
                            <button
                              key={word.id}
                              onClick={() => {
                                const idx = activeWords.findIndex(w => w.id === word.id);
                                if (idx !== -1) {
                                  setCardIndex(idx);
                                  setIsDefinitionRevealed(false);
                                }
                              }}
                              className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50/90 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 ring-2 ring-[#0050d8] shadow-xs'
                                  : 'hover:bg-gray-100 dark:hover:bg-slate-800/60 border border-transparent'
                              }`}
                            >
                              {/* Status Badge Icon */}
                              {r === 'know_it' && (
                                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0" title="Mastered (Know it)">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {r === 'almost' && (
                                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0" title="Learning (Almost)">
                                  <Clock className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {r === 'needs_review' && (
                                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0" title="Needs review">
                                  ⊗
                                </span>
                              )}
                              {!r && (
                                <span className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 shrink-0" title="Unrated word" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs truncate ${isActive ? 'font-black text-[#0050d8] dark:text-blue-400' : 'font-bold text-gray-900 dark:text-white'}`}>
                                    {word.word}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                                    {word.partOfSpeech.slice(0, 3)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                                  {word.definition}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Centered Flashcard Stage */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto relative bg-slate-50 dark:bg-[#070a10]">
                      {/* Top Status Pill Above Flashcard */}
                      <div className="mb-4">
                        {currentRating === 'know_it' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mastered (Know it)
                          </span>
                        )}
                        {currentRating === 'almost' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            Learning (Almost)
                          </span>
                        )}
                        {currentRating === 'needs_review' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <span>⊗</span>
                            Needs Review
                          </span>
                        )}
                        {!currentRating && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                            Unrated Word
                          </span>
                        )}
                      </div>

                      {/* Large Flashcard (max-w-[560px] min-h-[420px] rounded-3xl p-10) */}
                      <div className="w-full max-w-[560px] min-h-[420px] rounded-3xl p-8 md:p-10 bg-white dark:bg-[#151a24] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center relative transition-all">
                        {/* Flashcard Top Row: Part of Speech & Pronunciation Button */}
                        <div className="w-full flex items-center justify-between">
                          <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0050d8] dark:text-blue-400 font-bold text-xs uppercase tracking-wider border border-blue-100 dark:border-blue-900">
                            {currentFlashcard.partOfSpeech}
                          </span>

                          <button
                            type="button"
                            onClick={() => speakWord(currentFlashcard.word)}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-gray-700 dark:text-slate-200 hover:text-[#0050d8] dark:hover:text-blue-400 flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Listen to pronunciation (🔊)"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Flashcard Middle: Word, IPA phonetics, Definition link / box */}
                        <div className="w-full my-auto py-4 flex flex-col items-center">
                          <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                            {currentFlashcard.word}
                          </h2>

                          <div className="text-sm md:text-base text-gray-500 dark:text-slate-400 italic mt-2">
                            {currentFlashcard.partOfSpeech} • {getWordPhonetics(currentFlashcard.word)}
                          </div>

                          {!isDefinitionRevealed ? (
                            <button
                              type="button"
                              onClick={() => setIsDefinitionRevealed(true)}
                              className="mt-6 inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold text-sm tracking-wide transition cursor-pointer hover:underline"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Click to see definition (Space)</span>
                            </button>
                          ) : (
                            <div className="w-full mt-6 space-y-4 animate-in fade-in duration-200">
                              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/50 text-left">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 block mb-1">
                                  Definition
                                </span>
                                <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-slate-100 leading-relaxed">
                                  {currentFlashcard.definition}
                                </p>
                              </div>

                              {currentFlashcard.example && (
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e131d] border border-slate-200 dark:border-slate-800 text-left">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500 block mb-1">
                                    Context Example
                                  </span>
                                  <p className="text-xs md:text-sm italic text-gray-600 dark:text-slate-300 font-serif leading-relaxed">
                                    "{currentFlashcard.example}"
                                  </p>
                                </div>
                              )}

                              {currentFlashcard.synonyms && currentFlashcard.synonyms.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                                  {currentFlashcard.synonyms.map((s, idx) => (
                                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-semibold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Flashcard Bottom: 3 Rating Buttons with Shortcuts */}
                        <div className="w-full pt-4 border-t border-gray-100 dark:border-slate-800/80">
                          <div className="grid grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleRateWord('needs_review')}
                              className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-2xs"
                            >
                              <span className="text-[10px] opacity-70">Key [1]</span>
                              <span>Needs review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRateWord('almost')}
                              className="py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-2xs"
                            >
                              <span className="text-[10px] opacity-70">Key [2]</span>
                              <span>Almost</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRateWord('know_it')}
                              className="py-2.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-2xs"
                            >
                              <span className="text-[10px] opacity-70">Key [3]</span>
                              <span>Know it</span>
                            </button>
                          </div>

                          {/* Prev / Next controls */}
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-400 dark:text-slate-500">
                            <button
                              type="button"
                              onClick={handlePrevCard}
                              className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>Previous (←)</span>
                            </button>
                            <span>Card {cardIndex + 1} of {activeWords.length}</span>
                            <button
                              type="button"
                              onClick={handleNextCard}
                              className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition cursor-pointer"
                            >
                              <span>Next (→)</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: Learn Mode Interactive Quiz (Enlarged to max-w-6xl)        */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'learn' && currentQuizItem && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Quiz Progress & Score */}
              <div className="p-4 bg-white dark:bg-[#111726] rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
                <div className="font-bold text-gray-700 dark:text-slate-300">
                  Question {quizIndex + 1} of {quizPool.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {quizScore.correct} Correct
                  </span>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <span className="text-gray-500 dark:text-slate-400">
                    {quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0}% Accuracy
                  </span>
                </div>
              </div>

              {/* Oversized Quiz Question Card (min-h-[260px] text-4xl) */}
              <div className="min-h-[260px] rounded-3xl bg-white dark:bg-[#151a24] border border-gray-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center p-10 space-y-3">
                <span className="text-xs font-bold text-[#0050d8] dark:text-blue-400 uppercase tracking-widest">
                  Select the most accurate definition for
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  {currentQuizItem.word}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm italic text-gray-400 dark:text-slate-500 font-serif">
                    ({currentQuizItem.partOfSpeech}) • {getWordPhonetics(currentQuizItem.word)}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakWord(currentQuizItem.word)}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-[#0050d8] dark:hover:text-blue-400 transition"
                    title="Pronounce word"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Enlarged Options (p-6 text-xl) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizOptions.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuizItem.definition;

                  let optClass = 'border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600 bg-white dark:bg-[#111726] text-gray-800 dark:text-slate-200';
                  if (quizAnswerChecked) {
                    if (isCorrect) {
                      optClass = 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold';
                    } else if (isSelected) {
                      optClass = 'border-rose-500 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300';
                    } else {
                      optClass = 'border-gray-100 dark:border-slate-800/60 bg-gray-50 dark:bg-[#0e131d] text-gray-400 dark:text-slate-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={quizAnswerChecked}
                      className={`w-full p-6 text-lg md:text-xl rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer shadow-xs ${optClass}`}
                    >
                      <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 font-black text-sm flex items-center justify-center shrink-0 text-gray-700 dark:text-slate-300">
                        {letter}
                      </span>
                      <span className="text-base md:text-lg leading-relaxed flex-1">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Next Question Bar */}
              {quizAnswerChecked && (
                <div className="p-5 bg-white dark:bg-[#111726] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {selectedOption === currentQuizItem.definition ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Correct! Excellent recall.</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">✗ Incorrect. Review this word.</span>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-2.5 rounded-xl bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: Timed Match Game (Enlarged to max-w-6xl)                   */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'match' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Match Header Bar */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#111726] rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-black text-base text-gray-900 dark:text-white">
                    <Clock className="w-5 h-5 text-[#0050d8] dark:text-blue-400" />
                    <span>{matchTimer}s</span>
                  </div>
                  <span className="text-gray-300 dark:text-slate-600">|</span>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Score: {matchScore} pts
                  </div>
                </div>

                <button
                  onClick={startMatchGame}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restart Game</span>
                </button>
              </div>

              {/* Match Grid: 12 Large Tiles (min-h-[145px] p-6 text-lg md:text-xl) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {matchTiles.map((tile) => {
                  const isMatched = matchedPairs.has(tile.wordId);
                  const isSelected = selectedTile?.id === tile.id;

                  if (isMatched) {
                    return (
                      <div
                        key={tile.id}
                        className="min-h-[145px] rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-6 flex items-center justify-center text-center opacity-40 select-none"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile)}
                      disabled={!isMatchActive}
                      className={`min-h-[145px] p-6 rounded-2xl flex items-center justify-center text-center transition-all cursor-pointer shadow-xs select-none ${
                        isSelected
                          ? 'border-2 border-[#0050d8] bg-blue-50 dark:bg-blue-950/60 text-[#0050d8] dark:text-blue-400 font-bold scale-102 shadow-md'
                          : 'border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151a24] hover:border-gray-400 dark:hover:border-slate-600 text-gray-800 dark:text-slate-100'
                      }`}
                    >
                      <span className={tile.type === 'word' ? 'font-black text-xl md:text-2xl tracking-tight' : 'text-sm md:text-base leading-snug line-clamp-4 font-medium'}>
                        {tile.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 4: Explore Deck Library + Word Popup Modal                     */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Search & Alphabet Filter */}
              <div className="space-y-3">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search words, definitions, or synonyms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111726] border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0050d8]"
                  />
                </div>

                {/* Alphabet Letter Filter */}
                <div className="flex flex-wrap gap-1">
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedLetter === letter
                          ? 'bg-[#0050d8] text-white shadow-xs'
                          : 'bg-white dark:bg-[#111726] text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWords.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setInspectedWord(item)}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-gray-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[#0050d8] dark:group-hover:text-blue-400 transition-colors">
                            {item.word}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(item.word);
                            }}
                            className="p-1 text-gray-400 hover:text-[#0050d8] dark:hover:text-blue-400 transition"
                            title="Pronounce word"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0050d8] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                          {item.partOfSpeech}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                        {item.definition}
                      </p>

                      {item.example && (
                        <p className="text-[11px] italic text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-[#0e131d] p-2 rounded-lg border border-gray-100 dark:border-slate-800 font-serif">
                          "{item.example}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                      <span>{getWordPhonetics(item.word)}</span>
                      <span className="text-[#0050d8] dark:text-blue-400 font-bold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 5: Custom Decks Manager                                       */}
          {/* ----------------------------------------------------------------- */}
          {activeTab === 'decks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Custom Decks</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Create, review, or delete your personalized vocabulary decks.</p>
                </div>

                <button
                  onClick={() => setIsCreatingCollection(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Collection</span>
                </button>
              </div>

              {customDecks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#111726] rounded-2xl border border-gray-200 dark:border-slate-800">
                  <FolderPlus className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-700 dark:text-slate-200 text-base">No custom decks yet</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Create a custom deck by pasting Quizlet/Anki lists or typing words individually.
                  </p>
                  <button
                    onClick={() => setIsCreatingCollection(true)}
                    className="mt-4 px-4 py-2 bg-[#0050d8] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Create Your First Deck
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customDecks.map((deck) => (
                    <div
                      key={deck.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-gray-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-gray-900 dark:text-white truncate">
                            {deck.name}
                          </h4>
                          <span className="text-xs font-bold text-[#0050d8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                            {deck.words.length} Words
                          </span>
                        </div>
                        {deck.description && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {deck.description}
                          </p>
                        )}
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
                          Created {new Date(deck.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setSelectedDeckId(deck.id);
                            setActiveTab('flashcards');
                          }}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer"
                        >
                          Practice Deck
                        </button>

                        <button
                          onClick={() => handleStartEditDeck(deck)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition cursor-pointer"
                          title="Edit deck / Add words"
                        >
                          <Edit3 className="w-4 h-4 text-[#0050d8] dark:text-blue-400" />
                        </button>

                        <button
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-gray-400 dark:text-slate-500 transition cursor-pointer"
                          title="Delete deck"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="pt-8 pb-4 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-500 dark:text-slate-500 font-medium">
            © Oluwole Inuoluwadunsimi 2026
          </footer>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* LARGE WORD POPUP MODAL (max-w-2xl rounded-3xl p-10)                   */}
      {/* --------------------------------------------------------------------- */}
      {inspectedWord && (
        <div
          onClick={() => setInspectedWord(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-2xl w-full rounded-3xl p-8 md:p-10 bg-white dark:bg-[#151a24] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setInspectedWord(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              title="Close (Esc)"
            >
              ✕
            </button>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#0050d8] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                {inspectedWord.partOfSpeech}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                inspectedWord.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' :
                inspectedWord.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}>
                {inspectedWord.difficulty}
              </span>
            </div>

            {/* Word Header with Audio */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                  {inspectedWord.word}
                </h2>
                <p className="text-base text-gray-500 dark:text-slate-400 italic mt-1 font-serif">
                  {inspectedWord.partOfSpeech} • {getWordPhonetics(inspectedWord.word)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => speakWord(inspectedWord.word)}
                className="w-14 h-14 rounded-2xl bg-[#0050d8]/10 hover:bg-[#0050d8]/20 text-[#0050d8] dark:text-blue-400 flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
                title="Play pronunciation (🔊)"
              >
                <Volume2 className="w-7 h-7" />
              </button>
            </div>

            {/* Definition Block */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0e131d] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                Definition
              </span>
              <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                {inspectedWord.definition}
              </p>
            </div>

            {/* Example sentence */}
            {inspectedWord.example && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-1">
                <span className="text-xs font-bold text-[#0050d8] dark:text-blue-400 uppercase tracking-wider block">
                  Context Example
                </span>
                <p className="text-sm italic text-gray-700 dark:text-slate-200 font-serif leading-relaxed">
                  "{inspectedWord.example}"
                </p>
              </div>
            )}

            {/* Synonyms */}
            {inspectedWord.synonyms && inspectedWord.synonyms.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                  Synonyms
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectedWord.synonyms.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: Import from Quizlet                                            */}
      {/* --------------------------------------------------------------------- */}
      {isQuizletModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#151a24] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Import from Quizlet or Anki
              </h3>
              <button
                type="button"
                onClick={() => setIsQuizletModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Copy terms and definitions from Quizlet (Export → Copy text) and paste below. Each line represents a card, with word and definition separated by a Tab, comma, or hyphen.
            </p>
            <textarea
              value={quizletRawText}
              onChange={e => setQuizletRawText(e.target.value)}
              placeholder={"ameliorate\tto improve or make better\nanachronistic\toutdated or chronologically misplaced"}
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0e131d] focus:outline-none focus:border-[#0050d8] text-gray-900 dark:text-white"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsQuizletModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportFromQuizletSubmit}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#0050d8] hover:bg-[#003da6] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Import Cards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabPractice;
