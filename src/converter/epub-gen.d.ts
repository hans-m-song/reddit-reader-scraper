declare module 'epub-gen' {
  interface Content {
    title?: string;
    author?: string;
    data: string;
    excludeFromToc?: boolean;
    beforeToc?: boolean;
    filename?: string;
  }
  interface EPubOptions {
    title: string;
    author: string | string[];
    publisher?: string;
    cover?: string;
    output?: string;
    version?: '2' | '3';
    css?: string;
    fonts?: string[];
    lang?: string;
    tocTitle?: string;
    appendChapterTitles?: boolean;
    customOpfTemplatePath?: string;
    customNcxTocTemplatePath?: string;
    customHtmlTocTemplatePath?: string;
    content: Content[];
    verbose?: boolean;
  }
  export default class EPub {
    promise: Promise<void>;
    constructor(options: EPubOptions, output?: string);
  }
}
