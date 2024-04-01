export declare const planCmd: Partial<import("cmd-ts/dist/cjs/argparser.js").Register> & {
    parse(context: import("cmd-ts/dist/cjs/argparser.js").ParseContext): Promise<import("cmd-ts/dist/cjs/argparser.js").ParsingResult<{}>>;
} & import("cmd-ts/dist/cjs/helpdoc.js").PrintHelp & import("cmd-ts/dist/cjs/helpdoc.js").ProvidesHelp & import("cmd-ts/dist/cjs/helpdoc.js").Named & Partial<import("cmd-ts/dist/cjs/helpdoc.js").Versioned> & import("cmd-ts/dist/cjs/argparser.js").Register & import("cmd-ts/dist/cjs/runner.js").Handling<{}, Promise<void>> & {
    run(context: import("cmd-ts/dist/cjs/argparser.js").ParseContext): Promise<import("cmd-ts/dist/cjs/argparser.js").ParsingResult<Promise<void>>>;
} & Partial<import("cmd-ts/dist/cjs/helpdoc.js").Versioned & import("cmd-ts/dist/cjs/helpdoc.js").Descriptive & import("cmd-ts/dist/cjs/helpdoc.js").Aliased>;
