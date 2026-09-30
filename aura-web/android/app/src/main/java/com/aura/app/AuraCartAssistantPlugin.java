package com.aura.app;

import android.content.Intent;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * JS-facing side of the in-app Quick Cart automation. The web app calls
 * startQuickCart({platform, items}); this opens CartAssistantActivity,
 * which drives a WebView on the real Blinkit/Zepto/Instamart site and
 * reports progress back here as "quickCartProgress" / "quickCartDone"
 * events (see aura-web/src/native/cartAssistant.ts on the JS side).
 *
 * This plugin never sees the user's login for those sites — the WebView
 * logs in the same way a normal browser tab would, and nothing here reads
 * or stores those credentials.
 */
@CapacitorPlugin(name = "AuraCartAssistant")
public class AuraCartAssistantPlugin extends Plugin implements CartJobBridge.ProgressListener {

    @PluginMethod
    public void startQuickCart(PluginCall call) {
        String platform = call.getString("platform");
        JSArray itemsArray = call.getArray("items");

        if (platform == null || itemsArray == null || itemsArray.length() == 0) {
            call.reject("platform and a non-empty items array are required");
            return;
        }

        // JSArray extends org.json.JSONArray already — no conversion needed.
        CartJobBridge.getInstance().startJob(platform, itemsArray);
        CartJobBridge.getInstance().setListener(this);

        Intent intent = new Intent(getContext(), CartAssistantActivity.class);
        intent.putExtra("platform", platform);
        getActivity().startActivity(intent);

        JSObject result = new JSObject();
        result.put("started", true);
        call.resolve(result);
    }

    @Override
    public void onProgress(int index, int total, boolean ok, String note) {
        JSObject data = new JSObject();
        data.put("index", index);
        data.put("total", total);
        data.put("ok", ok);
        data.put("note", note);
        notifyListeners("quickCartProgress", data);
    }

    @Override
    public void onDone() {
        notifyListeners("quickCartDone", new JSObject());
    }
}
