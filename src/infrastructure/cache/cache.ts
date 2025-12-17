
export async function cacheGet<T>(_key: string): Promise<T | null> {
    return null;
  }
  
  export async function cacheSet(_key: string, _value: any, _ttlSeconds: number) {
    return;
  }
  
  export async function cacheDel(_pattern: string) {
    return;
  }
