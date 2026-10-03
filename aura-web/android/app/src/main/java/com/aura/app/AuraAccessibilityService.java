package com.aura.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/**
 * App mode of the AURA cart agent: drives the store's installed Android app (Blinkit, Zepto, Swiggy...).
 *
 * The user turns this on once under Settings > Accessibility > AURA. It does nothing until a cart job is
 * started (startJob). Then: open the store app -> wait for the screen to settle -> read the views on screen
 * (text, content descriptions, editable/clickable flags, plus the product-card text around each) -> send
 * them to the AURA backend (POST /shopping/agent/step) -> perform the returned action (tap, type into the
 * search box, scroll, back) -> repeat. A small AURA bar on top of the app shows progress, with Continue
 * (after the user handles login/OTP/address) and Stop.
 *
 * It fills the cart and stops; payment is not automated. The server never picks payment steps, this
 * service refuses to tap anything payment-like, never types into password fields, and stops the job if a
 * payment/UPI app comes to the foreground.
 */
public class AuraAccessibilityService extends AccessibilityService implements CartJobBridge.ProgressListener {

    static volatile AuraAccessibilityService instance;

    private static final Pattern FORBIDDEN = Pattern.compile(
            "(?i)\\b(pay|payment|payments|checkout|check out|place\\s*order|confirm\\s*order|complete\\s*order|"
                    + "buy\\s*now|proceed\\s*to\\s*(pay|buy|checkout)|slide\\s*to\\s*pay|swipe\\s*to\\s*pay|upi|"
                    + "cash\\s*on\\s*delivery|cvv|otp)\\b");
    private static final Set<String> PAYMENT_APPS = new HashSet<>(Arrays.asList(
            "com.phonepe.app", "net.one97.paytm", "com.google.android.apps.nbu.paisa.user", "in.org.npci.upiapp",
            "com.mobikwik_new", "com.freecharge.android", "com.dreamplug.androidapp", "in.amazon.mShop.android.shopping.pay"));
    private static final int MAX_ELEMENTS = 180;
    private static final int MAX_OFF_APP_CHECKS = 6;

    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService network = Executors.newSingleThreadExecutor();
    private final Map<String, AccessibilityNodeInfo> nodes = new HashMap<>();
    private final Runnable stepRunnable = this::step;

    private static final long SETTLE_MS = 1200;
    private static final long MAX_SETTLE_MS = 3000;
    private long stepAt;        // uptime when the pending step runs (0 = none pending)
    private long firstNudgeAt;  // when the current wait started
    private boolean running;
    private boolean paused;
    private boolean inFlight;
    private int offAppChecks;
    private int networkFailures;
    private String screen = "";

    private View overlay;
    private TextView overlayText;
    private Button continueButton;
    private Button stopButton;
    private Button backButton;

    // ------------------------------------------------------------------ lifecycle
    @Override
    protected void onServiceConnected() {
        instance = this;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        stopJob("AURA's accessibility access was turned off.");
        instance = null;
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        instance = null;
        network.shutdownNow();
        super.onDestroy();
    }

    @Override
    public void onInterrupt() {
        // nothing to interrupt: we don't produce feedback
    }

    /** Whether the user has turned AURA on under Settings > Accessibility. */
    static boolean isEnabled(Context context) {
        if (instance != null) return true;
        String enabled = Settings.Secure.getString(context.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        String me = new ComponentName(context, AuraAccessibilityService.class).flattenToString();
        return enabled != null && enabled.toLowerCase().contains(me.toLowerCase());
    }

    // ------------------------------------------------------------------ job control
    /** Starts the active CartJobBridge job (mode "app") in the store's app. Called from the plugin. */
    void startJob() {
        ui.post(() -> {
            CartJobBridge job = CartJobBridge.getInstance();
            job.setListener(this);
            running = true;
            paused = false;
            inFlight = false;
            offAppChecks = 0;
            networkFailures = 0;
            nodes.clear();
            showOverlay(("history".equals(job.phase) ? "Opening your " + job.store + " orders…" : "Opening " + job.store + "…"));
            Intent launch = getPackageManager().getLaunchIntentForPackage(job.appPackage);
            if (launch == null) {
                job.finish(job.store + " app isn't installed.");
                return;
            }
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
            startActivity(launch);
            scheduleStep(3000);
        });
    }

    private void stopJob(String message) {
        if (!running) return;
        CartJobBridge.getInstance().finish(message);
    }

    private void scheduleStep(long delayMs) {
        ui.removeCallbacks(stepRunnable);
        stepAt = 0;
        if (running && !paused) {
            long now = android.os.SystemClock.uptimeMillis();
            stepAt = now + delayMs;
            firstNudgeAt = now;
            ui.postAtTime(stepRunnable, stepAt);
        }
    }

    /**
     * The screen changed: take the next step once it has settled for SETTLE_MS, but never wait more than
     * MAX_SETTLE_MS in total. Screens that animate non-stop (banners, carousels, a blinking cursor) fire
     * change events many times a second; an unbounded "wait until quiet" never ends on them.
     */
    private void nudgeStep() {
        if (!running || paused) return;
        long now = android.os.SystemClock.uptimeMillis();
        if (stepAt == 0) {
            scheduleStep(SETTLE_MS);
            return;
        }
        long target = Math.min(now + SETTLE_MS, firstNudgeAt + MAX_SETTLE_MS);
        if (target > stepAt) {
            ui.removeCallbacks(stepRunnable);
            stepAt = target;
            ui.postAtTime(stepRunnable, stepAt);
        }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!running || event == null || event.getPackageName() == null) return;
        String pkg = event.getPackageName().toString();
        String target = CartJobBridge.getInstance().appPackage;
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            if (PAYMENT_APPS.contains(pkg)) {
                stopJob("A payment app opened, so AURA stopped. Payment is up to you.");
                return;
            }
            if (pkg.equals(target) && event.getClassName() != null) screen = event.getClassName().toString();
        }
        // screen changing in the store app: take the next step once it has settled for a moment
        if (pkg.equals(target) && !inFlight) nudgeStep();
    }

    // ------------------------------------------------------------------ one step: snapshot -> server -> act
    private void step() {
        stepAt = 0;
        if (!running || paused || inFlight) return;
        CartJobBridge job = CartJobBridge.getInstance();
        List<AccessibilityNodeInfo> roots = appRoots(job.appPackage);
        if (roots.isEmpty()) {
            if (++offAppChecks > MAX_OFF_APP_CHECKS) {
                job.needUser("Bring the " + job.store + " app back to the front, then tap Continue.");
            } else {
                scheduleStep(1500);
            }
            return;
        }
        offAppChecks = 0;
        JSONObject snapshot;
        try {
            snapshot = snapshot(roots, job);
        } catch (JSONException e) {
            scheduleStep(1500);
            return;
        }
        inFlight = true;
        network.execute(() -> {
            try {
                JSONObject action = AgentHttp.nextStep(job, job.stepRequest(snapshot));
                networkFailures = 0;
                ui.post(() -> handle(action));
            } catch (Exception e) {
                ui.post(() -> {
                    inFlight = false;
                    if (++networkFailures > 2) {
                        job.needUser("Can't reach AURA (" + e.getMessage() + "). Check the connection, then tap Continue.");
                    } else {
                        scheduleStep(2000);
                    }
                });
            }
        });
    }

    private void handle(JSONObject action) {
        inFlight = false;
        if (!running) return;
        CartJobBridge job = CartJobBridge.getInstance();
        String type = action.optString("action");
        String reason = action.optString("reason", type);
        try {
            job.addOrdersRead(action.optInt("ordersSaved", 0));
            job.addOrdersKnown(action.optInt("ordersKnown", 0));
            switch (type) {
                case "history_done":
                    job.historyDone();
                    setStatus(action.optString("reason", "Read your past orders") + (job.itemCount() > 0 ? " — now adding items…" : ""));
                    scheduleStep(400);
                    return;
                case "set_items": {
                    JSONArray resolvedItems = action.optJSONArray("items");
                    job.setItems(resolvedItems != null ? resolvedItems : new JSONArray());
                    setStatus(action.optString("reason", "Adding items"));
                    scheduleStep(400);
                    return;
                }
                case "item_done":
                    job.markItem(action.optInt("itemIndex", -1), action.optBoolean("itemOk", true), reason);
                    scheduleStep(300);
                    return;
                case "need_user":
                    job.needUser(action.optString("message", "AURA needs you to do something in the app."));
                    return;
                case "done":
                    job.finish(action.optString("message", "Finished."));
                    return;
                default:
                    setStatus(reason);
                    String result = perform(action);
                    JSONObject rec = new JSONObject();
                    rec.put("action", type);
                    // the server verifies additions from this ("add@<product>"), so prefer its targetText
                    rec.put("target", action.optString("targetText", action.optString("elementId", null)));
                    rec.put("result", result);
                    rec.put("url", screen);
                    rec.put("completesItem", action.optBoolean("completesItem"));
                    rec.put("itemIndex", action.optInt("itemIndex", -1));
                    job.record(rec);
                    scheduleStep("wait".equals(type) ? 2000 : 1600);
            }
        } catch (JSONException e) {
            job.finish("Stopped: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ reading the screen
    /**
     * Every window of the store app, top layer first. Size pickers, bottom sheets and dialogs are often separate
     * windows on top of the main screen; reading only the active window misses them (and the agent then keeps
     * tapping an ADD that only re-opens the picker).
     */
    private List<AccessibilityNodeInfo> appRoots(String pkg) {
        List<AccessibilityNodeInfo> roots = new java.util.ArrayList<>();
        List<android.view.accessibility.AccessibilityWindowInfo> windows = new java.util.ArrayList<>(getWindows());
        windows.sort((a, b) -> Integer.compare(b.getLayer(), a.getLayer()));
        for (android.view.accessibility.AccessibilityWindowInfo w : windows) {
            AccessibilityNodeInfo r = w.getRoot();
            if (r != null && r.getPackageName() != null && pkg.equals(r.getPackageName().toString())) roots.add(r);
        }
        if (roots.isEmpty()) {
            AccessibilityNodeInfo active = getRootInActiveWindow();
            if (active != null && active.getPackageName() != null && pkg.equals(active.getPackageName().toString())) {
                roots.add(active);
            }
        }
        return roots;
    }

    private JSONObject snapshot(List<AccessibilityNodeInfo> roots, CartJobBridge job) throws JSONException {
        nodes.clear();
        JSONArray elements = new JSONArray();
        StringBuilder text = new StringBuilder();
        for (int i = 0; i < roots.size(); i++) {
            if (roots.size() > 1) text.append(i == 0 ? "[popup/sheet on top] " : " [screen behind] ");
            collect(roots.get(i), elements, text, 0);
        }
        JSONObject snap = new JSONObject();
        snap.put("url", screen);
        snap.put("title", job.store + " app");
        snap.put("elements", elements);
        snap.put("pageText", text.length() > 3000 ? text.substring(0, 3000) : text.toString());
        return snap;
    }

    private void collect(AccessibilityNodeInfo n, JSONArray out, StringBuilder pageText, int depth) throws JSONException {
        if (n == null || depth > 45 || !n.isVisibleToUser()) return;
        String own = label(n);
        if (!own.isEmpty() && pageText.length() < 3000) pageText.append(own).append(" · ");
        boolean actionable = n.isClickable() || n.isEditable() || n.isCheckable() || n.isScrollable()
                || n.isLongClickable();
        if (actionable && out.length() < MAX_ELEMENTS) {
            String shown = own.isEmpty() ? clip(descendantText(n, 0), 100) : clip(own, 100);
            // icon-only buttons (profile, cart, search, back) often have no text or description: describe them
            // by view id and where they sit, so the agent can still find "the person icon at the top right"
            String iconHint = null;
            if (shown.isEmpty() && !n.isEditable() && !n.isScrollable()) {
                Rect r = new Rect();
                n.getBoundsInScreen(r);
                int w = getResources().getDisplayMetrics().widthPixels;
                int h = getResources().getDisplayMetrics().heightPixels;
                boolean small = r.width() < w * 0.35 && r.height() < h * 0.12;
                if (small && !r.isEmpty()) {
                    String v = r.centerY() < h * 0.2 ? "top" : r.centerY() > h * 0.8 ? "bottom" : "middle";
                    String hz = r.centerX() < w * 0.33 ? "left" : r.centerX() > w * 0.67 ? "right" : "centre";
                    String vid = n.getViewIdResourceName() != null ? n.getViewIdResourceName().replaceAll(".*:id/", "") : "";
                    iconHint = "unlabeled icon at " + v + "-" + hz + (vid.isEmpty() ? "" : " (id " + vid + ")");
                }
            }
            if (!shown.isEmpty() || n.isEditable() || n.isScrollable() || iconHint != null) {
                String id = "n" + out.length();
                nodes.put(id, n);
                JSONObject el = new JSONObject();
                el.put("id", id);
                el.put("tag", simpleClass(n));
                el.put("text", shown);
                CharSequence hint = Build.VERSION.SDK_INT >= 26 ? n.getHintText() : null;
                if (iconHint != null) {
                    el.put("label", iconHint);
                } else if (n.getContentDescription() != null && !TextUtils.equals(n.getContentDescription(), n.getText())) {
                    el.put("label", clip(n.getContentDescription().toString(), 80));
                } else if (hint != null) {
                    el.put("label", clip(hint.toString(), 80));
                }
                if (n.getViewIdResourceName() != null) el.put("role", n.getViewIdResourceName().replaceAll(".*:id/", ""));
                el.put("editable", n.isEditable());
                el.put("scrollable", n.isScrollable());
                el.put("disabled", !n.isEnabled());
                if (n.isPassword()) el.put("type", "password");
                if (!n.isEditable()) {
                    String ctx = context(n, shown);
                    if (ctx != null) el.put("context", ctx);
                }
                out.put(el);
            }
        }
        for (int i = 0; i < n.getChildCount(); i++) collect(n.getChild(i), out, pageText, depth + 1);
    }

    private static String label(AccessibilityNodeInfo n) {
        CharSequence t = n.getText();
        if (t != null && t.toString().trim().length() > 0) return t.toString().trim();
        CharSequence d = n.getContentDescription();
        return d != null ? d.toString().trim() : "";
    }

    private static String descendantText(AccessibilityNodeInfo n, int depth) {
        if (n == null || depth > 8) return "";
        StringBuilder sb = new StringBuilder(label(n));
        for (int i = 0; i < n.getChildCount() && sb.length() < 300; i++) {
            String c = descendantText(n.getChild(i), depth + 1);
            if (!c.isEmpty()) sb.append(sb.length() > 0 ? " " : "").append(c);
        }
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    /** Text of the nearest ancestor that says more than the control itself: the product card around "ADD". */
    private static String context(AccessibilityNodeInfo n, String shown) {
        AccessibilityNodeInfo p = n.getParent();
        for (int d = 0; d < 6 && p != null; d++, p = p.getParent()) {
            String t = descendantText(p, 0);
            if (t.length() > shown.length() + 15) return clip(t, 240);
        }
        return null;
    }

    private static String simpleClass(AccessibilityNodeInfo n) {
        CharSequence c = n.getClassName();
        if (c == null) return "View";
        String s = c.toString();
        return s.substring(s.lastIndexOf('.') + 1);
    }

    private static String clip(String s, int n) {
        s = s.replaceAll("\\s+", " ").trim();
        return s.length() > n ? s.substring(0, n) : s;
    }

    // ------------------------------------------------------------------ acting on the screen
    private String perform(JSONObject a) {
        String type = a.optString("action");
        AccessibilityNodeInfo node = nodes.get(a.optString("elementId", ""));
        switch (type) {
            case "click": {
                if (node == null) return "element gone";
                if (looksForbidden(node)) return "refused (payment/checkout-like)";
                int times = Math.max(1, Math.min(a.optInt("repeat", 1), 20));
                if (!click(node)) return "click failed";
                for (int i = 1; i < times; i++) {
                    final int n = i;
                    ui.postDelayed(() -> click(node), 450L * n);
                }
                return times > 1 ? "clicked " + times + "x" : "clicked";
            }
            case "type": {
                if (node == null) return "element gone";
                if (node.isPassword()) return "refused (password field)";
                node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
                if (!node.isFocused()) node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                Bundle args = new Bundle();
                args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, a.optString("text", ""));
                boolean ok = node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
                if (ok && a.optBoolean("submit") && Build.VERSION.SDK_INT >= 30) {
                    node.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_IME_ENTER.getId());
                    return "typed + enter";
                }
                return ok ? "typed" : "type failed";
            }
            case "scroll": {
                AccessibilityNodeInfo target = node != null && node.isScrollable() ? node : firstScrollable(appRoots(CartJobBridge.getInstance().appPackage).isEmpty() ? null : appRoots(CartJobBridge.getInstance().appPackage).get(0));
                if (target != null && target.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)) return "scrolled";
                swipeUp();
                return "swiped";
            }
            case "back":
                performGlobalAction(GLOBAL_ACTION_BACK);
                return "back";
            default:
                return "waited";
        }
    }

    private static boolean looksForbidden(AccessibilityNodeInfo n) {
        String own = label(n) + " " + (n.getViewIdResourceName() != null ? n.getViewIdResourceName() : "");
        String inside = n.getChildCount() > 0 ? descendantText(n, 0) : "";
        return FORBIDDEN.matcher(own).find() || (inside.length() < 60 && FORBIDDEN.matcher(inside).find());
    }

    /** performAction on the node or its nearest clickable ancestor; falls back to a tap at its centre. */
    private boolean click(AccessibilityNodeInfo node) {
        AccessibilityNodeInfo n = node;
        for (int d = 0; d < 5 && n != null; d++, n = n.getParent()) {
            if (n.isClickable()) {
                if (looksForbidden(n)) return false;
                if (n.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
            }
        }
        Rect r = new Rect();
        node.getBoundsInScreen(r);
        if (r.isEmpty() || Build.VERSION.SDK_INT < 24) return false;
        Path p = new Path();
        p.moveTo(r.exactCenterX(), r.exactCenterY());
        return dispatchGesture(new GestureDescription.Builder()
                .addStroke(new GestureDescription.StrokeDescription(p, 0, 60)).build(), null, null);
    }

    private static AccessibilityNodeInfo firstScrollable(AccessibilityNodeInfo n) {
        if (n == null) return null;
        if (n.isScrollable() && n.isVisibleToUser()) return n;
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo f = firstScrollable(n.getChild(i));
            if (f != null) return f;
        }
        return null;
    }

    private void swipeUp() {
        if (Build.VERSION.SDK_INT < 24) return;
        int h = getResources().getDisplayMetrics().heightPixels;
        int w = getResources().getDisplayMetrics().widthPixels;
        Path p = new Path();
        p.moveTo(w / 2f, h * 0.75f);
        p.lineTo(w / 2f, h * 0.3f);
        dispatchGesture(new GestureDescription.Builder()
                .addStroke(new GestureDescription.StrokeDescription(p, 0, 350)).build(), null, null);
    }

    // ------------------------------------------------------------------ progress (CartJobBridge listener)
    @Override
    public void onProgress(int index, int total, boolean ok, String note) {
        ui.post(() -> setStatus((ok ? "Added " : "Couldn't add ") + note));
    }

    @Override
    public void onNeedUser(String message) {
        ui.post(() -> {
            paused = true;
            ui.removeCallbacks(stepRunnable);
            setStatus(message);
            if (continueButton != null) continueButton.setVisibility(View.VISIBLE);
        });
    }

    @Override
    public void onDone(int added, int total, String message) {
        ui.post(() -> {
            running = false;
            paused = false;
            ui.removeCallbacks(stepRunnable);
            nodes.clear();
            setStatus("Cart ready: " + added + "/" + total + " added. " + message + " Payment is up to you.");
            if (continueButton != null) continueButton.setVisibility(View.GONE);
            if (stopButton != null) stopButton.setText("Close");
            if (backButton != null) backButton.setVisibility(View.VISIBLE);
        });
    }

    // ------------------------------------------------------------------ the AURA bar on top of the store app
    private void showOverlay(String message) {
        if (overlay == null) {
            LinearLayout bar = new LinearLayout(this);
            bar.setOrientation(LinearLayout.HORIZONTAL);
            bar.setGravity(Gravity.CENTER_VERTICAL);
            bar.setBackgroundColor(Color.parseColor("#E60B0F1A"));
            bar.setPadding(24, 12, 12, 12);
            overlayText = new TextView(this);
            overlayText.setTextColor(Color.WHITE);
            overlayText.setTextSize(12);
            overlayText.setMaxLines(3);
            bar.addView(overlayText, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            continueButton = smallButton("Continue", v -> {
                continueButton.setVisibility(View.GONE);
                paused = false;
                offAppChecks = 0;
                networkFailures = 0;
                setStatus("Continuing…");
                scheduleStep(500);
            });
            continueButton.setVisibility(View.GONE);
            backButton = smallButton("AURA", v -> {
                Intent i = new Intent(this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                startActivity(i);
                hideOverlay();
            });
            backButton.setVisibility(View.GONE);
            stopButton = smallButton("Stop", v -> {
                if (running) stopJob("Stopped by you.");
                hideOverlay();
            });
            bar.addView(continueButton);
            bar.addView(backButton);
            bar.addView(stopButton);
            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.BOTTOM;
            lp.y = 220; // above the store's own bottom bar / "View cart" strip
            ((WindowManager) getSystemService(WINDOW_SERVICE)).addView(bar, lp);
            overlay = bar;
        }
        if (stopButton != null) stopButton.setText("Stop");
        if (backButton != null) backButton.setVisibility(View.GONE);
        setStatus(message);
    }

    private Button smallButton(String text, View.OnClickListener onClick) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(12);
        b.setAllCaps(false);
        b.setOnClickListener(onClick);
        return b;
    }

    private void setStatus(String message) {
        if (overlayText != null) overlayText.setText("AURA · " + message);
    }

    private void hideOverlay() {
        if (overlay != null) {
            ((WindowManager) getSystemService(WINDOW_SERVICE)).removeView(overlay);
            overlay = null;
            overlayText = null;
            continueButton = stopButton = backButton = null;
        }
    }

    /** Installed app for a store: the known package if installed, else a launcher app whose name matches. */
    static String findStoreApp(Context context, String knownPackage, String appLabel, String store) {
        android.content.pm.PackageManager pm = context.getPackageManager();
        if (knownPackage != null && !knownPackage.isEmpty() && pm.getLaunchIntentForPackage(knownPackage) != null) {
            return knownPackage;
        }
        Intent main = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
        List<android.content.pm.ResolveInfo> apps = pm.queryIntentActivities(main, 0);
        String[] wanted = {appLabel, store};
        for (String w : wanted) {
            if (w == null || w.trim().isEmpty()) continue;
            String want = w.trim().toLowerCase();
            for (android.content.pm.ResolveInfo ri : apps) {
                String label = String.valueOf(ri.loadLabel(pm)).trim().toLowerCase();
                if (!ri.activityInfo.packageName.equals(context.getPackageName())
                        && (label.equals(want) || label.startsWith(want + " ") || want.startsWith(label + " "))) {
                    return ri.activityInfo.packageName;
                }
            }
        }
        return null;
    }
}
