const LULU_API_BASE = process.env.LULU_SANDBOX === "true"
  ? "https://api.sandbox.lulu.com"
  : "https://api.lulu.com";

const LULU_AUTH_BASE = process.env.LULU_SANDBOX === "true"
  ? "https://api.sandbox.lulu.com"
  : "https://api.lulu.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getLuluToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${process.env.LULU_API_KEY}:${process.env.LULU_API_SECRET}`
  ).toString("base64");

  const response = await fetch(`${LULU_AUTH_BASE}/auth/realms/glasstree/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Lulu auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

async function luluFetch(path: string, options: RequestInit = {}) {
  const token = await getLuluToken();
  const response = await fetch(`${LULU_API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lulu API error: ${response.status} ${error}`);
  }

  return response.json();
}

interface LuluShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  postcode: string;
}

interface LuluLineItem {
  title: string;
  cover: string; // "hardcover" | "softcover"
  interior: string; // PDF URL
  pod_package_id: string;
  quantity: number;
}

interface LuluOrderResponse {
  id: number;
  status: { name: string };
  line_items: Array<{ tracking_urls: string[] }>;
}

export async function createPrintOrder(params: {
  externalId: string;
  title: string;
  pdfUrl: string;
  coverType: "HARDCOVER" | "SOFTCOVER";
  format: "SQUARE_8X8" | "LANDSCAPE_8X10";
  shippingAddress: LuluShippingAddress;
  email: string;
}): Promise<LuluOrderResponse> {
  // Lulu POD package IDs for different formats
  const podPackageMap: Record<string, Record<string, string>> = {
    SQUARE_8X8: {
      HARDCOVER: "0850X0850FCSTDCW080CW444GXX",
      SOFTCOVER: "0850X0850FCSTDPB080CW444GXX",
    },
    LANDSCAPE_8X10: {
      HARDCOVER: "0800X1000FCSTDCW080CW444GXX",
      SOFTCOVER: "0800X1000FCSTDPB080CW444GXX",
    },
  };

  const podPackageId = podPackageMap[params.format]?.[params.coverType];
  if (!podPackageId) {
    throw new Error(`Invalid format/cover combination: ${params.format}/${params.coverType}`);
  }

  const order = await luluFetch("/v2/print-jobs/", {
    method: "POST",
    body: JSON.stringify({
      external_id: params.externalId,
      contact_email: params.email,
      line_items: [
        {
          title: params.title,
          cover: params.pdfUrl, // Cover PDF URL
          interior: params.pdfUrl, // Interior PDF URL
          pod_package_id: podPackageId,
          quantity: 1,
        },
      ],
      shipping_address: params.shippingAddress,
      shipping_level: "MAIL",
    }),
  });

  return order;
}

export async function getPrintOrderStatus(orderId: string): Promise<LuluOrderResponse> {
  return luluFetch(`/v2/print-jobs/${orderId}/`);
}

export async function calculateShipping(params: {
  podPackageId: string;
  quantity: number;
  countryCode: string;
  postalCode: string;
}): Promise<{ totalCostInclTax: number; currency: string }> {
  const result = await luluFetch("/v2/print-job-cost-calculations/", {
    method: "POST",
    body: JSON.stringify({
      line_items: [
        {
          pod_package_id: params.podPackageId,
          quantity: params.quantity,
          page_count: 32,
        },
      ],
      shipping_address: {
        country_code: params.countryCode,
        postcode: params.postalCode,
      },
      shipping_level: "MAIL",
    }),
  });

  return {
    totalCostInclTax: Math.round(parseFloat(result.total_cost_incl_tax) * 100),
    currency: result.currency,
  };
}
