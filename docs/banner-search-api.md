# Banner Search API Documentation

## Overview

The Banner Search API provides advanced search capabilities for banners with proper pagination, filtering, and relevance scoring. You can search banners by title, description, and altText with various sorting options.

## API Endpoints

### 1. Get All Banners with Search (Enhanced)

**Endpoint:** `GET /api/banners`

**Description:** Retrieve all banners with optional search, filtering, and pagination.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Number of items per page (max 100) |
| `search` | string | No | - | Search query to filter banners |
| `searchIn` | string | No | "title,description" | Fields to search in (comma-separated) |
| `isActive` | boolean | No | - | Filter by active status |
| `sortBy` | string | No | "displayOrder" | Field to sort by |
| `sortOrder` | string | No | "asc" | Sort order ("asc" or "desc") |

#### Available searchIn options:
- `title`
- `description`
- `altText`
- `title,description`
- `title,description,altText`

#### Available sortBy options:
- `title`
- `displayOrder`
- `createdAt`
- `updatedAt`

#### Example Requests

```bash
# Basic pagination
GET /api/banners?page=1&limit=10

# Search by title
GET /api/banners?search=sale&searchIn=title

# Search in multiple fields
GET /api/banners?search=summer%20sale&searchIn=title,description

# Search with filtering and sorting
GET /api/banners?search=discount&isActive=true&sortBy=title&sortOrder=asc&page=1&limit=5
```

#### Response Format

```json
{
  "success": true,
  "message": "Banners retrieved successfully",
  "data": {
    "banners": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Summer Sale",
        "description": "Get 50% off on selected items",
        "altText": "Summer sale banner with discount",
        "bannerImage": "https://example.com/image.jpg",
        "bannerImagePublicId": "banner_123456",
        "isActive": true,
        "displayOrder": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "search": "sale",
      "searchIn": "title,description",
      "isActive": null,
      "sortBy": "displayOrder",
      "sortOrder": "asc"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req_123456",
    "version": "1.0.0"
  }
}
```

### 2. Advanced Search Endpoint

**Endpoint:** `GET /api/banners/search`

**Description:** Advanced search with relevance scoring and enhanced filtering.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | - | Search query (required) |
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Number of items per page (max 100) |
| `searchIn` | string | No | "title,description,altText" | Fields to search in |
| `isActive` | boolean | No | - | Filter by active status |
| `sortBy` | string | No | "relevance" | Sort by relevance or other fields |
| `sortOrder` | string | No | "desc" | Sort order ("asc" or "desc") |

#### Available sortBy options (includes relevance):
- `relevance` (default - sorts by relevance score)
- `title`
- `displayOrder`
- `createdAt`
- `updatedAt`

#### Example Requests

```bash
# Basic search
GET /api/banners/search?q=sale

# Search with relevance sorting
GET /api/banners/search?q=summer%20sale&sortBy=relevance&sortOrder=desc

# Search in specific fields
GET /api/banners/search?q=discount&searchIn=title&isActive=true

# Search with pagination
GET /api/banners/search?q=promotion&page=2&limit=5
```

#### Response Format

```json
{
  "success": true,
  "message": "Found 3 banners matching \"summer sale\"",
  "data": {
    "banners": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Summer Sale",
        "description": "Get 50% off on selected items",
        "altText": "Summer sale banner with discount",
        "bannerImage": "https://example.com/image.jpg",
        "bannerImagePublicId": "banner_123456",
        "isActive": true,
        "displayOrder": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "relevanceScore": 3
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false,
      "nextPage": null,
      "prevPage": null
    },
    "search": {
      "query": "summer sale",
      "searchIn": ["title", "description", "altText"],
      "sortBy": "relevance",
      "sortOrder": "desc",
      "filters": {
        "isActive": null
      }
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "requestId": "req_123456",
    "version": "1.0.0",
    "searchTime": 1704110400000
  }
}
```

## Relevance Scoring

When using the advanced search endpoint (`/api/banners/search`), each result includes a `relevanceScore` field:

- **Title match**: 2 points
- **Description match**: 1 point
- **AltText match**: 1 point

The higher the score, the more relevant the banner is to your search query.

## Search Features

### Case-Insensitive Search
All searches are case-insensitive. "Sale", "sale", and "SALE" will return the same results.

### Partial Matching
Search queries match partial text. For example, searching for "sale" will match "Summer Sale" and "Clearance Sale".

### Multiple Field Search
You can search across multiple fields simultaneously using the `searchIn` parameter with comma-separated values.

### Filtering
Combine search with other filters like `isActive` to narrow down results.

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Search query is required",
  "errorCode": "MISSING_SEARCH_QUERY",
  "statusCode": 400
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "searchIn",
      "message": "searchIn must be valid field combination"
    }
  ]
}
```

## Performance Considerations

- Search queries are limited to 100 characters
- Maximum 100 items per page
- Database indexes are optimized for search performance
- Use specific search fields for better performance

## Usage Examples

### Frontend Integration

```javascript
// Search banners with React/TypeScript
const searchBanners = async (query: string, page = 1) => {
  try {
    const response = await fetch(
      `/api/banners/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Usage
searchBanners('summer sale')
  .then(result => {
    console.log(`Found ${result.pagination.totalItems} banners`);
    console.log('Banners:', result.banners);
  })
  .catch(error => {
    console.error('Failed to search banners:', error);
  });
```

### Pagination Component

```javascript
const BannerPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button 
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      
      <span>Page {currentPage} of {totalPages}</span>
      
      <button 
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};
```

## Testing

### Example Test Cases

```bash
# Test basic search
curl "http://localhost:3000/api/banners/search?q=sale"

# Test with pagination
curl "http://localhost:3000/api/banners/search?q=discount&page=2&limit=5"

# Test with filters
curl "http://localhost:3000/api/banners/search?q=promotion&isActive=true"

# Test enhanced getAllBanners
curl "http://localhost:3000/api/banners?search=summer&searchIn=title&sortBy=title&sortOrder=asc"
```

This enhanced banner search API provides comprehensive search capabilities with proper pagination, relevance scoring, and flexible filtering options.
