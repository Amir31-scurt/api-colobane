
import { listProductsUsecase } from "./src/core/usecases/products/listProductsUsecase";

async function run() {
    console.log("--- TEST 1: Search 'Samsung' ---");
    await listProductsUsecase({ search: "Samsung" });

    console.log("\n--- TEST 2: Empty Search ---");
    await listProductsUsecase({ search: "" });

    console.log("\n--- TEST 3: Undefined Search ---");
    await listProductsUsecase({});
}

run().catch(console.error);
