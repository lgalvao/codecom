import { Parser, Language, Query } from 'web-tree-sitter';

let isInitialized = false;
const languages: Record<string, Language> = {};

export async function initTreeSitter(): Promise<void> {
  if (isInitialized) return;
  
  await Parser.init({
    locateFile() {
      return '/wasm/tree-sitter.wasm';
    }
  });
  
  isInitialized = true;
}

async function getLanguage(langName: string): Promise<Language> {
  if (languages[langName]) return languages[langName];
  
  const wasmUrl = `/wasm/grammars/tree-sitter-${langName}.wasm`;
  const lang = await Language.load(wasmUrl);
  languages[langName] = lang;
  return lang;
}

const QUERIES: Record<string, string> = {
  javascript: `
    (class_declaration name: (identifier) @name) @class
    (function_declaration name: (identifier) @name) @function
    (method_definition name: (property_identifier) @name) @method
    (variable_declarator name: (identifier) @name value: (arrow_function)) @function
  `,
  typescript: `
    (class_declaration name: (type_identifier) @name) @class
    (interface_declaration name: (type_identifier) @name) @interface
    (function_declaration name: (identifier) @name) @function
    (method_definition name: (property_identifier) @name) @method
    (abstract_class_declaration name: (type_identifier) @name) @interface
  `,
};

export interface SymbolInfo {
  name: string;
  type: string;
  line: number;
  column: number;
  category: string;
}

export async function getOutline(code: string, filePath: string): Promise<SymbolInfo[]> {
  await initTreeSitter();
  
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  let langName = extension;
  if (extension === 'js') langName = 'javascript';
  if (extension === 'ts' || extension === 'tsx') langName = 'typescript';
  
  try {
    const lang = await getLanguage(langName);
    const parser = new Parser();
    parser.setLanguage(lang);
    
    const tree = parser.parse(code);
    const queryStr = QUERIES[langName] || '';
    if (!queryStr) return [];
    
    const query = new Query(lang, queryStr);
    const captures = query.captures(tree.rootNode);
    
    return captures.map(capture => {
      const { node, name: captureName } = capture;
      const nameNode = node.childForFieldName('name') || node;
      
      return {
        name: nameNode.text,
        type: captureName.toUpperCase(),
        line: node.startPosition.row + 1,
        column: node.startPosition.column,
        category: determineCategory(captureName, nameNode.text)
      };
    });
  } catch (e) {
    console.error(`Error analyzing file ${filePath}:`, e);
    return [];
  }
}

function determineCategory(type: string, name: string): string {
  if (type === 'interface' || type === 'abstract_class') return 'ARCHITECTURE';
  // Simple boilerplate detection for JS/TS getters/setters
  if (name.startsWith('get') || name.startsWith('set')) return 'BOILERPLATE';
  return 'CORE';
}
