export const getValue = (context, contextStr) => {
  const splitArray = contextStr.split('.');
  let currentContext = context;
  while (splitArray.length) {
    const item = splitArray.shift()
      .trim();
    if (typeof (currentContext) === 'object' && item in currentContext) {
      currentContext = currentContext[item];
    } else {
      return null;
    }
  }
  return currentContext;
};

export const requiresSubstitution = (regEx, str) => regEx.test(str);

export const getSubstituteValue = context => (regexMatch, placeholder) => (
  getValue(context, placeholder)
);

export const formatter = (input, context) => {
  const regEx = /{{([^{]*?)}}/g;
  let result = input;
  if (requiresSubstitution(regEx, input)) {
    result = input.replace(regEx, getSubstituteValue(context));
  }
  return result;
};

export const objectToCSS = style => (
  Object.entries(style).reduce((styleString, [propName, propValue]) => {
    propName = propName.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
    return `${styleString}${propName}:${propValue};`;
  }, '')
);
