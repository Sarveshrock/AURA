package com.aura.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Hosts the actual automation: a WebView pointed at Blinkit/Zepto/Instamart's
 * real mobile site, logged in as the user (their own cookies, nothing AURA
 * stores), with safety.js + automate.js injected after each page load.
 *
 * Two independent safety nets, on purpose:
 *  1. In-page: every click goes through auraSafeClick() (safety.js), which
 *     refuses anything that looks like payment/checkout.
 *  2. Native: shouldOverrideUrlLoading() below blocks navigation to any URL
 *     whose path/query matches the same forbidden pattern, so even a full
 *     page navigation (not just a click) can't reach a payment page inside
 *     this WebView. When the job is done, the only way forward is the
 *     "Review & pay" button, which leaves this WebView entirely and opens
 *     the platform's real app/site to finish the purchase.
 */
public class CartAssistantActivity extends Activity {

    private static final Pattern FORBIDDEN_URL =
            Pattern.compile("(?i)(pay|checkout|place.?order|confirm.?order|payment|upi)");

    private static final String HOME_URL_BLINKIT = "https://blinkit.com/";
    private static final String HOME_URL_ZEPTO = "https://www.zeptonow.com/";
    private static final String HOME_URL_INSTAMART = "https://www.swiggy.com/instamart";

    private WebView webView;
    private Button reviewAndPayButton;
    private String platform;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        platform = getIntent().getStringExtra("platform");

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        LinearLayout topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setBackgroundColor(Color.parseColor("#0b0f1a"));
        topBar.setPadding(24, 24, 24, 24);

        TextView title = new TextView(this);
        title.setText("AURA Cart Assistant — never pays for you");
        title.setTextColor(Color.WHITE);
        title.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        Button closeButton = new Button(this);
        closeButton.setText("Close");
        closeButton.setOnClickListener(v -> finish());

        topBar.addView(title);
        topBar.addView(closeButton);

        reviewAndPayButton = new Button(this);
        reviewAndPayButton.setText("Review & pay in the real app");
        reviewAndPayButton.setVisibility(View.GONE);
        reviewAndPayButton.setOnClickListener(v -> openRealAppToPay());

        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.addJavascriptInterface(new JsBridge(), "AuraNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (FORBIDDEN_URL.matcher(url).find()) {
                    Toast.makeText(CartAssistantActivity.this,
                            "AURA doesn't complete payment here — use “Review & pay” to finish in the real app.",
                            Toast.LENGTH_LONG).show();
                    return true; // block navigation
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                injectAutomation(view);
            }
        });

        root.addView(topBar);
        root.addView(webView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        root.addView(reviewAndPayButton);
        setContentView(root);

        String startUrl = searchUrl(platform, currentItemNameOrEmpty());
        webView.loadUrl(startUrl);
    }

    private String currentItemNameOrEmpty() {
        JSONObject item = CartJobBridge.getInstance().getCurrentItem();
        return item != null ? item.optString("name", "") : "";
    }

    private void injectAutomation(WebView view) {
        JSONObject item = CartJobBridge.getInstance().getCurrentItem();
        if (item == null) return; // job already finished (e.g. WebView re-navigated on its own)

        int index = CartJobBridge.getInstance().getCursor();
        int total = CartJobBridge.getInstance().getTotal();

        String bootstrap = "window.__AURA_PLATFORM__=" + JSONObject.quote(platform) + ";"
                + "window.__AURA_ITEM__=" + item.toString() + ";"
                + "window.__AURA_INDEX__=" + index + ";"
                + "window.__AURA_TOTAL__=" + total + ";";

        view.evaluateJavascript(bootstrap, null);
        view.evaluateJavascript(readAsset("aura-cart/safety.js"), null);
        view.evaluateJavascript(readAsset("aura-cart/automate.js"), null);
    }

    private String readAsset(String path) {
        StringBuilder sb = new StringBuilder();
        try (InputStream is = getAssets().open(path);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line).append('\n');
        } catch (IOException e) {
            return "";
        }
        return sb.toString();
    }

    private static String searchUrl(String platform, String query) {
        String q = Uri.encode(query);
        if ("blinkit".equals(platform)) return "https://blinkit.com/s/?q=" + q;
        if ("zepto".equals(platform)) return "https://www.zeptonow.com/search?query=" + q;
        if ("instamart".equals(platform)) return "https://www.swiggy.com/instamart/search?custom_back=true&query=" + q;
        return "about:blank";
    }

    private void openRealAppToPay() {
        String home = "blinkit".equals(platform) ? HOME_URL_BLINKIT
                : "zepto".equals(platform) ? HOME_URL_ZEPTO
                : HOME_URL_INSTAMART;
        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(home)));
        finish();
    }

    /** Exposed to injected JS as window.AuraNative.handle(jsonString) -> jsonString (synchronous). */
    private class JsBridge {
        @JavascriptInterface
        public String handle(String json) {
            String response = CartJobBridge.getInstance().handle(json);
            try {
                JSONObject parsed = new JSONObject(response);
                if (parsed.optBoolean("done", false)) {
                    runOnUiThread(() -> reviewAndPayButton.setVisibility(View.VISIBLE));
                }
            } catch (JSONException ignored) {
                // Non-JSON or unrecognized message (e.g. the widget's informational ALL_DONE ping) — ignore.
            }
            return response;
        }
    }
}
