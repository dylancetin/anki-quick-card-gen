export const colTableValues = {
  id: 1,
  // these are from an example .apkg
  // crt: 1692925200,
  // mod: 1741941550637,
  // scm: 1741941550635,
  ver: 11,
  dty: 0,
  usn: 0,
  ls: 0,
  conf: {
    schedVer: 2,
    dayLearnFirst: false,
    estTimes: true,
    nextPos: 1,
    addToCur: true,
    collapseTime: 1200,
    curModel: 1741941550636,
    sched2021: true,
    creationOffset: -180,
    sortType: "noteFld",
    activeDecks: [1],
    dueCounts: true,
    sortBackwards: false,
    timeLim: 0,
    newSpread: 0,
    curDeck: 1,
  },
  models: {
    "1746001256852": {
      id: 1746001256852,
      name: "KaTeX and Markdown Basic",
      type: 0,
      mod: 1746001704,
      usn: -1,
      sortf: 0,
      did: null,
      tmpls: [
        {
          name: "KaTeX and Markdown Basic",
          ord: 0,
          qfmt: '\n\n<div id="front"><pre>{{Front}}</pre></div>\n\n<script>\n\tvar getResources = [\n\t\tgetCSS("_katex.css", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"),\n\t\tgetCSS("_highlight.css", "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/styles/default.min.css"),\n\t\tgetScript("_highlight.js", "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/highlight.min.js"),\n\t\tgetScript("_katex.min.js", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"),\n\t\tgetScript("_auto-render.js", "https://cdn.jsdelivr.net/gh/Jwrede/Anki-KaTeX-Markdown/auto-render-cdn.js"),\n\t\tgetScript("_markdown-it.min.js", "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.0.4/markdown-it.min.js"),\n                getScript("_markdown-it-mark.js","https://cdn.jsdelivr.net/gh/Jwrede/Anki-KaTeX-Markdown/_markdown-it-mark.js")\n\t];\n        Promise.all(getResources).then(() => getScript("_mhchem.js", "https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/contrib/mhchem.min.js")).then(render).catch(show);\n\t\n\n\tfunction getScript(path, altURL) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tlet script = document.createElement("script");\n\t\t\tscript.onload = resolve;\n\t\t\tscript.onerror = function() {\n\t\t\t\tlet script_online = document.createElement("script");\n\t\t\t\tscript_online.onload = resolve;\n\t\t\t\tscript_online.onerror = reject;\n\t\t\t\tscript_online.src = altURL;\n\t\t\t\tdocument.head.appendChild(script_online);\n\t\t\t}\n\t\t\tscript.src = path;\n\t\t\tdocument.head.appendChild(script);\n\t\t})\n\t}\n\n\tfunction getCSS(path, altURL) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tvar css = document.createElement(\'link\');\n\t\t\tcss.setAttribute(\'rel\', \'stylesheet\');\n\t\t\tcss.type = \'text/css\';\n\t\t\tcss.onload = resolve;\n\t\t\tcss.onerror = function() {\n\t\t\t\tvar css_online = document.createElement(\'link\');\n\t\t\t\tcss_online.setAttribute(\'rel\', \'stylesheet\');\n\t\t\t\tcss_online.type = \'text/css\';\n\t\t\t\tcss_online.onload = resolve;\n\t\t\t\tcss.onerror = reject;\n\t\t\t\tcss_online.href = altURL;\n\t\t\t\tdocument.head.appendChild(css_online);\n\t\t\t}\n\t\t\tcss.href = path;\n\t\t\tdocument.head.appendChild(css);\n\t\t});\n\t}\n\n\n\tfunction render() {\n\t\trenderMath("front");\n\t\tmarkdown("front");\n\t\tshow();\n\t}\n\n\tfunction show() {\n\t\tdocument.getElementById("front").style.visibility = "visible";\n\t}\n\n\tfunction renderMath(ID) {\n\t\tlet text = document.getElementById(ID).innerHTML;\n\t\ttext = replaceInString(text);\n\t\tdocument.getElementById(ID).textContent = text;\n\t\trenderMathInElement(document.getElementById(ID), {\n\t\t\tdelimiters:  [\n  \t\t\t\t{left: "$$", right: "$$", display: true},\n  \t\t\t\t{left: "$", right: "$", display: false}\n\t\t\t],\n            throwOnError : false\n\t\t});\n\t}\n\n\tfunction markdown(ID) {\n\t\tlet md = new markdownit({typographer: true, html:true, highlight: function (str, lang) {\n                            if (lang && hljs.getLanguage(lang)) {\n                                try {\n                                    return hljs.highlight(str, { language: lang }).value;\n                                } catch (__) {}\n                            }\n\n                            return \'\'; // use external default escaping\n                        }}).use(markdownItMark);\n\t\tlet text = replaceHTMLElementsInString(document.getElementById(ID).innerHTML);\n\t\ttext = md.render(text);\n\t\tdocument.getElementById(ID).innerHTML = text.replace(/&lt;\\/span&gt;/gi,"\\\\");\n\t}\n\tfunction replaceInString(str) {\n\t\tstr = str.replace(/<[\\/]?pre[^>]*>/gi, "");\n\t\tstr = str.replace(/<br\\s*[\\/]?[^>]*>/gi, "\\n");\n\t\tstr = str.replace(/<div[^>]*>/gi, "\\n");\n\t\t// Thanks Graham A!\n\t\tstr = str.replace(/<[\\/]?span[^>]*>/gi, "")\n\t\tstr.replace(/<\\/div[^>]*>/g, "\\n");\n\t\treturn replaceHTMLElementsInString(str);\n\t}\n\n\tfunction replaceHTMLElementsInString(str) {\n\t\tstr = str.replace(/&nbsp;/gi, " ");\n\t\tstr = str.replace(/&tab;/gi, "\t");\n\t\tstr = str.replace(/&gt;/gi, ">");\n\t\tstr = str.replace(/&lt;/gi, "<");\n\t\treturn str.replace(/&amp;/gi, "&");\n\t}\n</script>\n',
          afmt: '\n\n<div id="front"><pre>{{Front}}</pre></div>\n\n<hr id=answer>\n\n<div id="back"><pre>{{Back}}</pre></div>\n\n<script>\n\tvar getResources = [\n\t\tgetCSS("_katex.css", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"),\n\t\tgetCSS("_highlight.css", "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/styles/default.min.css"),\n\t\tgetScript("_highlight.js", "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.0.1/highlight.min.js"),\n\t\tgetScript("_katex.min.js", "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"),\n\t\tgetScript("_auto-render.js", "https://cdn.jsdelivr.net/gh/Jwrede/Anki-KaTeX-Markdown/auto-render-cdn.js"),\n\t\tgetScript("_markdown-it.min.js", "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.0.4/markdown-it.min.js"),\n\t\tgetScript("_markdown-it-mark.js","https://cdn.jsdelivr.net/gh/Jwrede/Anki-KaTeX-Markdown/_markdown-it-mark.js")\n\t];\n        Promise.all(getResources).then(() => getScript("_mhchem.js", "https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/contrib/mhchem.min.js")).then(render).catch(show);\n\t\n\n\tfunction getScript(path, altURL) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tlet script = document.createElement("script");\n\t\t\tscript.onload = resolve;\n\t\t\tscript.onerror = function() {\n\t\t\t\tlet script_online = document.createElement("script");\n\t\t\t\tscript_online.onload = resolve;\n\t\t\t\tscript_online.onerror = reject;\n\t\t\t\tscript_online.src = altURL;\n\t\t\t\tdocument.head.appendChild(script_online);\n\t\t\t}\n\t\t\tscript.src = path;\n\t\t\tdocument.head.appendChild(script);\n\t\t})\n\t}\n\n\tfunction getCSS(path, altURL) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tvar css = document.createElement(\'link\');\n\t\t\tcss.setAttribute(\'rel\', \'stylesheet\');\n\t\t\tcss.type = \'text/css\';\n\t\t\tcss.onload = resolve;\n\t\t\tcss.onerror = function() {\n\t\t\t\tvar css_online = document.createElement(\'link\');\n\t\t\t\tcss_online.setAttribute(\'rel\', \'stylesheet\');\n\t\t\t\tcss_online.type = \'text/css\';\n\t\t\t\tcss_online.onload = resolve;\n\t\t\t\tcss_online.onerror = reject;\n\t\t\t\tcss_online.href = altURL;\n\t\t\t\tdocument.head.appendChild(css_online);\n\t\t\t}\n\t\t\tcss.href = path;\n\t\t\tdocument.head.appendChild(css);\n\t\t});\n\t}\n\n\tfunction render() {\n\t\trenderMath("front");\n\t\tmarkdown("front");\n\t\trenderMath("back");\n\t\tmarkdown("back");\n\t\tshow();\n\t}\n\n\tfunction show() {\n\t\tdocument.getElementById("front").style.visibility = "visible";\n\t\tdocument.getElementById("back").style.visibility = "visible";\n\t}\n\n\n\tfunction renderMath(ID) {\n\t\tlet text = document.getElementById(ID).innerHTML;\n\t\ttext = replaceInString(text);\n\t\tdocument.getElementById(ID).textContent = text;\n\t\trenderMathInElement(document.getElementById(ID), {\n\t\t\tdelimiters:  [\n  \t\t\t\t{left: "$$", right: "$$", display: true},\n  \t\t\t\t{left: "$", right: "$", display: false}\n\t\t\t],\n                        throwOnError : false\n\t\t});\n\t}\n\tfunction markdown(ID) {\n\t\tlet md = new markdownit({typographer: true, html:true, highlight: function (str, lang) {\n                            if (lang && hljs.getLanguage(lang)) {\n                                try {\n                                    return hljs.highlight(str, { language: lang }).value;\n                                } catch (__) {}\n                            }\n\n                            return \'\'; // use external default escaping\n                        }}).use(markdownItMark);\n\t\tlet text = replaceHTMLElementsInString(document.getElementById(ID).innerHTML);\n\t\ttext = md.render(text);\n\t\tdocument.getElementById(ID).innerHTML = text.replace(/&lt;\\/span&gt;/gi,"\\\\");\n\t}\n\tfunction replaceInString(str) {\n\t\tstr = str.replace(/<[\\/]?pre[^>]*>/gi, "");\n\t\tstr = str.replace(/<br\\s*[\\/]?[^>]*>/gi, "\\n");\n\t\tstr = str.replace(/<div[^>]*>/gi, "\\n");\n\t\t// Thanks Graham A!\n\t\tstr = str.replace(/<[\\/]?span[^>]*>/gi, "")\n\t\tstr.replace(/<\\/div[^>]*>/g, "\\n");\n\t\treturn replaceHTMLElementsInString(str);\n\t}\n\n\tfunction replaceHTMLElementsInString(str) {\n\t\tstr = str.replace(/&nbsp;/gi, " ");\n\t\tstr = str.replace(/&tab;/gi, "\t");\n\t\tstr = str.replace(/&gt;/gi, ">");\n\t\tstr = str.replace(/&lt;/gi, "<");\n\t\treturn str.replace(/&amp;/gi, "&");\n\t}\n</script>\n',
          bqfmt: "",
          bafmt: "",
          did: null,
          bfont: "",
          bsize: 0,
          id: 3229389281819856598,
        },
      ],
      flds: [
        {
          name: "Front",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: -4517916599208479691,
          tag: null,
          preventDeletion: false,
        },
        {
          name: "Back",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: 5292433369860321476,
          tag: null,
          preventDeletion: false,
        },
      ],
      css: "\n\n.card {\n  font-family: arial;\n  font-size: 20px;\n  color: black;\n  background-color: white;\n}\ntable, th, td {\n\tborder: 1px solid black;\n\tborder-collapse: collapse;\n}\n#front, #back, #extra {\n\tvisibility: hidden;\n}\npre code {\n  background-color: #eee;\n  border: 1px solid #999;\n  display: block;\n  padding: 20px;\n  overflow: auto;\n}\n",
      latexPre:
        "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      latexPost: "\\end{document}",
      latexsvg: false,
      req: [[0, "any", [0]]],
      originalStockKind: 1,
    },
    "1711892431823": {
      id: 1711892431823,
      name: "Image Occlusion",
      type: 1,
      mod: 1737635749,
      usn: 0,
      sortf: 0,
      did: null,
      tmpls: [
        {
          name: "Image Occlusion",
          ord: 0,
          qfmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n',
          afmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n\n<div><button id="toggle">Toggle Masks</button></div>\n{{#Back Extra}}<div>{{Back Extra}}</div>{{/Back Extra}}\n',
          bqfmt: "",
          bafmt: "",
          did: null,
          bfont: "",
          bsize: 0,
          id: -7486573076461009266,
        },
      ],
      flds: [
        {
          name: "Occlusion",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: 7787621809648212376,
          tag: 0,
          preventDeletion: true,
        },
        {
          name: "Image",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: -5262007660156621727,
          tag: 1,
          preventDeletion: true,
        },
        {
          name: "Header",
          ord: 2,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "hi",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: 2091943638272366215,
          tag: 2,
          preventDeletion: true,
        },
        {
          name: "Back Extra",
          ord: 3,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: -8751572109826615077,
          tag: 3,
          preventDeletion: true,
        },
        {
          name: "Comments",
          ord: 4,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: -4758395342683967347,
          tag: 4,
          preventDeletion: false,
        },
      ],
      css: "#image-occlusion-canvas {\n    --inactive-shape-color: #ffeba2;\n    --active-shape-color: #ff8e8e;\n    --inactive-shape-border: 1px #212121;\n    --active-shape-border: 1px #212121;\n}\n\n.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
      latexPre:
        "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      latexPost: "\\end{document}",
      latexsvg: false,
      req: [[0, "any", [0, 1, 2]]],
      originalStockKind: 6,
    },
    "1692999971515": {
      id: 1692999971515,
      name: "Type-in",
      type: 0,
      mod: 1737638496,
      usn: 0,
      sortf: 0,
      did: null,
      tmpls: [
        {
          name: "Card 1",
          ord: 0,
          qfmt: "{{Front}}\n\n{{type:Back}}",
          afmt: "{{Front}}\n\n<hr id=answer>\n\n{{type:Back}}",
          bqfmt: "",
          bafmt: "",
          did: null,
          bfont: "",
          bsize: 0,
          id: null,
        },
      ],
      flds: [
        {
          name: "Front",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: null,
          tag: null,
          preventDeletion: false,
        },
        {
          name: "Back",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Arial",
          size: 20,
          description: "",
          plainText: false,
          collapsed: false,
          excludeFromSearch: false,
          id: null,
          tag: null,
          preventDeletion: false,
        },
      ],
      css: ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
      latexPre:
        "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
      latexPost: "\\end{document}",
      latexsvg: false,
      req: [[0, "any", [0, 1]]],
      originalStockKind: 3,
    },
  },
  decks: {
    "1741886387121": {
      id: 1741886387121,
      mod: 1741886387,
      name: "endokrin-sistemi",
      usn: 17,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: false,
      browserCollapsed: false,
      desc: "",
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
      reviewLimit: null,
      newLimit: null,
      reviewLimitToday: null,
      newLimitToday: null,
    },
    "1": {
      id: 1,
      mod: 0,
      name: "Default",
      usn: 0,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: true,
      browserCollapsed: true,
      desc: "",
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
      reviewLimit: null,
      newLimit: null,
      reviewLimitToday: null,
      newLimitToday: null,
    },
    "1741941370516": {
      id: 1741941370516,
      mod: 1741941370,
      name: "test-deck",
      usn: -1,
      lrnToday: [0, 0],
      revToday: [0, 0],
      newToday: [0, 0],
      timeToday: [0, 0],
      collapsed: false,
      browserCollapsed: false,
      desc: "",
      dyn: 0,
      conf: 1,
      extendNew: 0,
      extendRev: 0,
      reviewLimit: null,
      newLimit: null,
      reviewLimitToday: null,
      newLimitToday: null,
    },
  },
  dconf: {
    "1": {
      id: 1,
      mod: 0,
      name: "Default",
      usn: 0,
      maxTaken: 60,
      autoplay: true,
      timer: 0,
      replayq: true,
      new: {
        bury: false,
        delays: [1.0, 10.0],
        initialFactor: 2500,
        ints: [1, 4, 0],
        order: 1,
        perDay: 20,
      },
      rev: {
        bury: false,
        ease4: 1.3,
        ivlFct: 1.0,
        maxIvl: 36500,
        perDay: 200,
        hardFactor: 1.2,
      },
      lapse: {
        delays: [10.0],
        leechAction: 1,
        leechFails: 8,
        minInt: 1,
        mult: 0.0,
      },
      dyn: false,
      newMix: 0,
      newPerDayMinimum: 0,
      interdayLearningMix: 0,
      reviewOrder: 0,
      newSortOrder: 0,
      newGatherPriority: 0,
      buryInterdayLearning: false,
      fsrsWeights: [],
      fsrsParams5: [],
      desiredRetention: 0.9,
      ignoreRevlogsBeforeDate: "",
      easyDaysPercentages: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      stopTimerOnAnswer: false,
      secondsToShowQuestion: 0.0,
      secondsToShowAnswer: 0.0,
      questionAction: 0,
      answerAction: 0,
      waitForAudio: true,
      sm2Retention: 0.9,
      weightSearch: "",
    },
  },
  tags: "{}",
};
const a = {
  "1741952549272": {
    id: 1741952549272,
    name: "Image Occlusion+",
    type: 1,
    mod: 1741952549,
    usn: 20,
    sortf: 0,
    did: null,
    tmpls: [
      {
        name: "Image Occlusion",
        ord: 0,
        qfmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n',
        afmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n\n<div><button id="toggle">Toggle Masks</button></div>\n{{#Back Extra}}<div>{{Back Extra}}</div>{{/Back Extra}}\n',
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: -7486573076461009000,
      },
    ],
    flds: [
      {
        name: "Occlusion",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 7787621809648212000,
        tag: 0,
        preventDeletion: true,
      },
      {
        name: "Image",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -5262007660156622000,
        tag: 1,
        preventDeletion: true,
      },
      {
        name: "Header",
        ord: 2,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "hi",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 2091943638272366300,
        tag: 2,
        preventDeletion: true,
      },
      {
        name: "Back Extra",
        ord: 3,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -8751572109826615000,
        tag: 3,
        preventDeletion: true,
      },
      {
        name: "Comments",
        ord: 4,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -4758395342683967000,
        tag: 4,
        preventDeletion: false,
      },
    ],
    css: "#image-occlusion-canvas {\n    --inactive-shape-color: #ffeba2;\n    --active-shape-color: #ff8e8e;\n    --inactive-shape-border: 1px #212121;\n    --active-shape-border: 1px #212121;\n}\n\n.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
    latexPre:
      "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [[0, "any", [0, 1, 2]]],
    originalStockKind: 6,
    originalId: 1711892431823,
  },
  "1692999971515": {
    id: 1692999971515,
    name: "Type-in",
    type: 0,
    mod: 1737638496,
    usn: 0,
    sortf: 0,
    did: null,
    tmpls: [
      {
        name: "Card 1",
        ord: 0,
        qfmt: "{{Front}}\n\n{{type:Back}}",
        afmt: "{{Front}}\n\n<hr id=answer>\n\n{{type:Back}}",
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: null,
      },
    ],
    flds: [
      {
        name: "Front",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "Back",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
    ],
    css: ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
    latexPre:
      "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [[0, "any", [0, 1]]],
    originalStockKind: 3,
  },
  "1692999971516": {
    id: 1692999971516,
    name: "Cloze",
    type: 1,
    mod: 0,
    usn: 0,
    sortf: 0,
    did: null,
    tmpls: [
      {
        name: "Cloze",
        ord: 0,
        qfmt: "{{cloze:Text}}",
        afmt: "{{cloze:Text}}<br>\n{{Back Extra}}",
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: null,
      },
    ],
    flds: [
      {
        name: "Text",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "Back Extra",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
    ],
    css: ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n.cloze {\n    font-weight: bold;\n    color: blue;\n}\n.nightMode .cloze {\n    color: lightblue;\n}\n",
    latexPre:
      "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [[0, "any", [0]]],
    originalStockKind: 5,
  },
  "1711892473612": {
    id: 1711892473612,
    name: "Basic Quizlet Extended",
    type: 0,
    mod: 1737635734,
    usn: 0,
    sortf: 0,
    did: 1733846856477,
    tmpls: [
      {
        name: "Normal",
        ord: 0,
        qfmt: "{{FrontText}}\n<br><br>\n{{FrontAudio}}",
        afmt: "{{FrontText}}\n<hr id=answer>\n{{BackText}}\n<br><br>\n{{Image}}\n<br><br>\n{{BackAudio}}",
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: -4328315614399838640,
      },
      {
        name: "Reverse",
        ord: 1,
        qfmt: "{{#Add Reverse}}{{BackText}}\n<br><br>\n{{BackAudio}}{{/Add Reverse}}",
        afmt: "{{BackText}}\n<hr id=answer>\n{{FrontText}}\n<br><br>\n{{FrontAudio}}\n{{Image}}",
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: 210317591353034379,
      },
    ],
    flds: [
      {
        name: "FrontText",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 7948343198340561735,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "FrontAudio",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -4234408970365342539,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "BackText",
        ord: 2,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 3431281601835338095,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "BackAudio",
        ord: 3,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -1282174477315843689,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "Image",
        ord: 4,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -5521888804314054485,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "Add Reverse",
        ord: 5,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 606409246718337549,
        tag: null,
        preventDeletion: false,
      },
    ],
    css: ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
    latexPre:
      "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [
      [0, "any", [0, 1]],
      [1, "all", [5]],
    ],
    originalStockKind: 1,
  },
  "1692999971512": {
    id: 1692999971512,
    name: "Basic",
    type: 0,
    mod: 1746001599,
    usn: -1,
    sortf: 0,
    did: null,
    tmpls: [
      {
        name: "Card 1",
        ord: 0,
        qfmt: "{{Front}}",
        afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: null,
      },
    ],
    flds: [
      {
        name: "Front",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
      {
        name: "Back",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: null,
        tag: null,
        preventDeletion: false,
      },
    ],
    css: ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
    latexPre:
      "f\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [[0, "any", [0]]],
    originalStockKind: 1,
  },
  "1711892431823": {
    id: 1711892431823,
    name: "Image Occlusion",
    type: 1,
    mod: 1741947757,
    usn: 20,
    sortf: 0,
    did: null,
    tmpls: [
      {
        name: "Image Occlusion",
        ord: 0,
        qfmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n',
        afmt: '{{#Header}}<div>{{Header}}</div>{{/Header}}\n<div style="display: none">{{cloze:Occlusion}}</div>\n<div id="err"></div>\n<div id="image-occlusion-container">\n    {{Image}}\n    <canvas id="image-occlusion-canvas"></canvas>\n</div>\n<script>\ntry {\n    anki.imageOcclusion.setup();\n} catch (exc) {\n    document.getElementById("err").innerHTML = `Error loading image occlusion. Is your Anki version up to date?<br><br>${exc}`;\n}\n</script>\n\n<div><button id="toggle">Toggle Masks</button></div>\n{{#Back Extra}}<div>{{Back Extra}}</div>{{/Back Extra}}\n',
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0,
        id: -7486573076461009266,
      },
    ],
    flds: [
      {
        name: "Occlusion",
        ord: 0,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 7787621809648212376,
        tag: 0,
        preventDeletion: true,
      },
      {
        name: "Image",
        ord: 1,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -5262007660156621727,
        tag: 1,
        preventDeletion: true,
      },
      {
        name: "Header",
        ord: 2,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "hi",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: 2091943638272366215,
        tag: 2,
        preventDeletion: true,
      },
      {
        name: "Back Extra",
        ord: 3,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -8751572109826615077,
        tag: 3,
        preventDeletion: true,
      },
      {
        name: "Comments",
        ord: 4,
        sticky: false,
        rtl: false,
        font: "Arial",
        size: 20,
        description: "",
        plainText: false,
        collapsed: false,
        excludeFromSearch: false,
        id: -4758395342683967347,
        tag: 4,
        preventDeletion: false,
      },
    ],
    css: "#image-occlusion-canvas {\n    --inactive-shape-color: #ffeba2;\n    --active-shape-color: #ff8e8e;\n    --inactive-shape-border: 1px #212121;\n    --active-shape-border: 1px #212121;\n}\n\n.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
    latexPre:
      "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    req: [[0, "any", [0, 1, 2]]],
    originalStockKind: 6,
  },
};

export const newDeck = (timestamp: number, name: string) => ({
  [timestamp.toString()]: {
    id: timestamp,
    name: name,
    desc: "",
    usn: 0,
    collapsed: false,
    browserCollapsed: false,
    newToday: [0, 0],
    revToday: [0, 0],
    lrnToday: [0, 0],
    timeToday: [0, 0],
    dyn: 0,
    extendNew: 10,
    extendRev: 50,
    conf: 1,
    mod: timestamp,
    reviewLimit: null,
    newLimit: null,
    reviewLimitToday: null,
    newLimitToday: null,
  },
});
