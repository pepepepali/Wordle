const wordsDB = {
    general: ["كتاب","مكتب","عالم","سلام","نجمه","طريق","حياه","سياره","طائره","سفينه","مدرسه","حديقه","جامعه","طبيبه","مكتبه","مستشفي","مهندسه","عمليات","اقتصاد","تجاره"],
    khaleeji: ["جمان","كفوف","ساهر","يوفي","دفعه","شغف","حدود","امينه","الخاطر","العاصوف","ناطحه","زواره","ثريا","رمانه","اقبال","نوايا","عذراء","مجنون","لندن","بيروت","الناجيه","الميراث","انتقام"],
    food: ["تفاح","موزه","عنبه","بطيخ","بصله","ثومه","خيار","كبسه","برياني","مندي","مقلوبه","شاورما","فلافل","حمص","عصير","قهوه","شاي","حليب"],
    tech: ["حاسب","شاشه","لوحه","رقمي","برمجه","تطبيق","موقع","هاتف","جوال","شبكه","خادم","بيانات","تخزين","تشفير","ذاكره","معالج"],
    cities: ["مكه","جده","رياض","دمام","كويت","دوحه","منامه","مسقط","عمان","قاهره","تونس","رباط","بغداد","دمشق","بيروت","صنعاء","دبي","شارقه"],
    animals: ["اسد","نمر","ذئب","قرد","دب","حصان","غزال","فيل","قط","كلب","زرافه","تمساح","عصفور","حمامه","سنجاب","دلفين","اخطبوط","ثعبان","سلحفاه","صقر"],
    sports: ["ركض","قفز","غوص","تزلج","لعب","سباحه","رمايه","تنس","جودو","ملاكمه","جمباز","كاراتيه","ماراثون","بطوله","كاس","هدف","ملعب"]
};

const normalizeWord = (word) => {
    if (!word) return "";
    return word.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\u064B-\u065F]/g, '');
};
const LinkEngine = {
    encodeWord: (str) => btoa(encodeURIComponent(normalizeWord(str))),
    decodeWord: (str) => { try { return decodeURIComponent(atob(str)); } catch(e) { return null; } }
};

const ConfettiEngine = {
    fire() {
        const container = document.getElementById('confetti-container'); container.innerHTML = ''; 
        const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#10b981', '#3b82f6', '#d4af37'];
        for(let i=0; i<250; i++) {
            const conf = document.createElement('div'); conf.className = 'confetti-piece';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = (Math.random() * 4 + 4) + 's';
            conf.style.animationDelay = Math.random() * 1 + 's';
            if (Math.random() > 0.5) conf.style.borderRadius = '50%';
            container.appendChild(conf);
        }
        setTimeout(() => container.innerHTML = '', 9000);
    }
};

const AudioEngine = {
    ctx: null,
    init() { if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } },
    play(freq, type, dur, vol) {
        if (!document.getElementById('sound-toggle').checked) return;
        this.init(); const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + dur);
    },
    click() { this.play(400, 'sine', 0.1, 0.1); },
    error() { this.play(150, 'sawtooth', 0.3, 0.2); },
    win() { this.play(440, 'triangle', 0.1, 0.1); setTimeout(()=>this.play(554, 'triangle', 0.1, 0.1), 100); setTimeout(()=>this.play(659, 'triangle', 0.4, 0.1), 200); setTimeout(()=>this.play(880, 'triangle', 0.6, 0.15), 400); },
    lose() { this.play(300, 'triangle', 0.2, 0.1); setTimeout(()=>this.play(250, 'triangle', 0.5, 0.15), 200); }
};

let savedStats = { played: 0, wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 };
try {
    let parsed = JSON.parse(localStorage.getItem('wordle_ar_stats'));
    if (parsed && typeof parsed === 'object') {
        savedStats = { played: parsed.played || 0, wins: parsed.wins || 0, losses: parsed.losses || 0, currentStreak: parsed.currentStreak || 0, maxStreak: parsed.maxStreak || 0 };
    }
} catch(e) {}

let savedCoins = parseInt(localStorage.getItem('wordle_ar_coins'));
if (isNaN(savedCoins)) savedCoins = 50;

const state = {
    mode: 'free', difficulty: 'medium', category: 'general', theme: 'modern', wordLength: 5, maxAttempts: 6,
    timeChallenge: false, timeLeft: 120, timerInterval: null, targetWord: '',
    currentRow: 0, currentCol: 0, grid: [], gameOver: false,
    coins: savedCoins, stats: savedStats
};

const UI = {
    init() { 
        this.bindEvents(); 
        this.loadSettings();
        this.updateCoins();
        this.checkURLForFriendChallenge();
    },
    
    updateCoins() {
        document.getElementById('coin-count').innerText = state.coins;
        localStorage.setItem('wordle_ar_coins', state.coins);
    },

    checkURLForFriendChallenge() {
        const urlParams = new URLSearchParams(window.location.search);
        const w = urlParams.get('w');
        if (w) {
            const decoded = LinkEngine.decodeWord(w);
            if(decoded && decoded.length >= 4 && decoded.length <= 6) {
                state.mode = 'friend'; state.targetWord = decoded; state.wordLength = decoded.length;
                state.maxAttempts = decoded.length === 4 ? 7 : (decoded.length === 5 ? 6 : 5);
                document.getElementById('standard-options').classList.add('hidden');
                document.getElementById('friend-challenge-msg').classList.remove('hidden');
            }
        }
    },

    bindEvents() {
        document.getElementById('btn-daily-word').addEventListener('click', () => { AudioEngine.click(); state.mode = 'daily'; Game.start(); });
        document.getElementById('btn-start-free').addEventListener('click', () => { AudioEngine.click(); state.mode = 'free'; Game.start(); });
        document.getElementById('btn-start-friend').addEventListener('click', () => { AudioEngine.click(); Game.start(); });
        
        document.getElementById('btn-cancel-friend').addEventListener('click', () => {
            window.history.replaceState({}, document.title, window.location.pathname);
            document.getElementById('friend-challenge-msg').classList.add('hidden');
            document.getElementById('standard-options').classList.remove('hidden');
        });

        document.getElementById('btn-create-challenge').addEventListener('click', () => { AudioEngine.click(); this.showModal('modal-challenge'); });
        
        document.getElementById('btn-generate-link').addEventListener('click', () => {
            const word = document.getElementById('challenge-input').value.trim();
            if(word.length < 4 || word.length > 6 || !/^[\u0600-\u06FF]+$/.test(word)) { this.showToast('الرجاء إدخال كلمة عربية من 4 إلى 6 حروف'); return; }
            const link = window.location.origin + window.location.pathname + '?w=' + LinkEngine.encodeWord(word);
            navigator.clipboard.writeText(link).then(() => {
                this.showToast('✅ تم نسخ الرابط بنجاح! ارسله لصديقك');
                document.getElementById('modal-challenge').classList.add('hidden');
            });
        });

        document.querySelectorAll('.seg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                AudioEngine.click();
                const parent = e.target.parentElement;
                parent.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                if(parent.id === 'category-selector') state.category = e.target.dataset.val;
                if(parent.id === 'theme-selector') {
                    state.theme = e.target.dataset.val;
                    document.body.setAttribute('data-theme', state.theme);
                    localStorage.setItem('wordle_ar_theme', state.theme);
                }
            });
        });

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                AudioEngine.click();
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.diff-btn').classList.add('active');
                state.difficulty = e.target.closest('.diff-btn').dataset.diff;
            });
        });

        document.getElementById('btn-reset').addEventListener('click', () => location.reload());
        document.getElementById('btn-new-game').addEventListener('click', () => {
            document.getElementById('modal-stats').classList.add('hidden');
            if(state.mode === 'free') Game.start(); else location.reload();
        });
        
        document.getElementById('btn-stats').addEventListener('click', () => this.showModal('modal-stats'));
        document.getElementById('btn-help').addEventListener('click', () => this.showModal('modal-help'));
        document.getElementById('btn-settings').addEventListener('click', () => this.showModal('modal-settings'));
        
        document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden')));
        document.getElementById('btn-hint').addEventListener('click', Game.useHint);
        document.getElementById('btn-share').addEventListener('click', Game.shareResult);
        document.addEventListener('keydown', Game.handlePhysicalKeyboard);
        document.body.addEventListener('click', () => AudioEngine.init(), { once: true });
    },

    loadSettings() {
        const savedTheme = localStorage.getItem('wordle_ar_theme') || 'modern';
        document.body.setAttribute('data-theme', savedTheme);
        document.querySelectorAll('#theme-selector .seg-btn').forEach(b => {
            b.classList.remove('active');
            if(b.dataset.val === savedTheme) b.classList.add('active');
        });
        this.updateStatsUI();
    },

    showModal(id) { document.getElementById(id).classList.remove('hidden'); if(id === 'modal-stats') this.updateStatsUI(); },
    
    updateStatsUI() {
        document.getElementById('stat-played').innerText = state.stats.played;
        let winPct = state.stats.played > 0 ? Math.round((state.stats.wins / state.stats.played) * 100) : 0;
        document.getElementById('stat-winpct').innerText = `${winPct}%`;
        document.getElementById('stat-streak').innerText = state.stats.currentStreak;
        document.getElementById('stat-maxstreak').innerText = state.stats.maxStreak;
    },

    showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg;
        container.appendChild(toast); setTimeout(() => toast.remove(), 2500);
    },

    buildBoard() {
        const board = document.getElementById('board'); board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${state.wordLength}, 1fr)`;
        for (let r = 0; r < state.maxAttempts; r++) {
            for (let c = 0; c < state.wordLength; c++) {
                const tile = document.createElement('div'); tile.className = 'tile'; tile.id = `tile-${r}-${c}`;
                board.appendChild(tile);
            }
        }
    },

    buildKeyboard() {
        const kb = document.getElementById('keyboard'); kb.innerHTML = '';
        const layout = [
            ['ذ', 'د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض'],
            ['ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش'],
            ['BACKSPACE', 'ظ', 'ز', 'و', 'ة', 'ى', 'ر', 'ؤ', 'ء', 'ئ', 'ENTER']
        ];
        layout.forEach(row => {
            const rowDiv = document.createElement('div'); rowDiv.className = 'key-row';
            row.forEach(key => {
                const btn = document.createElement('button'); btn.className = 'key';
                if (key === 'ENTER') { btn.innerText = 'إدخال'; btn.classList.add('large'); btn.dataset.key = 'Enter'; }
                else if (key === 'BACKSPACE') { btn.innerText = '⌫'; btn.classList.add('large'); btn.dataset.key = 'Backspace'; }
                else { btn.innerText = key; btn.dataset.key = key; }
                btn.addEventListener('click', () => Game.handleKey(btn.dataset.key));
                rowDiv.appendChild(btn);
            });
            kb.appendChild(rowDiv);
        });
    }
};

const Game = {
    start() {
        if(state.mode === 'daily') {
            state.wordLength = 5; state.maxAttempts = 6; state.timeChallenge = false;
            const today = new Date(); const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            const all5Letter = Object.values(wordsDB).flat().filter(w => w.length === 5);
            state.targetWord = normalizeWord(all5Letter[seed % all5Letter.length]);
        } 
        else if (state.mode === 'free') {
            if(state.difficulty === 'easy') { state.wordLength = 4; state.maxAttempts = 7; }
            else if(state.difficulty === 'medium') { state.wordLength = 5; state.maxAttempts = 6; }
            else { state.wordLength = 6; state.maxAttempts = 5; }
            
            // حل المشكلة هنا: إذا لم نجد زر time-challenge نفترض false، وإذا الصعوبة hard نفرض true
            const timeEl = document.getElementById('time-challenge');
            state.timeChallenge = timeEl ? timeEl.checked : false;
            if(state.difficulty === 'hard') state.timeChallenge = true;
            
            let possibleWords = wordsDB[state.category] ? wordsDB[state.category].filter(w => w.length === state.wordLength) : [];
            if(possibleWords.length === 0) possibleWords = wordsDB['general'].filter(w => w.length === state.wordLength);
            
            // حماية إضافية لتجنب الأعطال في حال الفئة فارغة
            let randomWord = possibleWords[Math.floor(Math.random() * possibleWords.length)] || "سلام";
            state.targetWord = normalizeWord(randomWord);
        }

        state.grid = Array(state.maxAttempts).fill().map(() => Array(state.wordLength).fill(''));
        state.currentRow = 0; state.currentCol = 0; state.gameOver = false;
        
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('game-result-area').classList.add('hidden');
        document.getElementById('btn-hint').classList.remove('hidden');
        
        UI.buildBoard(); UI.buildKeyboard();

        if(state.timeChallenge) {
            document.getElementById('timer-container').classList.remove('hidden');
            this.startTimer(state.difficulty === 'hard' ? 90 : 120);
        } else {
            document.getElementById('timer-container').classList.add('hidden');
            clearInterval(state.timerInterval);
        }
    },

    startTimer(seconds) {
        clearInterval(state.timerInterval); state.timeLeft = seconds;
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');
        timerBar.style.width = '100%'; timerBar.style.backgroundColor = 'var(--correct)';
        timerText.innerText = `⏳ المتبقي: ${state.timeLeft} ثانية`;
        timerText.style.color = 'var(--timer-color)';

        state.timerInterval = setInterval(() => {
            if(state.gameOver) { clearInterval(state.timerInterval); return; }
            state.timeLeft--;
            timerText.innerText = `⏳ المتبقي: ${state.timeLeft} ثانية`;
            const pct = (state.timeLeft / seconds) * 100; timerBar.style.width = `${pct}%`;
            
            if(pct < 30) { timerBar.style.backgroundColor = 'var(--timer-color)'; timerText.classList.add('shake'); }
            if(state.timeLeft <= 0) { clearInterval(state.timerInterval); Game.endGame(false, "انتهى الوقت! ⏰"); }
        }, 1000);
    },

    handlePhysicalKeyboard(e) {
        if(state.gameOver) return;
        if(e.key === 'Enter' || e.key === 'Backspace') Game.handleKey(e.key);
        else if(/^[\u0600-\u06FF]$/.test(e.key)) Game.handleKey(e.key);
    },

    handleKey(key) {
        if(state.gameOver) return;
        if (key === 'Backspace') {
            if (state.currentCol > 0) {
                AudioEngine.click(); state.currentCol--; state.grid[state.currentRow][state.currentCol] = '';
                const tile = document.getElementById(`tile-${state.currentRow}-${state.currentCol}`);
                tile.innerText = ''; tile.classList.remove('pop');
            }
        } else if (key === 'Enter') {
            if (state.currentCol === state.wordLength) this.submitGuess();
            else { UI.showToast('الكلمة قصيرة جداً'); AudioEngine.error(); this.shakeRow(); }
        } else {
            if (state.currentCol < state.wordLength) {
                AudioEngine.click(); state.grid[state.currentRow][state.currentCol] = key;
                const tile = document.getElementById(`tile-${state.currentRow}-${state.currentCol}`);
                tile.innerText = key; tile.classList.add('pop');
                setTimeout(() => tile.classList.remove('pop'), 100); state.currentCol++;
            }
        }
    },

    submitGuess() {
        const guessArr = state.grid[state.currentRow];
        const normalizedGuessArr = guessArr.map(char => normalizeWord(char));
        const result = this.evaluateGuess(normalizedGuessArr, state.targetWord.split(''));
        this.animateRow(result, normalizedGuessArr.join('') === state.targetWord);
    },

    evaluateGuess(guess, target) {
        let result = Array(state.wordLength).fill('absent'); let targetCopy = [...target];
        for(let i=0; i<state.wordLength; i++) { if(guess[i] === targetCopy[i]) { result[i] = 'correct'; targetCopy[i] = null; } }
        for(let i=0; i<state.wordLength; i++) {
            if(result[i] !== 'correct' && targetCopy.includes(guess[i])) { result[i] = 'present'; targetCopy[targetCopy.indexOf(guess[i])] = null; }
        }
        return result;
    },

    animateRow(result, isWin) {
        let delay = 0; const row = state.currentRow;
        for(let i=0; i<state.wordLength; i++) {
            setTimeout(() => {
                const tile = document.getElementById(`tile-${row}-${i}`);
                tile.classList.add('flip'); tile.classList.add(result[i]);
                const keyBtn = document.querySelector(`.key[data-key="${state.grid[row][i]}"]`);
                if(keyBtn && !keyBtn.classList.contains('correct')) {
                    if(result[i] === 'correct') { keyBtn.classList.remove('present', 'absent'); keyBtn.classList.add('correct'); }
                    else if(result[i] === 'present' && !keyBtn.classList.contains('correct')) { keyBtn.classList.remove('absent'); keyBtn.classList.add('present'); }
                    else if(!keyBtn.classList.contains('present')) { keyBtn.classList.add('absent'); }
                }
                if(i === state.wordLength - 1) {
                    setTimeout(() => {
                        if(isWin) Game.endGame(true);
                        else if(state.currentRow === state.maxAttempts - 1) Game.endGame(false);
                        else { state.currentRow++; state.currentCol = 0; }
                    }, 300);
                }
            }, delay); delay += 300;
        }
    },

    shakeRow() {
        const r = state.currentRow; if (navigator.vibrate) navigator.vibrate(100);
        for(let c=0; c<state.wordLength; c++) {
            const tile = document.getElementById(`tile-${r}-${c}`);
            tile.classList.add('shake'); setTimeout(() => tile.classList.remove('shake'), 400);
        }
    },

    useHint() {
        if (state.coins < 15) { UI.showToast('لا يوجد لديك عملات كافية للتلميح (تحتاج 15)'); return; }
        state.coins -= 15; UI.updateCoins();
        const targetArr = state.targetWord.split(''); const letter = targetArr[Math.floor(Math.random() * targetArr.length)];
        UI.showToast(`💡 تلميح: الكلمة تحتوي على حرف "${letter}"`);
    },

    endGame(isWin, msg = null) {
        state.gameOver = true; clearInterval(state.timerInterval);
        
        if(state.mode !== 'friend') {
            state.stats.played++;
            if(isWin) {
                state.stats.wins++; state.stats.currentStreak++;
                if(state.stats.currentStreak > state.stats.maxStreak) state.stats.maxStreak = state.stats.currentStreak;
            } else { state.stats.losses++; state.stats.currentStreak = 0; }
            localStorage.setItem('wordle_ar_stats', JSON.stringify(state.stats));
        }

        let coinsEarned = 0;
        if(isWin) {
            AudioEngine.win(); ConfettiEngine.fire();
            coinsEarned = state.mode === 'daily' ? 25 : 15; 
            state.coins += coinsEarned;
            for(let c=0; c<state.wordLength; c++) { setTimeout(() => document.getElementById(`tile-${state.currentRow}-${c}`).classList.add('win-bounce'), c * 100); }
        } else { AudioEngine.lose(); coinsEarned = 5; state.coins += coinsEarned; } 
        
        UI.updateCoins();

        setTimeout(() => {
            const title = document.getElementById('result-title'); const wordLabel = document.getElementById('result-word');
            const coinsLabel = document.getElementById('result-coins');
            
            if(isWin) { title.innerText = '🎉 أحسنت! إجابة صحيحة'; title.style.color = 'var(--correct)'; }
            else { title.innerText = msg ? msg : '😔 للأسف نفدت المحاولات'; title.style.color = 'var(--timer-color)'; }
            
            wordLabel.innerHTML = `الكلمة كانت: <strong>${state.targetWord}</strong>`;
            coinsLabel.innerText = `لقد ربحت +${coinsEarned} عملة معدنية`;
            
            document.getElementById('btn-new-game').style.display = state.mode === 'free' ? 'flex' : 'none';
            document.getElementById('game-result-area').classList.remove('hidden');
            UI.showModal('modal-stats');
        }, 1500);
    },

    shareResult() {
        let modeName = state.mode === 'daily' ? '🌟 التحدي اليومي' : (state.mode === 'friend' ? '🔥 تحدي صديق' : 'اللعب الحر');
        let gridEmoji = `الكلمة المفقودة - ${modeName}\n${state.currentRow + 1}/${state.maxAttempts}\n\n`;
        for(let r=0; r<=state.currentRow; r++) {
            for(let c=0; c<state.wordLength; c++) {
                const tile = document.getElementById(`tile-${r}-${c}`);
                if(tile.classList.contains('correct')) gridEmoji += '🟩';
                else if(tile.classList.contains('present')) gridEmoji += '🟨';
                else gridEmoji += '⬛';
            }
            gridEmoji += '\n';
        }
        if(state.mode === 'friend') gridEmoji += `\nجرب اللعبة بنفسك:\n${window.location.origin + window.location.pathname}`;
        navigator.clipboard.writeText(gridEmoji).then(() => UI.showToast('✅ تم النسخ بنجاح! شاركها الآن.'));
    }
};

window.onload = () => UI.init();
