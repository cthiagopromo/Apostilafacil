export const aggressiveMinifyHtml = (html: string): string => {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+=\s+"/g, '="')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .trim();
};

export const removeRedundantAttributes = (html: string): string => {
  return html
    .replace(/ disabled="disabled"/g, ' disabled')
    .replace(/ checked="checked"/g, ' checked')
    .replace(/ selected="selected"/g, ' selected')
    .replace(/ readonly="readonly"/g, ' readonly')
    .replace(/=""/g, '')
    .trim();
};

export const minifyCss = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

export const minifyJs = (js: string): string => {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,()=])\s*/g, '$1')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

export const htmlMinifier = {
  aggressiveMinifyHtml,
  removeRedundantAttributes,
  minifyCss,
  minifyJs
};

export default htmlMinifier;
