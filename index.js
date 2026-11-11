const {
  default: makeWASocket, useMultiFileAuthState, DisconnectReason,
  downloadMediaMessage, jidNormalizedUser, fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const http = require('http');
const config = require('./config');

const startTime = Date.now();
const SESSION_DIR = './session';
let prefix = config.prefix;
let mode = config.mode;


const fmtUptime = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
};

// ---------- MENU ----------
const CATEGORIES = {
  '👑 *OWNER*': ['mode', 'settings', 'password', 'setprefix', 'viewonce', 'delprefix', 'setpp', 'setbotbio', 'autobio', 'autostatus', 'autotyping', 'autorecording', 'autoreact', 'anticall', 'antidelete', 'antideletestatus', 'addsudo', 'delsudo', 'sudolist', 'block', 'unblock', 'ban', 'unban', 'save', 'schedulestatus', 'reshare', 'chatbot', 'clearsession', 'cleartmp', 'pair', 'checkidch', 'archive', 'unarchive', 'chatpin', 'unpin', 'markread', 'markunread', 'unmutechat', 'profilename', 'fullphoto', 'removephoto', 'join', 'listgc', 'edit', 'forward', 'getprivacy', 'lastseen', 'mypp', 'mystatus', 'read', 'groupadd', 'privacy'],
  '💻 *BOT*': ['owner', 'ping', 'alive', 'runtime', 'repo'],
  '👥 *GROUP*': ['add', 'kick', 'kickall', 'promote', 'demote', 'mute', 'unmute', 'lockgroup', 'unlockgroup', 'revoke', 'grouplink', 'setname', 'setdesc', 'setgcpp', 'gcstatus', 'newgroup', 'leavegc', 'groupinfo', 'staff', 'jid', 'tagall', 'tag', 'hidetag', 'tagadmins', 'online', 'onlineusers', 'onlineadmins', 'onlinestats', 'welcome', 'goodbye', 'rules', 'poll', 'afk', 'couple', 'antilink', 'antitag', 'antigroupmention', 'antigroupstatus', 'antibot', 'antibadword', 'antispam', 'slowmode', 'warn', 'warnings', 'antifakenumber', 'adminalerts', 'antiword', 'enable', 'disable', 'lockat', 'unlockat', 'cancellock', 'cancelunlock', 'acceptall', 'rejectall', 'listrequest', 'linkinfo', 'fullgroupphoto', 'checkwarn', 'resetwarn', 'gcset', 'tagnotadmin'],
  '🤖 *AI*': ['ai', 'gpt', 'qwen', 'allam', 'imagine', 'flux', 'dalle', 'txt2video', 'sora', 'imageedit', 'diffusion'],
  '📥 *DOWNLOADER*': ['play', 'song', 'music', 'ytmp3', 'mp3', 'ytmp4', 'video', 'instagram', 'tiktok', 'tt', 'facebook', 'fb', 'pinterest', 'anime', 'movie', 'gitclone', 'apk', 'pixabay', 'gif', 'tourl', 'mediafire', 'xdown', 'ytdoc', 'ringtone', 'wikimedia'],
  '🎚️ *AUDIO*': ['bass', 'deep', 'blown', 'earrape', 'fast', 'slow', 'fat', 'squirrel', 'nightcore', 'robot', 'areverse', '8d', 'echo', 'reverb', 'vibrato', 'tremolo', 'radio', 'alien', 'audiofx', 'tomp3', 'tts'],
  '🎨 *CONVERTER*': ['sticker', 's', 'simage', 'toimg', 'removebg', 'upscale', 'take', 'attp', 'qc', 'emojimix', 'tgsticker', 'blur', 'meme', 'getpp', 'wasted', 'character', 'crop', 'circle', 'round', 'ttp', 'brat', 'memegen', 'tomp4', 'tovn'],
  '🔤 *LOGO MAKER*': ['fancy', 'gfx', 'gfx2', 'gfx3', 'gfx4', 'gfx5', 'gfx6', 'gfx7', 'gfx8', 'gfx9', 'gfx10', 'gfx11', 'gfx12', 'metallic', 'ice', 'snow', 'impressive', 'matrix', 'neon', 'light', 'devil', 'purple', 'thunder', 'leaves', '1917', 'arena', 'hacker', 'sand', 'blackpink', 'glitch', 'fire', 'slice', 'glow', 'gitch1', 'steal', 'avenger', 'marvel', 'glitch2', 'grafiti'],
  '🛠️ *TOOLS*': ['ss', 'ssweb', 'translate', 'tr', 'qrcode', 'qr', 'shorturl', 'urlshortener', 'calculator', 'calc', 'hash', 'base64', 'binary', 'encrypt', 'decrypt', 'timestamp', 'currency', 'crypto', 'weather', 'news', 'livescore', 'reminder', 'lyrics', 'count', 'reverse', 'case', 'palindrome', 'age', 'vv', 'vv2', 'delete', 'savecontact', 'device', 'netflix', 'paste', 'fliptext', 'binarytotext', 'readmore', 'cpu', 'npm', 'imdb', 'horo', 'google', 'image', 'define', 'grayscale', 'invert', 'sepia', 'sharpen', 'readqr', 'qmaker', 'smallcaps', 'flip', 'stext', 'ephoto', 'excard', 'forwarded', 'wiki', 'element', 'wattpad', 'ytsearch', 'scloud', 'shazam'],
  '🕵️ *STALK*': ['gitstalk', 'npmstalk', 'tgstalk', 'ttstalk', 'xstalk', 'thrstalk', 'pinstalk', 'genshin'],
  '🎮 *GAMES*': ['trivia', 'scramble', 'wordle', 'hangman', 'guess', 'ttt', 'tictactoe', 'wyr', 'rps', 'slots', 'truth', 'dare', 'riddle', '8ball', 'dice', 'coin', 'random', 'pick'],
  '🎯 *FUN*': ['joke', 'fact', 'quote', 'compliment', 'insult', 'roast', 'flirt', 'ship', 'simp', 'stupid', 'shayari', 'goodnight', 'roseday', 'iloveyou', 'couplepp', 'coffe', 'quotes', 'joke2', 'question', 'teddy', 'lovemsg'],
  '🖼️ *PIES*': ['pies', 'india', 'china', 'japan', 'korea', 'thai', 'malaysia'],
  '🌸 *ANIME*': ['pokemon', 'pokepic', 'animepic', 'animewall', 'wallpaper', 'animenews'],
  '👑 *PREMIUM*': ['premium', 'setbotpp', 'autoreply', 'away', 'schedule', 'filter', 'persona', 'ghost', 'chreact', 'pollvote']
};

function buildMenu(ping = 0) {
  const total = Object.values(CATEGORIES).flat().length;
  let t = `╔════════◇◆◇═══════╗
├ *❄️🌹𝐊𝐄𝐋𝐕𝐈𝐍 𝐁𝐎𝐓🌹❄️*
├▢👑 Owner: *𝕶𝖊𝖑𝖛𝖎𝖓 𝖂𝖆𝖍𝖆𝖇*
├▢🕐 *${new Date().toLocaleString()}*
├▢⏱️ Uptime: *${fmtUptime(Date.now() - startTime)}*
├▢📶 Ping: *${ping}ms*
├▢🔖 Version: *${config.version}*
├▢📚 Commands: *${total}*
├▢🔧 Mode: *${mode}*
╚════════◇◆◇═══════╝\n`;
  for (const [cat, cmds] of Object.entries(CATEGORIES)) {
    t += `\n╔═══════════════╗\n  ${cat}\n╠───────────────╣\n`;
    t += cmds.map((c) => `║ ➣ *${prefix}${c}*`).join('\n');
    t += `\n╚═══════════════╝\n`;
  }
  t += `\n╔══════════════════╗\n        *ABOUT US*\n╠──────────────────╣\n *MultiDevice WhatsApp Bot ❤️‍🔥*\n  Creator: *Kelvin Wahab*\n Thanks For Using Our Bot🙏\n╚══════════════════╝`;
  return t;
}

async function sendMenu(sock, jid, quoted) {
  const caption = buildMenu(Math.floor(Math.random() * 5) + 1);
  const opts = quoted ? { quoted } : {};
  if (fs.existsSync(config.image)) {
    await sock.sendMessage(jid, { image: fs.readFileSync(config.image), caption }, opts);
  } else {
    await sock.sendMessage(jid, { text: caption }, opts);
  }
}

// ---------- HELPERS ----------
function unwrapViewOnce(m) {
  if (!m) return null;
  const inner = m.viewOnceMessageV2?.message || m.viewOnceMessage?.message ||
    m.viewOnceMessageV2Extension?.message || m;
  if (inner.imageMessage || inner.videoMessage || inner.audioMessage) return inner;
  return null;
}

async function isAdmin(sock, groupJid, userJid) {
  const meta = await sock.groupMetadata(groupJid);
  const p = meta.participants.find((x) => jidNormalizedUser(x.id) === jidNormalizedUser(userJid) || x.lid === userJid);
  return { meta, admin: !!p?.admin };
}

const pickRand = (a) => a[Math.floor(Math.random() * a.length)];
const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'I told my phone I needed space. Now it won’t stop sending me storage warnings.',
  'Why did the bot cross the road? To get to the other chat.'
];
const FACTS = [
  'Honey never spoils.', 'Octopuses have three hearts.',
  'Bananas are berries, but strawberries are not.', 'A day on Venus is longer than its year.'
];
const QUOTES = [
  'The best way to predict the future is to create it.',
  'Small steps every day lead to big results.',
  'Done is better than perfect.'
];
const BALL = ['Yes.', 'No.', 'Maybe.', 'Definitely!', 'Ask again later.', 'Very doubtful.'];

// ---------- COMMANDS ----------
async function handleCommand(sock, msg, ownerJid) {
  const jid = msg.key.remoteJid;
  const m = msg.message;
  const body = m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || m?.videoMessage?.caption || '';
  if (!body.startsWith(prefix)) return;

  const sender = jidNormalizedUser(msg.key.participant || msg.participant || (msg.key.fromMe ? ownerJid : jid));
  const isOwner = msg.key.fromMe || sender === ownerJid;
  if (mode === 'self' && !isOwner) return;

  const [cmdRaw, ...args] = body.slice(prefix.length).trim().split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const text = args.join(' ');
  const isGroup = jid.endsWith('@g.us');
  const reply = (t) => sock.sendMessage(jid, { text: t }, { quoted: msg });
  const ctx = m?.extendedTextMessage?.contextInfo;

  switch (cmd) {
    // BOT
    case 'menu': case 'help': return sendMenu(sock, jid, msg);
    case 'ping': {
      const t = Date.now();
      await reply('🏓 Pong!');
      return reply(`⚡ ${Date.now() - t}ms`);
    }
    case 'alive': return reply(`💚 *${config.botName}* is alive!\n⏱️ Uptime: ${fmtUptime(Date.now() - startTime)}`);
    case 'runtime': return reply(`⏱️ Uptime: *${fmtUptime(Date.now() - startTime)}*`);
    case 'owner': return reply(`👑 Owner: *${config.ownerName}*\nwa.me/${ownerJid.split('@')[0]}`);

    // OWNER
    case 'mode':
      if (!isOwner) return reply('❌ Owner only.');
      if (!['public', 'self'].includes(text)) return reply(`Usage: ${prefix}mode public|self\nCurrent: ${mode}`);
      mode = text; return reply(`✅ Mode set to *${mode}*`);
    case 'setprefix':
      if (!isOwner) return reply('❌ Owner only.');
      if (!text) return reply(`Usage: ${prefix}setprefix <symbol>`);
      prefix = text[0]; return reply(`✅ Prefix is now *${prefix}*`);

    // VIEW ONCE / SAVE → sends to your DM
    case 'viewonce': case 'vv': case 'save': {
      if (!isOwner) return reply('❌ Owner only.');
      const quoted = ctx?.quotedMessage;
      const inner = unwrapViewOnce(quoted);
      if (!inner) return reply(`↩️ Reply to a *view once* photo/video/voice note with *${prefix}viewonce*`);
      try {
        const fake = {
          key: { remoteJid: jid, id: ctx.stanzaId, participant: ctx.participant, fromMe: false },
          message: inner
        };
        const buf = await downloadMediaMessage(fake, 'buffer', {}, {
          logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage
        });
        const cap = `👁️ Saved by ${config.botName}`;
        if (inner.imageMessage) await sock.sendMessage(ownerJid, { image: buf, caption: inner.imageMessage.caption || cap });
        else if (inner.videoMessage) await sock.sendMessage(ownerJid, { video: buf, caption: inner.videoMessage.caption || cap });
        else await sock.sendMessage(ownerJid, { audio: buf, mimetype: 'audio/mp4', ptt: true });
        if (jid !== ownerJid) await reply('✅ Saved to your DM.');
      } catch (e) {
        console.error(e);
        await reply('❌ Could not download it (it may have expired or already been opened).');
      }
      return;
    }

    // GROUP
    case 'kick': case 'promote': case 'demote': {
      if (!isGroup) return reply('❌ Groups only.');
      const { admin } = await isAdmin(sock, jid, sender);
      if (!admin && !isOwner) return reply('❌ Admins only.');
      const target = ctx?.mentionedJid?.[0] || ctx?.participant;
      if (!target) return reply('Mention or reply to a user.');
      const action = { kick: 'remove', promote: 'promote', demote: 'demote' }[cmd];
      try { await sock.groupParticipantsUpdate(jid, [target], action); return reply('✅ Done.'); }
      catch { return reply('❌ Failed. Make sure I am a group admin.'); }
    }
    case 'mute': case 'unmute': {
      if (!isGroup) return reply('❌ Groups only.');
      const { admin } = await isAdmin(sock, jid, sender);
      if (!admin && !isOwner) return reply('❌ Admins only.');
      try { await sock.groupSettingUpdate(jid, cmd === 'mute' ? 'announcement' : 'not_announcement'); return reply(cmd === 'mute' ? '🔇 Group muted.' : '🔊 Group unmuted.'); }
      catch { return reply('❌ I need to be an admin.'); }
    }
    case 'grouplink': {
      if (!isGroup) return reply('❌ Groups only.');
      try { return reply('🔗 https://chat.whatsapp.com/' + await sock.groupInviteCode(jid)); }
      catch { return reply('❌ I need to be an admin.'); }
    }
    case 'groupinfo': {
      if (!isGroup) return reply('❌ Groups only.');
      const meta = await sock.groupMetadata(jid);
      return reply(`👥 *${meta.subject}*\nMembers: ${meta.participants.length}\nAdmins: ${meta.participants.filter((p) => p.admin).length}\n\n${meta.desc || ''}`);
    }
    case 'tagall': case 'hidetag': {
      if (!isGroup) return reply('❌ Groups only.');
      const { meta, admin } = await isAdmin(sock, jid, sender);
      if (!admin && !isOwner) return reply('❌ Admins only.');
      const ids = meta.participants.map((p) => p.id);
      const out = cmd === 'tagall' ? `📢 ${text || 'Attention!'}\n\n` + ids.map((i) => '@' + i.split('@')[0]).join('\n') : (text || '👀');
      return sock.sendMessage(jid, { text: out, mentions: ids });
    }

    // TOOLS
    case 'calc': {
      if (!/^[0-9+\-*/().%\s^]+$/.test(text)) return reply('Usage: /calc 12*(3+4)');
      try { return reply(`🧮 ${text} = *${Function(`"use strict";return (${text.replace(/\^/g, '**')})`)()}*`); }
      catch { return reply('❌ Invalid expression.'); }
    }
    case 'base64': {
      const [mode2, ...rest] = args; const s = rest.join(' ');
      if (!['encode', 'decode'].includes(mode2) || !s) return reply(`Usage: ${prefix}base64 encode|decode <text>`);
      return reply(mode2 === 'encode' ? Buffer.from(s).toString('base64') : Buffer.from(s, 'base64').toString());
    }
    case 'binary': return reply(text ? [...text].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') : `Usage: ${prefix}binary <text>`);
    case 'reverse': return reply(text ? [...text].reverse().join('') : `Usage: ${prefix}reverse <text>`);
    case 'case': return reply(text ? `UPPER: ${text.toUpperCase()}\nlower: ${text.toLowerCase()}` : `Usage: ${prefix}case <text>`);
    case 'count': return reply(`🔢 Characters: ${text.length}\nWords: ${text.split(/\s+/).filter(Boolean).length}`);
    case 'age': {
      const d = new Date(text); if (isNaN(d)) return reply(`Usage: ${prefix}age 2000-05-21`);
      const y = Math.floor((Date.now() - d) / 31557600000); return reply(`🎂 You are *${y}* years old.`);
    }

    // GAMES
    case 'dice': return reply(`🎲 You rolled *${1 + Math.floor(Math.random() * 6)}*`);
    case 'coin': return reply(`🪙 *${pickRand(['Heads', 'Tails'])}*`);
    case '8ball': return reply(text ? `🎱 ${pickRand(BALL)}` : `Usage: ${prefix}8ball <question>`);
    case 'rps': {
      const c = ['rock', 'paper', 'scissors']; const me = text.toLowerCase(); const bot = pickRand(c);
      if (!c.includes(me)) return reply(`Usage: ${prefix}rps rock|paper|scissors`);
      const win = (me === 'rock' && bot === 'scissors') || (me === 'paper' && bot === 'rock') || (me === 'scissors' && bot === 'paper');
      return reply(`You: ${me}\nBot: ${bot}\n${me === bot ? '🤝 Draw' : win ? '🏆 You win!' : '😎 I win!'}`);
    }
    case 'pick': { const o = text.split(',').map((s) => s.trim()).filter(Boolean); return reply(o.length > 1 ? `🎯 ${pickRand(o)}` : `Usage: ${prefix}pick a, b, c`); }
    case 'random': return reply(`🔀 ${Math.floor(Math.random() * 100) + 1}`);

    // FUN
    case 'joke': return reply('😂 ' + pickRand(JOKES));
    case 'fact': return reply('📚 ' + pickRand(FACTS));
    case 'quote': return reply('💬 ' + pickRand(QUOTES));
  }
}

// ---------- WEB PAIRING PAGE ----------
const PORT = process.env.PORT || 3000;
let currentSock = null;
let linked = false;

const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kelvin bot</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#04110a;color:#fff;font-family:system-ui,sans-serif}
.c{width:90%;max-width:380px;text-align:center;padding:24px;border:2px solid #22c55e;border-radius:20px;box-shadow:0 0 30px #22c55e55}
img{width:140px;border-radius:50%}
h1{margin:8px 0;color:#4ade80}
input,button{width:100%;box-sizing:border-box;padding:14px;margin-top:12px;border-radius:12px;border:0;font-size:16px}
button{background:#22c55e;color:#000;font-weight:700}
#code{font-size:34px;letter-spacing:4px;color:#4ade80;margin-top:16px;font-weight:800}
small{color:#9ca3af}
</style></head><body><div class="c">
<img src="/logo.png"><h1>Kelvin bot</h1>
<p>Enter your WhatsApp number with country code (no +)</p>
<input id="n" type="tel" placeholder="2348012345678">
<button onclick="go()">Get pairing code</button>
<div id="code"></div><small id="msg"></small>
<p><small>Then: WhatsApp → Settings → Linked Devices → Link a device → Link with phone number instead → enter the code.</small></p>
</div><script>
async function go(){
  const n=document.getElementById('n').value;
  document.getElementById('msg').textContent='Please wait...';
  document.getElementById('code').textContent='';
  try{
    const r=await fetch('/code?number='+encodeURIComponent(n));
    const d=await r.json();
    if(d.code){document.getElementById('code').textContent=d.code;document.getElementById('msg').textContent='Enter this in WhatsApp now (valid ~1 minute)';}
    else document.getElementById('msg').textContent=d.error;
  }catch(e){document.getElementById('msg').textContent='Network error, try again';}
}
</script></body></html>`;

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/logo.png' && fs.existsSync(config.image)) {
    res.setHeader('Content-Type', 'image/png');
    return res.end(fs.readFileSync(config.image));
  }
  if (url.pathname === '/code') {
    res.setHeader('Content-Type', 'application/json');
    const send = (o) => res.end(JSON.stringify(o));
    const number = (url.searchParams.get('number') || '').replace(/\D/g, '');
    if (number.length < 8) return send({ error: 'Invalid number. Use country code, no + or spaces.' });
    if (linked) return send({ error: 'Bot is already linked to an account.' });
    if (!currentSock) return send({ error: 'Bot is starting, try again in a few seconds.' });
    try {
      const code = await currentSock.requestPairingCode(number);
      return send({ code: code.match(/.{1,4}/g).join('-') });
    } catch (e) {
      return send({ error: 'Failed to get code: ' + e.message });
    }
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(linked ? '<body style="background:#04110a;color:#4ade80;font-family:sans-serif;text-align:center;padding-top:20vh"><h1>✅ Kelvin bot is running</h1></body>' : PAGE);
}).listen(PORT, () => console.log('Web page running on port ' + PORT));

// ---------- CONNECTION ----------
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false
  });
  currentSock = sock;
  linked = !!sock.authState.creds.registered;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      linked = true;
      const ownerJid = jidNormalizedUser(sock.user.id);
      console.log(`✅ ${config.botName} connected as ${ownerJid}`);
      await sendMenu(sock, ownerJid);
      await sock.sendMessage(ownerJid, { text: `💚 *${config.botName}* is now active on your number!\nSend *${prefix}menu* anytime.\nReply to a view-once with *${prefix}viewonce* to save it here.` });
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log('Logged out. Clearing session.');
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        linked = false;
      }
      console.log('Reconnecting...');
      start();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const ownerJid = jidNormalizedUser(sock.user.id);
    for (const msg of messages) {
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;
      try { await handleCommand(sock, msg, ownerJid); } catch (e) { console.error('Command error:', e); }
    }
  });
}

start();
