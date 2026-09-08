# Quick Start: Category Isolation System

## 🚀 Deploy in 5 Steps

### Step 1: Apply Database Migration
```bash
npx supabase migration up
```
Creates tables: `properties`, `property_images`, `agents` with strict category isolation.

---

### Step 2: Create Storage Bucket
```
Supabase Dashboard → Storage → Create bucket
Name: property-images
Access: Public
```

---

### Step 3: Migrate Seed Data
```bash
export VITE_SUPABASE_URL="https://your.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sbp_..."

npx ts-node scripts/migrate-seed-data.ts
```

---

### Step 4: Test Admin Panel
```
http://localhost:5173/admin/listings
```
- ✅ Create property (category REQUIRED)
- ✅ Try moving house to flats (confirmation appears)
- ✅ Delete property (confirmation appears)

---

### Step 5: Update Client Code
Replace:
```typescript
// OLD
import { LISTINGS } from "@/lib/listings";
const houses = filterListings(LISTINGS, "houses", "sale");

// NEW
import { getPropertiesByCategory } from "@/lib/propertyQueries";
const houses = await getPropertiesByCategory("houses", "sale");
```

---

## 📚 Key Concepts

### CATEGORY_MAPPING
```typescript
const CATEGORY_MAPPING = {
  houses: ["houses"],
  flats: ["flats", "shortlets"],
  land: ["land"],
  commercial: ["commercial", "offices"],
};
```
**Single source of truth** - All queries use this to know which DB categories belong in each endpoint.

### Strict Isolation
```
/for-sale/houses        → ONLY category='houses'
/for-sale/flats         → ONLY categories IN ('flats', 'shortlets')
/for-sale/land          → ONLY category='land'
/for-sale/commercial    → ONLY categories IN ('commercial', 'offices')
```

### Image Binding
Each image locked to exactly ONE property via:
- Foreign key: `property_id` → `properties(id)`
- Unique constraint: `(property_id, image_path)` - no duplicates
- Cascade delete: Remove property → removes images automatically

---

## 🛠️ Common Tasks

### Create Property (Admin)
```typescript
import { createPropertyAdminFn } from "@/routes/api.properties";

await createPropertyAdminFn({
  ref: "AMD1007",
  title: "4BR House",
  category: "houses",  // ⚠️ REQUIRED
  listing_type: "sale",
  price: 500000000,
  area: "Kampala",
  district: "Wakiso",
  region: "Central Region",
  beds: 4, baths: 2, toilets: 2,
  description: "...",
  features: [],
  status: "active",
  moderation_status: "approved",
  // ... other fields
});
```

### Query Properties
```typescript
import { getPropertiesByCategory } from "@/lib/propertyQueries";

// Get houses for sale
const houses = await getPropertiesByCategory("houses", "sale", { limit: 20 });

// Get flats (includes shortlets)
const flats = await getPropertiesByCategory("flats", "rent", { limit: 50 });

// Search within category
const results = await searchPropertiesByCategory("houses", "Kampala", "sale");
```

### Upload Image
```typescript
import { uploadPropertyImage } from "@/lib/propertyQueries";

await uploadPropertyImage(
  propertyId,
  imageFile,
  "Living room"
);
```

### Move Property to Different Category
```typescript
import { updatePropertyAdminFn } from "@/routes/api.properties";

// Confirmation dialog shown automatically in UI
await updatePropertyAdminFn(propertyId, {
  category: "flats",  // Moving from houses to flats
});
```

---

## ✅ Verification Queries

### Check Database
```sql
-- Count by category
SELECT category, COUNT(*) FROM properties GROUP BY category;

-- No orphaned images
SELECT COUNT(*) FROM property_images pi
WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = pi.property_id);
```

### Test API
```bash
# Get houses
curl "http://localhost:5173/api/for-sale/houses?limit=10"

# Get flats
curl "http://localhost:5173/api/for-sale/flats?limit=10"

# Search
curl "http://localhost:5173/api/search/houses?query=Kampala"
```

---

## 🔐 Security

✅ **Database-level:**
- CHECK constraints enforce valid categories
- RLS policies control access
- Foreign keys prevent orphaned data

✅ **Query-level:**
- `CATEGORY_MAPPING` prevents mixing
- Server functions validate category

✅ **Admin-level:**
- Service role key required (admin-only)
- Category changes require confirmation
- Delete requires confirmation

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/20260825_*.sql` | Database schema |
| `src/lib/propertyQueries.ts` | Client queries |
| `src/routes/api.properties.tsx` | Server functions |
| `src/routes/admin.listings.tsx` | Admin UI |
| `scripts/migrate-seed-data.ts` | Data migration |

---

## 🆘 Troubleshooting

**Properties not showing?**
```sql
SELECT COUNT(*) FROM properties WHERE status='active';
```

**Images not loading?**
```sql
SELECT COUNT(*) FROM property_images;
```

**Category mismatch?**
```sql
SELECT category, COUNT(*) FROM properties GROUP BY category;
```

---

## 📞 Support

1. Check `IMPLEMENTATION_GUIDE.md` for detailed setup
2. Review `BACKEND_SCHEMA.md` for schema documentation  
3. Check SQL verification queries above
4. Look at error messages in browser console

---

**Version 1.0 | Ready for Production**
