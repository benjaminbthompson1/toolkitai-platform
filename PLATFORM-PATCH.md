# Add Squishaloo to the Toolkit AI platform (toolkitai-platform repo)

Three small edits in the platform repo, plus three images. Nothing else in the
platform changes: login, sessions and admin stay exactly as they are.

## 1. Copy the images

Copy the `public/portal/img/` folder from this patch into the platform repo's
`public/portal/img/` (next to the Shell Yeah! images). They're served at
`/portal-assets/img/...`.

- `squishaloo-logo.png` – card header banner (900×350)
- `squishaloo-1.jpg` – home screen screenshot
- `squishaloo-2.jpg` – gameplay screenshot

## 2. Signed-in home: add a Squishaloo tile (`src/routes/portal.js`)

Find the `GAMES` array (it currently holds only Shell Yeah!) and add this entry
after the Shell Yeah! object. Squishaloo is on the same domain, so
`external` is `false` and it opens in the same tab.

```js
  {
    id: 'squishaloo', name: 'Squishaloo', url: '/squishaloo/', external: false,
    description: 'Squish the squishies. Collect them all!',
    icon: `<svg class="app-tile-icon" width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="squishBgPortal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8ff0d4"/><stop offset="100%" stop-color="#3fb2ff"/></linearGradient>
        <radialGradient id="squishBlobPortal" cx="0.35" cy="0.3" r="0.8"><stop offset="0%" stop-color="#ffc4dc"/><stop offset="50%" stop-color="#ff5c9d"/><stop offset="100%" stop-color="#cf2d72"/></radialGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#squishBgPortal)"/>
      <path d="M50 22 C72 22 82 38 82 56 C82 72 68 80 50 80 C32 80 18 72 18 56 C18 38 28 22 50 22 Z" fill="url(#squishBlobPortal)"/>
      <ellipse cx="38" cy="36" rx="8" ry="4.5" fill="#fff" opacity=".75" transform="rotate(-30 38 36)"/>
      <circle cx="40" cy="52" r="6" fill="#fff"/><circle cx="60" cy="52" r="6" fill="#fff"/>
      <circle cx="41" cy="53" r="3.4" fill="#2a1b52"/><circle cx="61" cy="53" r="3.4" fill="#2a1b52"/>
      <path d="M44 63 Q50 69 56 63" stroke="#2a1b52" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  }
```

## 3. Public landing page: add a Squishaloo card to the Games section (`src/routes/portal.js`)

In the `<section class="pub-section" id="games">` block, add this card inside
the same `info-grid`, after the Shell Yeah! card. It uses the same classes as
the Shell Yeah! card, so it's the same size.

```html
        <div class="info-card">
          <div class="info-card-head">
            <img class="game-icon" src="/portal-assets/img/squishaloo-logo.png" alt="Squishaloo logo: Squish the squishies. Collect them all!" width="450" height="175">
          </div>
          <h3 class="info-card-title">Squishaloo</h3>
          <p>Squishaloo is a squishy game for kids. Tap jelly squishies to squish them across 40 levels in four worlds, from Gummy Meadow to Starlight Jelly. Squish hearts, strawberries, fish, gummy bears, butter, toast, stars and more, hunt for rare capybara, bunny and paw squishies, chain combos, dodge spiky Grumps, beat the Mega Chonk boss and fill your sticker book. Progress is saved to your Toolkit AI account.</p>
          <div class="shot-links">
            <a href="/portal-assets/img/squishaloo-1.jpg" target="_blank" rel="noopener" aria-label="Open Squishaloo screenshot 1 full size"><img src="/portal-assets/img/squishaloo-1.jpg" alt="Squishaloo screenshot: the home screen with colorful squishies floating around" loading="lazy"></a>
            <a href="/portal-assets/img/squishaloo-2.jpg" target="_blank" rel="noopener" aria-label="Open Squishaloo screenshot 2 full size"><img src="/portal-assets/img/squishaloo-2.jpg" alt="Squishaloo screenshot: a level in Gummy Meadow with a timer, hearts and power-ups" loading="lazy"></a>
          </div>
          <a class="link" href="/squishaloo/">${user ? 'Play Squishaloo' : 'Sign in to play Squishaloo'} &rarr;</a>
        </div>
```

If the Games section's grid is still the single-card `game-card` layout instead
of `info-grid`, wrap both game cards in `<div class="info-grid">…</div>`.

## 4. Privacy policy (`src/legal.js`)

In the Games part of the privacy policy, add:

```html
<p><strong>Squishaloo.</strong> Squishaloo requires a Toolkit AI account. We store your game progress (levels, stars, stickers, in-game items and settings) linked to your account so you can continue on any device. Squishaloo has no chat, no public leaderboard and no third-party advertising or analytics. Squishaloo is intended to be played by children under the supervision of the parent or guardian who holds the account.</p>
```

## 5. Login redirect

Signed-out visitors to `/squishaloo/` are sent to `/login?next=%2Fsquishaloo%2F`.
The platform login already honors `next` for Scanline; if it only allows a fixed
list of paths, add `/squishaloo/` to that list.
