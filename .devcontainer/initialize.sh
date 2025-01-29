#!/bin/bash
set -e

# ログ出力関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# エラーハンドリング
handle_error() {
    log "Error: $1"
    exit 1
}

# 環境変数ファイルの確認
if [ ! -f .env.local ]; then
    handle_error ".env.local file not found. Please create it from .env.local.example"
fi

# 環境変数の読み込み
export $(cat .env.local | xargs) || handle_error "Failed to load environment variables"

# 必要な環境変数の確認
if [ -z "$GITHUB_USER" ] || [ -z "$GITHUB_PAT" ]; then
    handle_error "GITHUB_USER and GITHUB_PAT must be set in .env.local"
fi

# GitHub Container Registryへのログイン
log "Logging in to GitHub Container Registry..."
echo "$GITHUB_PAT" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin || handle_error "Failed to login to ghcr.io"

log "Initialization completed successfully" 