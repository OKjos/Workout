// Capitalizes the first letter of a string
export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Gets the current logged in user ID from session
export async function getUserId() {
    try {
        const res = await fetch('/api/current-user');
        if (res.ok) {
            const user = await res.json();
            return user?._id || null;
        }
        return null;
    } catch (err) {
        console.error("Error fetching user ID", err);
        return null;
    }
}
