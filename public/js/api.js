// Functions to make API calls
// Handles GET and POST requests for your app


export async function apiGet(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`GET failed: ${url}`);
    return res.json();
}

export async function apiPost(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return res.json();
}
