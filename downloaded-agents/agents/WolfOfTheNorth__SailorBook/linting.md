# Claude AI Linting & Code Quality Guide - SailorBook

## 🎯 Overview

This guide provides comprehensive code quality standards, linting rules, and formatting guidelines for Claude AI agents working on SailorBook. All code must meet these standards before being committed.

## 📋 Quick Reference Commands

```bash
# Flutter - Code formatting & analysis
cd apps/app_flutter
dart format .
flutter analyze
dart fix --apply

# Rust - Code formatting & linting  
cd crates/pdreader_core
cargo fmt
cargo clippy -- -D warnings
cargo test

# Playwright - Linting
cd tests/playwright
npm run lint
npx playwright test --reporter=list
```

## 🎨 Flutter Code Standards

### Formatting Rules

#### 1. Dart Format Configuration
```yaml
# analysis_options.yaml (already configured)
linter:
  rules:
    # Style
    - always_use_package_imports
    - avoid_relative_lib_imports
    - prefer_single_quotes
    - unnecessary_string_interpolations
    
    # Performance
    - avoid_function_literals_in_foreach_calls
    - prefer_collection_literals
    - use_key_in_widget_constructors
    
    # Best Practices
    - avoid_print
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
```

#### 2. Code Organization
```dart
// ✅ Correct import order
import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/book.dart';
import '../services/book_service.dart';
import '../widgets/book_card.dart';

// ✅ Class structure
class BookDetailsView extends StatefulWidget {
  // 1. Constants
  static const String routeName = '/book-details';
  
  // 2. Fields
  final Book book;
  
  // 3. Constructor
  const BookDetailsView({
    Key? key,
    required this.book,
  }) : super(key: key);
  
  // 4. Methods
  @override
  State<BookDetailsView> createState() => _BookDetailsViewState();
}
```

#### 3. Widget Naming & Keys
```dart
// ✅ Always add test keys for interactive elements
class SearchView extends StatefulWidget {
  const SearchView({Key? key}) : super(key: key);
  
  @override
  State<SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<SearchView> {
  @override
  Widget build(BuildContext context) {
    return Column(
      key: const Key('search-view'),
      children: [
        TextField(
          key: const Key('search-input'),
          controller: _searchController,
          decoration: const InputDecoration(
            hintText: 'Search for books...',
          ),
          onSubmitted: _performSearch,
        ),
        
        ElevatedButton(
          key: const Key('search-btn'),
          onPressed: () => _performSearch(_searchController.text),
          child: const Text('Search'),
        ),
      ],
    );
  }
}
```

#### 4. Error Handling Patterns
```dart
// ✅ Proper error handling
class BookService {
  Future<List<Book>> searchBooks(String query) async {
    try {
      final response = await http.get(
        Uri.parse('https://openlibrary.org/search.json?q=$query'),
        headers: {'Accept': 'application/json'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return (data['docs'] as List<dynamic>)
            .map((doc) => Book.fromOpenLibrary(doc as Map<String, dynamic>))
            .toList();
      } else {
        throw BookServiceException(
          'Search failed with status: ${response.statusCode}',
        );
      }
    } on SocketException {
      throw BookServiceException('Network connection failed');
    } on FormatException {
      throw BookServiceException('Invalid response format');
    } catch (e) {
      throw BookServiceException('Unexpected error: $e');
    }
  }
}

// Custom exception class
class BookServiceException implements Exception {
  final String message;
  const BookServiceException(this.message);
  
  @override
  String toString() => 'BookServiceException: $message';
}
```

#### 5. State Management Patterns
```dart
// ✅ Proper controller usage
class LibraryController extends StateNotifier<LibraryState> {
  LibraryController(this._bookService) : super(const LibraryState.loading());
  
  final BookService _bookService;
  
  Future<void> loadBooks() async {
    state = const LibraryState.loading();
    
    try {
      final books = await _bookService.getDownloadedBooks();
      state = LibraryState.loaded(books);
    } catch (e) {
      state = LibraryState.error(e.toString());
    }
  }
  
  Future<void> downloadBook(Book book) async {
    try {
      await _bookService.downloadBook(book);
      await loadBooks(); // Refresh the list
    } catch (e) {
      state = LibraryState.error('Download failed: $e');
    }
  }
}
```

### Common Flutter Linting Fixes

#### Before (❌ Lint Errors)
```dart
// Missing const
Container(
  child: Text('Hello'),
)

// Unnecessary string interpolation
Text('Title: ${book.title}')

// Missing key
ElevatedButton(
  onPressed: _onPressed,
  child: Text('Click me'),
)

// Using print
void _debug() {
  print('Debug message');
}
```

#### After (✅ Fixed)
```dart
// Added const
const Container(
  child: Text('Hello'),
)

// Fixed interpolation
Text('Title: ${book.title}') // Only if variable is used
Text('Title: ' + book.title)  // Or concatenation

// Added key
ElevatedButton(
  key: const Key('click-btn'),
  onPressed: _onPressed,
  child: const Text('Click me'),
)

// Using debugPrint
void _debug() {
  debugPrint('Debug message');
}
```

## 🦀 Rust Code Standards

### Formatting Rules

#### 1. Rustfmt Configuration
```toml
# rustfmt.toml
edition = "2021"
hard_tabs = false
tab_spaces = 4
newline_style = "Unix"
use_small_heuristics = "Default"
reorder_imports = true
reorder_modules = true
max_width = 100
```

#### 2. Code Structure
```rust
// ✅ Proper module organization
use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::epub::EpubParser;
use crate::tts::TtsEngine;

/// Represents a book manifest with metadata and chapters.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookManifest {
    pub id: String,
    pub title: String,
    pub author: String,
    pub chapters: Vec<Chapter>,
}

impl BookManifest {
    /// Creates a new manifest from an EPUB file.
    pub fn from_epub<P: AsRef<Path>>(path: P) -> Result<Self> {
        let parser = EpubParser::new(path.as_ref())
            .context("Failed to create EPUB parser")?;
        
        let metadata = parser.extract_metadata()
            .context("Failed to extract metadata")?;
        
        let chapters = parser.extract_chapters()
            .context("Failed to extract chapters")?;
        
        Ok(Self {
            id: metadata.id,
            title: metadata.title,
            author: metadata.author,
            chapters,
        })
    }
}
```

#### 3. Error Handling
```rust
// ✅ Comprehensive error handling
use thiserror::Error;

#[derive(Error, Debug)]
pub enum EpubError {
    #[error("File not found: {path}")]
    FileNotFound { path: String },
    
    #[error("Invalid EPUB format: {reason}")]
    InvalidFormat { reason: String },
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("XML parsing error: {0}")]
    XmlParsing(#[from] quick_xml::Error),
}

pub type Result<T> = std::result::Result<T, EpubError>;

impl EpubParser {
    pub fn parse_content(&self) -> Result<Vec<Chapter>> {
        let content = std::fs::read_to_string(&self.path)
            .map_err(|_| EpubError::FileNotFound {
                path: self.path.display().to_string(),
            })?;
        
        self.extract_chapters_from_content(&content)
            .context("Failed to extract chapters")
            .map_err(|e| EpubError::InvalidFormat {
                reason: e.to_string(),
            })
    }
}
```

#### 4. Performance Patterns
```rust
// ✅ Efficient string handling
impl TextNormalizer {
    pub fn normalize(&self, text: &str) -> String {
        text.lines()
            .map(|line| self.normalize_line(line))
            .filter(|line| !line.trim().is_empty())
            .collect::<Vec<_>>()
            .join("\n")
    }
    
    fn normalize_line(&self, line: &str) -> String {
        // Use cow for efficient string handling
        let mut result = std::borrow::Cow::Borrowed(line);
        
        // Only allocate if changes are needed
        if line.contains("—") {
            result = std::borrow::Cow::Owned(
                result.replace("—", "--")
            );
        }
        
        result.into_owned()
    }
}
```

### Clippy Configuration
```toml
# Cargo.toml
[lints.clippy]
all = "warn"
pedantic = "warn"
cargo = "warn"

# Allow some pedantic lints
too_many_arguments = "allow"
module_name_repetitions = "allow"
```

## 🧪 Testing Code Quality

### Unit Test Standards

#### Flutter Tests
```dart
// ✅ Well-structured widget tests
void main() {
  group('BookDetailsView', () {
    late MockBookService mockBookService;
    
    setUp(() {
      mockBookService = MockBookService();
    });
    
    testWidgets('displays book information correctly', (tester) async {
      // Arrange
      const book = Book(
        id: 'test-id',
        title: 'Test Book',
        author: 'Test Author',
      );
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: BookDetailsView(book: book),
        ),
      );
      
      // Assert
      expect(find.text('Test Book'), findsOneWidget);
      expect(find.text('Test Author'), findsOneWidget);
      expect(find.byKey(const Key('download-btn')), findsOneWidget);
    });
    
    testWidgets('shows error when download fails', (tester) async {
      // Arrange
      when(() => mockBookService.downloadBook(any()))
          .thenThrow(Exception('Download failed'));
      
      // Act & Assert - test error handling
      await tester.pumpWidget(/* widget setup */);
      await tester.tap(find.byKey(const Key('download-btn')));
      await tester.pumpAndSettle();
      
      expect(find.text('Download failed'), findsOneWidget);
    });
  });
}
```

#### Rust Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;
    
    #[test]
    fn test_epub_parser_extracts_metadata() {
        // Arrange
        let temp_dir = tempdir().unwrap();
        let epub_path = temp_dir.path().join("test.epub");
        create_test_epub(&epub_path);
        
        // Act
        let parser = EpubParser::new(&epub_path).unwrap();
        let metadata = parser.extract_metadata().unwrap();
        
        // Assert
        assert_eq!(metadata.title, "Test Book");
        assert_eq!(metadata.author, "Test Author");
        assert!(!metadata.chapters.is_empty());
    }
    
    #[test]
    fn test_parser_handles_invalid_epub() {
        // Arrange
        let invalid_path = Path::new("nonexistent.epub");
        
        // Act
        let result = EpubParser::new(invalid_path);
        
        // Assert
        assert!(result.is_err());
        match result.unwrap_err() {
            EpubError::FileNotFound { path } => {
                assert_eq!(path, "nonexistent.epub");
            }
            _ => panic!("Expected FileNotFound error"),
        }
    }
}
```

## 📊 Performance Guidelines

### Flutter Performance Rules

1. **Widget Rebuilds**
   - Use `const` constructors wherever possible
   - Implement proper `shouldRebuild` logic in controllers
   - Avoid creating widgets in build methods

2. **Memory Management**
   - Dispose controllers and listeners properly
   - Use `AutomaticKeepAliveClientMixin` for expensive widgets
   - Cache expensive computations

3. **Network Efficiency**
   - Implement proper timeout handling
   - Use connection pooling for HTTP requests
   - Cache API responses appropriately

### Rust Performance Rules

1. **Memory Allocation**
   - Prefer borrowing over cloning
   - Use `Cow<str>` for conditional string allocation
   - Pre-allocate collections when size is known

2. **Error Handling**
   - Use `Result<T, E>` consistently
   - Implement `From` traits for error conversion
   - Avoid panicking in library code

3. **Async Operations**
   - Use `tokio` for async operations
   - Implement proper cancellation handling
   - Avoid blocking operations in async contexts

## 🔧 Pre-Commit Checklist

### Flutter
- [ ] `dart format .` runs without changes
- [ ] `flutter analyze` shows no issues
- [ ] `dart fix --apply` applied all suggestions
- [ ] All widgets have test keys
- [ ] Error handling implemented
- [ ] Unit tests added/updated

### Rust  
- [ ] `cargo fmt` runs without changes
- [ ] `cargo clippy -- -D warnings` passes
- [ ] `cargo test` all tests pass
- [ ] Error types properly defined
- [ ] Documentation comments added
- [ ] Integration tests updated

### General
- [ ] No debug print statements
- [ ] No TODO comments without tickets
- [ ] Code follows established patterns
- [ ] Tests cover edge cases
- [ ] Documentation updated

## 🚨 Common Issues & Fixes

### Flutter Issues

#### Issue: Missing Test Keys
```dart
// ❌ No test key
ElevatedButton(
  onPressed: _onPressed,
  child: Text('Submit'),
)

// ✅ With test key
ElevatedButton(
  key: const Key('submit-btn'),
  onPressed: _onPressed,
  child: const Text('Submit'),
)
```

#### Issue: Inefficient Rebuilds
```dart
// ❌ Creates new widget every build
Widget build(BuildContext context) {
  return Container(
    child: MyExpensiveWidget(),
  );
}

// ✅ Use const constructor
Widget build(BuildContext context) {
  return const Container(
    child: MyExpensiveWidget(),
  );
}
```

### Rust Issues

#### Issue: Unnecessary String Allocation
```rust
// ❌ Unnecessary allocation
fn process_text(text: &str) -> String {
    text.to_string()
}

// ✅ Use Cow for conditional allocation
fn process_text(text: &str) -> Cow<str> {
    if needs_processing(text) {
        Cow::Owned(process_string(text))
    } else {
        Cow::Borrowed(text)
    }
}
```

## 📚 Resources

### Documentation
- [Dart Style Guide](https://dart.dev/guides/language/effective-dart/style)
- [Flutter Best Practices](https://flutter.dev/docs/perf/rendering/best-practices)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)

### Tools
- **Flutter**: `dart format`, `flutter analyze`, `dart fix`
- **Rust**: `cargo fmt`, `cargo clippy`, `cargo audit`
- **VS Code Extensions**: Flutter, Rust-analyzer

---

**Last Updated**: 2025-08-28  
**Status**: Active  
**Apply Before**: Every commit

*Follow these guidelines for consistent, high-quality code across the SailorBook project.*