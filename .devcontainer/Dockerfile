FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Python のインストール
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# CUDA対応のPythonパッケージをインストール
RUN pip3 install --no-cache-dir \
    torch \
    torchvision \
    torchaudio \
    --index-url https://download.pytorch.org/whl/cu118 \
    && pip3 install --no-cache-dir \
    transformers \
    accelerate \
    bitsandbytes

# CUDA環境変数の設定
ENV PATH=/usr/local/cuda/bin:${PATH}
ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64:${LD_LIBRARY_PATH} 