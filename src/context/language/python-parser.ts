import { AbstractParser, EnclosingContext } from "../../constants";
import Parser, { SyntaxNode } from "tree-sitter";
import Python from "tree-sitter-python";

const parser = new Parser();
parser.setLanguage(Python);

const processNode = (
  node: Parser.SyntaxNode,
  lineStart: number,
  lineEnd: number,
  largestSize: number,
  largestEnclosingContext: Parser.SyntaxNode | null
) => {
  const { startPosition, endPosition } = node;
  if (startPosition.row <= lineStart && lineEnd <= endPosition.row) {
    const size = endPosition.row - startPosition.row;
    if (size > largestSize) {
      largestSize = size;
      largestEnclosingContext = node;
    }
  }
  return { largestSize, largestEnclosingContext };
};
export class PythonParser implements AbstractParser {
  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    // TODO: Implement this method for Python
    const ast = parser.parse(file);
    let largestEnclosingContext: SyntaxNode = null;
    let largestSize = 0;

    const temp = ast.walk();

    while (temp.gotoNextSibling() || temp.gotoParent()) {
      const current = temp.currentNode;
      if (current.type === "function_definition") {
        ({ largestSize, largestEnclosingContext } = processNode(
          current,
          lineStart,
          lineEnd,
          largestSize,
          largestEnclosingContext
        ));
      }
    }
    return { enclosingContext: largestEnclosingContext } as EnclosingContext;
  }
  dryRun(file: string): { valid: boolean; error: string } {
    try {
      const ast = parser.parse(file);
      return { valid: true, error: "" };
    } catch (exc) {
      return { valid: false, error: exc };
    }
  }
}
