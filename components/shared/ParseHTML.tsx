"use client";
import React, { useEffect, useState } from "react";
/* tslint:disable-next-line */
import Prism from "prismjs";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";

import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-aspnet";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-solidity";
import "prismjs/components/prism-json";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-r";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-mongodb";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

interface Props {
  data: string;
}

// Whitelist of safe HTML tags
const SAFE_TAGS = new Set([
  "p", "br", "strong", "em", "b", "i", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote",
  "a", "img", "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
]);

// Whitelist of safe attributes
const SAFE_ATTRS = new Set([
  "class", "className", "href", "src", "alt", "title", "target", "rel",
]);

const ParseHTML = ({ data }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      Prism.highlightAll();
    }
  }, [mounted, data]);

  // Fix hydration issues by preventing <pre> inside <p>
  const cleanData = data.replace(/<p>\s*(<pre\b[\s\S]*?<\/pre>)\s*<\/p>/gi, "$1");

  // Parser options that filter unsafe elements
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Block script tags and event handlers
        if (domNode.name === "script" || domNode.name === "style") {
          return <></>;
        }
        // Remove event handler attributes (onclick, onerror, etc.)
        if (domNode.attribs) {
          const safeAttribs: Record<string, string> = {};
          for (const [key, value] of Object.entries(domNode.attribs)) {
            if (!key.startsWith("on") && SAFE_ATTRS.has(key.toLowerCase())) {
              // Sanitize href to prevent javascript: URLs
              if (key === "href" && value.toLowerCase().startsWith("javascript:")) {
                continue;
              }
              safeAttribs[key] = value;
            }
          }
          domNode.attribs = safeAttribs;
        }
      }
      return undefined;
    },
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="markdown w-full min-w-full animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="markdown w-full min-w-full">
      {parse(cleanData, options)}
    </div>
  );
};

export default ParseHTML;
