[中文](guide.md) · [English](guide.en.md) · [日本語](guide.ja.md) · [한국어](guide.ko.md)

# Make an artwork your own

## Run one scene first

Choose an artwork and open `works/<slug>/index.html`. Watch the demonstration, then try the controls in the [artwork controls guide](works.en.md). Setup instructions are in the [README](../README.en.md#start).

| File | Purpose |
|---|---|
| `index.html` | Running artwork and controls |
| `source.html` | Read-only source viewer |
| `source.js` | Editable source |

Copy the whole artwork folder when reusing it. Keep the page, source and license in their relative locations.

## Start with one small change

1. Back up or copy the artwork folder.
2. Search `source.js` for its original Chinese title or scene identifier. The Chinese per-artwork README also gives a starting line number.
3. Find the scene module and inspect its `init`, `tick`, `draw` or corresponding functions.
4. Change one color, size or speed parameter. Refresh the running page and check the result before changing more.
5. Check both demonstration and manual operation.

The file also contains shared drawing and playback helpers. Preserve those dependencies while changing the artwork module.

## Ideas to try

| Artwork | First change | Check afterward |
|---|---|---|
| Night Pond | Change the night palette to sunset | Ripples, reflections and koi still respond |
| Ferrofluid | Change the liquid and highlights | Spikes and reflections remain continuous |
| Living Jigsaw | Recolor the assembled sky and buildings | Assembly and traffic still connect |
| Sunset Loop | Change the sky and road colors | Perspective, driving and camera still work |
| Galaxy Collision | Change the galaxy colors and scene parameters | Trails stay continuous and performance is acceptable |

These are starting ideas, not a guarantee that every coding model will reproduce the same result.

## Work with a coding assistant

The original project used Claude-assisted programming. Give GPT, Gemini or another assistant a **complete artwork folder**, a specific goal and the behavior to preserve.

```text
Target: Night Pond.
Read index.html, source.js and the README, then explain how the scene runs.
Change the night palette to sunset while preserving ripples, feeding, fish movement, demo and pause.
Only modify this scene's code. Do not add external APIs, images, fonts or dependencies.
Explain the changes and check both demo and manual operation.
```

Ask for an explanation before making changes, and always inspect the result in a browser.

## Common questions

**The page is blank or looks wrong after opening the file.** Run `python -m http.server 8080 --bind 127.0.0.1` from the repository folder, then open [the local gallery](http://127.0.0.1:8080). Check that `source.js` is beside `index.html`.

**There is no sound.** Your browser may require a click on the page or sound control. Some artworks have no audio.

**Phone controls are difficult.** Touch support varies. Combat and driving mainly target a desktop keyboard and mouse; consult each scene's controls.

**Some text is Chinese.** These translations cover repository documentation and controls. In-scene labels, source comments and original per-artwork descriptions remain primarily Chinese.

**The image changes between computers or restarts.** System fonts and random processes can cause differences.

**Can I reuse the code?** It is provided under [MIT](../LICENSE); retain the copyright and license text.

[Back to the gallery](../README.en.md#gallery)
