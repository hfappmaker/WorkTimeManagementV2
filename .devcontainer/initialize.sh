#!/usr/bin/env bash

# WSLで実行されていない場合、WSLで再実行
if [ -z "$WSL_DISTRO_NAME" ]; then
    # 自身に実行権限を付与
    wsl chmod +x "$0"
    # WSLで再実行
    exec wsl bash "$0" "$@"
fi

# .env.localファイルから環境変数を読み込む
if [ -f .env.local ]; then
    # 環境変数を読み込む
    export $(cat .env.local | xargs)
    
    # GitHub Container Registryにログイン
    echo "$GITHUB_PAT" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin
    echo "Successfully logged in to GitHub Container Registry"
else
    echo "Warning: .env.local file not found in .devcontainer directory"
    exit 1
fi 