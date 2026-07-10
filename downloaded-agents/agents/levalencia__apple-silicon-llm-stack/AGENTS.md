# Metal Inference Core Agent Instructions

You are an expert C++/Metal developer working on the `metal-inference-core` repository. This project is a low-level, high-performance LLM inference engine built for Apple Silicon using C++20, Objective-C++, and Apple Metal.

## 1. Build, Lint, and Test Commands

When you modify code, always self-verify using these commands from the `metal-inference-core` directory:

- **Build Library & CLI**: `make build` (This runs CMake in the `./build` directory)
- **Format Code**: `make format` (Runs `clang-format -i` across all source files)
- **Lint Code**: `make lint` (Runs `clang-tidy` across all source files)
- **Run All Tests**: `make test` (Runs `ctest` inside the build directory)
- **Run Single Test**: `cd build && ctest -R <TestName> --output-on-failure -V`
- **Run Benchmarks**: `make bench`

## 2. Architectural Guidelines

- **CPU/GPU Separation**: The architecture strictly separates CPU operations (`core/*.cpp`) from GPU operations (`metal/*.mm` and `shaders/*.metal`). Do not leak Metal types (like `id<MTLDevice>`) into pure C++ `core/` headers.
- **Pimpl Idiom**: (ADR) Use the "Pointer to implementation" (Pimpl) pattern heavily for bridging C++ to Objective-C++ Metal code. This hides Objective-C/Metal headers from C++ consumers and ensures a stable ABI.
- **Buffer Pooling**: Metal buffer allocations are expensive. Always use the `Buffer Pool` abstraction to recycle GPU buffers rather than allocating new memory inside inference loops.

## 3. Code Style & Best Practices

### Formatting & Language
- **Standard**: C++20.
- **Style Guidelines**: Strict adherence to LLVM style via `.clang-format` (4-space indentation, 100 column limit).
- **Headers**: `#pragma once` must be used in all headers. Include order: Standard Library -> Third-party -> Local headers.

### Memory & Resource Management
- **Raw Pointers**: Forbidden. Use `std::unique_ptr` and `std::shared_ptr`.
- **Objective-C++ ARC**: In `.mm` files, utilize Automatic Reference Counting (ARC). Wrap tight GPU loops in `@autoreleasepool { ... }` blocks to prevent memory leaks during sustained inference.
- **References**: Pass by `const Reference&` for read-only complex types, and return by value or smart pointer.

### Error Handling & Logging
- **Errors**: Return explicit status enums or `std::expected` / `std::optional`. Avoid throwing exceptions across module boundaries.
- **Logging**: (ADR-008) Use `spdlog` for structured logging. Do not use `printf` or `std::cout` (e.g., `spdlog::info("Message: {}", value)`).

## 4. Agent Operations
- Read `docs/ARCHITECTURE.md` and `docs/DESIGN.md` if touching the Core Engine, Metal Backend, or Shaders.
- Use `glob` and `grep` extensively to locate Pimpl interfaces or shader kernels (`*.metal`).
- Pay extreme attention to data types and array strides when writing Metal shader kernels.
