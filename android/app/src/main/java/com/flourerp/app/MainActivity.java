package com.flourerp.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        } catch (Exception ignored) {}
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.clearCache(true);
                WebSettings settings = webView.getSettings();
                settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.clearCache(true);
            }
        } catch (Exception ignored) {}
    }
}
