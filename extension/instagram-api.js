window.FreeIgExportInstagramApi = (() => {
  const queryHashes = {
    followers: "37479f2b8209594dde7facb0d904896a",
    following: "58712303d941c6855d4e888c5f0cd22f"
  };

  function normalizeUsername(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw.includes("://") ? raw : `https://www.instagram.com/${raw}`);
      return url.pathname.split("/").filter(Boolean)[0] || "";
    } catch {
      return raw.replace(/^@/, "").split(/[/?#]/)[0];
    }
  }

  async function getProfile(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) throw localizedError("reason.invalidSource");
    // Direct mode mirrors the observed browser flow: first load the public
    // profile page, then use its numeric ID for GraphQL pagination.
    const response = await fetch(`https://www.instagram.com/${encodeURIComponent(normalized)}/`, { credentials: "include" });
    throwForHttp(response, "profile lookup");
    const id = extractProfileId(await response.text());
    if (!id) throw localizedError("reason.profileIdMissing");
    return { id, username: normalized };
  }

  async function getPage({ profileId, listType, cursor }) {
    const url = new URL("https://www.instagram.com/graphql/query/");
    url.searchParams.set("query_hash", queryHashes[listType]);
    url.searchParams.set("variables", JSON.stringify({ id: Number(profileId), after: cursor ?? "", first: 50 }));
    const response = await fetch(url, { credentials: "include" });
    throwForHttp(response, "list request");
    const body = await response.json();
    const connection = listType === "followers" ? body?.data?.user?.edge_followed_by : body?.data?.user?.edge_follow;
    if (!connection?.edges) throw localizedError("reason.listUnavailable");
    return {
      records: connection.edges.map(({ node }) => ({
        username: node.username || "",
        displayName: node.full_name || "",
        profileUrl: node.username ? `https://www.instagram.com/${node.username}/` : "",
        avatarUrl: node.profile_pic_url || "",
        isVerified: Boolean(node.is_verified)
      })).filter((record) => record.username),
      nextCursor: connection.page_info?.has_next_page ? connection.page_info.end_cursor : null
    };
  }

  function throwForHttp(response, action) {
    if (response.status === 401 || response.status === 403) throw localizedError("reason.sessionRejected");
    if (response.status === 429) throw localizedError("reason.rateLimited");
    if (!response.ok) throw localizedError("reason.requestFailed", { action, status: response.status });
  }

  function localizedError(reasonKey, reasonParams = {}) { const error = new Error(reasonKey); error.reasonKey = reasonKey; error.reasonParams = reasonParams; return error; }

  function extractProfileId(html) {
    const patterns = [
      /instagram:\/\/user\?username=[^&"']+(?:&|&amp;)id=(\d+)/i,
      /profilePage_(\d+)/,
      /"profile_id"\s*:\s*"?(\d+)"?/,
      /"owner"\s*:\s*\{[^}]*"id"\s*:\s*"?(\d+)"?/
    ];
    return patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean) || "";
  }

  return { getProfile, getPage, normalizeUsername };
})();
