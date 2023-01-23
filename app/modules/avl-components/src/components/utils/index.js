import React, { useEffect, useState, useReducer } from "react"

export * from "./color-ranges"

export const composeOptions = ({ ...options }) =>
  Object.keys(options).reduce((a, c) => {
    if (options[c]) {
      a.push(c.split("").map((c, i) => i === 0 ? c.toUpperCase() : c).join(""));
    }
    return a;
  }, []).join("")

export const useSetRefs = (...refs) => {
  return React.useCallback(node => {
    [...refs].forEach(ref => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      }
      else {
        ref.current = node;
      }
    })
  }, [refs])
}


// // WARNING: this hook will only work if the setNode is set to a DOM element, e.g. div, input, etc., not a React element!!!
// To use this with a React Functional Component, you must use Ref Forwarding: https://reactjs.org/docs/forwarding-refs.html
export const useClickOutside = handleClick => {
  const [node, setNode] = useState(null);

  useEffect(() => {
    const checkOutside = e => {
      if (node.contains(e.target)) {
        return;
      }
      (typeof handleClick === "function") && handleClick(e);
    }
    node && document.addEventListener("mousedown", checkOutside);
    return () => document.removeEventListener("mousedown", checkOutside);
  }, [node, handleClick])

  return [setNode, node];
}



const getRect = ref => {
  const node = ref ? ref.current : ref;
  if (!node) return { width: 0, height: 0 };
  return node.getBoundingClientRect();
}

export const useSetSize = (ref, callback) => {
  const [size, setSize] = React.useState({ width: 0, height: 0, x: 0, y: 0 });

  const doSetSize = React.useCallback(() => {
    const rect = getRect(ref),
      { width, height, x, y } = rect;
    if ((width !== size.width) || (height !== size.height)) {
      if (typeof callback === "function") {
        callback({ width, height, x, y });
      }
      setSize({ width, height, x, y });
    }
  }, [ref, size, callback]);

  React.useEffect(() => {
    window.addEventListener("resize", doSetSize);
    return () => {
      window.removeEventListener("resize", doSetSize);
    }
  }, [doSetSize]);

  React.useEffect(() => {
    doSetSize();
  });

  return size;
}


export const useAsyncSafe = func => {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return React.useCallback((...args) => {
    mounted.current && func(...args);
  }, [func]);
}
