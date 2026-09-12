# Gospel Foundations site

Static site generator. `node build.js` reads `lessons.js` (all 12 lessons at summary depth)
and `deep.js` (expanded content per lesson) and writes `public/`.

Files that matter:
- assets/site.css, assets/site.js  (styling, timer, presenter mode, polls, quiz)
- build.js                          (page templates)
- lessons.js                        (lesson data)
- deep.js                           (deep content; currently Lessons 1-4)
- vercel.json                       (build settings)

Deploy: push to the GitHub repo connected to the Vercel project `gospel-foundations`.
Vercel runs `node build.js` and serves `public/`.
