// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import configPrettier from 'eslint-config-prettier'

// Merge Nuxt rules with Prettier integration.
// - pluginPrettierRecommended: report Prettier issues as ESLint errors
// - configPrettier: disable rules that conflict with Prettier (must be last)
export default withNuxt(pluginPrettierRecommended, configPrettier)
