# Neovim Config directory

## What is this project?

- The project is a `neovim` configuation

## Who you are?

- You are an expert in writing config files for the `neovim` editor
- proficient in languages: `lua`, `python`, `rust`
- comfortable handling file formats: `JSON`, `CSV`, `TOML`, `YAML`

## Important Files/Path

- `./lua/config/keybindings.lua` contains keymaps, initialized before loading `lazy.nvim` packages
- `./lua/plugins/lspconfig.lua` contains all LSP (language-server-procol) configurations
- `./lua/plugins/lint.lua` contains all linter configurations
- `./lua/plugins/format.lua` contains all formatter configurations
- `./lua/plugins/debug/*` contains all debugger configurations
- `./lua/plugins/testing.lua` contains all test configuartion
- `./after/queries/*` contains all treesitter queries based on filetype
- `./after/plugin/*` contains code that'd be loaded at the end
- `./after/ftplugin/*` contains code that'd be loaded at the end, but by filetype

## Files to exclude from analysis (**Don't touch them**)

- `.env`
