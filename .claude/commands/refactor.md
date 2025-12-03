# Refactor Code

Refactor the specified code following SOLID principles:

## SOLID Checklist
- **S** (Single Responsibility): Split if doing multiple things
- **O** (Open/Closed): Make extensible without modification
- **L** (Liskov Substitution): Ensure subtypes are substitutable
- **I** (Interface Segregation): Split large interfaces
- **D** (Dependency Inversion): Depend on abstractions

## Refactoring Patterns
- Extract function/component for repeated logic
- Replace conditionals with polymorphism
- Introduce interface for dependency injection
- Consolidate similar code paths
- Simplify complex conditions

## Requirements
- Maintain existing behavior (no feature changes)
- Improve readability and maintainability
- Reduce complexity and duplication
- Keep changes atomic and reviewable
- Update tests if signatures change

## Process
1. Read and understand current implementation
2. Identify code smells and violations
3. Plan refactoring steps
4. Execute incrementally with verification
5. Ensure tests still pass

What code should I refactor?
