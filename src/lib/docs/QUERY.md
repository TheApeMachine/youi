# YouI Query System

A powerful and flexible MongoDB query builder with built-in transformations and relationship handling.

## 🚀 Getting Started

Initialize a query using the `from` function:

```ts
import { from } from "@/lib/mongo/query";

// Basic query
const users = await from("User")
    .where({ active: true })
    .exec();

// Complex query with joins
const posts = await from("Post")
    .select("title", "content", "authorId")
    .include("author", "category")
    .where({ published: true })
    .sortBy("createdAt", "desc")
    .limit(10)
    .exec();
```

## 🔍 Query Building

### Basic Queries

```ts
// Simple where clause
from("User")
    .where({ active: true })
    .exec();

// Select specific fields
from("User")
    .select("firstName", "lastName", "email")
    .exec();

// Limit results
from("User")
    .limit(5)
    .exec();

// Sort results
from("User")
    .sortBy("lastName", "asc")
    .exec();
```

### Relationships & Joins

```ts
// Automatic relationship inference
from("Post")
    .select("title", "authorId")  // Will automatically join with User
    .exec();

// Explicit includes
from("Post")
    .include("author", "category")
    .exec();

// Multiple nested relationships
from("Comment")
    .include("post", "author")
    .where({ approved: true })
    .exec();
```

## 💾 Data Operations

### Creating & Updating

```ts
// Create or update (upsert)
await from("User")
    .where({ email: "john@example.com" })
    .set({
        firstName: "John",
        lastName: "Doe",
        active: true
    });

// Batch update
await from("Post")
    .where({ authorId: "123" })
    .set({ published: true });
```

### Soft Delete

```ts
// Soft delete with conditions
await from("User")
    .where({ _id: "123" })
    .softDelete();

// Note: Soft delete requires conditions
try {
    await from("User").softDelete(); // Will throw error
} catch (error) {
    console.error("Cannot delete without conditions");
}
```

## 📊 Transformations

### Pagination

```ts
import { transform } from "@/lib/mongo/transform";

const result = await transform.withPagination(10)({
    items: data,
    page: 1
});

// Returns:
{
    items: [...], // Paginated items
    pagination: {
        current: 1,
        pageSize: 10,
        total: 5
    }
}
```

### Sorting

```ts
const result = await transform.withSort({
    field: "createdAt",
    order: "desc"
})({
    items: data
});

// Returns sorted items
```

### Joins

```ts
const result = await transform.withJoins([
    { join: "User", on: "_id,authorId" },
    { join: "Category", on: "_id,categoryId" }
])({
    items: data
});

// Returns items with joined data
```

## 🔢 Counting Records

```ts
// Get total count
const total = await from("User")
    .where({ active: true })
    .count();
```

## 🆔 UUID Handling

The system automatically handles UUID conversion for MongoDB:

```ts
// UUIDs are automatically converted to Binary
await from("User")
    .where({ _id: "123e4567-e89b-12d3-a456-426614174000" })
    .exec();

// Works with arrays of UUIDs
await from("Post")
    .where({
        authorId: "123e4567-e89b-12d3-a456-426614174000",
        categoryIds: [
            "123e4567-e89b-12d3-a456-426614174001",
            "123e4567-e89b-12d3-a456-426614174002"
        ]
    })
    .exec();
```

## 🛠️ Best Practices

**Use Type Safety**: The query builder includes TypeScript support

```ts
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

const users = await from<User>("User").exec();
```

**Always Include Conditions for Updates/Deletes**

```ts
// Good
await from("User")
    .where({ _id: userId })
    .softDelete();

// Bad - will throw error
await from("User").softDelete();
```

1. **Use Field Selection**: Only select needed fields

```ts
// Good - only fetches needed fields
from("User")
    .select("firstName", "lastName")
    .exec();

// Less optimal - fetches all fields
from("User").exec();
```

**Leverage Automatic Joins**: Use the automatic relationship inference

```ts
// The system will automatically join related data
from("Post")
    .select("title", "authorId", "categoryId")
    .exec();
```

## 🌟 Conclusion

The YouI Query System provides a powerful and intuitive way to interact with MongoDB. It combines the flexibility of MongoDB's query language with the convenience of a fluent interface, while automatically handling common concerns like UUID conversion, relationships, and transformations.

For more complex scenarios, you can combine multiple operations or extend the system using the transform pipeline.
