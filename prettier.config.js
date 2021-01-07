module.exports = {
	printWidth: 160,
	tabWidth: 2,
	useTabs: true,
	semi: true,
	vueIndentScriptAndStyle: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	bracketSpacing: true,
	trailingComma: 'es5',
	jsxBracketSameLine: false,
	jsxSingleQuote: false,
	arrowParens: 'always',
	insertPragma: false,
	requirePragma: false,
	proseWrap: 'never',
	htmlWhitespaceSensitivity: 'strict',
	endOfLine: 'lf',
	rangeStart: 0,
	overrides: [
		{
			files: '*.md',
			options: {
				tabWidth: 2,
			},
		},
	],
};
