# Phase 0: prove the native toolchain (NDK/CMake + vendored llama.cpp) builds.
# Scaffolding follows upstream llama.cpp's own examples/llama.android
# (https://github.com/ggml-org/llama.cpp/tree/b10362/examples/llama.android),
# adapted for this repo layout (llama.cpp vendored at <repo>/third_party/llama.cpp).

cmake_minimum_required(VERSION 3.31.6)

project("pokekit-llm" VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED true)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED true)

# Only arm64-v8a is supported (Galaxy S25 Ultra only).
if(DEFINED ANDROID_ABI)
    message(STATUS "Detected Android ABI: ${ANDROID_ABI}")
    if(ANDROID_ABI STREQUAL "arm64-v8a")
        set(GGML_SYSTEM_ARCH "ARM")
        set(GGML_CPU_KLEIDIAI ON)
        set(GGML_OPENMP ON)
    else()
        message(FATAL_ERROR "Unsupported ABI: ${ANDROID_ABI} (only arm64-v8a is supported)")
    endif()
endif()

# Vendored llama.cpp source (git submodule pinned to a tagged release).
set(LLAMA_SRC ${CMAKE_CURRENT_LIST_DIR}/../../../../../third_party/llama.cpp)
add_subdirectory(${LLAMA_SRC} build-llama)

add_library(pokekit-llm SHARED
        pokekit-llm.cpp)

target_compile_definitions(pokekit-llm PRIVATE
        GGML_SYSTEM_ARCH=${GGML_SYSTEM_ARCH}
        GGML_CPU_KLEIDIAI=$<BOOL:${GGML_CPU_KLEIDIAI}>
        GGML_OPENMP=$<BOOL:${GGML_OPENMP}>
        LLAMA_CPP_TAG="b10362"
)

target_include_directories(pokekit-llm PRIVATE
        ${LLAMA_SRC}
        ${LLAMA_SRC}/common
        ${LLAMA_SRC}/include
        ${LLAMA_SRC}/ggml/include
        ${LLAMA_SRC}/ggml/src)

# Link the llama.cpp library targets in-process (default for later phases).
target_link_libraries(pokekit-llm
        llama
        llama-common
        android
        log)
