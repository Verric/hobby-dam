```typescript
export async default function assetController(fastify) {
    fastify.get(...) {
        fastify.assetService(...)
    }
}

const fasitfy = new Fastify()
const assetService = new AssetService(...)
fastify.decorate("assetService", assetService)
fastify.register(assetContrtoller)
```

Phase 2

```typescript
export async default function createAssetController(assetService) {
    return async function assetController(fastify) {
        fastify.get(...) { assetService(...) }
    }
}
const fasitfy = new Fastify()
const assetService = new AssetService(...)
const assetController = createAssetController(assetService)
fastify.register(assetContrtoller)
```

Phase 3
```typescript
export class AssetController {
    private assetService:AssetService
    constructor(assetService:AssetService){...}
    async fetchAssets(req:FastifyRequest,reply:FastifyReply){...}
}

//routes.ts
export function assetRoutes(fastify) {
    const assetController = new AssetController()
    fastify.get("/assets", {
      schema: {...},
      handler: assetController.fetchAssets.bind(assetController),
    });
}
const fasitfy = new Fastify()
const assetService = new AssetService(...)
const assetController = new AssetController()
fastify.register(assetRoutes)
```

Phase 4
```typescript
export class AssetController {
    private assetService:AssetService
    constructor(assetService:AssetService){...}
    async fetchAssets(req:FastifyRequest,reply:FastifyReply){...}

    registerRoutes(fastify) {
        fastify.get("/assets", {
            schema: {...},
            handler: this.fetchAssets.bind(this),
            });
    }
}

const fasitfy = new Fastify()
const assetService = new AssetService(...)
const assetController = new AssetController(assetService)
assetController.registerRoutes(fastify)
```

Main diff at start each controller got it's own fastify scope, now every controller binds to the root fastify instance.
