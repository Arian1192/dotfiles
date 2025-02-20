# My Custom Dotfiles Configuration

Welcome to my personal dotfiles configuration repository! This repository contains all the necessary configurations to set up my development environment.

![Dotfiles](https://img.shields.io/badge/dotfiles-managed-brightgreen?style=flat-square)

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

Make sure you have Git and Stow installed on your macOS system. You can install them using Homebrew:

1. **Install Homebrew (if not already installed):**

    ```sh
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2. **Install Git:**

    ```sh
    brew install git
    ```

3. **Install Stow:**

    ```sh
    brew install stow
    ```

### Clone and Install Dotfiles

1. **Clone the repository:**

    ```sh
    git clone https://github.com/Arian1192/dotfiles.git ~/.dotfiles
    ```

2. **Run Stow . to create symlinks:**

    ```sh
    cd ~/.dotfiles
    stow .
    ```

3. **Restart your terminal:**

    ```sh
    exec $SHELL
    ```

## Features

- **Custom Shell Prompt**: A sleek and informative prompt.
- **Alias Shortcuts**: Commonly used commands are shortened.
- **Vim Configuration**: Enhanced settings for Vim.
- **Git Configuration**: Custom Git aliases and settings.

## Usage

Once installed, you can start using the custom configurations immediately. Here are some example commands:

- Open Vim with custom settings: `vim`
- Use Git aliases: `gst` for `git status`, `gco` for `git checkout`

## Customization

Feel free to customize the configurations to suit your needs. Simply edit the corresponding files in the `.dotfiles` directory.

## Contributing

If you have any suggestions or improvements, feel free to open an issue or submit a pull request. Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
