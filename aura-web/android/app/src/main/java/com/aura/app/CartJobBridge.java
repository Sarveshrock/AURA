package com.aura.app;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Holds the one active Quick Cart job (platform + item list + cursor) and
 * implements the same request/response protocol as the browser extension's
 * background.js, but as synchronous calls from the WebView's JS bridge
 * instead of async chrome.runtime messages — everything here is
 * same-process, so there's no need for the extension's READY handshake.
 */
final class CartJobBridge {

    interface ProgressListener {
        void onProgress(int index, int total, boolean ok, String note);
        void onDone();
    }

    private static final CartJobBridge INSTANCE = new CartJobBridge();

    static CartJobBridge getInstance() {
        return INSTANCE;
    }

    private String platform;
    private JSONArray items;
    private int cursor;
    private ProgressListener listener;

    private CartJobBridge() {}

    synchronized void startJob(String platform, JSONArray items) {
        this.platform = platform;
        this.items = items;
        this.cursor = 0;
    }

    synchronized void setListener(ProgressListener listener) {
        this.listener = listener;
    }

    synchronized String getPlatform() {
        return platform;
    }

    synchronized JSONObject getCurrentItem() {
        try {
            return items != null && cursor < items.length() ? items.getJSONObject(cursor) : null;
        } catch (JSONException e) {
            return null;
        }
    }

    synchronized int getCursor() {
        return cursor;
    }

    synchronized int getTotal() {
        return items != null ? items.length() : 0;
    }

    /** Called from the WebView JS bridge (see AuraCartAssistantPlugin$JsBridge). */
    synchronized String handle(String json) {
        try {
            JSONObject msg = new JSONObject(json);
            if (!"ITEM_DONE".equals(msg.optString("type"))) {
                return "{}";
            }
            boolean ok = msg.optBoolean("ok", false);
            String note = msg.optString("note", "");
            if (listener != null) listener.onProgress(cursor, items.length(), ok, note);

            cursor++;
            JSONObject resp = new JSONObject();
            if (items == null || cursor >= items.length()) {
                resp.put("done", true);
                if (listener != null) listener.onDone();
                return resp.toString();
            }
            resp.put("done", false);
            resp.put("item", items.getJSONObject(cursor));
            resp.put("index", cursor);
            resp.put("total", items.length());
            return resp.toString();
        } catch (JSONException e) {
            return "{}";
        }
    }
}
