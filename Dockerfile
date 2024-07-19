# Use Ubuntu 18.04 as the base image based on the pykaldi Dockerfile
FROM ubuntu:18.04

# Disable user prompts from apt commands
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python2.7 \
    autoconf \
    automake \
    cmake \
    curl \
    g++ \
    git \
    graphviz \
    libatlas3-base \
    libtool \
    make \
    pkg-config \
    sox \
    subversion \
    unzip \
    wget \
    zlib1g-dev

# Make python3 default
RUN ln -s /usr/bin/python3 /usr/bin/python && \
    ln -s /usr/bin/pip3 /usr/bin/pip

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir numpy \
                               pyparsing \
                               jupyter \
                               ninja \
                               flask 

# Clone pykaldi repository into /pykaldi
RUN git clone https://github.com/pykaldi/pykaldi.git /pykaldi

# Change permissions to ensure we can execute scripts
RUN chmod -R a+x /pykaldi/tools

# Install Protobuf, CLIF, Kaldi and PyKaldi
WORKDIR /pykaldi/tools
RUN ./check_dependencies.sh && ./install_protobuf.sh && ./install_clif.sh && ./install_kaldi.sh

WORKDIR /pykaldi
RUN python setup.py install

# Set up the Flask application
WORKDIR /app

# Copy the Flask app
COPY ./app /app

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["flask", "run", "--host=0.0.0.0"]

