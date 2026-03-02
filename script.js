/* ============================================================
   الكلمة المفقودة - Enhanced Arabic Wordle (Nano Banana 2 MVP)
   - COMPLETE FILE: No Abbreviations, Extremely Fast
   - Features: iOS Keyboard, Long Press Backspace, Extra Chance (50 coins),
     Smart Dictionary, Smart Hints, Daily Lock, Confetti, Leaderboard.
   ============================================================ */

'use strict';

/* ============================
   NORMALIZATION ENGINE
   ============================ */
const normalizeWord = (word) => {
    if (!word) return "";
    return word
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل فقط، الحفاظ على التاء المربوطة
        .trim();
};

/* ============================
   WORD DATABASE
   ============================ */
const rawWordsDB = {
    general: ["كتاب","سلام","نجمة","قمر","شمس","بحر","جبل","وطن","حرب","عيد","لون","ريح","ماء","نار","تراب","ذهب","فضة","حجر","ورق","قلب","دار","باب","نهر","سحر","امل","فكر","روح","عقل","جسد","خبر","مكتب","عالم","طريق","حياة","سيارة","دراسة","رياضة","سفينة","طبيب","كريم","مجلس","ملعب","فضاء","حقيقة","مستقبل","برنامج","موسيقى","معلومة","جامعة","مدرسة","حديقة","مكتبة","مستشفى","منافسة","ذكاء","جمال","حكمة","شجاع","طموح","كرامة","أمانة","إخلاص","صداقة","محبة","سعادة","نجاح","تفاهم","قيادة","ريادة","إبداع","تميز","تعاون","إنجاز","تطور","قدرة","مهارة","خبرة","اقتصاد","مهندس","عمليات","تجارة","حضارة","ثقافة","موروث","تعليم","تدريب","إدارة","مؤسسة","مشروع","استثمار","اختراع","اكتشاف"],
    khaleeji: ["جمان","ساهر","شغف","غزل","ودود","حبوب","شطور","موضة","دلال","حنان","صلف","غلا","وجع","فرحة","وصال","يوفي","دفعة","حدود","أمينة","ناطحة","زوارة","ثريا","رمانة","إقبال","نوايا","عذراء","مجنون","الجار","الهيبة","النمر","الصفعة","العاصوف","الخاطر","الناجية","الميراث","انتقام","السيرة","التحدي","المعركة","الخيانة","الوفاء","الأصيل","الغيرة","الاصالة"],
    food: ["تفاح","موزة","عنبة","بصلة","ثومة","خيار","لحمة","سمكة","بيضة","أرز","خبز","ملح","سكر","زيت","عسل","حليب","جبنة","زبدة","رقاق","حلوى","عصير","شاي","قهوة","شوكو","ليمون","تمر","رمان","تين","كبسة","برياني","مندي","مقلوبة","شاورما","فلافل","حمص","شكشوكة","طاجن","كفتة","بريوش","بسبوسة","كنافة","قطايف","مهلبية","سلطة","شربة","معجون","طحينة","بقلاوة","حريرة","مرقة","كسكسى","دجاجة"],
    tech: ["تطبيق","موقع","خادم","رقمي","ذكاء","بيان","كود","بناء","نسخ","تخزين","حاسب","شاشة","لوحة","هاتف","جوال","شبكة","ذاكرة","برمجة","تشفير","معالج","بيانات","محرك","تطوير","تصميم","واجهة","مستخدم","سحابة","منصة","نظام","متصفح","اتصال","تعلم","روبوت","طابعة","ماسح","كاميرا","بلوتوث","إنترنت","فيديو","صوت","مجلد","مفتاح","أمان","جدار","نسخة"],
    cities: ["مكة","جدة","دبي","أبها","حائل","تبوك","عسير","نيوم","ينبع","شرم","رياض","دمام","كويت","دوحة","منامة","مسقط","عمان","قاهرة","تونس","رباط","بغداد","دمشق","بيروت","صنعاء","شارقة","عجمان","فجيرة","خبر","الطائف","المدينة","الخرطوم","طرابلس","الجزائر","مراكش","الرياض","الكويت","المنامة","أبوظبي","الشارقة"],
    animals: ["أسد","نمر","ذئب","قرد","حصان","غزال","فيل","كلب","ثور","بقر","حوت","قرش","سمك","ضبع","خنزير","ماعز","حمار","ناقة","زرافة","تمساح","عصفور","حمامة","سنجاب","دلفين","أخطبوط","ثعبان","سلحفاة","طاووس","خفاش","غوريلا","كنغر","أرنب","عقرب","صرصار","خنفساء","فراشة","نحلة","نملة","دودة","حلزون","ضفدع","نعامة"],
    sports: ["ركض","قفز","غوص","سبح","ضرب","ركل","كرة","هدف","ملعب","حكم","لاعب","تزلج","جري","تسلق","سباحة","رماية","ملاكمة","جمباز","كاراتيه","بطولة","كأس","تنس","جودو","تايكوندو","فروسية","مصارعة","طائرة","ريشة","تجديف","رقص","مشي","هرولة","ماراثون","دراجات","سباق","منافسة","أولمبياد","دوري","مباراة","تصفيات"]
};

// المعجم الذكي المدمج
const smartDictionary = {
    "سلام": "التحية، والأمان، والبراءة من العيوب.",
    "ساهر": "من طال به الأرق ولم ينم ليلاً.",
    "جمان": "حبات اللؤلؤ الفضية الثمينة.",
    "رياض": "جمع روضة، وهي الأرض الخضراء البهية.",
    "كتاب": "صحائف مجموعة بين غلافين تحتوي على علم أو فن.",
    "شغف": "ولع وحب شديد للشيء.",
    "غزل": "التودد والتغني بالجمال.",
    "حياة": "الوجود والبقاء، عكس الموت.",
    "ذكاء": "سرعة الفهم وقوة الملاحظة.",
    "إبداع": "ابتكار شيء جديد غير مسبوق."
};

const answerPool = {};
let allowedWordsArray = [];

Object.keys(rawWordsDB).forEach(cat => {
    const validWords = rawWordsDB[cat].map(normalizeWord).filter(w => w.length >= 4 && w.length <= 6);
    answerPool[cat] = [...new Set(validWords)];
    allowedWordsArray = allowedWordsArray.concat(answerPool[cat]);
});
const allowedWords = new Set(allowedWordsArray);

const LinkEngine = {
    encodeWord: (str) => btoa(encodeURIComponent(normalizeWord(str))),
    decodeWord: (str) => { try { return decodeURIComponent(atob(str)); } catch(e) { return null; } }
};

/* ============================
   RAINING CONFETTI ENGINE (From Top)
   ============================ */
const ConfettiEngine = (() => {
    let canvas, ctx, particles = [], raf = null, active = false;
    const COLORS = ['#FFD700', '#FF5722', '#00E676', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4'];

    function resize() {
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: -(Math.random() * canvas.height), 
            w: 8 + Math.random() * 10,
            h: 8 + Math.random() * 10,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 3,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2,
            shape: Math.random() > 0.5 ? 'circle' : (Math.random() > 0.5 ? 'rect' : 'ribbon'),
            alpha: 1
        };
    }

    function update() {
        if (!active) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;
            
            if (p.y > canvas.height - 50) p.alpha -= 0.05;
            if (p.alpha <= 0) { particles.splice(i, 1); continue; }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
            } else if (p.shape === 'ribbon') {
                ctx.fillRect(-p.w/2, -p.h, p.w, p.h * 2);
            } else {
                ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            }
            ctx.restore();
        }

        if (particles.length === 0) { active = false; ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
        raf = requestAnimationFrame(update);
    }

    return {
        init() {
            canvas = document.getElementById('confetti-canvas');
            if(!canvas) return;
            ctx = canvas.getContext('2d');
            resize(); window.addEventListener('resize', resize, { passive: true });
        },
        fire() {
            resize(); particles = [];
            for (let i = 0; i < 250; i++) particles.push(createParticle());
            if (!active) { active = true; raf = requestAnimationFrame(update); }
        }
    };
})();

/* ============================
   AUDIO & VIBRATION ENGINES
   ============================ */
const AudioEngine = (() => {
    let ctx = null;
    function init() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    function tone(freq, type, dur, vol) {
        if (!document.getElementById('sound-toggle')?.checked) return;
        init();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + dur);
    }
    return {
        init,
        click()  { tone(380, 'sine', 0.08, 0.08); },
        error()  { tone(140, 'sawtooth', 0.25, 0.15); },
        win()    {
            tone(440,'triangle',0.1,0.1);
            setTimeout(() => tone(554,'triangle',0.1,0.12), 110);
            setTimeout(() => tone(659,'triangle',0.15,0.12), 230);
            setTimeout(() => tone(880,'triangle',0.5,0.16), 400);
        },
        lose()   { tone(280,'triangle',0.2,0.1); setTimeout(() => tone(220,'triangle',0.5,0.15), 220); },
        hint()   { tone(700,'sine',0.15,0.1); }
    };
})();

const Vibrate = {
    tap()   { if (document.getElementById('vibrate-toggle')?.checked && navigator.vibrate) navigator.vibrate(18); },
    error() { if (document.getElementById('vibrate-toggle')?.checked && navigator.vibrate) navigator.vibrate([40,20,40]); },
    win()   { if (document.getElementById('vibrate-toggle')?.checked && navigator.vibrate) navigator.vibrate([60,30,60,30,100]); }
};

/* ============================
   STATE MANAGEMENT
   ============================ */
function loadStats() {
    try {
        const p = JSON.parse(localStorage.getItem('wordle_ar_stats_v2'));
        if (p && typeof p === 'object') {
            return {
                played: p.played||0, wins: p.wins||0, losses: p.losses||0,
                currentStreak: p.currentStreak||0, maxStreak: p.maxStreak||0
            };
        }
    } catch(e) {}
    return { played:0, wins:0, losses:0, currentStreak:0, maxStreak:0 };
}

const state = {
    mode: 'free', difficulty: 'medium', category: 'general',
    theme: localStorage.getItem('wordle_ar_theme') || 'modern',
    colorblind: localStorage.getItem('wordle_ar_cb') === 'true',
    strictMode: localStorage.getItem('wordle_ar_strict') !== 'false',
    wordLength: 5, maxAttempts: 6, timeChallenge: false, timeLeft: 120, timerInterval: null,
    targetWord: '', currentRow: 0, currentCol: 0, grid: [], gameOver: false,
    coins: parseInt(localStorage.getItem('wordle_ar_coins')) || 50,
    stats: loadStats()
};

/* ============================
   UI LOGIC & LEADERBOARD
   ============================ */
const UI = {
    init() {
        ConfettiEngine.init();
        this.applyTheme(state.theme);
        this.applyColorblind(state.colorblind);
        this.loadSettings();
        this.updateCoins(false);
        this.updateDailyButtonState();
        this.checkURLParams();
        this.startDailyTimer();
        this.bindEvents();
    },

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('wordle_ar_theme', theme);
        state.theme = theme;
    },

    applyColorblind(isCb) {
        document.body.setAttribute('data-colorblind', isCb);
        localStorage.setItem('wordle_ar_cb', isCb);
        state.colorblind = isCb;
    },

    updateCoins(animate = true) {
        const countEl = document.getElementById('coin-count');
        if (countEl) countEl.textContent = state.coins;
        localStorage.setItem('wordle_ar_coins', state.coins);
    },

    updateDailyButtonState() {
        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem('wordle_ar_daily_last_played');
        const btn = document.getElementById('btn-daily-word');
        if (btn) {
            if (lastPlayed === today) {
                btn.style.opacity = '0.6';
                btn.innerHTML = `<svg class="nano-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> تحدي اليوم (مكتمل)`;
            } else {
                btn.style.opacity = '1';
                btn.innerHTML = `<svg class="nano-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> كلمة اليوم`;
            }
        }
    },

    startDailyTimer() {
        setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const diff = tomorrow - now;
            
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            
            const mainTimer = document.getElementById('next-daily-menu');
            const statsTimer = document.getElementById('daily-countdown');
            if (mainTimer) mainTimer.textContent = `التحدي القادم بعد: ${timeStr}`;
            if (statsTimer) statsTimer.textContent = timeStr;
        }, 1000);
    },

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const w = urlParams.get('w');
        const mode = urlParams.get('mode');

        if (w) {
            const decoded = LinkEngine.decodeWord(w);
            if (decoded && decoded.length >= 4 && decoded.length <= 6) {
                state.mode = 'friend'; state.targetWord = decoded; state.wordLength = decoded.length;
                state.maxAttempts = decoded.length === 4 ? 7 : (decoded.length === 5 ? 6 : 5);
                document.getElementById('standard-options').classList.add('hidden');
                const fMsg = document.getElementById('friend-challenge-msg');
                if(fMsg) fMsg.classList.remove('hidden');
            }
        } else if (mode === 'daily') {
            setTimeout(() => { 
                const btn = document.getElementById('btn-daily-word');
                if(btn) btn.click(); 
            }, 100);
        } else if (mode === 'friend') {
            setTimeout(() => this.showModal('modal-challenge'), 100);
        }
        if (mode) window.history.replaceState({}, document.title, window.location.pathname);
    },

    generateLeaderboard() {
        const fakePlayers = [
            {name: "أحمد", streak: 42}, {name: "سارة_99", streak: 38}, {name: "Khalid", streak: 35},
            {name: "بطل_الكلمات", streak: 31}, {name: "Noor", streak: 28}, {name: "M7MD", streak: 25},
            {name: "ريم", streak: 22}, {name: "Ali_Vip", streak: 19}, {name: "عاشق_العربية", streak: 15}
        ];
        fakePlayers.push({name: "أنت (أنا)", streak: state.stats.maxStreak, isCurrent: true});
        fakePlayers.sort((a, b) => b.streak - a.streak);

        const listEl = document.getElementById('leaderboard-list');
        if(!listEl) return;
        listEl.innerHTML = '';
        fakePlayers.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = `lb-item ${player.isCurrent ? 'current-user' : ''}`;
            div.innerHTML = `<span><span class="lb-rank">${index + 1}</span> ${player.name}</span><span>🔥 ${player.streak}</span>`;
            listEl.appendChild(div);
        });
    },

    bindEvents() {
        this._on('btn-daily-word', 'click', () => { 
            const today = new Date().toDateString();
            const lastPlayed = localStorage.getItem('wordle_ar_daily_last_played');
            if (lastPlayed === today) {
                this.showToast('لقد أكملت تحدي اليوم بنجاح! عد غداً لتحدٍ جديد ⏳', 3000);
                AudioEngine.error(); Vibrate.error();
                return;
            }
            AudioEngine.click(); Vibrate.tap(); state.mode = 'daily'; Game.start(); 
        });

        this._on('btn-start-free', 'click', () => { AudioEngine.click(); Vibrate.tap(); state.mode = 'free'; Game.start(); });
        this._on('btn-start-friend', 'click', () => { AudioEngine.click(); Vibrate.tap(); Game.start(); });
        this._on('btn-cancel-friend', 'click', () => {
            window.history.replaceState({}, document.title, window.location.pathname);
            const fMsg = document.getElementById('friend-challenge-msg');
            const stdOpts = document.getElementById('standard-options');
            if(fMsg) fMsg.classList.add('hidden');
            if(stdOpts) stdOpts.classList.remove('hidden');
        });

        this._on('btn-create-challenge', 'click', () => { AudioEngine.click(); this.showModal('modal-challenge'); });
        this._on('btn-generate-link', 'click', () => {
            const inp = document.getElementById('challenge-input');
            if(!inp) return;
            const word = inp.value.trim();
            if (word.length < 4 || word.length > 6 || !/^[\u0600-\u06FF]+$/.test(word)) {
                this.showToast('أدخل كلمة عربية من 4 إلى 6 حروف'); return;
            }
            const link = window.location.origin + window.location.pathname + '?w=' + LinkEngine.encodeWord(word);
            navigator.clipboard.writeText(link).then(() => {
                this.showToast('✅ تم نسخ الرابط!');
                document.getElementById('modal-challenge').classList.add('hidden');
            });
        });

        const catSelector = document.getElementById('category-selector');
        if(catSelector) {
            catSelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.seg-btn');
                if (!btn) return;
                AudioEngine.click(); Vibrate.tap();
                document.querySelectorAll('#category-selector .seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.category = btn.dataset.val;
            });
        }

        const themeSelector = document.getElementById('theme-selector');
        if(themeSelector){
            themeSelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.seg-btn');
                if (!btn) return;
                AudioEngine.click();
                document.querySelectorAll('#theme-selector .seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyTheme(btn.dataset.val);
            });
        }

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                AudioEngine.click(); Vibrate.tap();
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.difficulty = btn.dataset.diff;
            });
        });

        this._on('btn-reset', 'click', () => location.reload());
        this._on('btn-new-game', 'click', () => {
            document.getElementById('modal-stats').classList.add('hidden');
            if (state.mode === 'free') Game.start(); else location.reload();
        });
        
        this._on('btn-stats', 'click', () => this.showModal('modal-stats'));
        this._on('btn-help', 'click', () => this.showModal('modal-help'));
        this._on('btn-settings', 'click', () => this.showModal('modal-settings'));
        this._on('btn-leaderboard', 'click', () => {
            this.generateLeaderboard();
            this.showModal('modal-leaderboard');
        });
        this._on('btn-hint', 'click', () => Game.useHint());
        this._on('btn-share', 'click', () => Game.shareResult());
        
        const strictToggle = document.getElementById('strict-mode-toggle');
        if(strictToggle) {
            strictToggle.addEventListener('change', (e) => {
                state.strictMode = e.target.checked;
                localStorage.setItem('wordle_ar_strict', state.strictMode);
            });
        }

        const cbToggle = document.getElementById('colorblind-toggle');
        if(cbToggle) {
            cbToggle.addEventListener('change', (e) => {
                this.applyColorblind(e.target.checked);
            });
        }

        this._on('btn-reset-stats', 'click', () => {
            if (confirm('هل تريد حذف كل الإحصائيات؟')) {
                localStorage.removeItem('wordle_ar_stats_v2');
                state.stats = loadStats();
                this.updateStatsUI();
                this.showToast('✅ تم إعادة الضبط');
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.close-modal')) e.target.closest('.modal').classList.add('hidden');
            if (e.target.classList.contains('modal')) e.target.classList.add('hidden');
        });

        document.addEventListener('keydown', (e) => Game.handlePhysicalKeyboard(e));
        document.body.addEventListener('touchstart', () => AudioEngine.init(), { once: true, passive: true });
        document.body.addEventListener('click', () => AudioEngine.init(), { once: true });
    },

    _on(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    },

    loadSettings() {
        this.applyTheme(state.theme);
        document.querySelectorAll('#theme-selector .seg-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.val === state.theme);
        });
        const cbToggle = document.getElementById('colorblind-toggle');
        if(cbToggle) cbToggle.checked = state.colorblind;
        this.applyColorblind(state.colorblind);
        this.updateStatsUI();
    },

    showModal(id) {
        const el = document.getElementById(id);
        if(el) el.classList.remove('hidden');
        if (id === 'modal-stats') this.updateStatsUI();
    },

    updateStatsUI() {
        const s = state.stats;
        const elPlayed = document.getElementById('stat-played');
        if(elPlayed) elPlayed.textContent = s.played;
        const pct = s.played > 0 ? Math.round((s.wins / s.played) * 100) : 0;
        const elPct = document.getElementById('stat-winpct');
        if(elPct) elPct.textContent = `${pct}%`;
        const elStreak = document.getElementById('stat-streak');
        if(elStreak) elStreak.textContent = s.currentStreak;
        const elMax = document.getElementById('stat-maxstreak');
        if(elMax) elMax.textContent = s.maxStreak;
    },

    buildBoard() {
        const board = document.getElementById('board');
        if(!board) return;
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${state.wordLength}, 1fr)`;
        const frag = document.createDocumentFragment();
        for (let r = 0; r < state.maxAttempts; r++) {
            for (let c = 0; c < state.wordLength; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${r}-${c}`;
                frag.appendChild(tile);
            }
        }
        board.appendChild(frag);
    },

    /* ============================================================
       iOS KEYBOARD + SAFE LONG PRESS BACKSPACE
       ============================================================ */
    buildKeyboard() {
        const kb = document.getElementById('keyboard');
        if(!kb) return;
        kb.innerHTML = '';
        
        // ترتيب كيبورد الآيفون المطابق 100% 
        const layout = [
            ['د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض'],
            ['ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش'],
            ['BACKSPACE', 'ظ', 'ز', 'و', 'ة', 'ى', 'ر', 'ؤ', 'ء', 'ئ', 'ذ', 'ENTER']
        ];
        
        const frag = document.createDocumentFragment();
        layout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'key-row';
            row.forEach(key => {
                const btn = document.createElement('button');
                btn.className = 'key';
                
                if (key === 'ENTER') {
                    btn.textContent = 'إدخال'; 
                    btn.classList.add('large'); 
                    btn.dataset.key = 'Enter';
                    // استخدام Click السريع (بدون pointerdown المعطل للحركة)
                    btn.addEventListener('click', () => Game.handleKey(btn.dataset.key));
                } else if (key === 'BACKSPACE') {
                    btn.textContent = '⌫'; 
                    btn.classList.add('large'); 
                    btn.dataset.key = 'Backspace';
                    
                    let pressTimer;
                    // تفعيل المسح المطول بشكل آمن فقط لزر الرجوع
                    const startPress = (e) => {
                        e.preventDefault(); 
                        Game.handleKey('Backspace');
                        pressTimer = setTimeout(() => {
                            while(state.currentCol > 0) {
                                Game.handleKey('Backspace');
                            }
                            Vibrate.error(); 
                        }, 500); 
                    };
                    const clearPress = () => clearTimeout(pressTimer);

                    btn.addEventListener('touchstart', startPress, {passive: false});
                    btn.addEventListener('mousedown', (e) => { if(e.pointerType !== 'touch') startPress(e); });
                    btn.addEventListener('touchend', clearPress);
                    btn.addEventListener('mouseup', clearPress);
                    btn.addEventListener('mouseleave', clearPress);
                    
                } else {
                    btn.textContent = key; 
                    btn.dataset.key = key;
                    btn.addEventListener('click', () => Game.handleKey(btn.dataset.key));
                }
                rowDiv.appendChild(btn);
            });
            frag.appendChild(rowDiv);
        });
        kb.appendChild(frag);
    },

    showToast(msg, duration = 2400) {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast'; toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }
};

/* ============================
   GAME LOGIC CORE
   ============================ */
const Game = {
    start() {
        if (state.mode === 'daily') {
            state.wordLength = 5; state.maxAttempts = 6; state.timeChallenge = false;
            const seed = new Date().toDateString();
            const allFive = Object.values(answerPool).flat().filter(w => w.length === 5);
            state.targetWord = allFive[seed.length % allFive.length] || "سلام";
        } else if (state.mode === 'free') {
            if (state.difficulty === 'easy')        { state.wordLength = 4; state.maxAttempts = 7; }
            else if (state.difficulty === 'medium') { state.wordLength = 5; state.maxAttempts = 6; }
            else                                    { state.wordLength = 6; state.maxAttempts = 5; }

            state.timeChallenge = (state.difficulty === 'hard');
            
            let pool = (answerPool[state.category] || answerPool.general).filter(w => w.length === state.wordLength);
            if (pool.length === 0) pool = ['سلام'];
            state.targetWord = pool[Math.floor(Math.random() * pool.length)];
        } 

        state.grid = Array.from({length: state.maxAttempts}, () => Array(state.wordLength).fill(''));
        state.currentRow = 0; state.currentCol = 0; state.gameOver = false;
        
        const startMenu = document.getElementById('start-menu');
        const gameScreen = document.getElementById('game-screen');
        if(startMenu) { startMenu.classList.remove('active'); startMenu.classList.add('hidden'); }
        if(gameScreen) { gameScreen.classList.remove('hidden'); gameScreen.classList.add('active'); }
        
        const resultArea = document.getElementById('game-result-area');
        if(resultArea) resultArea.classList.add('hidden');
        
        const btnHint = document.getElementById('btn-hint');
        if(btnHint) btnHint.classList.remove('hidden');

        UI.buildBoard();
        UI.buildKeyboard();

        if (state.timeChallenge) {
            const tContainer = document.getElementById('timer-container');
            if(tContainer) tContainer.classList.remove('hidden');
            this.startTimer(state.difficulty === 'hard' ? 90 : 120);
        } else {
            const tContainer = document.getElementById('timer-container');
            if(tContainer) tContainer.classList.add('hidden');
            clearInterval(state.timerInterval);
        }
    },

    startTimer(seconds) {
        clearInterval(state.timerInterval);
        state.timeLeft = seconds;
        const bar  = document.getElementById('timer-bar');
        const text = document.getElementById('timer-text');
        if(bar) { bar.style.width = '100%'; bar.style.backgroundColor = 'var(--correct)'; bar.classList.remove('warning'); }
        if(text) text.textContent = `⏳ المتبقي: ${state.timeLeft} ثانية`;

        state.timerInterval = setInterval(() => {
            if (state.gameOver) { clearInterval(state.timerInterval); return; }
            state.timeLeft--;
            if(text) text.textContent = `⏳ المتبقي: ${state.timeLeft} ثانية`;
            const pct = (state.timeLeft / seconds) * 100;
            if(bar) bar.style.width = `${pct}%`;
            
            if (pct < 35 && bar) {
                bar.style.backgroundColor = 'var(--timer-color)';
                bar.classList.add('warning');
            }
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                Game.endGame(false, "انتهى الوقت! ⏰");
            }
        }, 1000);
    },

    handlePhysicalKeyboard(e) {
        if (state.gameOver) return;
        const active = document.getElementById('game-screen');
        if (!active || active.classList.contains('hidden')) return;
        if (e.key === 'Enter' || e.key === 'Backspace') {
            e.preventDefault(); Game.handleKey(e.key);
        } else if (/^[\u0600-\u06FF]$/.test(e.key)) {
            Game.handleKey(e.key);
        }
    },

    /* ============================================================
       SMART HINT & TYPING LOGIC
       ============================================================ */
    handleKey(key) {
        if (state.gameOver) return;
        
        if (key === 'Backspace') {
            let lastTypedIndex = -1;
            for (let i = state.wordLength - 1; i >= 0; i--) {
                const tile = document.getElementById(`tile-${state.currentRow}-${i}`);
                if (state.grid[state.currentRow][i] !== '' && tile && !tile.dataset.hint) {
                    lastTypedIndex = i;
                    break;
                }
            }
            
            if (lastTypedIndex !== -1) {
                AudioEngine.click(); Vibrate.tap();
                state.grid[state.currentRow][lastTypedIndex] = '';
                const tile = document.getElementById(`tile-${state.currentRow}-${lastTypedIndex}`);
                if(tile) { tile.textContent = ''; tile.classList.remove('pop'); }
                state.currentCol = lastTypedIndex; 
            }
        } 
        else if (key === 'Enter') {
            if (!state.grid[state.currentRow].includes('')) {
                this.submitGuess();
            } else {
                UI.showToast('الكلمة غير مكتملة ✋'); AudioEngine.error(); Vibrate.error(); this.shakeRow();
            }
        } 
        else {
            const norm = normalizeWord(key);
            if (norm) {
                let emptyIndex = state.grid[state.currentRow].indexOf('');
                if (emptyIndex !== -1) {
                    AudioEngine.click(); Vibrate.tap();
                    state.grid[state.currentRow][emptyIndex] = norm;
                    const tile = document.getElementById(`tile-${state.currentRow}-${emptyIndex}`);
                    if(tile) {
                        tile.textContent = norm;
                        tile.classList.remove('pop');
                        void tile.offsetWidth;
                        tile.classList.add('pop');
                        setTimeout(() => tile.classList.remove('pop'), 150);
                    }
                    state.currentCol = state.grid[state.currentRow].indexOf('');
                    if(state.currentCol === -1) state.currentCol = state.wordLength; 
                }
            }
        }
    },

    submitGuess() {
        const guessArr = state.grid[state.currentRow].map(normalizeWord);
        const guessStr = guessArr.join('');
        const targetStr = state.targetWord;

        if (state.strictMode) {
            if (!allowedWords.has(guessStr)) {
                UI.showToast('الكلمة غير موجودة في القاموس 📚');
                AudioEngine.error(); Vibrate.error(); this.shakeRow();
                return; 
            }
        }

        const result = this.evaluateGuess(guessArr, targetStr.split(''));
        this.animateRow(result, guessStr === targetStr);
    },

    evaluateGuess(guess, target) {
        const result = Array(state.wordLength).fill('absent');
        const targetCopy = [...target];
        for (let i = 0; i < state.wordLength; i++) {
            if (guess[i] === targetCopy[i]) { result[i] = 'correct'; targetCopy[i] = null; }
        }
        for (let i = 0; i < state.wordLength; i++) {
            if (result[i] !== 'correct' && targetCopy.includes(guess[i])) {
                result[i] = 'present';
                targetCopy[targetCopy.indexOf(guess[i])] = null;
            }
        }
        return result;
    },

    /* ============================================================
       EXTRA CHANCE LOGIC
       ============================================================ */
    animateRow(result, isWin) {
        const row = state.currentRow;
        const delay = 280;
        for (let i = 0; i < state.wordLength; i++) {
            setTimeout(() => {
                const tile = document.getElementById(`tile-${row}-${i}`);
                if(tile) tile.classList.add('flip');
                setTimeout(() => {
                    if(tile) tile.classList.add(result[i]);
                    const keyChar = state.grid[row][i];
                    const keyBtn  = document.querySelector(`.key[data-key="${keyChar}"]`);
                    if (keyBtn) {
                        if (result[i] === 'correct') {
                            keyBtn.classList.remove('present','absent'); keyBtn.classList.add('correct');
                        } else if (result[i] === 'present' && !keyBtn.classList.contains('correct')) {
                            keyBtn.classList.remove('absent'); keyBtn.classList.add('present');
                        } else if (!keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
                            keyBtn.classList.add('absent');
                        }
                    }
                }, 220);
            }, i * delay);
        }

        const afterFlip = state.wordLength * delay + 350;
        setTimeout(() => {
            if (isWin) {
                Game.endGame(true);
            } else if (state.currentRow === state.maxAttempts - 1) {
                
                if (state.coins >= 50 && state.mode === 'free') {
                    UI.showModal('modal-extra-chance');
                    
                    document.getElementById('btn-buy-chance').onclick = () => {
                        state.coins -= 50;
                        UI.updateCoins(true);
                        state.maxAttempts++;
                        
                        const board = document.getElementById('board');
                        const newRow = state.maxAttempts - 1;
                        for (let c = 0; c < state.wordLength; c++) {
                            const tile = document.createElement('div');
                            tile.className = 'tile pop'; 
                            tile.id = `tile-${newRow}-${c}`;
                            board.appendChild(tile);
                        }
                        
                        state.grid.push(Array(state.wordLength).fill(''));
                        state.currentRow++;
                        state.currentCol = 0;
                        document.getElementById('modal-extra-chance').classList.add('hidden');
                    };
                    
                    document.getElementById('btn-refuse-chance').onclick = () => {
                        document.getElementById('modal-extra-chance').classList.add('hidden');
                        Game.endGame(false);
                    };
                } else {
                    Game.endGame(false);
                }
            } else {
                state.currentRow++;
                state.currentCol = 0;
            }
        }, afterFlip);
    },

    shakeRow() {
        const r = state.currentRow;
        if (navigator.vibrate) navigator.vibrate(60);
        for (let c = 0; c < state.wordLength; c++) {
            const tile = document.getElementById(`tile-${r}-${c}`);
            if(tile){
                tile.classList.remove('shake');
                void tile.offsetWidth;
                tile.classList.add('shake');
                setTimeout(() => tile.classList.remove('shake'), 400);
            }
        }
    },

    useHint() {
        if (state.coins < 15) { UI.showToast('لا يوجد عملات كافية للتلميح (تحتاج 15 💰)'); return; }
        const target = state.targetWord.split('');
        const currentGuess = state.grid[state.currentRow];
        let candidates = [];
        for (let i = 0; i < state.wordLength; i++) {
            if (normalizeWord(currentGuess[i]) !== target[i]) candidates.push(i);
        }
        if (candidates.length === 0) { UI.showToast('أنت تملأ جميع الفراغات! امسح حرفاً لتستخدم التلميح.'); return; }
        const pos    = candidates[Math.floor(Math.random() * candidates.length)];
        const letter = target[pos];

        state.coins -= 15;
        UI.updateCoins(true);
        AudioEngine.hint();

        state.grid[state.currentRow][pos] = letter;
        const tile = document.getElementById(`tile-${state.currentRow}-${pos}`);
        if(tile) {
            tile.textContent = letter;
            tile.dataset.hint = "true"; 
            tile.classList.remove('hint-reveal');
            void tile.offsetWidth;
            tile.classList.add('hint-reveal', 'correct');
            setTimeout(() => tile.classList.remove('hint-reveal'), 500);
        }

        UI.showToast(`💡 الحرف "${letter}" في الموضع ${pos + 1}`);
    },

    /* ============================================================
       SMART DICTIONARY & END GAME
       ============================================================ */
    endGame(isWin, msg = null) {
        state.gameOver = true;
        clearInterval(state.timerInterval);

        if (state.mode === 'daily') {
            localStorage.setItem('wordle_ar_daily_last_played', new Date().toDateString());
            UI.updateDailyButtonState();
        }

        if (state.mode !== 'friend') {
            state.stats.played++;
            if (isWin) {
                state.stats.wins++;
                state.stats.currentStreak++;
                if (state.stats.currentStreak > state.stats.maxStreak)
                    state.stats.maxStreak = state.stats.currentStreak;
            } else {
                state.stats.losses++;
                state.stats.currentStreak = 0;
            }
            localStorage.setItem('wordle_ar_stats_v2', JSON.stringify(state.stats));
        }

        let coinsEarned = 0;
        if (isWin) {
            AudioEngine.win(); ConfettiEngine.fire(); Vibrate.win();
            coinsEarned = state.mode === 'daily' ? 25 : 15;
            state.coins += coinsEarned;
            for (let c = 0; c < state.wordLength; c++) {
                setTimeout(() => {
                    const tile = document.getElementById(`tile-${state.currentRow}-${c}`);
                    if (tile) tile.classList.add('win-bounce');
                }, c * 90);
            }
        } else {
            AudioEngine.lose();
            coinsEarned = 5;
            state.coins += coinsEarned;
        }
        
        UI.updateCoins(true);

        setTimeout(() => {
            const title     = document.getElementById('result-title');
            const wordLabel = document.getElementById('result-word');
            const coinsLbl  = document.getElementById('result-coins');
            const meaningLabel = document.getElementById('word-meaning');

            if (isWin) {
                title.textContent = `🎉 أحسنت! إجابة صحيحة`;
                title.style.color = 'var(--correct)';
            } else {
                title.textContent = msg || '😔 نفدت المحاولات';
                title.style.color = 'var(--timer-color)';
            }
            
            if(wordLabel) wordLabel.innerHTML = `الكلمة كانت: <strong style="font-size:1.3em">${state.targetWord}</strong>`;
            if(coinsLbl) coinsLbl.textContent = `ربحت +${coinsEarned} عملة 💰`;
            
            if (meaningLabel) {
                meaningLabel.textContent = smartDictionary[state.targetWord] || "كلمة عربية أصيلة. ابحث عن معناها في المعجم لتثري لغتك!";
            }

            const newGameBtn = document.getElementById('btn-new-game');
            if(newGameBtn) newGameBtn.style.display = state.mode === 'free' ? 'flex' : 'none';
            
            const resultArea = document.getElementById('game-result-area');
            if(resultArea) resultArea.classList.remove('hidden');
            
            UI.showModal('modal-stats');
        }, 1600);
    },

    shareResult() {
        const modeNames = { daily: '🌟 كلمة اليوم', friend: '🔥 تحدي صديق', free: '🎲 حر' };
        const attempts  = !state.gameOver ? 'X' : state.currentRow + 1;
        let text = `الكلمة المفقودة ${modeNames[state.mode] || ''}\n${attempts}/${state.maxAttempts}\n\n`;
        
        for (let r = 0; r <= state.currentRow; r++) {
            for (let c = 0; c < state.wordLength; c++) {
                const tile = document.getElementById(`tile-${r}-${c}`);
                if (!tile) continue;
                if (tile.classList.contains('correct'))      text += '🟩';
                else if (tile.classList.contains('present')) text += '🟨';
                else                                         text += '⬛';
            }
            text += '\n';
        }
        text += `\nالعب الآن:\n${window.location.origin}${window.location.pathname}`;
        navigator.clipboard.writeText(text)
            .then(() => UI.showToast('✅ تم النسخ! شاركها الآن 🚀'))
            .catch(() => UI.showToast('❌ تعذر النسخ'));
    }
};

/* ============================
   BOOT APP
   ============================ */
window.addEventListener('load', () => UI.init());

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
