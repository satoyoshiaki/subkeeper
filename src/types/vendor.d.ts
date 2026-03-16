// Stub declarations for packages that don't provide their own types
// @types/minimatch v6 is a stub that expects minimatch to bundle its own types,
// but minimatch@3 (pulled by next-pwa) doesn't. This satisfies the compiler.
declare module 'minimatch' {
  function minimatch(path: string, pattern: string, options?: minimatch.IOptions): boolean;
  namespace minimatch {
    interface IOptions {
      debug?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      dot?: boolean;
      noext?: boolean;
      nocase?: boolean;
      nonull?: boolean;
      matchBase?: boolean;
      nocomment?: boolean;
      nonegate?: boolean;
      flipNegate?: boolean;
    }
    function match(list: string[], pattern: string, options?: IOptions): string[];
    function filter(pattern: string, options?: IOptions): (element: string, index: number, array: string[]) => boolean;
    function makeRe(pattern: string, options?: IOptions): RegExp | false;
  }
  export = minimatch;
}
