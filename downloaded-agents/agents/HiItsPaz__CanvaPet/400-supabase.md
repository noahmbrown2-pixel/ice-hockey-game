---
description: supabase or database related
globs: 
alwaysApply: false
---
# Supabase Development Best Practices

## Local Development

- **Use Service Role for Development Only**
  ```javascript
  // ✅ DO: Create development admin client
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
  
  // ❌ DON'T: Use service role in production code
  ```

- **Test User Management**
  ```javascript
  // ✅ DO: Set up dedicated test users
  const { data } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  ```

## Authentication & Security

- **Environment Variables**
  ```typescript
  // ✅ DO: Type-check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  if (!supabaseUrl) throw new Error('Missing URL');
  
  // ❌ DON'T: Use unchecked variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  ```

- **Client Creation Pattern**
  ```typescript
  // ✅ DO: Create singleton instance
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```

## Row Level Security (RLS)

- **Policy Structure**
  ```sql
  -- ✅ DO: Cast auth.uid() to text when needed
  CREATE POLICY "Users can view their files"
  ON storage.objects
  FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);
  ```

- **Environment Switching**
  ```typescript
  // ✅ DO: Create conditional client
  function getClient() {
    if (process.env.NODE_ENV === 'development') {
      return adminClient;
    }
    return regularClient;
  }
  ```

## Database Queries

- **Type Safety**
  ```typescript
  // ✅ DO: Use proper typing
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .returns<Profile[]>();
  ```

- **Error Handling**
  ```typescript
  // ✅ DO: Check for errors
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch profiles');
  }
  ```

## Storage Management

- **File Organization**
  ```typescript
  // ✅ DO: Include user ID in path
  const filePath = `${user.id}/${fileName}`;
  await supabase.storage.from('pet-images').upload(filePath, file);
  ```

- **Storage RLS**
  ```sql
  -- ✅ DO: Restrict access to file owners
  CREATE POLICY "Users can access their own files"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1]);
  ```

See [600-local-vs-production.md](mdc:.roo/rules/600-local-vs-production.md) for environment-specific guidelines.
