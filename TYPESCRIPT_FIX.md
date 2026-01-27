# Fix for TypeScript Production Build

## Issue
`AuthRequest` interface doesn't properly extend Express `Request` in production builds.

## Solution
We've created a type augmentation file that adds custom properties to the Express Request type globally.

### File Created: `src/types/express.d.ts`
```typescript
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        phone: string;
      };
      auth?: {
        userId: number;
        role: "USER" | "SELLER" | "ADMIN";
      };
    }
  }
}

export {};
```

### How to Fix Controllers

**Option 1 (Recommended): Keep using Request type**

Change all controller imports from:
```typescript
import { AuthRequest } from "../middlewares/authMiddleware";

export function someController(req: AuthRequest, res: Response) {
  // ...
}
```

To:
```typescript
import { Request, Response } from "express";

export function someController(req: Request, res: Response) {
  // Now req.user and req.auth are available due to type augmentation
}
```

**Option 2: Use type alias**

In `authMiddleware.ts`, change:
```typescript
export interface AuthRequest extends Request {
  user?: { ... };
}
```

To:
```typescript
import { Request } from "express";
export type AuthRequest = Request; // Just an alias now
```

## Quick Fix Command

Run this in your project root to replace AuthRequest with Request in all controllers:

```powershell
# Backup first!
Get-ChildItem -Path "src/infrastructure/http/controllers" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'import \{ AuthRequest \} from [^\n]+', 'import { Request, Response } from "express";'
    $content = $content -replace ': AuthRequest', ': Request'
    Set-Content -Path $_.FullName -Value $content
}
```

## Manual Fix (Safer)

Edit these files and replace `AuthRequest` with `Request`:

1. `src/infrastructure/http/controllers/adminController.ts`
2. `src/infrastructure/http/controllers/authController.ts`
3. `src/infrastructure/http/controllers/deliveryController.ts`
4. `src/infrastructure/http/controllers/orderController.ts`
5. `src/infrastructure/http/controllers/paymentController.ts`
6. `src/infrastructure/http/controllers/pushTokenController.ts`

In each file:
- Remove: `import { AuthRequest } from "../middlewares/authMiddleware";`
- Add: `import { Request, Response } from "express";` (if not already present)
- Replace  all `req: AuthRequest` with `req: Request`

## Test the Fix

```bash
# Test build
npm run build

# Check for errors
# Should compile successfully now
```

## Why This Works

TypeScript's Module Augmentation allows us to extend third-party types globally. By declaring the `user` and `auth` properties in the `Express.Request` interface, all Express Request objects will have these properties typed correctly, without needing a custom interface.

This is the standard way to extend Express types and works reliably in both development and production builds.
