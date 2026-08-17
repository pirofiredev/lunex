import { Product, Drop } from "@/lib/types";
import { PRODUCTS, DROPS } from "@/lib/data/products";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isWithinPastDays } from "@/lib/time";

// Directus file URL builder
function getDirectusFileUrl(fileId: string | null): string | null {
  if (!fileId) return null;
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!directusUrl) return null;

  // Directus serves files at /assets/{file_id}
  // Add access_token if public role requires it (alternative: enable public read in Directus admin)
  const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  if (publicToken) {
    return `${directusUrl}/assets/${fileId}?access_token=${publicToken}`;
  }

  return `${directusUrl}/assets/${fileId}`;
}

function mapProduct(product: any, stockData: any[]): Product {
  // Build stock object from stock table
  const stock: Record<string, number> = {};
  stockData.forEach((item: any) => {
    const size = item.size?.toUpperCase() || '';
    if (size) {
      stock[size] = item.quantity ?? 0;
    }
  });

  // Extract sizes from stock keys
  let sizes = Object.keys(stock);

  // Sort sizes in standard order
  const sizeOrder: Record<string, number> = {
    'XS': 1,
    'S': 2,
    'M': 3,
    'L': 4,
    'XL': 5,
    'XXL': 6,
    'One Size': 7,
  };

  sizes = sizes.sort((a: string, b: string) => {
    const orderA = sizeOrder[a] ?? 999;
    const orderB = sizeOrder[b] ?? 999;
    return orderA - orderB;
  });

  // Parse care instructions from JSON array
  const care = Array.isArray(product.care) ? product.care : [];

  // Build image URL from Directus files
  const images: string[] = [];
  if (product.images) {
    const imageUrl = getDirectusFileUrl(product.images);
    if (imageUrl) images.push(imageUrl);
  }

  // Use category as-is from database
  const category = product.category || "uncategorized";

  // Calculate isNew based on release date (within last 30 days, excluding drops)
  let isNew = false;
  let releaseDate: string | undefined = undefined;

  const rawReleaseDate = product.releasedate || product.released || product.release_date || product.releaseDate;
  if (rawReleaseDate) {
    let releaseDateStr = typeof rawReleaseDate === 'string' ? rawReleaseDate : new Date(rawReleaseDate).toISOString();
    if (releaseDateStr && !releaseDateStr.includes('T')) {
      releaseDateStr = releaseDateStr.replace(' ', 'T') + 'Z';
    }
    releaseDate = releaseDateStr;
    const isDrop = Boolean(product.drop_id || product.dropId);
    isNew = !isDrop && isWithinPastDays(releaseDateStr, 30);
  }

  return {
    id: product.id,
    slug: product.slug || `product-${product.id}`,
    name: product.name || "Unnamed Product",
    category,
    priceCHF: Number(product.price ?? 0),
    stripePriceId: null, // Not in schema yet
    description: product.description ?? "",
    care,
    sizes,
    stock,
    images,
    isNew,
    dropId: product.drop_id ?? product.dropId ?? undefined,
    releaseDate,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*");

      if (productsError) {
        console.error("Supabase products query error:", productsError);
        return PRODUCTS;
      }

      if (!productsData?.length) return PRODUCTS;

      // Fetch all stock data
      const productIds = productsData.map(p => p.id);
      const { data: stockData, error: stockError } = await supabase
        .from("stock")
        .select("*")
        .in("productid", productIds);

      if (stockError) {
        console.error("Supabase stock query error:", stockError);
      }

      // Group stock by productid
      const stockByProduct = new Map<number, any[]>();
      (stockData || []).forEach(s => {
        const list = stockByProduct.get(s.productid) || [];
        list.push(s);
        stockByProduct.set(s.productid, list);
      });

      // Map products
      const products = productsData.map(product => {
        return mapProduct(product, stockByProduct.get(product.id) || []);
      });

      // Filter out products from unreleased drops
      const now = Date.now();
      return products.filter(product => {
        if (!product.dropId) return true;
        if (!product.releaseDate) return false;
        return new Date(product.releaseDate).getTime() <= now;
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return PRODUCTS;
    }
  }

  return PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (productError || !productData) {
        return PRODUCTS.find((p) => p.slug === slug);
      }

      // Fetch stock data for this product
      const { data: stockData } = await supabase
        .from("stock")
        .select("*")
        .eq("productid", productData.id);

      return mapProduct(productData, stockData || []);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return PRODUCTS.find((p) => p.slug === slug);
    }
  }

  return PRODUCTS.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getProducts();

  if (category === "all") return all;

  return all.filter((p) => p.category === category);
}

export async function getDrops(): Promise<Drop[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data: dropsData, error } = await supabase
        .from("drops")
        .select("*")
        .order("released", { ascending: false });

      if (error) {
        console.error("Supabase drops query error:", error);
        return DROPS;
      }

      if (!dropsData?.length) return DROPS;

      // Fetch all dropsstock data
      const dropIds = dropsData.map(d => d.id);
      const { data: dropStockData, error: dropStockError } = await supabase
        .from("dropsstock")
        .select("*")
        .in("dropId", dropIds);

      if (dropStockError) {
        console.error("Supabase dropsstock query error:", dropStockError);
      }

      // Group dropsstock by dropId
      const stockByDrop = new Map<number, any[]>();
      (dropStockData || []).forEach(s => {
        const list = stockByDrop.get(s.dropId) || [];
        list.push(s);
        stockByDrop.set(s.dropId, list);
      });

      // Map drops from database
      const drops: Drop[] = dropsData.map((drop: any) => {
        const images: string[] = [];
        if (drop.images) {
          const imageUrl = getDirectusFileUrl(drop.images);
          if (imageUrl) images.push(imageUrl);
        }

        // Parse release date - handle both ISO strings and postgres timestamps
        let releaseDate = drop.released;
        if (releaseDate && !releaseDate.includes('T')) {
          // If no timezone info, treat as UTC
          releaseDate = releaseDate.replace(' ', 'T') + 'Z';
        }

        // Parse dueto date
        let dueTo = drop.dueto;
        if (dueTo && !dueTo.includes('T')) {
          dueTo = dueTo.replace(' ', 'T') + 'Z';
        }

        // Build stock object from dropstock table
        const dropStockItems = stockByDrop.get(drop.id) || [];
        const stock: Record<string, number> = {};
        dropStockItems.forEach((item: any) => {
          const size = item.sizes?.toUpperCase() || '';
          if (size) {
            stock[size] = item.quantity ?? 0;
          }
        });

        // Extract sizes from stock keys
        let sizes = Object.keys(stock);

        // Sort sizes in standard order
        const sizeOrder: Record<string, number> = {
          'XS': 1,
          'S': 2,
          'M': 3,
          'L': 4,
          'XL': 5,
          'XXL': 6,
          'One Size': 7,
        };

        sizes = sizes.sort((a: string, b: string) => {
          const orderA = sizeOrder[a] ?? 999;
          const orderB = sizeOrder[b] ?? 999;
          return orderA - orderB;
        });

        return {
          id: drop.id.toString(),
          slug: drop.slug || `drop-${drop.id}`,
          name: drop.name || "Unnamed Drop",
          releaseDate: releaseDate || new Date().toISOString(),
          dueTo: dueTo || null,
          description: drop.description || "",
          images,
          priceCHF: drop.price ? Number(drop.price) : undefined,
          sizes: sizes.length > 0 ? sizes : undefined,
          stock: Object.keys(stock).length > 0 ? stock : undefined,
        };
      });

      return drops;
    } catch (error) {
      console.error("Error fetching drops:", error);
      return DROPS;
    }
  }

  return DROPS;
}

export async function getUpcomingDrop(): Promise<Drop | undefined> {
  const drops = await getDrops();
  const now = Date.now();
  const next24Hours = now + (24 * 60 * 60 * 1000);

  // Find drops that are either:
  // 1. Releasing within 24 hours (not yet released)
  // 2. Already released but not yet expired (dueTo still in future)
  const activeDrops = drops.filter((d) => {
    const releaseTime = new Date(d.releaseDate).getTime();
    const dueToTime = d.dueTo ? new Date(d.dueTo).getTime() : null;

    // Drop releasing within next 24 hours
    const isUpcomingSoon = releaseTime > now && releaseTime <= next24Hours;

    // Drop is live (released but not expired)
    const isLive = releaseTime <= now && dueToTime && dueToTime > now;

    return isUpcomingSoon || isLive;
  });

  // Sort: unreleased drops first (by release date), then live drops (by dueTo)
  const nextDrop = activeDrops.sort((a, b) => {
    const aReleaseTime = new Date(a.releaseDate).getTime();
    const bReleaseTime = new Date(b.releaseDate).getTime();

    // Both unreleased: sort by release date (soonest first)
    if (aReleaseTime > now && bReleaseTime > now) {
      return aReleaseTime - bReleaseTime;
    }

    // One released, one not: unreleased comes first
    if (aReleaseTime > now) return -1;
    if (bReleaseTime > now) return 1;

    // Both released: sort by dueTo (soonest expiry first)
    const aDueTo = a.dueTo ? new Date(a.dueTo).getTime() : Infinity;
    const bDueTo = b.dueTo ? new Date(b.dueTo).getTime() : Infinity;
    return aDueTo - bDueTo;
  })[0];

  return nextDrop;
}

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean }> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        console.error("Newsletter subscription error:", error);
        return { ok: false };
      }

      return { ok: true };
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      return { ok: false };
    }
  }

  return { ok: true };
}
