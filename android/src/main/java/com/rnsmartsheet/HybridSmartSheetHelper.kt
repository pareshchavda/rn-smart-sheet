package com.rnsmartsheet

import android.view.View
import android.util.Log
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.PixelUtil
import com.margelo.nitro.NitroModules
import com.margelo.nitro.com.rnsmartsheet.HybridSmartSheetHelperSpec
import com.google.android.material.bottomsheet.BottomSheetBehavior

class HybridSmartSheetHelper : HybridSmartSheetHelperSpec() {
    
    private fun getReactContext(): ReactContext? {
        val packageContext = SmartSheetPackage.reactContext
        Log.d("SmartSheetHelper", "getReactContext: packageContext is ${if (packageContext != null) "non-null" else "null"}")
        if (packageContext != null) return packageContext
        
        val app = NitroModules.applicationContext as? com.facebook.react.ReactApplication
        val appReactContext = app?.reactNativeHost?.reactInstanceManager?.currentReactContext
        Log.d("SmartSheetHelper", "getReactContext: appReactContext fallback is ${if (appReactContext != null) "non-null" else "null"}")
        return appReactContext
    }

    override fun snapToIndex(viewTag: Double, index: Double) {
        Log.d("SmartSheetHelper", "snapToIndex called: tag=$viewTag, index=$index")
        UiThreadUtil.runOnUiThread {
            val reactContext = getReactContext()
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, viewTag.toInt())
                Log.d("SmartSheetHelper", "snapToIndex: uiManager is ${if (uiManager != null) "non-null" else "null"}")
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                Log.d("SmartSheetHelper", "snapToIndex: view is ${if (view != null) "non-null" else "null"}")
                view?.post {
                    Log.d("SmartSheetHelper", "snapToIndex post: setting state for index ${index.toInt()}")
                    view.behavior.state = view.getNativeStateForIndex(index.toInt())
                    view.requestLayout()
                }
            }
        }
    }

    override fun snapToPosition(viewTag: Double, position: Double) {
        Log.d("SmartSheetHelper", "snapToPosition called: tag=$viewTag, position=$position")
        UiThreadUtil.runOnUiThread {
            val reactContext = getReactContext()
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, viewTag.toInt())
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                Log.d("SmartSheetHelper", "snapToPosition: view is ${if (view != null) "non-null" else "null"}")
                view?.post {
                    val pixelPosition = PixelUtil.toPixelFromDIP(position)
                    view.behavior.expandedOffset = (view.height - pixelPosition).toInt().coerceAtLeast(0)
                    view.behavior.state = BottomSheetBehavior.STATE_EXPANDED
                }
            }
        }
    }

    override fun close(viewTag: Double) {
        Log.d("SmartSheetHelper", "close called: tag=$viewTag")
        UiThreadUtil.runOnUiThread {
            val reactContext = getReactContext()
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, viewTag.toInt())
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                Log.d("SmartSheetHelper", "close: view is ${if (view != null) "non-null" else "null"}")
                view?.post {
                    view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
                    view.requestLayout()
                }
            }
        }
    }

    override fun forceClose(viewTag: Double) {
        Log.d("SmartSheetHelper", "forceClose called: tag=$viewTag")
        UiThreadUtil.runOnUiThread {
            val reactContext = getReactContext()
            if (reactContext != null) {
                val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, viewTag.toInt())
                val view = uiManager?.resolveView(viewTag.toInt()) as? SmartSheetView
                Log.d("SmartSheetHelper", "forceClose: view is ${if (view != null) "non-null" else "null"}")
                view?.post {
                    view.behavior.state = BottomSheetBehavior.STATE_HIDDEN
                    view.requestLayout()
                }
            }
        }
    }
}
