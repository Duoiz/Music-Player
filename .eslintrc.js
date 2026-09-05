module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'react', 'react-hooks'],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	env: {
		es2021: true,
		node: true,
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'react/no-unescaped-entities': 'off',
		'react-hooks/exhaustive-deps': 'warn',
		'no-empty': ['error', { allowEmptyCatch: true }],
	},
	ignorePatterns: [
		'node_modules/',
		'.expo/',
		'dist/',
		'android/',
		'ios/',
		'server/',
		'_design_ref/',
		'*.config.js',
	],
}
