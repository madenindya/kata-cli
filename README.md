[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5445d7e1a31740f8a4659e4774a168d9)](https://www.codacy.com?utm_source=git@bitbucket.org&amp;utm_medium=referral&amp;utm_content=yesboss/kata-cli&amp;utm_campaign=Badge_Grade)

# Introduction

Kata Command Line Interface (Kata CLI) is a tool for creating bots with Kata Markup Language (Kata ML) and helps managing the bots with command line/shell of various operating systems.
For more information, check our website (http://kata.ai/en).

## Links

- [Changelog](CHANGELOG.md)

# Installation

Install Kata-CLI at your device, using this command:

```shell
npm install -g kata-cli
```

now you can use command kata globally

# Commands

Use `kata --help` to see commands list available

Command as **user** and **team** : 

* `kata init [options] <name> [version`] - Init the bot
* `kata versions` - List versions of the bot
* `kata config-view` - View config stored in .katajson file
* `kata list-bots` - List the bots
* `kata push [options]` - Push the bot
* `kata pull <name> <version>` - Pull the bot with specified name and version
* `kata remove-bot` - Delete selected bot
* `kata test [file]`
* `kata console [options] <diaenneUrl>`
* `kata deploy <name> [version]` - Deploy the bot
* `kata add-channel [options] <name> <channelName>` - Add bot channel
* `kata remove-channel <name> <channelName>` - Remove bot channel
* `kata drop <name>`
* `kata session-get <id> [deploymentId]`
* `kata session-create [options] [id] [deploymentId]`
* `kata session-update [options] <id> [deploymentId]`
* `kata session-delete <id> [deploymentId]`
* `kata set <prop> <value>`
* `kata switch <type> [name]`

Command as **user** : 

* `kata login [options]`
* `kata logout`
* `kata whoami`
* `kata change-password`
* `kata create-team <teamName>`
* `kata create-user`  - admin only

Command as **team :**

* `kata add-member <username> [options] --admin`
* `kata remove-member <username>`

# Kata CLI 2.0

Soon, we will implement kata-cli 2.0 because of our updated platform to 3.0.

## Changes 

### Project environment

Before running kata-cli main command (ex: push, pull, etc.), user have to define what project that user is working on with command : 
`kata set-project <projectName>`

### New commands

New command : 

* `kata create-project` - Create a project
* `kata list-project` - Display current projects that you have
* `kata set-project <projectName>` - Select project that you want to use, any bot operation will be related to that project

Updated command (`Old command` -> `New command`) :

* `kata init <name> [version]` -> `kata init <name>`
* `kata pull <name> <version>` -> `kata pull [revision]`
* `kata test [file]` -> `kata test [file] [revision]`
* `kata console <diaenneUrl>` -> `kata console [revision]`
* `kata versions` -> `kata list-revision`

Deprecated Command :

Temporary :
* `deploy <name> [version]`
* `list-deployment`
* `add-channel [options] <name> <channelName>`
* `remove-channel <name> <channelName>`

Permanent : 
* `kata session-get <id> [deploymentId]`
* `kata session-create <id> [deploymentId]`
* `kata session-update <id> [deploymentId]`
* `kata session-delete <id> [deploymentId]`


### New kata-cli Console

If you execute `kata console` command, kata-cli will generate a `.katasession` file in your home directory, so you can debug further.  And if you want to view your current session in kata-cli, after executing `kata console` just type `current()`.
