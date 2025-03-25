interface CodeFeatures {
  loc: number;
  num_functions: number;
  nesting_depth: number;
  num_conditional_statements: number;
  num_variables: number;
  function_call_count: number;
  cyclomatic_complexity: number;
  memory_operations: number;
}

function removeComments(code: string): string {
  // 去除多行注释 /* ... */
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // 去除单行注释 // ...
  const lines = code.split('\n');
  const filteredLines = lines.filter(line => !line.trim().startsWith('//'));
  return filteredLines.join('\n');
}

export function analyzeCode(fileContent: string): CodeFeatures {
  const code = removeComments(fileContent);
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim());

  const features: CodeFeatures = {
    loc: nonEmptyLines.length,
    num_functions: 0,
    nesting_depth: 0,
    num_conditional_statements: 0,
    num_variables: 0,
    function_call_count: 0,
    cyclomatic_complexity: 1,
    memory_operations: 0
  };

  // 正则表达式模式
  const functionPattern = /(int|void|char|float|double)\s+(\w+)\s*\([^)]*\)\s*{/g;
  const loopPattern = /(for|while|do)\s*[\({]/g;
  const condPattern = /\b(if|else if|else|switch)\b/g;
  const varPattern = /(int|char|float|double)\s+\w+\s*(=|[;])/g;
  const funcCallPattern = /\b\w+\s*\([^)]*\)/g;
  const memOpPattern = /\b(malloc|calloc|realloc|free)\s*\(/g;

  // 计算函数数量，并提取函数名
  const functionMatches = Array.from(code.matchAll(functionPattern));
  features.num_functions = functionMatches.length;
  const functionNames = functionMatches.map(match => match[2]);

  // 计算循环嵌套深度
  let nestingLevel = 0;
  let maxNesting = 0;
  lines.forEach(line => {
    if (line.match(loopPattern)) {
      nestingLevel++;
      maxNesting = Math.max(maxNesting, nestingLevel);
    } else if (line.includes('}')) {
      nestingLevel = Math.max(0, nestingLevel - 1);
    }
  });
  features.nesting_depth = maxNesting;

  // 计算条件语句数量
  const condMatches = code.match(condPattern);
  features.num_conditional_statements = condMatches ? condMatches.length : 0;

  // 计算变量数量
  const varMatches = code.match(varPattern);
  features.num_variables = varMatches ? varMatches.length : 0;

  // 计算函数调用次数
  const funcCalls = Array.from(code.matchAll(funcCallPattern));
  features.function_call_count = funcCalls
    .filter(call => !functionNames.some(name => call[0].startsWith(`${name}(`)))
    .length;

  // 计算圈复杂度
  features.cyclomatic_complexity += (
    features.num_conditional_statements + features.nesting_depth
  );

  // 计算内存操作次数
  const memOpMatches = code.match(memOpPattern);
  features.memory_operations = memOpMatches ? memOpMatches.length : 0;

  return features;
}