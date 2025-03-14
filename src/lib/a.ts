// const models = {
//   "1": {
//     id: 1,
//     name: "Basic",
//     type: 0, // Standard model
//     mod: timestamp,
//     flds: [
//       {
//         name: "Front",
//         ord: 0,
//         sticky: false,
//         rtl: false,
//         font: "Arial",
//         size: 20,
//         media: [],
//       },
//       {
//         name: "Back",
//         ord: 1,
//         sticky: false,
//         rtl: false,
//         font: "Arial",
//         size: 20,
//         media: [],
//       },
//     ],
//     css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }",
//     latexPre:
//       "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
//     latexPost: "\\end{document}",
//     tmpls: [
//       {
//         name: "Card 1",
//         qfmt: "{{Front}}",
//         afmt: "{{FrontSide}}\n<hr id=answer>\n{{Back}}",
//         bqfmt: "",
//         bafmt: "",
//         did: null,
//         ord: 0,
//       },
//     ],
//     tags: [],
//     usn: -1,
//     req: [[0, "all", [0]]],
//     sortf: 0,
//   },
//   "2": {
//     id: 2,
//     name: "Cloze",
//     type: 1, // Cloze model
//     mod: timestamp,
//     flds: [
//       {
//         name: "Text",
//         ord: 0,
//         sticky: false,
//         rtl: false,
//         font: "Arial",
//         size: 20,
//         media: [],
//       },
//       {
//         name: "Extra",
//         ord: 1,
//         sticky: false,
//         rtl: false,
//         font: "Arial",
//         size: 20,
//         media: [],
//       },
//     ],
//     css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }\n.cloze { font-weight: bold; color: blue; }",
//     latexPre:
//       "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
//     latexPost: "\\end{document}",
//     tmpls: [
//       {
//         name: "Cloze",
//         qfmt: "{{cloze:Text}}",
//         afmt: "{{cloze:Text}}<br>{{Extra}}",
//         bqfmt: "",
//         bafmt: "",
//         did: null,
//         ord: 0,
//       },
//     ],
//     tags: [],
//     usn: -1,
//     req: [[0, "any", [0]]],
//     sortf: 0,
//   },
// };
//
// // Create default deck
// const newDeck = (timestamp: number, name: string) => ({
//   [timestamp.toString()]: {
//     id: 1,
//     name: name,
//     desc: "",
//     usn: 0,
//     collapsed: false,
//     browserCollapsed: false,
//     newToday: [0, 0],
//     revToday: [0, 0],
//     lrnToday: [0, 0],
//     timeToday: [0, 0],
//     dyn: 0,
//     extendNew: 10,
//     extendRev: 50,
//     conf: 1,
//     mod: timestamp,
//     reviewLimit: null,
//     newLimit: null,
//     reviewLimitToday: null,
//     newLimitToday: null,
//   },
// });
//
// // Deck configuration
// const dconf = (timestamp: number, name: string) => ({
//   "1": {
//     id: 1,
//     name: name,
//     replayq: true,
//     lapse: {
//       leechFails: 8,
//       minInt: 1,
//       delays: [10],
//       leechAction: 0,
//       mult: 0,
//     },
//     rev: {
//       perDay: 100,
//       fuzz: 0.05,
//       ivlFct: 1,
//       maxIvl: 36500,
//       ease4: 1.3,
//       bury: true,
//       minSpace: 1,
//     },
//     timer: 0,
//     maxTaken: 60,
//     usn: -1,
//     new: {
//       perDay: 20,
//       delays: [1, 10],
//       separate: true,
//       ints: [1, 4, 7],
//       initialFactor: 2500,
//       bury: true,
//       order: 1,
//     },
//     mod: timestamp,
//     autoplay: true,
//   },
// });
//
// // General configuration
// const conf = {
//   nextPos: 1,
//   estTimes: true,
//   activeDecks: [1],
//   sortType: "noteFld",
//   timeLim: 0,
//   sortBackwards: false,
//   addToCur: true,
//   curDeck: 1,
//   newBury: true,
//   newSpread: 0,
//   dueCounts: true,
//   curModel: "1",
//   collapseTime: 1200,
// };
//
// const a = {
//   "id": 1741886436995,
//   "guid": "Ko=<4(8B2D",
//   "mid": 1711892431823,
//   "mod": 1741886436,
//   "usn": 17,
//   "tags": " auto-gen ",
//   "flds": "{{c1::image-occlusion:rect:left=0.03143529245923016:top=0.2682551645107007:width=0.10600600865175372:height=0.025107626234991742:oi=1}} {{c2::image-occlusion:rect:left=0.034818462948115914:top=0.31054169290647615:width=0.1488595015109733:height=0.03700071234630359:oi=1}} {{c3::image-occlusion:rect:left=0.8512902742658784:top=0.33829222716620383:width=-0.07104658026660082:height=-0.04492943642051139:oi=1}} {{c4::image-occlusion:rect:left=0.033690739451820655:top=0.20614682592940548:width=0.1127723496295252:height=0.030393442284463612:oi=1}} {{c5::image-occlusion:rect:left=0.0325630159555254:top=0.1546101194470541:width=0.10262283816286794:height=0.03171489629683158:oi=1}} {{c6::image-occlusion:rect:left=0.16337894152577467:top=0.11893086111311854:width=-0.12856047857765876:height=-0.037000712346303546:oi=1}}<img src=\"qai-92cd7e8e-7d1e-43cf-a76d-d0484a269a43.webp\">",
//   "sfld": {{c1::image-occlusion:rect:left=0.03143529245923016:top=0.2682551645107007:width=0.10600600865175372:height=0.025107626234991742:oi=1}} {{c2::image-occlusion:rect:left=0.034818462948115914:top=0.31054169290647615:width=0.1488595015109733:height=0.03700071234630359:oi=1}} {{c3::image-occlusion:rect:left=0.8512902742658784:top=0.33829222716620383:width=-0.07104658026660082:height=-0.04492943642051139:oi=1}} {{c4::image-occlusion:rect:left=0.033690739451820655:top=0.20614682592940548:width=0.1127723496295252:height=0.030393442284463612:oi=1}} {{c5::image-occlusion:rect:left=0.0325630159555254:top=0.1546101194470541:width=0.10262283816286794:height=0.03171489629683158:oi=1}} {{c6::image-occlusion:rect:left=0.16337894152577467:top=0.11893086111311854:width=-0.12856047857765876:height=-0.037000712346303546:oi=1}},
//   "csum": 3333894734,
//   "flags": 0,
//   "data": ""
// }
//
//
