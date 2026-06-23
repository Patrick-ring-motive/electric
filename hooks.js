(() => {
  const isString = (x) => typeof x === "string" || x instanceof String;
  const isNull = (x) => x === null || x === undefined;
  const setHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML").set;
  (() => {
    const skips = ["SCRIPT", "STYLE", "LINK", "META"];
    const skipCss = skips.map((x) => "" + x + ", " + x + " *").join(", ");
    for (const node of [Node, Element, HTMLElement]) {
      for (const method of [
          "appendChild",
          "insertBefore",
          "removeChild",
          "replaceChild",
          "insertAdjacentElement",
          "before",
          "after",
          "replaceWith",
          "prepend",
          "append",
        ]) {
        (() => {
          const _NodeMethod = node.prototype[method];
          if (!_NodeMethod) {
            return;
          }
          node.prototype[method] = Object.setPrototypeOf(function NodeMethod(
            ...args
          ) {
            try {
              if (
                (isString(args[0]) || args[0]?.nodeName === "#text") && args[0]?.textContent?.trim?.() &&
                !this?.matches?.(skipCss)
              ) {
                const span = document.createElement("span");
                setHTML.call(span, globalThis.color(args[0].textContent || ""));
                args[0] = span;
              }
              if (
                /*["SPAN", "TD","DIV"].includes(args[0]?.tagName) &&*/
                !args[0]?.children?.length
              ) {
                const text = (args[0].textContent || "").trim();
                if (text) {
                  (args?.[0]?.dataset ?? {}).text = text.replaceAll(
                    String.fromCharCode(34),
                    "quote",
                  );
                }
              }
              if (isString(args[0]))
                console.log("NodeMethod", method, this, ...args);
              return _NodeMethod.apply(this, args);
            } catch (e) {
              console.warn(e, this, ...args);
              return _NodeMethod.apply(this, args);
            }
          }, _NodeMethod);
        })();
      }
    }
  })();

  (() => {
    const protoMap = {
      textContent: Node.prototype,
      innerText: HTMLElement.prototype
    };
    for (const txt of ["textContent", "innerText"]) {
      const proto = protoMap[txt];
      const _textContent = Object.getOwnPropertyDescriptor(proto, txt);
      Object.defineProperty(proto, txt, {
        ..._textContent,
        set(value) {
          try {
            if (!isString(value)) {
              if (!isNull(value)) {
                value = String(value);
              } else {
                console.warn("value is null or undefined", this, value);
              }
            }
            if (value?.replace) {
              const val = color(value);
              if (val !== value) {
                return setHTML.call(this, val);
              }
            }
            return _textContent.set.call(this, value);
          } catch (e) {
            console.warn(e, this, value);
          }
        },
      });
    }
  })();

  (() => {
    const _parseFromString = DOMParser.prototype.parseFromString;
    DOMParser.prototype.parseFromString = function parseFromString(...args) {
      try {
        const doc = _parseFromString.apply(this, args);
          let elems = doc.body.querySelectorAll("*:not(script):not(style):not(link):not(meta):not(:has(*))");
          for (const elem of elems) {
            if (!elem?.children?.length) {
              elem.textContent = (elem.textContent || "");
            }
          }
        return doc;
      } catch (e) {
        console.warn(e, this, ...args);
        return _parseFromString.apply(this, args);
      }
    };
  })();

  (() => {
    const parser = new DOMParser();
    const parse = x => parser.parseFromString(x, "text/html");
    for (const txt of ["innerHTML"]) {
      const _textContent = Object.getOwnPropertyDescriptor(
        Element.prototype,
        txt,
      );
      Object.defineProperty(Element.prototype, txt, {
        ..._textContent,
        set(value) {
          try {
            if (isString(value)) {
              const doc = parse(value);
              value = String(doc.body.innerHTML);
            }
            return _textContent.set.call(this, value);
          } catch (e) {
            console.warn(e, this, value);
          }
        },
      });
    }
  })();

          let elems = document.body.querySelectorAll("*:not(script):not(style):not(link):not(meta):not(:has(*))");
          for (const elem of elems) {
            if (!elem?.children?.length) {
              elem.textContent = (elem.textContent || "");
            }
          }
  
})();
