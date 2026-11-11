# Kelvin_bot (web pairing version)

Deploy on any Node.js host (Render, Koyeb, Railway, Replit, or a bot panel).
- Build command: npm install
- Start command: npm start
- Open the host's public URL, enter your number, get the pairing code on the page,
  then WhatsApp > Linked Devices > Link with phone number instead.
- Kelvin_bot then DMs you the menu. Use /viewonce by replying to a view-once.

One deployment = one linked WhatsApp account. Keep the ./session folder (use a
persistent disk) or you must re-link after every restart.
