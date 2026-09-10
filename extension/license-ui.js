const $ = (selector) => document.querySelector(selector);
let origin = "";
let saved = false;
function busy(value) {
  ["activate", "refresh", "buy"].forEach((id) => { $(`#${id}`).disabled = value; });
  $("#deactivate").disabled = value || !saved;
}
function display(result) {
  saved = result.saved;
  $("#status").textContent = result.valid ? `Pro active · ${result.plan}${result.expiresAt ? ` · expires ${new Date(result.expiresAt).toLocaleDateString()}` : ""}` : result.unavailable ? "Unable to verify. Your saved key is retained; check your connection and try again." : saved ? "License is inactive or expired. Renew your plan or deactivate this browser." : "Free plan · no license activated.";
}
async function refresh() {
  $("#error").textContent = ""; busy(true);
  try { display(await FreeIgExportLicense.call("status")); }
  catch (error) { $("#error").textContent = error.message; }
  finally { busy(false); }
}
$("#licenseForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  busy(true); $("#error").textContent = "";
  try {
    // Request the optional host permission only after an explicit activation action.
    if (!await chrome.permissions.request({ origins: [`${origin}/*`] })) throw new Error("Allow access to the licensing service to activate Pro.");
    const result = await FreeIgExportLicense.call("activate", { key: $("#licenseKey").value });
    $("#licenseKey").value = ""; display(result);
  } catch (error) { $("#error").textContent = error.message; }
  finally { busy(false); }
});
$("#refresh").addEventListener("click", refresh);
$("#deactivate").addEventListener("click", async () => {
  busy(true); $("#error").textContent = "";
  try { display(await FreeIgExportLicense.call("deactivate")); }
  catch (error) { $("#error").textContent = error.message; }
  finally { busy(false); }
});
$("#buy").addEventListener("click", () => chrome.tabs.create({ url: `${origin}/pricing` }));
FreeIgExportLicense.call("config").then(async (config) => { origin = config.origin; await refresh(); }).catch(() => { $("#status").textContent = "Unable to load license settings. Reload the extension."; });
