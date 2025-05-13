// markdown.tsx
import "katex/dist/contrib/mhchem";
import "katex/dist/katex.min.css";

// optional HLJS CSS
import "highlight.js/styles/default.css";
import React, { useMemo } from "react";
import {
  marked,
  RendererExtensionFunction,
  type TokenizerAndRendererExtension as Extension,
  type MarkedOptions,
} from "marked";
import hljs from "highlight.js";
import katex from "katex";
import { ErrorBoundary } from "./custom-ui/error-boundary";

const inlineRuleNonStandard =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1/; // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule = /^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/;

function createRenderer(newlineAfter: boolean): RendererExtensionFunction {
  return (token) =>
    katex.renderToString(token.text, { displayMode: token.displayMode }) +
    (newlineAfter ? "\n" : "");
}

function inlineKatex(renderer: RendererExtensionFunction): Extension {
  const ruleReg = inlineRuleNonStandard;
  const nonStandard = false;
  return {
    name: "inlineKatex",
    level: "inline",
    start(src) {
      let index;
      let indexSrc = src;

      while (indexSrc) {
        index = indexSrc.indexOf("$");
        if (index === -1) {
          return;
        }
        const f = nonStandard
          ? index > -1
          : index === 0 || indexSrc.charAt(index - 1) === " ";
        if (f) {
          const possibleKatex = indexSrc.substring(index);

          if (possibleKatex.match(ruleReg)) {
            return index;
          }
        }

        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, "");
      }
    },
    tokenizer(src) {
      const match = src.match(ruleReg);
      if (match) {
        return {
          type: "inlineKatex",
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}

function blockKatex(renderer: RendererExtensionFunction): Extension {
  return {
    name: "blockKatex",
    level: "block",
    tokenizer(src) {
      const match = src.match(blockRule);
      if (match) {
        return {
          type: "blockKatex",
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}
interface ClozeToken {
  type: "cloze";
  raw: string;
  index: string;
  text: string;
}

const getHtml = (content: string) => {
  const options = {
    gfm: true,
    breaks: true,
    smartypants: true, // TS will complain unless we cast
    async: false,
    highlight: (code: string, lang: string | undefined): string => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch {
          // fall through to no‐highlight
        }
      }
      return "";
    },
  } as MarkedOptions & { smartypants?: boolean };

  marked.setOptions(options);

  // 2) Your cloze extension:
  const clozeExtension: Extension = {
    name: "cloze",
    level: "inline",
    start(src: string) {
      return src.match(/{{c\d+::/)?.index;
    },
    tokenizer(src: string) {
      const rule = /^{{c(\d+)::([\s\S]+?)}}/;
      const match = rule.exec(src);
      if (match) {
        const [, index, text] = match;
        return {
          type: "cloze",
          raw: match[0],
          index,
          text,
        } as ClozeToken;
      }
    },
    renderer(token) {
      return `<span class="cloze" data-index="${token.index}">${token.text}</span>`;
    },
  };

  // 5) Install all extensions
  marked.use({
    extensions: [
      inlineKatex(createRenderer(false)),
      blockKatex(createRenderer(true)),
      clozeExtension,
    ],
  });

  // 6) Parse and update state only with a string
  return marked.parse(content || "", { async: false });
};

export const MarkdownWrapper: React.FC<{ content: string }> = ({ content }) => {
  const html = useMemo<string>(() => getHtml(content), [content]);

  return (
    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ErrorBoundary
      fallback={(e) => {
        console.log(e);
        return (
          <div>
            An Error occured please inspect console, or delete this card please
          </div>
        );
      }}
    >
      <MarkdownWrapper content={content} />
    </ErrorBoundary>
  );
};

export default Markdown;
